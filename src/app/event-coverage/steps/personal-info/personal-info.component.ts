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
import { DateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { NumbersOnlyDirective } from '../../../directives/numbers-only.directive';
import { PostalCodeService, PostalCodeInfo } from '../../../services/postal-code.service';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateLocaleService, provideMomentDatepicker } from '../../../core/services/date-locale.service';
import { CountryNationalityService } from '../../../services/country-nationality.service';

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
    NumbersOnlyDirective,
    TranslateModule
  ],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss', '../../../app.component.scss'],
    providers: [
      ...provideMomentDatepicker(),
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
  @Input() nationalitiesMap: Map<string, string> = new Map();
  
  public nationalitiesFiltered: string[] = [];
  
  public countries: string[] = [];
  public countriesMap: Map<string, string> = new Map();

  filteredCountries: string[] = [];
  private _allCountries: string[] = [];
  private checkEmailSub?: Subscription;
  private subscription = new Subscription();


  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private dialog: MatDialog, 
    private snackBar: MatSnackBar,
    private postalCodeService: PostalCodeService,
    private translate: TranslateService,
    private dateLocaleService: DateLocaleService,
    private dateAdapter: DateAdapter<any>,
    private countryNationalityService: CountryNationalityService
  ) {}

  ngOnInit() {
    this.subscription.add(this.dateLocaleService.bindAdapterLocale(this.dateAdapter));
    
    this.updateCountries();
    this.subscription.add(
      this.translate.onLangChange.subscribe(() => {
        this.updateCountries();
      })
    );

    this.nationalities = this.countryNationalityService.nationalities;
    this.nationalitiesMap = this.countryNationalityService.nationalitiesMap;
      
    if (this.userService.isLoggedIn()) {

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
              if(adherent.pays) {
                const countryKey = this.getCountryKeyByValue(adherent.pays);
                this.form.get('country')?.setValue(countryKey);
              }
              if(adherent.civilite) this.form.get('civility')?.setValue(adherent.civilite);
              if(adherent.complementadresse) this.form.get('addressComplement')?.setValue(adherent.complementadresse);
              if(adherent.nationalite) {
                const nationalityKey = this.getNationalityKeyByValue(adherent.nationalite);
                this.form.get('nationality')?.setValue(nationalityKey);
              }
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

  private updateCountries(): void {
    this.countries = this.countryNationalityService.countries;
    this.countriesMap = this.countryNationalityService.countriesMap;
    this._allCountries = [...this.countries];
    this.filteredCountries = [...this.countries];
  }

  private getCountryKeyByValue(value: string): string {
    return this.countryNationalityService.getCountryKeyByValue(value);
  }

  private getNationalityKeyByValue(value: string): string {
    return this.countryNationalityService.getNationalityKeyByValue(value);
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
    this.filteredCountries = this.countries.filter(countryKey => 
      (this.countriesMap.get(countryKey) || '').toLowerCase().includes(searchValue)
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
      return this.translate.instant('messages.invalidEmailFormat');
    }
    if (control?.hasError('pattern')) {
      if (controlName === 'phone') {
        return this.translate.instant('messages.phoneDigits');
      }
      if (controlName === 'postalCode') {
        if (this.form.get('country')?.value === 'France') {
          return this.translate.instant('messages.postalCodeExactly5');
        }
        return this.translate.instant('messages.postalCodeBetween4And8');
      }
    }
    if (control?.hasError('minlength')) {
      return this.translate.instant('messages.minlength2');
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
