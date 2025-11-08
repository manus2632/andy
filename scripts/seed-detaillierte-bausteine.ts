import { drizzle } from "drizzle-orm/mysql2";
import { bausteine } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const detaillierteBausteine = [
  {
    name: "Marktgröße/-entwicklung",
    kategorie: "Marktanalyse",
    beschreibung: "Marktgröße und -entwicklung mit Prognose",
    langbeschreibung: `Die Marktgröße und -entwicklung bildet die Grundlage jeder Marktanalyse. Wir analysieren den Gesamtmarkt und seine historische Entwicklung über die letzten Jahre und erstellen fundierte Prognosen für die kommenden Jahre. 

Dabei berücksichtigen wir sowohl makroökonomische Faktoren als auch branchenspezifische Trends und Entwicklungen. Die Analyse umfasst Mengen- und Wertentwicklungen sowie Wachstumsraten.`,
    lieferumfang: `• Excel-Tabellen mit historischen Daten (5-10 Jahre)
• Prognosen für 3-5 Jahre
• Grafische Darstellungen der Marktentwicklung
• Kommentierung der Treiber und Trends
• PDF-Report mit Zusammenfassung`,
    unterpunkte: `• Historische Marktentwicklung (Volumen und Wert)
• Marktprognose mit verschiedenen Szenarien
• Identifikation von Wachstumstreibern
• Analyse von Marktbarrieren
• Segmentierung nach Produktgruppen
• Regionale Unterschiede innerhalb des Marktes`,
    methodik: `Unsere Marktgrößenermittlung basiert auf einem Bottom-up-Ansatz, bei dem wir Produktionsdaten, Außenhandelsdaten und Verbrauchsdaten kombinieren. Wir nutzen offizielle Statistiken, Verbandsdaten und eigene Primärerhebungen. Die Prognosen werden mittels Regressionsanalysen und Expertenbefragungen erstellt.`,
    einzelpreis: 2300,
  },
  {
    name: "TOP-Anbieter",
    kategorie: "Wettbewerbsanalyse",
    beschreibung: "Analyse der wichtigsten Marktteilnehmer",
    langbeschreibung: `Die TOP-Anbieter-Analyse identifiziert und bewertet die führenden Unternehmen im Zielmarkt. Wir analysieren Marktanteile, Produktportfolios, Vertriebsstrategien und Wettbewerbspositionen der wichtigsten Player.

Diese Analyse ermöglicht es Ihnen, die Wettbewerbslandschaft zu verstehen, Benchmarks zu setzen und strategische Positionierungsentscheidungen zu treffen.`,
    lieferumfang: `• Ranking der TOP 10-20 Anbieter nach Marktanteil
• Unternehmensprofile mit Kennzahlen
• Produktportfolio-Übersicht
• Vertriebskanal-Analyse
• Strategische Positionierung
• Excel-Datenbank mit allen Informationen`,
    unterpunkte: `• Marktanteile der führenden Anbieter
• Umsatz- und Absatzentwicklung
• Produktportfolio und Sortimentsbreite
• Vertriebskanäle und Distributionsstrategien
• Preisniveau und Positionierung
• Stärken-Schwächen-Analyse
• Strategische Ausrichtung und Trends`,
    methodik: `Die Identifikation der TOP-Anbieter erfolgt durch Auswertung von Geschäftsberichten, Branchenverzeichnissen, Verbandsinformationen und eigenen Datenbanken. Marktanteile werden durch Kombination von Produktionsdaten, Vertriebsinformationen und Expertenschätzungen ermittelt. Qualitative Informationen stammen aus Desk Research und Experteninterviews.`,
    einzelpreis: 1600,
  },
  {
    name: "Firmenprofil",
    kategorie: "Wettbewerbsanalyse",
    beschreibung: "Detaillierte Analyse einzelner Wettbewerber",
    langbeschreibung: `Das Firmenprofil bietet eine umfassende Analyse einzelner Wettbewerber oder Zielunternehmen. Wir erstellen detaillierte Profile mit allen relevanten Informationen zu Unternehmensstrategie, Produktportfolio, Vertrieb, Finanzkennzahlen und Marktposition.

Diese Tiefenanalyse ist besonders wertvoll für M&A-Prozesse, Partnerschaften oder die Bewertung direkter Wettbewerber.`,
    lieferumfang: `• Ausführliches Unternehmensprofil (10-15 Seiten)
• Organigramm und Gesellschafterstruktur
• Produktportfolio mit Bildern und Spezifikationen
• Vertriebsstruktur und Kundensegmente
• Finanzkennzahlen (soweit verfügbar)
• SWOT-Analyse
• Strategische Einschätzung`,
    unterpunkte: `• Unternehmensgeschichte und Entwicklung
• Eigentümerstruktur und Management
• Standorte und Produktionskapazitäten
• Produktportfolio mit technischen Details
• Vertriebsorganisation und Absatzkanäle
• Kundensegmente und Referenzen
• Umsatz, Mitarbeiter, Marktanteile
• Strategische Ausrichtung und Investitionen
• Innovationen und F&E-Aktivitäten
• Stärken, Schwächen, Chancen, Risiken`,
    methodik: `Firmenprofile basieren auf einer Kombination aus Desk Research (Website, Geschäftsberichte, Pressemitteilungen, Handelsregister) und Primärerhebungen (Experteninterviews, Kundenbefragungen). Finanzdaten werden aus öffentlichen Quellen wie Bundesanzeiger, Creditreform oder Unternehmensveröffentlichungen bezogen. Die strategische Einschätzung erfolgt durch unsere Branchenexperten.`,
    einzelpreis: 900,
  },
  {
    name: "Distribution",
    kategorie: "Vertriebsanalyse",
    beschreibung: "Analyse der Vertriebswege und Distributionsstrukturen",
    langbeschreibung: `Die Distributionsanalyse untersucht die Vertriebswege, Absatzkanäle und Distributionsstrukturen im Zielmarkt. Wir analysieren, über welche Kanäle Produkte zum Endkunden gelangen, welche Bedeutung einzelne Vertriebskanäle haben und wie sich die Distributionslandschaft entwickelt.

Diese Analyse ist essentiell für die Entwicklung einer erfolgreichen Go-to-Market-Strategie und die Auswahl geeigneter Vertriebspartner.`,
    lieferumfang: `• Übersicht aller relevanten Vertriebskanäle
• Marktanteile der Distributionskanäle
• Entwicklung der Vertriebsstrukturen
• Anzahl und Struktur der Händler/Distributoren
• Regionale Distributionsdichte
• Excel-Datenbank mit Händlerverzeichnis
• Grafische Darstellung der Wertschöpfungskette`,
    unterpunkte: `• Vertriebskanäle (Direktvertrieb, Großhandel, Fachhandel, Online, etc.)
• Marktanteile der einzelnen Kanäle
• Anzahl der Absatzmittler nach Typ
• Regionale Verteilung der Distributoren
• Konzentration vs. Fragmentierung
• Trends in der Distribution (z.B. Online-Handel)
• Margen und Handelsspannen
• Anforderungen an Vertriebspartner`,
    methodik: `Die Distributionsanalyse kombiniert Top-down- und Bottom-up-Ansätze. Wir nutzen Verbandsstatistiken, Handelsregister, Branchenverzeichnisse und eigene Datenbanken zur Identifikation von Distributoren. Marktanteile und Strukturen werden durch Experteninterviews, Händlerbefragungen und Auswertung von Geschäftsberichten ermittelt.`,
    einzelpreis: 1600,
  },
];

async function seed() {
  console.log("Starte Seed für detaillierte Bausteine...");

  for (const baustein of detaillierteBausteine) {
    await db.insert(bausteine).values(baustein);
    console.log(`✓ Baustein "${baustein.name}" hinzugefügt`);
  }

  console.log("Seed abgeschlossen!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Fehler beim Seeden:", error);
  process.exit(1);
});
