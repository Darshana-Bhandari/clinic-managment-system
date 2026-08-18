/*
  Warnings:

  - The values [CANCELED] on the enum `appointments_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `details` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `resource` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to drop the column `email` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `isUsed` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `patients` table. All the data in the column will be lost.
  - The values [Male,Female,others] on the enum `patients_gender` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ipAddress` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revoked` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `lastActivity` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `sessions` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[sessionId]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorId` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptoms` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `otps` required. This step will fail if there are existing NULL values in that column.
  - Made the column `allergies` on table `patients` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sessionId` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `otps` DROP FOREIGN KEY `otps_userId_fkey`;

-- DropIndex
DROP INDEX `refresh_tokens_token_key` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `sessions_token_key` ON `sessions`;

-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `doctorId` VARCHAR(191) NOT NULL,
    ADD COLUMN `symptoms` JSON NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED';

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `details`,
    DROP COLUMN `resource`,
    ADD COLUMN `description` TEXT NULL,
    MODIFY `action` ENUM('LOGIN', 'LOGOUT', 'REGISTER', 'CREATE', 'UPDATE', 'DELETE', 'PASSWORD_CHANGE', 'PASSWORD_RESET') NOT NULL;

-- AlterTable
ALTER TABLE `otps` DROP COLUMN `email`,
    DROP COLUMN `isUsed`,
    DROP COLUMN `otp`,
    ADD COLUMN `attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'LOGIN', 'PHONE_VERIFICATION') NOT NULL,
    MODIFY `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `patients` DROP COLUMN `province`,
    ADD COLUMN `documents` JSON NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    MODIFY `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    MODIFY `allergies` JSON NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `ipAddress`,
    DROP COLUMN `revoked`,
    DROP COLUMN `revokedAt`,
    DROP COLUMN `userAgent`,
    ADD COLUMN `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `token` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `isActive`,
    DROP COLUMN `lastActivity`,
    DROP COLUMN `token`,
    ADD COLUMN `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `sessionId` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatar` VARCHAR(191) NULL,
    MODIFY `role` ENUM('PATIENT', 'DOCTOR', 'ADMIN', 'RECEPTIONIST') NOT NULL DEFAULT 'PATIENT',
    MODIFY `phone` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `doctors` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `qualifications` JSON NOT NULL,
    `experience` INTEGER NULL,
    `hospital` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `consultationFee` DOUBLE NULL,
    `availableDays` JSON NULL,
    `bio` VARCHAR(191) NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `totalReviews` INTEGER NOT NULL DEFAULT 0,
    `certificates` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `doctors_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `appointments_doctorId_idx` ON `appointments`(`doctorId`);

-- CreateIndex
CREATE INDEX `appointments_date_idx` ON `appointments`(`date`);

-- CreateIndex
CREATE INDEX `appointments_status_idx` ON `appointments`(`status`);

-- CreateIndex
CREATE INDEX `audit_logs_action_idx` ON `audit_logs`(`action`);

-- CreateIndex
CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs`(`createdAt`);

-- CreateIndex
CREATE INDEX `otps_expiresAt_idx` ON `otps`(`expiresAt`);

-- CreateIndex
CREATE INDEX `refresh_tokens_expiresAt_idx` ON `refresh_tokens`(`expiresAt`);

-- CreateIndex
CREATE UNIQUE INDEX `sessions_sessionId_key` ON `sessions`(`sessionId`);

-- CreateIndex
CREATE INDEX `sessions_expiresAt_idx` ON `sessions`(`expiresAt`);

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `otps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `doctors` ADD CONSTRAINT `doctors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `doctors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `appointments` RENAME INDEX `appointments_patientId_fkey` TO `appointments_patientId_idx`;

-- RenameIndex
ALTER TABLE `audit_logs` RENAME INDEX `audit_logs_userId_fkey` TO `audit_logs_userId_idx`;

-- RenameIndex
ALTER TABLE `otps` RENAME INDEX `otps_userId_fkey` TO `otps_userId_idx`;

-- RenameIndex
ALTER TABLE `refresh_tokens` RENAME INDEX `refresh_tokens_userId_fkey` TO `refresh_tokens_userId_idx`;

-- RenameIndex
ALTER TABLE `sessions` RENAME INDEX `sessions_userId_fkey` TO `sessions_userId_idx`;
