import { Component, Optional, Inject, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../core/services/environment.service';
import { ConsentDialogComponent } from '../shared/components/consent-dialog/consent-dialog.component';
import { ConsentService } from '../services/consent.service';
import { UserService } from '../services/user.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, MatIconModule, CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../app.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  username = '';
  password = '';
  rememberMe = true;
  isBlocked = false;
  blockTimeRemaining = 0;
  blockTimer: any;
  statusCheckTimer: any;
  attemptsRemaining = 5;
  private apiUrl: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private translate: TranslateService,
    private http: HttpClient,
    private envService: EnvironmentService,
    private dialog: MatDialog,
    private userService: UserService,
    private consentService: ConsentService,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { email?: string }
  ) {
    this.apiUrl = this.envService.apiUrl;
    if (data?.email) {
      this.username = data.email;
    }
  }

  ngOnInit() {
    this.checkBlockStatus();
    this.statusCheckTimer = setInterval(() => {
      this.checkBlockStatus();
    }, 5000);
  }

  private checkBlockStatus() {
    if (!this.username) {
      return;
    }

    this.http.get(`${this.apiUrl}/api/authenticate/block-status?username=${this.username}`).subscribe({
      next: (response: any) => {
        this.isBlocked = response.blocked;
        this.blockTimeRemaining = response.remainingSeconds;
        this.attemptsRemaining = response.attemptsRemaining;

        if (this.isBlocked && this.blockTimeRemaining > 0) {
          this.startBlockTimer();
        } else if (!this.isBlocked) {
          this.stopBlockTimer();
        }
      },
      error: () => {
      }
    });
  }

  private startBlockTimer() {
    if (this.blockTimer) {
      return;
    }

    this.blockTimer = setInterval(() => {
      this.blockTimeRemaining--;
      if (this.blockTimeRemaining <= 0) {
        this.stopBlockTimer();
        this.checkBlockStatus();
      }
    }, 1000);
  }

  private stopBlockTimer() {
    if (this.blockTimer) {
      clearInterval(this.blockTimer);
      this.blockTimer = null;
    }
  }

  onLogin() {
    if (this.isBlocked) {
      return;
    }

    this.authService.login(this.username, this.password, this.rememberMe).subscribe({
      next: () => {
        this.stopBlockTimer();
        this.checkBlockStatus();
        this.showConsentDialogIfNeeded();
      },
      error: (err) => {
        if (err.status === 400) {
          const errorKey = err.error?.errorKey;
          const errorMessage = err.error?.title || err.error?.detail || err.error?.message;

          if (errorKey === 'blocked') {
            this.checkBlockStatus();
            this.toastService.error(this.translate.instant('error.blocked'));
          } else if (errorKey === 'loginError') {
            this.attemptsRemaining = this.extractAttemptsRemaining(errorMessage);
            this.toastService.error(this.translate.instant('error.loginError', { remaining: this.attemptsRemaining }));
          } else {
            this.toastService.error(this.translate.instant('error.loginError'));
          }
        } else if (err.status === 401) {
          this.toastService.error(this.translate.instant('error.loginError'));
        }
      },
    });
  }

  private extractAttemptsRemaining(message: string): number {
    const match = message.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 5;
  }

  ngOnDestroy() {
    this.stopBlockTimer();
    if (this.statusCheckTimer) {
      clearInterval(this.statusCheckTimer);
    }
  }

  get formattedBlockTime(): string {
    const minutes = Math.floor(this.blockTimeRemaining / 60);
    const seconds = this.blockTimeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get loginButtonText(): string {
    if (this.isBlocked) {
      return this.translate.instant('auth.loginBlocked') + ' (' + this.formattedBlockTime + ')';
    }
    return this.translate.instant('auth.login');
  }

  private showConsentDialogIfNeeded(): void {
    this.userService.getAccount().pipe(
      switchMap(() => this.userService.getAdherentId()),
      switchMap((adherentId: number) => {
        return this.consentService.getConsentHistory(adherentId).pipe(
          switchMap((consentHistory) => {
            if (consentHistory) {
              return of({ showDialog: false });
            }

            this.finishLogin();
            setTimeout(() => this.openConsentDialog(adherentId), 800);

            return of({ showDialog: true });
          })
        );
      })
    ).subscribe({
      next: (result: { showDialog: boolean }) => {
        if (!result.showDialog) {
          this.finishLogin();
        }
      },
      error: (error: unknown) => {
        this.finishLogin();
      }
    });
  }

  private openConsentDialog(adherentId: number): void {
    const dialogRef = this.dialog.open(ConsentDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      panelClass: 'consent-dialog',
      data: { adherentId }
    });

    dialogRef.afterClosed().subscribe((saved: boolean) => {
    });
  }

  private finishLogin(): void {
    if (this.dialogRef) {
      this.dialogRef.close('success');
      return;
    }

    this.router.navigate(['/']);
    this.toastService.success(this.translate.instant('messages.loginSuccess'));
  }
}