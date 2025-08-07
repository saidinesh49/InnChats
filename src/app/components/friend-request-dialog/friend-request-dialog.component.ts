import { Component, OnInit } from '@angular/core';
import { FriendService } from 'src/app/services/friend-service.service';

@Component({
  selector: 'app-friend-request-dialog',
  templateUrl: './friend-request-dialog.component.html',
  styleUrls: ['./friend-request-dialog.component.css'],
})
export class FriendRequestDialogComponent implements OnInit {
  sentRequests: any[] = [];
  receivedRequests: any[] = [];
  selectedTabIndex = 0;

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.friendService.getSentRequests().subscribe({
      next: (data: any) => {
        this.sentRequests = data?.data?.sentRequests || [];
        console.log('sent requ data is:', data);
      },
      error: (err) => console.error(err),
    });

    this.friendService.getReceivedRequests().subscribe({
      next: (data: any) => {
        this.receivedRequests = data?.data?.receivedRequests || [];
        console.log('recieved req data is:', data);
      },
      error: (err) => console.error(err),
    });
  }

  loadUpdatedFriendsList() {
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

  acceptRequest(friendId: string) {
    this.friendService.acceptUserReceivedRequest(friendId).subscribe({
      next: () => {
        this.receivedRequests = this.receivedRequests.filter(
          (r) => r._id !== friendId
        );
        this.loadUpdatedFriendsList();
      },
      error: (err) => console.error('Error accepting request', err),
    });
  }
}
