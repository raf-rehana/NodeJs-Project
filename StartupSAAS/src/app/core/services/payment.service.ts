import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Payment {
  id?: number;
  clientId: number;
  client: string;
  email?: string;
  item: string;
  amount: number;
  method: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
  tranId?: string;
  requestId?: number;
}

export interface Subscription {
  id: number;
  name: string;
  price: number;
  features: string[];
  description?: string;
  billingCycle?: string;
}

export interface PaymentInitRequest {
  amount: number;
  currency?: string;
  planId?: number;
  paymentId?: number;
  requestId?: number;
  planName?: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: 'ONLINE' | 'MOBILE_WALLET' | 'BANK';
}

export interface PaymentInitResponse {
  status: 'SUCCESS' | 'FAILED';
  payment_url?: string;
  session_key?: string;
  tran_id?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly dbUrl      = `${environment.apiUrl}/payments`;
  private readonly gatewayUrl = `${environment.backendUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  getPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.dbUrl);
  }

  addPayment(payment: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(this.dbUrl, payment);
  }

  initiatePayment(data: PaymentInitRequest): Observable<PaymentInitResponse> {
    return this.http.post<PaymentInitResponse>(`${this.gatewayUrl}/init`, data);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${environment.apiUrl}/subscriptions`);
  }

  updatePayment(id: string | number, payment: Partial<Payment>): Observable<Payment> {
    return this.http.patch<Payment>(`${this.dbUrl}/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.dbUrl}/${id}`);
  }
}
