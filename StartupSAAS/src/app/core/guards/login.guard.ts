import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) return true;

  const role = auth.currentUser()?.role;
  const router = inject(Router);
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return router.createUrlTree(['/admin/dashboard']);
  if (role === 'EMPLOYEE') return router.createUrlTree(['/employee/summary']);
  return router.createUrlTree(['/client/dashboard']);
};
