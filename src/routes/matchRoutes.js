import { Router } from 'express';
import MatchController from '../controllers/match.controller'

const MatchRoutes = Router();

MatchRoutes.post('/', MatchController.createMatch);

export default MatchRoutes;