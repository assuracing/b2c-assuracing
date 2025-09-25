import { Component, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { ProductMappingService } from '../services/product-mapping.service';
import { CommonModule, DatePipe } from '@angular/common';
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
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CustomDatePipe,
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

  constructor(private userService: UserService, private productMappingService: ProductMappingService, private paginatorIntl: MatPaginatorIntl, private router: Router) {
    this.paginatorIntl.itemsPerPageLabel = 'Contrats par page';
    this.paginatorIntl.firstPageLabel = 'Première page';
    this.paginatorIntl.lastPageLabel = 'Dernière page';
    this.paginatorIntl.nextPageLabel = 'Page suivante';
    this.paginatorIntl.previousPageLabel = 'Page précédente';
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 contrat sur ${length}`;
      }
      return `Page ${page + 1} - ${Math.min((page + 1) * pageSize, length)} contrats sur ${length}`;
    };
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
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
          console.error('Erreur de format de date:', group.dateSaisie, e);
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
  
  getProductIcon(productId: string | number): string {
    const icon = this.productMappingService.getProductIcon(String(productId));
    return icon;
  }

  getProductDiminutif(productId: string | number): string {
    const diminutif = this.productMappingService.getProductDiminutif(String(productId));
    return diminutif;
  }

  getProductLabel(productId: string | number): string {
    const label = this.productMappingService.getProductLabel(String(productId));
    return label;
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
    { value: 'ROULAGE_ENTRAINEMENT', label: 'Roulage', icon: 'two_wheeler' },
    { value: 'COMPETITION', label: 'Compétition', icon: 'emoji_events' },
    { value: 'COACHING', label: 'Coaching', icon: 'record_voice_over' },
    { value: 'STAGE_PILOTAGE', label: 'Stage de pilotage', icon: 'school' }
  ];

  formatEventType(eventType: string | null | undefined): string | null {
    if (!eventType) return null;
    const item = this.eventTypes.find(e => e.value === eventType);
    return item ? item.label : eventType;
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
