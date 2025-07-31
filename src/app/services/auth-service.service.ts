import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { User } from '../Interfaces/user.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = 'http://localhost:8000';
  private userData = new BehaviorSubject<User>({
    username: '',
    fullName: '',
    profilePic: '',
  });

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {}

  private clearUserData(): void {}

  loginUser(data: { username: string; password: string }): void {
    console.log('passed data at service for login', data);
    this.http
      .post(`${this.apiUrl}/auth/login`, {
        username: data?.username || '',
        password: data?.password || '',
      })
      .subscribe({
        next: (data: any) => {
          console.log('received data from backend', data);
        },
        error: (error) => {
          console.log('Error:', error);
        },
      });
  }

  logoutUser(): void {
    this.clearUserData();
  }

  signup(data: {
    username: string;
    password: string;
    fullName: string;
    profilePic: string;
  }): void {
    console.log('passed data at service for signup', data);
    this.http
      .post(`${this.apiUrl}/auth/signup`, {
        ...data,
      })
      .subscribe({
        next: (data: any) => {
          console.log('received data from backend:', data);
        },
        error: (error) => {
          console.log('Error:', error);
        },
      });
  }

  isUserLoggedIn(): boolean {
    return !!this.userData?.value?.username;
  }

  public getCurrentUser$ = this.userData.asObservable();
}
