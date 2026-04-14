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
  ],
  templateUrl: './claim-list.component.html',
  styleUrls: ['./claim-list.component.scss', './claim-list-responsive.component.scss'],
})
export class ClaimListComponent implements OnInit, OnChanges {
  @Input() claims: Claim[] = [];
  @Input() contractId: number | null = null;

  constructor(
    private fichierService: FichierService,
    private dataUtils: DataUtilService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
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
        'Certificat médical',
        'Certificat employeur',
        'Convocation administrative',
        'Factures justificatives',
        'Autres pièces'
      ];
    }
    
    const typeName = (claim.typeSinistre.nom || '').toLowerCase();
    
    let docs = ['RIB'];
    
    if (typeName.includes('annulation')) {
      docs.push('Justificatif');
    } else if (typeName.includes('interruption')) {
      docs.push('Photo accident', 'Devis réparation');
    } else if (typeName.includes('intempéries')) {
      docs = ['RIB'];
    } else {
      docs.push('Certificat médical', 'Certificat employeur', 'Convocation administrative', 'Factures justificatives', 'Autres pièces');
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
    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      'Justificatif': 'AUTRE',
      'Photo accident': 'PHOTOACCIDENT',
      'Devis réparation': 'DEVISREPARATION',
      'Certificat médical': 'CERTIFICATMEDICAL',
      'Certificat employeur': 'CERTIFICATEMPLOYEUR',
      'Convocation administrative': 'CONVOCATIONADMINISTRATIVE',
      'Factures justificatives': 'FACTUREJUSTIFICATIVE',
      'Autres pièces': 'AUTRE'
    };
    return mapping[label] || 'AUTRE';
  }

  mapTypePieceToLabel(typePiece: string): string {
    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      'PHOTOACCIDENT': 'Photo accident',
      'DEVISREPARATION': 'Devis réparation',
      'AUTRE': 'Autres pièces',
      'CERTIFICATMEDICAL': 'Certificat médical',
      'CERTIFICATEMPLOYEUR': 'Certificat employeur',
      'CONVOCATIONADMINISTRATIVE': 'Convocation administrative',
      'FACTUREJUSTIFICATIVE': 'Factures justificatives'
    };
    return mapping[typePiece] || typePiece;
  }

  canAddFileOfType(claim: Claim, fileType: string): boolean {
    return this.isEditableProduct(claim) && 
           !this.isClaimClosed(claim) && 
           !this.hasFileOfType(claim, fileType);
  }

  onFileSelected(event: Event, claim: Claim, docTypeLabel: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0] || !claim.id) return;

    const file = input.files[0];

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('Fichier trop volumineux. Maximum: 5 MB');
      input.value = '';
      return;
    }

    if (!this.canAddMoreFiles(claim)) {
      this.toastService.error('Limite de 10 fichiers atteinte pour ce sinistre');
      input.value = '';
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
        next: (response) => {
          this.toastService.success(`${docTypeLabel} téléversé avec succès`);
          input.value = '';
          this.reloadFilesForClaim(claim.id!);
        },
        error: (error) => {
          this.toastService.error(`Erreur lors de l'upload du ${docTypeLabel}`);
          input.value = '';
        }
      });
    };

    reader.onerror = () => {
      this.toastService.error('Erreur lors de la lecture du fichier');
      input.value = '';
    };

    reader.readAsDataURL(file);
  }

  getAddableDocumentTypes(claim: Claim): string[] {
    const maxFiles = 10;
    const currentCount = (claim.files || []).length;
    
    if (currentCount >= maxFiles) return [];
    
    return this.getRequiredDocumentTypes(claim).filter(docType => {
      const typePiece = this.mapDocLabelToTypePiece(docType);
      return !this.hasFileOfTypePiece(claim, typePiece);
    });
  }

  canAddMoreFiles(claim: Claim): boolean {
    const maxFiles = 10;
    return (claim.files || []).length < maxFiles;
  }

  triggerFileUpload(claim: Claim, docTypeLabel: string): void {
    if (!this.canEditClaim(claim)) return;
    const inputId = 'fileInput-' + docTypeLabel;
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    fileInput?.click();
  }

  openFile(contentType: any, field: any, filename: any): void {
    this.dataUtils.downloadFile(field, contentType, filename);
  }
}
