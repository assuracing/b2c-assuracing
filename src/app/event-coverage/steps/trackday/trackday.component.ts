import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSliderModule } from '@angular/material/slider';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../../../core/services/environment.service';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CountryFlagService } from '../../../services/country-flag.service';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData, DatePipe } from '@angular/common';
import fr from '@angular/common/locales/fr';
import 'moment/locale/fr';

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
    MatIconModule
  ],
  templateUrl: './trackday.component.html',
  styleUrls: ['./trackday.component.scss', '../../../app.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
    DatePipe
  ]
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
  
  private apiUrl: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private envService: EnvironmentService,
    public countryFlagService: CountryFlagService
  ) {
    this.apiUrl = this.envService.apiUrl;
    registerLocaleData(fr);
  }

  ngOnInit(): void {
    this.setupAutocomplete();
    this.loadOrganizers();
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
        console.error('Error loading organizers:', error);
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
    return this.form.get('role')?.value === 'pilote';
  }

  get isPassenger() {
    return this.form.get('role')?.value === 'passager';
  }

  onRoleChange(event: any) {
    const role = event.value;
    if (role !== 'pilote') {
      this.form.get('vehicleType')?.reset();
    }
  }
}
