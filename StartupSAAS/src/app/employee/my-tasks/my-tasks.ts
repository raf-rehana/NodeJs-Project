import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest } from '../../core/models/service-request';
import { RouterModule, Router } from '@angular/router';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusBadgeComponent],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasksComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly authService = inject(AuthService);

  public tasks = signal<ServiceRequest[]>([]);
  public statusFilter = signal<string>('ALL');

  public filteredTasks = computed(() => {
    const list = this.tasks();
    const filter = this.statusFilter();
    return filter === 'ALL' ? list : list.filter(t => t.status === filter);
  });

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    const user = this.authService.currentUser();
    if (user) {
      this.requestService.getAll().subscribe(data => {
        this.tasks.set(data.filter(t => t.assignedTo === user.id));
      });
    }
  }

  filterStatus(status: string) {
    this.statusFilter.set(status);
  }

  goBack() {
    this.router.navigate(['/employee/summary']);
  }
}
