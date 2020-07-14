import { Router } from 'express';
import MatchController from '../controllers/match.controller'
import AuthController from '../controllers/auth.controller'
const MatchRoutes = Router();

MatchRoutes.post('/', [AuthController.validateToken, MatchController.createMatch]);
MatchRoutes.patch('/:id', [AuthController.validateToken, MatchController.resultMatch]);
MatchRoutes.get('/', [AuthController.validateToken, MatchController.getAllMatches]);
MatchRoutes.get('/:id',[AuthController.validateToken, MatchController.getMatchById])

export default MatchRoutes;