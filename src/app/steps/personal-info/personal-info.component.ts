import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-personal-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss', '../../app.component.scss'],
})
export class PersonalInfoComponent {
  @Input() form!: FormGroup;

  constructor(private fb: FormBuilder) {
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
