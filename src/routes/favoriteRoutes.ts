import { Router } from 'express';
import { FavoriteController } from '../controllers/favoriteController';

const router = Router();

router.get('/', FavoriteController.getAll);
router.post('/', FavoriteController.create);
router.delete('/:destinationId', FavoriteController.removeByDestination);
router.delete('/', FavoriteController.remove);

export default router;
