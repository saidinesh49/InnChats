import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { friend } from '../Interfaces/friend.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private apiUrl: string = 'https://innchats.onrender.com'; //changes needed
  friendsList = new BehaviorSubject<friend[] | null>(null);
  selectedUser = new BehaviorSubject<friend | null>(null);
  lastFetchedFriendId: string | null = null;
  fetchedFriendCount = 0;
  friendsLimit = 3;
  allFriendsFetched = false;
  loadingFriends = false;

  dummyData: friend[] | any = [
    {
      username: 'sunny_side',
      fullName: 'Ravi Kumar',
      profilePic: 'https://i.pravatar.cc/150?u=ravi',
      lastMessage: 'See you at 6!',
    },
    {
      username: 'moonlight_jane',
      fullName: 'Janet Fernandes',
      profilePic: 'https://i.pravatar.cc/150?u=jane',
      lastMessage: 'What’s the plan for Friday?',
    },
    {
      username: 'coder_nerd',
      fullName: 'Amit Patel',
      profilePic: 'https://i.pravatar.cc/150?u=amit',
      lastMessage: 'You got the latest patch notes?',
    },
    {
      username: 'wanderlust_mia',
      fullName: 'Mia Agarwal',
      profilePic: 'https://i.pravatar.cc/150?u=mia',
      lastMessage: 'Back from Bali 💖',
    },
    {
      username: 'chess_master',
      fullName: 'Vinay Gupta',
      profilePic: 'https://i.pravatar.cc/150?u=vinay',
      lastMessage: 'Checkmate again!',
    },
    {
      username: 'pixel_panda',
      fullName: 'Neha Sharma',
      profilePic: 'https://i.pravatar.cc/150?u=neha',
      lastMessage: 'Designs are ready!',
    },
    {
      username: 'data_dreamer',
      fullName: 'Siddharth Rao',
      profilePic: 'https://i.pravatar.cc/150?u=sid',
      lastMessage: 'Analytics look promising.',
    },
    {
      username: 'travel_bug',
      fullName: 'Ananya Joshi',
      profilePic: 'https://i.pravatar.cc/150?u=ananya',
      lastMessage: 'Let’s plan the next trip!',
    },
    {
      username: 'code_crusader',
      fullName: 'Karan Mehta',
      profilePic: 'https://i.pravatar.cc/150?u=karan',
      lastMessage: 'Refactored the module.',
    },
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  toggleFriend(friendId: string) {
    let matched = this.friendsList.value?.find((f) => f._id == friendId);
    console.log('changing selected user', matched);
    if (matched) {
      this.selectedUser.next(matched);
    }
  }

  setFriendsList(friends: friend[], append: boolean = false) {
    const existing = this.friendsList.value || [];

    const newFriends = friends.filter(
      (f) => !existing.some((e) => e._id === f._id)
    );

    const updated = append ? [...existing, ...newFriends] : newFriends;
    this.friendsList.next(updated);

    if (updated.length > 0) {
      this.lastFetchedFriendId = updated[updated.length - 1]._id;
    }

    if (friends.length < this.friendsLimit) {
      this.allFriendsFetched = true;
    }
  }

  getFriendsListFromServer(
    beforeFriendId: string | null,
    limit: number,
    bringAll: boolean = false
  ) {
    const accessToken = this.authService.getCookie('accessToken');
    console.log('Estimated limit is:', limit);
    const params: any = {
      limit,
      bringAll,
    };
    if (beforeFriendId) {
      params.beforeFriendId = beforeFriendId;
    }

    return this.http
      .get<{ data: any }>(`${this.apiUrl}/friendsList/friends-list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      })
      .pipe(
        tap((data: any) => {
          console.log(
            'Fetched friendsList from server is:',
            data?.data?.friends
          );
        })
      );
  }

  addToFriendsList(newFriendId: string) {
    const accessToken = this.authService.getCookie('accessToken');
    console.log('making friend with', newFriendId);
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/friendsList/friends-list`,
      {
        newFriendId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  getNonFriendsList() {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.get(`${this.apiUrl}/friendsList/get-all-non-friends`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  getSentRequests() {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.get(`${this.apiUrl}/friendsList/requests/sent`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  getReceivedRequests() {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.get(`${this.apiUrl}/friendsList/requests/recieved`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  getAllUserRelatedRequests() {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.get(`${this.apiUrl}/friendsList/requests`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  refreshFriendsListIfNeeded() {
    if (!this.allFriendsFetched) {
      console.log('Friends list is not fully fetched. Skipping refresh.');
      return;
    }

    const accessToken = this.authService.getCookie('accessToken');
    const params: any = {
      limit: this.friendsLimit,
      beforeFriendId: this.lastFetchedFriendId,
      bringAll: false,
    };

    this.http
      .get<{ data: any }>(`${this.apiUrl}/friendsList/friends-list`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      })
      .subscribe({
        next: (res) => {
          const newFriends = res?.data?.friends || [];
          if (newFriends.length > 0) {
            this.setFriendsList(newFriends, true);
            console.log('Appended new friends to list.');
          } else {
            console.log('No new friends to append.');
          }
        },
        error: (err) => {
          console.error('Error refreshing friends list:', err);
        },
      });
  }

  acceptUserReceivedRequest(friendId: string) {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http
      .post(
        `${this.apiUrl}/friendsList/requests`,
        { friendId },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      .pipe(
        tap(() => {
          this.refreshFriendsListIfNeeded();
        })
      );
  }
}
