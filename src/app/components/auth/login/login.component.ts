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
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  constructor(private authService: AuthService, private router: Router) {}

  getLoginPayLoad(): any {
    return {
      username: this.loginForm.get('username')?.value || '',
      password: this.loginForm.get('password')?.value || '',
    };
  }

  handleLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const payload = this.getLoginPayLoad();
    this.authService.loginUser(payload);
    console.log('login completed');
  }
}
