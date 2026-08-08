ALTER TABLE `Task` ADD COLUMN `deletedAt` DATETIME(3) NULL;

CREATE INDEX `Task_deletedAt_idx` ON `Task`(`deletedAt`);
