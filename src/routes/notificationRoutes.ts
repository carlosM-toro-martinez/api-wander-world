import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

router.get('/', NotificationController.getAll);
router.get('/:id', NotificationController.getById);
router.post('/', NotificationController.create);
router.put('/:id', NotificationController.update);
router.delete('/:id', NotificationController.remove);

export default router;
