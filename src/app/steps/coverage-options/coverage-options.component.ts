import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  imports: [MatIconModule, MatTooltipModule],
  selector: 'app-coverage-options',
  templateUrl: './coverage-options.component.html',
  styleUrls: ['./coverage-options.component.scss', '../../motors-league/motors-league.component.scss']
})
export class CoverageOptionsComponent {
  @Input() form!: FormGroup;
  selectedLevel: number | null = null;

  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  levelPrices: { [key: number]: number } = {
    1: 95,
    2: 213,
    3: 450,
    4: 630,
    5: 820
  };

  coverageAmounts: { [key: number]: { death: number; disability: number } } = {
    1: { death: 7600, disability: 18500  },
    2: { death: 25000, disability: 37500 },
    3: { death: 100000, disability: 150000 },
    4: { death: 150000, disability: 200000 },
    5: { death: 200000, disability: 300000 }
  };

  selectLevel(level: number): void {
    this.selectedLevel = level;
    this.form.patchValue({ coverageLevel: level });
  }

  get selectedPrice(): number | null {
    return this.selectedLevel !== null ? this.levelPrices[this.selectedLevel] : null;
  }
}