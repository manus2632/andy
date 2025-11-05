ALTER TABLE `angebotBausteine` ADD `angepassterPreis` int;--> statement-breakpoint
ALTER TABLE `angebotBausteine` ADD `anpassungsTyp` enum('direkt','prozent');--> statement-breakpoint
ALTER TABLE `angebotBausteine` ADD `anpassungsWert` int;