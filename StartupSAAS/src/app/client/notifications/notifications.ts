import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../../core/models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  public readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  public notifications = signal<Notification[]>([]);
  public isLoading = signal<boolean>(true);
  public filter = signal<'all' | 'unread'>('all');

  public filteredNotifications = computed(() => {
    const list = this.notifications();
    return this.filter() === 'unread' ? list.filter(n => !n.isRead) : list;
  });

  public unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.notificationService.getAll(user.id).subscribe({
        next: (data) => {
          this.notifications.set(
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  markRead(notification: Notification) {
    if (notification.isRead) return;
    this.notificationService.markRead(notification.id).subscribe(() => {
      this.notifications.update(list => list.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      
      const remaining = this.notifications().filter(n => !n.isRead).length;
      (this.notificationService as any)['unreadCount'].next(remaining);
    });
  }

  markAllRead() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.notificationService.markAllRead(user.id).subscribe(() => {
      this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    });
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      STATUS_UPDATE: 'bi-arrow-repeat',
      PAYMENT_DUE: 'bi-credit-card',
      DOCUMENT_NEEDED: 'bi-file-earmark-text',
      INFO: 'bi-info-circle',
      TASK_ASSIGNED: 'bi-person-check'
    };
    return icons[type] || 'bi-bell';
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      STATUS_UPDATE: 'text-primary bg-primary bg-opacity-10 border-primary-subtle',
      PAYMENT_DUE: 'text-danger bg-danger bg-opacity-10 border-danger-subtle',
      DOCUMENT_NEEDED: 'text-warning bg-warning bg-opacity-10 border-warning-subtle',
      INFO: 'text-dark bg-secondary bg-opacity-10 border-secondary-subtle',
      TASK_ASSIGNED: 'text-success bg-success bg-opacity-10 border-success-subtle'
    };
    return colors[type] || 'text-dark bg-secondary bg-opacity-10 border-secondary-subtle';
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }
}
