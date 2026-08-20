import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ContractConsentsComponent, ContractConsents } from '../../../components/contract-consents/contract-consents.component';
import { ConsentService } from '../../../services/consent.service';

@Component({
  selector: 'app-consent-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule, ContractConsentsComponent],
  template: `
    <h2 mat-dialog-title>{{ 'consentDialog.title' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'consentDialog.description' | translate }}</p>
      <app-contract-consents
        [consents]="consents"
        [showSelectAll]="true"
        [alreadyConsented]="false"
        (consentsChange)="onConsentsChange($event)"
        (validityChange)="onValidityChange($event)">
      </app-contract-consents>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-raised-button
        color="primary"
        (click)="accept()"
        [disabled]="!isValid || saving">
        {{ 'consentDialog.accept' | translate }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConsentDialogComponent {
  consents: ContractConsents = {
    cgu: false,
    privacyPolicy: false,
    healthDataConsent: false,
    commercialOffers: false
  };
  isValid: boolean = false;
  saving: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ConsentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { adherentId: number; consents?: ContractConsents } | null,
    private consentService: ConsentService
  ) {
    if (data?.consents) {
      this.consents = { ...data.consents };
    }
  }

  onConsentsChange(newConsents: ContractConsents): void {
    this.consents = newConsents;
  }

  onValidityChange(isValid: boolean): void {
    this.isValid = isValid;
  }

  accept(): void {
    if (!this.isValid || this.saving) {
      return;
    }

    if (!this.data?.adherentId) {
      return;
    }

    this.saving = true;
    this.consentService.saveConsentHistory(this.data.adherentId, this.consents).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving = false;
      }
    });
  }
}
