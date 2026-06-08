export interface Attachment {
  id: number;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface ServiceRequest {
  id: number;
  tenantId?: string | number;
  userId: number;
  serviceId: number;
  serviceName: string;
  categoryName: string;
  clientEmail?: string;
  assignedTo?: string | number;
  status: 'PROPOSAL_PENDING' | 'PENDING' | 'AWAITING_ADVANCE' | 'ADVANCE_PAID' | 'ASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'REJECTED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  clientNotes?: string;
  employeeNotes?: string;
  companyName?: string;
  details?: string;
  date?: string;
  employeeName?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  progress?: number;
  documents?: Attachment[];
  workedHours?: number;
  timerStartedAt?: string;
  totalAmount?: number;
  projectDocumentation?: string;
  projectStructure?: string;
  requirementsNeeded?: string;
  advanceAmount?: number;
}
