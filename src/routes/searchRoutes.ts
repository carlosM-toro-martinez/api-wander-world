import { Router } from 'express';
import { SearchController } from '../controllers/searchController';

const router = Router();

router.get('/popular', SearchController.getPopular);
router.get('/recent', SearchController.getRecent);

export default router;