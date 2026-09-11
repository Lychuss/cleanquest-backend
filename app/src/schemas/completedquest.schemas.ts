import { z } from "zod";

export const completedSchema = z.object({
    questId: z.string(),
    image: z.base64()
})

export type CompletedQuest = z.infer<typeof completedSchema>;