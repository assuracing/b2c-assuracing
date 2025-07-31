import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

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

  constructor(private userService: UserService, private route: ActivatedRoute, private toastService: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.resetKey = this.route.snapshot.queryParamMap.get('key');
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.toastService.error('Les mots de passe ne correspondent pas');  
      return;
    }
    this.userService.resetPassword(this.resetKey!, this.password).subscribe(() => {
      this.toastService.success('Mot de passe réinitialisé avec succès');
      this.router.navigate(['/login']);
    });
  }
}
