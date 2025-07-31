import { CanActivateFn, Router } from '@angular/router';
import { User } from '../Interfaces/user.interface';
import { AuthService } from '../services/auth-service.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser$.pipe(
    take(1),
    map((user: User) => {
      const isAuthenticated = !!user?.username;
      if (!isAuthenticated) {
        router.navigate(['/auth/login']);
        return false;
      }
      return true;
    })
  );
};
