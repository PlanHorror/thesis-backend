/*
  Warnings:

  - A unique constraint covering the columns `[citizenId]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Lecturer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lecturer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "citizenId" TEXT,
ADD COLUMN     "gender" BOOLEAN,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_citizenId_key" ON "Lecturer"("citizenId");

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_phone_key" ON "Lecturer"("phone");
