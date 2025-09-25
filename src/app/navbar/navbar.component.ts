import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../services/user.service';

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [MatIconModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  showWelcome: boolean = false;
  langue: string = 'fr';
  isLangueDropdownOpen = false;
  isMobile = false;

  @ViewChild('navbarRef') navbarRef!: ElementRef;

  constructor(private router: Router, public authService: AuthService, public userService: UserService) {}

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private hasWelcomed = false;

  ngOnInit() {
    this.checkScreenSize();
    this.langue = localStorage.getItem('user_lang') || 'fr';

    this.userService.user$.subscribe(user => {
      if (user && !this.hasWelcomed) {
        this.triggerWelcomeAnimation();
        this.hasWelcomed = true;
      } else if (!user) {
        this.hasWelcomed = false;
      }
    });

    document.addEventListener('click', (event: MouseEvent) =>
      this.handleClickOutside(event)
    );
  }

  ngOnDestroy() {
    document.removeEventListener('click', (event: MouseEvent) =>
      this.handleClickOutside(event)
    );
  }

  private triggerWelcomeAnimation() {
    this.showWelcome = true;
    setTimeout(() => {
      this.showWelcome = false;
    }, 3000);
  }

  private checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile = width < 768;
  }

  toggleLangueDropdown(event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isLangueDropdownOpen = !this.isLangueDropdownOpen;
  }

  changerLangue(codeLangue: string) {
    this.langue = codeLangue;
    localStorage.setItem('user_lang', codeLangue);
    this.isLangueDropdownOpen = false;
  }

  handleClickOutside(event: MouseEvent) {
    const target = event.target as Node;
    if (this.navbarRef && !this.navbarRef.nativeElement.contains(target)) {
      this.isLangueDropdownOpen = false;
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
