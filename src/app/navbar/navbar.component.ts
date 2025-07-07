import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';


@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [MatIconModule, MatMenuModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
 langue = 'fr';

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;
  @ViewChild('langueRef') langueRef!: ElementRef;  
  @ViewChild('navbarRef') navbarRef!: ElementRef;

  constructor(private router: Router, public authService: AuthService) {
    document.addEventListener('click', (event: MouseEvent) => this.handleClickOutside(event));
  }
    
  showDropdown = false;
  showLangueDropdown = false;
  isMenuOpen = false;
  isLangueDropdownOpen = false;
  isCompteDropdownOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.isLangueDropdownOpen = false;
      this.isCompteDropdownOpen = false;
    }
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;
    if (this.navbarRef && !this.navbarRef.nativeElement.contains(target)) {
      this.isMenuOpen = false;
      this.showDropdown = false;
      this.showLangueDropdown = false;
      this.isLangueDropdownOpen = false;
      this.isCompteDropdownOpen = false;
    }
  }

  toggleLangueDropdown() {
    this.isLangueDropdownOpen = !this.isLangueDropdownOpen;
    this.isCompteDropdownOpen = false;
  }

toggleCompteDropdown() {
  this.isCompteDropdownOpen = !this.isCompteDropdownOpen;
  this.isLangueDropdownOpen = false;
}

  changerLangue(lang: string) {
    console.log('Langue choisie :', lang);
    this.isLangueDropdownOpen = false;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  
  redirigerCompte() {
    this.router.navigate(['/login']);
    this.showDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    const clickedInsideCompte = this.dropdownRef?.nativeElement.contains(target);
    const clickedInsideLangue = this.langueRef?.nativeElement.contains(target);
  
    if (!clickedInsideCompte) {
      this.showDropdown = false;
    }
  
    if (!clickedInsideLangue) {
      this.showLangueDropdown = false;
    }
  }

  redirigerAccueil() {
      this.router.navigate(['/']);
  }
}
