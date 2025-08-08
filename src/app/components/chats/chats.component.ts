import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { friend } from 'src/app/Interfaces/friend.interface';
import { Message } from 'src/app/Interfaces/message.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';
import { HashService } from 'src/app/services/hash-service.service';
import { MessageService } from 'src/app/services/message-service.service';
import { WebsocketService } from 'src/app/services/websocket.service';

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

  dummyMessages: Message[] = [
    {
      roomId: 'room1',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Hey, how are you?',
    },
    {
      roomId: 'room1',
      senderId: '68905dabb465628278b70558',
      message: 'I am good, thanks! How about you?',
    },
    {
      roomId: 'room1',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Doing well. Had lunch?',
    },
    {
      roomId: 'room1',
      senderId: '68905dabb465628278b70558',
      message: 'Yes, just now. You?',
    },
    {
      roomId: 'room1',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Not yet, waiting for you 😄',
    },
    {
      roomId: 'room1',
      senderId: '68905dabb465628278b70558',
      message: 'Haha, let’s eat together next time!',
    },
    {
      roomId: 'room1',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Sure! I’d love that.',
    },
    {
      roomId: 'room2',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Are we meeting today?',
    },
    {
      roomId: 'room2',
      senderId: '68905dabb465628278b70558',
      message: 'Yes, let’s meet at 5 PM.',
    },
    {
      roomId: 'room2',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Perfect. At the usual place?',
    },
    {
      roomId: 'room2',
      senderId: '68905dabb465628278b70558',
      message: 'Yes, Cafe 92 it is.',
    },
    {
      roomId: 'room2',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Awesome, see you there!',
    },
    {
      roomId: 'room2',
      senderId: '68905dabb465628278b70558',
      message: 'Don’t be late 😜',
    },
    {
      roomId: 'room3',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Did you finish the assignment?',
    },
    {
      roomId: 'room3',
      senderId: '68905dabb465628278b70558',
      message: 'Not yet, working on it now.',
    },
    {
      roomId: 'room3',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Need any help?',
    },
    {
      roomId: 'room3',
      senderId: '68905dabb465628278b70558',
      message: 'Yeah maybe with question 5.',
    },
    {
      roomId: 'room3',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Cool, I’ll explain it in a bit.',
    },
    {
      roomId: 'room3',
      senderId: '68905dabb465628278b70558',
      message: 'Thanks! You’re the best!',
    },
    {
      roomId: 'room3',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Haha, anytime! 😊',
    },
    {
      roomId: 'room3',
      senderId: '68905dabb465628278b70558',
      message: 'Ill treat you to coffee later 😁',
    },
    {
      roomId: 'room3',
      senderId: '688c6e31c74a1c48e3bbe6d9',
      message: 'Deal!',
    },
  ];

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private hashService: HashService,
    private messageService: MessageService,
    private webSocketService: WebsocketService,
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

  showChatBox = async () => {
    let users = this.hashService.decryptData(this.chatId)?.split('(_)');
    console.log(this.count++, 'chat box users:', users);
    if (!users) return;
    let friendId = users[0] == this.userData?._id ? users[1] : users[0];
    console.log(this.count++, 'Friendslist before toggling:', this.friendsList);
    this.friendService.toggleFriend(friendId);
    this.messageService.loadMessages(this.chatId).subscribe({
      next: (data: any) => {
        console.log('Chat messages are:', data?.data?.messages);
        this.messages = data?.data?.messages;
      },
      error: (error) => {
        console.log('Error while loading chat messages:', error);
      },
    });
    this.webSocketService.listen(`client`).subscribe((data) => {
      console.log('Data from backend socket:', data);
    });
  };
}
