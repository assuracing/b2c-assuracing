import { Component, Input } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { UserService } from '../../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { EmailExistsDialogComponent } from './email-exists-dialog.component';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatError } from '@angular/material/form-field';

@Component({
  standalone: true,
  selector: 'app-personal-info',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss', '../../../app.component.scss'],
})
export class PersonalInfoComponent {
  @Input() form!: FormGroup;
  @Input() nationalities: string[] = [];
  
  countries: string[] = [
    'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
    'Arabie saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
    'Bangladesh', 'Barbade', 'Belgique', 'Bélize', 'Bénin', 'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie',
    'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge',
    'Cameroun', 'Canada', 'Cap-Vert', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo',
    'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti',
    'Dominique', 'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini',
    'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce',
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

  constructor(private fb: FormBuilder, private userService: UserService, private dialog: MatDialog, private snackBar: MatSnackBar) {}

  private checkEmailSub?: Subscription;

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      this.updateLockFields(user);
    });
    window.addEventListener('storage', () => this.updateLockFields(this.userService.getUser()));
  }

  updateLockFields(userParam?: any) {
    const isLogged = this.userService.isLoggedIn();
    const user = userParam || this.userService.getUser();
    if (isLogged && user) {
      if (this.form.get('email')?.value !== user.email) this.form.get('email')?.setValue(user.email);
      if (this.form.get('firstname')?.value !== user.firstName) this.form.get('firstname')?.setValue(user.firstName);
      if (this.form.get('lastname')?.value !== user.lastName) this.form.get('lastname')?.setValue(user.lastName);
      this.form.get('email')?.disable({ emitEvent: false });
      this.form.get('firstname')?.disable({ emitEvent: false });
      this.form.get('lastname')?.disable({ emitEvent: false });
    } else {
      this.form.get('email')?.enable({ emitEvent: false });
      this.form.get('firstname')?.enable({ emitEvent: false });
      this.form.get('lastname')?.enable({ emitEvent: false });
    }
  }

  onEmailBlur() {
    const email = this.emailControl?.value;
    if (!email || typeof email !== 'string' || !email.includes('@')) return;
    const login = email.split('@')[0];
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
      if (controlName === 'postalCode') {
        return 'Le code postal doit contenir 5 chiffres';
      }
    }
    if (control?.hasError('minlength')) {
      return 'Ce champ doit contenir au moins 2 caractères';
    }
    return '';
  }
}
