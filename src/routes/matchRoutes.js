import { Router } from 'express';
import MatchController from '../controllers/match.controller'

const MatchRoutes = Router();

MatchRoutes.post('/', MatchController.createMatch);
MatchRoutes.patch('/:id', MatchController.resultMatch);

export default MatchRoutes;