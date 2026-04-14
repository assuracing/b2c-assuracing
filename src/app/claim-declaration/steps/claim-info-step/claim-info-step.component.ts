import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TypeCauseSinistre } from '../../../models/claim.model';

@Component({
  selector: 'app-claim-info-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './claim-info-step.component.html',
  styleUrls: ['./claim-info-step.component.scss']
})
export class ClaimInfoStepComponent implements OnInit {
  @Input() selectedCause?: TypeCauseSinistre;
  @Input() claimType?: string;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Output() claimInfoSubmitted = new EventEmitter<any>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      dateEvenement: ['', Validators.required],
      description: ['']
    });
  }

  submit(): void {
    if (this.form.valid) {
      this.claimInfoSubmitted.emit(this.form.value);
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors) return '';
    
    if (control.errors['required']) return 'Champ requis';
    return '';
  }
}
