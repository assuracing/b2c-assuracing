import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface ContractConsents {
  cgu: boolean;
  privacyPolicy: boolean;
  healthDataConsent: boolean;
  commercialOffers: boolean;
}

@Component({
  selector: 'app-contract-consents',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, MatIconModule, MatCheckboxModule],
  templateUrl: './contract-consents.component.html',
  styleUrls: ['./contract-consents.component.scss']
})
export class ContractConsentsComponent {
  @Input() consents: ContractConsents = {
    cgu: false,
    privacyPolicy: false,
    healthDataConsent: false,
    commercialOffers: false
  };

  @Input() alreadyConsented: boolean = false;

  @Output() consentsChange = new EventEmitter<ContractConsents>();
  @Output() validityChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private router: Router) {}

  shouldShowConsent(): boolean {
    return !this.alreadyConsented;
  }

  onConsentChange(): void {
    this.consentsChange.emit(this.consents);
    this.checkValidity();
  }

  checkValidity(): void {
    const isValid = this.consents.cgu &&
                   this.consents.privacyPolicy &&
                   this.consents.healthDataConsent;
    this.validityChange.emit(isValid);
  }

  reset(): void {
    this.consents = {
      cgu: false,
      privacyPolicy: false,
      healthDataConsent: false,
      commercialOffers: false
    };
    this.consentsChange.emit(this.consents);
    this.validityChange.emit(false);
  }
}
