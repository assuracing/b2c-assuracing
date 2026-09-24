
export interface Bank {
  bankCode: string;
  bankTitle: string;
}

export interface ProfessionalCategory {
  code: string;
  label: string;
}

export interface City {
  cityCode: string;
  cityTitle: string;
  cityName?: string;
}

export interface Person {
  $id: string;
  birthDate: string;
  smoker?: boolean;
  lastName: string;
  firstName: string;
  professionalCategory: string;
  remainingAccountLemoine: number;
  civility?: string;
}

export interface Address {
  $id: string;
  type: string;
  postCode: string;
  city: string;
  countryCode: string;
}

export interface Loan {
  $id: string;
  loanType: string;
  borrowedAmount: number;
  interestRate: number;
  loanDuration: number;
  repaymentSchedule?: string;
  deferredType?: string;
  deferredDuration?: number;
  [key: string]: any;
}

export interface Product {
  $id: string;
  productCode?: string;
  contributionType?: string;
  insured: Insured;
  coverages: Coverage[];
}

export interface Insured {
  role: string;
  person: {
    $ref: string;
  };
}

export interface Coverage {
  loan: {
    $ref: string;
  };
  guaranteeCode: string;
  coveragePercentage: number;
  deductibleCode?: string;
  levelCode?: string;
  compensationMode?: string;
}

export interface ProjectProperties {
  addresses: Address[];
  email: string;
  commission: string;
  bankCode: string;
  moralSubscriber: boolean;
  phone?: string;
}

export interface PricingPayload {
  $type: string;
  properties: ProjectProperties;
  persons: Person[];
  loans: Loan[];
  numberOfLoans?: number;
  lenders?: Lender[];
  products?: Product[];
  product?: Product;
}

export interface Lender {
  companyName: string;
  address: {
    addressLine1: string;
    addressLine2: string;
    postCode: string;
    city: string;
  };
  loans: {
    $ref: string;
  }[];
}

export interface PricingResult {
  priceType: string;
  contributionType?: string;
  productCode?: string;
  productTitle?: string;
  product?: {
    productId?: string;
    productCode: string;
    contributionType: string;
    productTitle?: string;
  };
  firstYearsContribution?: number;
  taea?: number;
  eightYearsContribution?: number;
  monthlyContribution?: number;
  yearlyAverageRate?: number;
  contribution?: {
    contributionAmount?: number;
    startDate?: string;
    endDate?: string;
  };
  insured?: string;
  loan?: string;
  commission?: string;
  borrowerId?: string;
  borrowerProduct?: string;
  borrowerProductId?: string;
  guaranteeCode?: string;
  coveragePercentage?: number;
  capital?: number;
  levelCode?: string;
  deductibleCode?: string;
  compensationMode?: string;
  contributionSchedule?: string;
  messages?: Array<{
    messageType: string;
    messageTitle: string;
    messageReference: string;
  }>;
}

export interface QuotationCustomerData {
  borrower1LastName: string;
  borrower1FirstName: string;
  borrower2LastName?: string;
  borrower2FirstName?: string;
  email: string;
  phone: string;
}

export interface MortgageInsuranceForm {
  projectType: string;
  hasCoBorrower: boolean;
  projectPurpose: string;
  bankCode: string;
  loanType: string;
  borrowedAmount: number;
  interestRate: number;
  rateType: string;
  loanDuration: number;
  repaymentSchedule: string;
  deferredType?: string;
  deferredDuration?: number;
  tauxZeroDeferredDuration?: number;
  borrower1BirthDate: string;
  borrower1ProfessionalCategory: string;
  borrower2BirthDate?: string;
  borrower2ProfessionalCategory?: string;
  postCode: string;
  city: string;
  borrower1Smoker: boolean;
  borrower2Smoker?: boolean;
  borrower1HasCredits: boolean;
  borrower1RemainingAmount: number;
  borrower2HasCredits?: boolean;
  borrower2RemainingAmount?: number;
  civility: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  optInEmail: boolean;
  optInPhone: boolean;
}

export interface ApiError {
  businessMessages?: BusinessMessage[];
  message?: string;
  statusCode?: number;
}

export interface BusinessMessage {
  code: string;
  message: string;
  severity: string;
}
