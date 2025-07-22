import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryFlagService {
  private countryToCode: { [key: string]: string } = {
    'FRANCE': 'france',
    'FR': 'france',
    'ES': 'espagne',
    'DE': 'allemagne',
    'IT': 'italie',
    'PT': 'portugal',
    'BE': 'belgique',
    'NL': 'pays-bas',
    'AT': 'autriche',
    'SK': 'slovaquie',
    'CZ': 'republique-tcheque',
    'BHR': 'bahrain',
    'HR' : 'croatie',
    'Espagne' : 'espagne'
  };

  getCountryFlagUrl(countryCode: string): string {
    if (!countryCode) return 'flags/default.png';
    
    const normalizedCode = this.countryToCode[countryCode.toUpperCase()];
    if (!normalizedCode) return 'flags/default.png';

    console.log("COde normalisé : ", normalizedCode);
    
    return `flags/${normalizedCode}.png`;
  }
}
