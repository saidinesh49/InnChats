import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { friend } from 'src/app/Interfaces/friend.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css'],
})
export class LeftSideBarComponent implements OnInit {
  userData!: any;
  friendsList!: friend[] | null;
  selectedUser!: friend | null;
  searchTerm!: String;
  showPopup!: boolean;

  constructor(
    private authService: AuthService,
    private friendService: FriendService
  ) {
    this.friendService.getFriendsListFromServer().subscribe({
      next: (data) => {
        console.log('Friends list requrest data is:', data?.data);
        this.friendService.setFriendsList(data?.data?.friends);
      },
      error: (error) => {
        console.log('Error while fetching friendsList:', error);
      },
    });
  }

  ngOnInit() {
    this.friendService.friendsList.subscribe((data) => {
      this.friendsList = data;
    });

    this.authService.userData.subscribe((userData) => {
      this.userData = userData;
    });
  }

  toggleFriend(username: string) {
    this.friendService.toggleFriend(username);
    this.friendService.selectedUser.subscribe((user) => {
      console.log(user);
      this.selectedUser = user;
    });
  }
}
