import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SourceService {
  private readonly KEY = 'source';
  private readonly allowedSources = new Set([
    'quickracing',
    'quickracing_home',
    'quickracing_event',
    'quickracing_sortie',
    'quickracing_guest_web',
    'quickracing_guest_app',
  ]);

  initFromUrl(): void {
    const source = this.normalizeSource(new URLSearchParams(window.location.search).get('source'));
    if (source) {
      sessionStorage.setItem(this.KEY, source);
    }
  }

  getSource(): string | null {
    return sessionStorage.getItem(this.KEY);
  }

  private normalizeSource(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 30);
    if (!normalized) {
      return null;
    }

    return this.allowedSources.has(normalized) ? normalized : null;
  }
}
