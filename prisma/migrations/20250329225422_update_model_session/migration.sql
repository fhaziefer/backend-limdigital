/*
  Warnings:

  - You are about to drop the column `deviceInfo` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `deviceInfo`,
    DROP COLUMN `location`,
    ADD COLUMN `browser` VARCHAR(100) NULL,
    ADD COLUMN `deviceType` VARCHAR(255) NULL,
    ADD COLUMN `os` VARCHAR(100) NULL;
