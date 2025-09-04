import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss', '../app.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService, private snackBar: MatSnackBar) {}

  onSubmit(): void {
    if (this.email) {
      this.authService.resetPasswordInit(this.email).subscribe({
        next: () => {
          this.snackBar.open('Un email de réinitialisation de mot de passe a été envoyé à: ' + this.email, 'Fermer', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        },
        error: (err) => {
          this.snackBar.open('Une erreur est survenue lors de la réinitialisation du mot de passe: ' + err, 'Fermer', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      });
    }
  }
}