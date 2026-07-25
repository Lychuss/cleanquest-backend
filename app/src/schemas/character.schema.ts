import { z } from "zod";

export const characterCreation = z.object({
    ingameName: z.string().max(15)
})

export type CharacterCreation = z.infer<typeof characterCreation>;