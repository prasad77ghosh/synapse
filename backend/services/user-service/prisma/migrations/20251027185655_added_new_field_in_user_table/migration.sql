/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RegisterType" AS ENUM ('mail', 'phone', 'social');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "registerType" "RegisterType" NOT NULL DEFAULT 'mail';

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
