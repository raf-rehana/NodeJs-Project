import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PaymentService, Payment } from '../../core/services/payment.service';

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './revenue.html',
  styleUrl: './revenue.css',
})
export class Revenue implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  public months = signal<{ name: string, val: number }[]>([]);
  public transactions = signal<Payment[]>([]);

  public totalRevenue = signal(0);
  public subscriptionRevenue = signal(0);
  public serviceRevenue = signal(0);
  public projectedRevenue = signal(0);

  private subscriptionKeywords = ['plan', 'subscription', 'foundation', 'accelerator', 'launchpad'];

  ngOnInit() {
    this.paymentService.getPayments().subscribe(data => {
      this.transactions.set(
        data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      );

      const paid = data.filter(p => p.status === 'PAID');
      
      this.totalRevenue.set(paid.reduce((sum, p) => sum + p.amount, 0));
      
      this.subscriptionRevenue.set(paid
        .filter(p => this.subscriptionKeywords.some(k => p.item?.toLowerCase().includes(k)))
        .reduce((sum, p) => sum + p.amount, 0));

      this.serviceRevenue.set(paid
        .filter(p => !this.subscriptionKeywords.some(k => p.item?.toLowerCase().includes(k)))
        .reduce((sum, p) => sum + p.amount, 0));

      const pending = data.filter(p => p.status === 'PENDING');
      const pendingTotal = pending.reduce((sum, p) => sum + p.amount, 0);
      this.projectedRevenue.set(this.totalRevenue() + pendingTotal * 0.2);

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTotals = new Array(12).fill(0);
      
      paid.forEach(p => {
        const date = new Date(p.date);
        monthlyTotals[date.getMonth()] += p.amount;
      });

      const currentMonth = new Date().getMonth();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        if (m < 0) m += 12;
        last6Months.push(m);
      }

      const maxRev = Math.max(...last6Months.map(m => monthlyTotals[m]), 1);

      this.months.set(last6Months.map(m => ({
        name: monthNames[m],
        val: (monthlyTotals[m] / maxRev) * 100
      })));
    });
  }

  viewFullReport() {
    this.router.navigate(['/admin/revenue-report']);
  }
}
