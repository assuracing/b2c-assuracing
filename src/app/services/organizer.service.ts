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

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }

  getOrganizerByName(organizerName: string): Observable<PartnerOrganizer | null> {
    if (!organizerName) {
      return of(null);
    }

    const normalizedTarget = organizerName.toLowerCase();

    return this.http.get<PartnerOrganizer[]>(`${this.apiUrl}/api/partners`).pipe(
      map(partners => {
        if (!partners || partners.length === 0) {
          return null;
        }

        return partners.find(partner =>
          partner?.nom && partner.nom.toLowerCase() === normalizedTarget
        ) || null;
      }),
      catchError(() => of(null))
    );
  }
}
