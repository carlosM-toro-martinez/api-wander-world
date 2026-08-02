import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();

router.get('/my-trips', BookingController.getMyTrips);
router.get('/', BookingController.getAll);
router.get('/:id', BookingController.getById);
router.post('/', BookingController.create);
router.put('/:id/cancel', BookingController.cancel);

export default router;
