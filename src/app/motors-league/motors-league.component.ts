import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
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
import { CoverageOptionsComponent } from '../steps/coverage-options/coverage-options.component';
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
import { Router } from '@angular/router';

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

@Component({
  standalone: true,
  selector: 'app-motors-league',
  imports: [MatStepperModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, PersonalInfoComponent, VehicleInfoComponent, CoverageOptionsComponent, PaymentComponent, CommonModule, RepresentativeLegalComponent, FormsModule, MatSelectModule, MatOptionModule],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss']
})
export class MotorsLeagueComponent implements OnInit, OnDestroy {
  public nationalities: string[] = [
    'Française','Allemande','Autrichienne','Belge','Britannique','Bulgare','Chypriote','Croate','Danoise','Espagnole','Estonienne','Finlandaise','Grecque','Hongroise','Irlandaise','Italienne','Lettonne','Lituanienne','Luxembourgeoise','Maltaise','Néerlandaise','Polonaise','Portugaise','Roumaine','Slovaque','Slovène','Suédoise','Suisse','Tchèque'
  ];
  @ViewChild(CoverageOptionsComponent) coverageOptions!: CoverageOptionsComponent;
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
  
  vehicles: any[] = [];
  acceptTerms: boolean = false;
  private subscription?: Subscription;
  private apiUrl: string;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private contractService: ContractService,
    private userService: UserService,
    private matSnackBar: MatSnackBar,
    private envService: EnvironmentService,
    private router: Router
  ) {
    this.apiUrl = this.envService.apiUrl;
    this.initializeForms();
  }

  ngOnInit() {
    this.subscription = this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.updateSummary();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

  private initializeForms() {
    this.summaryForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });
    this.personalForm = this.fb.group({
      civility: ['', Validators.required],
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: '',
      address: ['', Validators.required],
      addressComplement: '',
      postalCode: '',
      city: ['', Validators.required],
      birthdate: ['', Validators.required],
      nationality: '',
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
      titreConduite: ['', Validators.required],
      titreNumber: ['', Validators.required]
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

    this.coverageForm = new FormGroup({
      coverageLevel: new FormControl(null, [Validators.required])
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
        titreNumber: this.vehicleForm.get('titreNumber')?.value
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

    const formatISODate = (date: string): string => {
      if (!date) return '';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    };

    const contract: Contract = {
      selectedCircuit: 'France, Union Européenne',
      nbrjour: 0,
      datedebutroulage: formatISODate(new Date().toISOString()),
      codeProduit: ["354"],
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
        cacmPermisA: this.vehicleForm.get('cacmPermisA')?.value || 'NC',
        licencePermisA: this.vehicleForm.get('licencePermisA')?.value || 'NC',
        numeroPermisB: this.vehicleForm.get('numeroPermisB')?.value || 'NC',
        ffsaPermisB: this.vehicleForm.get('ffsaPermisB')?.value || 'NC',
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
        const orderId = response?.orderId;
        const email = this.personalForm.get('email')?.value;
        const paymentUrl = `${this.apiUrl}/paymentconfirm?orderid=${orderId}&email=${encodeURIComponent(email)}&language=fr`;

        window.location.href = paymentUrl;
      },
      error: (err) => {
        console.error('Erreur lors de la création du contrat', err);
      }
    });
  }
  
  goToNextStep(): void {
    if (this.isMinor()) {
      this.step2Page = 2;
    } else {
      this.stepper.next();
    }
  }

  sendVerificationEmail(): void {
    const email = this.RepresentativeLegalForm.get('representativeEmail')?.value;
    this.userService.sendVerificationEmail(email).subscribe({
      next: () => {
        this.stepper.next();
        this.matSnackBar.open('Code de verification envoyé, ce code devra etre renseigné à la dernière étape', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top'
        });
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
        this.stepper.next();
        this.matSnackBar.open('Code de verification validé', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top'
        });
      },
      error: (err) => {
        this.matSnackBar.open('Code de verification invalide', 'Fermer', {
          duration: 5000,
          verticalPosition: 'top'
        });
        console.error('Erreur lors de la validation du code de verification', err);
      }
    });
  }
} 