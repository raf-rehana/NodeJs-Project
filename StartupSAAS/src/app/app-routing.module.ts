import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ContactComponent } from './pages/contact/contact';
import { PackagesComponent } from './pages/packages/packages';
import { CatalogueComponent } from './client/catalogue/catalogue';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '',         component: HomeComponent },
  { path: 'services', component: HomeComponent },
  { path: 'about',    component: HomeComponent },
  { path: 'contact',  component: ContactComponent },
  { path: 'packages', component: PackagesComponent },
  { path: 'service', component: CatalogueComponent },
  { path: '', loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES) },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CLIENT', 'ADMIN', 'EMPLOYEE', 'SUPER_ADMIN'] },
    loadChildren: () => import('./client/client.routes').then(m => m.CLIENT_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'] },
    loadChildren: () => import('./employee/employee.routes').then(m => m.EMPLOYEE_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
