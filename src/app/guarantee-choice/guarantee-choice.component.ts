import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-guarantee-choice',
  imports: [TranslateModule, MatIconModule, MatButtonModule],
  templateUrl: './guarantee-choice.component.html',
  styleUrls: ['./guarantee-choice.component.scss', '../app.component.scss', '../app-second.component.scss'],
})
export class GuaranteeChoiceComponent {

  constructor(private router: Router) { }

  navigateToYearlyGuarantee() {
    this.router.navigate(['/yearly-guarantee']);
  }

  navigateToEventGuarantee() {
    this.router.navigate(['/event-coverage']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
