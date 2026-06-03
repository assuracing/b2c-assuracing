import { Component, OnInit, AfterViewInit, ViewChild, Inject, OnDestroy, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter } from '@angular/material/core';
import { environment } from '../../environments/environment';
import { ToastService } from '../services/toast.service';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateLocaleService, provideMomentDatepicker } from '../core/services/date-locale.service';
import { Subscription } from 'rxjs';
import { PostalCodeService, PostalCodeInfo } from '../services/postal-code.service';
import { fromEvent, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-user-profil-info',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TranslateModule
  ],
  providers: [...provideMomentDatepicker()],
  templateUrl: './user-profil-info.component.html',
  styleUrls: ['./user-profil-info.component.scss']
})
export class UserProfilInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('picker') picker: any;
  @ViewChild('postalCodeInput') postalCodeInput!: ElementRef;

  profileForm: FormGroup;
  userInfo: any = null;
  hasAdherentInfo: boolean = false;
  loading: boolean = true;
  isEditing: boolean = false;

  postalCodeSuggestions: PostalCodeInfo[] = [];
  showPostalCodeSuggestions = false;
  private postalCodeSubs = new Subscription();

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private toastService: ToastService,
    private dialog: MatDialog,
    @Inject(HttpClient) private http: HttpClient,
    private translate: TranslateService,
    private dateLocaleService: DateLocaleService,
    private dateAdapter: DateAdapter<any>,
    private postalCodeService: PostalCodeService
  ) {
    this.profileForm = this.fb.group({
      civilite: [''],
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      telPortable: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required]],
      adresse: ['', [Validators.required, Validators.maxLength(200)]],
      ville: ['', [Validators.required, Validators.maxLength(100)]],
      codepostal: ['', [Validators.required]]
    });
  }

  private formatDateLocal(value: any): string | null {
    if (!value) return null;
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  today = new Date();
  private subscription = new Subscription();

  ngOnInit() {
    this.subscription.add(this.dateLocaleService.bindAdapterLocale(this.dateAdapter));
    this.loadUserProfile();
  }

  ngAfterViewInit() {
    if (this.postalCodeInput) {
      this.setupPostalCodeInput();
    }
  }

  async loadUserProfile() {
    this.loading = true;

    try {
      const user = await this.userService.getAccount().toPromise();

      if (user?.id) {
        const userId = user.id;

        const token = localStorage.getItem('auth_token');
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        const apiUrl = environment.apiUrl;
        const adherentData = await this.http.get<any>(`${apiUrl}/api/adherents/by-user/${userId}`,
          { headers }
        ).toPromise();
        if (adherentData) {
          this.userInfo = adherentData;
          this.hasAdherentInfo = true;
          const formData: any = {
            civilite: adherentData.civilite || '',
            nom: adherentData.nom || '',
            prenom: adherentData.prenom || '',
            email: adherentData.email || user.email || '',
            telPortable: adherentData.telephone || adherentData.telPortable || '',
            adresse: adherentData.adresse || '',
            ville: adherentData.ville || '',
            codepostal: adherentData.codePostal || adherentData.codepostal || '',
            dateNaissance: this.formatDateLocal(adherentData.dateNaissance) || null
          };
          this.profileForm.patchValue(formData, { emitEvent: false });
        } else {
          throw new Error('Aucune donnée adhérent trouvée');
        }
      } else {
        throw new Error('ID utilisateur non disponible');
      }
    } catch (error) {
      this.toastService.error(this.translate.instant('messages.loadProfileError'));
    } finally {
      this.loading = false;
      setTimeout(() => this.setupPostalCodeInput());
    }
  }

  toggleEdit() {
    if (this.isEditing) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: this.translate.instant('messages.cancelModificationsTitle'),
          message: this.translate.instant('messages.cancelModificationsMessage'),
          confirmText: this.translate.instant('messages.confirmCancel'),
          cancelText: this.translate.instant('messages.continueEdit')
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadUserProfile();
          this.isEditing = false;
        }
      });
    } else {
      this.isEditing = true;
      setTimeout(() => this.setupPostalCodeInput());
    }
  }

  onSubmit() {
    if (this.profileForm.valid && this.userInfo) {
      const formValue = this.profileForm.value;
      const updatedData = {
        ...this.userInfo,
        ...formValue,
        id: this.userInfo.id,
        civilite: formValue.civilite || null,
        user: {
          id: this.userInfo.user?.id
        },
        telephone: formValue.telPortable,
        codePostal: formValue.codepostal,
        dateNaissance: this.formatDateLocal(formValue.dateNaissance) || null
      };

      delete updatedData.createdDate;
      delete updatedData.lastModifiedDate;

      this.userService.updateUserProfile(updatedData).subscribe(
        (response) => {
          this.toastService.success(this.translate.instant('messages.profileUpdateSuccess'));
          this.isEditing = false;
          this.loadUserProfile();
        },
        (error) => {
          this.toastService.error(this.translate.instant('messages.profileUpdateError'));
        }
      );
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.postalCodeSubs.unsubscribe();
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
    const country = this.userInfo?.pays;
    if (country !== 'France' && country !== 'france') {
      this.postalCodeSuggestions = [];
      this.showPostalCodeSuggestions = false;
      return;
    }

    const value = String(
      this.profileForm.get('codepostal')?.value ?? this.postalCodeInput?.nativeElement?.value ?? ''
    );

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
    this.profileForm.get('codepostal')?.setValue(postalCodeInfo.code);
    this.profileForm.get('ville')?.setValue(postalCodeInfo.city);
    this.postalCodeSuggestions = [];
    this.showPostalCodeSuggestions = false;
  }
}
