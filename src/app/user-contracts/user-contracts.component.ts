import { Component, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { ProductMappingService } from '../services/product-mapping.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MotorsLeagueComponent } from '../components/motors-league/motors-league.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DateLocaleService } from '../core/services/date-locale.service';

@Component({
  selector: 'app-user-contracts',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MotorsLeagueComponent,
    TranslateModule,
  ],  
  templateUrl: './user-contracts.component.html',
  styleUrls: ['./user-contracts.component.scss', '../app-second.component.scss']
})
export class UserContractsComponent implements AfterViewInit {
  @ViewChild('paginator') paginator!: MatPaginator;

  contracts: any[] = [];
  groupedContracts: any[] = [];
  filteredContracts: any[] = [];
  dataSource = new MatTableDataSource(this.groupedContracts);
  
  desktopColumns: string[] = [
    'dateAdhesion', 
    'dateSaisie', 
    'adherentnomCliententreprise',
    'circuit',
    'products', 
    'eventType'
  ];
  
  mobileColumns: string[] = [
    'dateAdhesion',
    'products',
  ];
  
  displayedColumns: string[] = [];
  
  years: number[] = [];
  yearFilter = new FormControl<number | null>(null);
  searchFilter = new FormControl('');
  validationFilter = new FormControl<string | null>(null);

  constructor(private userService: UserService, private productMappingService: ProductMappingService, private paginatorIntl: MatPaginatorIntl, private router: Router, private translate: TranslateService, private dateLocaleService: DateLocaleService) {
    this.translate.onLangChange.subscribe(() => {
      this.setPaginatorLabels();
      this.dataSource.data = [...this.groupedContracts];
    });
    this.setPaginatorLabels();
  }

  formatDate(value: string | Date): string {
    return this.dateLocaleService.formatDate(value);
  }

