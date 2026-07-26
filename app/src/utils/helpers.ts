import { characterLevelUp } from "../services/character-controller.service.js";

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