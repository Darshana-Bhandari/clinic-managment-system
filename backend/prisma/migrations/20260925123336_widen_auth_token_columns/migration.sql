/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `doctors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `payments` ADD COLUMN `appointmentId` VARCHAR(191) NULL,
    ADD COLUMN `processedBy` VARCHAR(191) NULL,
    MODIFY `billId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `token` VARCHAR(512) NOT NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `token` VARCHAR(512) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `doctors_licenseNumber_key` ON `doctors`(`licenseNumber`);

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_processedBy_fkey` FOREIGN KEY (`processedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
