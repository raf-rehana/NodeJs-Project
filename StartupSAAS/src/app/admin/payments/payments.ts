import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService, Payment } from '../../core/services/payment.service';
import { PdfGeneratorService } from '../../core/services/pdf-generator.service';
import { RequestService } from '../../core/services/request.service';
import { NotificationService } from '../../core/services/notification.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class AdminPaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly pdfGeneratorService = inject(PdfGeneratorService);
  private readonly requestService = inject(RequestService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);

  public payments = signal<Payment[]>([]);
  public filterStatus = signal<string>('ALL');
  
  public showManualRecordModal = signal(false);
  public newRecord = signal<Partial<Payment>>({
    client: '', email: '', clientId: 0, item: '', amount: 0,
    method: 'Manual/Cash', status: 'PAID', date: new Date().toISOString()
  });

  public filteredPayments = computed(() => {
    const status = this.filterStatus();
    const list = this.payments();
    return status === 'ALL' ? list : list.filter(p => p.status === status);
  });

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getPayments().subscribe(data => this.payments.set(data));
  }

  setFilter(status: string) {
    this.filterStatus.set(status);
  }

  openManualRecordModal() {
    this.newRecord.set({
      client: '', email: '', clientId: 0, item: '', amount: 0,
      method: 'Manual/Cash', status: 'PAID', date: new Date().toISOString()
    });
    this.showManualRecordModal.set(true);
  }

  closeManualRecordModal() {
    this.showManualRecordModal.set(false);
  }

  updateRecordField(field: keyof Payment, value: any) {
    this.newRecord.update(r => ({ ...r, [field]: value }));
  }

  saveManualRecord() {
    this.paymentService.addPayment(this.newRecord()).subscribe(() => {
      this.loadPayments();
      this.closeManualRecordModal();
    });
  }

  generateInvoice(payment: any): void {
    const invoiceDetails = {
      id: payment.id,
      orderId: payment.id,
      clientId: payment.clientId || 'N/A',
      clientName: payment.client,
      clientEmail: payment.email || '',
      service: payment.item,
      amount: payment.amount,
      date: payment.date,
      items: [{ description: payment.item, qty: 1, price: payment.amount }],
      discount: payment.discount || 0,
    };
    this.pdfGeneratorService.generateInvoicePdf(invoiceDetails);
  }

  async processRefund(payment: any) {
    const confirmed = await this.modalService.confirm('Authorize full refund transmission?');
    if (confirmed) {
      this.paymentService.updatePayment(payment.id, { status: 'REFUNDED' }).subscribe(() => {
        this.loadPayments();
      });
    }
  }

  async approvePayment(payment: any) {
    const confirmed = await this.modalService.confirm(`Authorize ledger entry of BDT ${payment.amount} for ${payment.client}?`);
    if (confirmed) {
      this.paymentService.updatePayment(payment.id, { status: 'PAID' }).subscribe(() => {
        if (payment.requestId) {
          this.requestService.update(payment.requestId, { status: 'ADVANCE_PAID' }).subscribe({
            next: () => {
              this.notificationService.create({
                userId: Number(payment.clientId),
                title: 'Advance Payment Approved',
                message: `We've approved your 20% advance payment for "${payment.item}". Awaiting employee assignment.`,
                type: 'STATUS_UPDATE'
              }).subscribe();

              this.notificationService.create({
                userId: 10151,
                title: '20% Advance Paid',
                message: `Client paid the 20% advance for request "${payment.item}". You can now assign employees.`,
                type: 'INFO'
              }).subscribe();

              this.loadPayments();
            },
            error: () => this.loadPayments()
          });
        } else {
          this.loadPayments();
        }
      });
    }
  }
}
