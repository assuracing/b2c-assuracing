import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ProductMappingService } from '../../services/product-mapping.service';
import { AnnualContractDataService } from '../../services/annual-contract-data.service';

interface Contract {
  contratID: string;
  produitID: string;
  dateAdhesionContrat: string;
  dateFin: string;
  tokken?: string;
  codeProduit?: string;
  [key: string]: any;
}

interface AnnualGuarantee {
  id: string;
  label: string;
  status: 'en-cours' | 'non-souscrit' | 'resilié';
  contracts: Contract[];
  productIds: number[];
  benefits: Array<{ icon: string; title: string}>;
}

@Component({
  selector: 'app-motors-league',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss','./annual-contract.component.scss']
})
export class MotorsLeagueComponent implements OnInit, OnChanges {
  @Input() contracts: Contract[] = [];

  constructor(
    private router: Router,
    private productMappingService: ProductMappingService,
    private annualContractDataService: AnnualContractDataService
  ) {}

  activeContract: Contract | null = null;
  hasContract = false;
  isActive = false;
  selectedGuarantee: AnnualGuarantee | null = null;

  annualGuarantees: AnnualGuarantee[] = [
    {
      id: 'rc',
      label: 'Responsabilité civile',
      status: 'non-souscrit',
      contracts: [],
      productIds: [83],
      benefits: [
        {
          icon: 'shield',
          title: 'Couverture des dommages que vous causez aux tiers sur les trackdays'
        },
        {
          icon: 'personal_injury',
          title: 'Dommages corporels : 8M€'
        },
        {
          icon: 'car_crash',
          title: 'Dommages matériels : 500k€'
        },
        {
          icon: 'sports_motorsports',
          title: 'Dont dommages aux équipements de sécurité : 10k€'
        },
        {
          icon: 'check_circle',
          title: 'Sans franchise'
        }
      ]
    },
    {
      id: 'pj',
      label: 'Protection juridique',
      status: 'non-souscrit',
      contracts: [],
      productIds: [398],
      benefits: [
        {
          icon: 'gavel',
          title: 'La garantie qui défend vos droits dans le cadre de la pratique des sports mécaniques'
        },
        {
          icon: 'contact_support',
          title: 'Accompagnement juridique et assistance psychologique par téléphone en cas d\'accident'
        },
        {
          icon: 'balance',
          title: 'Garantie d\'aide aux victimes et recours pénal'
        },
        {
          icon: 'admin_panel_settings',
          title: 'Défense pénale'
        },
        {
          icon: 'description',
          title: 'Garantie consommation auto/moto'
        }
      ]
    },
    
    {
      id: 'ia',
      label: 'Individuelle accident',
      status: 'non-souscrit',
      contracts: [],
      productIds: [354, 355, 356, 357, 358],
      benefits: [
        {
          icon: 'heart_broken',
          title: 'Capital Décès (de 7600 € à 200 000 €)'
        },
        {
          icon: 'accessible',
          title: 'Capital Invalidité (de 18500 à 300 000 €)'
        },
        {
          icon: 'phone_in_talk',
          title: 'Assistance médicale 24/7'
        },
        {
          icon: 'flight_takeoff',
          title: 'Frais médicaux à l\'étranger : 100 000 €'
        },
        {
          icon: 'local_hospital',
          title: 'Rapatriement et transport sanitaire (frais réels)'
        },
        {
          icon: 'receipt_long',
          title: 'Frais médicaux restant à charge (2500 €)'
        },
        {
          icon: 'two_wheeler',
          title: 'Spécial moto : reconditionnement d\'airbag jusque 150 €'
        }
      ]
    }
  ];
  
  ngOnInit() {
    this.checkMotorsLeagueStatus();
  }
  
  private checkMotorsLeagueStatus() {
    if (!this.contracts || !Array.isArray(this.contracts)) {
      this.hasContract = false;
      this.updateAnnualGuarantees();
      return;
    }
    
    const motorsLeagueContracts = this.contracts.filter(contract => {
      const productId = parseInt(contract.produitID, 10);
      return productId >= 44 && productId <= 48;
    });
    
    this.hasContract = motorsLeagueContracts.length > 0;
    
    if (this.hasContract) {
      this.activeContract = motorsLeagueContracts.sort((a, b) => 
        new Date(b.dateFin).getTime() - new Date(a.dateFin).getTime()
      )[0];

      const dateAdhesionContrat = this.activeContract.dateAdhesionContrat;
      const endDate = this.activeContract.dateFin;
      this.isActive = endDate ? dateAdhesionContrat <= endDate : false;
      
      if (!this.activeContract.tokken) {
        const year = new Date(this.activeContract.dateAdhesionContrat).getFullYear().toString().slice(-2);
        this.activeContract.tokken = `Motors-${year}${this.activeContract.contratID}`;
      }
    }
    
    this.updateAnnualGuarantees();
  }

  private updateAnnualGuarantees() {
    const today = new Date();
    
    this.annualGuarantees.forEach(guarantee => {
      const guaranteeContracts = this.contracts.filter(contract => {
        const productId = parseInt(contract.produitID, 10);
        return guarantee.productIds.includes(productId);
      });
      
      guarantee.contracts = guaranteeContracts;
      
      if (guaranteeContracts.length === 0) {
        guarantee.status = 'non-souscrit';
      } else {
        const activeContracts = guaranteeContracts.filter(contract => {
          const endDate = new Date(contract.dateFin);
          return endDate >= today;
        });
        
        if (activeContracts.length > 0) {
          guarantee.status = 'en-cours';
        } else {
          guarantee.status = 'resilié';
        }
      }
    });
  }
  
  renewContract() {
    this.router.navigate(['/motors-league'], { queryParams: { page: '2' } });
  }

  goToMotorsLeague() {
    this.router.navigate(['/motors-league']);
  }

  getProductName(productId: string | undefined): string {
    if (!productId) return 'Produit inconnu';
    return this.productMappingService.getProductLabel(productId) || `Produit ${productId}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'en-cours':
        return 'status-active';
      case 'resilié':
        return 'status-inactive';
      case 'non-souscrit':
        return 'status-pending';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'en-cours':
        return 'En cours';
      case 'resilié':
        return 'Résilié';
      case 'non-souscrit':
        return 'Non souscrit';
      default:
        return '';
    }
  }

  getGuaranteeIcon(guaranteeId: string): string {
    switch (guaranteeId) {
      case 'rc':
        return 'security';
      case 'ia':
        return 'medical_services';
      case 'pj':
        return 'gavel';
      default:
        return 'info';
    }
  }

  getContractDetailsText(contractsCount: number): string {
    return contractsCount === 1 
      ? 'Voir les détails du contrat' 
      : 'Voir les détails des contrats';
  }

  viewContractDetails(guarantee: AnnualGuarantee) {
    this.selectedGuarantee = guarantee;
    const sortedContracts = [...guarantee.contracts].sort((a, b) => {
      return new Date(b.dateAdhesionContrat).getTime() - new Date(a.dateAdhesionContrat).getTime();
    });
    
    this.annualContractDataService.setContractData({
      contracts: sortedContracts,
      guaranteeId: guarantee.id,
      guaranteeLabel: guarantee.label
    });
    
    this.router.navigate(['/contract-details-annual', guarantee.id]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contracts']) {
      this.checkMotorsLeagueStatus();
    }
  }
}
