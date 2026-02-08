import { Router } from 'express';
import { AdminController } from '../controllers/adminController';

const router = Router();

router.get('/', AdminController.getAll);
router.get('/:id', AdminController.getById);
router.post('/', AdminController.create);
router.put('/:id', AdminController.update);
router.delete('/:id', AdminController.remove);

export default router;
