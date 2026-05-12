
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';

import { ClaimService } from '../services/claim.service';
import { ContractService } from '../services/contract.service';
import { ToastService } from '../services/toast.service';
import { Claim, ClaimPayload, ClaimTypeDTO, TypeCauseSinistre, Fichier, TypeSinistreDTO, Product } from '../models/claim.model';

import { ClaimContractStepComponent } from './steps/claim-contract-step/claim-contract-step.component';
import { ClaimReasonStepComponent } from './steps/claim-reason-step/claim-reason-step.component';
import { ClaimInfoStepComponent } from './steps/claim-info-step/claim-info-step.component';
import { ClaimDocumentsStepComponent } from './steps/claim-documents-step/claim-documents-step.component';
import { ClaimSummaryStepComponent } from './steps/claim-summary-step/claim-summary-step.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-claim-declaration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    ClaimContractStepComponent,
    ClaimReasonStepComponent,
    ClaimInfoStepComponent,
    ClaimDocumentsStepComponent,
    ClaimSummaryStepComponent,
    TranslateModule
  ],
  templateUrl: './claim-declaration.component.html',
  styleUrls: ['./claim-declaration.component.scss']
})
export class ClaimDeclarationComponent implements OnInit, OnDestroy {
  goBackToContract(): void {
      if (this.showContractStep && this.stepper) {
        this.stepper.selectedIndex = 0;
      } else if (this.contractId) {
        this.router.navigate([`/contracts/${this.contractId}`]);
      } else {
        this.router.navigate(['/contracts']);
      }
    }
  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild('claimSummaryStep') claimSummaryStep?: ClaimSummaryStepComponent;
  @ViewChild('claimDocumentsStep') claimDocumentsStep?: ClaimDocumentsStepComponent;

  contractId?: number;
  selectedContract?: any;
  contractSelected = false;
  showContractStep = true;
  selectedTypeId?: number;
  selectedTypeCauseSinistre?: TypeCauseSinistre;
  typeCauseSinistres: TypeCauseSinistre[] = [];
  availableSinistresTypes: TypeSinistreDTO[] = [];
  showTypeStep = false;
  showReasonStep = false;
  minDate?: Date;
  maxDate?: Date;
  claim: ClaimPayload = {
    type: '',
    dateEvenement: '',
    description: '',
    fichiers: []
  };

  isLoading = false;
  private subscriptions = new Subscription();
  labelPosition: 'end' | 'bottom' = 'end';

  steps: { label: string, icon: string }[] = [];

  constructor(
    public claimService: ClaimService,
    private contractService: ContractService,
    private toastService: ToastService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver.observe(['(max-width: 785px)']).subscribe(result => {
      this.labelPosition = result.matches ? 'bottom' : 'end';
    });
  }

  ngOnInit(): void {
    this.steps = [
      { label: this.translate.instant('claimDeclaration.guaranteeType'), icon: 'category' },
      { label: this.translate.instant('claimDeclaration.requestReason'), icon: 'help' },
      { label: this.translate.instant('claimDeclaration.information'), icon: 'info' },
      { label: this.translate.instant('claimDeclaration.supportingDocuments'), icon: 'attach_file' },
      { label: this.translate.instant('claimDeclaration.confirmation'), icon: 'check_circle' }
    ];

    const sub = this.activatedRoute.params.subscribe(params => {
      if (params['contractId']) {
        this.contractId = parseInt(params['contractId'], 10);
        this.contractSelected = true;
        this.showContractStep = false;
        if (this.contractId) {
          this.loadContractInfoFromURL(this.contractId);
        }
      } else {
        this.contractSelected = false;
        this.showContractStep = true;
      }
    });
    this.subscriptions.add(sub);
  }

  private loadContractInfoFromURL(contractId: number): void {
    this.contractService.getContractDetails(contractId).subscribe({
      next: (contract: any) => {
        const normalizedContract = {
          ...contract,
          contratID: contract.contratID || contract.id,
          nomcontrat: contract.nomcontrat || contract.produit?.nom,
          circuit: typeof contract.circuit === 'object' && contract.circuit?.nom 
            ? contract.circuit.nom 
            : contract.circuit
        };
        
        this.selectedContract = normalizedContract;
        this.claim.contractId = normalizedContract.contratID;
        this.claim.contractNom = normalizedContract.nomcontrat;
        this.claim.contractCircuit = normalizedContract.circuit;
        this.claim.contractDateAdhesion = normalizedContract.dateAdhesion;

        this.calculateDateBounds(normalizedContract);

        this.loadProductTypesForContract(contractId, false);
      },
      error: (error) => {
        this.toastService.error(this.translate.instant('messages.loadContractError'));
      }
    });
  }

  private loadProductTypesForContract(contractId: number, autoAdvanceStepper: boolean = false): void {
    this.isLoading = true;

    const typeSub = this.claimService.getTypeSinistres(contractId).subscribe({
      next: (types: any[]) => {
        this.availableSinistresTypes = types || [];
        this.determineClaimTypeFlow(autoAdvanceStepper);
      },
      error: (error) => {
        this.toastService.error(this.translate.instant('messages.loadClaimTypesError'));
        this.isLoading = false;
      }
    });

    this.subscriptions.add(typeSub);
  }

