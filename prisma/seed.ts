import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });

// Base XP per difficulty tier
const DIFFICULTY_XP: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
};

// Extra XP bonus per room (e.g. messier/harder rooms give a bit more)
const ROOM_XP_BONUS: Record<string, number> = {
  living_room: 0,
  kitchen: 3,
  bedroom: 0,
  bathroom: 5,
  dining_room: 2,
  entryway: 0,
};

const getExperience = (difficulty: string, room: string) => {
  const base = DIFFICULTY_XP[difficulty] ?? 10;
  const bonus = ROOM_XP_BONUS[room] ?? 0;
  return base + bonus;
};

const quests = [
  { key: "dust_buster", title: "Dust Buster", room: "living_room", difficulty: "easy",
    rewards: { attack: 5, speed: 2 } },
  { key: "floor_sweep", title: "Floor Sweep", room: "living_room", difficulty: "medium",
    rewards: { stamina: 8, defense: 3 } },
  { key: "clutter_clear", title: "Clutter Clear", room: "living_room", difficulty: "hard",
    rewards: { luck: 10, evasion: 4, speed: 3 } },

  // KITCHEN
  { key: "dish_duty", title: "Dish Duty", room: "kitchen", difficulty: "easy",
    rewards: { attack: 4, critical: 2 } },
  { key: "counter_clean_up", title: "Counter Clean-Up", room: "kitchen", difficulty: "medium",
    rewards: { resistance: 6, defense: 4 } },
  { key: "fridge_patrol", title: "Fridge Patrol", room: "kitchen", difficulty: "hard",
    rewards: { stamina: 9, luck: 5, critical: 3 } },

  // BEDROOM
  { key: "bed_making", title: "Bed Making", room: "bedroom", difficulty: "easy",
    rewards: { defense: 5, evasion: 2 } },
  { key: "laundry_fold", title: "Laundry Fold", room: "bedroom", difficulty: "medium",
    rewards: { speed: 7, stamina: 4 } },
  { key: "closet_organize", title: "Closet Organize", room: "bedroom", difficulty: "hard",
    rewards: { critical: 6, luck: 4, attack: 3 } },

  // BATHROOM
  { key: "sink_scrub", title: "Sink Scrub", room: "bathroom", difficulty: "easy",
    rewards: { resistance: 5, critical: 2 } },
  { key: "toilet_clean", title: "Toilet Clean", room: "bathroom", difficulty: "medium",
    rewards: { defense: 8, resistance: 3 } },
  { key: "shower_degrime", title: "Shower Degrime", room: "bathroom", difficulty: "hard",
    rewards: { stamina: 10, evasion: 5, defense: 2 } },

  // DINING ROOM
  { key: "table_wipe", title: "Table Wipe", room: "dining_room", difficulty: "easy",
    rewards: { speed: 4, luck: 2 } },
  { key: "chair_align", title: "Chair Align", room: "dining_room", difficulty: "medium",
    rewards: { evasion: 6, attack: 3 } },
  { key: "cabinet_organize", title: "Cabinet Organize", room: "dining_room", difficulty: "hard",
    rewards: { critical: 7, stamina: 5, luck: 3 } },

  // ENTRYWAY
  { key: "shoe_rack_tidy", title: "Shoe Rack Tidy", room: "entryway", difficulty: "easy",
    rewards: { evasion: 3, speed: 3 } },
  { key: "coat_hang", title: "Coat Hang", room: "entryway", difficulty: "medium",
    rewards: { luck: 6, defense: 3 } },
  { key: "welcome_mat_clean", title: "Welcome Mat Clean", room: "entryway", difficulty: "hard",
    rewards: { attack: 6, resistance: 4, stamina: 3 } },
];

await prisma.quest.deleteMany();

await prisma.quest.createMany({
  data: quests.map((quest) => ({
    ...quest,
    rewards: {
      ...quest.rewards,
      experience: getExperience(quest.difficulty, quest.room),
    },
  })),
});