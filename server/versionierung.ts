import { getDb } from "./db";
import {
  angebotVersionen,
  angebotVersionBausteine,
  angebotVersionLaender,
  InsertAngebotVersion,
} from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Erstellt eine neue Version eines Angebots
 */
export async function erstelleVersion(params: {
  angebotId: number;
  kundenname: string;
  projekttitel: string;
  gueltigkeitsdatum: Date;
  ansprechpartnerId: number | null;
  lieferart: "einmalig" | "rahmenvertrag";
  gesamtpreis: number;
  llmFirmenvorstellung: string | null;
  llmMethodik: string | null;
  aenderungsgrund?: string;
  erstelltVon?: string;
  bausteine: Array<{
    bausteinId: number;
    anzahl: number;
    angepassterPreis?: number;
    anpassungsTyp?: "direkt" | "prozent";
    anpassungsWert?: number;
  }>;
  laenderIds: number[];
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Datenbank nicht verfügbar");

  // Nächste Versionsnummer ermitteln
  const existingVersions = await db
    .select()
    .from(angebotVersionen)
    .where(eq(angebotVersionen.angebotId, params.angebotId))
    .orderBy(desc(angebotVersionen.versionNummer));

  const versionNummer = existingVersions.length > 0 ? existingVersions[0].versionNummer + 1 : 1;

  // Version erstellen
  const versionData: InsertAngebotVersion = {
    angebotId: params.angebotId,
    versionNummer,
    kundenname: params.kundenname,
    projekttitel: params.projekttitel,
    gueltigkeitsdatum: params.gueltigkeitsdatum,
    ansprechpartnerId: params.ansprechpartnerId,
    lieferart: params.lieferart,
    gesamtpreis: params.gesamtpreis,
    llmFirmenvorstellung: params.llmFirmenvorstellung,
    llmMethodik: params.llmMethodik,
    aenderungsgrund: params.aenderungsgrund || null,
    erstelltVon: params.erstelltVon || null,
  };

  const [version] = await db.insert(angebotVersionen).values(versionData);
  const versionId = version.insertId;

  // Bausteine der Version speichern
  if (params.bausteine.length > 0) {
    await db.insert(angebotVersionBausteine).values(
      params.bausteine.map((b) => ({
        versionId,
        bausteinId: b.bausteinId,
        anzahl: b.anzahl,
        angepassterPreis: b.angepassterPreis || null,
        anpassungsTyp: b.anpassungsTyp || null,
        anpassungsWert: b.anpassungsWert || null,
      }))
    );
  }

  // Länder der Version speichern
  if (params.laenderIds.length > 0) {
    await db.insert(angebotVersionLaender).values(
      params.laenderIds.map((landId) => ({
        versionId,
        landId,
      }))
    );
  }

  return versionId;
}

/**
 * Ruft alle Versionen eines Angebots ab
 */
export async function getVersionen(angebotId: number) {
  const db = await getDb();
  if (!db) return [];

  const versionen = await db
    .select()
    .from(angebotVersionen)
    .where(eq(angebotVersionen.angebotId, angebotId))
    .orderBy(desc(angebotVersionen.versionNummer));

  return versionen;
}

/**
 * Ruft eine spezifische Version mit allen Details ab
 */
export async function getVersionDetails(versionId: number) {
  const db = await getDb();
  if (!db) return null;

  const [version] = await db
    .select()
    .from(angebotVersionen)
    .where(eq(angebotVersionen.id, versionId));

  if (!version) return null;

  const bausteine = await db
    .select()
    .from(angebotVersionBausteine)
    .where(eq(angebotVersionBausteine.versionId, versionId));

  const laender = await db
    .select()
    .from(angebotVersionLaender)
    .where(eq(angebotVersionLaender.versionId, versionId));

  return {
    version,
    bausteine,
    laenderIds: laender.map((l) => l.landId),
  };
}
