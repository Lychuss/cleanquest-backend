/*
  Warnings:

  - A unique constraint covering the columns `[userId,questId,completedDate]` on the table `user_quest` will be added. If there are existing duplicate values, this will fail.
  - Made the column `completedAt` on table `user_quest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "user_quest_userId_questId_key";

-- AlterTable
ALTER TABLE "user_quest" ADD COLUMN     "completedDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "completedAt" SET NOT NULL,
ALTER COLUMN "completedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "user_quest_userId_questId_completedDate_key" ON "user_quest"("userId", "questId", "completedDate");
