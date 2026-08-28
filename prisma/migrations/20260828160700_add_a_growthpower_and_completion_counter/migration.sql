/*
  Warnings:

  - Added the required column `characterId` to the `user_quest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "character" ADD COLUMN     "growth" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_quest" ADD COLUMN     "characterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "user_quest" ADD CONSTRAINT "user_quest_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
