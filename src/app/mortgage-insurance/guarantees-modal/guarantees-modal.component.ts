import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PricingResult } from '../../models/mortgage-insurance.models';

export interface GuaranteesModalData {
  pricingResults: PricingResult[];
  loanDuration: number;
}

@Component({
  selector: 'app-guarantees-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './guarantees-modal.component.html',
  styleUrls: ['./guarantees-modal.component.scss']
})
export class GuaranteesModalComponent {
  constructor(
    private dialogRef: MatDialogRef<GuaranteesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GuaranteesModalData,
    private translate: TranslateService
  ) {}

  getGuarantees(): any[] {
    const detailedResults = this.data.pricingResults.filter(r => r.priceType === 'TarifDetaille');
    const guaranteesMap = new Map<string, any>();

    detailedResults.forEach(result => {
      const guaranteeCode = result.guaranteeCode;
      if (guaranteeCode && !guaranteesMap.has(guaranteeCode)) {
        guaranteesMap.set(guaranteeCode, {
          code: guaranteeCode,
          label: this.getGuaranteeLabel(guaranteeCode),
          coveragePercentage: result.coveragePercentage
        });
      }
    });

    return Array.from(guaranteesMap.values());
  }

  getGuaranteeLabel(code: string): string {
    const labels: { [key: string]: string } = {
      'Deces': 'Décès',
      'PTIA': 'Perte totale et irréversible d\'autonomie',
      'ITT': 'Incapacité temporaire de travail',
      'IPT': 'Invalidité permanente partielle',
      'IPP': 'Invalidité permanente partielle'
    };
    return labels[code] || code;
  }

  getMainOffer(): PricingResult | undefined {
    return this.data.pricingResults.find(r => r.priceType === 'TarifGlobal');
  }

  getMonthlyContribution(): number {
    const mainOffer = this.getMainOffer();
    if (!mainOffer || !mainOffer.contribution?.contributionAmount || !this.data.loanDuration) return 0;
    return mainOffer.contribution.contributionAmount / this.data.loanDuration;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  openHelpModal(): void {
    this.dialogRef.close({ openHelp: true });
  }
}
