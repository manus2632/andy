ALTER TABLE `angebote` MODIFY COLUMN `createdBy` int NOT NULL;--> statement-breakpoint
ALTER TABLE `angebote` ADD `llmFirmenvorstellung` text;--> statement-breakpoint
ALTER TABLE `angebote` ADD `llmMethodik` text;--> statement-breakpoint
ALTER TABLE `angebote` ADD `llmKundenEinleitung` text;