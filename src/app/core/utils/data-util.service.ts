import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataUtilService {

  constructor() { }

  downloadFile(data: string, contentType: string | null | undefined, filename: string): void {
    contentType = contentType ?? '';

    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const fileURL = window.URL.createObjectURL(blob);
    const win = window.open(fileURL);
    if (win) {
      win.onload = function () {
        URL.revokeObjectURL(fileURL);
      };
    }
  }

  byteSize(field: any): string {
    if (field) {
      if (typeof field === 'string') {
        return field.length + ' bytes';
      } else {
        return field.size + ' bytes';
      }
    }
    return '';
  }
}
