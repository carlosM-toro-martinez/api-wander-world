import { Router } from 'express';
import { ProfileController } from '../controllers/profileController';
import { createImageFieldsUpload } from '../middlewares/upload';

const router = Router();

router.get('/', ProfileController.getAll);
router.get('/:id/favorites', ProfileController.getFavorites);
router.get('/:id', ProfileController.getById);
router.post(
  '/',
  createImageFieldsUpload('profiles', ['avatar', 'image']),
  ProfileController.create,
);
router.put(
  '/:id',
  createImageFieldsUpload('profiles', ['avatar', 'image']),
  ProfileController.update,
);
router.delete('/:id', ProfileController.remove);

export default router;
