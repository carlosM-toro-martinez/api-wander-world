import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { createImageUpload } from '../middlewares/upload';

const router = Router();

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', createImageUpload('categories', 'image'), CategoryController.create);
router.put('/:id', createImageUpload('categories', 'image'), CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;
