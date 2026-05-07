import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    RouterModule,
    TranslateModule
  ],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss','./annual-contract.component.scss']
})
export class MotorsLeagueComponent implements OnInit, OnChanges {
  @Input() contracts: Contract[] = [];

  activeContract: Contract | null = null;
  hasContract = false;
  isActive = false;
  selectedGuarantee: AnnualGuarantee | null = null;
  annualGuarantees: AnnualGuarantee[] = [];

  constructor(
    private router: Router,
    private productMappingService: ProductMappingService,
    private annualContractDataService: AnnualContractDataService,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.initializeGuarantees();
      this.checkMotorsLeagueStatus();
    });
  }

  ngOnInit() {
    this.initializeGuarantees();
    this.checkMotorsLeagueStatus();
  }

  private initializeGuarantees() {
    this.annualGuarantees = [
      {
        id: 'rc',
        label: this.translate.instant('annualContracts.civilLiability'),
        status: 'non-souscrit',
        contracts: [],
        productIds: [83],
        benefits: [
          {
            icon: 'shield',
            title: this.translate.instant('benefits.thirdPartyDamageCover')
          },
          {
            icon: 'personal_injury',
            title: this.translate.instant('benefits.personalInjury')
          },
          {
            icon: 'car_crash',
            title: this.translate.instant('benefits.materialDamage')
          },
          {
            icon: 'sports_motorsports',
            title: this.translate.instant('benefits.safetyEquipmentDamage')
          },
          {
            icon: 'check_circle',
            title: this.translate.instant('benefits.noDeductible')
          }
        ]
      },
      {
        id: 'pj',
        label: this.translate.instant('annualContracts.legalProtection'),
        status: 'non-souscrit',
        contracts: [],
        productIds: [398],
        benefits: [
          {
            icon: 'gavel',
            title: this.translate.instant('benefits.rightsDefense')
          },
          {
            icon: 'contact_support',
            title: this.translate.instant('benefits.legalAndPsychologicalSupport')
          },
          {
            icon: 'balance',
            title: this.translate.instant('benefits.victimSupportAndCriminalRecourse')
          },
          {
            icon: 'admin_panel_settings',
            title: this.translate.instant('benefits.criminalDefense')
          },
          {
            icon: 'description',
            title: this.translate.instant('benefits.carMotorcycleConsumptionGuarantee')
          }
        ]
      },
      {
        id: 'ia',
        label: this.translate.instant('annualContracts.individualAccident'),
        status: 'non-souscrit',
        contracts: [],
        productIds: [354, 355, 356, 357, 358],
        benefits: [
          {
            icon: 'heart_broken',
            title: this.translate.instant('benefits.deathBenefit')
          },
          {
            icon: 'accessible',
            title: this.translate.instant('benefits.disabilityBenefit')
          },
          {
            icon: 'phone_in_talk',
            title: this.translate.instant('benefits.medicalAssistance247')
          },
          {
            icon: 'flight_takeoff',
            title: this.translate.instant('benefits.medicalExpensesAbroad')
          },
          {
            icon: 'local_hospital',
            title: this.translate.instant('benefits.repatriationAndMedicalTransport')
          },
          {
            icon: 'receipt_long',
            title: this.translate.instant('benefits.remainingMedicalExpenses')
          },
          {
            icon: 'two_wheeler',
            title: this.translate.instant('benefits.motorcycleSpecialAirbag')
          }
        ]
      }
    ];
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
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'en-cours':
        return this.translate.instant('annualContracts.onGoing');
      case 'resilié':
        return this.translate.instant('annualContracts.resiliated');
      case 'non-souscrit':
        return this.translate.instant('annualContracts.notSubscribed');
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
