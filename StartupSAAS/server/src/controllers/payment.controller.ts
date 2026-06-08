import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { getBackendUrl, getFrontendUrl } from '../utils/url.util';

export class PaymentController {
  static async init(req: Request, res: Response, next: NextFunction) {
    try {
      const activeBackendUrl = getBackendUrl(req);
      const { responseData, tran_id } = await PaymentService.initiatePayment(req.body, activeBackendUrl);

      if (responseData.status === 'SUCCESS') {
        res.json({
          status: 'SUCCESS',
          payment_url: responseData.GatewayPageURL,
          session_key: responseData.sessionkey,
          tran_id,
        });
      } else {
        res.status(400).json({
          status: 'FAILED',
          message: responseData.failedreason || 'SSLCommerz could not initiate session'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async success(req: Request, res: Response, next: NextFunction) {
    const frontendUrl = getFrontendUrl(req);
    try {
      const { tran_id, val_id, value_a, value_b, value_c, value_d, amount, currency, card_type, bank_tran_id, cus_email } = req.body;
      const v = await PaymentService.validatePayment(val_id);
      
      if (v.status !== 'VALID' && v.status !== 'VALIDATED') {
        return res.redirect(`${frontendUrl}/client/payments?status=failed&tran_id=${tran_id}&reason=validation_failed`);
      }

      await PaymentService.processPaymentSuccess({
        tran_id, val_id, bank_tran_id, amount, currency, card_type,
        clientId: value_a, requestId: value_b, planName: value_c, paymentId: value_d, cus_email
      });

      res.redirect(`${frontendUrl}/client/payments?status=success&tran_id=${tran_id}&amount=${amount}`);
    } catch (error) {
      console.error(error);
      res.redirect(`${frontendUrl}/client/payments?status=failed`);
    }
  }

  static async fail(req: Request, res: Response) {
    const { tran_id } = req.body;
    res.redirect(`${getFrontendUrl(req)}/client/payments?status=failed&tran_id=${tran_id}`);
  }

  static async cancel(req: Request, res: Response) {
    const { tran_id } = req.body;
    res.redirect(`${getFrontendUrl(req)}/client/payments?status=cancelled&tran_id=${tran_id}`);
  }

  static async ipn(req: Request, res: Response, next: NextFunction) {
    try {
      const { tran_id, val_id, status, amount, value_a, value_b, value_c, value_d, card_type, cus_email } = req.body;
      await PaymentService.processIPN({
        tran_id, val_id, status, amount, card_type, cus_email,
        clientId: value_a, requestId: value_b, planName: value_c, paymentId: value_d
      });
      res.status(200).send('IPN received');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await PaymentService.getHistoryByClient(req.params.clientId);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}
