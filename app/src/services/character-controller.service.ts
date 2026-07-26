import { prisma } from "../../../lib/prisma.js";

export const characterCreation = async (name: string, userId: string) => {
    return await prisma.character.create({
        data: {
            userId: userId,
            ingameName: name
        }
    })
}

export const isNameTaken = async (ingameName: string) => {
    const existing = await prisma.character.findUnique({
        where: {
            ingameName
        }
    });
    return existing !== null;
}

export const characterLevelUp = async (userId: string) => {
    const data = await prisma.character.findUnique({
        where: { userId },
        select: {
            experience: true
        }
    })

    if(!data) return null;

    return data?.experience;
}
