import express from 'express';
import destinationRoutes from './destinationRoutes';
import categoryRoutes from './categoryRoutes';
import profileRoutes from './profileRoutes';
import notificationRoutes from './notificationRoutes';
import tripRoutes from './tripRoutes';
import searchRoutes from './searchRoutes';
import authRoutes from './authRoutes';
import sectionRoutes from './sectionRoutes';
import businessRoutes from './businessRoutes';
import adminRoutes from './adminRoutes';
import socialNetworkRoutes from './socialNetworkRoutes';
import promotionRoutes from './promotionRoutes';
import productRoutes from './productRoutes';
import openingHoursRoutes from './openingHoursRoutes';
import imageRoutes from './imageRoutes';
import favoriteRoutes from './favoriteRoutes';
import bookingRoutes from './bookingRoutes';
import paymentMethodRoutes from './paymentMethodRoutes';
import paymentRoutes from './paymentRoutes';
import { authMiddleware } from '../middlewares/auth';
import { BookingController } from '../controllers/bookingController';
import { ProfileController } from '../controllers/profileController';
import { createImageFieldsUpload } from '../middlewares/upload';

function router(app: express.Application) {
  const routes = express.Router();
  app.use('/api/v1', routes);

  routes.use('/auth', authRoutes);
  routes.use('/sessions', authRoutes);
  //routes.use(authMiddleware);
  routes.use('/destinations', destinationRoutes);
  routes.use('/categories', categoryRoutes);
  routes.get('/profile', ProfileController.getCurrent);
  routes.put(
    '/profile',
    createImageFieldsUpload('profiles', ['avatar', 'image']),
    ProfileController.updateCurrent,
  );
  routes.use('/profiles', profileRoutes);
  routes.use('/notifications', notificationRoutes);
  routes.use('/trips', tripRoutes);
  routes.use('/searches', searchRoutes);
  routes.use('/sections', sectionRoutes);
  routes.use('/businesses', businessRoutes);
  routes.use('/admins', adminRoutes);
  routes.use('/social-networks', socialNetworkRoutes);
  routes.use('/promotions', promotionRoutes);
  routes.use('/products', productRoutes);
  routes.use('/opening-hours', openingHoursRoutes);
  routes.use('/images', imageRoutes);
  routes.use('/favorites', favoriteRoutes);
  routes.use('/bookings', bookingRoutes);
  routes.use('/payment-methods', paymentMethodRoutes);
  routes.use('/payments', paymentRoutes);
  routes.get('/users/:userId/trips', BookingController.getMyTrips);
}

export default router;
