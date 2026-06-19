-- CreateTable
CREATE TABLE `inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(36) NOT NULL,
    `carId` VARCHAR(36) NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('New', 'Seen', 'Contacted') NOT NULL DEFAULT 'New',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `inquiries_status_idx`(`status`),
    INDEX `inquiries_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `inquiries_userId_carId_key`(`userId`, `carId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_carId_fkey` FOREIGN KEY (`carId`) REFERENCES `cars`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
