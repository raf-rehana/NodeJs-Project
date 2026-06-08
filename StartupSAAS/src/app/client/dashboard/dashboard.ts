import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest } from '../../core/models/service-request';
import { PaymentService } from '../../core/services/payment.service';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { RouterModule } from '@angular/router';
import { interval, Subscription, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit, OnDestroy {
  requests = signal<ServiceRequest[]>([]);
  activeSubscription = signal<any>(null);
  pendingInvoice = signal<any>(null);
  amountSpent = signal<number>(0);

  activeProjectsCount = computed(() => {
    return this.requests().filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  });

  upcomingDeliveriesCount = computed(() => {
    return this.requests().filter(r => r.status === 'REVIEW' || r.status === 'IN_PROGRESS').length;
  });

  avgProgress = computed(() => {
    const active = this.requests().filter(r => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED');
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, r) => acc + (r.progress || 0), 0);
    return Math.round(sum / active.length);
  });

  recentRequests = computed(() => {
    return [...this.requests()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  });

  private pollSubscription?: Subscription;
  
  constructor(
    private requestService: RequestService,
    public authService: AuthService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.pollSubscription = interval(5000).pipe(
        startWith(0),
        switchMap(() => this.requestService.getAll())
      ).subscribe(data => {
        this.requests.set(data.filter(r => String(r.userId) === String(user.id)));
        this.paymentService.getPayments().subscribe(payments => {
          this.updatePaymentStats(payments, user.id);
        });
      });
    }
  }

  private updatePaymentStats(payments: any[], userId: string | number) {
    const userPayments = payments.filter(p => String(p.clientId) === String(userId));
    
    const paidPayments = userPayments
      .filter(p => p.status === 'PAID')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    this.activeSubscription.set(paidPayments.length > 0 ? paidPayments[0] : null);
    this.amountSpent.set(paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0));

    const pendingPayments = userPayments
      .filter(p => p.status === 'PENDING' && p.method !== 'CASH')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
    this.pendingInvoice.set(pendingPayments.length > 0 ? pendingPayments[0] : null);
  }

  ngOnDestroy() {
    this.pollSubscription?.unsubscribe();
  }
}
