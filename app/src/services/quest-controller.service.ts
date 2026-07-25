import { prisma } from "../../../lib/prisma.js";

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
    "stamina",
    "experience"
]

export const completeQuest = async (userId: string, questId: string) => {

    const quest = await prisma.quest.findUnique({
        where: {
            id: questId
        }
    });

    if (!quest) {
        throw new Error("Quest not found");
    }

    const rewards = quest.rewards as Record<string, number>;
    
    const safeUserStats: Record<string, { increment: number }> = {};

    for(const key of ALLOWED_STATS){

        const checkValue = rewards[key];

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
                where: { userId },
                data: safeUserStats
            }
        )
    ])
}