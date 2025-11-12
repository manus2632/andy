import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifyToken, extractTokenFromCookie } from "../auth/jwt";
import { getUserById } from "../authDb";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  // Try cookie-based auth first
  const cookieHeader = opts.req.headers.cookie;
  const cookieToken = extractTokenFromCookie(cookieHeader);
  
  if (cookieToken) {
    try {
      const decoded = verifyToken(cookieToken);
      if (decoded) {
        const foundUser = await getUserById(decoded.userId);
        if (foundUser) {
          user = foundUser;
        }
      }
    } catch (error) {
      // Try fallback to Bearer token
    }
  }

  // Fallback: JWT auth via Authorization header
  if (!user) {
    const authHeader = opts.req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
          const foundUser = await getUserById(decoded.userId);
          if (foundUser) {
            user = foundUser;
          }
        }
      } catch (error) {
        // Authentication is optional for public procedures.
        user = null;
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
