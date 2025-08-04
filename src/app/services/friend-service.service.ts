import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { friend } from '../Interfaces/friend.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private apiUrl: string = 'http://localhost:8000';
  friendsList = new BehaviorSubject<friend[] | null>(null);
  selectedUser = new BehaviorSubject<friend | null>(null);

  dummyData: friend[] = [
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

  constructor(private http: HttpClient, private authService: AuthService) {
    // this.getFriendsListFromServer().subscribe({
    //   next: (data) => {
    //     console.log('Friends list requrest data is:', data?.data);
    //     // const filteredFriendsListData = data?.data?.friends?.map();
    //   },
    //   error: (error) => {
    //     console.log('Error while fetching friendsList:', error);
    //   },
    // });
  }

  toggleFriend(username: string) {
    let matched = this.friendsList.value?.find((f) => f.username == username);
    if (matched) {
      this.selectedUser.next(matched);
    }
  }

  setFriendsList(friends: friend[] | any) {
    this.friendsList.next(friends);
  }

  getFriendsListFromServer() {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.get<{ data: any }>(
      `${this.apiUrl}/friendsList/friends-list`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }
}
