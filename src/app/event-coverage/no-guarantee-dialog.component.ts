import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-no-guarantee-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'messages.noGuaranteeSelected' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'messages.confirmContinueNoGuarantee' | translate }}</p>
      <p>{{ 'messages.continueNoGuarantee' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">{{ 'common.yes' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class NoGuaranteeDialogComponent {
  constructor(private dialogRef: MatDialogRef<NoGuaranteeDialogComponent>, private translate: TranslateService) {}

  onCancel() {
    this.dialogRef.close(false);
  }
  onConfirm() {
    this.dialogRef.close(true);
  }
}


