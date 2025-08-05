import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, debounceTime } from 'rxjs';
import { friend } from 'src/app/Interfaces/friend.interface';
import { Trie } from 'src/app/Interfaces/search.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';

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

  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private friendService: FriendService
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
      this.trie.clearAll();
      this.friendsList.forEach((friend) => this.trie.insert(friend));
      this.suggestionList = [...this.friendsList]; // default to all friends
    });

    this.authService.userData.subscribe((userData) => {
      this.userData = userData;
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
    this.friendService.toggleFriend(username);
    this.friendService.selectedUser.subscribe((user) => {
      console.log(user);
      this.selectedUser = user;
    });
  }
}
