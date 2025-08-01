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
  signupForm = new FormGroup(
    {
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      fullName: new FormControl('', [Validators.required]),
      profilePic: new FormControl(''),
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

  handleSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    const payload = this.getSignupPayload();
    this.authService.signup(payload).subscribe({
      next: (data: any) => {
        const userData = {
          _id: data?.data?._id,
          username: data.data?.username,
          fullName: data.data?.fullName,
          profilePic: data.data?.profilePic,
        };
        this.authService.setCurrentUser(userData);
        console.log('after setting value', userData);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.log('Error:', error);
      },
    });
  }
}
