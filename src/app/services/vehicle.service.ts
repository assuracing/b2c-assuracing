import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehiclesSubject = new BehaviorSubject<any[]>([]);
  private vehicles: any[] = [];

  constructor() {}

  addVehicle(vehicle: any) {
    this.vehicles.push(vehicle);
    this.vehiclesSubject.next([...this.vehicles]);
  }

  removeVehicle(index: number) {
    this.vehicles.splice(index, 1);
    this.vehiclesSubject.next([...this.vehicles]);
  }

  getVehicles() {
    return this.vehiclesSubject.asObservable();
  }

  getVehiclesArray() {
    return [...this.vehicles];
  }

  clearVehicles() {
    this.vehicles = [];
    this.vehiclesSubject.next([]);
  }
}
