import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';
import { CountryFlagService } from '../../../services/country-flag.service';
import { ProductMappingService } from '../../../services/product-mapping.service';
import { ClaimService } from '../../../services/claim.service';
import { forkJoin, of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Contract {
  contratID: number;
  produitID?: number;
  dateAdhesion?: string;
  dateFin?: string;
  circuit?: string;
  pays?: string;
  nomcontrat?: string;
  valide?: boolean | string;
  adherentnomCliententreprise?: string;
  hasExistingClaim?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'app-claim-contract-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './claim-contract-step.component.html',
  styleUrls: ['./claim-contract-step.component.scss']
})
export class ClaimContractStepComponent implements OnInit, OnDestroy {
  @Output() contractSelected = new EventEmitter<any>();

  contractForm: FormGroup;
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  searchText = '';
  isLoading = false;
  private subscriptions = new Subscription();
  private readonly annualProductIds = [83, 398, 354, 355, 356, 357, 358];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastService: ToastService,
    public countryFlagService: CountryFlagService,
    public productMappingService: ProductMappingService,
    private claimService: ClaimService,
    private router: Router
  ) {
    this.contractForm = this.fb.group({
      contractId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContracts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private isAnnualContract(contract: Contract): boolean {
    return !!contract.produitID && this.annualProductIds.includes(contract.produitID);
  }

  private loadContracts(): void {
    this.isLoading = true;
    const sub = this.userService.getAllContracts().subscribe({
      next: (contracts: any[]) => {
        const validContracts = contracts.filter(contract => contract.valide === true || contract.valide === 'true');
        this.loadClaimsForEventContracts(validContracts);
      },
      error: (error) => {
        this.toastService.error('Erreur lors du chargement de vos contrats');
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private loadClaimsForEventContracts(contracts: Contract[]): void {
    const eventContracts = contracts.filter(c => !this.isAnnualContract(c));
    const annualContracts = contracts.filter(c => this.isAnnualContract(c));

    if (eventContracts.length === 0) {
      this.contracts = contracts;
      this.filteredContracts = this.contracts;
      this.isLoading = false;
      return;
    }

    const claimRequests = eventContracts.map(contract => {
      const contractId = contract.contratID;
      return this.claimService.getClaimsForContract(contractId).pipe(
        map(claims => ({
          contract,
          hasExistingClaim: claims && claims.length > 0
        })),
        catchError(error => {

          return of({
            contract,
            hasExistingClaim: false
          });
        })
      );
    });

    const claimSub = forkJoin(claimRequests).subscribe({
      next: (results) => {
        const eventContractsWithClaims = results.map(result => ({
          ...result.contract,
          hasExistingClaim: result.hasExistingClaim
        }));

        const filteredEventContracts = eventContractsWithClaims.filter(c => !c.hasExistingClaim);
        
        this.contracts = [...annualContracts, ...filteredEventContracts];
        this.filteredContracts = this.contracts;
        this.isLoading = false;
      },
      error: (error) => {

        this.contracts = contracts;
        this.filteredContracts = this.contracts;
        this.isLoading = false;
      }
    });
    this.subscriptions.add(claimSub);
  }

  getContractLabel(contract: Contract): string {
    const circuit = contract.circuit || 'Circuit ?';
    const nomcontrat = contract.nomcontrat || 'Produit inconnu';
    
    let dateLabel = '';
    if (contract.dateAdhesion) {
      try {
        const date = new Date(contract.dateAdhesion);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        dateLabel = date.toLocaleDateString('fr-FR', options);
      } catch (e) {
        dateLabel = contract.dateAdhesion;
      }
    }
    
    return `${circuit} - ${nomcontrat}${dateLabel ? ' - ' + dateLabel : ''}`;
  }

  getProductIcon(nomContrat: string): string {
    if (!nomContrat) return 'category';
    
    const nameUpper = nomContrat.toUpperCase();
    
    if (nameUpper.includes('RC') || nameUpper.includes('RESPONSABILITÉ')) {
      return 'security';
    } else if (nameUpper.includes('PJ') || nameUpper.includes('PROTECTION JURIDIQUE')) {
      return 'gavel';
    } else if (nameUpper.includes('IA') || nameUpper.includes('INDIVIDUELLE') || nameUpper.includes('ACCIDENT')) {
      return 'medical_services';
    } else if (nameUpper.includes('ANNULATION')) {
      return 'event_busy';
    } else if (nameUpper.includes('INTERRUPTION')) {
      return 'car_crash';
    } else if (nameUpper.includes('INTEMPÉRIES') || nameUpper.includes('INTEMPERIES')) {
      return 'thunderstorm';
    }
    
    return 'category';
  }

  formatContractDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('fr-FR', options);
    } catch (e) {
      return dateString;
    }
  }

  filterContracts(searchText: string): void {
    if (!searchText || searchText.trim() === '') {
      this.filteredContracts = this.contracts;
      return;
    }

    const searchLower = searchText.toLowerCase();
    this.filteredContracts = this.contracts.filter(contract => {
      const circuit = (contract.circuit || '').toLowerCase();
      const nomcontrat = (contract.nomcontrat || '').toLowerCase();
      const dateAdhesion = (contract.dateAdhesion || '').toLowerCase();
      
      return circuit.includes(searchLower) || 
             nomcontrat.includes(searchLower) || 
             dateAdhesion.includes(searchLower);
    });
  }

  getSelectedContract(): Contract | undefined {
    const contractId = this.contractForm.get('contractId')?.value;
    if (!contractId) return undefined;
    return this.contracts.find(c => c.contratID === contractId);
  }

  onPanelOpened(isOpen: boolean): void {
    if (isOpen) {
      setTimeout(() => {
        const searchInput = document.querySelector('.contract-select-panel .search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      });
    }
  }

  trackByContractId(index: number, contract: Contract): number {
    return contract.contratID;
  }

  submit(): void {
    if (this.contractForm.valid) {
      const contractId = this.contractForm.get('contractId')?.value;
      const selectedContract = this.filteredContracts.find(c => c.contratID === contractId);
      if (selectedContract) {
        this.contractSelected.emit(selectedContract);
      } else {
        this.toastService.error('Erreur: contrat introuvable');
      }
    } else {
      this.toastService.error('Veuillez sélectionner un contrat');
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

