import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';
import { getAuthHeaders } from '../core/utils/http-utils';
import { TranslateService } from '@ngx-translate/core';
import {
  Claim,
  ClaimType,
  ClaimTypeDTO,
  ClaimRequest,
  ClaimResponse,
  Fichier,
  FileUploadResponse,
  FileUploadRequest,
  RequiredDocuments,
  TypeCauseSinistre,
  Product
} from '../models/claim.model';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {
  private apiUrl: string;

  private requiredDocuments: RequiredDocuments = {
    [ClaimType.ANNULATION]: ['JUSTIFICATIF', 'RIB'],
    [ClaimType.INTERRUPTION]: ['JUSTIFICATIF', 'RIB'],
    [ClaimType.INTEMPERIES]: ['JUSTIFICATIF']
  };

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private translate: TranslateService
  ) {
    this.apiUrl = `${this.envService.apiUrl}/api`;
  }

  getClaimTypes(): Observable<ClaimTypeDTO[]> {
    const claimTypes: ClaimTypeDTO[] = [
      {
        id: 1,
        code: 'ANNULATION',
        libelle: this.translate?.instant('productNames.annulation') || 'Annulation',
        description: this.translate?.instant('claimDescriptions.annulation') || 'Garantie annulation avec remboursement jusqu\'à 100%'
      },
      {
        id: 2,
        code: 'INTERRUPTION',
        libelle: this.translate?.instant('productNames.interruption') || 'Interruption',
        description: this.translate?.instant('claimDescriptions.interruption') || 'Garantie interruption sans hospitalisation requise'
      },
      {
        id: 3,
        code: 'INTEMPERIES',
        libelle: this.translate?.instant('productNames.badWeather') || 'Intempéries',
        description: this.translate?.instant('claimDescriptions.badWeather') || 'Garantie intempéries/mauvaises conditions'
      }
    ];
    
    return new Observable(observer => {
      observer.next(claimTypes);
      observer.complete();
    });
  }

  getTypeCauseSinistres(contractId: number): Observable<TypeCauseSinistre[]> {
    return this.http.get<TypeCauseSinistre[]>(
      `${this.apiUrl}/type-cause-sinistres?contratId=${contractId}`,
      getAuthHeaders()
    );
  }

  getTypeSinistres(contractId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/type-sinistres?contratId=${contractId}`,
      getAuthHeaders()
    ).pipe(
      catchError((error) => {
        return this.getClaimTypes().pipe(
          map(types => types as any[])
        );
      })
    );
  }

  getProduct(produitId: number): Observable<Product> {
    return this.http.get<Product>(
      `${this.apiUrl}/produits/${produitId}`,
      getAuthHeaders()
    );
  }

  getTypeSinistreId(code: string): number {
    const typeMap: { [key: string]: number } = {
      'ANNULATION': 2,
      'INTERRUPTION': 12,
      'INTEMPERIES': 13
    };
    return typeMap[code] || 0;
  }

  createClaim(data: ClaimRequest): Observable<ClaimResponse> {
    return this.http.post<ClaimResponse>(
      `${this.apiUrl}/sinistres`,
      data,
      getAuthHeaders()
    );
  }

  uploadFile(fileData: FileUploadRequest): Observable<FileUploadResponse> {
    return this.http.post<FileUploadResponse>(
      `${this.apiUrl}/fichiers`,
      fileData,
      getAuthHeaders()
    );
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(
      `${this.apiUrl}/sinistres/${id}`,
      getAuthHeaders()
    );
  }

  getClaimsByYear(year: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(
      `${this.apiUrl}/getAllSinistre/${year}`,
      getAuthHeaders()
    );
  }

  getClaimsForContract(contractId: number): Observable<Claim[]> {
    return this.http.get<Claim[]>(
      `${this.apiUrl}/sinistres?contratId=${contractId}`,
      getAuthHeaders()
    );
  }

  updateClaim(id: number, data: Partial<Claim>): Observable<Claim> {
    return this.http.put<Claim>(
      `${this.apiUrl}/sinistres/${id}`,
      data,
      getAuthHeaders()
    );
  }

  deleteFile(fichierID: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/fichiers/${fichierID}`,
      getAuthHeaders()
    );
  }

  getRequiredDocuments(claimType: string): string[] {
    return this.requiredDocuments[claimType] || [];
  }

  areAllRequiredDocumentsPresent(claimType: string, fichiers: Fichier[]): boolean {
    const required = this.getRequiredDocuments(claimType);
    const uploadedTypes = fichiers.map(f => f.type);
    return required.every(docType => uploadedTypes.includes(docType));
  }

  deleteClaim(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/sinistres/${id}`,
      getAuthHeaders()
    );
  }
}
