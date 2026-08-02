import { Router } from 'express';
import { DestinationController } from '../controllers/destinationController';
import { uploadDestinationImage } from '../middlewares/upload';

const router = Router();

router.get('/', DestinationController.getAll);
router.get('/:id', DestinationController.getById);
router.post('/', uploadDestinationImage, DestinationController.create);
router.get('/:id/reviews', DestinationController.getReviews);
router.post('/:id/reviews', DestinationController.addReview);
router.put('/:id', DestinationController.update);
router.delete('/:id', DestinationController.remove);

export default router;
