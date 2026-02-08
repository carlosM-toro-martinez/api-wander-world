import { Router } from 'express';
import { TripController } from '../controllers/tripController';
import { createImageUpload } from '../middlewares/upload';

const router = Router();

router.get('/', TripController.getAll);
router.get('/:id', TripController.getById);
router.post('/', createImageUpload('trips', 'image'), TripController.create);
router.put('/:id', createImageUpload('trips', 'image'), TripController.update);
router.delete('/:id', TripController.remove);

export default router;
