import express from 'express';
import { requireAuth } from '../middlewares/authentication.js';
import { viewProfileController } from '../controllers/profile.controller.js';

import apiLimiter from '../middlewares/rate-limiting.js';
import { cache } from '../middlewares/cache.js';

const profileRouter = express.Router();

profileRouter.get("/character/profile/:userId/view-stats", apiLimiter, cache(300), requireAuth, viewProfileController);

export default profileRouter;