import { Component, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {MatPaginatorIntl} from '@angular/material/paginator';

@Component({
  selector: 'app-user-contracts',
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule],  
  templateUrl: './user-contracts.component.html',
  styleUrl: './user-contracts.component.scss'
})
export class UserContractsComponent {
  @ViewChild('paginator') paginator!: MatPaginator;

  contracts: any[] = [];
  dataSource = new MatTableDataSource(this.contracts);

  constructor(private userService: UserService, private paginatorIntl: MatPaginatorIntl) { }

  ngOnInit(): void {
    this.userService.getAllContracts().subscribe((contracts) => {
      this.contracts = contracts;
      this.dataSource = new MatTableDataSource(this.contracts);
      this.dataSource.paginator = this.paginator;
    });
    this.paginatorIntl.itemsPerPageLabel = 'Contrats par page';
    this.paginatorIntl.firstPageLabel = 'Première page';
    this.paginatorIntl.lastPageLabel = 'Dernière page';
    this.paginatorIntl.nextPageLabel = 'Page suivante';
    this.paginatorIntl.previousPageLabel = 'Page précédente';
    this.paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 contrat sur ${length}`;
      }
      return ` Page ${page + 1} -  ${Math.min((page + 1) * pageSize, length)} contrats sur ${length}`;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
