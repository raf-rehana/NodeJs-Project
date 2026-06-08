import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../core/services/request.service';
import { AdminService } from '../../core/services/admin.service';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { User } from '../../core/models/user';
import { AuditLogService } from '../../core/services/audit-log.service';
import { ModalService } from '../../core/services/modal.service';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-all-requests',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, FormsModule],
  templateUrl: './all-requests.html'
})
export class AllRequestsComponent implements OnInit {
  private readonly requestService = inject(RequestService);
  private readonly adminService = inject(AdminService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly modalService = inject(ModalService);
  private readonly paymentService = inject(PaymentService);
  private readonly notificationService = inject(NotificationService);
  private readonly toastService = inject(ToastService);

  public requests = signal<ServiceRequest[]>([]);
  public employee = signal<User[]>([]);
  public selectedRequest = signal<ServiceRequest | null>(null);
  
  public showFilters = signal(false);
  public filterStatus = signal('');
  public filterPriority = signal('');

  public filteredRequests = computed(() => {
    return this.requests().filter(req => {
      const matchStatus = !this.filterStatus() || req.status === this.filterStatus();
      const matchPriority = !this.filterPriority() || req.priority === this.filterPriority();
      return matchStatus && matchPriority;
    });
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.requestService.getAll().subscribe(data => this.requests.set(data));
    this.adminService.getUsers('EMPLOYEE').subscribe(data => this.employee.set(data));
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  resetFilters() {
    this.filterStatus.set('');
    this.filterPriority.set('');
  }

  exportRequests() {
    const list = this.requests();
    if (list.length === 0) return;
    
    const headers = ['Request ID', 'Client ID', 'Service Name', 'Category', 'Status', 'Priority', 'Created Date'];
    const rows = this.filteredRequests().map(req => [
      `REQ-${req.id}`,
      req.userId,
      req.serviceName,
      req.categoryName,
      req.status,
      req.priority,
      req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `StartupSAAS_Requests_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  manageRequest(req: ServiceRequest) {
    this.selectedRequest.set({ ...req });
  }

  closeModal() {
    this.selectedRequest.set(null);
  }

  updateField(field: keyof ServiceRequest, value: any) {
    this.selectedRequest.update(t => t ? { ...t, [field]: value } : null);
  }

  update() {
    const current = this.selectedRequest();
    if (!current) return;

    if (current.assignedTo && current.status === 'ADVANCE_PAID') {
      current.status = 'ASSIGNED';
      this.selectedRequest.set({ ...current });
    }

    const payload: Partial<ServiceRequest> = {
      status: current.status,
      employeeNotes: current.employeeNotes,
      priority: current.priority,
      totalAmount: current.totalAmount,
      advanceAmount: current.advanceAmount,
      projectDocumentation: current.projectDocumentation,
      projectStructure: current.projectStructure,
      requirementsNeeded: current.requirementsNeeded,
      assignedTo: current.assignedTo
    };

    this.requestService.update(current.id, payload).subscribe(() => {
      this.auditLogService.logAction('Request Updated', `Admin updated request #${current.id} to status: ${current.status} (Priority: ${current.priority})`);
      
      if (current.status === 'COMPLETED') {
        this.handleCompletionAutomation(current);
      }

      if (current.assignedTo) {
        this.requestService.assignTo(current.id, Number(current.assignedTo)).subscribe(() => {
          this.notificationService.create({
            userId: Number(current.assignedTo),
            title: 'New Task Assigned',
            message: `You have been assigned: ${current.serviceName}`,
            type: 'TASK_ASSIGNED'
          }).subscribe();
          this.loadData();
        });
      } else {
        this.loadData();
      }
    });
  }

  private handleCompletionAutomation(req: ServiceRequest) {
    this.adminService.getService(req.serviceId).subscribe(service => {
      this.paymentService.addPayment({
        clientId: Number(req.userId),
        client: 'Client Name', 
        email: req.clientEmail,
        item: req.serviceName,
        amount: service.price,
        method: 'WAITING',
        status: 'PENDING',
        date: new Date().toISOString()
      }).subscribe();

      this.notificationService.create({
        userId: Number(req.userId),
        title: 'Payment Due',
        message: `Your request for "${req.serviceName}" has been completed. Please proceed to payment.`,
        type: 'PAYMENT_DUE'
      }).subscribe();
    });
  }

  saveNotes() {
    this.update();
    this.selectedRequest.set(null);
  }

  requestAdvancePayment(req: ServiceRequest) {
    if (req.serviceId === 0 && (!req.totalAmount || req.totalAmount <= 0)) {
      this.toastService.error('Please specify a positive Fixed Total Budget for this custom project proposal first.');
      return;
    }

    this.adminService.getService(req.serviceId).subscribe({
      next: (service) => {
        const totalAmt = req.totalAmount || (service ? service.price : 0);
        if (totalAmt <= 0) {
          this.toastService.error('Could not determine project budget. Please set a Fixed Total Budget manually.');
          return;
        }

        const amount = req.advanceAmount || (totalAmt * 0.20);
        
        this.paymentService.addPayment({
          clientId: Number(req.userId),
          client: 'Client Name',
          email: req.clientEmail || '',
          item: `${req.serviceName} (Advance Deposit)`,
          amount: amount,
          method: 'WAITING',
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          requestId: req.id
        }).subscribe(() => {
          this.requestService.update(req.id, {
            status: 'AWAITING_ADVANCE',
            totalAmount: req.totalAmount,
            advanceAmount: req.advanceAmount,
            projectDocumentation: req.projectDocumentation,
            projectStructure: req.projectStructure,
            requirementsNeeded: req.requirementsNeeded
          }).subscribe(() => {
            this.auditLogService.logAction('Advance Requested', `Admin requested advance payment for request #${req.id} (BDT ${amount})`);
            this.toastService.success('Advance payment requested successfully!');
            
            this.notificationService.create({
              userId: Number(req.userId),
              title: 'Advance Payment Required',
              message: `An advance payment of BDT ${amount} is required to start your project "${req.serviceName}".`,
              type: 'PAYMENT_DUE'
            }).subscribe();

            this.loadData();
            this.selectedRequest.set(null);
          });
        });
      },
      error: () => {
        const totalAmt = req.totalAmount || 25000;
        const amount = req.advanceAmount || (totalAmt * 0.20);

        this.paymentService.addPayment({
          clientId: Number(req.userId),
          client: 'Client Name',
          email: req.clientEmail || '',
          item: `${req.serviceName} (Advance Deposit)`,
          amount: amount,
          method: 'WAITING',
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          requestId: req.id
        }).subscribe(() => {
          this.requestService.update(req.id, {
            status: 'AWAITING_ADVANCE',
            totalAmount: req.totalAmount,
            advanceAmount: req.advanceAmount,
            projectDocumentation: req.projectDocumentation,
            projectStructure: req.projectStructure,
            requirementsNeeded: req.requirementsNeeded
          }).subscribe(() => {
            this.auditLogService.logAction('Advance Requested', `Admin requested advance payment for request #${req.id} (BDT ${amount})`);
            this.toastService.success('Advance payment requested successfully!');
            
            this.notificationService.create({
              userId: Number(req.userId),
              title: 'Advance Payment Required',
              message: `An advance payment of BDT ${amount} is required to start your project "${req.serviceName}".`,
              type: 'PAYMENT_DUE'
            }).subscribe();

            this.loadData();
            this.selectedRequest.set(null);
          });
        });
      }
    });
  }

  async cancelRequest() {
    const current = this.selectedRequest();
    if (!current) return;

    const confirmed = await this.modalService.confirm('Are you sure you want to reject this request?');
    if (confirmed) {
      current.status = 'REJECTED';
      this.selectedRequest.set({ ...current });
      this.auditLogService.logAction('Request Rejected', `Admin rejected request #${current.id}`);
      this.update();
      this.selectedRequest.set(null);
    }
  }
}
