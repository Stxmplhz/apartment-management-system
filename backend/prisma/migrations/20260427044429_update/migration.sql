/*
  Warnings:

  - Added the required column `firstName` to the `Technician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Technician` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Technician` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Technician" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL;
