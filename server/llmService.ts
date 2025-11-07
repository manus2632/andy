import { invokeLLM } from "./_core/llm";

/**
 * LLM Service für Andy Angebotsgenerator
 * 
 * Konfiguration über ENV-Variablen:
 * - Aktuell: Nutzt Manus Built-in LLM (GPT-4o-mini)
 * - Später: IT-Kollegen können auf eigenes Ollama umstellen
 * 
 * Für Ollama-Integration:
 * 1. In server/_core/llm.ts die invokeLLM Funktion anpassen
 * 2. ENV-Variablen setzen: LLM_BASE_URL, LLM_MODEL_NAME
 */

interface AngebotKontext {
  kundenname: string;
  projekttitel: string;
  bausteine: string[];
  laender: string[];
  lieferart: "einmalig" | "rahmenvertrag";
}

/**
 * Generiert eine individualisierte Firmenvorstellung
 */
export async function generiereFirmenvorstellung(kontext: AngebotKontext): Promise<string> {
  const prompt = `Du bist ein professioneller Texter für B+L Marktdaten GmbH, ein Unternehmen für Marktanalysen im Bauprodukte-Sektor.

Erstelle eine professionelle Firmenvorstellung für ein Angebot an den Kunden "${kontext.kundenname}" für das Projekt "${kontext.projekttitel}".

Die Firmenvorstellung soll:
- Vertrauen aufbauen durch Betonung von Erfahrung und Expertise
- Die Methodenkompetenz hervorheben
- Auf die spezifische Aufgabenstellung eingehen
- 3-4 Absätze umfassen
- Professionell und sachlich formuliert sein

Kontext:
- Kunde: ${kontext.kundenname}
- Projekt: ${kontext.projekttitel}
- Analysebereiche: ${kontext.bausteine.join(", ")}
- Länder: ${kontext.laender.join(", ")}

Schreibe NUR den Text der Firmenvorstellung, ohne Überschriften oder zusätzliche Formatierung.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Du bist ein professioneller Business-Texter mit Expertise in Marktanalysen und B2B-Kommunikation.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content.trim() : "";
}

/**
 * Generiert eine detaillierte Methodikbeschreibung
 */
export async function generiereMethodik(kontext: AngebotKontext): Promise<string> {
  const prompt = `Du bist ein professioneller Texter für B+L Marktdaten GmbH.

Erstelle eine detaillierte Beschreibung der Erhebungsmethode für ein Marktanalyse-Projekt.

Das Projekt umfasst:
- Kunde: ${kontext.kundenname}
- Projekt: ${kontext.projekttitel}
- Analysebereiche: ${kontext.bausteine.join(", ")}
- Länder: ${kontext.laender.join(", ")}

Die Methodikbeschreibung soll:
- Den triangulatorischen Ansatz (Primärerhebungen in Industrie, Handel, Verarbeitung) erklären
- Die Qualitätssicherung durch Expertenabstimmung betonen
- Auf die spezifischen Analysebereiche eingehen
- Vertrauen in die Datenqualität aufbauen
- 2-3 Absätze umfassen
- Fachlich fundiert aber verständlich formuliert sein

Schreibe NUR den Methodiktext, ohne Überschriften oder zusätzliche Formatierung.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Du bist ein Experte für Marktforschungsmethodik mit tiefem Verständnis für quantitative und qualitative Erhebungsmethoden.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content.trim() : "";
}

/**
 * Sucht nach aktuellen News über den Kunden (optional)
 * TODO: Web-Recherche implementieren
 */
export async function sucheKundenNews(kundenname: string): Promise<string | null> {
  // Placeholder für zukünftige Web-Recherche
  // Kann später mit search-Tool oder Web-API erweitert werden
  return null;
}

/**
 * Generiert einen kundenspezifischen Einleitungstext basierend auf News
 */
export async function generiereKundenspezifischeEinleitung(
  kontext: AngebotKontext,
  kundenNews?: string
): Promise<string | null> {
  if (!kundenNews) {
    return null;
  }

  const prompt = `Du bist ein professioneller Texter für B+L Marktdaten GmbH.

Erstelle eine kurze, kundenspezifische Einleitung für ein Angebot, die auf aktuelle Entwicklungen beim Kunden eingeht.

Kunde: ${kontext.kundenname}
Projekt: ${kontext.projekttitel}
Aktuelle News: ${kundenNews}

Die Einleitung soll:
- Die aktuellen Entwicklungen beim Kunden aufgreifen
- Einen Bezug zur angebotenen Marktanalyse herstellen
- Zeigen, dass B+L die Situation des Kunden versteht
- 1-2 Sätze umfassen
- Professionell und wertschätzend formuliert sein

Schreibe NUR die Einleitung, ohne Überschriften.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Du bist ein professioneller Business-Texter mit Expertise in B2B-Kommunikation.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0].message.content;
  return typeof content === "string" ? content.trim() : null;
}
