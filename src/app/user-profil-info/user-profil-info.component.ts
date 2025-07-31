import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

interface User {
  id: number;
  login: string;
}

interface UserInfo {
  id: number;
  nom: string;
  prenom: string;
  adresse?: string;
  email?: string;
  complementadresse?: string;
  codepostal?: string;
  ville?: string;
  telPortable?: string;
  telFixe?: string | null;
  dateNaissance?: string;
  dateinscription?: string;
  civilite?: string;
  autre?: string | null;
  user: User;
  isBasicInfo?: boolean;
}

@Component({
  selector: 'app-user-profil-info',
  imports: [CommonModule],
  templateUrl: './user-profil-info.component.html',
  styleUrls: ['./user-profil-info.component.scss']
})
export class UserProfilInfoComponent {
  userInfo: UserInfo | null = null;
  isLoading = true;
  hasAdherentInfo = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAdherentInfo().subscribe({
      next: (data) => {
        console.log("données recu ", data);
        this.userInfo = data;
        this.hasAdherentInfo = !data.isBasicInfo;
        console.log("hasAdherentInfo", this.hasAdherentInfo);
        console.log("isBasicInfo", data.isBasicInfo);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des informations:', error);
        this.isLoading = false;
      }
    });
  }
}
