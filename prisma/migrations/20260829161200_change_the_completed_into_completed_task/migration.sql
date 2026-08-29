/*
  Warnings:

  - You are about to drop the column `completed` on the `character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "character" DROP COLUMN "completed",
ADD COLUMN     "completedTask" INTEGER NOT NULL DEFAULT 0;
