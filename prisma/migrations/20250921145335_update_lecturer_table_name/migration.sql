/*
  Warnings:

  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Department" DROP CONSTRAINT "Department_headId_fkey";

-- DropTable
DROP TABLE "public"."Teacher";

-- CreateTable
CREATE TABLE "public"."Lecturer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lecturer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_email_key" ON "public"."Lecturer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lecturer_username_key" ON "public"."Lecturer"("username");

-- AddForeignKey
ALTER TABLE "public"."Department" ADD CONSTRAINT "Department_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."Lecturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
