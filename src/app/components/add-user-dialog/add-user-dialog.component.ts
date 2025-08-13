import { Component, Inject, OnInit } from '@angular/core';
import { FriendService } from 'src/app/services/friend-service.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Trie } from 'src/app/Interfaces/search.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-user-dialog',
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.css'],
})
export class AddUserDialogComponent implements OnInit {
  searchTermUsername: string = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];

  trie = new Trie();

  constructor(
    private friendService: FriendService,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AddUserDialogComponent>
  ) {}

  ngOnInit() {
    console.log('Received data from parent to the dialog is:', this.data);

    this.friendService.getNonFriendsList().subscribe((res: any) => {
      const users = res?.data?.nonFriends || [];
      console.log('users contains:', users);
      this.allUsers = users;
      // this.filteredUsers = users;

      this.trie.clearAll();
      users.forEach((u: any) => {
        this.trie.insert(u);
      });
    });
  }

  onSearchTermChange() {
    const q = this.searchTermUsername.trim().toLowerCase();
    if (!q) {
      this.filteredUsers = [];
    } else {
      this.filteredUsers = this.trie.search(q);
    }
  }

  addFriend(userId: string) {
    this.friendService.addToFriendsList(userId).subscribe((data) => {
      console.log('Data after adding new friend:', data?.data);
      this.friendService.refreshFriendsListIfNeeded();
      this.filteredUsers = this.filteredUsers.filter((u) => u._id !== userId);
      this.allUsers = this.allUsers.filter((u) => u._id !== userId);
      this.trie.clearAll();
      this.allUsers.forEach((u: any) => this.trie.insert(u));
    });
  }

  clearSearch() {
    this.searchTermUsername = '';
    this.filteredUsers = [...this.allUsers];
  }

  closeDialog() {
    this.dialogRef.close({
      message: 'dialog is closed, this is from dialog box',
    });
  }
}
