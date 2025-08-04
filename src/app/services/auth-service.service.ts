import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  Observer,
  of,
  Subject,
  tap,
} from 'rxjs';
import { User } from '../Interfaces/user.interface';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = 'http://localhost:8000';
  userData = new BehaviorSubject<User>({
    _id: '',
    username: '',
    fullName: '',
    profilePic: '',
  });

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {}

  loginUser(data: { username: string; password: string }) {
    console.log('passed data at service for login', data);
    return this.http
      .post<{ data: User }>(`${this.apiUrl}/auth/login`, {
        ...data,
      })
      .pipe(
        tap((data: any) => {
          console.log('recieved data from backend on login:', data);
          this.setCookie('accessToken', data?.data?.accessToken, {
            maxAge: 60 * 60 * 24,
          });
        })
      );
  }

  setCookie(name: string, value: string, options: any): void {
    let cookieString = `${name}=${value}; path=/`;
    if (options?.secure) {
      cookieString += '; secure';
    }
    cookieString += `; sameSite=${options.sameSite || 'Strict'}`;
    if (options?.maxAge) {
      cookieString += `; max-age=${options.maxAge}`;
    }
    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
    document.cookie = cookieString;
  }

  // Helper to get cookies
  getCookie(name: string): string | null {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((c) => c.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  }

  logoutUser(): void {
    this.setCookie('accessToken', '', { maxAge: 0 });
    this.userData.next({
      _id: '',
      username: '',
      fullName: '',
      profilePic: '',
    });
  }

  signup(data: {
    username: string;
    password: string;
    fullName: string;
    profilePic: string;
  }) {
    console.log('passed data at service for signup', data);
    return this.http
      .post<{ data: User }>(`${this.apiUrl}/auth/signup`, {
        ...data,
      })
      .pipe(
        tap((data: any) => {
          console.log('received data from backend:', data);
          this.setCookie('accessToken', data?.data?.accessToken, {
            maxAge: 60 * 60 * 24,
          });
        })
      );
    // .subscribe({
    //   next: (data: any) => {
    //     console.log('received data from backend:', data);
    //     this.setCookie('accessToken', data?.data?.accessToken, {
    //       maxAge: 60 * 60 * 24,
    //     });
    //     this.userData.next({
    //       _id: data?.data?._id,
    //       username: data.data?.username,
    //       fullName: data.data?.fullName,
    //       profilePic: data.data?.profilePic,
    //     });
    //     console.log('after setting value', this.userData.value);
    //   },
    //   error: (error) => {
    //     console.log('Error:', error);
    //   },
    // });
  }

  getCurrentUser() {
    const accessToken = this.getCookie('accessToken');
    return this.http.post<{ data: User }>(`${this.apiUrl}/auth/current-user`, {
      accessToken,
    });
  }

  setCurrentUser(data: any) {
    this.userData.next({
      _id: data?._id,
      username: data?.username,
      fullName: data?.fullName,
      profilePic: data?.profilePic,
    });
  }
}
