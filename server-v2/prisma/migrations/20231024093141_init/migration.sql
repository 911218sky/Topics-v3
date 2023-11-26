-- CreateTable
CREATE TABLE `User` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `appellation` TINYTEXT NOT NULL,
    `userName` TINYTEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` TINYTEXT NOT NULL,
    `imgId` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'DOCTOR') NOT NULL DEFAULT 'USER',
    `verify` BOOLEAN NOT NULL DEFAULT false,
    `firebaseCloudMessagingToken` TINYTEXT NULL,
    `other` JSON NULL,
    `isDoneMenu` JSON NULL,
    `doctorId` MEDIUMINT UNSIGNED NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    FULLTEXT INDEX `User_userName_idx`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Form` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `authorId` MEDIUMINT UNSIGNED NOT NULL,
    `formName` VARCHAR(191) NOT NULL,
    `isSingleChoice` BOOLEAN NOT NULL,
    `isRandomized` BOOLEAN NOT NULL,
    `questions` JSON NOT NULL,
    `correctAnswer` JSON NOT NULL,
    `key` TINYBLOB NOT NULL,
    `iv` TINYBLOB NOT NULL,
    `formCreateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Form_formCreateTime_key`(`formCreateTime` DESC),
    FULLTEXT INDEX `Form_formName_idx`(`formName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistoryForm` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `score` TINYINT NOT NULL,
    `userId` MEDIUMINT UNSIGNED NOT NULL,
    `formName` VARCHAR(191) NOT NULL,
    `formId` MEDIUMINT UNSIGNED NOT NULL,
    `historyFormCreateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `errorQuestionIndex` VARCHAR(191) NOT NULL,
    `errorAnswerIndexs` VARCHAR(191) NOT NULL,
    `formQuestAnswerIndex` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `HistoryForm_historyFormCreateTime_key`(`historyFormCreateTime` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Menu` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `menuName` VARCHAR(191) NOT NULL,
    `menuContent` MEDIUMTEXT NOT NULL,
    `menuUsageCount` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `menuFavorite` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `gameOrderId` JSON NOT NULL,
    `gameDifficulty` JSON NOT NULL,
    `menuCreateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `totalTime` MEDIUMINT UNSIGNED NOT NULL,
    `authorId` MEDIUMINT UNSIGNED NULL,

    UNIQUE INDEX `Menu_menuCreateTime_key`(`menuCreateTime` DESC),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAssignment` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `menuId` MEDIUMINT UNSIGNED NOT NULL,
    `authorId` MEDIUMINT UNSIGNED NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `gameName` VARCHAR(191) NOT NULL,
    `gameContent` MEDIUMTEXT NOT NULL,
    `gameUsageCount` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `gameFavorite` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    `playTime` SMALLINT UNSIGNED NOT NULL,
    `imgId` VARCHAR(191) NULL,
    `gameCreateTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gameClassifyId` MEDIUMINT UNSIGNED NOT NULL,
    `authorId` MEDIUMINT UNSIGNED NULL,

    UNIQUE INDEX `Game_gameCreateTime_key`(`gameCreateTime` DESC),
    FULLTEXT INDEX `Game_gameName_idx`(`gameName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameClassify` (
    `id` MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `pecs` BOOLEAN NOT NULL DEFAULT false,
    `abs` BOOLEAN NOT NULL DEFAULT false,
    `obliques` BOOLEAN NOT NULL DEFAULT false,
    `hip_adductor` BOOLEAN NOT NULL DEFAULT false,
    `quads` BOOLEAN NOT NULL DEFAULT false,
    `deltoids` BOOLEAN NOT NULL DEFAULT false,
    `biceps` BOOLEAN NOT NULL DEFAULT false,
    `adductor` BOOLEAN NOT NULL DEFAULT false,
    `traps` BOOLEAN NOT NULL DEFAULT false,
    `lats` BOOLEAN NOT NULL DEFAULT false,
    `triceps` BOOLEAN NOT NULL DEFAULT false,
    `glutes` BOOLEAN NOT NULL DEFAULT false,
    `hambooleans` BOOLEAN NOT NULL DEFAULT false,
    `calves` BOOLEAN NOT NULL DEFAULT false,
    `aerobic` BOOLEAN NOT NULL DEFAULT false,
    `anaerobic` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_userAssignment` (
    `A` MEDIUMINT UNSIGNED NOT NULL,
    `B` MEDIUMINT UNSIGNED NOT NULL,

    UNIQUE INDEX `_userAssignment_AB_unique`(`A`, `B`),
    INDEX `_userAssignment_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_favoriteUserMenu` (
    `A` MEDIUMINT UNSIGNED NOT NULL,
    `B` MEDIUMINT UNSIGNED NOT NULL,

    UNIQUE INDEX `_favoriteUserMenu_AB_unique`(`A`, `B`),
    INDEX `_favoriteUserMenu_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GameToMenu` (
    `A` MEDIUMINT UNSIGNED NOT NULL,
    `B` MEDIUMINT UNSIGNED NOT NULL,

    UNIQUE INDEX `_GameToMenu_AB_unique`(`A`, `B`),
    INDEX `_GameToMenu_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_favoriteUserGame` (
    `A` MEDIUMINT UNSIGNED NOT NULL,
    `B` MEDIUMINT UNSIGNED NOT NULL,

    UNIQUE INDEX `_favoriteUserGame_AB_unique`(`A`, `B`),
    INDEX `_favoriteUserGame_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Form` ADD CONSTRAINT `Form_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryForm` ADD CONSTRAINT `HistoryForm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistoryForm` ADD CONSTRAINT `HistoryForm_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Menu` ADD CONSTRAINT `Menu_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAssignment` ADD CONSTRAINT `UserAssignment_menuId_fkey` FOREIGN KEY (`menuId`) REFERENCES `Menu`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAssignment` ADD CONSTRAINT `UserAssignment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_gameClassifyId_fkey` FOREIGN KEY (`gameClassifyId`) REFERENCES `GameClassify`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Game` ADD CONSTRAINT `Game_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_userAssignment` ADD CONSTRAINT `_userAssignment_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_userAssignment` ADD CONSTRAINT `_userAssignment_B_fkey` FOREIGN KEY (`B`) REFERENCES `UserAssignment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_favoriteUserMenu` ADD CONSTRAINT `_favoriteUserMenu_A_fkey` FOREIGN KEY (`A`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_favoriteUserMenu` ADD CONSTRAINT `_favoriteUserMenu_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToMenu` ADD CONSTRAINT `_GameToMenu_A_fkey` FOREIGN KEY (`A`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToMenu` ADD CONSTRAINT `_GameToMenu_B_fkey` FOREIGN KEY (`B`) REFERENCES `Menu`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_favoriteUserGame` ADD CONSTRAINT `_favoriteUserGame_A_fkey` FOREIGN KEY (`A`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_favoriteUserGame` ADD CONSTRAINT `_favoriteUserGame_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
