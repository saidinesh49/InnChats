import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked,
  AfterViewInit,
} from '@angular/core';
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
export class ChatsComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @ViewChild('chatMessagesContainer') chatMessagesContainer!: ElementRef;

  userData!: any;
  friendsList!: any;
  chatId!: string;
  messages: Message[] = [];
  selectedUser!: friend | null;
  inputMessage!: string | null;

  private hasSubscribedToSocket = false;
  private userScrolled = false;

  // Loading flags
  loadingOlderMessages = false;
  allMessagesLoaded = false;

  // Tracking oldest message to prevent duplicates
  oldestMessageId: string | null = null;
  messagesLimit = 15;

  private pendingLoadMessages = false; // wait for view init before loading

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
      this.resetChat();
      this.userData = data;
      this.webSocketService.register(this.userData._id);
    });
  }

  ngOnInit() {
    this.friendService.selectedUser.subscribe((user) => {
      this.selectedUser = user;
      this.resetChat();
      this.pendingLoadMessages = true;
    });

    this.friendService.friendsList.subscribe((friends) => {
      this.friendsList = friends;
      this.activatedRoute.queryParams.subscribe((params) => {
        this.chatId = params['chatId'];
        if (this.chatId) {
          this.showChatBox();
        }

        if (this.pendingLoadMessages && this.chatId) {
          this.loadInitialMessages();
          this.pendingLoadMessages = false;
        }
      });
    });

    if (!this.hasSubscribedToSocket) {
      this.webSocketService
        .listen(`message:${this.userData?._id}`)
        .subscribe((data: any) => {
          // Avoid duplicate push if message already exists
          if (!this.messages.find((m) => m._id === data._id)) {
            this.messages.push(data);
            this.scrollToBottomIfNotScrolled();
          }
        });
      this.hasSubscribedToSocket = true;
    }
  }

  ngAfterViewInit() {
    if (this.chatMessagesContainer) {
      this.chatMessagesContainer.nativeElement.addEventListener(
        'scroll',
        (event: any) => this.onMessagesScroll(event)
      );
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottomIfNotScrolled();
  }

  calculateMessageLimit() {
    const container = this.chatMessagesContainer?.nativeElement;
    if (!container) return;

    const containerHeight = container.clientHeight;

    // Estimate average message height (adjust as needed)
    const averageMessageHeight = 60; // in pixels

    const estimatedLimit = Math.floor(containerHeight / averageMessageHeight);
    this.messagesLimit = estimatedLimit;

    console.log('Estimated message limit:', this.messagesLimit);
  }

  resetChat() {
    this.messages = [];
    this.loadingOlderMessages = false;
    this.allMessagesLoaded = false;
    this.userScrolled = false;
    this.oldestMessageId = null;
  }

  loadInitialMessages() {
    this.loadMessages(null);
  }

  loadMessages(beforeMessageId: string | null) {
    if (this.loadingOlderMessages || this.allMessagesLoaded || !this.chatId)
      return;

    this.loadingOlderMessages = true;
    const el = this.chatMessagesContainer?.nativeElement;
    const oldScrollHeight = el?.scrollHeight || 0;

    this.messageService
      .loadMessages(this.chatId, beforeMessageId, this.messagesLimit)
      .subscribe({
        next: (res: any) => {
          const loadedMessages = res?.data?.messages || [];
          console.log(
            'loading more messages....and those are:',
            loadedMessages
          );

          if (loadedMessages.length < this.messagesLimit) {
            this.allMessagesLoaded = true;
          }

          if (beforeMessageId === null) {
            // First load
            this.messages = loadedMessages;
            setTimeout(() => {
              if (el) {
                el.scrollTop = el.scrollHeight;
                this.userScrolled = false; // reset so new messages still auto-scroll
              }
            }, 0);
          } else {
            // Prepend without duplicates
            const existingIds = new Set(this.messages.map((m) => m._id));
            const uniqueNew = loadedMessages.filter(
              (m: Message) => !existingIds.has(m._id)
            );
            this.messages = [...uniqueNew, ...this.messages];
            if (el) {
              setTimeout(() => {
                const newScrollHeight = el.scrollHeight;
                el.scrollTop = newScrollHeight - oldScrollHeight;
              }, 0);
            }
          }

          // Update oldestMessageId
          if (this.messages.length > 0) {
            this.oldestMessageId = this.messages[0]._id;
          }

          this.loadingOlderMessages = false;
          this.calculateMessageLimit();
        },
        error: (err) => {
          console.error('Error loading messages:', err);
          this.loadingOlderMessages = false;
        },
      });
  }

  onMessagesScroll(event: any) {
    const el = event.target;
    const thresholdFromTop = 5;

    this.userScrolled = el.scrollHeight - el.scrollTop - el.clientHeight > 20;

    if (
      el.scrollTop <= thresholdFromTop &&
      !this.allMessagesLoaded &&
      !this.loadingOlderMessages
    ) {
      this.loadMessages(this.oldestMessageId);
    }
  }

  scrollToBottomIfNotScrolled() {
    try {
      const el = this.chatMessagesContainer?.nativeElement;
      if (el && !this.userScrolled) {
        el.scrollTop = el.scrollHeight; // jump to bottom
      }
    } catch {}
  }

  showChatBox() {
    let users = this.hashService.decryptData(this.chatId)?.split('(_)');
    if (!users) return;

    let friendId = users[0] === this.userData?._id ? users[1] : users[0];
    this.friendService.toggleFriend(friendId);

    this.resetChat();
    this.pendingLoadMessages = true;
  }

  handleSendMessage(event: any) {
    event.preventDefault();
    if (!this.inputMessage?.trim()) return;

    this.messageService
      .storeMessage(this.chatId, this.userData._id, this.inputMessage)
      .subscribe({
        next: (data: any) => {
          this.inputMessage = '';
          if (
            !this.messages.find((m) => m._id === data?.data?.newMessage?._id)
          ) {
            this.messages.push(data?.data?.newMessage);
          }
          this.scrollToBottomIfNotScrolled();
        },
        error: (error) => {
          console.error('Error sending message:', error);
        },
      });
  }
}
