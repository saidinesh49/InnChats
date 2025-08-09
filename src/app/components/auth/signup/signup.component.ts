import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth-service.service';
import { matchPasswordValidator } from 'src/app/utils/services/matchPasswords';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  uploading = false;
  previewUrl: string | ArrayBuffer | null | any = null;
  selectedFile: File | null = null;

  signupForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      fullName: new FormControl('', [Validators.required]),
      profilePic: new FormControl('', [Validators.required]),
    },
    { validators: matchPasswordValidator }
  );

  constructor(private authService: AuthService, private router: Router) {}

  getSignupPayload(): any {
    return {
      username: this.signupForm.get('username')?.value || '',
      password: this.signupForm.get('password')?.value || '',
      fullName: this.signupForm.get('fullName')?.value || '',
      profilePic: this.signupForm.get('profilePic')?.value || '',
    };
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile = file;

    // Show preview immediately (no upload yet)
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result;
      // Temporarily set preview URL in form control for preview img src
      this.signupForm.patchValue({ profilePic: this.previewUrl });
    };
    reader.readAsDataURL(file);
  }

  handleSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.signupForm.get('profilePic')?.setErrors({ required: true });
      return;
    }

    this.uploading = true;

    this.authService
      .getUploadUrl(this.selectedFile.name, this.selectedFile.type)
      .subscribe({
        next: (data: any) => {
          const uploadUrl = data?.data?.uploadUrl;
          const fileUrl = data?.data?.fileUrl;
          console.log('received dat form backend after S3 upload:', data);

          this.signupForm.patchValue({ profilePic: fileUrl });

          const payload = this.getSignupPayload();
          this.authService.signup(payload).subscribe({
            next: (res: any) => {
              this.uploading = false;
              const userData = {
                _id: res?.data?._id,
                username: res.data?.username,
                fullName: res.data?.fullName,
                profilePic: res.data?.profilePic,
              };
              this.authService.setCurrentUser(userData);
              this.router.navigate(['/home']);
            },
            error: (err) => {
              console.error('Signup error', err);
              this.uploading = false;
            },
          });
        },
        error: (err) => {
          console.error('Get upload URL error', err);
          this.uploading = false;
        },
      });
  }
}
