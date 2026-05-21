import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { Claim } from '../../models/claim.model';
import { FichierService } from '../../services/fichier.service';
import { DataUtilService } from '../../core/utils/data-util.service';
import { ToastService } from '../../services/toast.service';
import { Fichier, TypePieceSinistre } from '../../models/claim.model';
import { forkJoin } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common'; 

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatCardModule,
    TranslateModule
  ],
  templateUrl: './claim-list.component.html',
  styleUrls: ['./claim-list.component.scss', './claim-list-responsive.component.scss', './claim-list-document.component.scss'],
})
export class ClaimListComponent implements OnInit, OnChanges {
  @Input() claims: Claim[] = [];
  @Input() contractId: number | null = null;
  dragOverAddDocTypes: Set<string> = new Set();

  private claimStatusesKeys = [
    'awaitingDocuments', 'inProgress', 'declined', 'settled', 'noFollowUp',
    'clientDeclarationStatus', 'organizerDeclaration', 'completeFile', 'fileToRegularize', 'statusUnknown'
  ];
  public claimStatuses: string[] = [];
  public claimStatusesMap: Map<string, string> = new Map();

  private frenchStatusToKey: Record<string, string> = {
    'en attente de pièces': 'awaitingDocuments',
    'en cours': 'inProgress',
    'décliné': 'declined',
    'refusé': 'declined',
    'réglé': 'settled',
    'sans suite': 'noFollowUp',
    'déclaration client': 'clientDeclarationStatus',
    'déclaration organisateur': 'organizerDeclaration',
    'dossier complet': 'completeFile',
    'dossier à régulariser': 'fileToRegularize'
  };

  private licenseTypesKeys = ['licenseA', 'licenseB', 'casm', 'ffsa'];
  public licenseTypes: string[] = [];
  public licenseTypesMap: Map<string, string> = new Map();

