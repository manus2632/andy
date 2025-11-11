import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { validateLogin, createUser, getUserById, getAllUsers, updateUser, deactivateUser, updateUserPassword } from "../authDb";
import { createToken, verifyToken, extractTokenFromCookie } from "./jwt";
import { getUserByEmail } from "../authDb";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const authRouter = router({
  /**
   * Login mit E-Mail und Passwort
   */
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await validateLogin(input.email, input.password);

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Ungültige E-Mail oder Passwort",
        });
      }

      const token = createToken(user);

      // Set cookie
      ctx.res.setHeader(
        "Set-Cookie",
        `auth_token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
      );

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    }),

  /**
   * Registrierung (nur für Admins oder öffentlich je nach Konfiguration)
   */
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }) => {
      // TODO: Prüfen ob E-Mail bereits existiert
      const userId = await createUser({
        email: input.email,
        password: input.password,
        name: input.name,
        role: "extern", // Default: Externe User
      });

      const user = await getUserById(userId);

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User konnte nicht erstellt werden",
        });
      }

      const token = createToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      };
    }),

  /**
   * Aktuellen User abrufen (per Token)
   */
  me: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie;
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);

    if (!payload) {
      return null;
    }

    const user = await getUserById(payload.userId);

    if (!user || !user.aktiv) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader(
      "Set-Cookie",
      `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`
    );

    return {
      success: true,
    };
  }),

  /**
   * Alle User abrufen (nur für Admins)
   */
  getAllUsers: publicProcedure.query(async ({ ctx }) => {
    const cookieHeader = ctx.req.headers.cookie;
    const token = extractTokenFromCookie(cookieHeader);

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Nicht angemeldet",
      });
    }

    const payload = verifyToken(token);

    if (!payload || payload.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Nur Admins dürfen User verwalten",
      });
    }

    const users = await getAllUsers();

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      aktiv: u.aktiv,
      createdAt: u.createdAt,
      lastSignedIn: u.lastSignedIn,
    }));
  }),

  /**
   * Neuen User erstellen (nur für Admins)
   */
  createUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
        role: z.enum(["admin", "intern", "extern"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cookieHeader = ctx.req.headers.cookie;
      const token = extractTokenFromCookie(cookieHeader);

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht angemeldet",
        });
      }

      const payload = verifyToken(token);

      if (!payload || payload.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins dürfen User erstellen",
        });
      }

      // Prüfen ob E-Mail bereits existiert
      const existingUser = await getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "E-Mail bereits vergeben",
        });
      }

      const userId = await createUser({
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role,
      });

      return {
        success: true,
        userId,
      };
    }),

  /**
   * User aktualisieren (nur für Admins)
   */
  updateUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "intern", "extern"]).optional(),
        aktiv: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cookieHeader = ctx.req.headers.cookie;
      const token = extractTokenFromCookie(cookieHeader);

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht angemeldet",
        });
      }

      const payload = verifyToken(token);

      if (!payload || payload.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins dürfen User bearbeiten",
        });
      }

      const { userId, ...updates } = input;

      await updateUser(userId, updates);

      return {
        success: true,
      };
    }),

  /**
   * User deaktivieren (nur für Admins)
   */
  deactivateUser: publicProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const cookieHeader = ctx.req.headers.cookie;
      const token = extractTokenFromCookie(cookieHeader);

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht angemeldet",
        });
      }

      const payload = verifyToken(token);

      if (!payload || payload.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins dürfen User deaktivieren",
        });
      }

      await deactivateUser(input.userId);

      return {
        success: true,
      };
    }),

  /**
   * User-Passwort ändern (nur für Admins)
   */
  changeUserPassword: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cookieHeader = ctx.req.headers.cookie;
      const token = extractTokenFromCookie(cookieHeader);

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Nicht angemeldet",
        });
      }

      const payload = verifyToken(token);

      if (!payload || payload.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Nur Admins dürfen Passwörter ändern",
        });
      }

      await updateUserPassword(input.userId, input.newPassword);

      return {
        success: true,
      };
    }),
});
