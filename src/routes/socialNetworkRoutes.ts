import { Router } from 'express';
import { SocialNetworkController } from '../controllers/socialNetworkController';

const router = Router();

router.get('/', SocialNetworkController.getAll);
router.get('/:id', SocialNetworkController.getById);
router.post('/', SocialNetworkController.create);
router.put('/:id', SocialNetworkController.update);
router.delete('/:id', SocialNetworkController.remove);

export default router;
