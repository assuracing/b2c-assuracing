import { Component, Optional, Inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private userService: UserService,
    private consentService: ConsentService,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { email?: string }
  ) {
    if (data?.email) {
      this.username = data.email;
    }
  }

  onLogin() {
    this.authService.login(this.username, this.password, this.rememberMe).subscribe({
      next: () => {
        this.showConsentDialogIfNeeded();
      },
      error: (err) => {
        if(err.status === 401) {
          this.toastService.error(this.translate.instant('messages.loginError'));
        }
      },
    });
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