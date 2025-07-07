import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehicleService } from '../../services/vehicle.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-info',
  templateUrl: './vehicle-info.component.html',
  styleUrls: ['./vehicle-info.component.scss', '../../app.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatTooltipModule]
})
export class VehicleInfoComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup;
  @Output() vehicleAdded = new EventEmitter<any>();
  @Output() vehicleRemoved = new EventEmitter<any>();
  vehicles: any[] = [];
  @ViewChild('stepper') stepper!: MatStepper;
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService
  ) {}

  ngOnInit() {
    this.subscription = this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
    });
  }

  addVehicle() {
    if (this.form.valid) {
      const vehicle = {
        type: this.form.get('type')?.value,
        brand: this.form.get('brand')?.value,
        model: this.form.get('model')?.value,
        identificationNumber: this.form.get('identificationNumber')?.value,
        immatNumber: this.form.get('immatNumber')?.value,
        chassisNumber: this.form.get('chassisNumber')?.value,
        serieNumber: this.form.get('serieNumber')?.value,
        titreConduite: this.form.get('titreConduite')?.value,
        titreNumber: this.form.get('titreNumber')?.value
      };
      
      this.vehicleService.addVehicle(vehicle);
      this.vehicleAdded.emit(vehicle);
      
      this.form.reset();
      this.form.patchValue({
        identificationNumber: 'immat',
      });
    }
  }

  saveAndContinue() {
    if (this.form.valid) {
      this.addVehicle();
      this.stepper.next();
    }
  }

  removeVehicle(index: number) {
    const removedVehicle = this.vehicles[index];
    this.vehicleService.removeVehicle(index);
    this.vehicleRemoved.emit(removedVehicle);
  }

  onSaveVehicle() {
    const vehicle = this.form.value;
    this.vehicleAdded.emit(vehicle);
    this.resetFormAfterAdd();
  }

  resetFormAfterAdd() {
    this.form.reset();
    this.form.patchValue({
      identificationNumber: 'immat',
    });
  }

  resetForm() {
    this.form.reset();
    this.form.patchValue({
      identificationNumber: 'immat'
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