  private determineClaimTypeFlow(autoAdvance: boolean = false): void {
    if (this.availableSinistresTypes.length >= 1) {
      this.showTypeStep = true;
      this.isLoading = false;
    } else {
      this.toastService.error(this.translate.instant('messages.noClaimTypeAvailable'));
      this.isLoading = false;
    }

    if (autoAdvance && this.showTypeStep && this.stepper) {
      setTimeout(() => {
        this.stepper.next();
      }, 0);
    }
  }

  private loadCausesInBackground(): void {
    if (!this.contractId) {
      return;
    }

    const causesReq = this.claimService.getTypeCauseSinistres(this.contractId);

    const causesSub = causesReq.subscribe({
      next: (causes) => {
        this.typeCauseSinistres = this.filterCausesForClient(causes);
        this.showReasonStep = this.typeCauseSinistres.length > 0;
      },
      error: (error) => {
        this.typeCauseSinistres = [];
        this.showReasonStep = false;
      }
    });

    this.subscriptions.add(causesSub);
  }

  private filterCausesForClient(causes: TypeCauseSinistre[]): TypeCauseSinistre[] {
    return causes.filter(cause => !cause.nom?.toLowerCase().includes('refus'));
  }

  private loadCausesAndContinue(): void {
    this.loadCausesInBackground();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  onContractSelected(contract: any): void {
    if (this.contractId && this.contractId !== contract.contratID) {
      this.resetClaimData();
    }

    this.contractId = contract.contratID;
    this.selectedContract = contract;
    this.contractSelected = true;
    this.showContractStep = true;

    this.claim.contractId = contract.contratID;
    this.claim.contractNom = contract.nomcontrat;
    this.claim.contractCircuit = contract.circuit;
    this.claim.contractDateAdhesion = contract.dateAdhesion;

    this.calculateDateBounds(contract);

    if (this.contractId) {
      this.loadProductTypesForContract(this.contractId, true);
    }
  }

  private calculateDateBounds(contract: any): void {
    if (contract.dateAdhesion) {
      this.minDate = new Date(contract.dateAdhesion);
    }
    if (contract.dateFin) {
      this.maxDate = new Date(contract.dateFin);
    }
  }

  private resetClaimData(): void {
    this.claim = {
      type: '',
      dateEvenement: '',
      description: '',
      fichiers: []
    };
    this.selectedTypeId = undefined;
    this.selectedTypeCauseSinistre = undefined;
    this.typeCauseSinistres = [];
    this.availableSinistresTypes = [];
    this.showTypeStep = false;
    this.showReasonStep = false;
    
    if (this.claimDocumentsStep) {
      this.claimDocumentsStep.resetFiles();
    }
  }

  onClaimTypeSelected(typeId: number): void {
    const selectedType = this.availableSinistresTypes.find(t => t.id === typeId);
    if (selectedType) {
      this.selectedTypeId = typeId;
      this.claim.type = this.detectTypeCodeFromName(selectedType.nom);
      this.claim.typeNom = selectedType.nom;
    }
  }

  private detectTypeCodeFromName(typeName: string): string {
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
      return primaryPart;
    }
  }

  getFilteredCausesForClaimType(): any[] {
    return this.typeCauseSinistres;
  }

  submitTypeWithValidation(): void {
    if (!this.claim.type) {
      this.toastService.error(this.translate.instant('messages.selectClaimType'));
      return;
    }
    
    this.loadCausesInBackground();
    if (this.stepper) {
      setTimeout(() => {
        this.stepper.next();
      }, 100);
    }
  }

  submitType(): void {
    if (this.claim.type) {
      this.loadCausesInBackground();
      if (this.stepper) {
        this.stepper.next();
      }
    } else {
      this.toastService.error(this.translate.instant('messages.selectGuaranteeType'));
    }
  }

  trackByTypeId(index: number, type: any): any {
    return type.id ?? index;
  }

  onReasonSelected(cause: TypeCauseSinistre): void {
    this.selectedTypeCauseSinistre = cause;
  }

  submitReason(): void {
    if (!this.selectedTypeCauseSinistre) {
      this.toastService.error(this.translate.instant('messages.selectRequestReason'));
      return;
    }
    
    if (this.stepper) {
      this.stepper.next();
    }
  }

  submitInfo(infoComponent: any): void {
    if (infoComponent.form.valid) {
      this.onClaimInfoSubmitted(infoComponent.form.value);
      this.stepper.next();
    } else {
      this.toastService.error(this.translate.instant('messages.fillAllRequiredFields'));
    }
  }

  onClaimInfoSubmitted(info: any): void {
    this.claim = { ...this.claim, ...info };
  }

  onDocumentsSubmitted(fichiers: any[]): void {
    this.claim.fichiers = fichiers;
  }

  onBankingSubmitted(banking: any): void {
    this.claim = { ...this.claim, ...banking };
  }

