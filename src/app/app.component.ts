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
  ) {}

  ngOnInit(): void {
    console.log('ngOnint start');
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        this.userData = res.data;
        this.isLoading = false;

        const currentUrl = this.router.url;
        const isAuthPage = currentUrl.startsWith('/auth');

        if (this.userData?.username) {
          if (isAuthPage || currentUrl == '/') {
            this.router.navigate(['/home']);
          }
        } else {
          if (!isAuthPage) {
            this.router.navigate(['/auth/login']);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        const currentUrl = this.router.url;
        console.log(currentUrl);
        const IsAuthPage = currentUrl.startsWith('/auth');
        this.isLoading = false;
        if (!IsAuthPage) {
          this.router.navigate(['auth/login']);
        }
      },
    });
  }

  // ngOnInit(): void {
  //   this.router.events
  //     .pipe(filter((event) => event instanceof NavigationEnd))
  //     .subscribe(() => {
  //       const currentUrl = this.router.url;
  //       const isAuthPage = currentUrl.startsWith('/auth');
  //       console.log(currentUrl);

  //       this.userData = this.authService.getCurrentUser$();
  //       this.isLoading = false;

  //       if (this.userData?.username) {
  //         if (isAuthPage) {
  //           this.router.navigate(['/home']);
  //         }
  //       } else {
  //         if (!isAuthPage) {
  //           this.router.navigate(['/auth/login']);
  //         }
  //       }
  //     });
  // }
}
