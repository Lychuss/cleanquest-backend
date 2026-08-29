import { prisma } from "../../../lib/prisma.js";

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
