import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResetGuaranteeDialogComponent } from './reset-guarantee-dialog.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from '../../../services/contract.service';
import { OrganizerService } from '../../../services/organizer.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AdaptiveTooltipComponent } from '../../../adaptive-tooltip/adaptive-tooltip.component';

interface ProtectionLevel {
  death: number;
  disability: number;
  price: number;
}

@Component({
  selector: 'app-event-coverage-options',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    AdaptiveTooltipComponent
  ],
  templateUrl: './event-coverage-options.component.html',
  styleUrls: ['./event-coverage-options.component.scss', './event-coverage-options2.scss',  '../../../app.component.scss']
})
export class EventCoverageOptionsComponent {
  @Input() isCalculatingPrice: boolean = false;
  @Input() defenseRecoursPrice: number | null = null;
  @Input() annulationPrice: number | null = null;
  @Input() interruptionPrice: number | null = null;
  @Input() intemperiesPrice: number | null = null;
  @Input() garantiePrices: { [key: string]: number } = {};
  @Input() form!: FormGroup;
  @Input() circuit!: string;
  @Input() eventDate!: string;
  @Input() duration!: number;
  @Output() defenseRecoursChange = new EventEmitter<{isChecked: boolean, garantieType: string}>();
  @Output() reservationAmountChanged = new EventEmitter<void>();
  @Output() sectionInProgress = new EventEmitter<boolean>();

  onReservationAmountChange() {
    const amountControl = this.form.get('reservationAmount');
    if (amountControl) {
      const value = parseFloat(amountControl.value);
      if (value > 1500) {
        amountControl.setValue(1500, { emitEvent: false });
      }
    }
    this.reservationAmountChanged.emit();
  }
  
  private _eventType: string = '';
  private _role: string = '';

  today = new Date();
  annulationDisabledByInscriptionDate = false;

  private _disableIntempAnnul = false;
  @Input()
  set disableIntempAnnul(val: boolean) {
    this._disableIntempAnnul = val;
    this.updateFormControlsAvailability();
  }

  ngOnInit() {
    this.form.get('inscriptionDate')?.valueChanges.subscribe(date => {
      this.checkAnnulationAvailability(date);
    });
  
    if (this.trackdayForm) {
      this.trackdayForm.get('organizer')?.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(organizerId => {
        if (organizerId) {
          this.checkProductsAvailability(organizerId);
        } else {
          this.resetProductAvailability();
        }
      });
  
      const currentOrganizerId = this.trackdayForm.get('organizer')?.value;
      if (currentOrganizerId) {
        this.checkProductsAvailability(currentOrganizerId);
      }
    }
  }

  checkAnnulationAvailability(inscriptionDate: any) {
    if (!inscriptionDate) {
      this.annulationDisabledByInscriptionDate = false;
      this.updateFormControlsAvailability();
      return;
    }
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const inscription = new Date(inscriptionDate);
    inscription.setHours(0, 0, 0, 0);
  
    const dateLimite = new Date(today);
    dateLimite.setDate(today.getDate() - 14);
  
    const isInTwoWeeksWindow = inscription >= dateLimite && inscription <= today;
  
    this.annulationDisabledByInscriptionDate = !isInTwoWeeksWindow;
  
    this.updateFormControlsAvailability();
  }

  get disableIntempAnnul() {
    return this._disableIntempAnnul;
  }  @Input()
  set eventType(val: string) {
    this._eventType = val;
    this.updateGaranties();
  }
  get eventType() {
    return this._eventType;
  }

  @Input()
  set role(val: string) {
    this._role = val;
    this.updateGaranties();
  }
  get role() {
    return this._role;
  }

  allowedGaranties: string[] = [];

  isOnlyAnnulationAllowed(): boolean {
    return this.allowedGaranties.includes('Annulation');
  }


  GARANTIES_MAP: any = {
    ROULAGE_ENTRAINEMENT: {
      PILOTE: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      PASSAGER: ['IA', 'PJ'],
      MECANICIEN: ['IA', 'PJ'],
      PHOTOGRAPHE_VIDEASTE: ['IA', 'PJ'] 
    },
    COACHING: {
      PILOTE: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      PASSAGER: ['IA', 'PJ'],
      MECANICIEN: ['IA', 'PJ'],
      PHOTOGRAPHE_VIDEASTE: ['IA', 'PJ']
    },
    STAGE_PILOTAGE: {
      PILOTE: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      PASSAGER: ['IA', 'PJ'],
      MECANICIEN: ['IA', 'PJ'],
      PHOTOGRAPHE_VIDEASTE: ['IA', 'PJ']
    },
    COMPETITION: {
      PILOTE: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      PASSAGER: ['IA', 'PJ'],
      MECANICIEN: ['IA', 'PJ'],
      PHOTOGRAPHE_VIDEASTE: ['IA', 'PJ']
    }
  };

