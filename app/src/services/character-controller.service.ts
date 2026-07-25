import { prisma } from "../../../lib/prisma.js";

export const characterCreation = async (name: string, userId: string) => {
    return await prisma.character.create({
        data: {
            userId: userId,
            ingameName: name
        }
    })
}
