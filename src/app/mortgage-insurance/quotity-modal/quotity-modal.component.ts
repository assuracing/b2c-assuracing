import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-quotity-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    TranslateModule
  ],
  templateUrl: './quotity-modal.component.html',
  styleUrls: ['./quotity-modal.component.scss']
})
export class QuotityModalComponent {
  quotityForm!: FormGroup;
  currentQuotity: number = 100;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<QuotityModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentQuotity: number },
    private translate: TranslateService
  ) {
    this.currentQuotity = data.currentQuotity || 100;
    this.initializeForm();
  }

  private initializeForm(): void {
    this.quotityForm = this.fb.group({
      coveragePercentage: [this.currentQuotity, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  onInputChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (value >= 1 && value <= 100) {
      this.quotityForm.get('coveragePercentage')?.setValue(value);
    }
  }

  onSubmit(): void {
    if (this.quotityForm.invalid) {
      this.quotityForm.markAllAsTouched();
      return;
    }

    const newQuotity = this.quotityForm.get('coveragePercentage')?.value;
    this.dialogRef.close({ newQuotity });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}