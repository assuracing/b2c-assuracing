import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-yearly-guarantee',
  imports: [MatIconModule],
  templateUrl: './yearly-guarantee.component.html',
  styleUrls: ['./yearly-guarantee.component.scss', '../app.component.scss', '../guarantee-choice/guarantee-choice.component.scss']
})
export class YearlyGuaranteeComponent {
  constructor(private router: Router) { }

  navigateToMotorsLeague() {
    this.router.navigate(['/motors-league']);
  }

}