  updateGaranties() {
    if (!this._eventType || !this._role) {
      this.allowedGaranties = [];
      return;
    }

    const mappedRole = this._role === 'PHOTOGRAPHE_VIDEASTE' ? 'PHOTOGRAPHE_VIDEASTE' : this._role;
    this.allowedGaranties = this.GARANTIES_MAP[this._eventType]?.[mappedRole] || [];

    if (this.allowedGaranties.includes('Annulation')) {
      this.allowedGaranties.push('IAI');
    }
  }

  get PRIME_RATES() {
    return {
      protectionPilote: this.garantiePrices['PROTECTION_PILOTE'],
      defenseRecours: this.garantiePrices['DEFENSE_RECOURS'],
      iai: this.garantiePrices['IAI'],
      annulation: this.garantiePrices['ANNULATION'],
      interruption: this.garantiePrices['INTERRUPTION'],
      intemperies: this.garantiePrices['INTEMPERIES'],
      responsabiliteRecours: this.garantiePrices['DEFENSE_RECOURS']
    };
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return '-- € ';
    return price % 1 === 0 ? `${price}€` : price.toFixed(2).replace('.', ',') + '€';
  }

  PROTECTION_LEVELS: { [key: number]: ProtectionLevel } = {
    1: { death: 7600, disability: 18500, price: 15 },
    2: { death: 25000, disability: 37500, price: 38 },
    3: { death: 100000, disability: 150000, price: 60 },
    4: { death: 150000, disability: 200000, price: 85 },
    5: { death: 200000, disability: 300000, price: 120 }
  };

  private destroy$ = new Subject<void>();

  activeSection: 'iai' | 'protectionPilote' | 'responsabiliteRecours' | null = null;
  validatedSections: { [key: string]: boolean } = {
    iai: false,
    protectionPilote: false,
    responsabiliteRecours: false
  };

  wasIAIValidated = false;
  wasProtectionPiloteValidated = false;
  wasResponsabiliteRecoursValidated = false;

  isCheckingAvailability = false;
  productAvailability: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder, 
    private dialog: MatDialog, 
    private contractService: ContractService,
    private organizerService: OrganizerService,
    private snackBar: MatSnackBar,
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.form = this.fb.group({
      iai: [false],
      inscriptionDate: ['', Validators.required],
      reservationAmount: ['', [Validators.required, Validators.min(0)]],
      intemperies: [false],
      annulation: [false],
      interruption: [false],
      protectionPilote: [0],
      defenseRecours: [false],
      responsabiliteRecours: [false]
    });

