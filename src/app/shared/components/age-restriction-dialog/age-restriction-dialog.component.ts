import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

export interface AgeRestrictionDialogData {
  role: 'pilote' | 'passager';
}

@Component({
  selector: 'app-age-restriction-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Âge minimum requis</h2>
    <mat-dialog-content>
      <p>Vous devez avoir au moins 16 ans pour souscrire en tant que {{ data.role }}.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Compris</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      padding: 20px;
    }
    p {
      margin: 0 0 10px;
    }
  `]
})
export class AgeRestrictionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AgeRestrictionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AgeRestrictionDialogData
  ) {}
}
