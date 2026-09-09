import type { Request, Response, NextFunction } from 'express';
import { completeQuest, recomputeQuest } from '../services/quest-controller.service.js';
import { completedSchema, type CompletedQuest } from '../schemas/completedquest.schemas.js';
import { updateGrowthPower, allAvailableTask } from '../services/quest-controller.service.js';
import { success } from 'zod';

export const questController = async (req: Request, res: Response, next: NextFunction) => {
    const data = completedSchema.safeParse(req?.body);
    const userId = req.user?.id;

    if(!data.success || !userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    try {

        await completeQuest(userId, data.data?.questId);

        await recomputeQuest(userId);

        await updateGrowthPower(data.data?.characterId);

        return res.status(200).json({
            message: "Quest Successfully Completed!",
            success: true
        })

    } catch (err) {
        next(err);
    }
}

export const availableQuestController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { place } = req.params as { place: string };

    if(!userId || !place) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    try {
        const allTask = await allAvailableTask(userId, place);

        return res.status(200).json({
            message: "Get all the task completed!",
            success: true,
            data: allTask
        })
    } catch (err){
        next(err);
    }
}