    this.form.valueChanges.subscribe(() => {
      if (
        !this.form.get('iai')?.value &&
        this.form.get('protectionPilote')?.value === 0 &&
        !this.form.get('responsabiliteRecours')?.value
      ) {
        this.activeSection = null;
      }
    });
  }

  @Input() trackdayForm!: FormGroup;
  @Input() organizerId: string | null = null;
  @Input() vehicleType?: string;
  
  public initializeProtectionPrices(): void {
    if (!this.trackdayForm) {
      console.error('trackdayForm is not defined');
      return;
    }

    const priceData = {
      nbrjour: this.trackdayForm.get('duration')?.value || 1,
      datedebutroulage: this.trackdayForm.get('eventDate')?.value || new Date().toISOString(),
      annual: false,
      c: { id: null },
      dateinscriptionRoulage: new Date().toISOString(),
      immatriculation: "",
      marque: "",
      modele: "",
      montantganrantie: 0,
      param_n_chassis: "",
      param_n_serie: "",
      typevehicule: this.trackdayForm.get('vehicleType')?.value || "moto"
    };

    const isCompetition = this.eventType === 'competition';
    
    const levelToProductCode: { [key: number]: number } = isCompetition 
      ? { 1: 345, 2: 346, 3: 347, 4: 348, 5: 349 }
      : { 1: 340, 2: 341, 3: 342, 4: 343, 5: 344 };

    Object.keys(levelToProductCode).forEach(level => {
      const levelNum = parseInt(level);
      const productCode = levelToProductCode[levelNum];
      
      const data = { ...priceData, codeProduit: [productCode] };
      
      this.contractService.calculatePrice(data).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response: any) => {
          if (response) {
            const montant = (response.prixProduitCompagnieTTC || 0) + 
                          (response.fraisDeCourtage || 0);
            this.PROTECTION_LEVELS[levelNum].price = montant;
          }
        },
        error: (err: any) => {
          console.error(`Erreur lors du calcul du prix pour le niveau ${levelNum}`, err);
        }
      });
    });
  }

  getProtectionLevelPrice(level: number): number {
    return this.PROTECTION_LEVELS[level]?.price || 0;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public checkProductsAvailability(organizerId: string): void {
    if (!organizerId) {
      this.resetProductAvailability();
      return;
    }

    this.isCheckingAvailability = true;
    const productKeys: (keyof typeof this.organizerService['PRODUCT_CODES'])[] = [
      'DEFENSE_RECOURS',
      'ANNULATION',
      'INTEMPERIES',
      'INTERRUPTION',
      'PROTECTION_1',
      'PROTECTION_2',
      'PROTECTION_3',
      'PROTECTION_4',
      'PROTECTION_5',
      'PROTECTION_1_COMP',
      'PROTECTION_2_COMP',
      'PROTECTION_3_COMP',
      'PROTECTION_4_COMP',
      'PROTECTION_5_COMP'
    ];

    this.organizerService.checkProductsAvailability(organizerId, productKeys)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (availability) => {
          this.productAvailability = availability;
          this.updateFormControlsAvailability();
          this.isCheckingAvailability = false;
        },
        error: (error) => {
          console.error('Erreur lors de la vérification de la disponibilité des produits:', error);
          this.snackBar.open(
            'Erreur lors de la vérification des options disponibles pour cet organisateur',
            'Fermer',
            { duration: 5000 }
          );
          this.isCheckingAvailability = false;
          this.resetProductAvailability();
        }
      });
  }

  private updateFormControlsAvailability(): void {
    const controls = this.form.controls;
    
    const defenseRecoursAvailable = this.productAvailability['DEFENSE_RECOURS'] !== false;
    if (defenseRecoursAvailable) {
      controls['defenseRecours'].enable();
    } else {
      controls['defenseRecours'].disable();
      controls['defenseRecours'].setValue(false);
    }

    const annulationAvailable = this.productAvailability['ANNULATION'] !== false && !this.disableIntempAnnul && !this.annulationDisabledByInscriptionDate;
    if (annulationAvailable) {
      controls['annulation'].enable();
    } else {
      controls['annulation'].disable();
      controls['annulation'].setValue(false);
    }

    const intemperiesAvailable = this.productAvailability['INTEMPERIES'] !== false && !this.disableIntempAnnul;
    if (intemperiesAvailable) {
      controls['intemperies'].enable();
    } else {
      controls['intemperies'].disable();
      controls['intemperies'].setValue(false);
    }

    const interruptionAvailable = this.productAvailability['INTERRUPTION'] !== false;
    if (interruptionAvailable) {
      controls['interruption'].enable();
    } else {
      controls['interruption'].disable();
      controls['interruption'].setValue(false);
    }
  }

  private resetProductAvailability(): void {
    this.productAvailability = {};
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.enable();
    });
  }

  isProductUnavailable(productKey: string): boolean {
    return this.productAvailability[productKey] === false;
  }

  onProtectionLevelChange(level: number): void {
    const current = this.form.get('protectionPilote')?.value;
    this.form.patchValue({ protectionPilote: current === level ? 0 : level });
  }

  get totalPrime(): number {
    const { intemperies, annulation, interruption, protectionPilote, defenseRecours } = this.form.value;
    const protectionPrime = protectionPilote ? this.getProtectionLevelPrice(protectionPilote) : 0;
    return (
      (intemperies ? this.PRIME_RATES.intemperies : 0) +
      (annulation ? this.PRIME_RATES.annulation : 0) +
      (interruption ? this.PRIME_RATES.interruption : 0) +
      protectionPrime +
      (defenseRecours ? this.PRIME_RATES.defenseRecours : 0)
    );
  }

  getIAIAmount(): number {
    return (
      (this.form.get('intemperies')?.value ? this.PRIME_RATES.intemperies : 0) +
      (this.form.get('annulation')?.value ? this.PRIME_RATES.annulation : 0) +
      (this.form.get('interruption')?.value ? this.PRIME_RATES.interruption : 0)
    );
  }

  getProtectionPiloteAmount(): number {
    return this.getProtectionLevelPrice(this.form.get('protectionPilote')?.value);
  }

  getResponsabiliteRecoursAmount(): number {
    return this.form.get('defenseRecours')?.value ? this.PRIME_RATES.defenseRecours : 0;
  }

  onToggleChange(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours', checked: boolean): void {
    if (checked) {
      this.activeSection = section;
      this.form.patchValue({
        iai: section === 'iai',
        protectionPilote: section === 'protectionPilote' ? this.form.get('protectionPilote')?.value || 0 : this.form.get('protectionPilote')?.value,
        responsabiliteRecours: section === 'responsabiliteRecours'
      });
      this.sectionInProgress.emit(true);
      this.updateFormControlsAvailability();
    } else {
      this.activeSection = null;
      this.resetSection(section);
    }
  }

  async confirmResetSection(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours') {
    const labelMap = {
      iai: 'Garantie IAI',
      protectionPilote: 'Protection Pilote',
      responsabiliteRecours: 'Garantie Responsabilité / Recours'
    };
    const dialogRef = this.dialog.open(ResetGuaranteeDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { label: labelMap[section] }
    });
    const result = await dialogRef.afterClosed().toPromise();
    if (result) this.resetSection(section);
  }

  resetSection(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours'): void {
    const patchValues: any = {};
    this.validatedSections[section] = false;
    this.sectionInProgress.emit(false);
    if (section === 'iai') {
      patchValues.iai = false;
      patchValues.intemperies = false;
      patchValues.annulation = false;
      patchValues.interruption = false;
      patchValues.inscriptionDate = '';
      patchValues.reservationAmount = '';
      this.wasIAIValidated = false;
      this.form.get('reservationAmount')?.setValue(0);
    } else if (section === 'protectionPilote') {
      patchValues.protectionPilote = 0;
      this.wasProtectionPiloteValidated = false;
      this.form.get('protectionPilote')?.setValue(0);
    } else if (section === 'responsabiliteRecours') {
      patchValues.responsabiliteRecours = false;
      patchValues.defenseRecours = false;
      this.wasResponsabiliteRecoursValidated = false;
    }

    this.form.patchValue(patchValues);
    this.validatedSections[section] = false;

    if (this.activeSection === section) {
      this.activeSection = null;
    }
  }

  validateSection(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours'): void {
    this.sectionInProgress.emit(false);
    this.activeSection = null;
    
    let shouldValidate = true;
    
    if (section === 'iai') {
      shouldValidate = !!(
        this.form.get('intemperies')?.value ||
        this.form.get('annulation')?.value ||
        this.form.get('interruption')?.value
      );
    } else if (section === 'protectionPilote') {
      shouldValidate = this.form.get('protectionPilote')?.value > 0;
    } else if (section === 'responsabiliteRecours') {
      shouldValidate = !!this.form.get('defenseRecours')?.value;
    }

    if (!shouldValidate) {
      this.validatedSections[section] = false;
      if (section === 'iai') this.wasIAIValidated = false;
      if (section === 'protectionPilote') this.wasProtectionPiloteValidated = false;
      if (section === 'responsabiliteRecours') this.wasResponsabiliteRecoursValidated = false;
      return;
    }

    this.validatedSections[section] = true;
    
    if (section === 'iai') this.wasIAIValidated = true;
    if (section === 'protectionPilote') this.wasProtectionPiloteValidated = true;
    if (section === 'responsabiliteRecours') this.wasResponsabiliteRecoursValidated = true;
  }

  onCartClick(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours'): void {
    if (this.activeSection === section) {
      this.activeSection = null;
    } else {
      this.activeSection = section;
    }

    this.activeSection = section;
    this.validatedSections[section] = false;
    this.sectionInProgress.emit(true);

    if (section === 'iai') this.form.patchValue({ iai: true });
    if (section === 'responsabiliteRecours') this.form.patchValue({ responsabiliteRecours: true });
  }

  onDefenseRecoursToggle(event: any): void {
    this.defenseRecoursChange.emit({
      isChecked: event.checked,
      garantieType: 'DEFENSE_RECOURS'
    });
  }

  onIaiToggle(event: any): void {
    this.defenseRecoursChange.emit({
      isChecked: event.checked,
      garantieType: 'IAI'
    });
  }

  onProtectionPiloteToggle(event: any): void {
    this.defenseRecoursChange.emit({
      isChecked: event.checked,
      garantieType: 'PROTECTION_PILOTE'
    });
  }

  onResponsabiliteRecoursToggle(event: any): void {
    this.defenseRecoursChange.emit({
      isChecked: event.checked,
      garantieType: 'RESPONSABILITE_RECURS'
    });
  }
}
