import { z } from "zod";

export const completedSchema = z.object({
    characterId: z.string(),
    questId: z.string(),
    userId: z.string()
})

export type CompletedQuest = z.infer<typeof completedSchema>;