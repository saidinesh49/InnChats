import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { friend } from 'src/app/Interfaces/friend.interface';
import { AuthService } from 'src/app/services/auth-service.service';
import { FriendService } from 'src/app/services/friend-service.service';
@Component({
  selector: 'app-right-side-bar',
  templateUrl: './right-side-bar.component.html',
  styleUrls: ['./right-side-bar.component.css'],
})
export class RightSideBarComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly apiUrl: string = 'https://innchats.onrender.com';
  userData?: friend | null;
  isEditing = false;
  selectedFile?: File;

  constructor(
    private authService: AuthService,
    private friendService: FriendService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.authService.userData.subscribe((data) => {
      this.userData = data;
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  handleFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }
  updateProfile() {
    if (!this.userData) return;

    const updatePayload = {
      newUsername: this.userData.username,
      newFullName: this.userData.fullName,
    };

    const accessToken = this.authService.getCookie('accessToken');

    this.http
      .post<any>(
        `${this.apiUrl}/auth/edit-details`,
        { ...updatePayload },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .subscribe({
        next: (res) => {
          console.log('Profile updated:', res);
          this.isEditing = false;
          this.authService.setCurrentUser(res.data);
        },
        error: (err) => {
          console.error('Error updating profile:', err);
        },
      });
  }

  updateProfilePic(file: File | null | undefined) {
    if (!file) return;
    const accessToken = this.authService.getCookie('accessToken');

    this.authService.getUploadUrl(file.name, file.type).subscribe({
      next: (res) => {
        const uploadUrl = res.data.uploadUrl;
        const fileUrl = res.data.fileUrl;

        fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })
          .then((response) => {
            if (!response.ok) throw new Error('S3 upload failed');

            // Now update profilePic url on backend
            this.http
              .post(
                `${this.apiUrl}/auth/update-profile-pic`,
                { newProfilePicUrl: fileUrl },
                { headers: { Authorization: `Bearer ${accessToken}` } }
              )
              .subscribe({
                next: (updateRes) => {
                  console.log('Profile pic updated:', updateRes);
                  if (this.userData) {
                    this.authService.setCurrentUser({
                      ...this.userData,
                      profilePic: fileUrl,
                    });
                  }
                },
                error: (err) => console.error('Update profile pic failed', err),
              });
          })
          .catch((uploadErr) => {
            console.error('S3 upload error', uploadErr);
          });
      },
      error: (err) => {
        console.error('Get upload URL error', err);
      },
    });
  }

  handleLogout() {
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        const userData = res?.data;
        if (userData?.username) {
          this.authService.logoutUser();
          this.friendService.setFriendsList([]);
        }
        this.router.navigate(['auth/login']);
      },
      error: (error) => {
        console.log('Error while user logout:', error);
      },
    });
  }
}
