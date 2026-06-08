import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { switchMap, startWith, filter, map } from 'rxjs/operators';
import { RequestService } from '../../core/services/request.service';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { RequestTimelineComponent } from '../../shared/components/request-timeline/request-timeline';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';
import { PaymentService, Payment } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RequestTimelineComponent, RouterModule],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.css',
})
export class RequestDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly catalogueService = inject(ServiceCatalogueService);
  private readonly paymentService = inject(PaymentService);
  private readonly authService = inject(AuthService);
  private readonly chatService = inject(ChatService);

  public request = signal<ServiceRequest | null>(null);
  public servicePrice = signal<number>(0);
  public payments = signal<Payment[]>([]);

  private pollInterval: any;

  constructor() {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.fetchData(id);
        this.pollInterval = setInterval(() => this.fetchData(id), 5000);
      }
    });

    const user = this.authService.currentUser();
    if (user) {
      this.paymentService.getPayments().subscribe(payments => {
        this.payments.set(payments.filter(p => String(p.clientId) === String(user.id)));
      });
    }
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  fetchData(id: string | number) {
    this.requestService.getById(Number(id)).subscribe(data => {
      this.request.set(data);
      this.loadServiceDetails(data.serviceId, data.totalAmount);
    });
  }

  loadServiceDetails(serviceId: string | number, totalAmount?: number) {
    if (totalAmount !== undefined && totalAmount !== null) {
      this.servicePrice.set(totalAmount);
      return;
    }

    this.catalogueService.getServiceById(Number(serviceId)).subscribe({
      next: (service) => this.servicePrice.set(service ? service.price : 0),
      error: () => this.servicePrice.set(0)
    });
  }

  getPaymentForRequest(): Payment | undefined {
    const req = this.request();
    if (!req) return undefined;
    return this.payments().find(p => p.requestId && String(p.requestId) === String(req.id));
  }

  openChat() {
    this.chatService.toggleChat(true);
  }

  payAdvance() {
    const req = this.request();
    if (!req) return;
    const p = this.getPaymentForRequest();
    const customAdvance = req.advanceAmount || (this.servicePrice() * 0.20);
    this.router.navigate(['/client/payments'], {
      queryParams: {
        serviceId: req.serviceId,
        serviceName: req.serviceName,
        requestId: req.id,
        amount: p ? p.amount : customAdvance
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
