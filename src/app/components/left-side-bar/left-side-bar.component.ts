import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { friend } from 'src/app/Interfaces/friend.interface';
import { FriendService } from 'src/app/services/friend-service.service';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css'],
})
export class LeftSideBarComponent {
  friendsList!: friend[];
  selectedUser!: friend | null;
  searchTerm!: String;
  showPopup!: boolean;

  constructor(private friendService: FriendService) {
    this.friendService.friendsList.subscribe((friends) => {
      this.friendsList = friends;
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
