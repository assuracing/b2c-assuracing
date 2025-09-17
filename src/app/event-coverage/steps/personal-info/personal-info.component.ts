import { Component, Input, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { switchMap } from 'rxjs/operators';
import { of, Subscription, debounceTime, distinctUntilChanged, fromEvent } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailExistsDialogComponent } from './email-exists-dialog.component';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NumbersOnlyDirective } from '../../../directives/numbers-only.directive';
import { PostalCodeService, PostalCodeInfo } from '../../../services/postal-code.service';
import { LOCALE_ID } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DatePipe } from '@angular/common';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  standalone: true,
  selector: 'app-personal-info',
  imports: [
    FormsModule, 
    ReactiveFormsModule, 
    CommonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatOptionModule, 
    MatDatepickerModule, 
    MatNativeDateModule, 
    MatIconModule,
    NumbersOnlyDirective
  ],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss', '../../../app.component.scss'],
    providers: [
      { provide: LOCALE_ID, useValue: 'fr-FR' },
      { provide: MAT_DATE_LOCALE, useValue: 'fr' },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
      { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
      DatePipe
    ]
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
  @ViewChild('postalCodeInput') postalCodeInput!: ElementRef;
  
  postalCodeSuggestions: PostalCodeInfo[] = [];
  showPostalCodeSuggestions = false;
  private postalCodeSubs = new Subscription();
  @Input() form!: FormGroup;
  @Input() nationalities: string[] = [];
  
  countries: string[] = [
    'France', 'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
    'Arabie saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
    'Bangladesh', 'Barbade', 'Belgique', 'Bélize', 'Bénin', 'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie',
    'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge',
    'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo',
    'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti',
    'Dominique', 'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini',
    'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce',
    'Grenade', 'Guatemala', 'Guinée', 'Guinée équatoriale', 'Guinée-Bissau', 'Guyana', 'Haïti', 'Honduras',
    'Hongrie', 'Îles Marshall', 'Îles Salomon', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande',
    'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie', 'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati',
    'Koweït', 'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie',
    'Luxembourg', 'Macédoine du Nord', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte',
    'Maroc', 'Maurice', 'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro',
    'Mozambique', 'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande',
    'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan', 'Palaos', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay',
    'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal', 'Qatar', 'République centrafricaine',
    'République démocratique du Congo', 'République dominicaine', 'République tchèque', 'Roumanie',
    'Royaume-Uni', 'Russie', 'Rwanda', 'Saint-Christophe-et-Niévès', 'Sainte-Lucie', 'Saint-Marin',
    'Saint-Vincent-et-les-Grenadines', 'Salvador', 'Samoa', 'Sao Tomé-et-Principe', 'Sénégal', 'Serbie',
    'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud',
    'Sri Lanka', 'Suède', 'Suisse', 'Suriname', 'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande',
    'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu',
    'Ukraine', 'Uruguay', 'Vanuatu', 'Vatican', 'Venezuela', 'Viêt Nam', 'Yémen', 'Zambie', 'Zimbabwe'
  ];

  filteredCountries: string[] = [];
  private _allCountries: string[] = [];
  private checkEmailSub?: Subscription;
  private subscription = new Subscription();


  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private dialog: MatDialog, 
    private snackBar: MatSnackBar,
    private postalCodeService: PostalCodeService
  ) {}

  ngOnInit() {
    this._allCountries = [...this.countries];
    this.filteredCountries = [...this.countries];    
      
    if (this.userService.isLoggedIn()) {

      // this.form.get('email')?.disable();
      // this.form.get('firstname')?.disable();
      // this.form.get('lastname')?.disable();

        this.subscription.add(
          this.userService.getAccount().pipe(
            switchMap((account: any) => account?.id 
              ? this.userService.getAdherentId().pipe(
                  switchMap(() => this.userService.getAdherentInfo())
                )
              : of(null)
            )
          ).subscribe((adherent: any) => {
            if (adherent) {
              if(adherent.user['login']) this.form.get('email')?.setValue(adherent.user['login']);
              if(adherent.nom) this.form.get('lastname')?.setValue(adherent.nom);
              if(adherent.prenom) this.form.get('firstname')?.setValue(adherent.prenom);
              if(adherent.dateNaissance) this.form.get('birthdate')?.setValue(adherent.dateNaissance);
              if(adherent.telPortable) this.form.get('phone')?.setValue(adherent.telPortable);
              if(adherent.adresse) this.form.get('address')?.setValue(adherent.adresse);
              if(adherent.codepostal) this.form.get('postalCode')?.setValue(adherent.codepostal);
              if(adherent.ville) this.form.get('city')?.setValue(adherent.ville);
              if(adherent.pays) this.form.get('country')?.setValue(adherent.pays);
              if(adherent.civilite) this.form.get('civility')?.setValue(adherent.civilite);
              if(adherent.complementadresse) this.form.get('addressComplement')?.setValue(adherent.complementadresse);
            }
          })
        );
      }
      else {
        this.form.get('email')?.enable();
        this.form.get('firstname')?.enable();
        this.form.get('lastname')?.enable();
      }
    
    this.setupPostalCodeInput();

    this.form.get('country')?.valueChanges.subscribe(country => {
      this.form.get('postalCode')?.setValue('');
      this.form.get('city')?.setValue('');
      this.postalCodeSuggestions = [];
      this.showPostalCodeSuggestions = false;
    });
  }

  ngAfterViewInit() {
    if (this.postalCodeInput) {
      this.setupPostalCodeInput();
    }
    if(this.userService.isLoggedIn()) {
      this.form.get('email')?.disable();
      this.form.get('firstname')?.disable();
      this.form.get('lastname')?.disable();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.postalCodeSubs.unsubscribe();
    if (this.checkEmailSub) this.checkEmailSub.unsubscribe();
  }

  getStartDate() {
    const today = new Date();
    const year = today.getFullYear() - 20;
    const month = today.getMonth();
    const day = today.getDate();
    return new Date(year, month, day);
  }

  private setupPostalCodeInput() {
    const postalCodeInput = this.postalCodeInput?.nativeElement;
    if (!postalCodeInput) return;

    this.postalCodeSubs.unsubscribe();
    this.postalCodeSubs = new Subscription();

    const input$ = fromEvent(postalCodeInput, 'input').pipe(
      debounceTime(300),
      distinctUntilChanged()
    );

    this.postalCodeSubs.add(
      input$.subscribe(() => this.onPostalCodeInput())
    );
  }

  onPostalCodeInput() {
    const country = this.form.get('country')?.value;
    if (country !== 'France') {
      this.postalCodeSuggestions = [];
      this.showPostalCodeSuggestions = false;
      return;
    }

    const value = this.postalCodeInput?.nativeElement?.value || '';
    if (!/^\d+$/.test(value)) {
      this.postalCodeSuggestions = [];
      this.showPostalCodeSuggestions = false;
      return;
    }

    this.postalCodeService.searchPostalCodes(value).subscribe(suggestions => {
      this.postalCodeSuggestions = suggestions;
      this.showPostalCodeSuggestions = this.postalCodeSuggestions.length > 0;
    });
  }

  onPostalCodeBlur() {
    setTimeout(() => {
      this.showPostalCodeSuggestions = false;
    }, 200);
  }

  selectPostalCode(postalCodeInfo: PostalCodeInfo) {
    this.form.get('postalCode')?.setValue(postalCodeInfo.code);
    this.form.get('city')?.setValue(postalCodeInfo.city);
    this.postalCodeSuggestions = [];
    this.showPostalCodeSuggestions = false;
  }

  filterCountries(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCountries = this._allCountries.filter(country => 
      country.toLowerCase().includes(searchValue)
    );
    event.stopPropagation();
  }

  onPanelOpened(isOpen: boolean): void {
    if (isOpen) {
      this.filteredCountries = [...this._allCountries];
      setTimeout(() => {
        const searchInput = document.querySelector('.country-select-panel .search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  onEmailBlur() {
    const email = this.emailControl?.value;
    if (!email || typeof email !== 'string' || !email.includes('@')) return;
    const login = email.split('@')[0];
    
    if (this.userService.isLoggedIn()) {
      return;
    }
    if (this.checkEmailSub) this.checkEmailSub.unsubscribe();
    this.checkEmailSub = this.userService.checkEmail(email, login).subscribe((exists) => {
      if (exists) {
        this.userService.getAccount().subscribe({
          next: user => {
            if (user?.email && user.email.toLowerCase() === email.toLowerCase()) {
              return;
            }
            const dialogRef = this.dialog.open(EmailExistsDialogComponent, {
              disableClose: true
            });
            
            dialogRef.afterClosed().subscribe((result) => {
              if (result?.success && result.adherent) {
                this.updateFormWithAdherentData(result.adherent);
              }
              if (result === 'wrongEmail' || result === 'cancel' || result === undefined) {
                this.emailControl?.setValue('');
              } else if (result && typeof result === 'object' && result.email) {
                this.emailControl?.setValue(result.email);
              }
            });
          },
          error: () => {
            const dialogRef = this.dialog.open(EmailExistsDialogComponent, {
              disableClose: true
            });
            
            dialogRef.afterClosed().subscribe((result) => {
              if (result?.success && result.adherent) {
                this.updateFormWithAdherentData(result.adherent);
              }
              if (result === 'wrongEmail' || result === 'cancel' || result === undefined) {
                this.emailControl?.setValue('');
              } else if (result && typeof result === 'object' && result.email) {
                this.emailControl?.setValue(result.email);
              }
            });
          }
        });
      }
    });
  }

  get emailControl() { return this.form.get('email'); }

  get phoneControl() { return this.form.get('phone'); }
  get postalCodeControl() { return this.form.get('postalCode'); }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) return false;
    return control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Format email invalide';
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'phone') {
        return 'Le numéro de téléphone doit contenir 10 chiffres';
      }
      if (controlName === 'postalCode' && this.form.get('country')?.value != 'France') {
        return 'Le code postal doit contenir entre 4 et 8 chiffres';
      }
    }
    if (control?.hasError('minlength')) {
      return 'Ce champ doit contenir au moins 2 caractères';
    }
    return '';
  }
  
  private updateFormWithAdherentData(adherent: any): void {
    if (!adherent) return;

    if (adherent.user?.['login']) this.form.get('email')?.setValue(adherent.user['login']);
    if (adherent.nom) this.form.get('lastname')?.setValue(adherent.nom);
    if (adherent.prenom) this.form.get('firstname')?.setValue(adherent.prenom);
    if (adherent.dateNaissance) this.form.get('birthdate')?.setValue(adherent.dateNaissance);
    if (adherent.telPortable) this.form.get('phone')?.setValue(adherent.telPortable);
    if (adherent.adresse) this.form.get('address')?.setValue(adherent.adresse);
    if (adherent.codepostal) this.form.get('postalCode')?.setValue(adherent.codepostal);
    if (adherent.ville) this.form.get('city')?.setValue(adherent.ville);
    if (adherent.pays) this.form.get('country')?.setValue(adherent.pays);
    if (adherent.civilite) this.form.get('civility')?.setValue(adherent.civilite);
    if (adherent.complementadresse) this.form.get('addressComplement')?.setValue(adherent.complementadresse);
    
    this.form.get('email')?.disable();
    this.form.get('firstname')?.disable();
    this.form.get('lastname')?.disable();
    
    this.form.markAllAsTouched();
  }
}
