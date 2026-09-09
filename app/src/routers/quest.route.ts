import express from 'express';
import { questController, availableQuestController } from '../controllers/quests.controller.js';
import { requireAuth } from '../middlewares/authentication.js';

const questRouter = express.Router();

questRouter.put("/quest/completed-quest", requireAuth, questController);
questRouter.get("/quest/available-task/:place", requireAuth, availableQuestController);

export default questRouter;