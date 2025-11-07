CREATE TABLE `angebotVersionBausteine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionId` int NOT NULL,
	`bausteinId` int NOT NULL,
	`anzahl` int NOT NULL DEFAULT 1,
	`angepassterPreis` int,
	`anpassungsTyp` enum('direkt','prozent'),
	`anpassungsWert` int,
	CONSTRAINT `angebotVersionBausteine_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `angebotVersionLaender` (
	`id` int AUTO_INCREMENT NOT NULL,
	`versionId` int NOT NULL,
	`landId` int NOT NULL,
	CONSTRAINT `angebotVersionLaender_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `angebotVersionen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`angebotId` int NOT NULL,
	`versionNummer` int NOT NULL,
	`kundenname` varchar(255) NOT NULL,
	`projekttitel` varchar(255) NOT NULL,
	`gueltigkeitsdatum` timestamp NOT NULL,
	`ansprechpartnerId` int,
	`lieferart` enum('einmalig','rahmenvertrag') NOT NULL,
	`gesamtpreis` int NOT NULL,
	`llmFirmenvorstellung` text,
	`llmMethodik` text,
	`aenderungsgrund` text,
	`erstelltVon` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `angebotVersionen_id` PRIMARY KEY(`id`)
);