  constructor(
    private fichierService: FichierService,
    private dataUtils: DataUtilService,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateClaimStatuses();
    this.updateLicenseTypes();
    
    this.translate.onLangChange.subscribe(() => {
      this.updateClaimStatuses();
      this.updateLicenseTypes();
    });
    
    this.loadFilesForClaims();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claims'] && !changes['claims'].firstChange) {
      this.loadFilesForClaims();
    }
  }

  loadFilesForClaims(): void {
    if (this.claims && this.claims.length > 0) {
      const fileObservables = this.claims.map((claim) =>
        this.fichierService.query({ sinistreId: claim.id }).pipe(
          map((response: HttpResponse<Fichier[]>) => ({
            claimId: claim.id,
            files: response.ok ? (response.body || []) : []
          }))
        )
      );

      forkJoin(fileObservables).subscribe(
        (results: Array<{ claimId: number | undefined, files: Fichier[] }>) => {
          results.forEach((result) => {
            const claim = this.claims.find(c => c.id === result.claimId);
            if (claim) {
              claim.files = [...result.files];
            }
          });
        },
        (error) => {
          this.claims.forEach(claim => {
            this.reloadFilesForClaim(claim.id!);
          });
        }
      );
    }
  }

  reloadFilesForClaim(claimId: number): void {
    
    this.fichierService.query({ sinistreId: claimId }).pipe(
      filter((mayBeOk: HttpResponse<Fichier[]>) => mayBeOk.ok),
      map((response: HttpResponse<Fichier[]>) => response.body)
    ).subscribe({
      next: (files: Fichier[] | null) => {
        const claim = this.claims.find(c => c.id === claimId);
        if (claim) {
          claim.files = [...(files || [])];
        }
      },
      error: (error: HttpErrorResponse) => {
      }
    });
  }

  private updateClaimStatuses(): void {
    this.claimStatusesMap.clear();
    this.claimStatuses = this.claimStatusesKeys.map(key => {
      const translation = this.translate.instant(`claimStatuses.${key}`);
      this.claimStatusesMap.set(key, translation);
      return key;
    });
  }

  private updateLicenseTypes(): void {
    this.licenseTypesMap.clear();
    this.licenseTypes = this.licenseTypesKeys.map(key => {
      const translation = this.translate.instant(`licenseTypes.${key}`);
      this.licenseTypesMap.set(key, translation);
      return key;
    });
  }

  getStatusIcon(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'en attente de pièces':
        return 'attach_file';
      case 'en cours':
        return 'hourglass_empty';
      case 'refusé':
        return 'cancel';
      case 'réglé':
        return 'check_circle';
      case 'sans suite':
        return 'remove_circle_outline';
      case 'déclaration client':
        return 'person';
      case 'déclaration organisateur':
        return 'group';
      case 'dossier complet':
        return 'checklist_rtl';
      case 'dossier à régulariser':
        return 'error_outline';
      default:
        return 'help_outline';
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'en attente de pièces':
        return 'status-awaiting-docs';
      case 'en cours':
        return 'status-pending';
      case 'refusé':
        return 'status-rejected';
      case 'réglé':
        return 'status-approved';
      case 'sans suite':
        return 'status-closed';
      case 'déclaration client':
        return 'status-client';
      case 'déclaration organisateur':
        return 'status-organizer';
      case 'dossier complet':
        return 'status-complete';
      case 'dossier à régulariser':
        return 'status-to-regularize';
      default:
        return 'status-unknown';
    }
  }

  getStatusTranslation(status: string | undefined): string {
    if (!status) return this.translate.instant('claimDetails.unknownStatus');
    const key = this.frenchStatusToKey[status.toLowerCase()];
    if (key) {
      return this.claimStatusesMap.get(key) || status;
    }
    return status;
  }

  isProductSpecial(claim: Claim): boolean {
    if (!claim.typeSinistre?.nom) return false;
    const typeName = (claim.typeSinistre.nom || '').toLowerCase();
    return typeName.includes('annulation') || 
           typeName.includes('interruption') || 
           typeName.includes('intempéries');
  }

  isEditableProduct(claim: Claim): boolean {
    return !this.isProductSpecial(claim);
  }

  isClaimClosed(claim: Claim): boolean {
    return ['réglé', 'refusé', 'sans suite'].includes(claim.etatEnCours || '');
  }

  canEditClaim(claim: Claim): boolean {
    return this.isEditableProduct(claim) && !this.isClaimClosed(claim);
  }

  getRequiredDocumentTypes(claim: Claim): string[] {
    if (!claim.typeSinistre?.nom) {
      return [
        'RIB',
        this.translate.instant('documentTypes.medicalCertificate'),
        this.translate.instant('documentTypes.employerCertificate'),
        this.translate.instant('documentTypes.administrativeSummons'),
        this.translate.instant('documentTypes.invoices'),
        this.translate.instant('documentTypes.otherDocuments')
      ];
    }
    
    const typeName = (claim.typeSinistre.nom || '').toLowerCase();
    
    let docs = ['RIB'];
    
    if (typeName.includes('annulation')) {
      docs.push(this.translate.instant('documentTypes.supportingDocuments'));
    } else if (typeName.includes('interruption')) {
      docs.push(this.translate.instant('documentTypes.accidentPhoto'), this.translate.instant('documentTypes.repairQuote'));
    } else if (typeName.includes('intempéries')) {
      docs = ['RIB'];
    } else {
      docs.push(
        this.translate.instant('documentTypes.medicalCertificate'),
        this.translate.instant('documentTypes.employerCertificate'),
        this.translate.instant('documentTypes.administrativeSummons'),
        this.translate.instant('documentTypes.invoices'),
        this.translate.instant('documentTypes.otherDocuments')
      );
    }
    
    return docs;
  }

  hasFileOfTypePiece(claim: Claim, typePiece: string): boolean {
    return (claim.files || []).some(f => f.typePiece === typePiece);
  }

  getFileByTypePiece(claim: Claim, typePiece: string): Fichier | undefined {
    return (claim.files || []).find(f => f.typePiece === typePiece);
  }

  getFilesByType(claim: Claim, docTypeLabel: string): Fichier[] {
    const typePiece = this.mapDocLabelToTypePiece(docTypeLabel);
    return (claim.files || []).filter(f => f.typePiece === typePiece);
  }

  hasFileOfType(claim: Claim, fileTypeLabel: string): boolean {
    const typePiece = this.mapDocLabelToTypePiece(fileTypeLabel);
    return this.getFileByTypePiece(claim, typePiece) !== undefined;
  }

  mapDocLabelToTypePiece(label: string): string {
    const medicCert = this.translate.instant('documentTypes.medicalCertificate');
    const empCert = this.translate.instant('documentTypes.employerCertificate');
    const adminSum = this.translate.instant('documentTypes.administrativeSummons');
    const factJust = this.translate.instant('documentTypes.invoices');
    const otherDocs = this.translate.instant('documentTypes.otherDocuments');
    const accPhoto = this.translate.instant('documentTypes.accidentPhoto');
    const repQuote = this.translate.instant('documentTypes.repairQuote');
    const justDoc = this.translate.instant('documentTypes.supportingDocuments');
    
    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      [justDoc]: 'AUTRE',
      [accPhoto]: 'PHOTOACCIDENT',
      [repQuote]: 'DEVISREPARATION',
      [medicCert]: 'CERTIFICATMEDICAL',
      [empCert]: 'CERTIFICATEMPLOYEUR',
      [adminSum]: 'CONVOCATIONADMINISTRATIVE',
      [factJust]: 'FACTUREJUSTIFICATIVE',
      [otherDocs]: 'AUTRE'
    };
    return mapping[label] || 'AUTRE';
  }

  mapTypePieceToLabel(typePiece: string): string {
    const medicCert = this.translate.instant('documentTypes.medicalCertificate');
    const empCert = this.translate.instant('documentTypes.employerCertificate');
    const adminSum = this.translate.instant('documentTypes.administrativeSummons');
    const factJust = this.translate.instant('documentTypes.invoices');
    const otherDocs = this.translate.instant('documentTypes.otherDocuments');
    const accPhoto = this.translate.instant('documentTypes.accidentPhoto');
    const repQuote = this.translate.instant('documentTypes.repairQuote');
    
    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      'PHOTOACCIDENT': accPhoto,
      'DEVISREPARATION': repQuote,
      'AUTRE': otherDocs,
      'CERTIFICATMEDICAL': medicCert,
      'CERTIFICATEMPLOYEUR': empCert,
      'CONVOCATIONADMINISTRATIVE': adminSum,
      'FACTUREJUSTIFICATIVE': factJust
    };
    return mapping[typePiece] || typePiece;
  }

  onFileSelected(event: Event, claim: Claim, docTypeLabel: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !claim.id) return;

    this.uploadClaimFile(input.files[0], claim, docTypeLabel, input);
  }

  private uploadClaimFile(file: File, claim: Claim, docTypeLabel: string, input?: HTMLInputElement): void {
    if (!claim.id) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error(this.translate.instant('messages.fileTooLarge'));
      if (input) input.value = '';
      return;
    }

    if (!this.canAddMoreFiles(claim)) {
      this.toastService.error(this.translate.instant('messages.fileLimitReached'));
      if (input) input.value = '';
      return;
    }

    const typePiece = this.mapDocLabelToTypePiece(docTypeLabel);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];

      const fichier: Fichier = {
        nomFichier: file.name,
        type: docTypeLabel,
        typePiece: typePiece,
        dateUpload: new Date().toISOString(),
        urlFichier: base64,
        content: base64,
        contentContentType: file.type
      };

      this.fichierService.uploadFile(claim.id!, fichier).subscribe({
        next: () => {
          this.toastService.success(`${docTypeLabel} téléversé avec succès`);
          if (input) input.value = '';
          this.reloadFilesForClaim(claim.id!);
        },
        error: () => {
          this.toastService.error(this.translate.instant('messages.documentUploadError', { docType: docTypeLabel }));
          if (input) input.value = '';
        }
      });
    };

    reader.onerror = () => {
      this.toastService.error(this.translate.instant('messages.fileReadError'));
      if (input) input.value = '';
    };

    reader.readAsDataURL(file);
  }

  private getAddDocumentDropKey(claim: Claim, docTypeLabel: string): string {
    return `${claim.id || 'claim'}-${docTypeLabel}`;
  }

  isDragOverAddDocument(claim: Claim, docTypeLabel: string): boolean {
    return this.dragOverAddDocTypes.has(this.getAddDocumentDropKey(claim, docTypeLabel));
  }

  onAddDocumentDragEnter(event: DragEvent, claim: Claim, docTypeLabel: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverAddDocTypes.add(this.getAddDocumentDropKey(claim, docTypeLabel));
  }

  onAddDocumentDragOver(event: DragEvent, claim: Claim, docTypeLabel: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverAddDocTypes.add(this.getAddDocumentDropKey(claim, docTypeLabel));
  }

  onAddDocumentDragLeave(event: DragEvent, claim: Claim, docTypeLabel: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverAddDocTypes.delete(this.getAddDocumentDropKey(claim, docTypeLabel));
  }

  onAddDocumentDrop(event: DragEvent, claim: Claim, docTypeLabel: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOverAddDocTypes.delete(this.getAddDocumentDropKey(claim, docTypeLabel));

    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }

    this.uploadClaimFile(file, claim, docTypeLabel);
  }

  canAddMoreFiles(claim: Claim): boolean {
    const maxFiles = 10;
    return (claim.files || []).length < maxFiles;
  }

  openFile(contentType: any, field: any, filename: any): void {
    this.dataUtils.downloadFile(field, contentType, filename);
  }

  getClaimTranslationKey(claim: Claim): string {
    return (claim.typeSinistre && claim.typeSinistre.nom) 
      ? 'claimDetails.claimPrefix' 
      : 'claimDetails.claimPrefixNoType';
  }
  
}
