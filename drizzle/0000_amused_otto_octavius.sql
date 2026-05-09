CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`podcast_id` integer,
	`guid` text NOT NULL,
	`title` text NOT NULL,
	`audio_url` text NOT NULL,
	`pub_date` text NOT NULL,
	`downloaded_date` integer DEFAULT '"2026-05-09T13:37:39.907Z"' NOT NULL,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `episodes_guid_unique` ON `episodes` (`guid`);--> statement-breakpoint
CREATE INDEX `episode_title_idx` ON `episodes` (`title`);--> statement-breakpoint
CREATE TABLE `podcasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`rss_url` text NOT NULL,
	`next_run_at` integer NOT NULL,
	`max_downloaded` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `next_run_idx` ON `podcasts` (`next_run_at`);--> statement-breakpoint
CREATE TABLE `task` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`priority` integer DEFAULT 1 NOT NULL
);
