import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { friend } from 'src/app/Interfaces/friend.interface';
import { Message } from 'src/app/Interfaces/message.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';
import { HashService } from 'src/app/services/hash-service.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
})
export class ChatsComponent implements OnInit {
  count: number = 0;

  userData!: any;
  friendsList!: any;
  chatId!: string;
  messages!: Message[];
  selectedUser!: friend | null;
  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private hashService: HashService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.authService.userData.subscribe((data) => {
      this.userData = data;
    });
  }

  ngOnInit() {
    this.friendService.selectedUser.subscribe((user) => {
      this.selectedUser = user;
      console.log(this.count++, 'selectedUser at chat:', this.selectedUser);
    });

    this.friendService.friendsList.subscribe((friends) => {
      this.friendsList = friends;
      this.activatedRoute.queryParams.subscribe((params) => {
        this.chatId = params['chatId'];
        console.log(
          this.count++,
          'Chatid identifed by chat comp:',
          this.chatId
        );
        if (this.chatId) this.showChatBox();
      });
    });
  }

  showChatBox() {
    let users = this.hashService.decryptData(this.chatId)?.split('_');
    console.log(this.count++, 'chat box users:', users);
    if (!users) return;
    let friendUser = users[0] == this.userData?.username ? users[1] : users[0];
    console.log(this.count++, 'Friendslist before toggling:', this.friendsList);
    this.friendService.toggleFriend(friendUser);
  }
}
