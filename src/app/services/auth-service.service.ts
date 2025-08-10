import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from '../Interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { FriendService } from './friend-service.service';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string = 'https://innchats.onrender.com'; //changes needed
  userData = new BehaviorSubject<User>({
    _id: '',
    username: '',
    fullName: '',
    profilePic: '',
  });
  private provider!: any;
  private auth!: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
    this.provider = new GoogleAuthProvider();
    this.auth = getAuth();
  }

  private loadUserFromStorage(): void {}

  signInWithGoogle() {
    signInWithPopup(this.auth, this.provider)
      .then((data) => {
        const tokenResponse: any = (data as any)?._tokenResponse;
        console.log('Data received after Google login is:', tokenResponse);
        this.http
          .post<{ data: any }>(`${this.apiUrl}/auth/google-login`, {
            firstName: tokenResponse?.firstName,
            fullName: tokenResponse?.fullName,
            email: tokenResponse?.email,
            profilePic: tokenResponse?.photoUrl,
          })
          .subscribe({
            next: (data: any) => {
              console.log('Data after google backend login:', data);
              this.setCookie('accessToken', data?.data?.accessToken, {});
              this.setCurrentUser(data?.data);
              this.router.navigate(['/home']);
            },
            error: (error) => {
              console.log(
                'Error occured while google login at backend:',
                error
              );
            },
          });
      })
      .catch((error) => {
        console.log('Error Something went wrong while Google Sign-in:', error);
      });
  }

  loginUser(data: { usernameOrEmail: string; password: string }) {
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
    // this.friendService.friendsList.next([]);
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
  }

  editProfileDetails(data: { newUsername: string; newFullName: string }) {
    return this.http.post(`${this.apiUrl}/auth/edit-details`, {
      ...data,
    });
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

  getAllUsers() {
    return this.http.get<{}>(`${this.apiUrl}/auth/get-all-users`);
  }

  getUploadUrl(fileName: string, fileType: string) {
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/aws/generate-upload-url`,
      {
        fileName,
        fileType,
      }
    );
  }
}
