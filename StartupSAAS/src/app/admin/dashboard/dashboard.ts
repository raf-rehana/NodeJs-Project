import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../core/services/request.service';
import { AdminService } from '../../core/services/admin.service';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class AdminDashboard implements OnInit {
  requests = signal<ServiceRequest[]>([]);
  clientCount = signal<number>(0);
  employeeCount = signal<number>(0);
  serviceCount = signal<number>(0);
  packageCount = signal<number>(0);
  
  recentRequests = computed(() => {
    return [...this.requests()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  });

  pendingCount = computed(() => {
    return this.requests().filter(r => r.status === 'PENDING').length;
  });

  constructor(
    private requestService: RequestService,
    private adminService: AdminService,
    private catalogueService: ServiceCatalogueService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.requestService.getAll().subscribe(data => this.requests.set(data));
    this.adminService.getUsers('CLIENT').subscribe(data => this.clientCount.set(data.length));
    this.adminService.getUsers('EMPLOYEE').subscribe(data => this.employeeCount.set(data.length));
    this.catalogueService.getServices().subscribe(data => this.serviceCount.set(data.length));
    this.catalogueService.getPackages().subscribe(data => this.packageCount.set(data.length));
  }
}
