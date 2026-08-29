import type { Request, Response, NextFunction } from 'express';
import { completeQuest, recomputeQuest } from '../services/quest-controller.service.js';
import { completedSchema, type CompletedQuest } from '../schemas/completedquest.schemas.js';
import { updateGrowthPower } from '../services/quest-controller.service.js';

export const questController = async (req: Request, res: Response, next: NextFunction) => {
    const data = completedSchema.safeParse(req?.body);

    if(!data.success) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    try {

        await completeQuest(data.data?.userId, data.data?.questId, data.data?.characterId);

        await recomputeQuest(data.data?.characterId);

        await updateGrowthPower(data.data?.characterId);

        return res.status(200).json({
            message: "Quest Successfully Completed!",
            success: true
        })

    } catch (err) {
        next(err);
    }
}
