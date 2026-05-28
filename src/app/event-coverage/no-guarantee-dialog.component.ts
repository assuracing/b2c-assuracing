import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

interface NoGuaranteeDialogData {
  title?: string;
  message?: string;
  okText?: string;
}

@Component({
  selector: 'app-no-guarantee-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ data?.title || ('messages.noGuaranteeSelected' | translate) }}</h2>
    <mat-dialog-content>
      <p>{{ data?.message || ('messages.selectGuarantee' | translate) }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onOk()">{{ data?.okText || ('common.ok' | translate) }}</button>
    </mat-dialog-actions>
  `
})
export class NoGuaranteeDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<NoGuaranteeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NoGuaranteeDialogData | null
  ) {}

  onOk() {
    this.dialogRef.close();
  }
}


