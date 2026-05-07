import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  private monthsFr = [
    'janv.', 'févr.', 'mars',
    'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.',
    'oct.', 'nov.', 'déc.'
  ];
  private monthsEn = [
    'Jan.', 'Feb.', 'Mar.',
    'Apr.', 'May', 'Jun.',
    'Jul.', 'Aug.', 'Sep.',
    'Oct.', 'Nov.', 'Dec.'
  ];

  constructor(private translate: TranslateService) {}

  transform(value: string | Date): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const currentLang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    const months = currentLang.toLowerCase().startsWith('en') ? this.monthsEn : this.monthsFr;
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
