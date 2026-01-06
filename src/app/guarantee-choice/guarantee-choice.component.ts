import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guarantee-choice',
  imports: [],
  templateUrl: './guarantee-choice.component.html',
  styleUrls: ['./guarantee-choice.component.scss', '../app.component.scss'],
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
