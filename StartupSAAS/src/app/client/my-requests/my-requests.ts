import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { RequestTimelineComponent } from '../../shared/components/request-timeline/request-timeline';
import { ModalService } from '../../core/services/modal.service';
import { ToastService } from '../../core/services/toast.service';
import { PaymentService, Payment } from '../../core/services/payment.service';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RequestTimelineComponent],
  templateUrl: './my-requests.html',
  styleUrls: ['./my-requests.css']
})
export class MyRequestsComponent implements OnInit {
  private readonly requestService = inject(RequestService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  private readonly paymentService = inject(PaymentService);

  public requests = signal<ServiceRequest[]>([]);
  public payments = signal<Payment[]>([]);
  public selectedRequest = signal<ServiceRequest | null>(null);

  public activeRequests = computed(() => this.requests().filter(r => r.status !== 'PROPOSAL_PENDING' && r.status !== 'COMPLETED' && r.status !== 'REJECTED'));
  public historicalRequests = computed(() => this.requests().filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED'));

  private pollInterval: any;

  constructor() {}

  ngOnInit() {
    this.loadData();
    this.pollInterval = setInterval(() => this.loadData(), 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadData() {
    const user = this.authService.currentUser();
    if (!user) return;

    this.requestService.getAll().subscribe(data => {
      this.requests.set(data.filter(r => String(r.userId) === String(user.id)));
      
      const currentSelected = this.selectedRequest();
      if (currentSelected) {
        const updated = data.find(r => r.id === currentSelected.id);
        if (updated) this.selectedRequest.set(updated);
      }
    });

    this.paymentService.getPayments().subscribe(payments => {
      this.payments.set(payments.filter(p => String(p.clientId) === String(user.id)));
    });
  }

  getPaymentForRequest(reqId: string | number): Payment | undefined {
    return this.payments().find(p => p.requestId && String(p.requestId) === String(reqId));
  }

  viewDetails(req: ServiceRequest) {
    this.selectedRequest.set(req);
  }

  async cancelRequest() {
    const current = this.selectedRequest();
    if (!current) return;
    
    const confirmed = await this.modalService.confirm('Terminate Deployment? This action is irreversible.');
    if (confirmed) {
      this.requestService.update(current.id, { status: 'REJECTED' }).subscribe({
        next: () => {
          this.toastService.success('Deployment terminated.');
          this.loadData();
          this.selectedRequest.set(null);
        }
      });
    }
  }

  viewDeliverables() {
    const current = this.selectedRequest();
    if (current) this.router.navigate(['/client/request-detail', current.id]);
  }

  payAdvance(req: ServiceRequest) {
    const p = this.getPaymentForRequest(req.id);
    this.router.navigate(['/client/payments'], {
      queryParams: {
        serviceId: req.serviceId,
        serviceName: req.serviceName,
        requestId: req.id,
        amount: p ? p.amount : 0
      }
    });
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }
}
