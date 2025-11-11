import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users, InsertUser, User } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Erstellt neuen User mit gehashtem Passwort
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
  role?: "admin" | "intern" | "extern";
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user: InsertUser = {
    email: data.email,
    passwordHash,
    name: data.name || null,
    role: data.role || "extern",
    aktiv: true,
  };

  const result = await db.insert(users).values(user);
  return result[0].insertId;
}

/**
 * Findet User per E-Mail
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Validiert Login-Credentials
 */
export async function validateLogin(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  
  if (!user) return null;
  if (!user.aktiv) return null; // Deaktivierte User können sich nicht einloggen

  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) return null;

  // Update lastSignedIn
  const db = await getDb();
  if (db) {
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, user.id));
  }

  return user;
}

/**
 * Findet User per ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Alle User abrufen (für Admin-Panel)
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users);
}

/**
 * User-Passwort ändern
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}

/**
 * User-Daten aktualisieren
 */
export async function updateUser(
  userId: number,
  data: {
    name?: string;
    email?: string;
    role?: "admin" | "intern" | "extern";
    aktiv?: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId));
}

/**
 * User deaktivieren (Soft Delete)
 */
export async function deactivateUser(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({ aktiv: false })
    .where(eq(users.id, userId));
}
