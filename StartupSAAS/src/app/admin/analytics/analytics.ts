import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { AdminService } from '../../core/services/admin.service';
import { RequestService } from '../../core/services/request.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css'
})
export class AdminAnalyticsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly adminService = inject(AdminService);
  private readonly requestService = inject(RequestService);

  public clientCount = signal(0);
  public activeClients = signal(0);
  public employeeCount = signal(0);
  public pendingRequests = signal(0);

  public mrr = signal(0);
  public arr = signal(0);
  public totalRevenue = signal(0);
  public churnRate = signal(0);

  public topClients = signal<any[]>([]);
  public statusBreakdown = signal<any[]>([]);

  ngOnInit() {
    this.paymentService.getPayments().subscribe(data => this.computePaymentMetrics(data));
    this.requestService.getAll().subscribe(data => this.computeRequestMetrics(data));
    this.adminService.getUsers('CLIENT').subscribe(data => {
      this.clientCount.set(data.length);
      this.activeClients.set(data.length);
    });
    this.adminService.getUsers('EMPLOYEE').subscribe(data => this.employeeCount.set(data.length));
  }

  private computePaymentMetrics(payments: any[]) {
    const paid = payments.filter(p => p.status === 'PAID');
    const tr = paid.reduce((sum, p) => sum + (p.amount || 0), 0);
    this.totalRevenue.set(tr);
    this.mrr.set(Math.round(tr / 12));
    this.arr.set(tr);

    const allClientIds = [...new Set(payments.map(p => p.clientId))];
    const paidClientIds = new Set(paid.map(p => p.clientId));
    const churned = allClientIds.filter(id => !paidClientIds.has(id)).length;
    this.churnRate.set(allClientIds.length > 0 ? (churned / allClientIds.length) * 100 : 0);

    const clientMap: any = {};
    paid.forEach(p => {
      if (!clientMap[p.client]) clientMap[p.client] = { client: p.client, total: 0, count: 0 };
      clientMap[p.client].total += p.amount || 0;
      clientMap[p.client].count++;
    });
    this.topClients.set(Object.values(clientMap).sort((a: any, b: any) => b.total - a.total).slice(0, 5));
  }

  private computeRequestMetrics(requests: any[]) {
    const total = requests.length || 1;
    this.pendingRequests.set(requests.filter(r => r.status === 'PENDING').length);
    
    const breakdown = [
      { label: 'Pending', count: requests.filter(r => r.status === 'PENDING').length, color: '#f59e0b', pct: 0 },
      { label: 'In Progress', count: requests.filter(r => r.status === 'IN_PROGRESS').length, color: '#6366f1', pct: 0 },
      { label: 'Review', count: requests.filter(r => r.status === 'REVIEW').length, color: '#3b82f6', pct: 0 },
      { label: 'Completed', count: requests.filter(r => r.status === 'COMPLETED').length, color: '#10b981', pct: 0 },
      { label: 'Rejected', count: requests.filter(r => r.status === 'REJECTED').length, color: '#ef4444', pct: 0 },
    ];
    breakdown.forEach(s => s.pct = Math.round((s.count / total) * 100));
    this.statusBreakdown.set(breakdown);
  }
}
