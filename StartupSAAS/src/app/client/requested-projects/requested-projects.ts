import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest } from '../../core/models/service-request';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import { interval, Subscription } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-requested-projects',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, RouterModule],
  templateUrl: './requested-projects.html',
  styleUrls: ['./requested-projects.css']
})
export class RequestedProjectsComponent implements OnInit, OnDestroy {
  requests: ServiceRequest[] = [];
  selectedRequest: ServiceRequest | null = null;
  private pollSubscription?: Subscription;

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRequests();
    this.pollSubscription = interval(5000).subscribe(() => this.loadRequests());
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
  }

  loadRequests() {
    const user = this.authService.currentUser();
    if (user) {
      this.requestService.getAll().pipe(map(reqs => reqs.filter(r => r.userId === user.id))).subscribe({
        next: (data) => {
          this.requests = data.filter(r => r.status === 'PROPOSAL_PENDING');
          this.cdr.markForCheck();
          
          if (this.selectedRequest) {
            const updated = this.requests.find(r => r.id === this.selectedRequest?.id);
            if (updated) {
              this.selectedRequest = updated;
            } else {
              this.selectedRequest = null;
            }
            this.cdr.markForCheck();
          }
        },
        error: (err: any) => {
          console.error('Error loading requested projects:', err);
        }
      });
    }
  }

  viewDetails(req: ServiceRequest) {
    this.selectedRequest = req;
    this.cdr.markForCheck();
  }

  async cancelRequest() {
    if (!this.selectedRequest) return;
    const confirmed = await this.modalService.confirm('Are you sure you want to withdraw this proposal request?');
    if (confirmed) {
      this.requestService.update(this.selectedRequest.id, { status: 'REJECTED' })
        .subscribe({
          next: () => {
            this.toastService.success('Proposal withdrawn successfully');
            this.loadRequests();
            this.selectedRequest = null;
          },
          error: (err: any) => {
            this.toastService.error('Failed to withdraw proposal');
            console.error(err);
          }
        });
    }
  }

  goBack() {
    this.router.navigate(['/client/dashboard']);
  }
}
