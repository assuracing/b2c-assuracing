import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../core/services/environment.service';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../services/toast.service';
import { NoGuaranteeDialogComponent } from './no-guarantee-dialog.component';
import { VehicleInfoComponent } from './steps/vehicle-info/vehicle-info.component';
import { PersonalInfoComponent } from './steps/personal-info/personal-info.component';
import { RepresentativeLegalComponent } from '../steps/representative-legal/representative-legal.component';
import { TrackdayComponent } from './steps/trackday/trackday.component';
import { PaymentComponent } from '../steps/payment/payment.component';
import { EventCoverageOptionsComponent } from "./steps/event-coverage-options/event-coverage-options.component";
import { VehicleService } from '../services/vehicle.service';
import { ContractService, PrixDTO } from '../services/contract.service';
import { UserService } from '../services/user.service';
import { AgeRestrictionDialogComponent } from '../shared/components/age-restriction-dialog/age-restriction-dialog.component';
import { DriveLicenseAgeRestrictionDialogComponent } from '../shared/drive-license-age-restriction.component';

interface Circuit {
  id: number;
  nom: string;
  adresseCircuit: string;
  responsablePiste: string;
  mailResponsablePiste: string;
  pays: string;
}

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
    login: string;
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

interface ContractResponse {
  transactionUID: string;
  detail?: string;
}

