import { success } from "zod";
import { characterLevelUp } from "../services/character-controller.service.js";
import type { CompleteQuestList, RandomQuestList } from "../types/random-quest.js";

type LevelUp = {
    levelup: boolean,
    calculatedExperience: number
}

const checkCharacterExperience = (currentExperience: number, questExperience: number): LevelUp => {
    if(currentExperience + questExperience > 100){
        return { levelup: true, calculatedExperience: currentExperience - ((currentExperience + questExperience) - 100) };
    }

    return { levelup: false,  calculatedExperience: currentExperience + questExperience};
}

export const needToLevelUp = async (userId: string, questExperience: number): Promise<LevelUp> => {
    
    const currentExperience = await characterLevelUp(userId);

    if(!currentExperience) throw Error("The function need to level up, returns null");

    const data = checkCharacterExperience(currentExperience, questExperience);

    return data;
}

//baseAttack * Math.pow(multiplier, level - 1);
export const calculateGrowthPower = (baseTotalPower: number, multiplier: number, level: number) => {
    return baseTotalPower * Math.pow(multiplier, level - 1);
}

export const createAnObjectForCompletedTask = (importantTask: RandomQuestList, completedTask: CompleteQuestList) => {
    const data = [];

    for(let i = 0; i < importantTask.length; i++){
        let check = false;
        for(let j = 0; j < completedTask.length; j++){
            if(importantTask[i]?.id == completedTask[j]?.questId){
                check = true;
            }
        }
        if(check){
            data.push({ title: importantTask[i]?.title, success: true})
        } else {
            data.push({ title: importantTask[i]?.title, success: false})
        }
    }

    return data;
}