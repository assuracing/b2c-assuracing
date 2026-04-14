

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Fichier, TypePieceSinistre } from '../../../models/claim.model';
import { ClaimService } from '../../../services/claim.service';
import { ToastService } from '../../../services/toast.service';
import { DataUtilService } from '../../../core/utils/data-util.service';

@Component({
  selector: 'app-claim-documents-step',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule
  ],
  templateUrl: './claim-documents-step.component.html',
  styleUrls: ['./claim-documents-step.component.scss']
})
export class ClaimDocumentsStepComponent implements OnInit, OnChanges {
    isDocumentObligatoire(): boolean {
      const productName = (this.contractProductName || '').toUpperCase();
      
      if (productName.includes('RC') || 
          productName.includes('PJ') || 
          productName.includes('IA') ||
          productName.includes('PROTECTION JURIDIQUE') || 
          productName.includes('RESPONSABILITÉ') ||
          (productName.includes('INDIVIDUELLE') && productName.includes('ACCIDENT'))) {
        return false;
      }
      
      return true;
    }
    
    private isAnnulationOrCancelr(): boolean {
      const type = (this.claimType || '').toUpperCase();
      return type === 'ANNULATION' || type === 'CANCELR';
    }
    
    canAllowMultipleJustificatifs(): boolean {
      const productName = (this.contractProductName || '').toUpperCase();
      const claimType = (this.claimType || '').toUpperCase();
      
      if (claimType === 'INTERRUPTION') {
        return true;
      }
      
      return productName.includes('RC') || 
             productName.includes('PJ') || 
             productName.includes('IA') ||
             productName.includes('ANNULATION+') || 
             productName.includes('INTEMPERIES+') ||
             productName.includes('CANCELR+') || productName.includes('CANCELR') ||
             productName.includes('PROTECTION JURIDIQUE') || 
             productName.includes('RESPONSABILITÉ') ||
             (productName.includes('INDIVIDUELLE') && productName.includes('ACCIDENT'));
    }

    private doesNeedJustificatif(): boolean {
      const productName = (this.contractProductName || '').toUpperCase();
      const claimType = (this.claimType || '').toUpperCase();
      
      if (productName.includes('ANNULATION+')) {
        return claimType === 'ANNULATION';
      }
      if (productName.includes('INTEMPERIES+')) {
        return claimType === 'ANNULATION';
      }
      if (productName.includes('CANCELR+') || productName.includes('CANCELR')) {
        return false;
      }
      
      if (productName.includes('INTEMPERIES') && !productName.includes('INTEMPERIES+')) {
        return false;
      }
      
      if (productName.includes('RC') || 
          productName.includes('PJ') || 
          productName.includes('IA') ||
          productName.includes('PROTECTION JURIDIQUE') || 
          productName.includes('RESPONSABILITÉ') ||
          (productName.includes('INDIVIDUELLE') && productName.includes('ACCIDENT'))) {
        return false;
      }
      
      return productName.includes('ANNULATION');
    }

    private doesNeedPhotoDevis(): boolean {
      const productName = (this.contractProductName || '').toUpperCase();
      const claimType = (this.claimType || '').toUpperCase();
      
      if (claimType === 'INTERRUPTION') {
        return true;
      }
      
      return productName.includes('INTERRUPTION');
    }
    
  private _claimType?: string;
  private _contractProductName?: string;

  @Input()
  set claimType(value: string | undefined) {
    if (this._claimType !== value) {
      this._claimType = value;
      this.onInputsChanged();
    }
  }
  get claimType(): string | undefined {
    return this._claimType;
  }

  @Input()
  set contractProductName(value: string | undefined) {
    if (this._contractProductName !== value) {
      this._contractProductName = value;
      this.onInputsChanged();
    }
  }
  get contractProductName(): string | undefined {
    return this._contractProductName;
  }

  @Output() documentsSubmitted = new EventEmitter<Fichier[]>();

  uploadedFiles: Fichier[] = [];
  requiredDocumentTypes: string[] = [];
  optionalDocSets: { [key: string]: string[] } = {};
  isIntemperies = false;
  isAnnulation = false;
  isOptionalJustificatif = false;
  isRibOnly = false;

  constructor(
    private claimService: ClaimService, 
    private toastService: ToastService,
    private dataUtils: DataUtilService
  ) {}

  ngOnInit(): void {
    this.onInputsChanged();
  }

