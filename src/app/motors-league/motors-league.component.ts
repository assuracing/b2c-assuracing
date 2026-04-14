import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EnvironmentService } from '../core/services/environment.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PersonalInfoComponent } from '../event-coverage/steps/personal-info/personal-info.component';
import { VehicleInfoComponent } from '../steps/vehicle-info/vehicle-info.component';
import { MotorsLeagueCoverageOptionsComponent } from './motors-league-coverage-options/motors-league-coverage-options.component';
import { PaymentComponent } from '../steps/payment/payment.component';
import { CommonModule } from '@angular/common';
import { RepresentativeLegalComponent } from "../steps/representative-legal/representative-legal.component";
import { VehicleService } from '../services/vehicle.service';
import { Subscription } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AgeRestrictionDialogComponent } from '../shared/components/age-restriction-dialog/age-restriction-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../services/toast.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { AdaptiveTooltipComponent } from "../adaptive-tooltip/adaptive-tooltip.component";

import { NoGuaranteeDialogComponent } from '../event-coverage/no-guarantee-dialog.component';

interface Contract {
  selectedCircuit: string;
  nbrjour: number;
  datedebutroulage: string;
  codeProduit: number[];
  c: {  
    adresse: string;
    complementadresse: string;
    civilite: string;
    codepostal: string;
    dateinscription : string;
    dateNaissance: string;
    email: string;
    firstName: string;
    lastName: string;
    nom: string;
    telPortable: string;
    ville: string;
    numeroPermisA: string;
    cacmPermisA: string;
    licencePermisA: string;
    numeroPermisB: string;
    ffsaPermisB: string;
    nationalite: string;
  };
  marque: string;
  modele: string;
  typevehicule: string;
  immatriculation: string;
  param_n_serie: string;
  param_n_chassis: string;
  montantganrantie: number;
  apporteurId: number;
  annual: boolean;
  clientEntId: number;
  dateinscriptionRoulage: string;
  language: string;
}

@Component({
  standalone: true,
  selector: 'app-motors-league',
  imports: [MatStepperModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, PersonalInfoComponent, VehicleInfoComponent, MotorsLeagueCoverageOptionsComponent, PaymentComponent, CommonModule, RepresentativeLegalComponent, FormsModule, MatSelectModule, MatOptionModule],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss', '../app.component.scss', '../app-second.component.scss']
})
export class MotorsLeagueComponent implements OnInit, OnDestroy {
  public nationalities: string[] = [
    'Française','Allemande','Autrichienne','Belge','Britannique','Bulgare','Chypriote','Croate','Danoise','Espagnole','Estonienne','Finlandaise','Grecque','Hongroise','Irlandaise','Italienne','Lettonne','Lituanienne','Luxembourgeoise','Maltaise','Néerlandaise','Polonaise','Portugaise','Roumaine','Slovaque','Slovène','Suédoise','Suisse','Tchèque'
  ];
  @ViewChild(MotorsLeagueCoverageOptionsComponent) coverageOptions!: MotorsLeagueCoverageOptionsComponent;
  @ViewChild(VehicleInfoComponent) vehicleInfo!: VehicleInfoComponent;
  @ViewChild(MatStepper) stepper!: MatStepper;

  personalForm!: FormGroup;
  vehicleForm!: FormGroup;
  coverageForm!: FormGroup;
  paymentForm!: FormGroup;
  RepresentativeLegalForm! : FormGroup;
  summaryForm!: FormGroup;
  step1Page: number = 1;
  step2Page: number = 1;
  sectionInProgress: boolean = false;
  
