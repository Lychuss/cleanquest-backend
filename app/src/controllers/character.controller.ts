import type { Request, Response, NextFunction } from 'express';
import { characterSchema } from '../schemas/character.schema.js';
import { isNameTaken } from '../services/character-controller.service.js';
import { characterCreation } from '../services/character-controller.service.js';

export const createCharacterController = async (req:Request, res:Response, next:NextFunction) => {
    const userId = req.user?.id;
    const result = characterSchema.safeParse(req.body);

    if(!result.success){
        return res.status(401).json({
            message: "The character name must be 15 max length",
            success: false
        })
    }

    if(!userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    if (result.data.ingameName.trim().length === 0) return res.status(400).json({
        message: "You must enter a username!",
        success: false
    })

    const checkNameIfTaken = await isNameTaken(result.data.ingameName);

    if(checkNameIfTaken) return res.status(400).json({
        message: "Name is already taken!",
        success: false
    })

    try {

        await characterCreation(result.data.ingameName, userId);

        return res.status(200).json({
            message: "Welcome Summoner!",
            success: true
        });

    } catch (err) {
        next(err);
    }
}