import { Injectable } from '@angular/core';

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
    // RC
    '1': {
      code: 'RC',
      diminutif: 'RC',
      label: 'Responsabilité Civile',
      icon: 'security'
    },
    // IA GSL (Formule 1)
    '30': {
      code: 'IA_GSL',
      diminutif: 'IA1',
      label: 'Individuelle accident (niveau 1)',
      icon: 'health_and_safety'
    },
    // IA GSL (Formule 2)
    '31': {
      code: 'IA_GSL',
      diminutif: 'IA2',
      label: 'Individuelle accident (niveau 2)',
      icon: 'health_and_safety'
    },
    // IA GSL (Formule 3)
    '32': {
      code: 'IA_GSL',
      diminutif: 'IA3',
      label: 'Individuelle accident (niveau 3)',
      icon: 'health_and_safety'
    },
    // IA GSL (Formule 4)
    '33': {
      code: 'IA_GSL',
      diminutif: 'IA4',
      label: 'Individuelle accident (niveau 4)',
      icon: 'health_and_safety'
    },
    // IA GSL (Formule 5)
    '34': {
      code: 'IA_GSL',
      diminutif: 'IA5',
      label: 'Individuelle accident (niveau 5)',
      icon: 'health_and_safety'
    },
    // IA GSL compétition (niveau 1)
    '35': {
      code: 'IA_GSL',
      diminutif: 'IAC1',
      label: 'IA GSL compétition (niveau 1)',
      icon: 'emoji_events'
    },
    // IA GSL compétition (niveau 2)
    '36': {
      code: 'IA_GSL',
      diminutif: 'IAC2',
      label: 'IA GSL compétition (niveau 2)',
      icon: 'emoji_events'
    },
    // IA GSL compétition (niveau 3)
    '37': {
      code: 'IA_GSL',
      diminutif: 'IAC3',
      label: 'IA GSL compétition (niveau 3)',
      icon: 'emoji_events'
    },
    // IA GSL compétition (niveau 4)
    '38': {
      code: 'IA_GSL',
      diminutif: 'IAC4',
      label: 'IA GSL compétition (niveau 4)',
      icon: 'emoji_events'
    },
    // IA GSL compétition (niveau 5)
    '39': {
      code: 'IA_GSL',
      diminutif: 'IAC5',
      label: 'IA GSL compétition (niveau 5)',
      icon: 'emoji_events'
    },
    // Protection Juridique
    '40': {
      code: 'PROTECTION_JURIDIQUE',
      diminutif: 'PJ',
      label: 'Protection Juridique',
      icon: 'gavel'
    },
    // Annulation
    '41': {
      code: 'ANNULATION',
      diminutif: 'Annulation',
      label: 'Annulation',
      icon: 'event_busy'
    },
    // Interruption
    '42': {
      code: 'INTERRUPTION',
      diminutif: 'Interruption',
      label: 'Interruption',
      icon: 'block'
    },
    // Intempéries
    '43': {
      code: 'INTEMPERIES',
      diminutif: 'Intempéries',
      label: 'Intempéries',
      icon: 'thunderstorm'
    },
    // Motors League Niveaux 1 à 5
    '44': {
      code: 'MOTORS_LEAGUE_1',
      diminutif: 'ML1',
      label: 'Adhésion MOTORS LEAGUE (niveau 1)',
      icon: 'flag'
    },
    '45': {
      code: 'MOTORS_LEAGUE_2',
      diminutif: 'ML2',
      label: 'Adhésion MOTORS LEAGUE (niveau 2)',
      icon: 'flag'
    },
    '46': {
      code: 'MOTORS_LEAGUE_3',
      diminutif: 'ML3',
      label: 'Adhésion MOTORS LEAGUE (niveau 3)',
      icon: 'flag'
    },
    '47': {
      code: 'MOTORS_LEAGUE_4',
      diminutif: 'ML4',
      label: 'Adhésion MOTORS LEAGUE (niveau 4)',
      icon: 'flag'
    },
    '48': {
      code: 'MOTORS_LEAGUE_5',
      diminutif: 'ML5',
      label: 'Adhésion MOTORS LEAGUE (niveau 5)',
      icon: 'flag'
    },
  };

  constructor() {}

  getProductInfo(productCode: string | number): ProductMapping {
    const code = String(productCode);
    return this.productMappings[code] || {
      code: code,
      diminutif: code,
      label: `Produit inconnu (${code})`,
      icon: 'help_outline'
    };
  }

  getProductDiminutif(productCode: string | number): string {
    return this.getProductInfo(productCode).diminutif;
  }

  getProductLabel(productCode: string | number): string {
    return this.getProductInfo(productCode).label;
  }

  getProductIcon(productCode: string | number): string {
    return this.getProductInfo(productCode).icon;
  }

  isMotorsLeagueProduct(productCode: string | number): boolean {
    const code = String(productCode);
    return code.startsWith('4') && parseInt(code) >= 44 && parseInt(code) <= 48;
  }
}
