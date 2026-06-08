import { Router } from 'express';
import { CrudController } from '../controllers/crud.controller';
import { PaymentController } from '../controllers/payment.controller';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Health and Status
router.get('/health', HealthController.getHealth);
router.get('/chat/online-clients', HealthController.getOnlineClients);
router.get('/chat/online-employees', HealthController.getOnlineEmployees);

// Payment Routes
router.post('/payment/init', PaymentController.init);
router.post('/payment/success', PaymentController.success);
router.post('/payment/fail', PaymentController.fail);
router.post('/payment/cancel', PaymentController.cancel);
router.post('/payment/ipn', PaymentController.ipn);
router.get('/payments/history/:clientId', PaymentController.getHistory);

// Dynamic CRUD Routes
router.get('/:collection', CrudController.getAll);
router.get('/:collection/:id', CrudController.getOne);
router.post('/:collection', CrudController.create);
router.patch('/:collection/:id', CrudController.update);
router.put('/:collection/:id', CrudController.update); // Reusing update for simplicity
router.delete('/:collection/:id', CrudController.remove);

export default router;
