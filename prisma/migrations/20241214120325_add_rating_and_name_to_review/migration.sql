/*
  Warnings:

  - You are about to alter the column `trust_score` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `name` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trust_score" SET DATA TYPE INTEGER;
