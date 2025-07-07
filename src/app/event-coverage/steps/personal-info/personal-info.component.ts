import { Component, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { EmailExistsDialogComponent } from './email-exists-dialog.component';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-personal-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss', '../../../app.component.scss'],
})
export class PersonalInfoComponent {
  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  private checkEmailSub?: Subscription;

  onEmailBlur() {
    const email = this.emailControl?.value;
    if (!email || typeof email !== 'string' || !email.includes('@')) return;
    const login = email.split('@')[0];
    if (this.checkEmailSub) this.checkEmailSub.unsubscribe();
    this.checkEmailSub = this.userService.checkEmail(email, login).subscribe((exists) => {
      if (exists) {
        this.userService.getAccount().subscribe({
          next: user => {
            if (user?.email && user.email.toLowerCase() === email.toLowerCase()) {
              return;
            }
            const dialogRef = this.dialog.open(EmailExistsDialogComponent, {
            disableClose: true
          });
            dialogRef.afterClosed().subscribe((result) => {
              console.log("result", result);
              if (result === 'wrongEmail' || result === 'cancel' || result === undefined) {
                this.emailControl?.setValue('');
              } else if (result && typeof result === 'object' && result.email) {
                this.emailControl?.setValue(result.email);
              }
            });
          },
          error: () => {
            const dialogRef = this.dialog.open(EmailExistsDialogComponent, {
            disableClose: true
          });
            dialogRef.afterClosed().subscribe((result) => {
              if (result === 'wrongEmail' || result === 'cancel' || result === undefined) {
                this.emailControl?.setValue('');
              } else if (result && typeof result === 'object' && result.email) {
                this.emailControl?.setValue(result.email);
              }
            });
          }
        });
      }
    });
  }

  get emailControl() { return this.form.get('email'); }

  get phoneControl() { return this.form.get('phone'); }
  get postalCodeControl() { return this.form.get('postalCode'); }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Format email invalide';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'phone') {
        return 'Le numéro de téléphone doit contenir 10 chiffres';
      }
      if (controlName === 'postalCode') {
        return 'Le code postal doit contenir 5 chiffres';
      }
    }
    if (control?.hasError('minlength')) {
      return 'Ce champ doit contenir au moins 2 caractères';
    }
    return '';
  }
}
