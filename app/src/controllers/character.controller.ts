import type { Request, Response, NextFunction } from 'express';
import { type CharacterCreation } from '../schemas/character.schema.js';
import { isNameTaken } from '../services/character-controller.service.js';
import { characterCreation } from '../services/character-controller.service.js';

export const createCharacterController = async (req:Request, res:Response, next:NextFunction) => {
    const userId = req.user?.id;
    console.log(userId);
    const { ingameName } = req.body as CharacterCreation;
    const checkNameIfTaken = await isNameTaken(ingameName);

    if(!userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    if (ingameName.trim().length === 0) return res.status(400).json({
        message: "You must enter a username!",
        success: false
    })

    if(checkNameIfTaken) return res.status(400).json({
        message: "Name is already taken!",
        success: false
    })

    try {

        await characterCreation(ingameName, userId);

        return res.status(200).json({
            message: "Welcome Summoner!",
            success: true
        });

    } catch (err) {
        next(err);
    }
}