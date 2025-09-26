import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ProductMappingService } from '../../services/product-mapping.service';

interface Contract {
  contratID: string;
  produitID: string;
  dateAdhesionContrat: string;
  dateFin: string;
  tokken?: string;
  codeProduit?: string;
  [key: string]: any;
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
    RouterModule
  ],
  templateUrl: './motors-league.component.html',
  styleUrls: ['./motors-league.component.scss']
})
export class MotorsLeagueComponent implements OnChanges {
  @Input() contracts: Contract[] = [];

  constructor(
    private router: Router,
    private productMappingService: ProductMappingService
  ) {}

  
  activeContract: Contract | null = null;
  hasContract = false;
  isActive = false;
  
  ngOnInit() {
    this.checkMotorsLeagueStatus();
  }
  
  private checkMotorsLeagueStatus() {
    if (!this.contracts || !Array.isArray(this.contracts)) {
      this.hasContract = false;
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contracts']) {
      this.checkMotorsLeagueStatus();
    }
  }
}
