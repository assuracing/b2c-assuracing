// contract.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(private http: HttpClient) {}

  createContratB2C(data: any): Observable<any> {
    return this.http.post(`http://localhost:8080/api/createContractB2C`, data);
  }
}