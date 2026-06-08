import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceCatalogueService } from '../../../core/services/service-catalogue';
import { ServiceCategory } from '../../../core/models/service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly catalogueSvc = inject(ServiceCatalogueService);

  public categories = signal<ServiceCategory[]>([]);

  private readonly navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  public readonly isClientContext = computed(() => {
    this.navEnd();
    const url = this.router.url;
    if (url.includes('/client/profile')) return this.authService.hasRole('CLIENT');
    return url.startsWith('/client');
  });

  public readonly isCatalogueContext = computed(() => {
    this.navEnd();
    return this.router.url.startsWith('/service');
  });

  public readonly isAdminContext = computed(() => {
    this.navEnd();
    const url = this.router.url;
    if (url.includes('/client/profile')) {
      return this.authService.hasRole('ADMIN') || this.authService.hasRole('SUPER_ADMIN');
    }
    return url.startsWith('/admin');
  });

  public readonly isEmployeeContext = computed(() => {
    this.navEnd();
    const url = this.router.url;
    if (url.includes('/client/profile')) return this.authService.hasRole('EMPLOYEE');
    return url.startsWith('/employee');
  });

  public readonly isGenericContext = computed(() =>
    !this.isClientContext() && !this.isAdminContext() &&
    !this.isEmployeeContext() && !this.isCatalogueContext()
  );

  ngOnInit(): void {
    this.catalogueSvc.getCategories().subscribe(data => this.categories.set(data));
  }
}
