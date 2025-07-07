import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NoGuaranteeDialogComponent } from './no-guarantee-dialog.component';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VehicleInfoComponent } from './steps/vehicle-info/vehicle-info.component';
import { PersonalInfoComponent } from './steps/personal-info/personal-info.component';
import { RepresentativeLegalComponent } from '../steps/representative-legal/representative-legal.component';
import { VehicleService } from '../services/vehicle.service';
import { TrackdayComponent } from './steps/trackday/trackday.component';
import { Subscription } from 'rxjs';
import { ContractService } from '../services/contract.service';
import { PaymentComponent } from '../steps/payment/payment.component';
import { MatStepper } from '@angular/material/stepper';
import { EventCoverageOptionsComponent } from "./steps/event-coverage-options/event-coverage-options.component";
import { HttpClient } from '@angular/common/http';

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
  codeProduit: string[];
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
],
  templateUrl: './event-coverage.component.html',
  styleUrls: ['./event-coverage.component.scss', '../motors-league/motors-league.component.scss']
})
export class EventCoverageComponent {
  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private contractService: ContractService,
    private http: HttpClient,
    private dialog: MatDialog,
    private router: Router
  ) {
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
  error: string | null = null
  subscriptions: Subscription[] = [];
  @ViewChild(VehicleInfoComponent) vehicleInfo!: VehicleInfoComponent;
  private vehicleData: any = null;

  circuits: Circuit[] = [];
  isLoadingCircuits = true;

  private loadCircuits() {
    this.http.get<Circuit[]>('http://localhost:8080/api/circuits').subscribe(
      (circuits) => {
        this.circuits = circuits;
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

    this.trackdayForm.get('unreferencedOrganizer')?.valueChanges.subscribe((value) => {
      if (value) {
        this.trackdayForm.get('organizer')?.reset();
      }
    });

    this.trackdayForm.get('organizer')?.valueChanges.subscribe((value) => {
      if (value && this.trackdayForm.get('unreferencedOrganizer')?.value) {
        this.trackdayForm.get('unreferencedOrganizer')?.setValue(false);
      }
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
      postalCode: '',
      city: [''],
      birthdate: [''],
      nationality: '',
      country: ''
    });

    this.vehicleForm = this.fb.group({
      type: [''],
      brand: [''],
      model: [''],
      identificationNumber: [''],
      immatNumber: [''],
      chassisNumber: [''],
      serieNumber: [''],
      titreConduite: [''],
      titreNumber: ['']
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

    this.summaryForm = this.fb.group({
    });
  }

  isMinor(): boolean {
    const birthDate = this.personalForm.get('birthdate')?.value;
    if (!birthDate) return false;
    const age = this.calculateAge(birthDate);
    return age < 18;
  }

  formatVehicleType(type: string): string {
    const types: { [key: string]: string } = {
      'moto': 'MOTO',
      'auto': 'AUTO'
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

  onSubmit(): void {
    const forms = [this.personalForm, this.vehicleForm, this.eventCoverageForm];
    const allFormsValid = forms.every(form => form?.valid);
  
    if (!allFormsValid) {
      console.log('Form is invalid');
      forms.forEach(form => form.markAllAsTouched());
      return;
    }
  
    const trackdayData = this.trackdayForm.value;
    const personalData = this.personalForm.value;
    const vehicleData = this.vehicleForm.value;
    const coverageData = this.coverageOptionsForm.value;

    console.log("trackdayData", trackdayData);
    console.log("personalData", personalData);
    console.log("vehicleData", vehicleData);
    console.log("coverageData", coverageData);

    console.log("trackday role", trackdayData.role);
    
    const formatISODate = (date: string): string => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };

    const selectedCircuit = this.circuits.find(c => c.id === trackdayData.circuit)?.nom || trackdayData.circuit;
    
    const contract: Contract = {
      selectedCircuit: selectedCircuit,
      nbrjour: trackdayData.duration,
      datedebutroulage: formatISODate(trackdayData.eventDate),
      codeProduit: ['CODE_TEST'],
      c: {
        adresse: personalData.address,
        complementadresse: personalData.addressComplement,
        civilite: personalData.civility,
        codepostal: personalData.postalCode,
        dateinscription: formatISODate(new Date().toISOString()),
        dateNaissance: formatISODate(personalData.birthdate),
        email: personalData.email,
        firstName: personalData.firstname,
        lastName: personalData.lastname,
        nom: personalData.lastname,
        telPortable: personalData.phone,
        ville: personalData.city,
        numeroPermisA: vehicleData.numeroPermisA || '',
        cacmPermisA: vehicleData.cacmPermisA || '',
        licencePermisA: vehicleData.licencePermisA || '',
        numeroPermisB: vehicleData.numeroPermisB || '',
        ffsaPermisB: vehicleData.ffsaPermisB || '',
      },
      marque: vehicleData.brand,
      modele: vehicleData.model,
      typevehicule: vehicleData.type,
      immatriculation: vehicleData.immatNumber,
      param_n_serie: vehicleData.serieNumber || '',
      param_n_chassis: vehicleData.chassisNumber || '',
      montantganrantie: coverageData.protectionPilote,
      apporteurId: 1,
      annual: false,
      clientEntId: trackdayData.organizer,
      dateinscriptionRoulage: formatISODate(coverageData.eventDate),
      language: 'fr'
    };

    this.contractService.createContratB2C(contract).subscribe({
      next: (response) => {
        const orderId = response?.transactionUID;
        const email = this.personalForm.get('email')?.value;
        const paymentUrl = `http://localhost:4200/payment-confirm?orderid=${orderId}&email=${encodeURIComponent(email)}&language=fr`;
  
        window.location.href = paymentUrl;
      },
      error: (err) => {
        console.error('Erreur lors de la création du contrat', err);
      }
    });
  }

  handleVehicleAdded(vehicle: any) {
    this.vehicle = vehicle;
    this.vehicleData = vehicle;
    console.log('Véhicule ajouté:', vehicle);
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
    const PRIME_RATES = {
      intemperies: 10,
      annulation: 9,
      interruption: 3,
      defenseRecours: 14,
    } as const;

    type ProtectionLevel = 1 | 2 | 3 | 4 | 5;

    const getProtectionLevelPrice = (level: ProtectionLevel): number => {
      const PROTECTION_LEVELS: Record<ProtectionLevel, number> = {
        1: 15,
        2: 38,
        3: 60,
        4: 85,
        5: 120
      };
      return PROTECTION_LEVELS[level] || 0;
    };

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
    const circuitId = trackdayForm.get('circuit')?.value;
    const circuit = this.circuits.find(c => c.id === circuitId)?.nom || 'Circuit non spécifié';
    const intemperiesPrime = coverageForm.get('intemperies')?.value ? PRIME_RATES.intemperies : 0;
    const annulationPrime = coverageForm.get('annulation')?.value ? PRIME_RATES.annulation : 0;
    const interruptionPrime = coverageForm.get('interruption')?.value ? PRIME_RATES.interruption : 0;
    const defenseRecoursPrime = coverageForm.get('defenseRecours')?.value ? PRIME_RATES.defenseRecours : 0;
    const protectionPrime = coverageForm.get('protectionPilote')?.value ? getProtectionLevelPrice(coverageForm.get('protectionPilote')?.value as ProtectionLevel) : 0;
    const totalPrime = intemperiesPrime + annulationPrime + interruptionPrime + protectionPrime + defenseRecoursPrime;

    const formattedDate = new Date(eventDate).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Vous avez sélectionné les garanties : ${selectedGuarantees.join(', et ')}
    pour votre événement du ${formattedDate} de ${duration} jour(s) à : ${circuit}.
    La prime totale est de ${totalPrime} €`;
  }
}
