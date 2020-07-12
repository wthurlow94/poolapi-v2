import UserRoutes from './userRoutes';
import AuthRoutes from './authRoutes';
import { Router } from 'express';

const routes = Router();

routes.use('/users', UserRoutes);
routes.use('/auth', AuthRoutes);

export default routes;
