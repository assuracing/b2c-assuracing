import { Injectable } from '@angular/core';
import {
  PricingPayload,
  PricingResult,
  QuotationCustomerData,
  MortgageInsuranceForm,
  Person,
  Product,
  Coverage,
} from '../models/mortgage-insurance.models';

@Injectable({
  providedIn: 'root'
})
export class MortgageInsuranceService {
  constructor() {}

  private convertDateFormat(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  buildPricingPayload(formValue: MortgageInsuranceForm, hasCoBorrower: boolean, customQuotity?: number): PricingPayload {
    const loanId = 'loan_1';
    const person1Id = 'pers_1';
    const person2Id = hasCoBorrower ? 'pers_2' : null;

    const applyLemoineLaw = formValue.borrowedAmount <= 200000;

    const person1: any = {
      $id: person1Id,
      birthDate: this.convertDateFormat(formValue.borrower1BirthDate),
      lastName: 'Simulation',
      firstName: 'Client',
      professionalCategory: formValue.borrower1ProfessionalCategory,
      remainingAccountLemoine: formValue.borrower1HasCredits ? formValue.borrower1RemainingAmount : 0,
      civility: formValue.civility
    };

    if (!applyLemoineLaw) {
      person1.smoker = formValue.borrower1Smoker;
    }

    const persons: Person[] = [person1];

    if (hasCoBorrower) {
      const person2: any = {
        $id: person2Id!,
        birthDate: this.convertDateFormat(formValue.borrower2BirthDate || ''),
        lastName: 'Co-emprunteur',
        firstName: 'Simulation',
        professionalCategory: formValue.borrower2ProfessionalCategory || '',
        remainingAccountLemoine: formValue.borrower2HasCredits ? (formValue.borrower2RemainingAmount || 0) : 0
      };

      if (!applyLemoineLaw) {
        person2.smoker = formValue.borrower2Smoker || false;
      }

      persons.push(person2);
    }

    const loan = {
      $id: loanId,
      loanType: formValue.loanType,
      borrowedAmount: formValue.borrowedAmount,
      interestRate: formValue.interestRate,
      loanDuration: formValue.loanDuration
    };
    const loans = [loan];

    if (['Differe', 'PretRelais'].includes(formValue.loanType)) {
      (loan as any).deferredType = formValue.deferredType;
      (loan as any).deferredDuration = formValue.deferredDuration;
    }

    let products: Product[] = [];
    
    if (customQuotity !== undefined && customQuotity !== 100) {
      const coveragePercentage = customQuotity;
      const coverages: Coverage[] = [
        {
          loan: { $ref: loanId },
          guaranteeCode: 'Deces',
          coveragePercentage: coveragePercentage
        },
        {
          loan: { $ref: loanId },
          guaranteeCode: 'PTIA',
          coveragePercentage: coveragePercentage
        },
        {
          loan: { $ref: loanId },
          guaranteeCode: 'ITT',
          deductibleCode: '090',
          levelCode: 'ConfortPlus',
          coveragePercentage: coveragePercentage
        },
        {
          loan: { $ref: loanId },
          guaranteeCode: 'IPT',
          levelCode: 'ConfortPlus',
          coveragePercentage: coveragePercentage
        }
      ];

      products = [
        {
          $id: 'prod_1',
          insured: {
            role: 'AssurePrincipal',
            person: { $ref: person1Id }
          },
          coverages: coverages
        }
      ];
    }

    return {
      $type: 'Emprunteur',
      properties: {
        addresses: [
          {
            $id: 'addr_1',
            type: 'Actuelle',
            postCode: formValue.postCode,
            city: formValue.city,
            countryCode: 'FR'
          }
        ],
        email: 'anonyme@vax-conseils.fr',
        commission: '4010',
        bankCode: formValue.bankCode,
        moralSubscriber: false
      },
      persons: persons,
      loans: loans,
      numberOfLoans: loans.length,
      products: products
    };
  }

  filterTarifGlobal(response: PricingResult[]): PricingResult[] {
    if (!response || !Array.isArray(response)) {
      return [];
    }
    return response.filter((item: PricingResult) =>
      item.priceType === 'TarifGlobal'
    );
  }

  buildQuotationPayload(formValue: MortgageInsuranceForm, hasCoBorrower: boolean, customerData: QuotationCustomerData, selectedOffer: PricingResult | null, customQuotity?: number): PricingPayload {
    const basePayload = this.buildPricingPayload(formValue, hasCoBorrower, customQuotity);
    const lenderCompanyName = this.getLenderCompanyName(formValue.bankCode);
    const selectedProductCode = selectedOffer?.productCode || 'ADPv4';
    const selectedContributionType = selectedOffer?.contributionType || 'Variable';
    
    const applyLemoineLaw = formValue.borrowedAmount <= 200000;
    
    basePayload.persons[0].lastName = customerData.borrower1LastName;
    basePayload.persons[0].firstName = customerData.borrower1FirstName;
    basePayload.persons[0].civility = formValue.civility;
    basePayload.properties.email = customerData.email;
    
    if (applyLemoineLaw) {
      delete (basePayload.persons[0] as any).smoker;
    }
    
    if (customerData.phone) {
      basePayload.properties.phone = customerData.phone;
    }

    if (hasCoBorrower && basePayload.persons[1]) {
      basePayload.persons[1].lastName = customerData.borrower2LastName || '';
      basePayload.persons[1].firstName = customerData.borrower2FirstName || '';
      
      if (applyLemoineLaw) {
        delete (basePayload.persons[1] as any).smoker;
      }
    }

    const lenders = [
      {
        companyName: lenderCompanyName,
        address: {
          addressLine1: 'Adresse banque',
          addressLine2: '',
          postCode: formValue.postCode,
          city: formValue.city
        },
        loans: [{ $ref: 'loan_1' }]
      }
    ];

    const coveragePercentage = customQuotity || 100;
    const products: Product[] = [
      {
        $id: 'p-1',
        productCode: selectedProductCode,
        contributionType: selectedContributionType,
        insured: {
          role: 'AssurePrincipal',
          person: { $ref: 'pers_1' }
        },
        coverages: [
          {
            guaranteeCode: 'Deces',
            loan: { $ref: 'loan_1' },
            coveragePercentage: coveragePercentage
          },
          {
            guaranteeCode: 'PTIA',
            loan: { $ref: 'loan_1' },
            coveragePercentage: coveragePercentage
          },
          {
            guaranteeCode: 'ITT',
            deductibleCode: '090',
            levelCode: 'ConfortPlus',
            loan: { $ref: 'loan_1' },
            coveragePercentage: coveragePercentage
          },
          {
            guaranteeCode: 'IPT',
            levelCode: 'ConfortPlus',
            loan: { $ref: 'loan_1' },
            coveragePercentage: coveragePercentage
          }
        ]
      }
    ];

    return {
      $type: basePayload.$type,
      properties: basePayload.properties,
      persons: basePayload.persons,
      loans: basePayload.loans,
      lenders: lenders,
      products: products,
      numberOfLoans: basePayload.numberOfLoans
    };
  }

  private getLenderCompanyName(bankCode: string): string {
    const lenderNames: Record<string, string> = {
      CA_Paris: 'Credit Agricole',
      Caisse_Epargne_Ile_de_France: 'Caisse Epargne',
      credit_mut_Alliance_federale: 'Credit Mutuel',
      banque_pop_RIVES_DE_PARIS: 'Banque Populaire',
      SG_societe_generale: 'Societe Generale',
      LCL: 'LCL',
      BNP: 'BNP Paribas',
      CIC_ILE_DE_FRANCE: 'CIC',
      Banque_Postale: 'La Banque Postale',
      OTHER_BANK: 'Autre banque'
    };

    return lenderNames[bankCode] || 'Banque preteuse';
  }

  getConstantContribution(pricingResults: PricingResult[]): PricingResult | undefined {
    return pricingResults.find(item => item.contributionType === 'Constante');
  }

  getVariableContribution(pricingResults: PricingResult[]): PricingResult | undefined {
    return pricingResults.find(item => item.contributionType === 'Variable');
  }

  calculateMonthlyContribution(contributionAmount: number, loanDuration: number): number {
    return Math.round((contributionAmount / loanDuration) * 100) / 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}
