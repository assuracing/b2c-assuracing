import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
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
import { CustomDatePipe } from '../shared/pipes/custom-date.pipe';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    FormsModule,
    ReactiveFormsModule,
    CustomDatePipe
  ],  
  templateUrl: './user-contracts.component.html',
  styleUrls: ['./user-contracts.component.scss']
})
export class UserContractsComponent implements AfterViewInit {
  @ViewChild('paginator') paginator!: MatPaginator;

  contracts: any[] = [];
  filteredContracts: any[] = [];
  dataSource = new MatTableDataSource(this.contracts);
  displayedColumns: string[] = [
    'dateAdhesion', 
    'dateSaisie', 
    'adherentnomCliententreprise', 
    'nomcontrat', 
    'circuit', 
    'valide'
  ];
  
  years: number[] = [];
  yearFilter = new FormControl<number | null>(null);
  searchFilter = new FormControl('');

  constructor(private userService: UserService, private paginatorIntl: MatPaginatorIntl) {
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

  ngOnInit(): void {
    this.userService.getAllContracts().subscribe((contracts) => {
      this.contracts = contracts;
      this.filteredContracts = [...this.contracts];
      this.initializeDataSource();
      this.initializeYearFilter();
      
      this.applyFilters();
    });
    
    this.yearFilter.valueChanges.subscribe(() => this.applyFilters());
    this.searchFilter.valueChanges.subscribe(() => this.applyFilters());
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
  
  private initializeDataSource(): void {
    this.dataSource = new MatTableDataSource(this.filteredContracts);
    this.dataSource.paginator = this.paginator;
  }
  
  private applyFilters(): void {
    let result = [...this.contracts];
    
    if (this.yearFilter.value) {
      const selectedYear = this.yearFilter.value;
      result = result.filter(contract => {
        if (!contract.dateSaisie) return false;
        return new Date(contract.dateSaisie).getFullYear() === selectedYear;
      });
    }
    
    const searchTerm = (this.searchFilter.value || '').toLowerCase();
    if (searchTerm) {
      result = result.filter(contract => 
        (contract.adherentnomCliententreprise?.toLowerCase().includes(searchTerm)) ||
        (contract.nomcontrat?.toLowerCase().includes(searchTerm)) ||
        (contract.circuit?.toLowerCase().includes(searchTerm))
      );
    }
    
    this.filteredContracts = result;
    this.initializeDataSource();
  }
  
  clearYearFilter(): void {
    this.yearFilter.setValue(null);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
