/*
  Warnings:

  - A unique constraint covering the columns `[ingameName]` on the table `character` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user_quest" ALTER COLUMN "completed" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "character_ingameName_key" ON "character"("ingameName");
