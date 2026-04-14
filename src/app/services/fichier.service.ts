import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Fichier } from '../models/claim.model';
import { environment } from '../../environments/environment';
import { getAuthHeaders } from '../core/utils/http-utils';

@Injectable({
  providedIn: 'root'
})
export class FichierService {
  private apiUrl = `${environment.apiUrl}/api/fichiers`;

  constructor(private http: HttpClient) { }

  query(req?: any): Observable<HttpResponse<Fichier[]>> {
    let params = new HttpParams();
    if (req) {
      Object.keys(req).forEach(key => {
        if (req[key] !== null && req[key] !== undefined) {
          params = params.set(key, req[key]);
        }
      });
    }
    const authOptions = getAuthHeaders();
    return this.http.get<Fichier[]>(this.apiUrl, { 
      params, 
      observe: 'response',
      headers: authOptions.headers,
      withCredentials: authOptions.withCredentials
    });
  }

  uploadFile(sinistreId: number, fichier: Fichier): Observable<any> {
    const payload = {
      nom: fichier.nomFichier || fichier.nom,
      content: fichier.urlFichier || fichier.content,
      contentContentType: fichier.contentContentType,
      typePiece: fichier.typePiece || fichier.type,
      sinistre: { id: sinistreId },
      taille: fichier.taille,
      dateUpload: fichier.dateUpload
    };

    const authOptions = getAuthHeaders();
    return this.http.post<any>(this.apiUrl, payload, {
      headers: authOptions.headers,
      withCredentials: authOptions.withCredentials
    });
  }

  updateSinistre(sinistre: any): Observable<any> {
    const authOptions = getAuthHeaders();
    
    const payload = {
      id: sinistre.id,
      typeSinistre: sinistre.typeSinistre ? { id: sinistre.typeSinistre.id } : {},
      dateSinistre: sinistre.dateSinistre,
      dateDeclaSinistre: sinistre.dateDeclaSinistre,
      comment: sinistre.comment,
      contrat: sinistre.contrat ? { id: sinistre.contrat.id } : {},
      typeCauseSinistre: sinistre.typeCauseSinistre && sinistre.typeCauseSinistre.id ? { id: sinistre.typeCauseSinistre.id } : {},
      etatValidationOrganisateur: sinistre.etatValidationOrganisateur,
      etatEnCours: sinistre.etatEnCours,
      montant: sinistre.montant,
      franchise: sinistre.franchise
    };
    
    return this.http.put<any>(`${environment.apiUrl}/api/sinistres`, payload, {
      headers: authOptions.headers,
      withCredentials: authOptions.withCredentials
    });
  }

  private cleanPayload(payload: any): any {
    const cleaned: any = {};
    const allowedFields = ['id', 'comment', 'iban', 'bic', 'montant', 'franchise', 'typeCauseSinistre'];
    
    Object.keys(payload).forEach(key => {
      if (allowedFields.includes(key) && payload[key] !== null && payload[key] !== undefined) {
        cleaned[key] = payload[key];
      }
    });
    
    return cleaned;
  }

  deleteFile(fichierIdId: number): Observable<any> {
    const authOptions = getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${fichierIdId}`, {
      headers: authOptions.headers,
      withCredentials: authOptions.withCredentials
    });
  }
}
