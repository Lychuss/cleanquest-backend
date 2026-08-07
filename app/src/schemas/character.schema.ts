import { z } from "zod";

export const characterSchema = z.object({
    ingameName: z.string().max(15)
})

export type CharacterCreation = z.infer<typeof characterSchema>;