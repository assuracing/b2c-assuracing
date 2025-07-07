import { Component, Optional } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, HttpClientModule, MatSnackBarModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    @Optional() private dialogRef?: MatDialogRef<LoginComponent>
  ) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        if (this.dialogRef) {
          this.dialogRef.close('success');
        } else {
          this.router.navigate(['/']);
          this.snackBar.open('Connexion réussie', 'Fermer', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      },
      error: (err) => {
        if(err.status === 401) {
          this.snackBar.open('Nom d\'utilisateur ou mot de passe incorrect', 'Fermer', {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
        }
      },
    });
  }
}