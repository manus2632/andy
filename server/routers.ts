import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as llmService from "./llmService";
import * as dokumentExtraktion from "./dokumentExtraktion";
import * as versionierung from "./versionierung";
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

    listAll: protectedProcedure.query(async () => {
      return await db.getAllBausteineIncludingInactive();
    }),

    search: protectedProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(async ({ input }) => {
        if (!input.searchTerm) {
          return await db.getAllBausteineIncludingInactive();
        }
        return await db.searchBausteine(input.searchTerm);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBausteinById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          beschreibung: z.string().optional(),
          einzelpreis: z.number().min(0),
          kategorie: z.string().optional(),
          reihenfolge: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createBaustein({
          name: input.name,
          beschreibung: input.beschreibung || null,
          einzelpreis: input.einzelpreis,
          kategorie: input.kategorie || null,
          reihenfolge: input.reihenfolge || 0,
          aktiv: true,
        });
        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          beschreibung: z.string().optional(),
          einzelpreis: z.number().min(0).optional(),
          kategorie: z.string().optional(),
          reihenfolge: z.number().optional(),
          aktiv: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateBaustein(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBaustein(input.id);
        return { success: true };
      }),

    duplicate: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          newName: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.duplicateBaustein(input.id, input.newName);
        return { id };
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
          bausteine: z.array(
            z.object({
              bausteinId: z.number(),
              angepassterPreis: z.number().optional(),
              anpassungsTyp: z.enum(["direkt", "prozent"]).optional(),
              anpassungsWert: z.number().optional(),
            })
          ),
          laenderIds: z.array(z.number()),
          lieferart: z.enum(["einmalig", "rahmenvertrag"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Preisberechnung mit angepassten Preisen
        const bausteinIds = input.bausteine.map((b) => b.bausteinId);
        const bausteineData = await db.getBausteineByIds(bausteinIds);
        const laenderData = await db.getLaenderByIds(input.laenderIds);
        
        // LLM-Texte generieren
        const llmKontext = {
          kundenname: input.kundenname,
          projekttitel: input.projekttitel,
          bausteine: bausteineData.map((b) => b.name),
          laender: laenderData.map((l) => l.name),
          lieferart: input.lieferart,
        };
        
        const [llmFirmenvorstellung, llmMethodik] = await Promise.all([
          llmService.generiereFirmenvorstellung(llmKontext),
          llmService.generiereMethodik(llmKontext),
        ]);
        
        const preise = input.bausteine.map((b) => {
          if (b.angepassterPreis !== undefined) {
            return b.angepassterPreis;
          }
          const baustein = bausteineData.find((bd) => bd.id === b.bausteinId);
          return baustein?.einzelpreis || 0;
        });
        
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
          llmFirmenvorstellung,
          llmMethodik,
          llmKundenEinleitung: null,
          createdBy: ctx.user.id,
        });

        // Bausteine und Länder verknüpfen
        await db.addAngebotBausteine(angebotId, input.bausteine);
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

    duplizieren: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          neuerKundenname: z.string().optional(),
          neuerProjekttitel: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Original-Angebot laden
        const original = await db.getAngebotById(input.id);
        if (!original) {
          throw new Error("Angebot nicht gefunden");
        }

        const bausteine = await db.getAngebotBausteine(input.id);
        const laender = await db.getAngebotLaender(input.id);

        // Neues Angebot erstellen
        const neuesAngebotId = await db.createAngebot({
          kundenname: input.neuerKundenname || original.kundenname,
          projekttitel: input.neuerProjekttitel || original.projekttitel,
          gueltigkeitsdatum: original.gueltigkeitsdatum,
          ansprechpartnerId: original.ansprechpartnerId,
          lieferart: original.lieferart,
          basispreis: original.basispreis,
          rabattProzent: original.rabattProzent,
          preisProLand: original.preisProLand,
          gesamtpreis: original.gesamtpreis,
          anzahlLaender: original.anzahlLaender,
          status: "entwurf",
          llmFirmenvorstellung: original.llmFirmenvorstellung,
          llmMethodik: original.llmMethodik,
          llmKundenEinleitung: original.llmKundenEinleitung,
          createdBy: ctx.user.id,
        });

        // Bausteine und Länder kopieren
        await db.addAngebotBausteine(
          neuesAngebotId,
          bausteine.map((b) => ({ bausteinId: b.id }))
        );
        await db.addAngebotLaender(
          neuesAngebotId,
          laender.map((l) => l.id)
        );

        return { angebotId: neuesAngebotId };
      }),

    versionen: protectedProcedure
      .input(z.object({ angebotId: z.number() }))
      .query(async ({ input }) => {
        return await versionierung.getVersionen(input.angebotId);
      }),

    versionDetails: protectedProcedure
      .input(z.object({ versionId: z.number() }))
      .query(async ({ input }) => {
        return await versionierung.getVersionDetails(input.versionId);
      }),

    erstelleVersion: protectedProcedure
      .input(
        z.object({
          angebotId: z.number(),
          aenderungsgrund: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Aktuelles Angebot laden
        const angebot = await db.getAngebotById(input.angebotId);
        if (!angebot) {
          throw new Error("Angebot nicht gefunden");
        }

        const bausteine = await db.getAngebotBausteine(input.angebotId);
        const laender = await db.getAngebotLaender(input.angebotId);

        // Version erstellen
        const versionId = await versionierung.erstelleVersion({
          angebotId: input.angebotId,
          kundenname: angebot.kundenname,
          projekttitel: angebot.projekttitel,
          gueltigkeitsdatum: angebot.gueltigkeitsdatum,
          ansprechpartnerId: angebot.ansprechpartnerId,
          lieferart: angebot.lieferart,
          gesamtpreis: angebot.gesamtpreis,
          llmFirmenvorstellung: angebot.llmFirmenvorstellung,
          llmMethodik: angebot.llmMethodik,
          aenderungsgrund: input.aenderungsgrund,
          erstelltVon: ctx.user.name || ctx.user.email || "Unbekannt",
          bausteine: bausteine.map((b) => ({
            bausteinId: b.id,
            anzahl: 1,
            angepassterPreis: b.angepassterPreis || undefined,
            anpassungsTyp: b.anpassungsTyp || undefined,
            anpassungsWert: b.anpassungsWert || undefined,
          })),
          laenderIds: laender.map((l) => l.id),
        });

        return { versionId };
      }),
  }),

  upload: router({
    analysiereAngebot: protectedProcedure
      .input(
        z.object({
          dokumentText: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const extrahiert = await dokumentExtraktion.analysiereAngebotsDokument(
          input.dokumentText
        );

        // Bausteine in Bibliothek speichern (mit Deduplizierung)
        const existingBausteine = await db.getAllBausteine();
        let hinzugefuegt = 0;
        let uebersprungen = 0;

        for (const baustein of extrahiert.bausteine) {
          // Prüfen ob Baustein bereits existiert (Name + Preis)
          const exists = existingBausteine.some(
            (existing) =>
              existing.name.toLowerCase() === baustein.name.toLowerCase() &&
              existing.einzelpreis === baustein.einzelpreis
          );

          if (!exists) {
            await db.createBaustein({
              name: baustein.name,
              beschreibung: baustein.beschreibung,
              einzelpreis: baustein.einzelpreis,
              kategorie: baustein.kategorie,
            });
            hinzugefuegt++;
          } else {
            uebersprungen++;
          }
        }

        return {
          ...extrahiert,
          statistik: {
            hinzugefuegt,
            uebersprungen,
            gesamt: extrahiert.bausteine.length,
          },
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
