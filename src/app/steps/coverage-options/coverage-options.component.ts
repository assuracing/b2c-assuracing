import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  selector: 'app-coverage-options',
  templateUrl: './coverage-options.component.html',
  styleUrls: ['./coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss', '../../event-coverage/steps/event-coverage-options/event-coverage-options.component.scss']
})
export class CoverageOptionsComponent {
  @Input() form!: FormGroup;
  PROTECTION_LEVELS: { [key: number]: { death: number; disability: number; price: number } } = {
    1: { death: 7600, disability: 18500, price: 95 },
    2: { death: 15200, disability: 37000, price: 213 },
    3: { death: 30400, disability: 74000, price: 450 },
    4: { death: 45600, disability: 111000, price: 630 },
    5: { death: 76000, disability: 185000, price: 820 }
  };

  selectedLevel: number | null = null;
  selectedPrice: number | null = null;

  onProtectionLevelChange(level: number) {
    this.selectedLevel = level;
    this.selectedPrice = this.PROTECTION_LEVELS[level].price;
    this.form.get('coverageLevel')?.setValue(level);
  }

  formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
