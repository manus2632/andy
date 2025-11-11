import jwt from "jsonwebtoken";
import { User } from "../../drizzle/schema";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";
const JWT_EXPIRES_IN = "7d"; // Token gültig für 7 Tage

export interface JwtPayload {
  userId: number;
  email: string;
  role: "admin" | "intern" | "extern";
}

/**
 * Erstellt JWT-Token für User
 */
export function createToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifiziert JWT-Token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extrahiert Token aus Authorization-Header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  
  return parts[1];
}

/**
 * Extrahiert Token aus Cookie
 */
export function extractTokenFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(";").map(c => c.trim());
  const authCookie = cookies.find(c => c.startsWith("auth_token="));
  
  if (!authCookie) return null;
  
  return authCookie.split("=")[1];
}
