import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';
import { User } from '../../../Interfaces/user.interface';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm = new FormGroup({
    usernameOrEmail: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  constructor(private authService: AuthService, private router: Router) {}

  googleLogin() {
    this.authService.signInWithGoogle();
  }

  getLoginPayLoad(): any {
    return {
      usernameOrEmail: this.loginForm.get('usernameOrEmail')?.value || '',
      password: this.loginForm.get('password')?.value || '',
    };
  }

  handleLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const payload = this.getLoginPayLoad();
    this.authService.loginUser(payload).subscribe({
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
