import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../app.component.scss', '../guarantee-choice/guarantee-choice.component.scss']
})
export class HomeComponent {

isAdmin = false;
isUser = false;

constructor(public userService: UserService, private router: Router) {}

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
    this.userService.getAccount().subscribe(user => {
      this.isAdmin = this.userService.hasRole('ROLE_ADMIN');
      this.isUser = this.userService.hasRole('ROLE_USER');
    });
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToGuaranteeChoice() {
    this.router.navigate(['/guarantee-choice']);
  }

  goToUserProfilInfo() {
    this.router.navigate(['/user-profil-info']);
  }

  goToUserContracts() {
    this.router.navigate(['/user-contracts']);
  }
}
