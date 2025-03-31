/*
  Warnings:

  - You are about to alter the column `letterId` on the `approvals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `attachments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `copies` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `dispositions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `letter_book_entries` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `letter_logs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `letter_templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `letter_templates` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `letters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `letters` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `templateId` on the `letters` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `password_reset_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `password_reset_tokens` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `position_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `position_history` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `recipients` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `signatures` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.
  - You are about to alter the column `letterId` on the `stamps` table. The data in that column could be lost. The data in that column will be cast from `VarChar(36)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `approvals` DROP FOREIGN KEY `approvals_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `attachments` DROP FOREIGN KEY `attachments_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `copies` DROP FOREIGN KEY `copies_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `dispositions` DROP FOREIGN KEY `disposition_letter_fk`;

-- DropForeignKey
ALTER TABLE `letter_book_entries` DROP FOREIGN KEY `letter_book_entries_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `letter_logs` DROP FOREIGN KEY `letter_logs_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `letters` DROP FOREIGN KEY `letter_template_fk`;

-- DropForeignKey
ALTER TABLE `recipients` DROP FOREIGN KEY `recipients_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `signatures` DROP FOREIGN KEY `signatures_letterId_fkey`;

-- DropForeignKey
ALTER TABLE `stamps` DROP FOREIGN KEY `stamp_letter_fk`;

-- DropIndex
DROP INDEX `approvals_letterId_fkey` ON `approvals`;

-- DropIndex
DROP INDEX `attachments_letterId_fkey` ON `attachments`;

-- DropIndex
DROP INDEX `copies_letterId_fkey` ON `copies`;

-- DropIndex
DROP INDEX `disposition_letter_fk` ON `dispositions`;

-- DropIndex
DROP INDEX `letter_book_entries_letterId_fkey` ON `letter_book_entries`;

-- DropIndex
DROP INDEX `letter_logs_letterId_fkey` ON `letter_logs`;

-- DropIndex
DROP INDEX `letter_template_fk` ON `letters`;

-- DropIndex
DROP INDEX `recipients_letterId_fkey` ON `recipients`;

-- DropIndex
DROP INDEX `signatures_letterId_fkey` ON `signatures`;

-- DropIndex
DROP INDEX `stamp_letter_fk` ON `stamps`;

-- AlterTable
ALTER TABLE `approvals` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `attachments` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `audit_logs` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `copies` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `dispositions` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `letter_book_entries` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `letter_logs` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `letter_templates` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `letters` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `templateId` INTEGER NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notifications` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `password_reset_tokens` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `position_history` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `recipients` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `sessions` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `signatures` MODIFY `letterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `stamps` MODIFY `letterId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letter_template_fk` FOREIGN KEY (`templateId`) REFERENCES `letter_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipients` ADD CONSTRAINT `recipients_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `copies` ADD CONSTRAINT `copies_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_letter_fk` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stamps` ADD CONSTRAINT `stamp_letter_fk` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_logs` ADD CONSTRAINT `letter_logs_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_book_entries` ADD CONSTRAINT `letter_book_entries_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
