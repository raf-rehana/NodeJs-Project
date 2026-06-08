import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, Payment } from '../../core/services/payment.service';

@Component({
  selector: 'app-revenue-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue-report.component.html'
})
export class RevenueReportComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  public allPayments = signal<Payment[]>([]);
  public today = new Date();
  
  public searchTerm = signal('');
  public filterStatus = signal('');
  public filterMethod = signal('');
  public fromDate = signal('');
  public toDate = signal('');

  public paymentMethods = signal<string[]>([]);

  // Computed filtered list
  public filteredPayments = computed(() => {
    return this.allPayments().filter(p => {
      const st = this.searchTerm().toLowerCase();
      const matchSearch = !st || p.client?.toLowerCase().includes(st) || p.item?.toLowerCase().includes(st);
      const matchStatus = !this.filterStatus() || p.status === this.filterStatus();
      const matchMethod = !this.filterMethod() || p.method === this.filterMethod();
      const matchFrom = !this.fromDate() || new Date(p.date) >= new Date(this.fromDate());
      const matchTo = !this.toDate() || new Date(p.date) <= new Date(this.toDate());
      return matchSearch && matchStatus && matchMethod && matchFrom && matchTo;
    });
  });

  // Computed stats
  public stats = computed(() => {
    const data = this.allPayments();
    const paid = data.filter(p => p.status === 'PAID');
    const pending = data.filter(p => p.status === 'PENDING');
    
    return {
      totalRevenue: paid.reduce((s, p) => s + p.amount, 0),
      pendingRevenue: pending.reduce((s, p) => s + p.amount, 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      avgTransaction: data.length ? data.reduce((s, p) => s + p.amount, 0) / data.length : 0
    };
  });

  public filteredPaidTotal = computed(() => {
    return this.filteredPayments().filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  });

  ngOnInit() {
    this.paymentService.getPayments().subscribe(data => {
      const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.allPayments.set(sorted);
      this.paymentMethods.set([...new Set(data.map(p => p.method).filter(Boolean))]);
    });
  }

  clearFilters() {
    this.searchTerm.set('');
    this.filterStatus.set('');
    this.filterMethod.set('');
    this.fromDate.set('');
    this.toDate.set('');
  }

  goBack() {
    this.router.navigate(['/admin/revenue']);
  }

  printReport() {
    window.print();
  }
}
