import { drizzle } from "drizzle-orm/mysql2";
import { bausteine, ansprechpartner, laender } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("Seeding database...");

  // Bausteine einfügen
  await db.insert(bausteine).values([
    {
      name: "Marktgröße/-entwicklung",
      beschreibung: "Marktgröße und -entwicklung mit Prognose",
      einzelpreis: 2300,
      kategorie: "Marktanalyse",
      reihenfolge: 1,
      aktiv: true,
    },
    {
      name: "TOP-Anbieter",
      beschreibung: "Analyse der wichtigsten Marktteilnehmer",
      einzelpreis: 1600,
      kategorie: "Wettbewerb",
      reihenfolge: 2,
      aktiv: true,
    },
    {
      name: "Firmenprofil",
      beschreibung: "Detailliertes Firmenprofil",
      einzelpreis: 900,
      kategorie: "Unternehmen",
      reihenfolge: 3,
      aktiv: true,
    },
    {
      name: "Distribution",
      beschreibung: "Distributionsanalyse",
      einzelpreis: 800,
      kategorie: "Vertrieb",
      reihenfolge: 4,
      aktiv: true,
    },
    {
      name: "Rahmendaten kurz",
      beschreibung: "Kurzfassung der Rahmendaten",
      einzelpreis: 0,
      kategorie: "Rahmendaten",
      reihenfolge: 5,
      aktiv: true,
    },
    {
      name: "Rahmendaten ausführlich",
      beschreibung: "Ausführliche Rahmendaten",
      einzelpreis: 250,
      kategorie: "Rahmendaten",
      reihenfolge: 6,
      aktiv: true,
    },
  ]);

  // Ansprechpartner einfügen
  await db.insert(ansprechpartner).values([
    {
      name: "Marcel Dresse",
      telefon: "+49 228 62987-27",
      email: "MD@BL2020.com",
      aktiv: true,
    },
    {
      name: "Robin Huth",
      telefon: "+49 228 62987-21",
      email: "RH@BL2020.com",
      aktiv: true,
    },
    {
      name: "Martin Langen",
      telefon: "+49 228 62987-22",
      email: "ML@BL2020.com",
      aktiv: true,
    },
  ]);

  // Länder einfügen (Beispiele)
  await db.insert(laender).values([
    { name: "Deutschland", code: "DE", region: "Europa", aktiv: true },
    { name: "Österreich", code: "AT", region: "Europa", aktiv: true },
    { name: "Schweiz", code: "CH", region: "Europa", aktiv: true },
    { name: "Frankreich", code: "FR", region: "Europa", aktiv: true },
    { name: "Italien", code: "IT", region: "Europa", aktiv: true },
    { name: "Spanien", code: "ES", region: "Europa", aktiv: true },
    { name: "Polen", code: "PL", region: "Europa", aktiv: true },
    { name: "Niederlande", code: "NL", region: "Europa", aktiv: true },
    { name: "Belgien", code: "BE", region: "Europa", aktiv: true },
    { name: "Vereinigtes Königreich", code: "UK", region: "Europa", aktiv: true },
    { name: "Norwegen", code: "NO", region: "Europa", aktiv: true },
    { name: "Schweden", code: "SE", region: "Europa", aktiv: true },
    { name: "Dänemark", code: "DK", region: "Europa", aktiv: true },
    { name: "Tschechien", code: "CZ", region: "Europa", aktiv: true },
    { name: "Ungarn", code: "HU", region: "Europa", aktiv: true },
    { name: "USA", code: "US", region: "Nordamerika", aktiv: true },
    { name: "Kanada", code: "CA", region: "Nordamerika", aktiv: true },
    { name: "China", code: "CN", region: "Asien", aktiv: true },
    { name: "Japan", code: "JP", region: "Asien", aktiv: true },
    { name: "Australien", code: "AU", region: "Ozeanien", aktiv: true },
  ]);

  console.log("Seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .then(() => process.exit(0));
