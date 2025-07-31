import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth-service.service';
import { User } from './Interfaces/user.interface';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'InnChats';
  userData!: any;
  isLoading: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.authService.getCurrentUser$.subscribe((data: User) => {
      this.userData = data;
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentUrl = this.router.url;
        const isAuthPage = currentUrl.startsWith('/auth');
        console.log(currentUrl);

        this.authService.getCurrentUser$.subscribe((userData) => {
          this.userData = userData;
          this.isLoading = false;

          if (userData?.username) {
            if (isAuthPage) {
              this.router.navigate(['/home']);
            }
          } else {
            if (!isAuthPage) {
              this.router.navigate(['/auth/login']);
            }
            // If user is not logged in and already on auth page, stay put
          }
        });
      });
  }
}
