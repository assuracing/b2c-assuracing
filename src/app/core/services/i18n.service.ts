import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage$ = new BehaviorSubject<string>('fr');
  private readonly LANGUAGE_KEY = 'app-language';
  private readonly SUPPORTED_LANGUAGES = ['fr', 'en'];

  constructor(private translateService: TranslateService) {
    this.initializeTranslation();
  }

  private initializeTranslation(): void {
    const savedLanguage = this.getSavedLanguage();
    this.setLanguage(savedLanguage);
  }


  setLanguage(language: string): void {
    if (!this.SUPPORTED_LANGUAGES.includes(language)) {
      language = 'fr';
    }
    
    this.translateService.use(language);
    this.currentLanguage$.next(language);
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  getCurrentLanguage(): string {
    return this.currentLanguage$.value;
  }

  getCurrentLanguage$(): Observable<string> {
    return this.currentLanguage$.asObservable();
  }

  private getSavedLanguage(): string {
    const saved = localStorage.getItem(this.LANGUAGE_KEY);
    if (saved && this.SUPPORTED_LANGUAGES.includes(saved)) {
      return saved;
    }
    return 'fr';
  }

}
