import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.get('/', NotificationController.getAll);
router.put('/read-all', NotificationController.markAllAsRead);
router.get('/:id', NotificationController.getById);
router.post('/', NotificationController.create);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/:id', NotificationController.update);
router.delete('/:id', NotificationController.remove);

export default router;
