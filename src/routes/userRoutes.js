import { Router } from 'express';
import UserController from '../controllers/user.controller'
import AuthController from '../controllers/auth.controller'
const UserRoutes = Router();

UserRoutes.get('/', [AuthController.validateToken, UserController.getAllUsers]);
UserRoutes.get('/:_id', [AuthController.validateToken, UserController.getUserById]);


export default UserRoutes;