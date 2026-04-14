import { Injectable } from '@angular/core';

export interface ProductMapping {
  code: string;
  diminutif: string;
  label: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class ProductMappingService {
  private productMappings: { [key: string]: ProductMapping } = {
    '1': {
      code: 'RC',
      diminutif: 'RC',
      label: 'Responsabilité Civile',
      icon: 'security'
    },
    '30': {
      code: 'IA_GSL',
      diminutif: 'IA1',
      label: 'Individuelle accident (niveau 1)',
      icon: 'medical_services'
    },
    '31': {
      code: 'IA_GSL',
      diminutif: 'IA2',
      label: 'Individuelle accident (niveau 2)',
      icon: 'medical_services'
    },
    '32': {
      code: 'IA_GSL',
      diminutif: 'IA3',
      label: 'Individuelle accident (niveau 3)',
      icon: 'medical_services'
    },
    '33': {
      code: 'IA_GSL',
      diminutif: 'IA4',
      label: 'Individuelle accident (niveau 4)',
      icon: 'medical_services'
    },
    '34': {
      code: 'IA_GSL',
      diminutif: 'IA5',
      label: 'Individuelle accident (niveau 5)',
      icon: 'medical_services'
    },
    '35': {
      code: 'IA_GSL',
      diminutif: 'IAC1',
      label: 'IA GSL compétition (niveau 1)',
      icon: 'emoji_events'
    },
    '36': {
      code: 'IA_GSL',
      diminutif: 'IAC2',
      label: 'IA GSL compétition (niveau 2)',
      icon: 'emoji_events'
    },
    '37': {
      code: 'IA_GSL',
      diminutif: 'IAC3',
      label: 'IA GSL compétition (niveau 3)',
      icon: 'emoji_events'
    },
    '38': {
      code: 'IA_GSL',
      diminutif: 'IAC4',
      label: 'IA GSL compétition (niveau 4)',
      icon: 'emoji_events'
    },
    '39': {
      code: 'IA_GSL',
      diminutif: 'IAC5',
      label: 'IA GSL compétition (niveau 5)',
      icon: 'emoji_events'
    },
    '40': {
      code: 'PROTECTION_JURIDIQUE',
      diminutif: 'PJ',
      label: 'Protection Juridique',
      icon: 'gavel'
    },
    '41': {
      code: 'ANNULATION',
      diminutif: 'Annulation',
      label: 'Annulation',
      icon: 'event_busy'
    },
    '42': {
      code: 'INTERRUPTION',
      diminutif: 'Interruption',
      label: 'Interruption',
      icon: 'car_crash'
    },
    '43': {
      code: 'INTEMPERIES',
      diminutif: 'Intempéries',
      label: 'Intempéries',
      icon: 'thunderstorm'
    },
    '49': {
      code: 'CANCELR',
      diminutif: 'CancelR',
      label: 'CancelR',
      icon: 'cloud_off'
    },
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
    }
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

  getIconByContractName(nomContrat?: string | null): string {
    if (!nomContrat) return 'help_outline';
    const name = nomContrat.toLowerCase();
    if (name.includes('rc')) return 'security';
    if (name.includes('protection juridique') || name.includes('défense recours') || name.includes('defense recours') || name.includes('pj')) return 'gavel';
    if (name.includes('cancelr')) return 'cloud_off';
    if (name.includes('annulation')) return 'event_busy';
    if (name.includes('interruption')) return 'car_crash';
    if (name.includes('intempéries') || name.includes('intemperies')) return 'thunderstorm';
    if (name.includes('individuelle accident') || name.includes('ia')) return 'medical_services';
    return 'help_outline';
  }

  getDiminutifByContractName(nomContrat?: string | null): string {
    if (!nomContrat) return '?';
    const name = nomContrat.toLowerCase();
    if (name.includes('rc')) return 'RC';
    if (name.includes('protection juridique') || name.includes('défense recours') || name.includes('defense recours') || name.includes('pj')) return 'PJ';
    if (name.includes('cancelr')) return 'CR';
    if (name.includes('annulation')) return 'ANN';
    if (name.includes('interruption')) return 'ITR';
    if (name.includes('intempéries') || name.includes('intemperies')) return 'INT';
    if (name.includes('individuelle accident') || name.includes('ia') || name.includes('ia gsl')) {
      let num = '';
      if (name.includes('annuelle')) {
        const match = name.match(/niveau\s*(\d+)/);
        if (match) num = match[1];
        return 'IAA' + num;
      } else {
        const match = name.match(/formule\s*(\d+)/);
        if (match) num = match[1];
        return 'IA' + num;
      }
    }
    return '?';
  }
}
