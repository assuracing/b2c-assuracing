export enum ClaimType {
  ANNULATION = 'ANNULATION',
  INTERRUPTION = 'INTERRUPTION',
  INTEMPERIES = 'INTEMPERIES'
}

export enum ClaimReasonCategory {
  SANTE = 'SANTE',
  SOCIAL = 'SOCIAL',
  PROFESSIONNEL = 'PROFESSIONNEL',
  AUTRE = 'AUTRE',
  CONVOCATION_NON_REPORTABLE = 'CONVOCATION_NON_REPORTABLE'
}

export interface ClaimReason {
  id: string;
  code: string;
  label: string;
  category: ClaimReasonCategory;
  description?: string;
  requiredDocuments?: string[];
}

export interface ClaimTypeDTO {
  id: number;
  code: string;
  libelle: string;
  description?: string;
  reasons?: ClaimReason[];
}

export interface TypeSinistreDTO {
  id: number;
  nom: string;
  serialisation?: string | null;
  code?: string;
  libelle?: string;
  description?: string;
}

export interface TypeCauseSinistre {
  id: number;
  nom: string;
  serialisation?: string;
  avecJustificatif?: boolean;
}

export interface ClaimPayload {
  id?: number;
  transactionUID?: string;
  
  type: string;
  typeNom?: string;
  reason?: string;
  reasonLabel?: string;
  category?: ClaimReasonCategory;
  dateEvenement: string;
  description?: string;
  descriptionEvenement?: string;
  
  clientId?: number;
  clientNom?: string;
  clientPrenom?: string;
  clientEmail?: string;
  clientTelephone?: string;
  
  contractId?: number;
  contractNom?: string;
  contractCircuit?: string;
  contractDateAdhesion?: string;
  
  fichiers?: Fichier[];
  
  dateCreation?: string;
  dateModification?: string;
}

export interface Claim {
  id?: number;
  nbreHeure?: number | null;
  montant?: number;
  dateSinistre?: string;
  dateDeclaSinistre?: string;
  comment?: string;
  franchise?: number;
  dateEtat?: string;
  etatEnCours?: string;
  nomAdherent?: string;
  prenomAdherent?: string;
  typeSinistre?: TypeSinistreDTO;
  typeCauseSinistre?: TypeCauseSinistre;
  files?: Fichier[];
  isEditingComment?: boolean;
}

export interface ClaimFile {
  id?: number;
  sinistreId?: number;
  nomFichier: string;
  type: string;
  urlFichier?: string;
  dateUpload?: string;
  taille?: number;
}

export interface ClaimRequest {
  typeSinistre: { id: number };
  typeCauseSinistre: { id: number } | null;
  dateSinistre: string;
  dateDeclaSinistre: string;
  comment?: string;
  contrat: { id: number };
}

export interface FileUploadRequest {
  nom: string;
  contenu: string;
  typepiece: string;
  sinistre: { id: number };
}

export interface ClaimResponse {
  id: number;
  transactionUID: string;
  statut: string;
  dateCreation: string;
}

export interface FileUploadResponse {
  id: number;
  sinistreId: number;
  urlFichier: string;
  dateUpload: string;
}

export interface RequiredDocuments {
  [key: string]: string[];
}


export interface Product {
  id: number;
  nom: string;
  code?: string;
  description?: string;
  visibleTypeSinistres: TypeSinistreDTO[];
}

export enum TypePieceSinistre {
  RIB = 'RIB',
  CERTIFICATMEDICAL = 'CERTIFICATMEDICAL',
  CERTIFICATEMPLOYEUR = 'CERTIFICATEMPLOYEUR',
  CONVOCATIONADMINISTRATIVE = 'CONVOCATIONADMINISTRATIVE',
  FACTUREJUSTIFICATIVE = 'FACTUREJUSTIFICATIVE',
  DEVISREPARATION = 'DEVISREPARATION',
  PHOTOACCIDENT = 'PHOTOACCIDENT',
  AUTRE = 'AUTRE'
}

export interface Fichier {
  id?: number;
  nom?: string;
  url?: string;
  content?: string;
  contentContentType?: string;
  nomFichier?: string;
  urlFichier?: string;
  typePiece?: TypePieceSinistre | string;
  type?: string;
  taille?: number;
  dateUpload?: string;
  envoiQuandSinistre?: boolean;
  envoiQuandRegistration?: boolean;
  envoiQuandFinContrat?: boolean;
  parametragePrix?: boolean;
  comment?: string;
  sinistre?: { id: number };
  contrat?: { id: number };
  fileuuid?: string;
}


