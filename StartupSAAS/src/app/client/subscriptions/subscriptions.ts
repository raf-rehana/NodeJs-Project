import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.css'
})
export class SubscriptionsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);
  public readonly authService = inject(AuthService);

  public plans = signal<any[]>([]);
  public activePlan = signal<any | null>(null);
  public viewMode = signal<'ACTIVE' | 'UPGRADE'>('ACTIVE');
  public loading = signal<boolean>(true);

  ngOnInit() {
    this.paymentService.getSubscriptions().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.loadUserSubscription();
      },
      error: () => {
        this.plans.set([
          {
            id: 1,
            name: 'Digital Foundation',
            price: 59000,
            features: ['Professional Website', 'Domain (1 Year)', 'Business Email', 'Basic SEO'],
            recommended: false
          },
          {
            id: '2',
            name: 'Growth Accelerator',
            price: 160000,
            features: ['E-Commerce Platform', 'Marketing (3 Months)', 'Social Media Mgmt', '24/7 Support'],
            recommended: true
          },
          {
            id: '3',
            name: 'A-to-Z Launchpad',
            price: 360000,
            features: ['Business Formation', 'Trade License', 'Web & Mobile App', 'Launch Manager'],
            recommended: false
          }
        ]);
        this.loadUserSubscription();
      }
    });
  }

  loadUserSubscription() {
    const user = this.authService.currentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }
    
    this.paymentService.getPayments().subscribe({
      next: (payments) => {
        const userPayments = payments
          .filter(p => p.clientId === user.id && (p.status === 'PAID' || p.status === 'PENDING'))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
        if (userPayments.length > 0) {
          const item = userPayments[0].item;
          const found = this.plans().find(p => p.name === item);
          this.activePlan.set(found || {
            name: item,
            price: userPayments[0].amount,
            features: ['Standard Support', 'Priority Queue']
          });
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  subscribe(plan: any) {
    this.router.navigate(['/client/payments'], { queryParams: { planId: plan.id } });
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }
}
