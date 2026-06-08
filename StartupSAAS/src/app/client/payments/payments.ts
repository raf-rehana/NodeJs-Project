import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService, PaymentInitRequest } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { PdfGeneratorService } from '../../core/services/pdf-generator.service';
import { ToastService } from '../../core/services/toast.service';
import { ServiceCatalogueService } from '../../core/services/service-catalogue';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit, OnDestroy {
  methodCategory = signal<'ONLINE' | 'MOBILE_WALLET' | 'BANK' | 'CASH'>('ONLINE');
  selectedWallet = signal<string>('bkash');
  selectedBank = signal<string>('visa');

  isInstallment = signal(false);
  installmentMonths = signal('3');
  loadingPayment = signal(false);

  paymentStatus = signal<'success' | 'failed' | 'cancelled' | null>(null);
  tranId = signal<string | null>(null);
  paidAmount = signal<string | null>(null);
  private invoiceGenerated = false;

  plans = signal<{ id: number; name: string; price: number }[]>([]);
  selectedPlanId = signal<number | string>(0);
  selectedPlanName = signal<string>('');
  selectedPlanPrice = signal<number>(0);
  requestId = signal<string | null>(null);

  allPayments = signal<any[]>([]);
  pendingPayments = computed(() => this.allPayments().filter(p => p.status === 'PENDING'));
  paidPayments = computed(() => this.allPayments()
    .filter(p => p.status === 'PAID')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  );
  selectedPendingItem = signal<any | null>(null);
  showHistory = signal(false);

  vat = computed(() => this.selectedPlanPrice() * 0.05);
  total = computed(() => this.selectedPlanPrice() + this.vat());

  wallets = [
    { id: 'bkash',  label: 'bKash',  icon: 'bi-phone-fill',      color: '#E2136E', bg: '#fdf0f6' },
    { id: 'nagad',  label: 'Nagad',  icon: 'bi-phone-vibrate-fill', color: '#F05829', bg: '#fff4f0' },
    { id: 'rocket', label: 'Rocket', icon: 'bi-rocket-fill',      color: '#8B2FC9', bg: '#f5f0ff' },
    { id: 'upay',   label: 'Upay',   icon: 'bi-wallet2',          color: '#00A859', bg: '#f0fdf4' },
  ];

  banks = [
    { id: 'visa',       label: 'Visa Card',     icon: 'bi-credit-card-fill',   color: '#1A1F71', bg: '#f0f2ff' },
    { id: 'mastercard', label: 'Mastercard',    icon: 'bi-credit-card-2-front', color: '#EB001B', bg: '#fff0f0' },
    { id: 'amex',       label: 'Amex',          icon: 'bi-credit-card',         color: '#007BC1', bg: '#f0f8ff' },
    { id: 'netbank',    label: 'Net Banking',   icon: 'bi-bank2',               color: '#2E7D32', bg: '#f0fdf4' },
    { id: 'dutch',      label: 'Dutch-Bangla',  icon: 'bi-building-fill',       color: '#D32F2F', bg: '#fff5f5' },
    { id: 'brac',       label: 'BRAC Bank',     icon: 'bi-bank',                color: '#F57C00', bg: '#fff8f0' },
  ];

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private pdfGeneratorService: PdfGeneratorService,
    private toastService: ToastService,
    private catalogueService: ServiceCatalogueService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.paymentStatus.set(params['status']);
        this.tranId.set(params['tran_id'] || null);
        this.paidAmount.set(params['amount'] || null);
      }
      if (params['serviceId']) {
        this.selectedPlanId.set(params['serviceId']);
        this.selectedPlanName.set(params['serviceName'] || 'Service Request');
        const amt = Number(params['amount']) || 0;
        if (amt > 0) {
          this.selectedPlanPrice.set(amt);
        } else {
          this.catalogueService.getServiceById(params['serviceId'].toString()).subscribe({
            next: (service) => this.selectedPlanPrice.set(service.price || 0),
            error: () => this.selectedPlanPrice.set(0)
          });
        }
      } else if (params['planId']) {
        const pId = Number(params['planId']);
        this.selectedPlanId.set(pId);
        // We will match name and price in loadPlans() after it loads
      }
      
      if (params['requestId']) {
        this.requestId.set(params['requestId']);
      }

      if (this.paymentStatus() === 'success' && !this.invoiceGenerated) {
        this.triggerAutoInvoice();
        this.loadPayments();
      }
    });
    this.loadPlans();
    this.loadPayments();
  }

  loadPlans() {
    this.paymentService.getSubscriptions().subscribe({
      next: data => {
        this.plans.set(data.map(p => ({ id: p.id, name: p.name, price: p.price })));
        this.matchUrlPlan();
      },
      error: () => {
        this.plans.set([
          { id: 1, name: 'Digital Foundation',  price: 499  },
          { id: 2, name: 'Growth Accelerator',  price: 1499 },
          { id: 3, name: 'A-to-Z Launchpad',    price: 3499 },
        ]);
        this.matchUrlPlan();
      }
    });
  }

  matchUrlPlan() {
    const routePlanId = this.route.snapshot.queryParams['planId'];
    if (routePlanId) {
      const plan = this.plans().find(p => String(p.id) === String(routePlanId));
      if (plan) {
        this.selectedPlanId.set(plan.id);
        this.selectedPlanName.set(plan.name);
        this.selectedPlanPrice.set(plan.price);
      }
    }
  }

  loadPayments() {
    const user = this.authService.currentUser();
    if (!user) return;
    this.paymentService.getPayments().subscribe({
      next: (data: any[]) => {
        this.allPayments.set(data.filter(p => String(p.clientId) === String(user.id)));
      }
    });
  }

  selectPendingPayment(payment: any) {
    this.selectedPendingItem.set(payment);
    this.selectedPlanId.set(payment.id);
    this.selectedPlanName.set(payment.item);
    this.selectedPlanPrice.set(payment.amount);
    this.requestId.set(payment.requestId || null);
    
    setTimeout(() => {
      document.querySelector('.payment-gateway-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  pay() {
    if (this.methodCategory() === 'CASH') {
      this.handleCashPayment();
    } else {
      this.handleOnlinePayment();
    }
  }

  handleCashPayment() {
    const user = this.authService.currentUser();
    this.loadingPayment.set(true);
    this.paymentService.addPayment({
      clientId: user?.id || 0,
      client:   user?.name || 'Client',
      email:    user?.email || '',
      item:     this.selectedPlanName(),
      amount:   this.total(),
      method:   'CASH',
      status:   'PENDING',
      date:     new Date().toISOString().split('T')[0],
      requestId: this.requestId() ? Number(this.requestId()) : undefined,
    }).subscribe({
      next: () => {
        this.loadingPayment.set(false);
        this.paymentStatus.set('success');
        this.tranId.set('CASH-' + Date.now());
        this.triggerAutoInvoice();
        this.loadPayments();
      },
      error: () => {
        this.loadingPayment.set(false);
        this.toastService.error('Failed to record cash payment.');
      }
    });
  }

  handleOnlinePayment() {
    const user = this.authService.currentUser();
    this.loadingPayment.set(true);

    let paymentMethodHint = this.methodCategory() === 'MOBILE_WALLET' ? 'MOBILE_WALLET' : 
                            this.methodCategory() === 'BANK' ? 'BANK' : 'ONLINE';

    const payload: PaymentInitRequest = {
      amount:       this.total(),
      currency:     'BDT',
      planId:       Number(this.selectedPlanId()),
      paymentId:    this.selectedPendingItem()?.id,
      requestId:    this.requestId() ? Number(this.requestId()) : undefined,
      planName:     this.selectedPlanName(),
      clientId:     user?.id || 0,
      clientName:   user?.name || 'StartupSAAS Client',
      clientEmail:  user?.email || 'client@startupsaas.com',
      clientPhone:  (user as any)?.phone || '01700000000',
      paymentMethod: paymentMethodHint as any,
    };

    this.paymentService.initiatePayment(payload).subscribe({
      next: (res: any) => {
        this.loadingPayment.set(false);
        if (res.status === 'SUCCESS' && res.payment_url) {
          window.location.href = res.payment_url;
        } else {
          this.toastService.error('Could not initiate payment: ' + (res.message || 'Unknown error'));
        }
      },
      error: () => {
        this.loadingPayment.set(false);
        this.toastService.error('Payment server error.');
      }
    });
  }

  generateInvoice(payment: any): void {
    const invoiceDetails = {
      id: payment.id,
      orderId: payment.id,
      clientId: payment.clientId || this.authService.currentUser()?.id || 'N/A',
      clientName: payment.client,
      clientEmail: payment.email || this.authService.currentUser()?.email || '',
      service: payment.item,
      amount: payment.amount,
      date: payment.date
    };
    this.pdfGeneratorService.generateInvoicePdf(invoiceDetails);
  }

  private triggerAutoInvoice() {
    if (this.invoiceGenerated) return;
    this.invoiceGenerated = true;
    
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const actualPayment = this.allPayments().find(p => String(p.tranId) === String(this.tranId()));
      
      if (actualPayment) {
        clearInterval(interval);
        this.generateInvoice(actualPayment);
      } else if (attempts >= 10) {
        clearInterval(interval);
        const mockPayment = {
          id: this.tranId() || 'INV-' + Date.now(),
          clientId: this.authService.currentUser()?.id || 'N/A',
          client: this.authService.currentUser()?.name || 'Client',
          email: this.authService.currentUser()?.email || '',
          item: this.selectedPlanName() || 'Subscription Plan',
          amount: Number(this.paidAmount()) || this.total(),
          date: new Date().toISOString().split('T')[0]
        };
        this.generateInvoice(mockPayment);
      }
    }, 300);
  }

  ngOnDestroy() {}
}
