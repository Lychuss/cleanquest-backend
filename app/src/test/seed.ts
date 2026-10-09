import { prisma } from "../../../lib/prisma.js";

export async function resetAndSeedTest() {
  await prisma.userQuest.deleteMany();
  await prisma.character.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.rateLimit.deleteMany();
  await prisma.user.deleteMany();
}