/*
  Warnings:

  - You are about to drop the column `description` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to drop the column `attempts` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `otps` table. All the data in the column will be lost.
  - The values [LOGIN,PHONE_VERIFICATION] on the enum `otps_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isRevoked` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[headDoctorId]` on the table `departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `resource` to the `audit_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otp` to the `otps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `medical_records` DROP FOREIGN KEY `medical_records_appointmentId_fkey`;

-- DropForeignKey
ALTER TABLE `otps` DROP FOREIGN KEY `otps_userId_fkey`;

-- DropIndex
DROP INDEX `appointments_date_idx` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_status_idx` ON `appointments`;

-- DropIndex
DROP INDEX `audit_logs_action_idx` ON `audit_logs`;

-- DropIndex
DROP INDEX `audit_logs_createdAt_idx` ON `audit_logs`;

-- DropIndex
DROP INDEX `medical_records_appointmentId_key` ON `medical_records`;

-- DropIndex
DROP INDEX `otps_expiresAt_idx` ON `otps`;

-- DropIndex
DROP INDEX `otps_userId_idx` ON `otps`;

-- DropIndex
DROP INDEX `refresh_tokens_expiresAt_idx` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `sessions_expiresAt_idx` ON `sessions`;

-- DropIndex
DROP INDEX `sessions_sessionId_key` ON `sessions`;

-- DropIndex
DROP INDEX `users_phone_key` ON `users`;

-- AlterTable
ALTER TABLE `appointments` MODIFY `symptoms` JSON NULL;

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `description`,
    ADD COLUMN `details` JSON NULL,
    ADD COLUMN `resource` VARCHAR(191) NOT NULL,
    MODIFY `action` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `bills` MODIFY `paymentMethod` ENUM('ESEWA', 'KHALTI', 'CASH') NULL;

-- AlterTable
ALTER TABLE `doctors` ADD COLUMN `certificates` JSON NULL,
    MODIFY `qualifications` JSON NULL;

-- AlterTable
ALTER TABLE `medical_records` MODIFY `symptoms` JSON NULL;

-- AlterTable
ALTER TABLE `otps` DROP COLUMN `attempts`,
    DROP COLUMN `code`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `verified`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `isUsed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `otp` VARCHAR(191) NOT NULL,
    MODIFY `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
    MODIFY `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `patients` MODIFY `allergies` JSON NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `method` ENUM('ESEWA', 'KHALTI', 'CASH') NOT NULL;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `isRevoked`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `revoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revokedAt` DATETIME(3) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL,
    MODIFY `token` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `lastActiveAt`,
    DROP COLUMN `sessionId`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `token` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST') NOT NULL DEFAULT 'PATIENT';

-- CreateIndex
CREATE UNIQUE INDEX `departments_headDoctorId_key` ON `departments`(`headDoctorId`);

-- CreateIndex
CREATE UNIQUE INDEX `refresh_tokens_token_key` ON `refresh_tokens`(`token`);

-- CreateIndex
CREATE UNIQUE INDEX `sessions_token_key` ON `sessions`(`token`);

-- AddForeignKey
ALTER TABLE `medical_records` ADD CONSTRAINT `medical_records_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otps` ADD CONSTRAINT `otps_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
