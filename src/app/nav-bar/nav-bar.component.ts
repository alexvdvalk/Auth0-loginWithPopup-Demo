import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  constructor(private auth: AuthService) {}

  loggedIn = false;
  user: any;

  ngOnInit(): void {
    this.auth.userProfile$.subscribe((profile) => {
      console.log('userProfile$', profile);
      this.loggedIn = !!profile;
    });
  }

  login(): void {
    this.auth.login();
  }

  logout(): void {
    this.auth.logout();
  }
}
