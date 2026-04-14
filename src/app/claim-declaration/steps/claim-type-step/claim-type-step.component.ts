import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { ClaimTypeDTO } from '../../../models/claim.model';

@Component({
  selector: 'app-claim-type-step',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './claim-type-step.component.html',
  styleUrls: ['./claim-type-step.component.scss']
})
export class ClaimTypeStepComponent {
  @Input() claimTypes: ClaimTypeDTO[] = [];
  @Output() claimTypeSelected = new EventEmitter<string>();

  selectedType: string = '';

  constructor() {}

  selectType(typeCode: string): void {
    this.selectedType = typeCode;
    this.claimTypeSelected.emit(typeCode);
  }

  getDescriptionForType(type: string): string {
    switch (type) {
      case 'ANNULATION':
        return 'Garantie annulation avec remboursement jusqu\'à 100%';
      case 'INTERRUPTION':
        return 'Garantie interruption sans hospitalisation requise';
      case 'INTEMPERIES':
        return 'Garantie intempéries/mauvaises conditions';
      default:
        return '';
    }
  }
}
