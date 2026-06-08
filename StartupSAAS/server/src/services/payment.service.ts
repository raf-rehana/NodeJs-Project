import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Payment, ServiceRequest } from '../models';

const STORE_ID = 'testbox';
const STORE_PASSWORD = 'qwerty';
const SSL_BASE = 'https://sandbox.sslcommerz.com';

export class PaymentService {
  static async initiatePayment(payloadParams: any, activeBackendUrl: string) {
    const { amount, currency, planId, paymentId, requestId, planName, clientId, clientName, clientEmail, clientPhone, paymentMethod } = payloadParams;

    if (!amount || !clientId) throw new Error('Amount and clientId are required');

    const tran_id = `LNX-${uuidv4().split('-')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const payload = new URLSearchParams({
      store_id: STORE_ID,
      store_passwd: STORE_PASSWORD,
      total_amount: String(amount),
      currency: currency || 'BDT',
      tran_id,
      success_url: `${activeBackendUrl}/api/payment/success`,
      fail_url: `${activeBackendUrl}/api/payment/fail`,
      cancel_url: `${activeBackendUrl}/api/payment/cancel`,
      ipn_url: `${activeBackendUrl}/api/payment/ipn`,
      product_name: planName || 'StartupSAAS Plan',
      product_category: 'Digital Services',
      product_profile: 'general',
      cus_name: clientName || 'StartupSAAS Client',
      cus_email: clientEmail || 'client@startupsaas.com',
      cus_phone: clientPhone || '01700000000',
      cus_add1: 'Dhaka, Bangladesh',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_postcode: '1000',
      shipping_method: 'NO',
      ship_name: clientName || 'StartupSAAS Client',
      ship_add1: 'Dhaka, Bangladesh',
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
      ship_postcode: '1000',
      value_a: String(clientId),
      value_b: String(requestId || ''),
      value_c: String(planName || ''),
      value_d: String(paymentId || '')
    });

    if (paymentMethod === 'MOBILE_WALLET') payload.set('gwc', 'MOBILE_BANKING');
    else if (paymentMethod === 'BANK') payload.set('gwc', 'INTERNET_BANKING');

    const response = await axios.post(`${SSL_BASE}/gwprocess/v4/api.php`, payload.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return { responseData: response.data, tran_id };
  }

  static async validatePayment(val_id: string) {
    try {
      const response = await axios.get(`${SSL_BASE}/validator/api/validationserverAPI.php`, {
        params: { val_id, store_id: STORE_ID, store_passwd: STORE_PASSWORD, format: 'json' }
      });
      return response.data;
    } catch (e: any) {
      console.warn('Validation request failed:', e.message);
      return { status: 'FAILED' };
    }
  }

  static async processPaymentSuccess(params: any) {
    const { tran_id, amount, currency, card_type, clientId, requestId, planName, paymentId, cus_email, bank_tran_id } = params;

    let existingPayment = paymentId ? await Payment.findByPk(Number(paymentId)) : null;

    if (existingPayment) {
      await existingPayment.update({
        status: 'PAID',
        method: card_type || 'ONLINE',
        tranId: tran_id,
        bankTranId: bank_tran_id,
        currency,
        date: new Date().toISOString().split('T')[0],
        requestId: requestId || existingPayment.get('requestId')
      });
    } else {
      const items = await Payment.findAll({ attributes: ['id'] });
      const numericIds = items.map((i: any) => parseInt(i.id, 10)).filter(id => !isNaN(id));
      const nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 10000) + 1;

      await Payment.create({
        id: nextId,
        clientId: String(clientId),
        client: planName ? `${planName} - Client` : 'StartupSAAS Client',
        email: cus_email,
        item: planName || 'Subscription Plan',
        amount: parseFloat(amount),
        method: card_type || 'ONLINE',
        status: 'PAID',
        date: new Date().toISOString().split('T')[0],
        tranId: tran_id,
        bankTranId: bank_tran_id,
        currency,
        requestId: requestId || undefined
      });
    }

    if (requestId) {
      const request = await ServiceRequest.findByPk(Number(requestId));
      if (request) await request.update({ status: 'ADVANCE_PAID' });
    }
  }

  static async processIPN(params: any) {
    const { tran_id, status, amount, clientId, requestId, planName, paymentId, card_type, cus_email } = params;
    if (status !== 'VALID' && status !== 'VALIDATED') return;

    const existingTx = await Payment.findAll({ where: { tranId: tran_id } });
    if (existingTx.length > 0) return;

    let existingInvoice = paymentId ? await Payment.findByPk(Number(paymentId)) : null;

    if (existingInvoice) {
      await existingInvoice.update({
        status: 'PAID',
        method: card_type || 'ONLINE',
        tranId: tran_id,
        date: new Date().toISOString().split('T')[0],
        requestId: requestId || existingInvoice.get('requestId')
      });
    } else {
      const items = await Payment.findAll({ attributes: ['id'] });
      const numericIds = items.map((i: any) => parseInt(i.id, 10)).filter(id => !isNaN(id));
      const nextId = (numericIds.length > 0 ? Math.max(...numericIds) : 10000) + 1;

      await Payment.create({
        id: nextId,
        clientId: String(clientId),
        client: planName || 'StartupSAAS Client',
        email: cus_email,
        item: planName || 'Subscription Plan',
        amount: parseFloat(amount),
        method: card_type || 'ONLINE',
        status: 'PAID',
        date: new Date().toISOString().split('T')[0],
        tranId: tran_id,
        requestId: requestId || undefined
      });
    }

    if (requestId) {
      const request = await ServiceRequest.findByPk(Number(requestId));
      if (request) await request.update({ status: 'ASSIGNED' });
    }
  }

  static async getHistoryByClient(clientId: string) {
    return await Payment.findAll({ where: { clientId: Number(clientId) } });
  }
}
