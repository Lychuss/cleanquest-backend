import express from 'express';
import { questController } from '../controllers/quests.controller.js';
import { requireAuth } from '../middlewares/authentication.js';

const questRouter = express.Router();

questRouter.put("/quest/completed-quest", requireAuth, questController);

export default questRouter;