import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AprilApiService } from '../services/april-api.service';
import { MortgageInsuranceService } from './mortgage-insurance.service';
import { PricingResult } from '../models/mortgage-insurance.models';
import { QuotityModalComponent } from './quotity-modal/quotity-modal.component';
import { InfoModalComponent } from './info-modal/info-modal.component';
import { HelpModalComponent } from './help-modal/help-modal.component';
import { GuaranteesModalComponent } from './guarantees-modal/guarantees-modal.component';

@Component({
  selector: 'app-mortgage-insurance',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    TranslateModule
  ],
  templateUrl: './mortgage-insurance.component.html',
  styleUrls: ['./mortgage-insurance.component.scss']
})
export class MortgageInsuranceComponent implements OnInit {
  isLoading = false;
  banks: any[] = [
    { bankCode: 'CA_Paris', bankTitle: 'Crédit Agricole' },
    { bankCode: 'Caisse_Epargne_Ile_de_France', bankTitle: 'Caisse d\'épargne' },
    { bankCode: 'credit_mut_Alliance_federale', bankTitle: 'Crédit Mutuel' },
    { bankCode: 'banque_pop_RIVES_DE_PARIS', bankTitle: 'Banque Populaire' },
    { bankCode: 'SG_societe_generale', bankTitle: 'Société Générale' },
    { bankCode: 'LCL', bankTitle: 'LCL' },
    { bankCode: 'BNP', bankTitle: 'BNP Paribas' },
    { bankCode: 'CIC_ILE_DE_FRANCE', bankTitle: 'CIC' },
    { bankCode: 'Banque_Postale', bankTitle: 'La Banque Postale' },
    { bankCode: 'OTHER_BANK', bankTitle: 'Autre banque' }
  ];
  professionalCategories: any[] = [];
  cities: any[] = [];
  pricingResults: PricingResult[] = [];
  fullPricingResults: PricingResult[] = [];
  selectedOffer: any = null;
  currentQuotity: number = 100;
  
  hasCoBorrower = false;
  isNewProject = true;
  hasCredits = false;
  showDeferredFields = false;
  isTauxZero = false;
  showTauxZeroDeferred = false;
  showSmokingStep = true;
  currentStep = 1;
  totalSteps = 11;
  
  showResults = false;
  showConfirmation = false;
  isSendingQuotation = false;
  customerEmail = '';
  aprilDocuments: any[] = [];
  showContactError = false;
  
  mainForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private aprilApi: AprilApiService,
    private mortgageService: MortgageInsuranceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  private ageValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const parts = value.split('/');
    if (parts.length !== 3) return null;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return { ageTooYoung: true };
    }
    
    if (age >= 85) {
      return { ageTooOld: true };
    }

    return null;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadProfessionalCategories();
  }

  private initializeForm(): void {
    this.mainForm = this.fb.group({
      projectType: ['', Validators.required],
      
      hasCoBorrower: [''],
      
      projectPurpose: ['', Validators.required],
      
      bankCode: ['', Validators.required],
      
      loanType: ['', Validators.required],
      borrowedAmount: ['', [Validators.required, Validators.min(50001), Validators.max(14999999)]],
      interestRate: ['', [Validators.required, Validators.min(0.01), Validators.max(20)]],
      rateType: ['Fixe', Validators.required],
      loanDuration: ['', [Validators.required, Validators.min(2), Validators.max(479)]],
      repaymentSchedule: ['Mensuelle', Validators.required],
      deferredType: [''],
      deferredDuration: [''],
      tauxZeroDeferredDuration: [''],
      
      borrower1BirthDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/), this.ageValidator.bind(this)]],
      borrower1ProfessionalCategory: ['', Validators.required],
      
      borrower2BirthDate: ['', [Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/), this.ageValidator.bind(this)]],
      borrower2ProfessionalCategory: [''],
      
      postCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      city: ['', Validators.required],
      
      borrower1Smoker: [null],
      borrower2Smoker: [null],
      
      civility: ['', Validators.required],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^0[67]\d{8}$/)]],
      optInEmail: [false, Validators.requiredTrue],
      optInPhone: [false, Validators.requiredTrue],
      
      borrower1HasCredits: [false],
      borrower1RemainingAmount: [0],
      borrower2HasCredits: [false],
      borrower2RemainingAmount: [0]
    });

    this.mainForm.get('loanType')?.valueChanges.subscribe(value => {
      this.showDeferredFields = ['Differe', 'PretRelais'].includes(value);
      this.isTauxZero = value === 'TauxZero';
      
      if (this.showDeferredFields) {
        this.mainForm.get('deferredType')?.setValidators([Validators.required]);
        this.mainForm.get('deferredDuration')?.setValidators([
          Validators.required,
          Validators.min(2),
          Validators.max(35),
          this.deferredDurationValidator.bind(this)
        ]);
      } else {
        this.mainForm.get('deferredType')?.clearValidators();
        this.mainForm.get('deferredDuration')?.clearValidators();
      }
      this.mainForm.get('deferredType')?.updateValueAndValidity();
      this.mainForm.get('deferredDuration')?.updateValueAndValidity();

      if (this.isTauxZero) {
        this.mainForm.get('interestRate')?.clearValidators();
        this.mainForm.get('interestRate')?.setValue(0);
      } else {
        this.mainForm.get('interestRate')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(20)]);
      }
      this.mainForm.get('interestRate')?.updateValueAndValidity();
    });

    this.mainForm.get('hasCoBorrower')?.valueChanges.subscribe(value => {
      this.hasCoBorrower = value;
      if (value) {
        this.mainForm.get('borrower2BirthDate')?.setValidators([Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/), this.ageValidator.bind(this)]);
        this.mainForm.get('borrower2ProfessionalCategory')?.setValidators([Validators.required]);
      } else {
        this.mainForm.get('borrower2BirthDate')?.clearValidators();
        this.mainForm.get('borrower2ProfessionalCategory')?.clearValidators();
      }
      this.mainForm.get('borrower2BirthDate')?.updateValueAndValidity();
      this.mainForm.get('borrower2ProfessionalCategory')?.updateValueAndValidity();
    });

    this.mainForm.get('optInEmail')?.valueChanges.subscribe(() => {
      if (this.showContactError) {
        this.showContactError = !this.mainForm.get('optInEmail')?.value || !this.mainForm.get('optInPhone')?.value;
      }
    });

    this.mainForm.get('optInPhone')?.valueChanges.subscribe(() => {
      if (this.showContactError) {
        this.showContactError = !this.mainForm.get('optInEmail')?.value || !this.mainForm.get('optInPhone')?.value;
      }
    });

    this.mainForm.get('projectPurpose')?.valueChanges.subscribe(value => {
      this.isNewProject = value === 'new';
    });

    this.mainForm.get('postCode')?.valueChanges.subscribe(value => {
      if (value && value.length === 5) {
        this.loadCities(value);
      }
    });

    this.mainForm.get('borrowedAmount')?.valueChanges.subscribe(value => {
      const amount = parseFloat(value);
      this.showSmokingStep = amount > 200000;
      
      if (!this.showSmokingStep) {
        this.mainForm.get('borrower1Smoker')?.setValue(false);
        this.mainForm.get('borrower2Smoker')?.setValue(false);
      }
    });

    this.mainForm.get('borrower1HasCredits')?.valueChanges.subscribe(value => {
      if (value) {
        this.mainForm.get('borrower1RemainingAmount')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.mainForm.get('borrower1RemainingAmount')?.setValue(0);
        this.mainForm.get('borrower1RemainingAmount')?.clearValidators();
      }
      this.mainForm.get('borrower1RemainingAmount')?.updateValueAndValidity();
    });

    this.mainForm.get('borrower2HasCredits')?.valueChanges.subscribe(value => {
      if (value) {
        this.mainForm.get('borrower2RemainingAmount')?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.mainForm.get('borrower2RemainingAmount')?.setValue(0);
        this.mainForm.get('borrower2RemainingAmount')?.clearValidators();
      }
      this.mainForm.get('borrower2RemainingAmount')?.updateValueAndValidity();
    });
  }

  selectCivility(civility: string): void {
    this.mainForm.get('civility')?.setValue(civility);
  }

  private loadProfessionalCategories(): void {
    this.isLoading = true;
    this.aprilApi.getProfessionalCategories().subscribe({
      next: (data: any) => {
        this.professionalCategories = data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading professional categories:', error);
        this.isLoading = false;
      }
    });
  }

  private loadCities(postCode: string): void {
    this.isLoading = true;
    this.aprilApi.getCities(postCode).subscribe({
      next: (data: any) => {
        this.cities = data;
        if (Array.isArray(data) && data.length === 1) {
          this.mainForm.get('city')?.setValue(data[0].cityTitle);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading cities:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (!this.mainForm.get('optInEmail')?.value || !this.mainForm.get('optInPhone')?.value) {
      this.showContactError = true;
      return;
    }

    if (this.mainForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.customerEmail = this.mainForm.get('email')?.value;
    const payload = this.mortgageService.buildPricingPayload(this.mainForm.value, this.hasCoBorrower, this.currentQuotity);
    
    this.aprilApi.getPricingRecommendation(payload).subscribe({
      next: (response: any) => {
        this.fullPricingResults = response;
        this.pricingResults = this.mortgageService.filterTarifGlobal(response);

        this.generateQuotationPDF(() => {
          this.sendLeadNotification();
          
          this.isLoading = false;
          this.currentStep = 10;
        });
      },
      error: (error: any) => {
        console.error('Error getting pricing:', error);
        this.isLoading = false;
      }
    });
  }

  private sendLeadNotification(): void {
    const formValue = this.mainForm.value;
    const birthDate = formValue.borrower1BirthDate;
    const age = this.calculateAge(birthDate);

    const professionCode = formValue.borrower1ProfessionalCategory;
    const professionLabel = this.professionalCategories.find(cat => cat.code === professionCode)?.title || professionCode;

    const displayedOffer = this.pricingResults[0];

    const leadPayload = {
      civility: formValue.civility,
      prenom: formValue.firstName,
      nom: formValue.lastName,
      email: formValue.email,
      telephone: formValue.phone,
      optInEmail: formValue.optInEmail,
      optInPhone: formValue.optInPhone,
      age: age,
      fumeur: formValue.borrower1Smoker,
      profession: professionCode,
      professionLabel: professionLabel,
      montant: formValue.borrowedAmount,
      duree: formValue.loanDuration,
      tarifConstante: displayedOffer?.contribution?.contributionAmount,
      eightYearsContribution: displayedOffer?.eightYearsContribution,
      taea: displayedOffer?.taea,
      yearlyAverageRate: displayedOffer?.yearlyAverageRate,
      typePret: formValue.loanType,
      typeTaux: formValue.rateType,
      banque: this.getBankLabel(formValue.bankCode),
      dateDemande: new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
      documents: this.aprilDocuments
    };

    this.http.post('/api/tarification/notify-lead', leadPayload).subscribe({
      next: (response) => {
      },
      error: (error) => {
      }
    });
  }

  private sendQuoteToClient(): void {
    const formValue = this.mainForm.value;
    const birthDate = formValue.borrower1BirthDate;
    const age = this.calculateAge(birthDate);
    
    const professionCode = formValue.borrower1ProfessionalCategory;
    const professionLabel = this.professionalCategories.find(cat => cat.code === professionCode)?.title || professionCode;
    
    const leadPayload = {
      civility: formValue.civility,
      prenom: formValue.firstName,
      nom: formValue.lastName,
      email: formValue.email,
      telephone: formValue.phone,
      optInEmail: formValue.optInEmail,
      optInPhone: formValue.optInPhone,
      age: age,
      fumeur: formValue.borrower1Smoker,
      profession: professionCode,
      professionLabel: professionLabel,
      montant: formValue.borrowedAmount,
      duree: formValue.loanDuration,
      tarifConstante: this.pricingResults[0]?.contribution?.contributionAmount,
      eightYearsContribution: this.pricingResults[0]?.eightYearsContribution,
      taea: this.pricingResults[0]?.taea,
      yearlyAverageRate: this.pricingResults[0]?.yearlyAverageRate,
      typePret: formValue.loanType,
      typeTaux: formValue.rateType,
      banque: this.getBankLabel(formValue.bankCode),
      dateDemande: new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
      documents: this.aprilDocuments
    };

    this.http.post('/api/tarification/send-quote-to-client', leadPayload).subscribe({
      next: (response) => {
      },
      error: (error) => {
      }
    });
  }

  private getBankLabel(bankCode: string): string {
    const bank = this.banks.find(b => b.bankCode === bankCode);
    return bank ? bank.bankTitle : bankCode;
  }

  private calculateAge(birthDate: string): number {
    const parts = birthDate.split('/');
    if (parts.length !== 3) return 0;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const birth = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  onDateInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const originalValue = input.value;
    const cursorPosition = input.selectionStart || 0;
    
    let value = originalValue.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    let formattedValue = '';
    if (value.length > 0) {
      formattedValue += value.substring(0, Math.min(2, value.length));
    }
    if (value.length >= 3) {
      formattedValue += '/' + value.substring(2, Math.min(4, value.length));
    }
    if (value.length >= 5) {
      formattedValue += '/' + value.substring(4, Math.min(8, value.length));
    }

    if (formattedValue !== originalValue) {
      input.value = formattedValue;
      this.mainForm.get(controlName)?.setValue(formattedValue);
      
      let newCursorPosition = cursorPosition;
      const slashCount = (formattedValue.substring(0, cursorPosition).match(/\//g) || []).length;
      newCursorPosition = cursorPosition + slashCount;
      
      if (newCursorPosition <= formattedValue.length) {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }
  }

  onNumberInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    
    let value = input.value.replace(/\s/g, '');
    
    value = value.replace(/,/g, '.');

    value = value.replace(/[^\d.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    let formattedValue = '';
    if (parts[0] && parts[0] !== '') {
      const integerPart = parseInt(parts[0], 10);
      if (!isNaN(integerPart)) {
        formattedValue = integerPart.toLocaleString('fr-FR');
      }
    }
    
    if (parts.length > 1 && parts[1]) {
      formattedValue += ',' + parts[1];
    }

    const numericValue = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
    this.mainForm.get(controlName)?.setValue(isNaN(numericValue) ? null : numericValue, { emitEvent: false, emitModelToViewChange: false });
    
    input.value = formattedValue;
  }

  onNumberBlur(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\s/g, '').replace(',', '.');
    const numericValue = parseFloat(value);

    this.mainForm.get(controlName)?.setValue(isNaN(numericValue) ? null : numericValue, { emitModelToViewChange: false });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\s/g, '');

    value = value.replace(/[^\d]/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 2 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }

    input.value = formattedValue;

    this.mainForm.get('phone')?.setValue(value, { emitEvent: false, emitModelToViewChange: false });
  }

  onPhoneBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\s/g, '');
    this.mainForm.get('phone')?.setValue(value, { emitModelToViewChange: false });
  }

  formatNumberDisplay(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return value.toLocaleString('fr-FR');
  }

  getLoanTypeDescription(): string {
    const loanType = this.mainForm.get('loanType')?.value;
    switch (loanType) {
      case 'Classique':
        return 'Vous remboursez une partie des intérêts et du capital à chaque échéance.';
      case 'Differe':
        return 'Vous bénéficiez d\'une période pendant laquelle vous ne remboursez pas le capital emprunté (généralement en début de prêt).';
      case 'PretRelais':
        return 'Vous bénéficiez d\'une période pendant laquelle vous ne remboursez pas le capital emprunté (généralement en début de prêt).';
      case 'TauxZero':
        return 'Prêt sans intérêts obtenu sous conditions de ressources et d\'éligibilité.';
      default:
        return '';
    }
  }

  getRateTypeDescription(): string {
    const rateType = this.mainForm.get('rateType')?.value;
    switch (rateType) {
      case 'Variable':
        return 'Le taux peut augmenter ou diminuer au cours du temps, en fonction de critères définis par l\'assureur.';
      case 'Fixe':
        return 'Le taux d\'assurance reste constant pendant toute la durée du prêt.';
      default:
        return '';
    }
  }

  getProjectPurposeDescription(): string {
    const projectPurpose = this.mainForm.get('projectPurpose')?.value;
    if (projectPurpose === 'lemoine') {
      return 'Depuis 2022 vous pouvez légalement changer d\'assurance emprunteur à tout moment. Profitez en !';
    }
    return '';
  }

  getDeferredTypeDescription(): string {
    const deferredType = this.mainForm.get('deferredType')?.value;
    switch (deferredType) {
      case 'Partiel':
        return 'Durant la période de différé, le remboursement des intérêts est reporté.';
      case 'Total':
        return 'Durant la période de différé, le remboursement du capital et des intérêts est reporté.';
      default:
        return '';
    }
  }

  getDeferredDurationDescription(): string {
    return 'Période d\'anticipation pendant laquelle vous ne remboursez pas de mensualités (ni capital, ni intérêt : différé total) ou pendant laquelle vous ne remboursez que les intérêts (différé partiel).';
  }

  generateQuotationPDF(callback?: () => void): void {
    if (this.pricingResults.length === 0) {
      if (callback) callback();
      return;
    }

    const formValue = this.mainForm.value;
    const payload = this.mortgageService.buildQuotationPayload(
      formValue,
      this.hasCoBorrower,
      {
        borrower1LastName: formValue.lastName,
        borrower1FirstName: formValue.firstName,
        borrower2LastName: this.hasCoBorrower ? formValue.borrower2LastName : undefined,
        borrower2FirstName: this.hasCoBorrower ? formValue.borrower2FirstName : undefined,
        email: formValue.email,
        phone: formValue.phone
      },
      this.pricingResults[0],
      this.currentQuotity
    );

    this.aprilApi.generateQuotation(payload).subscribe({
      next: (response: any) => {
        if (response && response.businessMessages && response.businessMessages.length > 0) {
          const actualErrors = response.businessMessages.filter((msg: any) => 
            !msg.messageTitle?.toLowerCase().includes('lemoine')
          );
          
          if (actualErrors.length > 0) {
            actualErrors.forEach((msg: any) => {
              this.snackBar.open(msg.messageTitle || 'Erreur lors de la génération du devis', 'Fermer', {
                duration: 5000
              });
            });
            this.aprilDocuments = [];
            this.isSendingQuotation = false;
            return;
          }
        } 
        else if (response && response.content) {
          this.aprilDocuments = response.content;
        } else if (response && Array.isArray(response)) {
          this.aprilDocuments = response;
        } else {
          this.aprilDocuments = [];
        }
        if (callback) {
          callback();
        }
      },
      error: (error: any) => {
        if (callback) {
          callback();
        }
      }
    });
  }

  onGetQuotation(offer: any): void {
    this.isSendingQuotation = true;

    const payload = this.mortgageService.buildQuotationPayload(
      this.mainForm.value,
      this.hasCoBorrower,
      {
        borrower1LastName: this.mainForm.get('lastName')?.value,
        borrower1FirstName: this.mainForm.get('firstName')?.value,
        borrower2LastName: this.hasCoBorrower ? this.mainForm.get('borrower2LastName')?.value : undefined,
        borrower2FirstName: this.hasCoBorrower ? this.mainForm.get('borrower2FirstName')?.value : undefined,
        email: this.mainForm.get('email')?.value,
        phone: this.mainForm.get('phone')?.value
      },
      offer,
      this.currentQuotity
    );

    this.aprilApi.generateQuotation(payload).subscribe({
      next: (response: any) => {
        if (response && response.businessMessages && response.businessMessages.length > 0) {
          const actualErrors = response.businessMessages.filter((msg: any) => 
            !msg.messageTitle?.toLowerCase().includes('lemoine')
          );
          
          if (actualErrors.length > 0) {
            actualErrors.forEach((msg: any) => {
              this.snackBar.open(msg.messageTitle || 'Erreur lors de la génération du devis', 'Fermer', {
                duration: 5000
              });
            });
            this.aprilDocuments = [];
            this.isSendingQuotation = false;
            return;
          }
        }
        else if (response && response.content) {
          this.aprilDocuments = response.content;
        } else if (response && Array.isArray(response)) {
          this.aprilDocuments = response;
        } else {
          this.aprilDocuments = [];
        }
        
        this.sendQuoteToClient();
        this.isSendingQuotation = false;
        this.currentStep = 11;
      },
      error: (error: any) => {
        this.isSendingQuotation = false;
      }
    });
  }

  openHelpModal(): void {
    this.dialog.open(HelpModalComponent, {
      width: '600px',
      panelClass: 'help-modal-panel'
    });
  }

  openGuaranteesModal(): void {
    const dialogRef = this.dialog.open(GuaranteesModalComponent, {
      width: '600px',
      data: {
        pricingResults: this.fullPricingResults,
        loanDuration: this.mainForm.value.loanDuration
      },
      panelClass: 'guarantees-modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.openHelp) {
        this.openHelpModal();
      }
    });
  }

  goToModifyQuotity(): void {
    const dialogRef = this.dialog.open(QuotityModalComponent, {
      width: '600px',
      data: { currentQuotity: this.currentQuotity },
      panelClass: 'quotity-modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.newQuotity) {
        this.currentQuotity = result.newQuotity;
          this.recalculatePricing();
      }
    });
  }

  private recalculatePricing(): void {
    if (this.mainForm.invalid) {
      return;
    }

    this.isLoading = true;
    const payload = this.mortgageService.buildPricingPayload(this.mainForm.value, this.hasCoBorrower, this.currentQuotity);

    this.aprilApi.getPricingRecommendation(payload).subscribe({
      next: (response: any) => {
        this.fullPricingResults = response;
        this.pricingResults = this.mortgageService.filterTarifGlobal(response);
        
        this.generateQuotationPDF(() => {
          this.sendLeadNotification();
          this.isLoading = false;
        });
      },
      error: (error: any) => {
        this.isLoading = false;
        this.snackBar.open('Erreur lors du recalcul du tarif', 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  goToModifyInformation(): void {
    const dialogRef = this.dialog.open(InfoModalComponent, {
      width: '700px',
      data: {
        formValue: this.mainForm.value,
        hasCoBorrower: this.hasCoBorrower,
        banks: this.banks,
        professionalCategories: this.professionalCategories
      },
      panelClass: 'info-modal-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.goToStep) {
        this.currentStep = result.goToStep;
      }
    });
  }

  formatStartDate(startDate: string | undefined): string {
    if (!startDate) return '';
    const [day, month, year] = startDate.split('/');
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthIndex = parseInt(month) - 1;
    return `${parseInt(day)} ${months[monthIndex]} ${year}`;
  }

  getConstantContribution(): any {
    return this.mortgageService.getConstantContribution(this.pricingResults);
  }

  getVariableContribution(): any {
    return this.mortgageService.getVariableContribution(this.pricingResults);
  }

  getOfferCost(offer: any): number {
    if (!offer) {
      return Number.POSITIVE_INFINITY;
    }

    return offer.eightYearsContribution ?? offer.contribution?.contributionAmount ?? Number.POSITIVE_INFINITY;
  }

  isMostEconomical(offer: any): boolean {
    const offers = [this.getConstantContribution(), this.getVariableContribution()].filter(Boolean);

    if (!offer || offers.length === 0) {
      return false;
    }

    const bestCost = Math.min(...offers.map(item => this.getOfferCost(item)));
    return this.getOfferCost(offer) === bestCost;
  }

  getOfferProductCode(offer: any): string {
    return offer?.productCode || offer?.product?.productCode || 'ADPv4';
  }

  formatMonthlyContribution(contributionAmount: number): string {
    const loanDuration = this.mainForm.get('loanDuration')?.value || 120;
    return this.mortgageService.formatCurrency(this.mortgageService.calculateMonthlyContribution(contributionAmount, loanDuration));
  }

  formatCurrency(amount: number): string {
    return this.mortgageService.formatCurrency(amount);
  }

  selectProjectType(value: string): void {
    this.mainForm.get('projectType')?.setValue(value);
  }

  selectBorrowerCount(value: boolean): void {
    this.mainForm.get('hasCoBorrower')?.setValue(value);
    this.hasCoBorrower = value;
  }

  selectProjectPurpose(value: string): void {
    this.mainForm.get('projectPurpose')?.setValue(value);
  }

  selectBank(bankCode: string): void {
    this.mainForm.get('bankCode')?.setValue(bankCode);
  }

  getBankLogo(bankCode: string): string {
    const logoMap: { [key: string]: string } = {
      'CA_Paris': 'banks/Crédit_Agricole.svg',
      'Caisse_Epargne_Ile_de_France': 'banks/caisse_epargne.jpg',
      'credit_mut_Alliance_federale': 'banks/credit_mutuel.png',
      'banque_pop_RIVES_DE_PARIS': 'banks/Banquepopulaire_logo.svg',
      'SG_societe_generale': 'banks/sg.png',
      'LCL': 'banks/Lcl_logo.svg',
      'BNP': 'banks/BNP_Paribas.svg',
      'CIC_ILE_DE_FRANCE': 'banks/Cic_logo.svg',
      'Banque_Postale': 'banks/La_Banque_postale.svg'
    };
    return logoMap[bankCode] || '';
  }

  selectBorrower1Smoker(value: boolean): void {
    this.mainForm.get('borrower1Smoker')?.setValue(value);
  }

  selectBorrower2Smoker(value: boolean): void {
    this.mainForm.get('borrower2Smoker')?.setValue(value);
  }

  selectBorrower1HasCredits(value: boolean): void {
    this.mainForm.get('borrower1HasCredits')?.setValue(value);
  }

  selectBorrower2HasCredits(value: boolean): void {
    this.mainForm.get('borrower2HasCredits')?.setValue(value);
  }

  toggleTauxZeroDeferred(event: any): void {
    this.showTauxZeroDeferred = event.checked;
    if (this.showTauxZeroDeferred) {
      this.mainForm.get('tauxZeroDeferredDuration')?.setValidators([Validators.required, Validators.min(2), Validators.max(36)]);
    } else {
      this.mainForm.get('tauxZeroDeferredDuration')?.clearValidators();
      this.mainForm.get('tauxZeroDeferredDuration')?.setValue('');
    }
    this.mainForm.get('tauxZeroDeferredDuration')?.updateValueAndValidity();
  }

  private deferredDurationValidator(control: AbstractControl): ValidationErrors | null {
    const deferredDuration = control.value;
    const loanDuration = this.mainForm.get('loanDuration')?.value;
    
    if (!deferredDuration || !loanDuration) return null;
    
    if (deferredDuration >= loanDuration) {
      return { exceedsLoanDuration: true };
    }
    
    return null;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      
      if (this.currentStep === 8 && !this.showSmokingStep) {
        this.currentStep++;
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      
      if (this.currentStep === 8 && !this.showSmokingStep) {
        this.currentStep--;
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.currentStep) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getProgress(): number {
    const effectiveTotalSteps = this.showSmokingStep ? this.totalSteps : this.totalSteps - 1;
    if (effectiveTotalSteps <= 1) return 0;
    
    let effectiveCurrentStep = this.currentStep;
    if (!this.showSmokingStep && this.currentStep > 8) {
      effectiveCurrentStep--;
    }
    
    return ((effectiveCurrentStep - 1) / (effectiveTotalSteps - 1)) * 100;
  }

  isStep5Valid(): boolean {
    const loanType = this.mainForm.get('loanType')?.value;
    const isValid = !!this.mainForm.get('loanType')?.valid &&
                   !!this.mainForm.get('borrowedAmount')?.valid &&
                   !!this.mainForm.get('interestRate')?.valid &&
                   !!this.mainForm.get('loanDuration')?.valid &&
                   !!this.mainForm.get('rateType')?.valid;
    
    if (!isValid) return false;
    
    if (['Differe', 'PretRelais'].includes(loanType)) {
      return !!this.mainForm.get('deferredType')?.valid &&
             !!this.mainForm.get('deferredDuration')?.valid;
    }
    
    return true;
  }

  isStep6Valid(): boolean {
    const valid = !!this.mainForm.get('borrower1BirthDate')?.valid &&
                  !!this.mainForm.get('borrower1ProfessionalCategory')?.valid;
    
    if (!valid) return false;
    
    if (this.hasCoBorrower) {
      return !!this.mainForm.get('borrower2BirthDate')?.valid &&
             !!this.mainForm.get('borrower2ProfessionalCategory')?.valid;
    }
    
    return true;
  }

  isStep7Valid(): boolean {
    return !!this.mainForm.get('postCode')?.valid &&
           !!this.mainForm.get('city')?.valid;
  }

  isStep9Valid(): boolean {
    return !!this.mainForm.get('firstName')?.valid &&
           !!this.mainForm.get('lastName')?.valid &&
           !!this.mainForm.get('email')?.valid &&
           !!this.mainForm.get('phone')?.valid &&
           !!this.mainForm.get('optInEmail')?.valid &&
           !!this.mainForm.get('optInPhone')?.valid;
  }

  isStep10Valid(): boolean {
    return !!this.mainForm.get('borrower1HasCredits')?.valid &&
           (!this.hasCoBorrower || !!this.mainForm.get('borrower2HasCredits')?.valid);
  }

  isStep11Valid(): boolean {
    const borrower1HasCredits = this.mainForm.get('borrower1HasCredits')?.value;
    const borrower2HasCredits = this.mainForm.get('borrower2HasCredits')?.value;
    
    if (borrower1HasCredits) {
      const amount1 = this.mainForm.get('borrower1RemainingAmount')?.value;
      if (!amount1 || amount1 <= 0) return false;
    }
    
    if (this.hasCoBorrower && borrower2HasCredits) {
      const amount2 = this.mainForm.get('borrower2RemainingAmount')?.value;
      if (!amount2 || amount2 <= 0) return false;
    }
    
    return true;
  }
}