  submitDocuments(documentsComponent: any): void {
    if (!documentsComponent.areAllDocumentsUploaded()) {
      this.toastService.error(this.translate.instant('messages.uploadAllRequiredDocuments'));
      return;
    }
    
    if (documentsComponent.uploadedFiles.length > 0) {
      this.onDocumentsSubmitted(documentsComponent.uploadedFiles);
    }
    this.stepper.next();
  }

  submitClaimWithValidation(): void {
    if (!this.claimSummaryStep?.isSummaryConfirmed()) {
      this.toastService.error(this.translate.instant('messages.confirmationRequired'));
      return;
    }

    this.submitClaim();
  }

  submitClaim(): void {
    if (!this.validateClaim()) {
      return;
    }

    if (!this.contractId) {
      this.toastService.error(this.translate.instant('messages.contractNotSelected'));
      return;
    }

    this.isLoading = true;

    const today = new Date().toISOString().split('T')[0];
    const eventDate = new Date(this.claim.dateEvenement).toISOString().split('T')[0];

      const payload: any = {
      typeSinistre: { id: this.claimService.getTypeSinistreId(this.claim.type) },
      dateSinistre: eventDate,
      dateDeclaSinistre: today,
      comment: this.claim.description,
      contrat: { id: this.contractId },
      typeCauseSinistre: {},
      etatValidationOrganisateur: 'AVALIDE',
      envoiMail: true,
      etatEnCours: this.translate.instant('claimDeclaration.clientDeclaration')
    };

    if (this.selectedTypeCauseSinistre && this.selectedTypeCauseSinistre.id) {
      payload.typeCauseSinistre = { id: this.selectedTypeCauseSinistre.id };
    }

    const sub = this.claimService.createClaim(payload).subscribe({
      next: (response) => {
        const sinistreId = response.id;

        if (this.claim.fichiers && this.claim.fichiers.length > 0) {
          this.uploadFilesForClaim(sinistreId);
        } else {
          this.handleClaimSuccess();
        }
      },
      error: (error) => {
        this.toastService.error(this.translate.instant('messages.claimCreationError'));
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  private uploadFilesForClaim(sinistreId: number): void {
    if (!this.claim.fichiers || this.claim.fichiers.length === 0) {
      this.handleClaimSuccess();
      return;
    }

    let uploadedCount = 0;
    const totalFiles = this.claim.fichiers.length;

    this.claim.fichiers.forEach((file) => {
      const enumType = this.mapDocTypeToEnum(file.type || '');
      
      const filePayload: any = {
        nom: file.nomFichier,
        envoiQuandSinistre: false,
        envoiQuandRegistration: false,
        envoiQuandFinContrat: false,
        parametragePrix: false,
        content: file.urlFichier || '',
        contentContentType: file.contentContentType || 'application/octet-stream',
        comment: null,
        typePiece: enumType,
        sinistre: { id: sinistreId }
      };

      const uploadSub = this.claimService.uploadFile(filePayload).subscribe({
        next: (response) => {
          uploadedCount++;
          
          if (uploadedCount === totalFiles) {
            this.handleClaimSuccess();
          }
        },
        error: (error) => {
          this.toastService.error(this.translate.instant('messages.fileUploadError', { fileName: file.nomFichier }));
          this.isLoading = false;
        }
      });

      this.subscriptions.add(uploadSub);
    });
  }

  private mapDocTypeToEnum(docTypeLabel: string): string {
    const accidentPhoto = this.translate.instant('claimDeclaration.accidentPhoto');
    const repairQuote = this.translate.instant('claimDeclaration.repairQuote');

    const mapping: { [key: string]: string } = {
      'RIB': 'RIB',
      'Justificatif': 'AUTRE',
      [accidentPhoto]: 'PHOTOACCIDENT',
      [repairQuote]: 'DEVISREPARATION',
      'CERTIFICATMEDICAL': 'CERTIFICATMEDICAL',
      'CERTIFICATEMPLOYEUR': 'CERTIFICATEMPLOYEUR',
      'FACTUREJUSTIFICATIVE': 'FACTUREJUSTIFICATIVE'
    };
    return mapping[docTypeLabel] || 'AUTRE';
  }

  private handleClaimSuccess(): void {
    this.toastService.success(this.translate.instant('messages.claimCreationSuccess'));
    this.isLoading = false;
    this.router.navigate(['/contracts', this.contractId]);
  }

  private validateClaim(): boolean {
    if (!this.claim.type) {
      this.toastService.error(this.translate.instant('messages.selectGuaranteeType'));
      return false;
    }

    if (!this.claim.dateEvenement) {
      this.toastService.error(this.translate.instant('claimDeclaration.claimDateRequired'));
      return false;
    }

    const type = (this.claim.type || '').toUpperCase();
    if (["ANNULATION", "INTEMPERIES", "INTERRUPTION", "CANCELR"].includes(type)) {
      if (!this.claim.fichiers || this.claim.fichiers.length === 0) {
        this.toastService.error(this.translate.instant('messages.uploadAtLeastRib'));
        return false;
      }
    }

    return true;
  }
}
