import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  Bank, 
  ProfessionalCategory, 
  City, 
  PricingPayload, 
  PricingResult, 
  ApiError 
} from '../models/mortgage-insurance.models';

@Injectable({
  providedIn: 'root'
})
export class AprilApiService {
  private readonly baseUrl = 'http://localhost:8080/api/april';
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Content-Type', 'application/json');
  }

  getBanks(): Observable<Bank[]> {
    return this.http.get<Bank[]>(`${this.baseUrl}/banks`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error fetching banks:', error);
        return throwError(() => error);
      })
    );
  }

  getProfessionalCategories(): Observable<ProfessionalCategory[]> {
    return this.http.get<ProfessionalCategory[]>(`${this.baseUrl}/products/ADPIntegral/professionalCategories`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(error => {
        console.error('Error fetching professional categories:', error);
        return throwError(() => error);
      })
    );
  }

  getCities(postCode: string): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/countries/FR/cities`, { 
      headers: this.getHeaders(),
      params: { cityCode: postCode }
    }).pipe(
      catchError(error => {
        console.error('Error fetching cities:', error);
        return throwError(() => error);
      })
    );
  }

  getPricingRecommendation(payload: PricingPayload): Observable<PricingResult[]> {
    return this.http.post<PricingResult[]>(
      `${this.baseUrl}/projects/prices`,
      payload,
      { 
        headers: this.getHeaders(),
        params: { pricingType: 'Recommendation' }
      }
    ).pipe(
      catchError(error => {
        console.error('Error fetching pricing recommendation:', error);
        return throwError(() => error);
      })
    );
  }

  generateQuotation(payload: PricingPayload): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/projects/documents`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error generating quotation:', error);
        return throwError(() => error);
      })
    );
  }
}