@Component({
  selector: 'app-event-coverage',
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSliderModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    VehicleInfoComponent,
    PersonalInfoComponent,
    RepresentativeLegalComponent,
    TrackdayComponent,
    PaymentComponent,
    EventCoverageOptionsComponent,
    MatSnackBarModule,
    MatCheckboxModule,
    MatStepperModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './event-coverage.component.html',
  styleUrls: ['./event-coverage.component.scss', '../motors-league/motors-league.component.scss']
})
export class EventCoverageComponent {
  public nationalities: string[] = [
  'Française',
  'Allemande',
  'Autrichienne',
  'Belge',
  'Britannique',
  'Bulgare',
  'Chypriote',
  'Croate',
  'Danoise',
  'Espagnole',
  'Estonienne',
  'Finlandaise',
  'Grecque',
  'Hongroise',
  'Irlandaise',
  'Italienne',
  'Lettonne',
  'Lituanienne',
  'Luxembourgeoise',
  'Maltaise',
  'Néerlandaise',
  'Polonaise',
  'Portugaise',
  'Roumaine',
  'Slovaque',
  'Slovène',
  'Suédoise',
  'Suisse',
  'Tchèque'
];
  private apiUrl: string;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private contractService: ContractService,
    private http: HttpClient,
    private userService: UserService,
    private toastService: ToastService,
    private dialog: MatDialog,
    private router: Router,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
    this.initializeForms();
    this.loadCircuits();
  }

  async onContinueGuaranteeStep(stepper: MatStepper) {
    const form = this.coverageOptionsForm;
    const hasGuarantee = form.get('intemperies')?.value || form.get('annulation')?.value || form.get('interruption')?.value || (form.get('protectionPilote')?.value > 0) || form.get('defenseRecours')?.value;
    
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
  @ViewChild(MatStepper) stepper!: MatStepper
  step2Page: number = 1
  sectionInProgress: boolean = false;
  trackdayForm!: FormGroup
  personalForm!: FormGroup
  RepresentativeLegalForm!: FormGroup
  paymentForm!: FormGroup
  vehicleForm!: FormGroup
  eventCoverageForm!: FormGroup
  coverageOptionsForm!: FormGroup
  summaryForm!: FormGroup
  vehicle: any = null
  acceptTerms: boolean = false
  isSubmitted: boolean = false
  isLoading: boolean = false
  error: string | null = null;
  subscriptions: Subscription[] = [];
  @ViewChild(VehicleInfoComponent) vehicleInfo!: VehicleInfoComponent;
  @ViewChild(EventCoverageOptionsComponent) eventCoverageOptions!: EventCoverageOptionsComponent;
  private vehicleData: any = null;

  circuits: Circuit[] = [];
  isLoadingCircuits = true;
  
  isCalculatingPrice = false;
  defenseRecoursPrice: number | null = null;
  annulationPrice: number | null = null;
  interruptionPrice: number | null = null;
  intemperiesPrice: number | null = null;
  priceCalculationError: string | null = null;
  priceDetails: (PrixDTO & { totalTTC: number }) | null = null;
  totalTTC: number = 0;

  private loadCircuits() {
    this.http.get<Circuit[]>(`${this.apiUrl}/api/circuits`).subscribe(
      (circuits) => {
        const filteredCircuits = circuits.filter(circuit => circuit.id !== 92);
        
        this.circuits = filteredCircuits.sort((a, b) => {
          const isAFrench = a.pays === 'FR' || a.pays === 'France';
          const isBFrench = b.pays === 'FR' || b.pays === 'France';
          
          if (isAFrench && !isBFrench) return -1;
          if (!isAFrench && isBFrench) return 1;
          
          return a.nom.localeCompare(b.nom);
        });
        this.isLoadingCircuits = false;
      },
      (error) => {
        console.error('Error loading circuits:', error);
        this.isLoadingCircuits = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForms() {

    this.summaryForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });

    this.trackdayForm = this.fb.group({
      eventType: [''],
      circuit: [''],
      organizer: [''],
      unreferencedOrganizer: [false],
      eventDate: [''],
      duration: [1, [Validators.min(1), Validators.max(5)]],
      role: [''],
      vehicleType: ['']
    });

    this.coverageOptionsForm = this.fb.group({
      iai: [false],
      inscriptionDate: [''],
      reservationAmount: ['', [Validators.min(0)]],
      intemperies: [false],
      annulation: [false],
      interruption: [false],
      protectionPilote: [0],
      responsabiliteRecours: [false],
      defenseRecours: [false]
    });

    this.coverageOptionsForm.valueChanges.subscribe(() => {
      const intemperiesPrime = this.coverageOptionsForm.get('intemperies')?.value ? 10 : 0;
      const annulationPrime = this.coverageOptionsForm.get('annulation')?.value ? 9 : 0;
      const interruptionPrime = this.coverageOptionsForm.get('interruption')?.value ? 3 : 0;
      const protectionPrime = this.coverageOptionsForm.get('protectionPilote')?.value ? 15 : 0;
      const defenseRecoursPrime = this.coverageOptionsForm.get('defenseRecours')?.value ? 14 : 0;
      const responsabiliteRecoursPrime = this.coverageOptionsForm.get('responsabiliteRecours')?.value ? 14 : 0;
      const totalPrime = intemperiesPrime + annulationPrime + interruptionPrime + protectionPrime + defenseRecoursPrime + responsabiliteRecoursPrime;
      this.coverageOptionsForm.patchValue({ totalPrime });
    });

    this.personalForm = this.fb.group({
      civility: [''],
      firstname: [''],
      lastname: [''],
      email: [''],
      phone: '',
      address: [''],
      addressComplement: '',
      postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{4,8}$')]],
      city: [''],
      birthdate: [''],
      nationality: '',
      country: 'France',
    });

    this.vehicleForm = this.fb.group({
      type: [''],
      brand: [''],
      model: [''],
      identificationNumber: [''],
      immatNumber: [''],
      hasCasm: [''],
      hasPermisB: [''],
      chassisNumber: [''],
      serieNumber: [''],
      titreConduite: ['', Validators.required],
      titreNumber: ['']
    });

    this.vehicleForm.get('hasCasm')?.valueChanges.subscribe(value => {
      if(value === 'Oui') {
        this.vehicleForm.get('titreConduite')?.clearValidators();
        this.vehicleForm.get('titreConduite')?.updateValueAndValidity();
        this.vehicleForm.get('titreNumber')?.setValidators([Validators.required]);
        this.vehicleForm.get('titreNumber')?.updateValueAndValidity();
      } else {
        this.vehicleForm.get('titreNumber')?.clearValidators();
        this.vehicleForm.get('titreNumber')?.setValue('');
        this.vehicleForm.get('titreNumber')?.updateValueAndValidity();
      }
    });

    this.vehicleForm.get('hasPermisB')?.valueChanges.subscribe(value => {
      if(value === 'Oui') {
        this.vehicleForm.get('titreConduite')?.clearValidators();
        this.vehicleForm.get('titreConduite')?.updateValueAndValidity();
        this.vehicleForm.get('titreNumber')?.setValidators([Validators.required]);
        this.vehicleForm.get('titreNumber')?.updateValueAndValidity();
      } else {
        this.vehicleForm.get('titreNumber')?.clearValidators();
        this.vehicleForm.get('titreNumber')?.setValue('');
        this.vehicleForm.get('titreNumber')?.updateValueAndValidity();
      }
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

    this.eventCoverageForm = this.fb.group({
      coverageLevel: ['']
    });

    this.RepresentativeLegalForm = this.fb.group({
      representativeLastname: [''],
      representativeFirstname: [''],
      representativeEmail: ['']
    });

    this.paymentForm = this.fb.group({
      cardNumber: [''],
      expiration: [''],
      cvc: ['']
    });
  }

  GARANTIE_CODES = {
    RC : 1,
    DEFENSE_RECOURS: 350,
    ANNULATION: 351,
    INTEMPERIES: 352,
    INTERRUPTION: 353,
    PROTECTION_1: 340,  
    PROTECTION_2: 341, 
    PROTECTION_3: 342, 
    PROTECTION_4: 343, 
    PROTECTION_5: 344, 
    PROTECTION_1_COMP: 345, 
    PROTECTION_2_COMP: 346, 
    PROTECTION_3_COMP: 347,
    PROTECTION_4_COMP: 348,  
    PROTECTION_5_COMP: 349
  };

  garantiePrices: { [key: string]: number } = {};

  calculateIAIPrices() {
    const amount = this.coverageOptionsForm.get('reservationAmount')?.value;
    if (amount && amount > 0) {
      ['INTEMPERIES', 'ANNULATION', 'INTERRUPTION'].forEach(garantie => {
        this.calculateGarantiePrice(this.GARANTIE_CODES[garantie as keyof typeof this.GARANTIE_CODES]);
      });
    } else {
      ['INTEMPERIES', 'ANNULATION', 'INTERRUPTION'].forEach(garantie => {
        delete this.garantiePrices[garantie];
      });
      this.garantiePrices = { ...this.garantiePrices }; 
    }
  }

  onSectionInProgress(isInProgress: boolean): void {
    this.sectionInProgress = isInProgress;
  }

  onStepChange(event: any) {
    if (event.selectedIndex === 2) {
      this.step2Page = 1;
    }
  }

  goToNextStep(): void {
    if (this.stepper && this.stepper.selectedIndex === 2) {

      const birthDate = this.personalForm?.get('birthdate')?.value;
      const trackdayForm = this.trackdayForm;
      
      if (birthDate && trackdayForm) {
        const age = this.calculateAge(new Date(birthDate));
        const role = trackdayForm.get('role')?.value;

        if (age < 16 && role) {
          this.dialog.open(AgeRestrictionDialogComponent, {
            width: '450px',
            disableClose: true,
            data: { role: role }
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

  goToSummaryFromVehicle(): void {
    const birthDate = this.personalForm?.get('birthdate')?.value;
    if(!birthDate) return;
    const age = this.calculateAge(new Date(birthDate));
    const driveLicenseType = this.vehicleForm.get('hasPermisB')?.value ? 'Permis B' : 'CASM';
    console.log("DriveLicenseType"  , driveLicenseType);
    console.log("Age", age);
    console.log("HasPermisB", this.vehicleForm.get('hasPermisB')?.value);
    console.log("HasCasm", this.vehicleForm.get('hasCasm')?.value);
    console.log("VehicleType", this.vehicleForm.get('type')?.value);
    if(age > 16 && age < 18 && driveLicenseType === 'CASM' && this.vehicleForm.get('type')?.value === 'moto' && this.vehicleForm.get('hasCasm')?.value === 'Non'){
      this.dialog.open(DriveLicenseAgeRestrictionDialogComponent, {
        width: '450px',
        disableClose: true,
        data: { driveLicenseType: driveLicenseType, ages: [16, 18] }
      });
      return;
    }
    else if(age > 19 && driveLicenseType === 'Permis B' && this.vehicleForm.get('type')?.value === 'auto' && this.vehicleForm.get('hasPermisB')?.value === 'Non'){
      this.dialog.open(DriveLicenseAgeRestrictionDialogComponent, {
        width: '450px',
        disableClose: true,
        data: { driveLicenseType: driveLicenseType, ages: [19] }
      });
      return;
    }
    else {
      this.stepper.next();
    }
  }

  goToCoverageChoicesStep(): void {
    ['RC', 'DEFENSE_RECOURS'].forEach((garantie: string) => {
      this.calculateGarantiePrice(this.GARANTIE_CODES[garantie as keyof typeof this.GARANTIE_CODES]);
    });
    
    if (this.eventCoverageOptions) {
      this.eventCoverageOptions.initializeProtectionPrices();
    }
    
    this.stepper.next();
  }

  goToEventOrMotorsLeaguePage(): void {
    this.router.navigate(['/guarantee-choice']);
  }

  isMinor(): boolean {
    const birthDate = this.personalForm.get('birthdate')?.value;
    if (!birthDate) return false;
    const age = this.calculateAge(birthDate);
    return age < 18;
  }

  formatVehicleType(type: string): string {
    const types: { [key: string]: string } = {
      'moto': 'Moto',
      'auto': 'Auto'
    };
    return types[type] || type;
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
        brand: this.vehicleForm.get('brand')?.value,
        model: this.vehicleForm.get('model')?.value,
        type: this.vehicleForm.get('type')?.value,
        identificationNumber: this.vehicleForm.get('identificationNumber')?.value,
        titreConduite: this.vehicleForm.get('titreConduite')?.value,
        titreNumber: this.vehicleForm.get('titreNumber')?.value
      },
      coverageInfo: {
        level: this.eventCoverageForm.get('coverageLevel')?.value
      },
      representativeInfo: this.isMinor() ? {
        representativeLastname: this.RepresentativeLegalForm?.get('representativeLastname')?.value,
        representativeFirstname: this.RepresentativeLegalForm?.get('representativeFirstname')?.value,
        representativeEmail: this.RepresentativeLegalForm?.get('representativeEmail')?.value
      } : null
    };
  }

  calculatePrice(): void {
    if (this.isCalculatingPrice) return;
    
    const trackdayData = this.trackdayForm.value;

    const vehicleData = this.vehicleForm.value;
    const coverageData = this.coverageOptionsForm.value;
    
    if (!trackdayData || !vehicleData || !coverageData) {
      this.priceCalculationError = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    
    this.isCalculatingPrice = true;
    this.priceCalculationError = null;
    
    const priceData = {
      selectedCircuit: trackdayData.circuit,
      nbrjour: trackdayData.duration,
      datedebutroulage: trackdayData.eventDate ? new Date(trackdayData.eventDate).toISOString() : null,
      annual: false,
      c: { id: null },
      codeProduit: this.getSelectedProducts(coverageData).map(Number),
      dateinscriptionRoulage: new Date().toISOString(),
      immatriculation: vehicleData.immatNumber || "",
      marque: vehicleData.brand || "",
      modele: vehicleData.model || "",
      montantganrantie: coverageData.protectionPilote || 0,
      param_n_chassis: vehicleData.chassisNumber || "",
      param_n_serie: vehicleData.serieNumber || "",
      typevehicule: trackdayData.vehicleType || "moto"
    };
    
    this.contractService.calculatePrice(priceData).subscribe({
      next: (response) => {
        const totalTTC = (response.prixProduitCompagnieTTC || 0) + 
                         (response.fraisDeCourtage || 0);
        
        this.priceDetails = {
          ...response,
          totalTTC: totalTTC
        };
        
        this.isCalculatingPrice = false;
        
      },
    });
  }
  
  private getSelectedProducts(coverageData: any): number[] {
    const products: number[] = [];
    
    if (coverageData.intemperies) products.push(this.GARANTIE_CODES.INTEMPERIES);
    if (coverageData.annulation) products.push(this.GARANTIE_CODES.ANNULATION);
    if (coverageData.interruption) products.push(this.GARANTIE_CODES.INTERRUPTION);
    if (coverageData.defenseRecours) products.push(this.GARANTIE_CODES.DEFENSE_RECOURS);
    
    const protectionLevel = coverageData.protectionPilote;
    if (protectionLevel && protectionLevel > 0) {
      const isCompetition = this.trackdayForm?.get('eventType')?.value === 'competition';
      const protectionCode = isCompetition
        ? this.GARANTIE_CODES[`PROTECTION_${protectionLevel}_COMP` as keyof typeof this.GARANTIE_CODES]
        : this.GARANTIE_CODES[`PROTECTION_${protectionLevel}` as keyof typeof this.GARANTIE_CODES];
      
      if (protectionCode) {
        products.push(protectionCode);
      }
    }
    
    return products;
  }

  onSubmit(): void {
    const forms = [this.personalForm, this.eventCoverageForm];
    
    if (this.trackdayForm.get('role')?.value === 'pilote') {
      forms.push(this.vehicleForm);
    }
    
    const allFormsValid = forms.every(form => form?.valid);
    
    if (!allFormsValid) {
      forms.forEach(form => form.markAllAsTouched());
      return;
    }
  
    const trackdayData = this.trackdayForm.value;
    const personalData = this.personalForm.value;
    const vehicleData = this.vehicleForm.value;
    const coverageData = this.coverageOptionsForm.value;
    
    const formatISODate = (date: string | Date): string => {
      if (!date) return '';
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const selectedCircuit = this.circuits.find(c => c.id === trackdayData.circuit)?.nom || trackdayData.circuit;
    
    const contract: Contract = {
      selectedCircuit: selectedCircuit,
      nbrjour: trackdayData.duration,
      datedebutroulage: formatISODate(trackdayData.eventDate),
      codeProduit: this.getSelectedProducts(coverageData),
      c: {
        adresse: personalData.address,
        complementadresse: personalData.addressComplement,
        civilite: personalData.civility,
        codepostal: personalData.postalCode,
        dateinscription: formatISODate(new Date().toISOString()),
        dateNaissance: formatISODate(personalData.birthdate),
        email: this.personalForm.get('email')?.value,
        login: this.personalForm.get('email')?.value,
        firstName: this.personalForm.get('firstname')?.value,
        lastName: this.personalForm.get('lastname')?.value,
        nom: this.personalForm.get('lastname')?.value,
        telPortable: this.personalForm.get('phone')?.value,
        ville: this.personalForm.get('city')?.value,
        numeroPermisA: vehicleData.numeroPermisA || '',
        cacmPermisA: vehicleData.cacmPermisA || '',
        licencePermisA: vehicleData.licencePermisA || '',
        numeroPermisB: vehicleData.numeroPermisB || '',
        ffsaPermisB: vehicleData.ffsaPermisB || '',
      },
      marque: vehicleData.brand || 'ND',
      modele: vehicleData.model || 'ND',
      typevehicule: this.trackdayForm.get('vehicleType')?.value || this.vehicleForm.get('type')?.value,
      immatriculation: vehicleData.immatNumber || 'ND',
      param_n_serie: vehicleData.serieNumber || 'ND',
      param_n_chassis: vehicleData.chassisNumber || 'ND',
      montantganrantie: coverageData.reservationAmount || 0,
      apporteurId: trackdayData.organizer,
      annual: false,
      clientEntId: 1,
      dateinscriptionRoulage: formatISODate(coverageData.eventDate),
      language: 'fr'
    };

    this.contractService.createContratB2C(contract).subscribe({

      next: (response) => {
        const orderId = response?.transactionUID;
        const email = this.personalForm.get('email')?.value;
        const paymentUrl = `${this.envService.appUrl}/payment-confirm?orderid=${orderId}&email=${encodeURIComponent(email)}&language=fr`;

        window.location.href = paymentUrl;
      },
      error: (err) => {
        console.error('Erreur lors de la création du contrat', err);
      }
    });
  }

  onOrganizerNameChange(organizerName: string): void {
    if (this.eventCoverageOptions) {
      this.eventCoverageOptions.checkProductsAvailability(organizerName);
    }
  }

  handleVehicleAdded(vehicle: any) {
    this.vehicle = vehicle;
    this.vehicleData = vehicle;
  }

  saveVehicle() {
    if (this.vehicleForm.valid) {
      const vehicle = {
        type: this.vehicleForm.get('type')?.value,
        brand: this.vehicleForm.get('brand')?.value,
        model: this.vehicleForm.get('model')?.value,
        identificationNumber: this.vehicleForm.get('identificationNumber')?.value,
        immatNumber: this.vehicleForm.get('immatNumber')?.value,
        chassisNumber: this.vehicleForm.get('chassisNumber')?.value,
        serieNumber: this.vehicleForm.get('serieNumber')?.value,
        titreConduite: this.vehicleForm.get('titreConduite')?.value,
        titreNumber: this.vehicleForm.get('titreNumber')?.value
      };
      
      this.vehicleInfo.onSaveVehicle();
      
      this.vehicleForm.reset();
      this.vehicleForm.patchValue({
        identificationNumber: 'immat',
      });
    }
  }

  formatCoverageSummary(): string {
    const coverageForm = this.coverageOptionsForm;
    const trackdayForm = this.trackdayForm;
    const selectedGuarantees: string[] = [];

    if (coverageForm.get('intemperies')?.value) {
      selectedGuarantees.push('Intempéries');
    }
    if (coverageForm.get('annulation')?.value) {
      selectedGuarantees.push('Annulation');
    }
    if (coverageForm.get('interruption')?.value) {
      selectedGuarantees.push('Interruption');
    }
    if (coverageForm.get('protectionPilote')?.value) {
      const level = coverageForm.get('protectionPilote')?.value;
      selectedGuarantees.push(`Protection du pilote niveau ${level}`);
    }
    if (coverageForm.get('defenseRecours')?.value) {
      selectedGuarantees.push('Défense Recours');
    }

    const eventDate = trackdayForm.get('eventDate')?.value;
    const duration = trackdayForm.get('duration')?.value;
    const circuit = this.trackdayForm.get('circuit')?.value || 'Circuit non spécifié';
    const totalPrime = this.eventCoverageOptions?.totalPrime || 0;

    const formattedDate = new Date(eventDate).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Vous avez sélectionné les garanties : <strong>${selectedGuarantees.join('</strong>, <strong>')}</strong>
    pour votre événement du ${formattedDate} de ${duration} jour(s) à : ${circuit}.
    La prime totale est de ${totalPrime} €`;
  }

  private calculateGarantiePrice(codeProduit: number): void {
    this.isCalculatingPrice = true;
      
    const priceData = {
      selectedCircuit: this.trackdayForm.get('circuit')?.value,
      nbrjour: this.trackdayForm.get('duration')?.value,
      datedebutroulage: this.trackdayForm.get('eventDate')?.value,
      annual: false,
      c: { id: null },
      codeProduit: [codeProduit],
      dateinscriptionRoulage: this.trackdayForm.get('inscriptionDate')?.value,
      immatriculation: "",
      marque: "",
      modele: "",
      montantganrantie: this.coverageOptionsForm.get('reservationAmount')?.value || 0,
      param_n_chassis: "",
      param_n_serie: "",
      typevehicule: this.trackdayForm.get('vehicleType')?.value || "moto"
    };
    
    const garantieKey = Object.entries(this.GARANTIE_CODES).find(
      ([key, value]) => value === codeProduit
    )?.[0];
    
    if (!garantieKey) {
      console.error('Code produit non trouvé dans GARANTIE_CODES:', codeProduit);
      this.isCalculatingPrice = false;
      return;
    }

    this.contractService.calculatePrice(priceData).subscribe({
      next: (response) => {
        const prix = response.prixProduitCompagnieTTC + response.fraisDeCourtage;
        
        this.garantiePrices[garantieKey] = prix;
        
        this.isCalculatingPrice = false;
      },
    });
  }

  sendVerificationEmail(): void {
    const email = this.RepresentativeLegalForm.get('representativeEmail')?.value;
    this.userService.sendVerificationEmail(email).subscribe({
      next: () => {
        this.stepper.next();
        this.toastService.info('Code de verification envoyé, ce code devra etre renseigné à la dernière étape');
      },
      error: (err) => {
        console.error('Erreur lors de l envoi du code de verification', err);
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
      error: (err) => {
        this.toastService.error('Code de verification invalide');
        console.error('Erreur lors de la validation du code de verification', err);
      }
    });
  }

  get isEventDateLessThan3Weeks(): boolean {
    const eventDateValue = this.trackdayForm.get('eventDate')?.value;
    if (!eventDateValue) return false;
    const eventDate = new Date(eventDateValue);
    const now = new Date();
    const diffInMs = eventDate.getTime() - now.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays < 21;
}
}