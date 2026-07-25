import { prisma } from "../../../lib/prisma.js";
import { type Stats } from "../schemas/stats.schema.js";

const ALLOWED_STATS = [
    "experience",
    "health",
    "attack",
    "critical",
    "speed",
    "defense",
    "evasion",
    "resistance",
    "luck",
    "stamina"
]

export const completeQuest = async (userId: string, questId: string, stats: Record<string, number>) => {
    
    const safeUserStats: Record<string, { increment: number }> = {};

    for(const key of ALLOWED_STATS){

        const checkValue = stats[key];

        if(typeof checkValue === "number"){
            safeUserStats[key] = { increment: checkValue };
        }
    }

    return await prisma.$transaction([
        prisma.userQuest.create(
            {
                data: {
                    userId, questId
                }
            }
        ),
        prisma.character.update(
            {
                where: { userId: userId },
                data: safeUserStats
            }
        )
    ])
}