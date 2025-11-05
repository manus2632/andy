import { eq, inArray, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  bausteine,
  laender,
  ansprechpartner,
  angebote,
  angebotBausteine,
  angebotLaender,
  InsertAngebot,
  InsertAngebotBaustein,
  InsertAngebotLand,
  InsertBaustein,
  Baustein,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Bausteine
export async function getAllBausteine() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bausteine).where(eq(bausteine.aktiv, true));
}

export async function getAllBausteineIncludingInactive() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bausteine);
}

export async function searchBausteine(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${searchTerm}%`;
  return await db
    .select()
    .from(bausteine)
    .where(
      or(
        like(bausteine.name, searchPattern),
        like(bausteine.beschreibung, searchPattern),
        like(bausteine.kategorie, searchPattern)
      )
    );
}

export async function getBausteinById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bausteine).where(eq(bausteine.id, id)).limit(1);
  return result[0];
}

export async function getBausteineByIds(ids: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];
  return await db.select().from(bausteine).where(inArray(bausteine.id, ids));
}

export async function createBaustein(baustein: InsertBaustein) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bausteine).values(baustein);
  return result[0].insertId;
}

export async function updateBaustein(id: number, baustein: Partial<InsertBaustein>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bausteine).set(baustein).where(eq(bausteine.id, id));
}

export async function deleteBaustein(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Soft delete
  await db.update(bausteine).set({ aktiv: false }).where(eq(bausteine.id, id));
}

export async function duplicateBaustein(id: number, newName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const original = await getBausteinById(id);
  if (!original) throw new Error("Baustein not found");

  const duplicate: InsertBaustein = {
    name: newName,
    beschreibung: original.beschreibung,
    einzelpreis: original.einzelpreis,
    kategorie: original.kategorie,
    reihenfolge: original.reihenfolge,
    aktiv: true,
  };

  const result = await db.insert(bausteine).values(duplicate);
  return result[0].insertId;
}

// Länder
export async function getAllLaender() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(laender).where(eq(laender.aktiv, true));
}

export async function getLaenderByIds(ids: number[]) {
  const db = await getDb();
  if (!db) return [];
  if (ids.length === 0) return [];
  return await db.select().from(laender).where(inArray(laender.id, ids));
}

// Ansprechpartner
export async function getAllAnsprechpartner() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ansprechpartner).where(eq(ansprechpartner.aktiv, true));
}

export async function getAnsprechpartnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(ansprechpartner)
    .where(eq(ansprechpartner.id, id))
    .limit(1);
  return result[0];
}

// Angebote
export async function createAngebot(angebot: InsertAngebot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(angebote).values(angebot);
  return result[0].insertId;
}

export async function addAngebotBausteine(
  angebotId: number,
  bausteine: Array<{
    bausteinId: number;
    angepassterPreis?: number;
    anpassungsTyp?: "direkt" | "prozent";
    anpassungsWert?: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: InsertAngebotBaustein[] = bausteine.map((b) => ({
    angebotId,
    bausteinId: b.bausteinId,
    angepassterPreis: b.angepassterPreis ?? null,
    anpassungsTyp: b.anpassungsTyp ?? null,
    anpassungsWert: b.anpassungsWert ?? null,
  }));

  await db.insert(angebotBausteine).values(values);
}

export async function addAngebotLaender(angebotId: number, laenderIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const values: InsertAngebotLand[] = laenderIds.map((landId) => ({
    angebotId,
    landId,
  }));

  await db.insert(angebotLaender).values(values);
}

export async function getAngebotById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(angebote).where(eq(angebote.id, id)).limit(1);
  return result[0];
}

export async function getAngebotBausteine(angebotId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      baustein: bausteine,
    })
    .from(angebotBausteine)
    .innerJoin(bausteine, eq(angebotBausteine.bausteinId, bausteine.id))
    .where(eq(angebotBausteine.angebotId, angebotId));

  return result.map((r) => r.baustein);
}

export async function getAngebotLaender(angebotId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      land: laender,
    })
    .from(angebotLaender)
    .innerJoin(laender, eq(angebotLaender.landId, laender.id))
    .where(eq(angebotLaender.angebotId, angebotId));

  return result.map((r) => r.land);
}

export async function getAllAngebote() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(angebote);
}
