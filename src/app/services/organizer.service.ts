import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  private apiUrl: string;

  private readonly PRODUCT_CODES = {
    PROTECTION_1: 30,
    PROTECTION_2: 31,
    PROTECTION_3: 32,
    PROTECTION_4: 33,
    PROTECTION_5: 34,
    
    PROTECTION_1_COMP: 35,
    PROTECTION_2_COMP: 36,
    PROTECTION_3_COMP: 37,
    PROTECTION_4_COMP: 38,
    PROTECTION_5_COMP: 39,
    INTEMPERIES: 43,
  };

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }

  isProductAvailable(organizerName: string, productKey: keyof typeof this.PRODUCT_CODES): Observable<boolean> {
    const productId = this.PRODUCT_CODES[productKey];
    if (!productId) {
      throw new Error(`Code produit invalide: ${productKey}`);
    }

    return this.http.get<any[]>(`${this.apiUrl}/api/allorganisateursclientent/${productId}`).pipe(
      map(organizers => {
        return organizers.some(org => 
          org.nom && organizerName && 
          org.nom.trim().toLowerCase() === organizerName.trim().toLowerCase()
        );
      }),
      catchError(err => {
        console.error('Erreur lors de la vérification du produit', err);
        return of(false);
      })
    );
  }

  checkProductsAvailability(organizerName: string, productKeys: Array<keyof typeof this.PRODUCT_CODES>): Observable<Record<string, boolean>> {
    if (!organizerName || productKeys.length === 0) {
      return of({});
    }

    const checks = productKeys.map(productKey => 
      this.isProductAvailable(organizerName, productKey).pipe(
        map(isAvailable => ({ [productKey]: isAvailable }))
      )
    );

    return forkJoin(checks).pipe(
      map((results) => {
        return results.reduce<Record<string, boolean>>((acc, curr) => ({
          ...acc,
          ...curr
        }), {});
      })
    );
  }

  getOrganizersForProduct(productKey: keyof typeof this.PRODUCT_CODES): Observable<Array<{id: string, nom: string}>> {
    const productId = this.PRODUCT_CODES[productKey];
    if (!productId) {
      console.error(`Code produit invalide: ${productKey}`);
      return of([]);
    }
    
    return this.http.get<Array<{id: string, nom: string}>>(
      `${this.apiUrl}/api/allorganisateursclientent/${productId}`
    ).pipe(
      catchError((error: any) => {
        console.error(`Erreur lors de la récupération des organisateurs pour le produit ${productKey}:`, error);
        return of([]);
      })
    );
  }
}
