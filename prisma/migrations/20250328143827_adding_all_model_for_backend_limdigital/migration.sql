-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(100) NULL,
    `verificationExpires` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `failedLoginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockoutUntil` DATETIME(3) NULL,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,
    `passwordChangedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(36) NOT NULL,
    `sessionToken` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(255) NULL,
    `deviceInfo` VARCHAR(255) NULL,
    `location` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(36) NOT NULL,
    `token` VARCHAR(100) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `nik` VARCHAR(16) NULL,
    `fullName` VARCHAR(100) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `birthPlace` VARCHAR(50) NULL,
    `birthDate` DATETIME(3) NULL,
    `religion` VARCHAR(30) NULL,
    `maritalStatus` ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED') NULL,
    `profession` VARCHAR(50) NULL,
    `photoUrl` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `joinedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_userId_key`(`userId`),
    UNIQUE INDEX `profiles_nik_key`(`nik`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` VARCHAR(36) NOT NULL,
    `street` VARCHAR(255) NOT NULL,
    `village` VARCHAR(50) NULL,
    `district` VARCHAR(50) NULL,
    `regency` VARCHAR(50) NULL,
    `province` VARCHAR(50) NULL,
    `postalCode` VARCHAR(10) NULL,
    `country` VARCHAR(50) NOT NULL DEFAULT 'Indonesia',
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `addresses_profileId_key`(`profileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `educations` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` VARCHAR(36) NOT NULL,
    `institution` VARCHAR(100) NOT NULL,
    `degree` VARCHAR(50) NULL,
    `fieldOfStudy` VARCHAR(50) NULL,
    `startYear` INTEGER NOT NULL,
    `endYear` INTEGER NULL,
    `isAlumni` BOOLEAN NOT NULL DEFAULT false,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` VARCHAR(36) NOT NULL,
    `contactType` ENUM('PHONE', 'EMAIL', 'WHATSAPP', 'TELEGRAM', 'LINE', 'OTHER') NOT NULL,
    `value` VARCHAR(100) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contacts_profileId_contactType_value_key`(`profileId`, `contactType`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_levels` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `description` TEXT NULL,
    `hierarchyLevel` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `organization_levels_name_key`(`name`),
    UNIQUE INDEX `organization_levels_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regions` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `levelId` VARCHAR(36) NOT NULL,
    `parentId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `departments_name_key`(`name`),
    UNIQUE INDEX `departments_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `structures` (
    `id` VARCHAR(36) NOT NULL,
    `regionId` VARCHAR(36) NOT NULL,
    `positionType` ENUM('DEWAN_PENASEHAT', 'PENGURUS_HARIAN', 'PEMBANTU_UMUM', 'BIDANG') NOT NULL,
    `departmentId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Member` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` VARCHAR(36) NOT NULL,
    `structureId` VARCHAR(36) NOT NULL,
    `position` ENUM('KETUA_UMUM', 'KETUA_1', 'KETUA_2', 'KETUA_3', 'KETUA_4', 'KETUA_5', 'SEKRETARIS_UMUM', 'SEKRETARIS_1', 'SEKRETARIS_2', 'SEKRETARIS_3', 'SEKRETARIS_4', 'SEKRETARIS_5', 'BENDAHARA', 'WAKIL_BENDAHARA', 'ANGGOTA') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Member_profileId_structureId_position_startDate_key`(`profileId`, `structureId`, `position`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `position_history` (
    `id` VARCHAR(36) NOT NULL,
    `profileId` VARCHAR(36) NOT NULL,
    `memberId` VARCHAR(36) NULL,
    `positionTitle` VARCHAR(100) NOT NULL,
    `positionLevel` VARCHAR(50) NOT NULL,
    `regionName` VARCHAR(100) NOT NULL,
    `departmentName` VARCHAR(100) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `position_history_profileId_idx`(`profileId`),
    INDEX `position_history_isCurrent_idx`(`isCurrent`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `action` VARCHAR(50) NOT NULL,
    `tableName` VARCHAR(50) NOT NULL,
    `recordId` VARCHAR(36) NOT NULL,
    `oldValues` JSON NULL,
    `newValues` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `message` TEXT NOT NULL,
    `notificationType` ENUM('SYSTEM', 'LETTER_APPROVAL', 'LETTER_SIGNATURE', 'DISPOSITION', 'GENERAL', 'REMINDER', 'ALERT') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `relatedId` VARCHAR(36) NULL,
    `relatedType` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letter_templates` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `letterType` ENUM('ROUTINE', 'REFERENCE', 'CERTIFICATE', 'DECISION', 'ENDORSEMENT', 'INSTRUCTION', 'REQUEST_RESPONSE', 'ASSIGNMENT', 'POWER_OF_ATTORNEY', 'RECOMMENDATION', 'STATEMENT', 'WARNING', 'ANNOUNCEMENT', 'AGREEMENT', 'CIRCULAR') NOT NULL,
    `description` TEXT NULL,
    `htmlContent` TEXT NOT NULL,
    `defaultSubject` VARCHAR(255) NULL,
    `defaultCop` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `letter_templates_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letters` (
    `id` VARCHAR(36) NOT NULL,
    `letterNumber` VARCHAR(50) NULL,
    `letterType` ENUM('ROUTINE', 'REFERENCE', 'CERTIFICATE', 'DECISION', 'ENDORSEMENT', 'INSTRUCTION', 'REQUEST_RESPONSE', 'ASSIGNMENT', 'POWER_OF_ATTORNEY', 'RECOMMENDATION', 'STATEMENT', 'WARNING', 'ANNOUNCEMENT', 'AGREEMENT', 'CIRCULAR') NOT NULL,
    `templateId` VARCHAR(36) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `htmlContent` TEXT NOT NULL,
    `pdfUrl` VARCHAR(255) NULL,
    `regionId` VARCHAR(36) NOT NULL,
    `departmentId` VARCHAR(36) NULL,
    `authorProfileId` VARCHAR(36) NULL,
    `createdById` VARCHAR(36) NULL,
    `status` ENUM('DRAFT', 'WAITING_SECRETARY_REVIEW', 'WAITING_CHAIRMAN_SIGNATURE', 'WAITING_SECRETARY_SIGNATURE', 'COMPLETED', 'REJECTED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `signatureType` ENUM('CHAIRMAN', 'SECRETARY', 'BOTH', 'CHAIRMAN_ONLY') NOT NULL,
    `requiresStamp` BOOLEAN NOT NULL DEFAULT true,
    `isConfidential` BOOLEAN NOT NULL DEFAULT false,
    `letterDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `letters_letterNumber_key`(`letterNumber`),
    INDEX `letters_letterNumber_idx`(`letterNumber`),
    INDEX `letters_status_idx`(`status`),
    INDEX `letters_letterType_idx`(`letterType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipients` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `organization` VARCHAR(100) NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `copies` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `organization` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispositions` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `fromUserId` VARCHAR(36) NULL,
    `fromProfileId` VARCHAR(36) NULL,
    `toUserId` VARCHAR(36) NULL,
    `toProfileId` VARCHAR(36) NULL,
    `notes` TEXT NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachments` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `fileUrl` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `approverId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `level` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REVISED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NULL,
    `approvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `signatures` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `signerId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `role` ENUM('KETUA_UMUM', 'KETUA_1', 'KETUA_2', 'KETUA_3', 'KETUA_4', 'KETUA_5', 'SEKRETARIS_UMUM', 'SEKRETARIS_1', 'SEKRETARIS_2', 'SEKRETARIS_3', 'SEKRETARIS_4', 'SEKRETARIS_5', 'BENDAHARA', 'WAKIL_BENDAHARA', 'ANGGOTA') NOT NULL,
    `signatureImage` VARCHAR(255) NULL,
    `digitalSignature` VARCHAR(255) NULL,
    `signedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stamps` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `stampImage` VARCHAR(255) NOT NULL,
    `stampedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letter_logs` (
    `id` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `details` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letter_number_sequences` (
    `id` VARCHAR(36) NOT NULL,
    `regionCode` VARCHAR(10) NOT NULL,
    `regionId` VARCHAR(36) NULL,
    `letterType` ENUM('ROUTINE', 'REFERENCE', 'CERTIFICATE', 'DECISION', 'ENDORSEMENT', 'INSTRUCTION', 'REQUEST_RESPONSE', 'ASSIGNMENT', 'POWER_OF_ATTORNEY', 'RECOMMENDATION', 'STATEMENT', 'WARNING', 'ANNOUNCEMENT', 'AGREEMENT', 'CIRCULAR') NOT NULL,
    `year` INTEGER NOT NULL,
    `sequence` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `letter_number_sequences_regionCode_letterType_year_key`(`regionCode`, `letterType`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letter_books` (
    `id` VARCHAR(36) NOT NULL,
    `bookNumber` VARCHAR(20) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NULL,
    `regionId` VARCHAR(36) NOT NULL,
    `organizationLevelId` VARCHAR(36) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `letter_books_bookNumber_key`(`bookNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `letter_book_entries` (
    `id` VARCHAR(36) NOT NULL,
    `bookId` VARCHAR(36) NOT NULL,
    `letterId` VARCHAR(36) NOT NULL,
    `entryNumber` INTEGER NOT NULL,
    `entryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `letter_book_entries_bookId_entryNumber_key`(`bookId`, `entryNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `educations` ADD CONSTRAINT `educations_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regions` ADD CONSTRAINT `regions_levelId_fkey` FOREIGN KEY (`levelId`) REFERENCES `organization_levels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regions` ADD CONSTRAINT `regions_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `structures` ADD CONSTRAINT `structures_regionId_fkey` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `structures` ADD CONSTRAINT `structures_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Member` ADD CONSTRAINT `Member_structureId_fkey` FOREIGN KEY (`structureId`) REFERENCES `structures`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `position_history` ADD CONSTRAINT `position_history_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `position_history` ADD CONSTRAINT `position_history_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letter_template_fk` FOREIGN KEY (`templateId`) REFERENCES `letter_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letter_region_fk` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letter_department_fk` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_authorProfileId_fkey` FOREIGN KEY (`authorProfileId`) REFERENCES `profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letters` ADD CONSTRAINT `letters_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipients` ADD CONSTRAINT `recipients_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `copies` ADD CONSTRAINT `copies_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_letter_fk` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_from_user_fk` FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_from_profile_fk` FOREIGN KEY (`fromProfileId`) REFERENCES `profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_to_user_fk` FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispositions` ADD CONSTRAINT `disposition_to_profile_fk` FOREIGN KEY (`toProfileId`) REFERENCES `profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_approverId_fkey` FOREIGN KEY (`approverId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_signerId_fkey` FOREIGN KEY (`signerId`) REFERENCES `profiles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `signatures` ADD CONSTRAINT `signatures_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stamps` ADD CONSTRAINT `stamp_letter_fk` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_logs` ADD CONSTRAINT `letter_logs_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_logs` ADD CONSTRAINT `letter_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_number_sequences` ADD CONSTRAINT `letter_sequence_region_fk` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_books` ADD CONSTRAINT `letter_book_region_fk` FOREIGN KEY (`regionId`) REFERENCES `regions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_books` ADD CONSTRAINT `letter_book_organization_level_fk` FOREIGN KEY (`organizationLevelId`) REFERENCES `organization_levels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_book_entries` ADD CONSTRAINT `letter_book_entries_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `letter_books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `letter_book_entries` ADD CONSTRAINT `letter_book_entries_letterId_fkey` FOREIGN KEY (`letterId`) REFERENCES `letters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
