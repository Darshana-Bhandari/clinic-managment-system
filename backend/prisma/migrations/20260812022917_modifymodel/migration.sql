/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` MODIFY `token` VARCHAR(768) NOT NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `token` VARCHAR(768) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `phoneNumber`,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ALTER COLUMN `role` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `users_phone_key` ON `users`(`phone`);
