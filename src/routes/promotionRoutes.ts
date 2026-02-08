import { Router } from 'express';
import { PromotionController } from '../controllers/promotionController';

const router = Router();

router.get('/', PromotionController.getAll);
router.get('/:id', PromotionController.getById);
router.post('/', PromotionController.create);
router.put('/:id', PromotionController.update);
router.delete('/:id', PromotionController.remove);

export default router;
