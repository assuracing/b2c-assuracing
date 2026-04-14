import { Component, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { TypeCauseSinistre } from '../../../models/claim.model';

@Component({
  selector: 'app-claim-reason-step',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatRadioModule
  ],
  templateUrl: './claim-reason-step.component.html',
  styleUrls: ['./claim-reason-step.component.scss']
})
export class ClaimReasonStepComponent implements OnChanges {
  @Input() claimType: string = 'ANNULATION';
  @Input() availableCauses: TypeCauseSinistre[] = [];
  @Output() reasonSelected = new EventEmitter<TypeCauseSinistre>();

  selectedCause: TypeCauseSinistre | null = null;
  selectedCauseId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['availableCauses']) {
      this.selectedCause = null;
      this.selectedCauseId = null;
    }
  }

  selectCause(cause: TypeCauseSinistre): void {
    this.selectedCause = cause;
    this.selectedCauseId = cause.id;
    this.reasonSelected.emit(cause);
  }

  trackByCauseId(index: number, cause: TypeCauseSinistre): number {
    return cause.id;
  }

  getClaimTypeLabel(): string {
    const labels: { [key: string]: string } = {
      'ANNULATION': 'Annulation',
      'INTERRUPTION': 'Interruption',
      'INTEMPERIES': 'Intempéries',
      'RC': 'Responsabilité Civile',
      'PJ': 'Protection Juridique',
      'IA': 'Individuelle Accident'
    };
    return labels[this.claimType] || this.claimType;
  }
}
