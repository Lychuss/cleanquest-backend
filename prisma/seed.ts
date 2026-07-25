import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.quest.createMany({
    data: [
      { key: "dust_buster", title: "Dust Buster", room: "living_room", difficulty: "easy", rewards: { attack: 5, speed: 2, critical: 1 } },
      { key: "floor_sweep", title: "Floor Sweep", room: "living_room", difficulty: "medium", rewards: { attack: 10, speed: 5, critical: 2 } },
      { key: "dish_duty", title: "Dish Duty", room: "kitchen", difficulty: "easy", rewards: { attack: 8, speed: 1, critical: 0 } },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });