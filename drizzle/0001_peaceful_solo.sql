CREATE TABLE `angebotBausteine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`angebotId` int NOT NULL,
	`bausteinId` int NOT NULL,
	CONSTRAINT `angebotBausteine_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `angebotLaender` (
	`id` int AUTO_INCREMENT NOT NULL,
	`angebotId` int NOT NULL,
	`landId` int NOT NULL,
	CONSTRAINT `angebotLaender_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `angebote` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kundenname` varchar(200) NOT NULL,
	`projekttitel` varchar(300) NOT NULL,
	`erstellungsdatum` timestamp NOT NULL DEFAULT (now()),
	`gueltigkeitsdatum` timestamp NOT NULL,
	`ansprechpartnerId` int NOT NULL,
	`lieferart` enum('einmalig','rahmenvertrag') NOT NULL DEFAULT 'einmalig',
	`basispreis` int NOT NULL,
	`rabattProzent` int NOT NULL DEFAULT 0,
	`preisProLand` int NOT NULL,
	`gesamtpreis` int NOT NULL,
	`anzahlLaender` int NOT NULL,
	`status` enum('entwurf','versendet','angenommen','abgelehnt') NOT NULL DEFAULT 'entwurf',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `angebote_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ansprechpartner` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`telefon` varchar(50),
	`email` varchar(100) NOT NULL,
	`aktiv` boolean NOT NULL DEFAULT true,
	CONSTRAINT `ansprechpartner_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bausteine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`beschreibung` text,
	`einzelpreis` int NOT NULL,
	`kategorie` varchar(100),
	`reihenfolge` int DEFAULT 0,
	`aktiv` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bausteine_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laender` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(2) NOT NULL,
	`region` varchar(100),
	`aktiv` boolean NOT NULL DEFAULT true,
	CONSTRAINT `laender_id` PRIMARY KEY(`id`)
);
