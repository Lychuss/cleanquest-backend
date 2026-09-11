import { prisma } from "../../../lib/prisma.js";
import { needToLevelUp } from "../utils/helpers.js";
import { calculateGrowthPower } from "../utils/helpers.js";
import type { RandomQuestList } from "../types/random-quest.js";
import cron from "node-cron";
import {DateTime} from "luxon";
import { ollama } from "../../../lib/ollama.js";

let importantTask: RandomQuestList = [];

const getManilaMidnight = () =>
    DateTime.now().setZone("Asia/Manila").startOf("day").toJSDate();

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

    const now = new Date();
    const manilaDate = getManilaMidnight();

    try {
        return await prisma.$transaction([
            prisma.userQuest.create({
                data: {
                    userId: userId,
                    questId: questId,
                    completedAt: now,
                    completedDate: manilaDate   
                }
            }),
            prisma.character.update({
                where: { userId },
                data: safeUserStats
            })
        ])
    } catch (err: any) {
        if (err.code === "P2002") {
            throw new Error("Quest already completed today");
        }
        throw err;
    }
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

export const updateGrowthPower = async (userId: string) => {

    const data: ComputedGrowth | null = await prisma.character.findUnique({
        where: {
            userId: userId
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
            userId: userId
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
                gte: getManilaMidnight()
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

export const getTotalCompletion = async (userId: string, ) => {
    let kitchen = 0;
    let bedroom = 0;
    let living_room = 0;

    const totalKitchen = await prisma.quest.count({
        where: {
            room: "kitchen"
        }
    });

    const totalBedroom = await prisma.quest.count({
        where: {
            room: "bedroom"
        }
    });

    const totalLivingRoom = await prisma.quest.count({
        where: {
            room: "living_room"
        }
    });

    const quests = await prisma.userQuest.findMany({
        where: {
            userId: userId,
            completedAt: {
                gte: getManilaMidnight()
            }
        },
        include: {
            quest: true
        }
    });

    quests.map((quest: any) => {
        if(quest.quest.room === "kitchen"){
            kitchen++;
        } else if(quest.quest.room === "living_room"){
            living_room++;
        } else {
            bedroom++;
        }
    })

    return {
        kitchen: {
            total: totalKitchen,
            completed: kitchen
        },
        bedroom: {
            total: totalBedroom,
            completed: bedroom
        },
        living_room: {
            total: totalLivingRoom,
            completed: living_room
        }
    }
}

export const allAvailableTask = async (userId: string, place: string) => {
    const completedQuest = await prisma.userQuest.findMany({
        where: {
            userId: userId,
            completedAt: {
                gte: getManilaMidnight()
            }
        }
    })

    const idCompleteQuest = completedQuest.map((quests) => quests.questId);
    
    return await prisma.quest.findMany({
        where: {
            NOT: {
                id: {
                    in: idCompleteQuest
                }
            },
            room: place
        }
    })
}

export const getCompletedTasksByRoom = async (userId: string, place: string) => {
    const completedQuest = await prisma.userQuest.findMany({
        where: {
            userId: userId,
            completedAt: {
                gte: getManilaMidnight()
            }
        }
    })

    const idCompleteQuest = completedQuest.map((quests) => quests.questId);
    
    const data = await prisma.quest.count({
        where: {
                id: {
                    in: idCompleteQuest
                },
            room: place
        }
    })

    const totalQuest = await prisma.quest.count({
        where: {
            room: place
        }
    })

    return {
        data,
        totalQuest
    }
}

export const askOllama = async (image: Base64URLString, questId: string) => {
    const question = await getVerificationPrompt(questId);

    const interaction = await ollama.generate({
        model: "moondream",
        prompt: question?.verificationPrompt! + "Reply only with a YES or NO.",
        images: [image]
    })
    return interaction.response;
}

const getVerificationPrompt = async (questId: string) => {
    return await prisma.quest.findUnique({
        where: {
            id: questId
        },
        select: {
            verificationPrompt: true
        }
    })
}