/*
  Warnings:

  - Added the required column `verificationPrompt` to the `quest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quest" ADD COLUMN     "verificationPrompt" TEXT NOT NULL;
