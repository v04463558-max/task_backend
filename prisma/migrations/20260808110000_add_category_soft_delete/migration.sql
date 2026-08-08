ALTER TABLE `Category` ADD COLUMN `deletedAt` DATETIME(3) NULL;

CREATE INDEX `Category_deletedAt_idx` ON `Category`(`deletedAt`);
