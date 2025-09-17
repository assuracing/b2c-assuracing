import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../../login/login.component';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { EnvironmentService } from '../../../core/services/environment.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-email-exists-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Email déjà utilisé</h2>
    <mat-dialog-content>
      <p>Un compte existe déjà avec cette adresse email, vous allez être redirigé vers la page de connexion afin de vous authentifier avant de rentrer dans le tunnel d'achat</p>
      <p style="color: orange; display: flex; align-items: center; gap: 8px;"> <mat-icon color="warn"> warning </mat-icon> Un identifiant unique par pilote ! </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="wrongEmail()">Je me suis trompé d'email</button>
      <button mat-raised-button color="primary" (click)="showLogin()">OK</button>
    </mat-dialog-actions>
  `
})
export class EmailExistsDialogComponent {
  @Output() wrongEmailEvent = new EventEmitter<void>();
  @Output() loginSuccessEvent = new EventEmitter<string>();

  private apiUrl: string;

  constructor(
    private dialogRef: MatDialogRef<EmailExistsDialogComponent>,
    private dialog: MatDialog,
    private http: HttpClient,
    private userService: UserService,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }

  wrongEmail() {
    this.wrongEmailEvent.emit();
    this.dialogRef.close('wrongEmail');
  }

  showLogin() {
    setTimeout(() => {
      const dialogRef = this.dialog.open(LoginComponent, {
        width: '600px',
        maxWidth: '90vw',
        panelClass: 'login-dialog',
      });
      
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'success') {
          this.userService.getAccount().pipe(
            switchMap(() => this.userService.getAdherentId()),
            switchMap(() => this.userService.getAdherentInfo())
          ).subscribe({
            next: (adherent) => {
              this.dialogRef.close({ 
                success: true,
                adherent: adherent
              });
            },
            error: (error) => {
              console.error('Erreur lors du chargement des informations du compte:', error);
              this.dialogRef.close({ success: false });
            }
          });
        }
      });
    }, 0);
  }
}
