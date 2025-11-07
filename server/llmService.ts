/**
 * LLM Service für Andy Angebotsgenerator
 * 
 * Nutzt OpenWebUI API für LLM-Anfragen
 * 
 * Konfiguration über ENV-Variablen:
 * - OPENWEBUI_API_URL: API-Endpunkt (default: https://maxproxy.bl2020.com/api/chat/completions)
 * - OPENWEBUI_API_KEY: Bearer Token
 * - OPENWEBUI_MODEL: Modellname (default: gpt-oss:120b)
 */

const OPENWEBUI_API_URL = process.env.OPENWEBUI_API_URL || "https://maxproxy.bl2020.com/api/chat/completions";
const OPENWEBUI_API_KEY = process.env.OPENWEBUI_API_KEY || "sk-bd621b0666474be1b054b3c5360b3cef";
const OPENWEBUI_MODEL = process.env.OPENWEBUI_MODEL || "gpt-oss:120b";

interface AngebotKontext {
  kundenname: string;
  projekttitel: string;
  bausteine: string[];
  laender: string[];
  lieferart: "einmalig" | "rahmenvertrag";
}

/**
 * Ruft OpenWebUI API auf
 */
async function callOpenWebUI(messages: Array<{ role: string; content: string }>): Promise<string> {
  const response = await fetch(OPENWEBUI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENWEBUI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENWEBUI_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenWebUI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
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

  const content = await callOpenWebUI([
    {
      role: "system",
      content: "Du bist ein professioneller Business-Texter mit Expertise in Marktanalysen und B2B-Kommunikation.",
    },
    { role: "user", content: prompt },
  ]);

  return content.trim();
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

  const content = await callOpenWebUI([
    {
      role: "system",
      content: "Du bist ein Experte für Marktforschungsmethodik mit tiefem Verständnis für quantitative und qualitative Erhebungsmethoden.",
    },
    { role: "user", content: prompt },
  ]);

  return content.trim();
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

  const content = await callOpenWebUI([
    {
      role: "system",
      content: "Du bist ein professioneller Business-Texter mit Expertise in B2B-Kommunikation.",
    },
    { role: "user", content: prompt },
  ]);

  return content.trim();
}
