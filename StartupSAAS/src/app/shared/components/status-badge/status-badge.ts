import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.html',
  styleUrls: ['./status-badge.css']
})
export class StatusBadgeComponent {
  @Input() status!: string;
  @Input() size?: string;

  get badgeClass(): string {
    switch (this.status?.toUpperCase()) {
      case 'PROPOSAL_PENDING': return 'bg-light text-primary border border-primary';
      case 'PENDING': return 'bg-warning text-dark';
      case 'AWAITING_ADVANCE': return 'bg-light text-warning border border-warning';
      case 'ADVANCE_PAID': return 'bg-success text-white';
      case 'ASSIGNED': return 'bg-info text-dark';
      case 'IN_PROGRESS': return 'bg-primary';
      case 'REVIEW': return 'bg-secondary';
      case 'COMPLETED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'PAID': return 'bg-success';
      case 'FAILED': return 'bg-danger';
      case 'REFUNDED': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }
}
