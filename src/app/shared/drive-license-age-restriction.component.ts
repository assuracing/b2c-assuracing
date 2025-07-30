import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

export interface DriveLicenseAgeRestrictionDialog {
  driveLicenseType: 'Permis B' | 'Permis A' | 'CASM' | '';
  ages: number[];
}

@Component({
  selector: 'app-drive-license-age-restriction-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
    <h2 mat-dialog-title>Âge minimum requis</h2>
    <mat-dialog-content>
        <p *ngIf="data.ages.length === 1">
          Le {{ data.driveLicenseType }} est obligatoire pour les personnes de plus de {{ data.ages[0] }} ans.
        </p>
        <p *ngIf="data.ages.length > 1">
          Le {{ data.driveLicenseType }} est obligatoire pour les personnes de {{ data.ages[0] }} à {{ data.ages[1] }} ans.
        </p>
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
export class DriveLicenseAgeRestrictionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DriveLicenseAgeRestrictionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DriveLicenseAgeRestrictionDialog
  ) {}
}
