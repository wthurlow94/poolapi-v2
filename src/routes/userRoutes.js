import { Router } from 'express';
import UserController from '../controllers/user.controller'

const UserRoutes = Router();

UserRoutes.get('/', UserController.getAllUsers);
UserRoutes.get('/:_id', UserController.getUserById);


export default UserRoutes;