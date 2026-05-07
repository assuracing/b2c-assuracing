import { Injectable, Provider } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

export const MOMENT_DATE_FORMATS = {
  parse: {
    dateInput: 'L',
  },
  display: {
    dateInput: 'L',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function provideMomentDatepicker(): Provider[] {
  return [
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (translateService: TranslateService) => {
        const currentLang = translateService.currentLang || translateService.defaultLang || 'fr';
        return currentLang.toLowerCase().startsWith('en') ? 'en' : 'fr';
      },
      deps: [TranslateService],
    },
    { provide: MAT_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: false } },
  ];
}

@Injectable({
  providedIn: 'root'
})
export class DateLocaleService {
  
  constructor(private translateService: TranslateService) {}

  getLocale(): string {
    const currentLang = this.translateService.currentLang || this.translateService.defaultLang || 'fr';
    return this.mapLanguageToLocale(currentLang);
  }

  private mapLanguageToLocale(lang: string): string {
    if (!lang) return 'fr';
    const normalized = lang.toLowerCase();
    if (normalized.startsWith('fr')) return 'fr';
    if (normalized.startsWith('en')) return 'en';
    return 'fr';
  }

  setAdapterLocale(dateAdapter: DateAdapter<any>): void {
    const locale = this.getLocale();
    let loader: Promise<any>;
    if (locale === 'fr') {
      loader = import('moment/locale/fr');
    } else if (locale.startsWith('en')) {
      loader = import('moment/locale/en-gb');
    } else {
      loader = import('moment/locale/fr');
    }

    loader.catch(() => null).finally(() => {
      moment.locale(locale);
      if (dateAdapter && dateAdapter.setLocale) {
        dateAdapter.setLocale(locale);
      }
    });
  }

  bindAdapterLocale(dateAdapter: DateAdapter<any>): Subscription {
    this.setAdapterLocale(dateAdapter);
    return this.translateService.onLangChange.subscribe(() => {
      this.setAdapterLocale(dateAdapter);
    });
  }

  formatDate(value: string | Date): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const currentLang = this.translateService.currentLang || this.translateService.defaultLang || 'fr';
    const isEnglish = currentLang.toLowerCase().startsWith('en');
    
    const monthsFr = [
      'janv.', 'févr.', 'mars',
      'avr.', 'mai', 'juin',
      'juil.', 'août', 'sept.',
      'oct.', 'nov.', 'déc.'
    ];
    const monthsEn = [
      'Jan.', 'Feb.', 'Mar.',
      'Apr.', 'May', 'Jun.',
      'Jul.', 'Aug.', 'Sep.',
      'Oct.', 'Nov.', 'Dec.'
    ];
    
    const months = isEnglish ? monthsEn : monthsFr;
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
