import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const roles = route.data['roles'] as string[] | undefined;
  if (!roles || (auth.isLoggedIn() && roles.some(r => auth.hasRole(r)))) return true;
  return inject(Router).createUrlTree(['/']);
};
