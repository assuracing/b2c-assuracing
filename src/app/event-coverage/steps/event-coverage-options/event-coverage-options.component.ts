import { Component, Input } from '@angular/core';
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
    MatTooltipModule
  ],
  templateUrl: './event-coverage-options.component.html',
  styleUrls: ['./event-coverage-options.component.scss']
})
export class EventCoverageOptionsComponent {
  private _eventType: string = '';
  @Input()
  set eventType(val: string) {
    this._eventType = val;
    this.updateGaranties();
  }
  get eventType() {
    return this._eventType;
  }

  private _role: string = '';
  @Input()
  set role(val: string) {
    this._role = val;
    this.updateGaranties();
  }
  get role() {
    return this._role;
  }

  isIaiModeAnnulation: boolean = false;

  allowedGaranties: string[] = [];

  isOnlyAnnulationAllowed(): boolean {
    return this.allowedGaranties.includes('Annulation');
  }


  GARANTIES_MAP: any = {
    training: {
      pilote: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      passager: ['Annulation', 'IA', 'PJ'],
      mecanicien: ['IA', 'PJ'],
      photographe: ['IA', 'PJ'] 
    },
    coaching: {
      pilote: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      passager: ['Annulation', 'IA', 'PJ'],
      mecanicien: ['IA', 'PJ'],
      photographe: ['IA', 'PJ']
    },
    stage: {
      pilote: ['IAI', 'IA', 'RC', 'PJ', 'Dommages'],
      passager: ['Annulation', 'IA', 'PJ'],
      mecanicien: ['IA', 'PJ'],
      photographe: ['IA', 'PJ']
    },
    competition: {
      pilote: ['Annulation', 'IA', 'RC', 'PJ', 'Dommages'],
      passager: ['IA', 'PJ'],
      mecanicien: ['IA', 'PJ'],
      photographe: ['IA', 'PJ']
    }
  };

  updateGaranties() {
    if (!this._eventType || !this._role) {
      this.allowedGaranties = [];
      return;
    }

    const mappedRole = this._role === 'photographe' ? 'photographe' : this._role;
    this.allowedGaranties = this.GARANTIES_MAP[this._eventType]?.[mappedRole] || [];

    if (this.allowedGaranties.includes('Annulation')) {
      this.allowedGaranties.push('IAI');
    }

    this.isIaiModeAnnulation = this.isOnlyAnnulationAllowed();

    if (this.form) {
      if (this.isIaiModeAnnulation) {
        this.form.get('intemperies')?.disable({ emitEvent: false });
        this.form.get('interruption')?.disable({ emitEvent: false });
      } else {
        this.form.get('intemperies')?.enable({ emitEvent: false });
        this.form.get('interruption')?.enable({ emitEvent: false });
      }
    }
  }

  readonly PRIME_RATES = {
    intemperies: 10,
    annulation: 9,
    interruption: 3,
    protectionPilote: 0,
    defenseRecours: 14,
    responsabiliteRecours: 14
  } as const;

  readonly PROTECTION_LEVELS: { [key: number]: ProtectionLevel } = {
    1: { death: 7600, disability: 18500, price: 15 },
    2: { death: 25000, disability: 37500, price: 38 },
    3: { death: 100000, disability: 150000, price: 60 },
    4: { death: 150000, disability: 200000, price: 85 },
    5: { death: 200000, disability: 300000, price: 120 }
  } as const;

  @Input() form!: FormGroup;

  activeSection: 'iai' | 'protectionPilote' | 'responsabiliteRecours' | null = null;
  validatedSections: { [key: string]: boolean } = {
    iai: false,
    protectionPilote: false,
    responsabiliteRecours: false
  };

  wasIAIValidated = false;
  wasProtectionPiloteValidated = false;
  wasResponsabiliteRecoursValidated = false;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
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

  getProtectionLevelPrice(level: number): number {
    return this.PROTECTION_LEVELS[level]?.price || 0;
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
    if (section === 'iai') {
      patchValues.iai = false;
      patchValues.intemperies = false;
      patchValues.annulation = false;
      patchValues.interruption = false;
      patchValues.inscriptionDate = '';
      patchValues.reservationAmount = '';
      this.wasIAIValidated = false;
    } else if (section === 'protectionPilote') {
      patchValues.protectionPilote = 0;
      this.wasProtectionPiloteValidated = false;
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
      this.activeSection = null;
      return;
    }

    this.validatedSections[section] = true;
    if (section === 'iai') this.wasIAIValidated = true;
    if (section === 'protectionPilote') this.wasProtectionPiloteValidated = true;
    if (section === 'responsabiliteRecours') this.wasResponsabiliteRecoursValidated = true;
    this.activeSection = null;
  }

  onCartClick(section: 'iai' | 'protectionPilote' | 'responsabiliteRecours'): void {
    if (this.activeSection === section) {
      this.activeSection = null;
      return;
    }

    this.activeSection = section;
    this.validatedSections[section] = false;

    if (section === 'iai') this.form.patchValue({ iai: true });
    if (section === 'responsabiliteRecours') this.form.patchValue({ responsabiliteRecours: true });
  }
}
