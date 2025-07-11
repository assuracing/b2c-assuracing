// contract.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  createContratB2C(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createContractB2C`, data);
  }

  calculatePrice(data: any): Observable<PrixDTO> {
    return this.http.post<PrixDTO>(`${this.apiUrl}/getPrix`, data);
  }
}