import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';
import { getAuthHeaders } from '../core/utils/http-utils';

export interface UserConsents {
  cgu: boolean;
  privacyPolicy: boolean;
  healthDataConsent: boolean;
  commercialOffers: boolean;
  acceptedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConsentService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }

  getConsentHistory(adherentId: number): Observable<UserConsents | null> {
    return this.http.get<any>(`${this.apiUrl}/api/consent/${adherentId}`, getAuthHeaders()).pipe(
      map((consentDTO) => {
        if (!consentDTO) {
          return null;
        }

        const consents: UserConsents = {
          cgu: consentDTO.cguConsent ?? false,
          privacyPolicy: consentDTO.privacyPolicyConsent ?? false,
          healthDataConsent: consentDTO.healthDataConsent ?? false,
          commercialOffers: consentDTO.commercialOffersConsent ?? false,
          acceptedAt: consentDTO.consentDate
        };
        return consents;
      })
    );
  }

  saveConsentHistory(adherentId: number, consents: UserConsents): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api/consent/${adherentId}`,
      {
        cguConsent: consents.cgu,
        privacyPolicyConsent: consents.privacyPolicy,
        healthDataConsent: consents.healthDataConsent,
        commercialOffersConsent: consents.commercialOffers
      },
      getAuthHeaders()
    );
  }
}
