import { Component, OnInit } from '@angular/core';
import { friend } from 'src/app/Interfaces/friend.interface';
import { FriendService } from 'src/app/services/friend-service.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css'],
})
export class ChatsComponent implements OnInit {
  selectedUser!: friend | null;
  constructor(private friendService: FriendService) {}

  ngOnInit() {
    this.friendService.selectedUser.subscribe((user) => {
      this.selectedUser = user;
    });
  }
}
