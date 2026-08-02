import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

router.get('/', PaymentController.getMethods);
router.post('/', PaymentController.createMethod);
router.delete('/:id', PaymentController.deleteMethod);

export default router;
