import { prisma } from "../../../lib/prisma.js";
import type { RandomQuestList } from "../types/random-quest.js";
import cron from "node-cron";

let importantTask: RandomQuestList = [];

export const getCharacterData = async (id: string) => {
    const userStats = await prisma.character.findUnique(
        {
            where: {
                userId: id
            }
        }
    );

    if(!userStats) {
        return null;
    }

    const { createdAt, ...characterData } = userStats;

    return characterData;   
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

export const checkIfAlreadyCompleted = async (randomQuest: RandomQuestList) => {
    const arr = randomQuest;

    const completed = arr.map((quest) => quest.id);

    console.log(completed);

    return await prisma.userQuest.findMany({
        select: {
            questId: true
        },
        where: {
            questId: {
                in: completed
            },
            completed: true
        }
    })
}