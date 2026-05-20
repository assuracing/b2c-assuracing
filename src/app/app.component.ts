import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { SourceService } from './core/services/source.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastComponent } from './toast';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from './core/services/i18n.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    NavbarComponent, 
    FormsModule, 
    HttpClientModule, 
    ToastComponent, 
    TranslateModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'b2cassuracing';

  constructor(
    private userService: UserService, 
    private i18nService: I18nService
    , private sourceService: SourceService
  ) {}

  ngOnInit() {
    this.i18nService.getCurrentLanguage();
    this.sourceService.initFromUrl();
    
    if (this.userService.isLoggedIn()) {
      this.userService.getAccount().subscribe();
    }
  }
}
