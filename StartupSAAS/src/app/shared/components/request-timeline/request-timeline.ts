import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequest } from '../../../core/models/service-request';

@Component({
  selector: 'app-request-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-timeline.html',
  styleUrls: ['./request-timeline.css']
})
export class RequestTimelineComponent {
  @Input() request!: ServiceRequest;

  get timelineSteps() {
    const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
    let currentIdx = statuses.indexOf(this.request?.status || 'PENDING');
    if (this.request?.status === 'AWAITING_ADVANCE' || this.request?.status === 'ADVANCE_PAID') {
      currentIdx = 0;
    } else if (this.request?.status === 'REJECTED') {
      currentIdx = -1; // Special case for rejected
    }
    
    return statuses.map((status, index) => ({
      status,
      label: status.replace('_', ' '),
      completed: index <= currentIdx,
      current: index === currentIdx || (status === 'PENDING' && this.request?.status === 'REJECTED')
    }));
  }
}
