-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'DOCTOR', 'PATIENT', 'string', 'RECEPTIONIST') NOT NULL;

-- CreateTable
CREATE TABLE `patients` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` ENUM('Male', 'Female', 'others') NULL,
    `bloodGroup` VARCHAR(191) NULL,
    `allergies` VARCHAR(191) NULL,
    `medicalHistory` JSON NULL,
    `emergencyContact` JSON NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `province` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `zipCode` VARCHAR(191) NULL,
    `insuranceProvider` VARCHAR(191) NULL,
    `insuranceNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `patients_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appointments` (
    `id` VARCHAR(191) NOT NULL,
    `patientId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'RESCHEDULED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    `type` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `prescription` VARCHAR(191) NULL,
    `diagnosis` VARCHAR(191) NULL,
    `followUpDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_patientId_fkey` FOREIGN KEY (`patientId`) REFERENCES `patients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
