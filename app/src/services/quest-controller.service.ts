import { prisma } from "../../../lib/prisma.js";
import { needToLevelUp } from "../utils/helpers.js";
import { calculateGrowthPower } from "../utils/helpers.js";

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

interface ComputedGrowth {
    attack: number,
    level: number,
    health: number,
    defense: number,
    critical: number,
    speed: number,
    evasion: number,
    resistance: number, 
    luck: number,
    stamina: number,
}

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
    return await prisma.character.findUnique({
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

export const updateGrowthPower = async (characterId: string) => {

    const data: ComputedGrowth | null = await prisma.character.findUnique({
        where: {
            id: characterId
        },
        select: {
            attack: true,
            health: true,
            defense: true,
            critical: true,
            speed: true,
            evasion: true,
            resistance: true, 
            luck: true,
            stamina: true,
            level: true
        }
    })

    if(!data) {
        throw new Error("An error occured where the data for computed growth is null!");
    }

    const totalBasePower = data.attack + data.health + data.defense + data.evasion + data.luck +
        data.resistance + data.stamina + data.speed + data.critical;

    const growthPower = calculateGrowthPower(totalBasePower, 1.10, data.level);

    return await prisma.character.update({
        where: {
            id: characterId
        },
        data: {
            growth: growthPower
        }
    })
}