/*
  Warnings:

  - A unique constraint covering the columns `[pagbankCheckoutId]` on the table `Orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Orders` ADD COLUMN `pagbankCheckoutId` VARCHAR(191) NULL,
    ADD COLUMN `pagbankCheckoutUrl` TEXT NULL,
    ADD COLUMN `pagbankPaymentStatus` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Orders_pagbankCheckoutId_key` ON `Orders`(`pagbankCheckoutId`);
