import express from 'express';
import { requireAuth } from '../middlewares/authentication.js';
import { createCharacterController } from '../controllers/character.controller.js';

const characterRouter = express.Router();

characterRouter.post("/character/creation", requireAuth, createCharacterController);

export default characterRouter;