import { Component, Optional } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password, this.rememberMe).subscribe({
      next: () => {
        if (this.dialogRef) {
          this.dialogRef.close('success');
        } else {
          this.router.navigate(['/']);
          this.toastService.success(this.translate.instant('messages.loginSuccess'));
        }
      },
      error: (err) => {
        if(err.status === 401) {
          this.toastService.error(this.translate.instant('messages.loginError'));
        }
      },
    });
  }
}