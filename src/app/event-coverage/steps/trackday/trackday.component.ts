import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatNativeDateModule, DateAdapter } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Observable, of } from 'rxjs';
import { CountryFlagService } from '../../../services/country-flag.service';
import { TranslateService } from '@ngx-translate/core';
import { DateLocaleService, provideMomentDatepicker } from '../../../core/services/date-locale.service';

interface Circuit {
  id: number;
  nom: string;
  adresseCircuit: string;
  responsablePiste: string;
  mailResponsablePiste: string;
  pays: string;
}

interface Organizer {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
}

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trackday',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSliderModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './trackday.component.html',
  styleUrls: ['./trackday.component.scss', '../../../app.component.scss'],
  providers: [...provideMomentDatepicker()]
})
export class TrackdayComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() set circuits(value: Circuit[]) {
    this._allCircuits = [...value];
    this.filteredCircuits = of(value);
  }
  get circuits(): Circuit[] {
    return this._allCircuits;
  }
  
  @Input() isLoadingCircuits: boolean = true;
  @Output() organizerNameChange = new EventEmitter<string>();
  
  private _allCircuits: Circuit[] = [];
  private _allOrganizers: Organizer[] = [];
  organizers: Organizer[] = [];
  isLoadingOrganizers = true;
  today = new Date();
  unreferencedOrganizer: any = null;
  filteredCircuits: Observable<Circuit[]> = of([]);
  filteredOrganizers: Observable<Organizer[]> = of([]);
  selectedCircuit: Circuit | null = null;
  
  private apiUrl: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private envService: EnvironmentService,
    public countryFlagService: CountryFlagService,
    private translate: TranslateService,
    private dateLocaleService: DateLocaleService,
    private dateAdapter: DateAdapter<any>
  ) {
    this.apiUrl = this.envService.apiUrl;
    this.initializeArrays();
  }

  ngOnInit(): void {
    this.dateLocaleService.bindAdapterLocale(this.dateAdapter);
    this.setupAutocomplete();
    this.loadOrganizers();
    this.translate.onLangChange.subscribe(() => {
      this.initializeArrays();
    });
  }


  getScheduledEndDate() : Date {
    const eventDate = this.form.get('eventDate')?.value;
    const duration = this.form.get('duration')?.value;
    if (!eventDate || !duration) return this.today;
    const finalDate = new Date(eventDate);
    finalDate.setDate(finalDate.getDate() + duration - 1);
    return finalDate;
  }

  private loadOrganizers() {
    this.http.get<Organizer[]>(`${this.apiUrl}/api/allapporteurs`).subscribe(
      (organizers) => {
        const filteredOrganizers = organizers
          .filter(org => org.lastName !== "VAX CONSEILS" && org.lastName !== "GP Explorer")
          .sort((a, b) => {
            if (a.lastName === "!Organisateur non référencé") {
              this.unreferencedOrganizer = a;
              return -1;
            }
            if (b.lastName === "!Organisateur non référencé") {
              this.unreferencedOrganizer = b;
              return 1;
            }
            return a.lastName.localeCompare(b.lastName);
          });
        this.organizers = [...filteredOrganizers];
        this._allOrganizers = [...filteredOrganizers];
        this.filteredOrganizers = of([...filteredOrganizers]);
        
        this.isLoadingOrganizers = false;
      },
      (error) => {
        this.isLoadingOrganizers = false;
      }
    );
  }

  private setupAutocomplete() {
    this._allCircuits = [...this.circuits];
    this._allOrganizers = [...this.organizers];
    this.filteredCircuits = of(this.circuits);
    this.filteredOrganizers = of(this.organizers);
  }

  onPanelOpened(isOpen: boolean): void {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.circuit-select-panel .search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  onCircuitSelect(circuitName: string): void {
    this.selectedCircuit = this._allCircuits.find(circuit => circuit.nom === circuitName) || null;
  }

  onOrganizerPanelOpened(isOpen: boolean): void {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.organizer-select-panel .search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  filterCircuits(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCircuits = of(
      this._allCircuits.filter(circuit => 
        circuit.nom.toLowerCase().includes(searchValue)
      )
    );
    
    event.stopPropagation();
  }

  filterOrganizers(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredOrganizers = of(
      this._allOrganizers.filter(organizer => 
        organizer.lastName.toLowerCase().includes(searchValue)
      )
    );
  }
  
  getFormControl(controlName: string): FormControl {
    return this.form.get(controlName) as FormControl;
  }

  onOrganizerSelect(event: any) {
    const selectedId = event.value;
    const selectedOrganizer = this._allOrganizers.find(org => org.id === selectedId);
    
    if (selectedOrganizer) {
      this.organizerNameChange.emit(selectedOrganizer.lastName);
      
      if (selectedOrganizer.id === this.unreferencedOrganizer?.id) {
        this.form.get('unreferencedOrganizer')?.setValue(true, { emitEvent: false });
      } else {
        this.form.get('unreferencedOrganizer')?.setValue(false, { emitEvent: false });
      }
    }
  }

  onUnreferencedOrganizerChange(isChecked: boolean) {
    if (isChecked && this.unreferencedOrganizer) {
      this.form.get('organizer')?.setValue(this.unreferencedOrganizer.id);
      this.organizerNameChange.emit(this.unreferencedOrganizer.lastName);
    } else if (!isChecked && this.form.get('organizer')?.value === this.unreferencedOrganizer?.id) {
      this.form.get('organizer')?.setValue(null);
      this.organizerNameChange.emit('');
    }
  }
  get isPilot() {
    return this.form.get('role')?.value === 'PILOTE';
  }

  get isPassenger() {
    return this.form.get('role')?.value === 'PASSAGER';
  }

  private updateVehicleTypeValidator() {
    const vehicleTypeControl = this.form.get('vehicleType');
    if (this.isPilot || this.isPassenger) {
      vehicleTypeControl?.setValidators([Validators.required]);
    } else {
      vehicleTypeControl?.clearValidators();
      vehicleTypeControl?.reset();
    }
    vehicleTypeControl?.updateValueAndValidity();
  }

  onRoleChange(event: any) {
    const role = event.value;
    this.updateVehicleTypeValidator();
    if (role !== 'PILOTE' && role !== 'PASSAGER') {
      this.form.get('vehicleType')?.reset();
    }
  }

  eventTypes: { value: string; label: string; icon: string }[] = [];
  roles: { value: string; label: string; icon: string }[] = [];
  vehicleTypes: { value: string; label: string; icon: string }[] = [];

  private initializeArrays(): void {
    this.eventTypes = [
      { value: 'ROULAGE_ENTRAINEMENT', label: this.translate.instant('eventCoverage.eventTypes.roulageEntrainement'), icon: 'two_wheeler' },
      { value: 'COMPETITION', label: this.translate.instant('eventCoverage.eventTypes.competition'), icon: 'emoji_events' },
      { value: 'COACHING', label: this.translate.instant('eventCoverage.eventTypes.coaching'), icon: 'record_voice_over' },
      { value: 'STAGE_PILOTAGE', label: this.translate.instant('eventCoverage.eventTypes.stagePilotage'), icon: 'school' }
    ];

    this.roles = [
      { value: 'PILOTE', label: this.translate.instant('eventCoverage.eventRoles.pilote'), icon: 'sports_motorsports' },
      { value: 'PASSAGER', label: this.translate.instant('eventCoverage.eventRoles.passager'), icon: 'airline_seat_recline_normal' },
      { value: 'MECANICIEN', label: this.translate.instant('eventCoverage.eventRoles.mecanicien'), icon: 'build' },
      { value: 'PHOTOGRAPHE_VIDEASTE', label: this.translate.instant('eventCoverage.eventRoles.photographeVideaste'), icon: 'photo_camera' }
    ];

    this.vehicleTypes = [
      { value: 'moto', label: this.translate.instant('eventCoverage.vehicleTypes.moto'), icon: 'two_wheeler' },
      { value: 'auto', label: this.translate.instant('eventCoverage.vehicleTypes.auto'), icon: 'directions_car' }
    ];
  }

  getEventTypeLabel(value: string): string {
    const item = this.eventTypes.find(e => e.value === value);
    return item ? item.label : '';
  }

  getEventTypeIcon(value: string): string {
    const item = this.eventTypes.find(e => e.value === value);
    return item ? item.icon : '';
  }

  getRoleLabel(value: string): string {
    const item = this.roles.find(e => e.value === value);
    return item ? item.label : '';
  }

  getRoleIcon(value: string): string {
    const item = this.roles.find(e => e.value === value);
    return item ? item.icon : '';
  }

  getVehicleLabel(value: string): string {
    const item = this.vehicleTypes.find(e => e.value === value);
    return item ? item.label : '';
  }

  getVehicleIcon(value: string): string {
    const item = this.vehicleTypes.find(e => e.value === value);
    return item ? item.icon : '';
  }
  
}

