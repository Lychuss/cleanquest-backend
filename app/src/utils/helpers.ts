import { prisma } from "../../../lib/prisma.js";

export const isNameTaken = async (ingameName: string) => {
    const existing = await prisma.character.findUnique({
        where: {
            ingameName
        }
    });
    return existing !== null;
}