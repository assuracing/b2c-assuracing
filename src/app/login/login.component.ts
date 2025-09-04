import { Component, Optional } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss', '../app.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        if (this.dialogRef) {
          this.dialogRef.close('success');
        } else {
          this.router.navigate(['/']);
          this.toastService.success('Connexion réussie');
        }
      },
      error: (err) => {
        if(err.status === 401) {
          this.toastService.error('Nom d\'utilisateur ou mot de passe incorrect');
        }
      },
    });
  }
}