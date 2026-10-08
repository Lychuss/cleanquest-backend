import express from 'express';
import { questController, availableQuestController } from '../controllers/quests.controller.js';
import { requireAuth } from '../middlewares/authentication.js';

import apiLimiter from '../middlewares/rate-limiting.js';
import { cache } from '../middlewares/cache.js';

const questRouter = express.Router();

questRouter.put("/quest/completed-quest", apiLimiter, cache(300), requireAuth, questController);
questRouter.get("/quest/available-task/:place", apiLimiter, cache(300), requireAuth, availableQuestController);

export default questRouter;