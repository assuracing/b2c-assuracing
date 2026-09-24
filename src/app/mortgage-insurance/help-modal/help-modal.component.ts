import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent {
  constructor(
    private dialogRef: MatDialogRef<HelpModalComponent>,
    private translate: TranslateService
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
