import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { friend } from 'src/app/Interfaces/friend.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';
import { HashService } from 'src/app/services/hash-service.service';
import { MatDialog } from '@angular/material/dialog';

import { FriendRequestDialogComponent } from '../friend-request-dialog/friend-request-dialog.component';

@Component({
  selector: 'app-left-side-bar',
  templateUrl: './left-side-bar.component.html',
  styleUrls: ['./left-side-bar.component.css'],
})
export class LeftSideBarComponent implements OnInit {
  userData!: any;
  friendsList: friend[] = [];
  selectedUser: friend | null = null;

  term!: string;
  suggestionList: friend[] | undefined | null = [];

  @Output() addFriendEmiiter = new EventEmitter<void>();
  @ViewChild('friendsListContainer') friendsListContainer!: ElementRef;

  private userScrolled = false;
  loadingFriends: boolean = false;
  allFriendsFetched: boolean = false;

  lastFriendId: string | null = null;
  friendsLimit: number = 15;

  private pendingLoadFriendsList = false;

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private hashService: HashService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {
    this.authService.userData.subscribe((userData) => {
      this.userData = userData;
      console.log('userdata at leftbar is:', userData);
      this.pendingLoadFriendsList = true;
    });
  }

  calculateFriendsLimit() {
    const container = this.friendsListContainer?.nativeElement;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const averageFriendItemHeight = 70;

    const estimatedLimit = Math.floor(
      containerHeight / averageFriendItemHeight
    );
    this.friendsLimit = estimatedLimit;

    console.log('Estimated friends limit:', this.friendsLimit);
  }
  onScrollFriendsList() {
    this.loadingFriends = true;

    this.friendService
      .getFriendsListFromServer(this.lastFriendId, this.friendsLimit, false)
      .subscribe({
        next: (data: any) => {
          const newFriends = data?.data?.friends || [];

          if (newFriends.length > 0) {
            this.lastFriendId = newFriends[newFriends.length - 1]._id;
          }

          if (newFriends.length < this.friendsLimit) {
            this.allFriendsFetched = true;
          }

          this.friendService.setFriendsList(newFriends, true);
          this.loadingFriends = false;
        },
        error: (err) => {
          console.error('Error fetching friends list:', err);
          this.loadingFriends = false;
        },
      });
  }

  ngOnInit() {
    this.friendService.friendsList.subscribe((data) => {
      this.friendsList = data || [];
      console.log('Friendlist at leftside bar is:', data);
      this.suggestionList = [...this.friendsList];
    });
  }

  ngAfterViewInit() {
    this.calculateFriendsLimit();

    if (this.pendingLoadFriendsList) {
      this.loadInitialFriends();
      this.pendingLoadFriendsList = false;
    }

    // if (this.friendsListContainer) {
    //   this.friendsListContainer.nativeElement.addEventListener(
    //     'scroll',
    //     (event: any) => this.onFriendsScroll(event)
    //   );
    // }
  }

  loadInitialFriends() {
    this.lastFriendId = null;
    this.allFriendsFetched = false;
    this.onScrollFriendsList();
  }

  onFriendsScroll(event: any) {
    const el = event.target;
    const thresholdFromBottom = 50;

    const reachedBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= thresholdFromBottom;

    if (reachedBottom && !this.allFriendsFetched && !this.loadingFriends) {
      this.onScrollFriendsList();
    }
  }

  onSearchTermChange = async () => {
    const term = this.term.trim().toLowerCase();

    if (!term) {
      this.suggestionList = this.friendsList;
      return;
    }
    this.suggestionList = this.friendService.friendsList?.value?.filter(
      (friend) =>
        friend?.username?.toLowerCase()?.startsWith(term) ||
        friend?.fullName?.toLowerCase()?.startsWith(term)
    );
  };

  toggleFriend(friendId: string) {
    let chatId = this.hashService.encryptData([
      this.authService.userData?.value?._id,
      friendId,
    ]);

    this.router.navigate([], {
      relativeTo: this.activatedRouter,
      queryParams: { chatId: chatId },
    });
  }

  onClickPlusIcon() {
    this.addFriendEmiiter.emit();
  }

  openRequestsDialog() {
    this.dialog.open(FriendRequestDialogComponent, {
      width: '400px',
    });
  }
}
