import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService, ContractDetail } from '../services/contract.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductMappingService } from '../services/product-mapping.service';

@Component({
  selector: 'app-contract-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe
  ],
  templateUrl: './contract-details.component.html',
  styleUrls: ['./contract-details.component.scss', '../app.component.scss', '../app-second.component.scss']
})
export class ContractDetailsComponent implements OnInit {
  contractId: number | null = null;
  contract: ContractDetail | null = null;
  loading = true;
  error: string | null = null;
  files: any[] = [];
  vehiculeDetails: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private contractService: ContractService,
    private productMappingService: ProductMappingService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.contractId = +id;
        this.loadContractDetails();
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

  loadVehiculeDetails(vehiculeId: number): void {
    this.contractService.getVehiculeDetails(vehiculeId).subscribe({
      next: (data) => {
        this.vehiculeDetails = data;
        this.loading = false;
      },
      error: (err) => {
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
      error: (err) => {
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
        console.error('Impossible de procéder au paiement: informations manquantes', {
        hasContract: !!this.contract,
        transactionUID: this.contract?.transactionUID,
        clientEmail: this.contract?.clientEmail,
        montantGarantie: this.contract?.montantGarantie
      });
    }
  }

  getProductLabel(productId: number): string {
    return this.productMappingService.getProductLabel(productId);
  }
}
