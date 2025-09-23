// adaptive-tooltip.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-adaptive-tooltip',
  templateUrl: './adaptive-tooltip.component.html',
  styleUrls: ['./adaptive-tooltip.component.scss'],
  imports: [CommonModule, MatTooltipModule, MatButtonModule, MatMenuModule, MatIconModule],
})
export class AdaptiveTooltipComponent {
  @Input() text: string = '';
  @Input() icon: string = 'info';
  @Input() showIcon: boolean = true;
  @Input() blink: boolean = false;

  isMobile(): boolean {
    return window.innerWidth < 768;
  }
}
