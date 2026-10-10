import express from 'express';
import { requireAuth } from '../middlewares/authentication.js';
import { createCharacterController } from '../controllers/character.controller.js';

import apiLimiter from '../middlewares/rate-limiting.js';
import { cache } from '../middlewares/cache.js';

const characterRouter = express.Router();

characterRouter.post("/character/creation", requireAuth, apiLimiter, createCharacterController);

export default characterRouter;