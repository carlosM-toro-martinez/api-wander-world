import { Router } from 'express';
import { OpeningHoursController } from '../controllers/openingHoursController';

const router = Router();

router.get('/', OpeningHoursController.getAll);
router.get('/:id', OpeningHoursController.getById);
router.post('/', OpeningHoursController.create);
router.put('/:id', OpeningHoursController.update);
router.delete('/:id', OpeningHoursController.remove);

export default router;
