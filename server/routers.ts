import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { calculatePrice } from "./calculator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bausteine: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBausteine();
    }),
  }),

  laender: router({
    list: publicProcedure.query(async () => {
      return await db.getAllLaender();
    }),
  }),

  ansprechpartner: router({
    list: publicProcedure.query(async () => {
      return await db.getAllAnsprechpartner();
    }),
  }),

  angebot: router({
    calculate: publicProcedure
      .input(
        z.object({
          bausteinIds: z.array(z.number()),
          laenderIds: z.array(z.number()),
          lieferart: z.enum(["einmalig", "rahmenvertrag"]),
        })
      )
      .mutation(async ({ input }) => {
        const bausteineData = await db.getBausteineByIds(input.bausteinIds);
        const preise = bausteineData.map((b) => b.einzelpreis);
        const anzahlLaender = input.laenderIds.length;

        return calculatePrice(preise, anzahlLaender, input.lieferart);
      }),

    create: protectedProcedure
      .input(
        z.object({
          kundenname: z.string().min(1),
          projekttitel: z.string().min(1),
          gueltigkeitsdatum: z.string(),
          ansprechpartnerId: z.number(),
          bausteinIds: z.array(z.number()),
          laenderIds: z.array(z.number()),
          lieferart: z.enum(["einmalig", "rahmenvertrag"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Preisberechnung
        const bausteineData = await db.getBausteineByIds(input.bausteinIds);
        const preise = bausteineData.map((b) => b.einzelpreis);
        const anzahlLaender = input.laenderIds.length;
        const berechnung = calculatePrice(preise, anzahlLaender, input.lieferart);

        // Angebot erstellen
        const angebotId = await db.createAngebot({
          kundenname: input.kundenname,
          projekttitel: input.projekttitel,
          gueltigkeitsdatum: new Date(input.gueltigkeitsdatum),
          ansprechpartnerId: input.ansprechpartnerId,
          lieferart: input.lieferart,
          basispreis: berechnung.basispreis,
          rabattProzent: berechnung.rabattProzent,
          preisProLand: berechnung.preisProLand,
          gesamtpreis: berechnung.gesamtpreis,
          anzahlLaender: berechnung.anzahlLaender,
          status: "entwurf",
          createdBy: ctx.user.id,
        });

        // Bausteine und Länder verknüpfen
        await db.addAngebotBausteine(angebotId, input.bausteinIds);
        await db.addAngebotLaender(angebotId, input.laenderIds);

        return { angebotId };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const angebot = await db.getAngebotById(input.id);
        if (!angebot) {
          throw new Error("Angebot nicht gefunden");
        }

        const bausteine = await db.getAngebotBausteine(input.id);
        const laender = await db.getAngebotLaender(input.id);
        const ansprechpartner = await db.getAnsprechpartnerById(angebot.ansprechpartnerId);

        return {
          angebot,
          bausteine,
          laender,
          ansprechpartner,
        };
      }),

    list: protectedProcedure.query(async () => {
      return await db.getAllAngebote();
    }),
  }),
});

export type AppRouter = typeof appRouter;
