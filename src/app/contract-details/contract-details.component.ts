import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService, ContractDetail } from '../services/contract.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductMappingService } from '../services/product-mapping.service';
import { CountryFlagService } from '../services/country-flag.service';
import { Claim } from '../models/claim.model';
import { ClaimService } from '../services/claim.service';
import { ClaimListComponent } from '../components/claim-list/claim-list.component';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    ClaimListComponent
  ],
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss', '../app.component.scss', '../app-second.component.scss']
})
export class ContractDetailsComponent implements OnInit {
  contractId: number | null = null;
  contract: ContractDetail | null = null;
  claims: Claim[] = [];
  loading = true;
  error: string | null = null;
  files: any[] = [];
  vehiculeDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private claimService: ClaimService,
    private productMappingService: ProductMappingService,
    public countryFlagService: CountryFlagService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.contractId = +id;
        this.loadContractDetails();
        this.loadClaims();
      } else {
        this.error = 'Aucun identifiant de contrat fourni';
        this.loading = false;
      }
    });
  }

  private loadContractDetails(): void {
    if (!this.contractId) {
      this.error = 'Identifiant de contrat invalide';
      this.loading = false;
      return;
    }

    this.contractService.getContractDetails(this.contractId).subscribe({
      next: (data: ContractDetail) => {
        this.contract = data;
        
        this.loadContractFiles();
        
        if (!data.vehicule?.id) {
          this.loading = false;
        } else {
          this.loadVehiculeDetails(data.vehicule.id);
        }
      },
      error: (err: any) => {
        this.error = 'Impossible de charger les détails du contrat';
        this.loading = false;
      }
    });
  }

  private loadClaims(): void {
    if (!this.contractId) {
      return;
    }

    this.claimService.getClaimsForContract(this.contractId).subscribe({
      next: (claims: Claim[]) => {
        const productName = this.contract?.produit.nom.toLowerCase() ?? '';
        const isReadOnly = productName.includes('annulation') || productName.includes('interruption');
        
        this.claims = claims.map(claim => ({
          ...claim,
          readonly: isReadOnly,
          files: claim.files || []
        }));
      },
      error: (_err: any) => {
        this.toastService.error('Erreur lors du chargement des sinistres');
      }
    });
  }

  loadVehiculeDetails(vehiculeId: number): void {
    this.contractService.getVehiculeDetails(vehiculeId).subscribe({
      next: (data) => {
        this.vehiculeDetails = data;
        this.loading = false;
      },
      error: (_err) => {
        this.loading = false;
      }
    });
  }

  private loadContractFiles(): void {
    if (!this.contractId) return;

    this.contractService.getContractFiles(this.contractId).subscribe({
      next: (files) => {
        this.files = files || [];
        this.loading = false;
      },
      error: (_err) => {
        this.files = [];
        this.loading = false;
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/user-contracts']);
  }

  onPay(): void {
    if (this.contract && this.contract.transactionUID && this.contract.clientEmail) {
      const paymentUrl = this.contractService.initiateContractPayment(
        this.contract.transactionUID,
        this.contract.clientEmail,
        this.contract.montantGarantie
      );
      
      window.location.href = paymentUrl;
    } else {
      this.toastService.error('Informations de paiement manquantes');
    }
  }

  onDeclareClaim(): void {
    if (this.contractId) {
      this.router.navigate(['/declare-claim', this.contractId]);
    }
  }

  getProductLabel(productId: number, nomContrat?: string): string {
    let label = this.productMappingService.getProductLabel(productId);
    if (label.startsWith('Produit inconnu') && nomContrat) {
      label = nomContrat;
    }
    return label;
  }

  isAnnualContract(): boolean {
    if (!this.contract) return false;

    const annualProductIds = [83, 398, 354, 355, 356, 357, 358];
    return annualProductIds.includes(this.contract.produit.id);
  }
}
