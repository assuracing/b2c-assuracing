import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-claim-banking-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './claim-banking-step.component.html',
  styleUrls: ['./claim-banking-step.component.scss']
})
export class ClaimBankingStepComponent {
  @Output() bankingSubmitted = new EventEmitter<{ iban: string; bic: string }>();

  bankingForm: FormGroup;
  ibanHint = 'Format: FR + 23 chiffres/lettres';
  @Output() bankingDataChange = new EventEmitter<{ iban: string; bic: string }>();

  constructor(private fb: FormBuilder) {
    this.bankingForm = this.fb.group({
      iban: ['', [
        Validators.required,
        this.ibanValidator.bind(this)
      ]],
      bic: ['', Validators.required]
    });
  }

  ibanValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const ibanRegex = /^([A-Z]{2}[0-9]{2}[A-Z0-9]{1,30})$/;
    return ibanRegex.test(value) ? null : { invalidIban: true };
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bankingForm.get(fieldName);
    if (control?.hasError('required')) {
      return fieldName === 'iban' ? 'IBAN requis' : 'Code BIC requis';
    }
    if (control?.hasError('invalidIban')) {
      return 'Format IBAN invalide (ex: FR1420041010050500013M02)';
    }
    return '';
  }

  submit() {
    if (this.bankingForm.valid) {
      const bankingData = {
        iban: this.bankingForm.get('iban')?.value?.toUpperCase(),
        bic: this.bankingForm.get('bic')?.value?.toUpperCase()
      };
      this.bankingSubmitted.emit(bankingData);
    }
  }
}
