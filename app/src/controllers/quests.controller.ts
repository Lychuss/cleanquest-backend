import type { Request, Response, NextFunction } from 'express';
import { completeQuest, getCompletedTasksByRoom, recomputeQuest, askOllama } from '../services/quest-controller.service.js';
import { completedSchema, type CompletedQuest } from '../schemas/completedquest.schemas.js';
import { updateGrowthPower, allAvailableTask } from '../services/quest-controller.service.js';

export const questController = async (req: Request, res: Response, next: NextFunction) => {
    const data = completedSchema.safeParse(req?.body);
    const userId = req.user?.id;

    if(!data.success || !userId) return res.status(404).json({
        message: "User not found!",
        success: false
    })

    try {

        const ollamaAnswer = await askOllama(data?.data.image, data?.data.questId)

        console.log(ollamaAnswer.toUpperCase().trim());
        console.log(ollamaAnswer.toUpperCase().trim() === "NO")

        if(ollamaAnswer.toUpperCase().trim() === "NO"){
            return res.status(400).json({
                message: "Invalid image! You are not doing your task!",
                success: false
            })
        }

        await completeQuest(userId, data.data?.questId);

        await recomputeQuest(userId);

        await updateGrowthPower(userId);

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
        const completedTask = await getCompletedTasksByRoom(userId, place);

        return res.status(200).json({
            message: "Get all the task completed!",
            success: true,
            data: allTask, completedTask
        })
        
    } catch (err){
        next(err);
    }
}
