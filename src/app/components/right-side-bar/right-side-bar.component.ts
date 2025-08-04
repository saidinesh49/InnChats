import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { friend } from 'src/app/Interfaces/friend.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';

@Component({
  selector: 'app-right-side-bar',
  templateUrl: './right-side-bar.component.html',
  styleUrls: ['./right-side-bar.component.css'],
})
export class RightSideBarComponent implements OnInit {
  selectedUser?: friend | null;

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private router: Router
  ) {}

  ngOnInit() {
    this.friendService.selectedUser.subscribe((user) => {
      this.selectedUser = user;
    });
  }

  handleLogout() {
    console.log('handle logout clicked');
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        const userData = res?.data;
        if (userData?.username) {
          this.authService.logoutUser();
        }
        this.router.navigate(['auth/login']);
        console.log('User logout at frontend!');
      },
      error: (error) => {
        console.log('Error while user logout:', error);
      },
    });
  }
}
