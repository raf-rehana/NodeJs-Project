import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { PaymentService } from '../../core/services/payment.service';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { AuditLogService } from '../../core/services/audit-log.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationService } from '../../core/services/notification.service';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
})
export class TaskDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly requestService = inject(RequestService);
  private readonly paymentService = inject(PaymentService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly toastService = inject(ToastService);
  private readonly notificationService = inject(NotificationService);
  private readonly adminService = inject(AdminService);

  public task = signal<ServiceRequest | null>(null);
  public clientPayments = signal<any[]>([]);
  public clientRequests = signal<any[]>([]);
  public daysRemaining = signal<number | null>(null);

  // Timer state
  public isTimerRunning = signal(false);
  public elapsedSeconds = signal(0);
  private timerInterval: any;

  public formattedElapsed = computed(() => {
    const sec = this.elapsedSeconds();
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  });

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.requestService.getById(id).subscribe(data => {
          this.task.set(data);
          this.elapsedSeconds.set((data.workedHours || 0) * 3600);
          this.loadClientData(data.userId?.toString() || '');
          this.calculateDeadline(data);
        });
      }
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  loadClientData(userId: string) {
    if (!userId) return;
    this.paymentService.getPayments().subscribe(payments => {
      this.clientPayments.set(payments.filter((p: any) => String(p.clientId) === userId));
    });
    this.requestService.getAll().subscribe((requests: any[]) => {
      this.clientRequests.set(requests.filter(r => String(r.userId) === userId && r.id !== this.task()?.id));
    });
  }

  startTimer() {
    this.isTimerRunning.set(true);
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(s => s + 1);
    }, 1000);
  }

  stopTimer() {
    if (!this.isTimerRunning()) return;
    this.isTimerRunning.set(false);
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const currentTask = this.task();
    if (currentTask) {
      const hours = parseFloat((this.elapsedSeconds() / 3600).toFixed(2));
      const updatedTask = { ...currentTask, workedHours: hours };
      this.task.set(updatedTask);
      
      this.requestService.update(updatedTask.id, {
        status: updatedTask.status,
        employeeNotes: updatedTask.employeeNotes,
        workedHours: hours,
        progress: updatedTask.progress
      }).subscribe();
    }
  }

  calculateDeadline(task: ServiceRequest) {
    this.adminService.getService(task.serviceId).subscribe(service => {
      if (service && service.deliveryDays) {
        const days = Math.max(...service.deliveryDays.split('-').map((d: string) => parseInt(d.trim())).filter((n: number) => !isNaN(n)));
        if (days > 0) {
          const createdAt = new Date(task.createdAt);
          const deadline = new Date(createdAt.getTime() + days * 24 * 60 * 60 * 1000);
          const now = new Date();
          const diff = deadline.getTime() - now.getTime();
          this.daysRemaining.set(Math.ceil(diff / (1000 * 60 * 60 * 24)));
        }
      }
    });
  }

  goBack() {
    this.router.navigate(['/employee/my-tasks']);
  }

  updateTaskField(field: keyof ServiceRequest, value: any) {
    this.task.update(t => t ? { ...t, [field]: value } : null);
  }

  updateTask() {
    const currentTask = this.task();
    if (!currentTask) return;
    
    if (this.isTimerRunning()) {
      this.isTimerRunning.set(false);
      if (this.timerInterval) clearInterval(this.timerInterval);
    }

    const hours = parseFloat((this.elapsedSeconds() / 3600).toFixed(2));
    const updatedTask = { ...currentTask, workedHours: hours };
    this.task.set(updatedTask);

    this.requestService.update(updatedTask.id, {
      status: updatedTask.status,
      employeeNotes: updatedTask.employeeNotes,
      workedHours: hours,
      progress: updatedTask.progress
    }).subscribe(() => {
      this.auditLogService.logAction('Task Updated', `Task #${updatedTask.id} status changed to ${updatedTask.status} (${updatedTask.progress}% complete)`);
      this.toastService.success('Task metadata synchronized.');

      const statusLabel = this.getStatusLabel(updatedTask.status);
      const progressText = updatedTask.progress != null ? ` (${updatedTask.progress}% complete)` : '';
      
      if (updatedTask.userId) {
        this.notificationService.create({
          userId: updatedTask.userId as number,
          title: `Work Progress Update`,
          message: `Your request "${updatedTask.serviceName}" has been updated to ${statusLabel}${progressText}.`,
          type: 'STATUS_UPDATE'
        }).subscribe();
      }

      this.goBack();
    });
  }

  downloadAllDocs() {
    const currentTask = this.task();
    if (!currentTask || !currentTask.documents) return;
    currentTask.documents.forEach(doc => {
      window.open(doc.url, '_blank');
    });
    this.toastService.info(`Initiating transfer of ${currentTask.documents.length} secure assets.`);
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending',
      ASSIGNED: 'Assigned',
      IN_PROGRESS: 'In Progress',
      REVIEW: 'Under Review',
      COMPLETED: 'Completed',
      REJECTED: 'Rejected'
    };
    return labels[status] || status;
  }
}
