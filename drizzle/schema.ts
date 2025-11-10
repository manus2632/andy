import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, unique } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const bausteine = mysqlTable("bausteine", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  beschreibung: text("beschreibung"), // Kurzbeschreibung (1-2 Sätze)
  langbeschreibung: text("langbeschreibung"), // Detaillierte Beschreibung (mehrere Absätze)
  lieferumfang: text("lieferumfang"), // JSON Array: ["Excel-Tabellen", "PDF-Report", ...]
  unterpunkte: text("unterpunkte"), // JSON hierarchische Struktur
  methodik: text("methodik"), // Beschreibung der Erhebungsmethode
  einzelpreis: int("einzelpreis").notNull(), // Preis in EUR
  kategorie: varchar("kategorie", { length: 100 }),
  reihenfolge: int("reihenfolge").default(0),
  aktiv: boolean("aktiv").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueNamePreis: unique().on(table.name, table.einzelpreis),
}));

export type Baustein = typeof bausteine.$inferSelect;
export type InsertBaustein = typeof bausteine.$inferInsert;

export const laender = mysqlTable("laender", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 2 }).notNull(),
  region: varchar("region", { length: 100 }),
  aktiv: boolean("aktiv").default(true).notNull(),
});

export type Land = typeof laender.$inferSelect;
export type InsertLand = typeof laender.$inferInsert;

export const ansprechpartner = mysqlTable("ansprechpartner", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  telefon: varchar("telefon", { length: 50 }),
  email: varchar("email", { length: 100 }).notNull(),
  aktiv: boolean("aktiv").default(true).notNull(),
});

export type Ansprechpartner = typeof ansprechpartner.$inferSelect;
export type InsertAnsprechpartner = typeof ansprechpartner.$inferInsert;

export const angebote = mysqlTable("angebote", {
  id: int("id").autoincrement().primaryKey(),
  kundenname: varchar("kundenname", { length: 200 }).notNull(),
  projekttitel: varchar("projekttitel", { length: 300 }).notNull(),
  erstellungsdatum: timestamp("erstellungsdatum").defaultNow().notNull(),
  gueltigkeitsdatum: timestamp("gueltigkeitsdatum").notNull(),
  ansprechpartnerId: int("ansprechpartnerId").notNull(),
  lieferart: mysqlEnum("lieferart", ["einmalig", "rahmenvertrag"]).default("einmalig").notNull(),
  basispreis: int("basispreis").notNull(), // Summe aller Bausteine
  rabattProzent: int("rabattProzent").default(0).notNull(), // Rabatt in Prozent (z.B. 16 für 16%)
  preisProLand: int("preisProLand").notNull(),
  gesamtpreis: int("gesamtpreis").notNull(),
  anzahlLaender: int("anzahlLaender").notNull(),
  status: mysqlEnum("status", ["entwurf", "fertig", "gesendet", "angenommen", "abgelehnt"])
    .default("entwurf")
    .notNull(),
  llmFirmenvorstellung: text("llmFirmenvorstellung"),
  llmMethodik: text("llmMethodik"),
  llmKundenEinleitung: text("llmKundenEinleitung"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Angebot = typeof angebote.$inferSelect;
export type InsertAngebot = typeof angebote.$inferInsert;

/**
 * Angebots-Versionen für Änderungshistorie
 */
export const angebotVersionen = mysqlTable("angebotVersionen", {
  id: int("id").autoincrement().primaryKey(),
  angebotId: int("angebotId").notNull(),
  versionNummer: int("versionNummer").notNull(),
  kundenname: varchar("kundenname", { length: 255 }).notNull(),
  projekttitel: varchar("projekttitel", { length: 255 }).notNull(),
  gueltigkeitsdatum: timestamp("gueltigkeitsdatum").notNull(),
  ansprechpartnerId: int("ansprechpartnerId"),
  lieferart: mysqlEnum("lieferart", ["einmalig", "rahmenvertrag"]).notNull(),
  gesamtpreis: int("gesamtpreis").notNull(),
  llmFirmenvorstellung: text("llmFirmenvorstellung"),
  llmMethodik: text("llmMethodik"),
  aenderungsgrund: text("aenderungsgrund"),
  erstelltVon: varchar("erstelltVon", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AngebotVersion = typeof angebotVersionen.$inferSelect;
export type InsertAngebotVersion = typeof angebotVersionen.$inferInsert;

/**
 * Bausteine einer Angebots-Version
 */
export const angebotVersionBausteine = mysqlTable("angebotVersionBausteine", {
  id: int("id").autoincrement().primaryKey(),
  versionId: int("versionId").notNull(),
  bausteinId: int("bausteinId").notNull(),
  anzahl: int("anzahl").notNull().default(1),
  angepassterPreis: int("angepassterPreis"),
  anpassungsTyp: mysqlEnum("anpassungsTyp", ["direkt", "prozent"]),
  anpassungsWert: int("anpassungsWert"),
});

/**
 * Länder einer Angebots-Version
 */
export const angebotVersionLaender = mysqlTable("angebotVersionLaender", {
  id: int("id").autoincrement().primaryKey(),
  versionId: int("versionId").notNull(),
  landId: int("landId").notNull(),
});

export const angebotBausteine = mysqlTable("angebotBausteine", {
  id: int("id").autoincrement().primaryKey(),
  angebotId: int("angebotId").notNull(),
  bausteinId: int("bausteinId").notNull(),
  angepassterPreis: int("angepassterPreis"), // NULL = Standard-Preis, sonst individueller Preis
  anpassungsTyp: mysqlEnum("anpassungsTyp", ["direkt", "prozent"]),
  anpassungsWert: int("anpassungsWert"), // Bei direkt: Preis in EUR, bei prozent: Prozentsatz
});

export type AngebotBaustein = typeof angebotBausteine.$inferSelect;
export type InsertAngebotBaustein = typeof angebotBausteine.$inferInsert;

export const angebotLaender = mysqlTable("angebotLaender", {
  id: int("id").autoincrement().primaryKey(),
  angebotId: int("angebotId").notNull(),
  landId: int("landId").notNull(),
});

export type AngebotLand = typeof angebotLaender.$inferSelect;
export type InsertAngebotLand = typeof angebotLaender.$inferInsert;
