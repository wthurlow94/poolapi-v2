import UserRoutes from './userRoutes';
import AuthRoutes from './authRoutes';
import MatchRoutes from './matchRoutes';
import { Router } from 'express';

const routes = Router();

routes.use('/users', UserRoutes);
routes.use('/auth', AuthRoutes);
routes.use('/matches', MatchRoutes);

export default routes;
