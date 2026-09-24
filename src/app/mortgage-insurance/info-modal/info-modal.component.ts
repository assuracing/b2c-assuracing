import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MortgageInsuranceForm } from '../../models/mortgage-insurance.models';

export interface InfoModalData {
  formValue: MortgageInsuranceForm;
  hasCoBorrower: boolean;
  banks: any[];
  professionalCategories: any[];
}

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.scss']
})
export class InfoModalComponent {
  constructor(
    private dialogRef: MatDialogRef<InfoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InfoModalData,
    private translate: TranslateService
  ) {}

  getBankLabel(bankCode: string): string {
    const bank = this.data.banks.find(b => b.bankCode === bankCode);
    return bank ? bank.bankTitle : bankCode;
  }

  getProjectTypeLabel(): string {
    switch (this.data.formValue.projectType) {
      case 'new':
        return 'Assurer un nouveau prêt';
      case 'lemoine':
        return 'Changer d\'assurance (loi Lemoine)';
      default:
        return this.data.formValue.projectType;
    }
  }

  getProjectPurposeLabel(): string {
    switch (this.data.formValue.projectPurpose) {
      case 'new':
        return 'Assurer un nouveau prêt';
      case 'lemoine':
        return 'Changer d\'assurance de prêt';
      case 'ResidencePrincipale':
        return 'Résidence principale';
      case 'ResidenceSecondaire':
        return 'Résidence secondaire';
      case 'InvestissementLocatif':
        return 'Investissement locatif';
      default:
        return this.data.formValue.projectPurpose;
    }
  }

  getProfessionLabel(professionCode: string | undefined): string {
    if (!professionCode) return '';
    const profession = this.data.professionalCategories.find(cat => cat.code === professionCode);
    return profession ? profession.title : professionCode;
  }

  goToStep(step: number): void {
    this.dialogRef.close({ goToStep: step });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
