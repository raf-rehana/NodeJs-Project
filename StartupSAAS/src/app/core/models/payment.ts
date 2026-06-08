export interface Payment {
  id: number;
  tenantId: number;
  requestId: number;
  serviceName: string;
  amount: number;
  currency: string;
  type: 'SERVICE_FEE' | 'SUBSCRIPTION' | 'ADVANCE' | 'REFUND';
  method?: 'BKASH' | 'NAGAD' | 'BANK' | 'CARD' | 'CASH';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  referenceId?: string;
  paidAt?: string;
  createdAt: string;
}
