import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';

type PartnerOrganizer = {
  nom: string;
  premiumassuracing: boolean;
  rco: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private apiUrl: string;

  private readonly ORGANIZER_NAME_STOP_WORDS = new Set([
    'de',
    'des',
    'du',
    'le',
    'la',
    'les',
    'l',
    'd',
    'et',
    'and',
  ]);

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }

  private normalizeOrganizerName(value: string): string {
    return (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[\/|+,.;:()\[\]{}'"’`-]/g, ' ')
      .replace(/\s+/g, '')
      .trim();
  }

  private getSignificantTokens(value: string): string[] {
    return this.normalizeOrganizerName(value)
      .split(' ')
      .map(token => token.trim())
      .filter(token => token.length > 1 && !this.ORGANIZER_NAME_STOP_WORDS.has(token));
  }

  private scoreOrganizerMatch(targetName: string, candidateName: string): number {
    const normalizedTarget = this.normalizeOrganizerName(targetName);
    const normalizedCandidate = this.normalizeOrganizerName(candidateName);

    if (!normalizedTarget || !normalizedCandidate) {
      return 0;
    }

    // Match exact après normalisation (sans espaces)
    if (normalizedTarget === normalizedCandidate) {
      return 100;
    }

    // Si l'un contient l'autre (sans espaces)
    if (normalizedTarget.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedTarget)) {
      return 92;
    }

    // Levenshtein distance simplifiée pour les variations mineures (s/t, espaces)
    const levenshteinScore = this.calculateSimilarity(normalizedTarget, normalizedCandidate);
    if (levenshteinScore >= 85) {
      return levenshteinScore;
    }

    const targetTokens = this.getSignificantTokens(targetName);
    const candidateTokens = this.getSignificantTokens(candidateName);

    if (targetTokens.length === 0 || candidateTokens.length === 0) {
      return levenshteinScore;
    }

    const candidateTokenSet = new Set(candidateTokens);
    const commonTokens = targetTokens.filter(token => candidateTokenSet.has(token));
    const overlapRatio = commonTokens.length / Math.max(targetTokens.length, candidateTokens.length);

    if (commonTokens.length >= 2) {
      return Math.round(70 + overlapRatio * 25);
    }

    return Math.round(Math.max(levenshteinScore, overlapRatio * 60));
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 100;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return Math.round((1 - editDistance / longer.length) * 100);
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  private findBestOrganizerMatch<T extends { nom?: string }>(targetName: string, organizers: T[]): T | null {
    if (!targetName || !organizers || organizers.length === 0) {
      return null;
    }

    let bestMatch: T | null = null;
    let bestScore = 0;

    for (const organizer of organizers) {
      if (!organizer?.nom) {
        continue;
      }

      const score = this.scoreOrganizerMatch(targetName, organizer.nom);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = organizer;
      }
    }

    return bestScore >= 70 ? bestMatch : null;
  }

  getOrganizerByName(organizerName: string): Observable<PartnerOrganizer | null> {
    if (!organizerName) {
      return of(null);
    }

    return this.http.get<PartnerOrganizer[]>(`${this.apiUrl}/api/partners`).pipe(
      map(partners => this.findBestOrganizerMatch(organizerName, partners)),
      catchError(() => of(null))
    );
  }
}
