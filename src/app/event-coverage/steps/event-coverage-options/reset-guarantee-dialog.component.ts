import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-guarantee-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule, CommonModule],
  template: `
    <h2 mat-dialog-title>{{ 'messages.deleteSelectionQuestionTitle' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'messages.deleteSelectionQuestion' | translate }} <b>{{ data.label }}</b> ?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ 'common.cancel' | translate }}</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">{{ 'common.validate' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class ResetGuaranteeDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ResetGuaranteeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { label: string }
  ) {}

  onCancel() {
    this.dialogRef.close(false);
  }
  onConfirm() {
    this.dialogRef.close(true);
  }
}
