/*
  Warnings:

  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_renterId_fkey";

-- DropTable
DROP TABLE "Review";

-- CreateTable
CREATE TABLE "ItemReview" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "renterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenterReview" (
    "id" SERIAL NOT NULL,
    "trustScore" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "renterId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenterReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemReview" ADD CONSTRAINT "ItemReview_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemReview" ADD CONSTRAINT "ItemReview_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterReview" ADD CONSTRAINT "RenterReview_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenterReview" ADD CONSTRAINT "RenterReview_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
