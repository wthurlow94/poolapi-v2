import { Router } from 'express';
import UserController from '../controllers/user.controller'

const UserRoutes = Router();

UserRoutes.get('/', UserController.getAllUsers);


export default UserRoutes;