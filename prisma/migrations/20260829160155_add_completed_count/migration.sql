/*
  Warnings:

  - You are about to drop the column `characterId` on the `user_quest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_quest" DROP CONSTRAINT "user_quest_characterId_fkey";

-- AlterTable
ALTER TABLE "character" ADD COLUMN     "completed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_quest" DROP COLUMN "characterId";
