/*
  Warnings:

  - You are about to drop the column `name` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `user` on the `Review` table. All the data in the column will be lost.
  - Added the required column `renterId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trustScore` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "name",
DROP COLUMN "rating",
DROP COLUMN "user",
ADD COLUMN     "renterId" INTEGER NOT NULL,
ADD COLUMN     "trustScore" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "trust_score" SET DATA TYPE DOUBLE PRECISION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
