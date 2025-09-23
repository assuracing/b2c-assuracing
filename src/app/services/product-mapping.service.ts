import { Injectable } from '@angular/core';
import { MotorsLeagueComponent } from '../motors-league/motors-league.component';

export interface ProductMapping {
  code: string;
  diminutif: string;
  label: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductMappingService {
  private productMappings: { [key: string]: ProductMapping } = {
    DEFENSE_RECOURS: {
      code: 'DEFENSE_RECOURS',
      diminutif: 'PJ',
      label: 'Protection Juridique',
      icon: 'gavel'
    },
    RC: {
      code: 'RC',
      diminutif: 'RC',
      label: 'Responsabilité Civile',
      icon: 'security'
    },
    INTEMPERIES: {
      code: 'INTEMPERIES',
      diminutif: 'Intempéries',
      label: 'Intempéries',
      icon: 'thunderstorm'
    },
    ANNULATION: {
      code: 'ANNULATION',
      diminutif: 'Annulation',
      label: 'Annulation',
      icon: 'event_busy'
    },
    INTERRUPTION: {
        code: 'INTERRUPTION',
        diminutif: 'Interruption',
        label: 'Interruption',
        icon: 'block'
      },
    MotorsLeagueLevel1: {
      code: 'Adhésion MOTORS LEAGUE (niveau 1)',
      diminutif: 'Motors league 1',
      label: 'Adhésion MOTORS LEAGUE (niveau 1)',
      icon: 'emoji_events'
    },
    MotorsLeagueLevel2: {
      code: 'Adhésion MOTORS LEAGUE (niveau 2)',
      diminutif: 'Motors league 2',
      label: 'Adhésion MOTORS LEAGUE (niveau 2)',
      icon: 'emoji_events'
    },
    MotorsLeagueLevel3: {
      code: 'Adhésion MOTORS LEAGUE (niveau 3)',
      diminutif: 'Motors league 3',
      label: 'Adhésion MOTORS LEAGUE (niveau 3)',
      icon: 'emoji_events'
    },
    MotorsLeagueLevel4: {
      code: 'Adhésion MOTORS LEAGUE (niveau 4)',
      diminutif: 'Motors league 4',
      label: 'Adhésion MOTORS LEAGUE (niveau 4)',
      icon: 'emoji_events'
    },
    MotorsLeagueLevel5: {
      code: 'Adhésion MOTORS LEAGUE (niveau 5)',
      diminutif: 'Motors league 5',
      label: 'Adhésion MOTORS LEAGUE (niveau 5)',
      icon: 'emoji_events'
    },
  };

  constructor() { }

  getProductInfo(productCode: string): ProductMapping {
    return this.productMappings[productCode] || {
      code: productCode,
      diminutif: productCode,
      label: productCode,
      icon: 'help_outline'
    };
  }

  getProductDiminutif(productCode: string): string {
    return this.getProductInfo(productCode).diminutif;
  }

  getProductLabel(productCode: string): string {
    return this.getProductInfo(productCode).label;
  }

  getProductIcon(productCode: string): string {
    return this.getProductInfo(productCode).icon;
  }
}
