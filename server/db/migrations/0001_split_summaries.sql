CREATE TABLE `summaries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_id` integer NOT NULL,
	`title_en` text NOT NULL,
	`summary_en` text NOT NULL,
	`score` integer NOT NULL,
	`category` text,
	`model` text NOT NULL,
	`prompt_version` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summaries_article_id_unique` ON `summaries` (`article_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`url` text NOT NULL,
	`title_original` text NOT NULL,
	`description_original` text,
	`published_at` integer NOT NULL,
	`feed_position` integer,
	`summary_attempts` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Hand-edited: copy only the columns the old table had. Summaries that were
-- stored inline in the old table are not carried over.
INSERT INTO `__new_articles`("id", "source_id", "url", "title_original", "published_at", "feed_position", "created_at") SELECT "id", "source_id", "url", "title_original", "published_at", "feed_position", "created_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_url_unique` ON `articles` (`url`);--> statement-breakpoint
CREATE INDEX `articles_published_at_idx` ON `articles` (`published_at`);--> statement-breakpoint
ALTER TABLE `sources` ADD `kind` text DEFAULT 'rss' NOT NULL;--> statement-breakpoint
ALTER TABLE `sources` ADD `language` text DEFAULT 'es' NOT NULL;