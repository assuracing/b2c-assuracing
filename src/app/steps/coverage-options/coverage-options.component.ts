import { Component, Input, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { ContractService } from '../../services/contract.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface PriceResponse {
  prixProduitCompagnieTTC: number;
  fraisDeCourtage: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  selector: 'app-coverage-options',
  templateUrl: './coverage-options.component.html',
  styleUrls: ['./coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss']})
export class CoverageOptionsComponent {
  @Input() form!: FormGroup;
  PROTECTION_LEVELS: { [key: number]: { death: number; disability: number; price: number } } = {
    1: { death: 7600, disability: 18500, price: 0 },
    2: { death: 25000, disability: 37500, price: 0 },
    3: { death: 100000, disability: 150000, price: 0 },
    4: { death: 150000, disability: 200000, price: 0 },
    5: { death: 200000, disability: 300000, price: 0 }
  };

  constructor(
    @Inject(ContractService) private contractService: ContractService
  ) {
    this.initializePrices();
  }

  private initializePrices(): void {
    const priceData = {
      nbrjour: 0,
      datedebutroulage: new Date().toISOString(),
      annual: true,
      c: { id: null },
      dateinscriptionRoulage: new Date().toISOString(),
      immatriculation: "",
      marque: "",
      modele: "",
      montantganrantie: 0,
      param_n_chassis: "",
      param_n_serie: "",
      typevehicule: ""
    };

    const levelToProductCode: { [key: number]: number } = {
      1: 354,
      2: 355,
      3: 356,
      4: 357,
      5: 358
    };

    Object.keys(levelToProductCode).forEach(level => {
      const levelNum = parseInt(level);
      const productCode = levelToProductCode[levelNum];
      
      const data = { ...priceData, codeProduit: [productCode] };
      
      this.contractService.calculatePrice(data).pipe(
        map((response: PriceResponse) => {
          const montant = (response.prixProduitCompagnieTTC || 0) + 
                          (response.fraisDeCourtage || 0);
          this.PROTECTION_LEVELS[levelNum].price = montant;
          return montant;
        })
      ).subscribe({
        error: (err: any) => {
          console.error(`Erreur lors du calcul du prix pour le niveau ${levelNum}`, err);
        }
      });
    });
  }

  selectedLevel: number | null = null;
  selectedPrice: number | null = null;

  onProtectionLevelChange(level: number) {
    this.selectedLevel = level;
    this.selectedPrice = this.PROTECTION_LEVELS[level].price;
    this.form.get('coverageLevel')?.setValue(level);
  }

  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

}
