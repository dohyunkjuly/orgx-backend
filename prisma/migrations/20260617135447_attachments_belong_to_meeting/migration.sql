/*
  Warnings:

  - You are about to drop the column `meetingMinutesId` on the `meeting_attachments` table. All the data in the column will be lost.
  - Added the required column `meetingId` to the `meeting_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `meeting_attachments` DROP FOREIGN KEY `meeting_attachments_meetingMinutesId_fkey`;

-- DropIndex
DROP INDEX `meeting_attachments_meetingMinutesId_idx` ON `meeting_attachments`;

-- AlterTable
ALTER TABLE `meeting_attachments` DROP COLUMN `meetingMinutesId`,
    ADD COLUMN `meetingId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `meeting_attachments_meetingId_idx` ON `meeting_attachments`(`meetingId`);

-- AddForeignKey
ALTER TABLE `meeting_attachments` ADD CONSTRAINT `meeting_attachments_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `meetings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
