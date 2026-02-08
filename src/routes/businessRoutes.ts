import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { createImageFieldsUpload } from '../middlewares/upload';

const router = Router();

router.get('/', BusinessController.getAll);
router.get('/:id/destinations', BusinessController.getDestinations);
router.get('/:id', BusinessController.getById);
router.post(
  '/',
  createImageFieldsUpload('businesses', ['image', 'logo']),
  BusinessController.create,
);
router.put(
  '/:id',
  createImageFieldsUpload('businesses', ['image', 'logo']),
  BusinessController.update,
);
router.delete('/:id', BusinessController.remove);

export default router;
