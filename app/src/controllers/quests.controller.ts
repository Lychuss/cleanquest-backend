import type { Request, Response, NextFunction } from 'express';
import { completeQuest } from '../services/stats-controller.service.js';
import { type Stats } from '../schemas/stats.schema.js';

export const questController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const stats: Record<string, number> = req.body?.stats as Stats;
    const questId = req.body?.quest;

    if(!userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    try {

        await completeQuest(userId, questId, stats);

        return res.status(200).json({
            message: "Quest Successfully Completed!",
            success: true
        })

    } catch (err) {
        next(err);
    }
}