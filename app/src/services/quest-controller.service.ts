import { prisma } from "../../../lib/prisma.js";
import { needToLevelUp } from "../utils/helpers.js";

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

export const completeQuest = async (userId: string, questId: string, characterId: string) => {

    const quest = await prisma.quest.findUnique({
        where: {
            id: questId
        }
    });

    if (!quest || !quest.rewards) {
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
    
    const questExperience = rewards["experience"];

    if(!questExperience) throw Error("Quest Experience is undefined!");

    const checkLevelUp = await needToLevelUp(userId, questExperience);

    if(checkLevelUp.levelup){
        safeUserStats["level"] = { increment: 1 }

       safeUserStats["experience"] ={ increment: -(checkLevelUp.calculatedExperience) }
    }

    return await prisma.$transaction([
        prisma.userQuest.create(
            {
                data: {
                    userId: userId,
                    characterId: characterId,
                    questId: questId
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

export const recomputeQuest = async (characterId: string) => {
    await prisma.character.findUnique({
        where: {
            id: characterId
        },
        include: {
            _count: {
                select: {
                    completed: true
                }
            }
        }
    })
}