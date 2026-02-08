import { Router } from 'express';
import { SectionController } from '../controllers/sectionController';
import { createImageFieldsUpload } from '../middlewares/upload';

const router = Router();

router.get('/', SectionController.getAll);
router.get('/:id/businesses', SectionController.getBusinesses);
router.get('/:id', SectionController.getById);
router.post(
  '/',
  createImageFieldsUpload('sections', ['image', 'icon']),
  SectionController.create,
);
router.put(
  '/:id',
  createImageFieldsUpload('sections', ['image', 'icon']),
  SectionController.update,
);
router.delete('/:id', SectionController.remove);

export default router;
