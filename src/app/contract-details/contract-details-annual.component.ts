import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductMappingService } from '../services/product-mapping.service';
import { AnnualContractDataService } from '../services/annual-contract-data.service';
import { ContractService } from '../services/contract.service';
import { UserService } from '../services/user.service';
import { ClaimService } from '../services/claim.service';
import { Claim } from '../models/claim.model';
import { ClaimListComponent } from '../components/claim-list/claim-list.component';

interface Contract {
  contratID: string;
  produitID: string;
  dateAdhesionContrat: string;
  dateFin: string;
  nomcontrat?: string;
  valide?: boolean | string;
  [key: string]: any;
}

@Component({
  selector: 'app-contract-details-annual',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    DatePipe,
    ClaimListComponent
  ],
  templateUrl: './contract-details-annual.component.html',
  styleUrls: ['./contract-details-annual.component.scss', './contract-details.component.scss', '../app.component.scss', '../app-second.component.scss', 'contract-details-annual-responsive.component.scss']
})
export class ContractDetailsAnnualComponent implements OnInit {
  contracts: Contract[] = [];
  guaranteeId: string = '';
  guaranteeLabel: string = '';
  error: string | null = null;
  loadingPayment = false;
  loading = false;
  claims: Map<string, Claim[]> = new Map();
  selectedContractId: string | null = null;

  private guaranteeProductMap: { [key: string]: number[] } = {
    'rc': [83],
    'ia': [354, 355, 356, 357, 358],
    'pj': [398]
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productMappingService: ProductMappingService,
    private annualContractDataService: AnnualContractDataService,
    private contractService: ContractService,
    private userService: UserService,
    private claimService: ClaimService
  ) {}

  ngOnInit(): void {
    const data = this.annualContractDataService.getContractData();
    
    if (data && data.contracts && data.contracts.length > 0) {
      this.contracts = data.contracts || [];
      this.guaranteeId = data.guaranteeId || '';
      this.guaranteeLabel = data.guaranteeLabel || '';

      this.contracts.sort((a, b) => {
        return new Date(b.dateAdhesionContrat).getTime() - new Date(a.dateAdhesionContrat).getTime();
      });

      if (this.contracts.length === 0) {
        this.error = 'Aucun contrat à afficher';
      } else {
        this.loadClaimsForContracts();
      }
    } else {
      this.route.paramMap.subscribe(params => {
        const guaranteeId = params.get('id');
        if (guaranteeId) {
          this.loadContractsFromAPI(guaranteeId);
        } else {
          this.error = 'Les données du contrat sont indisponibles. Veuillez retourner aux garanties et réessayer.';
        }
      });
    }
  }

  private loadContractsFromAPI(guaranteeId: string): void {
    this.loading = true;
    this.guaranteeId = guaranteeId;
    this.guaranteeLabel = this.getGuaranteeLabel(guaranteeId);

    this.userService.getAllContracts().subscribe({
      next: (allContracts: any) => {
        this.loading = false;
        
        const productIds = this.guaranteeProductMap[guaranteeId] || [];
        
        const filteredContracts = (allContracts || []).filter((contract: any) => {
          const productId = parseInt(contract.produitID, 10);
          return productIds.includes(productId);
        });

        if (filteredContracts.length > 0) {
          this.contracts = filteredContracts.sort((a: any, b: any) => {
            return new Date(b.dateAdhesionContrat).getTime() - new Date(a.dateAdhesionContrat).getTime();
          });
          this.error = null;
          this.loadClaimsForContracts();
        } else {
          this.error = 'Aucun contrat trouvé pour cette garantie.';
          this.contracts = [];
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Impossible de charger les contrats. Veuillez retourner aux garanties et réessayer.';
      }
    });
  }

  private getGuaranteeLabel(guaranteeId: string): string {
    const labels: { [key: string]: string } = {
      'rc': 'Responsabilité civile',
      'ia': 'Individuelle accident',
      'pj': 'Protection juridique'
    };
    return labels[guaranteeId] || 'Garantie';
  }

  getProductLabel(productId: string, nomContrat?: string): string {
    if (!productId) return 'Produit inconnu';
    let label = this.productMappingService.getProductLabel(productId);
    if (label.startsWith('Produit inconnu') && nomContrat) {
      label = nomContrat;
    }
    return label || nomContrat || `Produit ${productId}`;
  }

  getContractStatus(contract: Contract): string {
    const valide = contract.valide === true || contract.valide === 'true';
    const today = new Date();
    const endDate = new Date(contract.dateFin);

    if (endDate < today) {
      return 'Expiré';
    }
    return valide ? 'Actif' : 'Inactif';
  }

  getContractStatusClass(contract: Contract): string {
    const status = this.getContractStatus(contract);
    return status === 'Actif' ? 'status-active' : status === 'Expiré' ? 'status-expired' : 'status-inactive';
  }

  goBack(): void {
    this.router.navigate(['/user-contracts']);
  }

  onPay(): void {
    if (this.contracts && this.contracts.length > 0) {
      const contract = this.contracts[0];
      
      if (!contract['transactionUID'] || !contract['clientEmail']) {
        this.loadingPayment = true;
        
        const contractId = parseInt(contract.contratID, 10);
        if (isNaN(contractId)) {
          this.loadingPayment = false;
          return;
        }
        
        this.contractService.getContractDetails(contractId).subscribe({
          next: (fullContract: any) => {
            this.loadingPayment = false;
            if (fullContract && fullContract.transactionUID && fullContract.clientEmail) {
              const paymentUrl = this.contractService.initiateContractPayment(
                fullContract.transactionUID,
                fullContract.clientEmail,
                fullContract.montantGarantie
              );
              window.location.href = paymentUrl;
            }
          },
          error: (err: any) => {
            this.loadingPayment = false;
          }
        });
      } else {
        const paymentUrl = this.contractService.initiateContractPayment(
          contract['transactionUID'],
          contract['clientEmail'],
          contract['montantGarantie']
        );
        window.location.href = paymentUrl;
      }
    }
  }

  private loadClaimsForContracts(): void {
    this.contracts.forEach(contract => {
      const contractId = parseInt(contract.contratID, 10);
      if (!isNaN(contractId)) {
        this.claimService.getClaimsForContract(contractId).subscribe({
          next: (claims: Claim[]) => {
            this.claims.set(contract.contratID, claims);
          },
          error: (err: any) => {
            console.error(`Erreur lors du chargement des sinistres pour le contrat ${contract.contratID}:`, err);
            this.claims.set(contract.contratID, []);
          }
        });
      }
    });
  }

  getClaimsForContract(contractId: string): Claim[] {
    return this.claims.get(contractId) || [];
  }

  onDeclareClaim(contract: Contract): void {
    if (contract && contract.contratID) {
      this.router.navigate(['/declare-claim', contract.contratID]);
    }
  }

  getContractIdAsNumber(contratID: string): number {
    return parseInt(contratID, 10);
  }
}
