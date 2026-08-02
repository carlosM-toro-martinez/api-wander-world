import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

router.post('/checkout', PaymentController.createAirtmCheckout);
router.post('/webhook', PaymentController.airtmWebhook);
router.post('/withdrawal', PaymentController.createAirtmWithdrawal);
router.post('/intent', PaymentController.createIntent);
router.post('/confirm', PaymentController.confirm);
router.get('/:id', PaymentController.getPayment);

export default router;
