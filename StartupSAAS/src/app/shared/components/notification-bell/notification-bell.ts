import { Component, inject, computed, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClass } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterModule, NgClass],
  templateUrl: './notification-bell.html',
  styleUrls: ['./notification-bell.css'],
})
export class NotificationBellComponent implements OnInit {
  @Input() iconClass = '';

  private readonly notifSvc = inject(NotificationService);
  private readonly authSvc  = inject(AuthService);

  protected readonly unreadCount = this.notifSvc.unreadCount;

  protected readonly viewAllLink = computed(() => {
    const role = this.authSvc.currentUser()?.role;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/admin/notifications';
    if (role === 'EMPLOYEE') return '/employee/notifications';
    return '/client/notifications';
  });

  ngOnInit(): void {
    const user = this.authSvc.currentUser();
    if (user) this.notifSvc.getAll(user.id).subscribe();
  }
}
