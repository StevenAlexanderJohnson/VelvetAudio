PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`podcast_id` integer NOT NULL,
	`guid` text NOT NULL,
	`title` text NOT NULL,
	`audio_url` text NOT NULL,
	`pub_date` text NOT NULL,
	`downloaded_date` integer,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_episodes`("id", "podcast_id", "guid", "title", "audio_url", "pub_date", "downloaded_date") SELECT "id", "podcast_id", "guid", "title", "audio_url", "pub_date", "downloaded_date" FROM `episodes`;--> statement-breakpoint
DROP TABLE `episodes`;--> statement-breakpoint
ALTER TABLE `__new_episodes` RENAME TO `episodes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `episodes_guid_unique` ON `episodes` (`guid`);--> statement-breakpoint
CREATE INDEX `episode_title_idx` ON `episodes` (`title`);