import type { Request, Response, NextFunction } from 'express';
import { completeQuest } from '../services/quest-controller.service.js';

export const questController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const questId = req.params?.questId;

    if(!userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    if(typeof questId !== "string") return res.status(404).json({
        message: "Quest not found!",
        success: false
    })

    try {

        await completeQuest(userId, questId);

        return res.status(200).json({
            message: "Quest Successfully Completed!",
            success: true
        })

    } catch (err) {
        next(err);
    }
}