import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractService } from '../../services/contract.service';
import { OrganizerService } from '../../services/organizer.service';
import { Subject, takeUntil } from 'rxjs';
import { AdaptiveTooltipComponent } from '../../adaptive-tooltip/adaptive-tooltip.component';
import { ResetGuaranteeDialogComponent } from '../../event-coverage/steps/event-coverage-options/reset-guarantee-dialog.component';

interface ProtectionLevel {
  death: number;
  disability: number;
  price: number;
}

interface Benefit {
  icon: string;
  title: string;
}

@Component({
  selector: 'app-motors-league-coverage-options',
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
    MatExpansionModule,
    AdaptiveTooltipComponent
  ],
  templateUrl: './motors-league-coverage-options.component.html',
  styleUrls: ['./motors-league-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options2.scss',  '../../app.component.scss']
})
export class MotorsLeagueCoverageOptionsComponent implements OnInit, OnDestroy {
  @Input() isCalculatingPrice: boolean = false;
  garantiePrices: { [key: string]: number } = {
    'PROTECTION_PILOTE': 0,
    'DEFENSE_RECOURS': 0,
    'RC': 0
  };
  @Input() form!: FormGroup;
  @Input() vehicleType?: string;
  @Output() defenseRecoursChange = new EventEmitter<{isChecked: boolean, garantieType: string}>();
  @Output() sectionInProgress = new EventEmitter<boolean>();

  get PRIME_RATES() {
    return {
      protectionPilote: this.garantiePrices['PROTECTION_PILOTE'],
      defenseRecours: this.garantiePrices['DEFENSE_RECOURS'],
      responsabiliteCivile: this.garantiePrices['RC']
    };
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return '-- € ';
    return price % 1 === 0 ? `${price} €` : price.toFixed(2).replace('.', ',') + ' €';
  }

  PROTECTION_LEVELS: { [key: number]: ProtectionLevel } = {
    1: { death: 7600, disability: 18500, price: 0 },
    2: { death: 25000, disability: 37500, price: 0 },
    3: { death: 100000, disability: 150000, price: 0 },
    4: { death: 150000, disability: 200000, price: 0 },
    5: { death: 200000, disability: 300000, price: 0 }
  };

  benefitsMap: { [key: string]: Benefit[] } = {
    protectionPilote: [
      { icon: 'heart_broken', title: 'Capital Décès (de 7600 € à 200 000 €)' },
      { icon: 'accessible', title: 'Capital Invalidité (de 18500 à 300 000 €)' },
      { icon: 'phone_in_talk', title: 'Assistance médicale 24/7' },
      { icon: 'flight_takeoff', title: 'Frais médicaux à l\'étranger : 100 000 €' },
      { icon: 'local_hospital', title: 'Rapatriement et transport sanitaire (frais réels)' },
      { icon: 'receipt_long', title: 'Frais médicaux restant à charge (2500 €)' },
      { icon: 'two_wheeler', title: 'Spécial moto : reconditionnement d\'airbag jusque 150 €' }
    ],
    defenseRecours: [
      { icon: 'gavel', title: 'La garantie qui défend vos droits' },
      { icon: 'contact_support', title: 'Accompagnement juridique et assistance psychologique par téléphone' },
      { icon: 'balance', title: 'Garantie d\'aide aux victimes et recours pénal' },
      { icon: 'admin_panel_settings', title: 'Défense pénale' },
      { icon: 'description', title: 'Garantie consommation auto/moto' }
    ],
    responsabiliteCivile: [
      { icon: 'shield', title: 'Couverture des dommages que vous causez aux tiers' },
      { icon: 'personal_injury', title: 'Dommages corporels : 8M€' },
      { icon: 'car_crash', title: 'Dommages matériels : 500k€' },
      { icon: 'sports_motorsports', title: 'Dont dommages aux équipements de sécurité : 10k€' },
      { icon: 'check_circle', title: 'Sans franchise' }
    ]
  };

