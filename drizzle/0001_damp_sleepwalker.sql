ALTER TABLE `episodes` ADD `listen_progress` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `episodes` ADD `completed` integer DEFAULT false;