import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss', '../app.component.scss']
})
export class ResetPasswordComponent {
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  resetKey: string | null = null;

  constructor(private userService: UserService, private route: ActivatedRoute, private matSnackBar: MatSnackBar, private router: Router) {}

  ngOnInit(): void {
    this.resetKey = this.route.snapshot.queryParamMap.get('key');
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.matSnackBar.open('Les mots de passe ne correspondent pas', 'Fermer', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }
    this.userService.resetPassword(this.resetKey!, this.password).subscribe(() => {
      this.matSnackBar.open('Mot de passe réinitialisé avec succès', 'Fermer', {
        duration: 5000,
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      this.router.navigate(['/login']);
    });
  }
}
