import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-contracts',
  imports: [CommonModule],
  templateUrl: './user-contracts.component.html',
  styleUrl: './user-contracts.component.scss'
})
export class UserContractsComponent {

  contracts: any[] = [];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getAllContracts().subscribe((contracts) => {
      this.contracts = contracts;
    });
  }
}
