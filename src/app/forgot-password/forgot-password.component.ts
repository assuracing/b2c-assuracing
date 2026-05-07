import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss', '../app.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private translate: TranslateService) {}

  onSubmit(): void {
    if (this.email) {
      this.authService.resetPasswordInit(this.email).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('messages.resetPasswordEmailSent', { email: this.email }), this.translate.instant('messages.close'), {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        },
        error: (err) => {
          this.snackBar.open(this.translate.instant('messages.resetPasswordError', { error: err }), this.translate.instant('messages.close'), {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      });
    }
  }
}