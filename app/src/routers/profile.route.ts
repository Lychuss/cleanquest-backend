import express from 'express';
import { requireAuth } from '../middlewares/authentication.js';
import { viewProfileController } from '../controllers/profile.controller.js';

const profileRouter = express.Router();

profileRouter.get("/character/profile/view-stats", requireAuth, viewProfileController);

export default profileRouter;