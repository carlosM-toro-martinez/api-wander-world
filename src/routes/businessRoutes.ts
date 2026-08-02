import { Router } from 'express';
import { BusinessController } from '../controllers/businessController';
import { authMiddleware } from '../middlewares/auth';
import { createImageFieldsUpload, uploadDestinationImage } from '../middlewares/upload';

const router = Router();

router.get('/', BusinessController.getAll);
router.get('/review-applications', BusinessController.getReviewApplications);
router.get('/review-applications/:id', BusinessController.getReviewApplicationById);
router.put(
  '/review-applications/:id',
  createImageFieldsUpload('businesses', ['image', 'logo']),
  BusinessController.updateReviewApplication,
);
router.patch('/review-applications/:id/approve', BusinessController.approve);
router.patch('/review-applications/:id/reject', BusinessController.reject);
router.delete('/review-applications/:id', BusinessController.remove);
router.get('/me', authMiddleware, BusinessController.getMine);
router.post(
  '/apply',
  authMiddleware,
  createImageFieldsUpload('businesses', ['image', 'logo']),
  BusinessController.apply,
);
router.put(
  '/me/application',
  authMiddleware,
  createImageFieldsUpload('businesses', ['image', 'logo']),
  BusinessController.updateMyApplication,
);
router.get('/me/services', authMiddleware, BusinessController.getMyServices);
router.post('/me/services', authMiddleware, uploadDestinationImage, BusinessController.createMyService);
router.put(
  '/me/services/:serviceId',
  authMiddleware,
  uploadDestinationImage,
  BusinessController.updateMyService,
);
router.delete('/me/services/:serviceId', authMiddleware, BusinessController.deleteMyService);
router.get('/:id/destinations', BusinessController.getDestinations);
router.get('/:id', BusinessController.getById);
router.patch('/:id/approve', BusinessController.approve);
router.patch('/:id/reject', BusinessController.reject);
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
