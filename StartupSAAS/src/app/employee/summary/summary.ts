import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest } from '../../core/models/service-request';
import { RouterModule } from '@angular/router';
import { interval, Subscription, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class SummaryComponent implements OnInit, OnDestroy {
  myTasks = signal<ServiceRequest[]>([]);
  
  activeCount = computed(() => this.myTasks().filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length);
  completedCount = computed(() => this.myTasks().filter(t => t.status === 'COMPLETED').length);
  reviewCount = computed(() => this.myTasks().filter(t => t.status === 'REVIEW').length);
  
  completionRate = computed(() => {
    const total = this.myTasks().length;
    return total > 0 ? Math.round((this.completedCount() / total) * 100) : 0;
  });

  totalHoursLogged = computed(() => {
    return parseFloat(this.myTasks().reduce((sum, t) => sum + (t.workedHours || 0), 0).toFixed(1));
  });

  completedTasks = computed(() => this.myTasks().filter(t => t.status === 'COMPLETED' && t.completedAt && t.createdAt));

  avgResolutionDays = computed(() => {
    const tasks = this.completedTasks();
    if (tasks.length === 0) return 0;
    const totalDays = tasks.reduce((sum, t) => sum + ((new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 86400000), 0);
    return parseFloat((totalDays / tasks.length).toFixed(1));
  });

  thisMonthCompleted = computed(() => {
    const now = new Date();
    return this.completedTasks().filter(t => {
      const d = new Date(t.completedAt!);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  });

  lastMonthCompleted = computed(() => {
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.completedTasks().filter(t => {
      const d = new Date(t.completedAt!);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    }).length;
  });

  private pollSubscription?: Subscription;

  constructor(
    private requestService: RequestService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.pollSubscription = interval(10000).pipe(
        startWith(0),
        switchMap(() => this.requestService.getAll())
      ).subscribe(data => {
        this.myTasks.set(data.filter(t => String(t.assignedTo) === String(user.id) || !t.assignedTo));
      });
    }
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }
}
