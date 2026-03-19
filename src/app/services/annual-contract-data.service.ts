import { Injectable } from '@angular/core';

export interface AnnualContractData {
  contracts: any[];
  guaranteeId: string;
  guaranteeLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnnualContractDataService {
  private contractData: AnnualContractData | null = null;

  setContractData(data: AnnualContractData): void {
    this.contractData = data;
  }

  getContractData(): AnnualContractData | null {
    return this.contractData;
  }

  clearContractData(): void {
    this.contractData = null;
  }
}
