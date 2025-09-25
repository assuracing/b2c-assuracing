// contract.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../core/services/environment.service';
import { getAuthHeaders } from '../core/utils/http-utils';

export interface PrixDTO {
  prixProduitCompagnieTTC: number;
  commision: number;
  taxes: number;
  fraisDeCourtage: number;
  honoraires: number;
  commissionApporteur: number;
}

export interface ContractDetail {
  id: number;
  transactionUID: string;
  dateAdhesion: string;
  dateFin: string;
  dateSaisie: string;
  validated: boolean;
  autre: string | null;
  montantGarantie: number;
  clientPrenom: string;
  clientEmail: string;
  vehicule: {
    id: number;
    type: string | null;
    marque: string | null;
    model: string;
    immatriculation: string | null;
    numeroserie: string | null;
    numerochassis: string | null;
  };
  circuit: {
    id: number;
    nom: string;
    pays?: string;
  };
  produit: {
    id: number;
    nom: string;
  };
  client: {
    id: number;
    nom: string;
  };
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
  }

  createContratB2C(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/createContractB2C`, 
      data, 
      getAuthHeaders()
    );
  }

  calculatePrice(data: any): Observable<PrixDTO> {
    return this.http.post<PrixDTO>(
      `${this.apiUrl}/getPrix`, 
      data, 
      getAuthHeaders()
    );
  }

  getContractDetails(contractId: number): Observable<ContractDetail> {
    return this.http.get<ContractDetail>(
      `${this.apiUrl}/contrats/${contractId}`, 
      { ...getAuthHeaders() }
    );
  }

  getContractFiles(contractId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/fichiers?contratId=${contractId}`, 
      { ...getAuthHeaders() }
    );
  }

  initiateContractPayment(transactionUID: string, email: string, montant?: number): string {
    let paymentUrl = `${this.envService.appUrl}/payment-confirm?orderid=${transactionUID}&email=${encodeURIComponent(email)}&language=fr`;    
    return paymentUrl;
  }

  getVehiculeDetails(vehiculeId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/vehicules/${vehiculeId}`, 
      { ...getAuthHeaders() }
    );
  }
}