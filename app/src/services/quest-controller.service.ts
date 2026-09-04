import { prisma } from "../../../lib/prisma.js";
import { needToLevelUp } from "../utils/helpers.js";
import { calculateGrowthPower } from "../utils/helpers.js";
import type { RandomQuestList } from "../types/random-quest.js";
import cron from "node-cron";
import {DateTime} from "luxon";

let importantTask: RandomQuestList = [];

const dateToday = DateTime.now().setZone("Asia/Manila").startOf("day").toJSDate();

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

export const completeQuest = async (userId: string, questId: string) => {

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
                    questId: questId,
                    completedAt: new Date()
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

export const recomputeQuest = async (userId: string) => {
    const completedTask = await prisma.userQuest.count({
        where: {
            userId: userId,
            completed: true
        }
    })

    return await prisma.character.update({
        where: {
            userId: userId
        },
        data : {
            completedTask: completedTask
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

export const checkIfAlreadyCompleted = async (randomQuest: RandomQuestList) => {
    const arr = randomQuest;

    const completed = arr.map((quest) => quest.id);

    return await prisma.userQuest.findMany({
        select: {
            questId: true
        },
        where: {
            questId: {
                in: completed
            },
            completed: true,
            completedAt: {
                gte: dateToday
            }
        }
    })
}

export const getRandomImportantTask = async () => {
    importantTask = await prisma.quest.findManyRandom(5, {
        select: {
            id: true,
            title: true
        }
    });
}

export const runItOnceDaily = async () => {
    getRandomImportantTask();

    cron.schedule("0 0 * * *", async () => {
        await getRandomImportantTask();
    }, {
        timezone: "Asia/Manila"
    })
}

export const getTheImportantTask = () =>{
    return importantTask;
}

