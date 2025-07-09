import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profil-info',
  imports: [CommonModule],
  templateUrl: './user-profil-info.component.html',
  styleUrls: ['./user-profil-info.component.scss']
})
export class UserProfilInfoComponent {
  adherentInfo: any = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAccount().subscribe(user => {
      if (user && user.id) {
        this.userService.getAdherentId().subscribe(adherentId => {
          this.userService.getAdherentInfo().subscribe(adherent => {
            this.adherentInfo = adherent;
          });
        });
      }
    });
  }
}
