import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', '../app.component.scss']
})
export class HomeComponent {

isAdmin = false;
isUser = false;

constructor(public userService: UserService, private router: Router) {}

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
    this.userService.getAccount().subscribe(user => {
      console.log('Utilisateur récupéré:', user);
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
}