  private setPaginatorLabels(): void {
    this.paginatorIntl.itemsPerPageLabel = this.translate.instant('common.contractsPerPage');
    this.paginatorIntl.firstPageLabel = this.translate.instant('common.firstPage');
    this.paginatorIntl.lastPageLabel = this.translate.instant('common.lastPage');
    this.paginatorIntl.nextPageLabel = this.translate.instant('common.nextPage');
    this.paginatorIntl.previousPageLabel = this.translate.instant('common.previousPage');
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return this.translate.instant('common.zeroContracts', { length: length });
      }
      return this.translate.instant('common.paginationText', {
        page: page + 1,
        min: Math.min((page + 1) * pageSize, length),
        length: length
      });
    };
    this.paginatorIntl.changes.next();
  }

  @HostListener('window:resize', ['$event'])
  onResize(_event: any) {
    this.updateDisplayedColumns(window.innerWidth);
  }

  ngOnInit(): void {
    this.userService.getAllContracts().subscribe((contracts) => {
      this.contracts = contracts.sort((a: any, b: any) => {
        const dateA = new Date(a.dateSaisie).getTime();
        const dateB = new Date(b.dateSaisie).getTime();
        return dateB - dateA;
      });
      
      this.groupContracts();
      this.filteredContracts = [...this.groupedContracts];
      this.initializeDataSource();
      this.initializeYearFilter();
      this.applyFilters();
      
      this.updateDisplayedColumns(window.innerWidth);
    });
    
    this.yearFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchFilter.valueChanges.subscribe(() => this.applyFilters());
    this.validationFilter.valueChanges.subscribe(() => this.applyFilters());
  }
  
  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize);
  }
  
  private initializeYearFilter(): void {
    const yearsSet = new Set<number>();
    this.contracts.forEach(contract => {
      if (contract.dateSaisie) {
        const year = new Date(contract.dateSaisie).getFullYear();
        yearsSet.add(year);
      }
    });
    
    this.years = Array.from(yearsSet).sort((a, b) => b - a);
  }
  
  private groupContracts(): void {
    const grouped: {[key: string]: any} = {};
    if (!this.contracts || !Array.isArray(this.contracts)) {
      this.groupedContracts = [];
      return;
    }
    const filteredContracts = this.contracts.filter(contract => {
      if (!contract) return false;
      const circuit = contract.circuit ? contract.circuit.trim().toLowerCase() : '';
      if (circuit === 'france, union européenne') return false;
      return !this.productMappingService.isMotorsLeagueProduct(contract.produitID);
    });
    filteredContracts.forEach((contract) => {
      if (!contract) return;
      const key = `${contract.dateAdhesion || ''}_${contract.circuit || ''}`;
      const isValid = contract.valide === true || contract.valide === 'true';
      if (!grouped[key]) {
        grouped[key] = {
          ...contract,
          products: [{
            nomcontrat: contract.nomcontrat,
            produitID: contract.produitID,
            valide: isValid,
            contratID: contract.contratID
          }],
          eventTypes: contract.typeEvenement ? [contract.typeEvenement] : [],
          allValid: isValid,
          dateAdhesion: contract.dateAdhesion,
          circuit: contract.circuit,
          dateSaisie: contract.dateSaisie,
          adherentnomCliententreprise: contract.adherentnomCliententreprise
        };
      } else if (contract.typeEvenement && !grouped[key].eventTypes.includes(contract.typeEvenement)) {
        grouped[key].eventTypes.push(contract.typeEvenement);
      } else {
        grouped[key].products.push({
          nomcontrat: contract.nomcontrat,
          produitID: contract.produitID,
          valide: isValid,
          contratID: contract.contratID
        });
        grouped[key].allValid = grouped[key].products.every((p: any) => p.valide === true);
      }
    });
    this.groupedContracts = Object.values(grouped).sort((a: any, b: any) => {
      const dateA = a.dateSaisie ? new Date(a.dateSaisie).getTime() : 0;
      const dateB = b.dateSaisie ? new Date(b.dateSaisie).getTime() : 0;
      return dateB - dateA;
    });
    this.filteredContracts = [...this.groupedContracts];
  }
  
  private updateDisplayedColumns(width: number): void {
    const isMobile = width <= 959;
    this.displayedColumns = isMobile ? this.mobileColumns : this.desktopColumns;
    
    if (this.dataSource) {
      this.dataSource.data = [...this.dataSource.data];
    }
  }
  
  private initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredContracts);
    this.dataSource.paginator = this.paginator;
  }
  
  private applyFilters(): void {
    if (!this.groupedContracts || this.groupedContracts.length === 0) {
      this.groupContracts();
    }
    
    let result = [...(this.groupedContracts || [])];
    
    if (this.yearFilter && this.yearFilter.value) {
      const selectedYear = this.yearFilter.value;
      result = result.filter(group => {
        if (!group.dateSaisie) return false;
        try {
          return new Date(group.dateSaisie).getFullYear() === selectedYear;
        } catch (e) {
          return false;
        }
      });
    }
    
    if (this.validationFilter && this.validationFilter.value !== null) {
      const filterValue = this.validationFilter.value === 'true';
      result = result.filter(group => {
        return group.products && Array.isArray(group.products) 
          ? group.products.some((p: any) => p.valide === filterValue)
          : false;
      });
    }
    
    const searchTerm = (this.searchFilter?.value || '').toLowerCase().trim();
    if (searchTerm) {
      result = result.filter(group => {
        const matchesName = group.adherentnomCliententreprise 
          ? group.adherentnomCliententreprise.toLowerCase().includes(searchTerm)
          : false;
          
        const matchesProducts = group.products && Array.isArray(group.products)
          ? group.products.some((p: any) => 
              p.nomcontrat && p.nomcontrat.toLowerCase().includes(searchTerm)
            )
          : false;
          
        const matchesCircuit = group.circuit 
          ? group.circuit.toLowerCase().includes(searchTerm)
          : false;
          
        return matchesName || matchesProducts || matchesCircuit;
      });
    }
    
    this.filteredContracts = result;
    this.initializeDataSource();
  }
  
  clearYearFilter(): void {
    this.yearFilter.setValue(null);
  }

  clearValidationFilter(): void {
    this.validationFilter.setValue(null);
  }
  

  getProductIcon(productId: string | number, nomContrat?: string): string {
    let icon = this.productMappingService.getProductIcon(String(productId));
    if (!icon || icon === 'help_outline') {
      icon = this.productMappingService.getIconByContractName(nomContrat);
    }
    return icon;
  }

  getProductDiminutif(productId: string | number, nomContrat?: string): string {
    let diminutif = this.productMappingService.getProductDiminutif(String(productId));
    if (!diminutif || diminutif === String(productId)) {
      diminutif = this.productMappingService.getDiminutifByContractName(nomContrat);
    }
    return diminutif;
  }

  getProductLabel(productId: string | number, nomContrat?: string): string {
    let label = this.productMappingService.getProductLabel(String(productId));
    if (label.startsWith('Produit inconnu')) {
      if (nomContrat) {
        label = nomContrat;
      }
    }
    return label;
  }

  getProductTooltip(productId: string | number, nomContrat?: string): string {
    const label = this.getProductLabel(productId, nomContrat);
    return this.translate.instant('eventContracts.viewDetails') + label;
  }

  getProductColorClass(productId: string | number, nomContrat?: string): string {
    const label = this.getProductLabel(productId, nomContrat).toLowerCase();
    
    if (label.includes('interruption') || label.includes('annulation') || label.includes('intempéries') || label.includes('intemperies') || label.includes('cancelr')) {
      return 'interruption-annulation-icon';
    } else if (label.includes('individuelle accident') || label.includes('ia')) {
      return 'ia-icon';
    } else if (label.includes('protection juridique') || label.includes('défense recours') || label.includes('defense recours') || label.includes('pj')) {
      return 'pj-icon';
    } else if (label.includes('rc') || label.includes('responsabilité civile')) {
      return 'rc-icon';
    }
    
    return 'default-icon';
  }

  trackByContractId(index: number, contract: any): string {
    return contract.contratID;
  }

  trackByProductId(index: number, product: any): string {
    return product.produitID || index;
  }
  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  eventTypes = [
    { value: 'ROULAGE_ENTRAINEMENT', label: 'eventCoverage.eventTypes.roulageEntrainement', icon: 'two_wheeler' },
    { value: 'COMPETITION', label: 'eventCoverage.eventTypes.competition', icon: 'emoji_events' },
    { value: 'COACHING', label: 'eventCoverage.eventTypes.coaching', icon: 'record_voice_over' },
    { value: 'STAGE_PILOTAGE', label: 'eventCoverage.eventTypes.stagePilotage', icon: 'school' }
  ];

  formatEventType(eventType: string | null | undefined): string | null {
    if (!eventType) return null;
    const item = this.eventTypes.find(e => e.value === eventType);
    return item ? this.translate.instant(item.label) : eventType;
  }

  getEventTypeIcon(eventType: string | null | undefined): string {
    if (!eventType) return '';
    const item = this.eventTypes.find(e => e.value === eventType);
    return item ? item.icon : '';
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
    }
    
    setTimeout(() => {
      this.updateDisplayedColumns(window.innerWidth);
    });
  }
}
