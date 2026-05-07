import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss', '../app.component.scss']
})
export class ResetPasswordComponent {
  password: string = '';
  confirmPassword: string = '';
  email: string = '';
  resetKey: string | null = null;

  constructor(private userService: UserService, private route: ActivatedRoute, private toastService: ToastService, private router: Router, private translate: TranslateService) {}

  ngOnInit(): void {
    this.resetKey = this.route.snapshot.queryParamMap.get('key');
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.toastService.error(this.translate.instant('messages.passwordsNotMatching'));  
      return;
    }
    this.userService.resetPassword(this.resetKey!, this.password).subscribe(() => {
      this.toastService.success(this.translate.instant('messages.passwordResetSuccess'));
      this.router.navigate(['/login']);
    });
  }
}
