import { Router } from 'express';
import { ImageController } from '../controllers/imageController';
import { createImageUpload } from '../middlewares/upload';

const router = Router();

router.get('/', ImageController.getAll);
router.get('/:id', ImageController.getById);
router.post('/', createImageUpload('images', 'image'), ImageController.create);
router.put('/:id', createImageUpload('images', 'image'), ImageController.update);
router.delete('/:id', ImageController.remove);

export default router;
