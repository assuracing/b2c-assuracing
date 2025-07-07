import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-guarantee-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Supprimer la sélection ?</h2>
    <mat-dialog-content>
      <p>Êtes-vous sûr de vouloir supprimer la sélection de la garantie <b>{{ data.label }}</b> ?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Non</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Oui</button>
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
