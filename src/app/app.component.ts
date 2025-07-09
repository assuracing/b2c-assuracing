import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'b2cassuracing';

  constructor(private userService: UserService) {}

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
      this.userService.getAccount().subscribe();
    }
  }
}
