import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { friend } from '../Interfaces/friend.interface';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  friendsList!: BehaviorSubject<friend[]>;
  selectedUser!: BehaviorSubject<friend | null>;

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

  constructor() {
    this.friendsList = new BehaviorSubject<friend[]>(this.dummyData);
    this.selectedUser = new BehaviorSubject<friend | null>(null);
  }

  toggleFriend(username: string) {
    let matched = this.friendsList.value.find((f) => f.username == username);
    if (matched) {
      this.selectedUser.next(matched);
    }
  }
}
