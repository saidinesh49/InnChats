import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject, debounceTime } from 'rxjs';
import { friend } from 'src/app/Interfaces/friend.interface';
import { Trie } from 'src/app/Interfaces/search.interface';
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

  suggestionList: friend[] = [];
  showPopup = false;

  trie = new Trie();

  @Output() addFriendEmiiter = new EventEmitter<void>();

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private hashService: HashService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {
    this.friendService.getFriendsListFromServer().subscribe({
      next: (data) => {
        console.log('Friends list request data is:', data?.data);
        this.friendService.setFriendsList(data?.data?.friends);
      },
      error: (error) => {
        console.log('Error while fetching friendsList:', error);
      },
    });
  }

  ngOnInit() {
    this.friendService.friendsList.subscribe((data) => {
      this.friendsList = data || [];
      console.log('Friendlist at leftside bar is:', data);
      this.trie.clearAll();
      this.friendsList.forEach((friend) => this.trie.insert(friend));
      this.suggestionList = [...this.friendsList]; // default to all friends
    });

    this.authService.userData.subscribe((userData) => {
      this.userData = userData;
      console.log('userdata at leftbar is:', userData);
    });
  }

  onSearchTermChange() {
    const term = this.term.trim().toLowerCase();

    if (!term) {
      this.suggestionList = this.friendsList;
      return;
    }
    this.suggestionList = this.trie.search(term);
  }

  toggleFriend(username: string) {
    // this.friendService.toggleFriend(username);
    // this.friendService.selectedUser.subscribe((user) => {
    //   console.log(user);
    //   this.selectedUser = user;
    // });
    let chatId = this.hashService.encryptData([
      this.authService.userData?.value?.username,
      username,
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
