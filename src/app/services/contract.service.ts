// contract.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../core/services/environment.service';

export interface PrixDTO {
  prixProduitCompagnieTTC: number;
  commision: number;
  taxes: number;
  fraisDeCourtage: number;
  honoraires: number;
  commissionApporteur: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = `${this.envService.apiUrl}/api`;
    console.log(this.apiUrl);
  }

  createContratB2C(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createContractB2C`, data);
  }

  calculatePrice(data: any): Observable<PrixDTO> {
    return this.http.post<PrixDTO>(`${this.apiUrl}/getPrix`, data);
  }
}