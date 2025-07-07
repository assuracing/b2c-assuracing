import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatStepper } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PersonalInfoComponent } from '../steps/personal-info/personal-info.component';
import { VehicleInfoComponent } from '../steps/vehicle-info/vehicle-info.component';
import { CoverageOptionsComponent } from '../steps/coverage-options/coverage-options.component';
import { PaymentComponent } from '../steps/payment/payment.component';
import { CommonModule } from '@angular/common';
import { RepresentativeLegalComponent } from "../steps/representative-legal/representative-legal.component";
import { VehicleService } from '../services/vehicle.service';
import { Subscription } from 'rxjs';
import { ContractService } from '../services/contract.service';

@Component({
  selector: 'app-motors-league',
  imports: [MatStepperModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatTooltipModule, MatCheckboxModule, PersonalInfoComponent, VehicleInfoComponent, CoverageOptionsComponent, PaymentComponent, CommonModule, RepresentativeLegalComponent],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss']
})
export class MotorsLeagueComponent implements OnInit, OnDestroy {
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

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private contractService: ContractService
  ) {
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

  formatNumber(value: number | null | undefined): string {
    if (value === undefined || value === null || typeof value !== 'number') return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  handleVehicleAdded(vehicle: any) {
    this.vehicleService.addVehicle(vehicle);
    console.log('Véhicule ajouté:', vehicle);
  }

  onVehicleAdded(vehicle: any) {
    // Cette méthode n'est plus utilisée
    console.log('Véhicule ajouté:', vehicle);
  }

  onVehicleRemoved(vehicle: any) {
    const index = this.vehicles.findIndex(v => v.immatNumber === vehicle.immatNumber);
    if (index > -1) {
      this.vehicleService.removeVehicle(index);
      console.log('Véhicule supprimé:', vehicle);
    }
  }

  updateSummary() {
    // Mettre à jour le résumé avec la liste des véhicules
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
      country: ''
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

  isMinor(): boolean {
  const birthdate = this.personalForm.get('birthdate')?.value;
  if (!birthdate) return false;

  const today = new Date();
  const birth = new Date(birthdate);
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return (age - 1) < 18;
  }

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
    return this.coverageOptions.coverageAmounts[level];
  }

  getLevelPrice(level: number | null): number | undefined {
    if (!level || !this.coverageOptions) return undefined;
    return this.coverageOptions.levelPrices[level];
  }

  onSubmit(): void {
    const forms = [this.personalForm, this.vehicleForm, this.coverageForm];
    const allFormsValid = forms.every(form => form?.valid);
  
    if (!allFormsValid) {
      console.log('Form is invalid');
      forms.forEach(form => form.markAllAsTouched());
      return;
    }
  
    const contractData = {
      personalInfo: this.personalForm.value,
      vehicleInfo: this.vehicleForm.value,
      coverageInfo: this.coverageForm.value,
      representativeInfo: this.isMinor() ? this.RepresentativeLegalForm.value : null
    };
  
    this.contractService.createContratB2C(contractData).subscribe({
      next: (response) => {
        const orderId = response?.orderId;
        const email = this.personalForm.get('email')?.value;
        const paymentUrl = `http://localhost:8080/paymentconfirm?orderid=${orderId}&email=${encodeURIComponent(email)}&language=fr`;
  
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
}