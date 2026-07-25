import { z } from "zod";

export const statsData = z.object({
  level: z.number(),
  health: z.number(),
  attack: z.number(),
  critical: z.number(),
  speed: z.number(),
  defense: z.number(),
  evasion: z.number(),
  resistance: z.number(),
  luck: z.number(),
  stamina: z.number()
})

export type Stats = z.infer<typeof statsData>;