  vehicles: any[] = [];
  vehicleTypes = [
    { value: 'auto', label: 'Auto', icon: 'directions_car' },
    { value: 'moto', label: 'Moto', icon: 'two_wheeler' }
  ];
  acceptTerms: boolean = false;
  private subscription?: Subscription;
  private apiUrl: string;
  labelPosition: 'end' | 'bottom' = 'end';
  vehicleType: 'auto' | 'moto' | '' = '';
  userAge: number = 0;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private contractService: ContractService,
    private userService: UserService,
    private matSnackBar: MatSnackBar,
    private envService: EnvironmentService,
    private router: Router,
    private dialog: MatDialog,
    private toastService: ToastService,
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute
  ) {
    this.apiUrl = this.envService.apiUrl;
    this.initializeForms();
    this.breakpointObserver.observe(['(max-width: 785px)']).subscribe(result => {
      this.labelPosition = result.matches ? 'bottom' : 'end';
    });
  }

  ngOnInit() {
    this.subscription = this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.updateSummary();
    });

    this.initializeBirthdateSubscription();
    
    this.route.queryParams.subscribe((params: any) => {
      if (params['page'] === '2') {
        this.step1Page = 2;
      }
    });

    this.vehicleForm.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.vehicleType = type;
        if (this.coverageOptions) {
          this.coverageOptions.initializeProtectionPrices();
        }
      }
    });

    this.personalForm.get('country')?.valueChanges.subscribe((country: string) => {
      const postalCodeControl = this.personalForm.get('postalCode');
      if (!postalCodeControl) return;
      if (country === 'France') {
        postalCodeControl.setValidators([Validators.required, Validators.pattern('^[0-9]{5}$')]);
      } else {
        postalCodeControl.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9]{4,8}$')]);
      }
      postalCodeControl.updateValueAndValidity();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSectionInProgress(isInProgress: boolean): void {
    this.sectionInProgress = isInProgress;
  }

  async onContinueGuaranteeStep(stepper: MatStepper) {
    const form = this.coverageForm;
    const hasGuarantee = (form.get('protectionPilote')?.value > 0) || form.get('defenseRecours')?.value || form.get('responsabiliteCivile')?.value;
    
    if (!hasGuarantee) {
      const dialogRef = this.dialog.open(NoGuaranteeDialogComponent, {
        width: '400px',
        disableClose: true
      });
      const result = await dialogRef.afterClosed().toPromise();
      if (result) {
        this.router.navigate(['/']);
      }
      return;
    }
    stepper.next();
  }

  onVehicleTypeChange(type: 'auto' | 'moto'): void {
    this.vehicleType = type;
    this.vehicleForm?.get('type')?.setValue(type);
  }

  getVehicleIcon(type: string): string {
    const vt = this.vehicleTypes.find(v => v.value === type);
    return vt ? vt.icon : '';
  }

  getVehicleLabel(type: string): string {
    const vt = this.vehicleTypes.find(v => v.value === type);
    return vt ? vt.label : 'Sélectionnez un véhicule';
  }

  goToYearlyGuarantee(): void {
    this.router.navigate(['/yearly-guarantee']);
  }
  
  formatNumber(value: number | null | undefined): string {
    if (value === undefined || value === null || typeof value !== 'number') return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  formatPermisType(type: string): string {
    const types: { [key: string]: string } = {
      'permis_a': 'Permis A',
      'permis_b': 'Permis B',
      'casm': 'CASM',
      'licence_ffsa': 'Licence FFSA'
    };
    return types[type] || type;
  }

  handleVehicleAdded(vehicle: any) {
    this.vehicleService.addVehicle(vehicle);
  }

  onVehicleRemoved(vehicle: any) {
    const index = this.vehicles.findIndex(v => v.immatNumber === vehicle.immatNumber);
    if (index > -1) {
      this.vehicleService.removeVehicle(index);
    }
  }

  updateSummary() {
    this.summaryForm.patchValue({
      vehicles: this.vehicles
    });
  }

  private initializeBirthdateSubscription() {
    if (this.personalForm) {
      const birthdateControl = this.personalForm.get('birthdate');
      if (birthdateControl) {
        birthdateControl.valueChanges.subscribe(birthDate => {
          if (birthDate) {
            this.userAge = this.calculateAge(new Date(birthDate));
          }
        });
      }
    }
  }

  private initializeForms() {
    this.summaryForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });
    this.personalForm = this.fb.group({
      civility: ['' , Validators.required],
      firstname: ['', [ Validators.required, Validators.minLength(2)]],
      lastname: ['', [ Validators.required, Validators.minLength(2)]],
      email: ['', [ Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['' , Validators.required],
      addressComplement: '',
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      birthdate: ['' , Validators.required],
      nationality: ['' , Validators.required],
      country: 'France'
    });

    this.vehicleForm = this.fb.group({
      type: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      identificationNumber: ['', Validators.required],
      immatNumber: ['', Validators.required],
      chassisNumber: ['', Validators.required],
      serieNumber: ['', Validators.required],
      titreConduite: [''],
      hasCasm: [''],
      hasPermisB: ['']
    });

    this.vehicleForm.get('immatNumber')?.disable();
    this.vehicleForm.get('chassisNumber')?.disable();
    this.vehicleForm.get('serieNumber')?.disable();
    this.vehicleForm.get('identificationNumber')?.valueChanges.subscribe(value => {
      this.vehicleForm.get('immatNumber')?.disable();
      this.vehicleForm.get('chassisNumber')?.disable();
      this.vehicleForm.get('serieNumber')?.disable();

      switch(value) {
        case 'immat':
          this.vehicleForm.get('immatNumber')?.enable();
          break;
        case 'chassis':
          this.vehicleForm.get('chassisNumber')?.enable();
          break;
        case 'serie':
          this.vehicleForm.get('serieNumber')?.enable();
          break;
      }
    });

    this.vehicleForm.get('hasCasm')?.valueChanges.subscribe(value => {
      if (value === 'Oui') {
        this.vehicleForm.get('titreConduite')?.clearValidators();
        this.vehicleForm.get('titreConduite')?.updateValueAndValidity();
      }
    });

    this.vehicleForm.get('hasPermisB')?.valueChanges.subscribe(value => {
      if (value === 'Oui') {
        this.vehicleForm.get('titreConduite')?.clearValidators();
        this.vehicleForm.get('titreConduite')?.updateValueAndValidity();
      }
    });

    this.coverageForm = new FormGroup({
    });

    this.RepresentativeLegalForm = this.fb.group({
      representativeLastname: ['', Validators.required],
      representativeFirstname: ['', Validators.required],
      representativeEmail: ['', [Validators.required, Validators.email]]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', Validators.required],
      expiration: ['', Validators.required],
      cvc: ['', Validators.required]
    });
  }

  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  isMinor(): boolean {
    const birthDate = this.personalForm.get('birthdate')?.value;
    if (!birthDate) return false;
    const age = this.calculateAge(birthDate);
    return age < 18;
  }

  isBetween16And18(): boolean {
    const birthDate = this.personalForm.get('birthdate')?.value;
    if (!birthDate) return false;
    const age = this.calculateAge(birthDate);
    return age >= 16 && age < 18;
  }

  getSummaryData(): any {
    return {
      personalInfo: {
        civility: this.personalForm.get('civility')?.value,
        firstName: this.personalForm.get('firstname')?.value,
        lastName: this.personalForm.get('lastname')?.value,
        address: this.personalForm.get('address')?.value,
        nationality: this.personalForm.get('nationality')?.value,
        email: this.personalForm.get('email')?.value,
        phone: this.personalForm.get('phone')?.value
      },
      vehicleInfo: {
        type: this.vehicleForm.get('type')?.value,
        identificationNumber: this.vehicleForm.get('identificationNumber')?.value,
        titreConduite: this.vehicleForm.get('titreConduite')?.value,
      },
      coverageInfo: {
        level: this.coverageForm.get('coverageLevel')?.value
      },
      representativeInfo: this.isMinor() ? {
        representativeLastname: this.RepresentativeLegalForm?.get('representativeLastname')?.value,
        representativeFirstname: this.RepresentativeLegalForm?.get('representativeFirstname')?.value,
        representativeEmail: this.RepresentativeLegalForm?.get('representativeEmail')?.value
      } : null
    };
  }

  getCoverageAmounts(level: number | null): { death: number; disability: number } | undefined {
    if (!level || !this.coverageOptions) return undefined;
    const levelData = this.coverageOptions.PROTECTION_LEVELS[level];
    if (!levelData) return undefined;
    return { death: levelData.death, disability: levelData.disability };
  }

  getLevelPrice(level: number | null): number | undefined {
    if (!level || !this.coverageOptions) return undefined;
    const levelData = this.coverageOptions.PROTECTION_LEVELS[level];
    return levelData ? levelData.price : undefined;
  }

  getTotalPrime(): number {
    if (this.coverageOptions && this.coverageOptions.totalPrime) {
      return this.coverageOptions.totalPrime;
    }
    
    const defenseRecours = this.coverageForm.get('defenseRecours')?.value;
    const responsabiliteCivile = this.coverageForm.get('responsabiliteCivile')?.value;
    const protectionPilote = this.coverageForm.get('protectionPilote')?.value;
    
    let total = 0;
    if (protectionPilote) {
      total += this.getLevelPrice(protectionPilote) || 0;
    }
    if (defenseRecours && this.coverageOptions) {
      total += this.coverageOptions.PRIME_RATES.defenseRecours;
    } else if (defenseRecours) {
      total += 14; 
    }
    
    if (responsabiliteCivile && this.coverageOptions) {
      total += this.coverageOptions.PRIME_RATES.responsabiliteCivile;
    } else if (responsabiliteCivile) {
      total += 14;
    }
    
    return total;
  }

  onSubmit(): void {
    const forms = [this.personalForm, this.vehicleForm, this.coverageForm];
    const allFormsValid = forms.every(form => form?.valid);

    if (this.isMinor()) {
      if (!this.summaryForm.valid) {
        this.summaryForm.markAllAsTouched();
        return;
      }
    }

    if (!allFormsValid) {
      forms.forEach(form => form.markAllAsTouched());
      return;
    }

    const formatISODate = (date: string | Date): string => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const levelToProductCode: { [key: number]: number } = {
      1: 354,
      2: 355,
      3: 356,
      4: 357,
      5: 358
    };

    const selectedLevel = this.coverageForm?.get('protectionPilote')?.value;
    const rcAnnuelle = this.coverageForm?.get('responsabiliteCivile')?.value;
    const defenseRecours = this.coverageForm?.get('defenseRecours')?.value;

    const productCodes: number[] = [];

    if (selectedLevel) {
      if (levelToProductCode[selectedLevel]) {
         productCodes.push(levelToProductCode[selectedLevel]);
      }
    }

    if (rcAnnuelle) {
      productCodes.push(83);
    }

    if (defenseRecours) {
      productCodes.push(398);
    }

    if (productCodes.length === 0) {
      this.toastService.error('Aucune garantie valide sélectionnée. Veuillez sélectionner au moins une garantie.');
      return;
    }

    const contract: Contract = {
      selectedCircuit: 'France, Union Européenne',
      nbrjour: 0,
      datedebutroulage: formatISODate(new Date().toISOString()),
      codeProduit: productCodes,
      c: {
        adresse: this.personalForm.get('address')?.value,
        complementadresse: this.personalForm.get('addressComplement')?.value,
        civilite: this.personalForm.get('civility')?.value,
        codepostal: this.personalForm.get('postalCode')?.value,
        dateinscription: formatISODate(new Date().toISOString()),
        dateNaissance: formatISODate(this.personalForm.get('birthdate')?.value),
        email: this.personalForm.get('email')?.value,
        firstName: this.personalForm.get('firstname')?.value,
        lastName: this.personalForm.get('lastname')?.value,
        nom: this.personalForm.get('lastname')?.value,
        telPortable: this.personalForm.get('phone')?.value,
        ville: this.personalForm.get('city')?.value,
        numeroPermisA: this.vehicleForm.get('numeroPermisA')?.value || 'NC',
        cacmPermisA: this.vehicleForm.get('hasCasm')?.value === 'Oui' || this.vehicleForm.get('titreConduite')?.value === 'casm' ? 'Oui' : 'NC',
        licencePermisA: this.vehicleForm.get('type')?.value === 'moto' && this.vehicleForm.get('titreConduite')?.value === 'permis_a' ? 'Oui' : 'NC',
        numeroPermisB: this.vehicleForm.get('numeroPermisB')?.value || 'NC',
        ffsaPermisB: this.vehicleForm.get('hasPermisB')?.value === 'Oui' ? 'Oui' : 'NC',
        nationalite: this.personalForm.get('nationality')?.value,
      },
      marque: this.vehicleForm.get('brand')?.value || 'NC',
      modele: this.vehicleForm.get('model')?.value || 'NC',
      typevehicule: this.vehicleForm.get('type')?.value,
      immatriculation: this.vehicleForm.get('immatNumber')?.value || 'NC',
      param_n_serie: this.vehicleForm.get('serieNumber')?.value || 'NC',
      param_n_chassis: this.vehicleForm.get('chassisNumber')?.value || 'NC',
      montantganrantie: 0,
      apporteurId: 5, 
      annual: true,
      clientEntId: 1,
      dateinscriptionRoulage: formatISODate(new Date().toISOString()),
      language: 'fr'
    };

    this.contractService.createContratB2C(contract).subscribe({
      next: (response) => {
        const orderId = response?.transactionUID;
        const email = this.personalForm.get('email')?.value;

        if (!orderId) {
          this.toastService.error('Identifiant de transaction manquant. Veuillez réessayer.');
          return;
        }

        const paymentUrl = `${this.envService.appUrl}/payment-confirm?orderid=${orderId}&email=${encodeURIComponent(email)}&language=fr`;

        window.location.href = paymentUrl;
      },
      error: (_err) => {
      }
    });
  }

  onStepChange(event: any) {
    if (event.selectedIndex === 1) {
      this.step2Page = 1;
    }
  }
  
  goToNextStep(): void {
    if (this.stepper && this.stepper.selectedIndex === 2) {
      const birthDate = this.personalForm?.get('birthdate')?.value;
      
      if (birthDate) {
        const age = this.calculateAge(new Date(birthDate));

        if(this.isBetween16And18()) {
          this.step2Page = 2;
          return;
        }

        if (age < 16) {
          this.dialog.open(AgeRestrictionDialogComponent, {
            width: '450px',
            disableClose: true,
            data: { role: '' }
          });
          return;
        }
        else if(age >= 16 && age < 18){
          this.step2Page = 2;
          return;
        }
        else {
          this.stepper.next();
        }
      }
    }
  }

  sendVerificationEmail(): void {
    const email = this.RepresentativeLegalForm.get('representativeEmail')?.value;
    this.userService.sendVerificationEmail(email).subscribe({
      next: () => {
        this.stepper.next();
        this.toastService.success('Code de verification envoyé, ce code devra etre renseigné à la dernière étape');
      },
      error: (_err) => {
        this.toastService.error('Erreur lors de l envoi du code de verification');
      }
    });
  }

  verifyCode(): void {
    const email = this.RepresentativeLegalForm.get('representativeEmail')?.value;
    const code = this.summaryForm.get('verificationCode')?.value;
    this.userService.verifyCode(email, code).subscribe({
      next: () => {
        this.toastService.success('Code de verification validé');
        this.onSubmit();
      },
      error: (_err) => {
        this.toastService.error('Code de verification invalide');
      }
    });
  }
}