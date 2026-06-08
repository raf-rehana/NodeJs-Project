import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { loginGuard } from '../core/guards/login.guard';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [loginGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
