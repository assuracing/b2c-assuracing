import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryNationalityService {
  private nationalitiesFrenchMap: { [key: string]: string } = {
    'Française': 'french',
    'Allemande': 'german',
    'Autrichienne': 'austrian',
    'Belge': 'belgian',
    'Britannique': 'british',
    'Bulgare': 'bulgarian',
    'Chypriote': 'cypriot',
    'Croate': 'croatian',
    'Danoise': 'danish',
    'Espagnole': 'spanish',
    'Estonienne': 'estonian',
    'Finlandaise': 'finnish',
    'Grecque': 'greek',
    'Hongroise': 'hungarian',
    'Irlandaise': 'irish',
    'Italienne': 'italian',
    'Lettone': 'latvian',
    'Lituanienne': 'lithuanian',
    'Luxembourgeoise': 'luxembourgish',
    'Maltaise': 'maltese',
    'Néerlandaise': 'dutch',
    'Polonaise': 'polish',
    'Portugaise': 'portuguese',
    'Roumaine': 'romanian',
    'Slovaque': 'slovak',
    'Slovène': 'slovenian',
    'Suédoise': 'swedish',
    'Suisse': 'swiss',
    'Tchèque': 'czech'
  };

  private countriesFrenchMap: { [key: string]: string } = {
    'France': 'france',
    'Afghanistan': 'afghanistan',
    'Albanie': 'albania',
    'Algérie': 'algeria',
    'Allemagne': 'germany',
    'Andorre': 'andorra',
    'Angola': 'angola',
    'Antigua-et-Barbuda': 'antiguaBarbuda',
    'Arabie saoudite': 'saudiArabia',
    'Arabie Saoudite': 'saudiArabia',
    'Argentine': 'argentina',
    'Arménie': 'armenia',
    'Australie': 'australia',
    'Autriche': 'austria',
    'Azerbaïdjan': 'azerbaijan',
    'Bahamas': 'bahamas',
    'Bahreïn': 'bahrain',
    'Bangladesh': 'bangladesh',
    'Barbade': 'barbados',
    'Belgique': 'belgium',
    'Bélize': 'belize',
    'Belize': 'belize',
    'Bénin': 'benin',
    'Bhoutan': 'bhutan',
    'Biélorussie': 'belarus',
    'Birmanie': 'burma',
    'Myanmar': 'burma',
    'Bolivie': 'bolivia',
    'Bosnie-Herzégovine': 'bosniaHerzegovina',
    'Botswana': 'botswana',
    'Brésil': 'brazil',
    'Brunei': 'brunei',
    'Bulgarie': 'bulgaria',
    'Burkina Faso': 'burkinaFaso',
    'Burundi': 'burundi',
    'Cambodge': 'cambodia',
    'Cameroun': 'cameroon',
    'Canada': 'canada',
    'Cap-Vert': 'capVerde',
    'Chili': 'chile',
    'Chine': 'china',
    'Chypre': 'cyprus',
    'Colombie': 'colombia',
    'Comores': 'comoros',
    'Congo (Brazzaville)': 'congo',
    'Congo (Kinshasa)': 'democraticRepublicOfCongo',
    'Corée du Nord': 'northKorea',
    'Corée du Sud': 'southKorea',
    'Costa Rica': 'costaRica',
    'Côte d\'Ivoire': 'ivoryCoast',
    'Croatie': 'croatia',
    'Cuba': 'cuba',
    'Danemark': 'denmark',
    'Djibouti': 'djibouti',
    'Dominique': 'dominica',
    'Égypte': 'egypt',
    'Émirats arabes unis': 'uae',
    'Émirats Arabes Unis': 'uae',
    'Équateur': 'ecuador',
    'Érythrée': 'eritrea',
    'Espagne': 'spain',
    'Estonie': 'estonia',
    'Eswatini': 'eswatini',
    'États-Unis': 'usa',
    'Éthiopie': 'ethiopia',
    'Fidji': 'fiji',
    'Finlande': 'finland',
    'Gabon': 'gabon',
    'Gambie': 'gambia',
    'Géorgie': 'georgia',
    'Ghana': 'ghana',
    'Grèce': 'greece',
    'Grenade': 'grenada',
    'Guatemala': 'guatemala',
    'Guinée': 'guinea',
    'Guinée équatoriale': 'equatorialGuinea',
    'Guinée-Bissau': 'guineaBissau',
    'Guyana': 'guyana',
    'Haïti': 'haiti',
    'Honduras': 'honduras',
    'Hongrie': 'hungary',
    'Îles Marshall': 'marshallIslands',
    'Inde': 'india',
    'Indonésie': 'indonesia',
    'Irak': 'iraq',
    'Iran': 'iran',
    'Irlande': 'ireland',
    'Islande': 'iceland',
    'Israël': 'israel',
    'Italie': 'italy',
    'Jamaïque': 'jamaica',
    'Japon': 'japan',
    'Jordanie': 'jordan',
    'Kazakhstan': 'kazakhstan',
    'Kenya': 'kenya',
    'Kirghizistan': 'kyrgyzstan',
    'Kiribati': 'kiribati',
    'Koweït': 'kuwait',
    'Laos': 'laos',
    'Lesotho': 'lesotho',
    'Lettonie': 'latvia',
    'Liban': 'lebanon',
    'Liberia': 'liberia',
    'Libye': 'libya',
    'Liechtenstein': 'liechtenstein',
    'Lituanie': 'lithuania',
    'Luxembourg': 'luxembourg',
    'Macédoine du Nord': 'northMacedonia',
    'Madagascar': 'madagascar',
    'Malaisie': 'malaysia',
    'Malawi': 'malawi',
    'Maldives': 'maldives',
    'Mali': 'mali',
    'Malte': 'malta',
    'Maroc': 'morocco',
    'Maurice': 'mauritius',
    'Mauritanie': 'mauritania',
    'Mexique': 'mexico',
    'Micronésie': 'micronesia',
    'Moldavie': 'moldova',
    'Monaco': 'monaco',
    'Mongolie': 'mongolia',
    'Monténégro': 'montenegro',
    'Mozambique': 'mozambique',
    'Namibie': 'namibia',
    'Nauru': 'nauru',
    'Népal': 'nepal',
    'Nicaragua': 'nicaragua',
    'Niger': 'niger',
    'Nigeria': 'nigeria',
    'Norvège': 'norway',
    'Nouvelle-Zélande': 'newZealand',
    'Oman': 'oman',
    'Ouganda': 'uganda',
    'Ouzbékistan': 'uzbekistan',
    'Pakistan': 'pakistan',
    'Palaos': 'palau',
    'Palestine': 'palestine',
    'Panama': 'panama',
    'Papouasie-Nouvelle-Guinée': 'papuaNewGuinea',
    'Paraguay': 'paraguay',
    'Pays-Bas': 'netherlands',
    'Pérou': 'peru',
    'Philippines': 'philippines',
    'Pologne': 'poland',
    'Portugal': 'portugal',
    'Qatar': 'qatar',
    'République centrafricaine': 'centralAfricanRepublic',
    'République dominicaine': 'dominicanRepublic',
    'République tchèque': 'czechRepublic',
    'Roumanie': 'romania',
    'Royaume-Uni': 'unitedKingdom',
    'Russie': 'russia',
    'Rwanda': 'rwanda',
    'Saint-Christophe-et-Niévès': 'saintKittsAndNevis',
    'Sainte-Lucie': 'saintLucia',
    'Saint-Marin': 'sanMarino',
    'Saint-Vincent-et-les-Grenadines': 'saintVincentAndTheGrenadines',
    'Salvador': 'elSalvador',
    'Samoa': 'samoa',
    'Sao Tomé-et-Principe': 'saoTomeAndPrincipe',
    'Sénégal': 'senegal',
    'Serbie': 'serbia',
    'Seychelles': 'seychelles',
    'Sierra Leone': 'sierraLeone',
    'Singapour': 'singapore',
    'Slovaquie': 'slovakia',
    'Slovénie': 'slovenia',
    'Somalie': 'somalia',
    'Soudan': 'sudan',
    'Soudan du Sud': 'southSudan',
    'Sri Lanka': 'sriLanka',
    'Suède': 'sweden',
    'Suisse': 'switzerland',
    'Suriname': 'suriname',
    'Syrie': 'syria',
    'Tadjikistan': 'tajikistan',
    'Tanzanie': 'tanzania',
    'Tchad': 'chad',
    'Thaïlande': 'thailand',
    'Timor oriental': 'eastTimor',
    'Togo': 'togo',
    'Tonga': 'tonga',
    'Trinité-et-Tobago': 'trinidadAndTobago',
    'Tunisie': 'tunisia',
    'Turkménistan': 'turkmenistan',
    'Turquie': 'turkey',
    'Tuvalu': 'tuvalu',
    'Ukraine': 'ukraine',
    'Uruguay': 'uruguay',
    'Vanuatu': 'vanuatu',
    'Vatican': 'vatican',
    'Venezuela': 'venezuela',
    'Viêt Nam': 'vietnam',
    'Yémen': 'yemen',
    'Zambie': 'zambia',
    'Zimbabwe': 'zimbabwe'
  };

  private countriesKeys = [
    'france', 'afghanistan', 'albania', 'algeria', 'germany', 'andorra', 'angola',
    'antiguaBarbuda', 'saudiArabia', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan', 'bahamas',
    'bahrain', 'bangladesh', 'barbados', 'belgium', 'belize', 'benin', 'bhutan', 'belarus', 'burma',
    'bolivia', 'bosniaHerzegovina', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burkinaFaso', 'burundi',
    'cambodia', 'cameroon', 'canada', 'capVerde', 'chile', 'china', 'cyprus', 'colombia', 'comoros', 'congo', 'democraticRepublicOfCongo',
    'northKorea', 'southKorea', 'costaRica', 'ivoryCoast', 'croatia', 'cuba', 'denmark', 'djibouti',
    'dominica', 'egypt', 'uae', 'ecuador', 'eritrea', 'spain', 'estonia', 'eswatini', 'usa', 'ethiopia',
    'fiji', 'finland', 'gabon', 'gambia', 'georgia', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea',
    'equatorialGuinea', 'guineaBissau', 'guyana', 'haiti', 'honduras', 'hungary', 'marshallIslands',
    'india', 'indonesia', 'iraq', 'iran', 'ireland', 'iceland', 'israel', 'italy',
    'jamaica', 'japan', 'jordan', 'kazakhstan', 'kenya', 'kyrgyzstan', 'kiribati', 'kuwait', 'laos',
    'lesotho', 'latvia', 'lebanon', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg',
    'northMacedonia', 'madagascar', 'malaysia', 'malawi', 'maldives', 'mali', 'malta', 'morocco', 'mauritius',
    'mauritania', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'mozambique',
    'namibia', 'nauru', 'nepal', 'nicaragua', 'niger', 'nigeria', 'norway', 'newZealand', 'oman', 'uganda',
    'uzbekistan', 'pakistan', 'palau', 'palestine', 'panama', 'papuaNewGuinea', 'paraguay', 'netherlands', 'peru',
    'philippines', 'poland', 'portugal', 'qatar', 'centralAfricanRepublic',
    'dominicanRepublic', 'czechRepublic', 'romania', 'unitedKingdom', 'russia', 'rwanda', 'saintKittsAndNevis',
    'saintLucia', 'sanMarino', 'saintVincentAndTheGrenadines', 'elSalvador', 'samoa', 'saoTomeAndPrincipe',
    'senegal', 'serbia', 'seychelles', 'sierraLeone', 'singapore', 'slovakia', 'slovenia', 'somalia',
    'sudan', 'southSudan', 'sriLanka', 'sweden', 'switzerland', 'suriname', 'syria', 'tajikistan', 'tanzania',
    'chad', 'thailand', 'eastTimor', 'togo', 'tonga', 'trinidadAndTobago', 'tunisia', 'turkmenistan', 'turkey',
    'tuvalu', 'ukraine', 'uruguay', 'vanuatu', 'vatican', 'venezuela', 'vietnam', 'yemen', 'zambia', 'zimbabwe'
  ];

  private nationalitiesKeys = [
    'french', 'german', 'austrian', 'belgian', 'british', 'bulgarian', 'cypriot', 'croatian',
    'danish', 'spanish', 'estonian', 'finnish', 'greek', 'hungarian', 'irish', 'italian',
    'latvian', 'lithuanian', 'luxembourgish', 'maltese', 'dutch', 'polish', 'portuguese',
    'romanian', 'slovak', 'slovenian', 'swedish', 'swiss', 'czech'
  ];

  public nationalities: string[] = [];
  public nationalitiesMap: Map<string, string> = new Map();
  public countries: string[] = [];
  public countriesMap: Map<string, string> = new Map();
  public filteredCountries: string[] = [];
  private _allCountries: string[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private translate: TranslateService) {
    this.updateNationalities();
    this.updateCountries();
    this.subscription.add(
      this.translate.onLangChange.subscribe(() => {
        this.updateNationalities();
        this.updateCountries();
      })
    );
  }

  private updateNationalities(): void {
    this.nationalitiesMap.clear();
    this.nationalities = this.nationalitiesKeys.map(key => {
      const translation = this.translate.instant(`nationalities.${key}`);
      this.nationalitiesMap.set(key, translation);
      return key;
    });
  }

  private updateCountries(): void {
    this.countriesMap.clear();
    this.countries = this.countriesKeys.map(key => {
      const translation = this.translate.instant(`countries.${key}`);
      this.countriesMap.set(key, translation);
      return key;
    });
    this._allCountries = [...this.countries];
    this.filteredCountries = [...this.countries];
  }

  public getCountryKeyByValue(value: string): string {
    if (!value) {
      return '';
    }

    if (this.countriesKeys.includes(value)) {
      return value;
    }

    if (this.countriesFrenchMap[value]) {
      return this.countriesFrenchMap[value];
    }
    
    for (const [key, translation] of this.countriesMap.entries()) {
      if (translation === value) {
        return key;
      }
    }
    
    return '';
  }

  public getNationalityKeyByValue(value: string): string {
    if (!value) {
      return '';
    }

    if (this.nationalitiesKeys.includes(value)) {
      return value;
    }

    if (this.nationalitiesFrenchMap[value]) {
      return this.nationalitiesFrenchMap[value];
    }
    
    for (const [key, translation] of this.nationalitiesMap.entries()) {
      if (translation === value) {
        return key;
      }
    }
    
    return '';
  }

  public getFrenchCountryLabelByKey(countryKey: string): string {
    if (!countryKey) {
      return '';
    }

    const frenchEntry = Object.entries(this.countriesFrenchMap).find(([, key]) => key === countryKey);
    return frenchEntry ? frenchEntry[0] : countryKey;
  }

  public getFrenchNationalityLabelByKey(nationalityKey: string): string {
    if (!nationalityKey) {
      return '';
    }

    const frenchEntry = Object.entries(this.nationalitiesFrenchMap).find(([, key]) => key === nationalityKey);
    return frenchEntry ? frenchEntry[0] : nationalityKey;
  }

  public filterCountries(searchValue: string): void {
    this.filteredCountries = this.countries.filter(countryKey => 
      (this.countriesMap.get(countryKey) || '').toLowerCase().includes(searchValue.toLowerCase())
    );
  }

  public resetCountryFilter(): void {
    this.filteredCountries = [...this._allCountries];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
