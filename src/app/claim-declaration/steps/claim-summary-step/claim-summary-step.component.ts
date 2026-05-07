
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Claim, ClaimPayload, TypeSinistreDTO, Fichier } from '../../../models/claim.model';
import { DataUtilService } from '../../../core/utils/data-util.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateLocaleService } from '../../../core/services/date-locale.service';

@Component({
  selector: 'app-claim-summary-step',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './claim-summary-step.component.html',
  styleUrls: ['./claim-summary-step.component.scss']
})
export class ClaimSummaryStepComponent implements OnInit {
    isModificationLimited(): boolean {
      const type = (this.claim.type || '').toUpperCase();
      return ["ANNULATION", "INTEMPERIES", "INTERRUPTION", "CANCELR"].includes(type);
    }
  @Input() claim!: ClaimPayload;
  @Input() contract?: any;
  @Input() selectedTypeCauseSinistre: any;
  @Input() typeCauseSinistres: any[] = [];
  @Input() availableSinistresTypes: TypeSinistreDTO[] = [];
  @Output() confirmed = new EventEmitter<boolean>();

  summaryForm: FormGroup;
  isConfirmed = false;

  constructor(
    private fb: FormBuilder,
    private dataUtils: DataUtilService,
    private translate: TranslateService,
    private dateLocaleService: DateLocaleService
  ) {
    this.summaryForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  getClaimTypeLabel(): string {
    if (this.claim.typeNom) {
      return this.claim.typeNom;
    }
    
    const typeCode = this.getTypeCodeForLabel(this.claim.type);
    return this.translate.instant(`productNames.${typeCode}`) || this.claim.type;
  }

  private getTypeCodeForLabel(type: string): string {
    const typeCode = (type || '').toUpperCase();
    const mapping: { [key: string]: string } = {
      'ANNULATION': 'annulation',
      'INTERRUPTION': 'interruption',
      'INTEMPERIES': 'badWeather',
      'RC': 'civilLiability',
      'PJ': 'legalProtection',
      'IA': 'personalAccident'
    };
    return mapping[typeCode] || 'annulation';
  }

  private detectTypeCode(typeName: string): string {
    const name = (typeName || '').toLowerCase();
    const primaryPart = name.split('(')[0].trim();

    if (primaryPart.match(/^\s*interruption|^interruption\s/i)) {
      return 'INTERRUPTION';
    } else if (primaryPart.match(/^\s*annulation|^annulation\s/i)) {
      return 'ANNULATION';
    } else if (primaryPart.match(/intempéries|intemperies/i)) {
      return 'INTEMPERIES';
    } else if (primaryPart.match(/protection\s+juridique|protection juridique|pj/i)) {
      return 'PJ';
    } else if (primaryPart.match(/responsabilité\s+civile|responsabilité civile|^rc$|^rc\s/i)) {
      return 'RC';
    } else if (primaryPart.match(/individuelle\s+accident|individuelle accident|ia/i)) {
      return 'IA';
    } else {
      return 'ANNULATION';
    }
  }

  formatDate(date: Date | string): string {
    return this.dateLocaleService.formatDate(date) || '-';
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getIconForDocType(docType: string): string {
    const iconMap: { [key: string]: string } = {
      'RIB': 'credit_card',
      'Justificatif': 'description',
      'Photo accident': 'photo_camera',
      'Devis réparation': 'receipt_long',
      'CERTIFICATMEDICAL': 'description',
      'CERTIFICATEMPLOYEUR': 'description',
      'CONVOCATIONADMINISTRATIVE': 'description',
      'FACTUREJUSTIFICATIVE': 'description',
      'AUTRE': 'insert_drive_file'
    };
    return iconMap[docType] || 'insert_drive_file';
  }

  openFile(fichier: any | undefined): void {
    if (fichier?.contentContentType) {
      const base64 = fichier?.content || fichier?.urlFichier;
      if (base64) {
        this.dataUtils.downloadFile(base64, fichier.contentContentType, fichier.nomFichier || fichier.nom || 'fichier');
      }
    }
  }

  getFilesByType(type: string): any[] {
    if (!this.claim.fichiers) return [];
    return this.claim.fichiers.filter(f => (f.type || f.typePiece) === type);
  }

  getOtherDocumentTypes(): string[] {
    if (!this.claim.fichiers) return [];
    const types = new Set<string>();
    this.claim.fichiers.forEach(f => {
      const docType = f.type || f.typePiece;
      if (docType && docType !== 'RIB' && docType !== 'Justificatif') {
        types.add(docType);
      }
    });
    return Array.from(types);
  }

  submit() {
    if (this.summaryForm.valid) {
      this.confirmed.emit(true);
      this.isConfirmed = true;
    }
  }

  isSummaryConfirmed(): boolean {
    return this.summaryForm.get('acceptTerms')?.value === true;
  }

  ngOnInit(): void {
    this.summaryForm = this.fb.group({
      acceptTerms: [false, Validators.requiredTrue]
    });
  }
}
