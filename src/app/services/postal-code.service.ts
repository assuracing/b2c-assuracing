import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';

export interface PostalCodeInfo {
  code: string;
  city: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostalCodeService {
  private readonly API_URL: string;

  constructor(private http: HttpClient, private envService: EnvironmentService) {
    this.API_URL = `${this.envService.apiUrl}/api/postal-codes`;
  }

  searchPostalCodes(prefix: string): Observable<PostalCodeInfo[]> {
    if (!prefix || !/^\d*$/.test(prefix)) {
      return of([]);
    }

    return this.http.get<PostalCodeInfo[]>(this.API_URL, {
      params: { prefix }
    }).pipe(
      catchError(error => {
        console.error('Error fetching postal codes:', error);
        return of([]);
      })
    );
  }
}