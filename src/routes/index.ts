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
import { authMiddleware } from '../middlewares/auth';

function router(app: express.Application) {
  const routes = express.Router();
  app.use('/api/v1', routes);

  routes.use('/auth', authRoutes);
  routes.use('/sessions', authRoutes);
  //routes.use(authMiddleware);
  routes.use('/destinations', destinationRoutes);
  routes.use('/categories', categoryRoutes);
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
}

export default router;
