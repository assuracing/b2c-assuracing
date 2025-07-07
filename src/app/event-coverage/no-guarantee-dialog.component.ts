import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-no-guarantee-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Vous n'avez sélectionné aucune garantie</h2>
    <mat-dialog-content>
      <p>Êtes-vous sûr de vouloir continuer sans garantie ?</p>
      <p>Si vous continuez sans garantie, vous serez redirigé vers la page d'accueil</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Oui</button>
    </mat-dialog-actions>
  `
})
export class NoGuaranteeDialogComponent {
  constructor(private dialogRef: MatDialogRef<NoGuaranteeDialogComponent>) {}

  onCancel() {
    this.dialogRef.close(false);
  }
  onConfirm() {
    this.dialogRef.close(true);
  }
}