  private onInputsChanged(): void {
    this.resetFiles();
    this.updateRequiredDocuments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['claimType'] || changes['contractProductName']) {
      this.onInputsChanged();
    }
  }

  private updateRequiredDocuments(): void {
    
    this.requiredDocumentTypes = [];
    this.optionalDocSets = {};
    this.isOptionalJustificatif = false;
    this.isRibOnly = false;
    const productName = this.normalizeString(this.contractProductName || '');
    const claimType = (this.claimType || '').toUpperCase();
    
    this.isIntemperies = productName === 'INTEMPERIES';
    this.isAnnulation = productName === 'ANNULATION';
    
    if (productName.includes('RC') || 
        productName.includes('PJ') || 
        productName.includes('IA') ||
        productName.includes('PROTECTION JURIDIQUE') || 
        productName.includes('RESPONSABILITÉ') ||
        (productName.includes('INDIVIDUELLE') && productName.includes('ACCIDENT'))) {
      this.requiredDocumentTypes.push('RIB');
      this.optionalDocSets['OPTIONAL'] = ['Justificatif'];
      this.isOptionalJustificatif = true;
      return;
    }
    
    this.requiredDocumentTypes = ['RIB'];
    
    if (productName === 'INTERRUPTION') {
      this.requiredDocumentTypes.push('Photo accident', 'Devis réparation');
      return;
    }
    
    if (productName === 'ANNULATION') {
      this.requiredDocumentTypes.push('Justificatif');
      return;
    }
    
    if (productName === 'INTEMPERIES') {
      this.isRibOnly = true;
      return;
    }
    
    
    if (productName.includes('ANNULATION+')) {
      if (claimType === 'INTERRUPTION') {
        this.requiredDocumentTypes.push('Photo accident', 'Devis réparation');
      } else if (claimType === 'ANNULATION') {
        this.requiredDocumentTypes.push('Justificatif');
      } else if (claimType === 'INTEMPERIES') {
        this.isRibOnly = true;
      } else {
        this.optionalDocSets['OPTIONAL'] = ['Justificatif'];
        this.isOptionalJustificatif = true;
      }
      return;
    }
    
    if (productName.includes('INTEMPERIES+')) {
      if (claimType === 'INTERRUPTION') {
        this.requiredDocumentTypes.push('Photo accident', 'Devis réparation');
      } else if (claimType === 'ANNULATION') {
        this.requiredDocumentTypes.push('Justificatif');
      } else if (claimType === 'INTEMPERIES') {
        this.isRibOnly = true;
      } else {
        this.optionalDocSets['OPTIONAL'] = ['Justificatif'];
        this.isOptionalJustificatif = true;
      }
      return;
    }
    
    if (productName.includes('CANCELR')) {
      if (claimType === 'INTERRUPTION') {
        this.requiredDocumentTypes.push('Photo accident', 'Devis réparation');
      } else if (claimType === 'ANNULATION') {
        this.requiredDocumentTypes.push('Justificatif');
      } else if (claimType === 'INTEMPERIES') {
        this.isRibOnly = true;
      } else {
        this.optionalDocSets['OPTIONAL'] = ['Justificatif'];
        this.isOptionalJustificatif = true;
      }
      return;
    }
    
    if (this.doesNeedJustificatif()) {
      this.requiredDocumentTypes.push('Justificatif');
    }
  }

  private normalizeString(str: string): string {
    if (!str) return '';
    return str
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  resetFiles(): void {
    this.uploadedFiles = [];
  }

  onFileSelected(event: Event, docType: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.validateAndAddFile(file, docType);
    }
  }

  private validateAndAddFile(file: File, docType: string): void {
    const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      this.toastService.error(`Format non accepté. Fichiers acceptés: ${allowedExtensions.join(', ')}`);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.toastService.error('Fichier trop volumineux. Maximum: 5 MB');
      return;
    }

    const isDuplicate = this.uploadedFiles.some(f => f.nomFichier === file.name && f.taille === file.size);
    if (isDuplicate) {
      this.toastService.error(`Le fichier "${file.name}" est déjà téléversé`);
      return;
    }

    if (docType === 'RIB') {
      const existing = this.uploadedFiles.find(f => f.type === 'RIB');
      if (existing) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.type !== 'RIB');
        this.toastService.info(`RIB précédent remplacé`);
      }
    }
    else if (!this.canAllowMultipleJustificatifs() && docType !== 'Photo accident' && docType !== 'Devis réparation') {
      const existing = this.uploadedFiles.find(f => f.type === docType);
      if (existing) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.type !== docType);
        this.toastService.info(`${docType} précédent remplacé`);
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      
      const newFile: Fichier = {
        nomFichier: file.name,
        type: docType,
        typePiece: this.mapDocTypeToEnum(docType) as TypePieceSinistre,
        taille: file.size,
        dateUpload: new Date().toISOString(),
        urlFichier: base64,
        contentContentType: file.type
      };

      this.uploadedFiles.push(newFile);
      this.toastService.success(`${docType} téléversé avec succès`);
    };

    reader.onerror = () => {
      this.toastService.error('Erreur lors de la lecture du fichier');
    };

    reader.readAsDataURL(file);
  }

  removeFile(docType: string, index?: number): void {
    if (index !== undefined && this.canAllowMultipleJustificatifs() && docType !== 'RIB') {
      const filesOfType = this.uploadedFiles.filter(f => f.type === docType);
      if (index < filesOfType.length) {
        const fileToRemove = filesOfType[index];
        const fileIndex = this.uploadedFiles.indexOf(fileToRemove);
        if (fileIndex > -1) {
          this.uploadedFiles.splice(fileIndex, 1);
        }
      }
    } else {
      this.uploadedFiles = this.uploadedFiles.filter(f => f.type !== docType);
    }
  }

  isDocumentUploaded(docType: string): boolean {
    return this.uploadedFiles.some(f => f.type === docType);
  }

  getUploadedFile(docType: string): Fichier | undefined {
    return this.uploadedFiles.find(f => f.type === docType);
  }

  getUploadedFilesOfType(docType: string): Fichier[] {
    return this.uploadedFiles.filter(f => f.type === docType);
  }

  getDocumentTypes(): string[] {
    if (!this.requiredDocumentTypes) return [];
    return this.requiredDocumentTypes;
  }

  areAllDocumentsUploaded(): boolean {
    if (this.isOptionalJustificatif && !this.requiredDocumentTypes.includes('Justificatif')) {
      return this.isDocumentUploaded('RIB');
    }

    if (this.isIntemperies) {
      return this.isDocumentUploaded('RIB');
    }

    if (this.isRibOnly) {
      return this.isDocumentUploaded('RIB');
    }

    if (!this.isDocumentUploaded('RIB')) {
      return false;
    }

    if (this.doesNeedPhotoDevis()) {
      const hasPhotoAccident = this.isDocumentUploaded('Photo accident');
      const hasDevisReparation = this.isDocumentUploaded('Devis réparation');
      return hasPhotoAccident || hasDevisReparation;
    }

    if (this.isAnnulation) {
      return this.isDocumentUploaded('Justificatif');
    }

    if (this.doesNeedJustificatif()) {
      return this.isDocumentUploaded('Justificatif');
    }

    return true;
  }

  submit(): void {
    if (this.areAllDocumentsUploaded()) {
      this.documentsSubmitted.emit(this.uploadedFiles);
    } else if (this.isDocumentObligatoire()) {
      this.toastService.error('Veuillez téléverser tous les justificatifs obligatoires avant de continuer.');
    }
  }

  formatFileSize(bytes: number | undefined): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  getIconForDocType(docType: string): string {
    const iconMap: { [key: string]: string } = {
      'RIB': 'credit_card',
      'Justificatif': 'description',
      'Photo accident': 'photo_camera',
      'Devis réparation': 'receipt_long'
    };
    return iconMap[docType] || 'insert_drive_file';
  }

  openFile(fichier: Fichier | undefined): void {
    if (fichier?.urlFichier && fichier?.contentContentType) {
      this.dataUtils.downloadFile(fichier.urlFichier, fichier.contentContentType, fichier.nomFichier || 'fichier');
    }
  }

  mapDocTypeToEnum(docTypeLabel: string): string {
    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      'Justificatif': 'AUTRE',
      'Photo accident': 'PHOTOACCIDENT',
      'Devis réparation': 'DEVISREPARATION',
      'CERTIFICATMEDICAL': 'CERTIFICATMEDICAL',
      'CERTIFICATEMPLOYEUR': 'CERTIFICATEMPLOYEUR',
      'FACTUREJUSTIFICATIVE': 'FACTUREJUSTIFICATIVE'
    };
    return mapping[docTypeLabel] || 'AUTRE';
  }
}
