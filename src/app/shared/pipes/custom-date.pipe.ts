import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  private months = [
    'janv.', 'févr.', 'mars',
    'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.',
    'oct.', 'nov.', 'déc.'
  ];

  transform(value: string | Date): string {
    if (!value) return '';
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const day = date.getDate();
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