  private destroy$ = new Subject<void>();

  activeSection: 'protectionPilote' | 'responsabiliteRecours' | null = null;
  validatedSections: { [key: string]: boolean } = {
    protectionPilote: false,
    responsabiliteRecours: false
  };

  wasProtectionPiloteValidated = false;
  wasResponsabiliteRecoursValidated = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private contractService: ContractService
  ) {}

  ngOnInit() {
    if (!this.form) {
      this.initializeForm();
    } else {
      if (!this.form.get('protectionPilote')) this.form.addControl('protectionPilote', this.fb.control(0));
      if (!this.form.get('defenseRecours')) this.form.addControl('defenseRecours', this.fb.control(false));
      if (!this.form.get('responsabiliteCivile')) this.form.addControl('responsabiliteCivile', this.fb.control(false));
      if (!this.form.get('responsabiliteRecours')) this.form.addControl('responsabiliteRecours', this.fb.control(false));
    }

    this.form.valueChanges.subscribe(() => {
    });
  }

  private initializeForm() {
    this.form = this.fb.group({
      protectionPilote: [0],
      defenseRecours: [false],
      responsabiliteRecours: [false],
      responsabiliteCivile: [false]
    });
  }

  getProtectionLevelPrice(level: number): number {
    return this.PROTECTION_LEVELS[level]?.price || 0;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public initializeProtectionPrices(): void {
    if (!this.vehicleType) {
      return;
    }

  const today = new Date();
  const datedebutroulage = today.getFullYear() + '-' + 
              String(today.getMonth() + 1).padStart(2, '0') + '-' + 
              String(today.getDate()).padStart(2, '0');
  const dateInscriptionRoulage = datedebutroulage;

    const basePayload = {
      annual: true,
      c: { id: null },
      datedebutroulage: datedebutroulage,
      dateInscriptionRoulage: dateInscriptionRoulage,
      immatriculation: "",
      marque: "",
      modele: "",
      nbrjour: 0,
      param_n_chassis: "",
      param_n_serie: "",
      selectedCircuit: "",
      typevehicule: this.vehicleType,
      montantganrantie: 0
    };

    const levelToProductCode: { [key: number]: number } = {
      1: 354, 2: 355, 3: 356, 4: 357, 5: 358
    };

    Object.keys(levelToProductCode).forEach(level => {
      const levelNum = parseInt(level, 10);
      const productCode = levelToProductCode[levelNum];

      const payload = { ...basePayload, codeProduit: [productCode] };
      this.contractService.calculatePrice(payload).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          const montant = (response?.prixProduitCompagnieTTC || 0) + (response?.fraisDeCourtage || 0);
          this.PROTECTION_LEVELS[levelNum].price = montant;
        },
        error: (_err: any) => {
        }
      });
    });

    this.contractService
      .calculatePrice({ ...basePayload, codeProduit: [83] })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const montant = (response?.prixProduitCompagnieTTC || 0) + (response?.fraisDeCourtage || 0);
          this.garantiePrices['RC'] = montant;
        },
        error: (_err: any) => {
        }
      });

    this.contractService
      .calculatePrice({ ...basePayload, codeProduit: [398] })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const montant = (response?.prixProduitCompagnieTTC || 0) + (response?.fraisDeCourtage || 0);
          this.garantiePrices['DEFENSE_RECOURS'] = montant;
        },
        error: (_err: any) => {
        }
      });
  }

  isProductUnavailable(productKey: string): boolean {
    return false;
  }

  onProtectionLevelChange(level: number): void {
    const current = this.form.get('protectionPilote')?.value;
    this.form.patchValue({ protectionPilote: current === level ? 0 : level });
  }

  get totalPrime(): number {
    const { protectionPilote, defenseRecours, responsabiliteCivile } = this.form.value;
    const protectionPrime = protectionPilote ? this.getProtectionLevelPrice(protectionPilote) : 0;
    return (
      protectionPrime +
      (defenseRecours ? this.PRIME_RATES.defenseRecours : 0) +
      (responsabiliteCivile ? this.PRIME_RATES.responsabiliteCivile : 0)
    );
  }

  getProtectionPiloteAmount(): number {
    return this.getProtectionLevelPrice(this.form.get('protectionPilote')?.value);
  }

  getResponsabiliteRecoursAmount(): number {
    return (this.form.get('defenseRecours')?.value ? this.PRIME_RATES.defenseRecours : 0) + 
           (this.form.get('responsabiliteCivile')?.value ? this.PRIME_RATES.responsabiliteCivile : 0);
  }

  onToggleChange(section: 'protectionPilote' | 'responsabiliteRecours', checked: boolean): void {
    if (checked) {
      this.activeSection = section;
      this.form.patchValue({
        protectionPilote: section === 'protectionPilote' ? this.form.get('protectionPilote')?.value || 0 : this.form.get('protectionPilote')?.value,   
        responsabiliteRecours: section === 'responsabiliteRecours'
      });
      this.sectionInProgress.emit(true);
    } else {
      this.activeSection = null;
      this.resetSection(section);
    }
  }

  async confirmResetSection(section: 'protectionPilote' | 'responsabiliteRecours') {
    const labelMap = {
      protectionPilote: 'Protection Pilote',
      responsabiliteRecours: 'Garantie Responsabilité / Recours'
    };
    const dialogRef = this.dialog.open(ResetGuaranteeDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { label: labelMap[section] }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.resetSection(section);
    });
  }

  resetSection(section: 'protectionPilote' | 'responsabiliteRecours'): void {
    const patchValues: any = {};
    this.validatedSections[section] = false;
    this.sectionInProgress.emit(false);
    
    if (section === 'protectionPilote') {
      patchValues.protectionPilote = 0;
      this.wasProtectionPiloteValidated = false;
      this.form.get('protectionPilote')?.setValue(0);
    } else if (section === 'responsabiliteRecours') {
      patchValues.responsabiliteRecours = false;
      patchValues.defenseRecours = false;
      patchValues.responsabiliteCivile = false;
      this.wasResponsabiliteRecoursValidated = false;
    }

    this.form.patchValue(patchValues);
    this.validatedSections[section] = false;

    if (this.activeSection === section) {
      this.activeSection = null;
    }
  }

  validateSection(section: 'protectionPilote' | 'responsabiliteRecours'): void {
    this.sectionInProgress.emit(false);
    this.activeSection = null;

    let shouldValidate = true;

    if (section === 'protectionPilote') {
      shouldValidate = this.form.get('protectionPilote')?.value > 0;
    } else if (section === 'responsabiliteRecours') {
      shouldValidate = !!this.form.get('defenseRecours')?.value || !!this.form.get('responsabiliteCivile')?.value;
    }

    if (!shouldValidate) {
      this.validatedSections[section] = false;
      if (section === 'protectionPilote') this.wasProtectionPiloteValidated = false;
      if (section === 'responsabiliteRecours') this.wasResponsabiliteRecoursValidated = false;
      return;
    }

    this.validatedSections[section] = true;

    if (section === 'protectionPilote') this.wasProtectionPiloteValidated = true;
    if (section === 'responsabiliteRecours') this.wasResponsabiliteRecoursValidated = true;
  }

  onCartClick(section: 'protectionPilote' | 'responsabiliteRecours'): void {
    if (this.activeSection === section) {
      this.activeSection = null;
    } else {
      this.activeSection = section;
    }

    this.activeSection = section;
    this.validatedSections[section] = false;
    this.sectionInProgress.emit(true);

    if (section === 'responsabiliteRecours') this.form.patchValue({ responsabiliteRecours: true });
  }

  getBenefitsForGuarantee(guaranteeType: string): Benefit[] {
    return this.benefitsMap[guaranteeType] || [];
  }

}