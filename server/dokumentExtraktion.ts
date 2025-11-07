import { invokeLLM } from "./_core/llm";
import mammoth from "mammoth";

interface ExtrahierteBausteine {
  bausteine: Array<{
    name: string;
    beschreibung: string;
    einzelpreis: number;
    kategorie: string;
  }>;
  angebotsdaten: {
    kundenname: string;
    projekttitel: string;
    laender: string[];
  };
}

/**
 * Extrahiert Text aus Word-Dokument (.docx)
 */
export async function extrahiereTextAusWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Analysiert Angebots-Dokument und extrahiert Bausteine + Angebotsdaten
 */
export async function analysiereAngebotsDokument(
  dokumentText: string
): Promise<ExtrahierteBausteine> {
  const prompt = `Du bist ein Experte für die Analyse von B+L Marktanalyse-Angeboten.

Analysiere das folgende Angebots-Dokument und extrahiere:

1. **Bausteine**: Alle angebotenen Leistungsbausteine mit:
   - Name (z.B. "Marktgröße/-entwicklung", "TOP-Anbieter")
   - Beschreibung (kurze Erklärung des Bausteins)
   - Einzelpreis in EUR (nur Zahlen, keine Währung)
   - Kategorie (z.B. "Marktdaten", "Wettbewerb", "Distribution")

2. **Angebotsdaten**:
   - Kundenname
   - Projekttitel
   - Länder (Liste aller genannten Länder)

DOKUMENT:
${dokumentText}

Antworte NUR mit einem JSON-Objekt in folgendem Format:
{
  "bausteine": [
    {
      "name": "Baustein-Name",
      "beschreibung": "Beschreibung",
      "einzelpreis": 2300,
      "kategorie": "Kategorie"
    }
  ],
  "angebotsdaten": {
    "kundenname": "Kundenname",
    "projekttitel": "Projekttitel",
    "laender": ["Deutschland", "Österreich"]
  }
}

Wichtig:
- Preise nur als Zahlen (ohne EUR, ohne Punkte/Kommas als Tausendertrennzeichen)
- Wenn Informationen fehlen, lasse Felder leer oder nutze leere Arrays
- Keine zusätzlichen Erklärungen, nur JSON`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Du bist ein Experte für strukturierte Datenextraktion aus Geschäftsdokumenten. Du antwortest ausschließlich mit validen JSON-Objekten.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "angebots_extraktion",
        strict: true,
        schema: {
          type: "object",
          properties: {
            bausteine: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  beschreibung: { type: "string" },
                  einzelpreis: { type: "number" },
                  kategorie: { type: "string" },
                },
                required: ["name", "beschreibung", "einzelpreis", "kategorie"],
                additionalProperties: false,
              },
            },
            angebotsdaten: {
              type: "object",
              properties: {
                kundenname: { type: "string" },
                projekttitel: { type: "string" },
                laender: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["kundenname", "projekttitel", "laender"],
              additionalProperties: false,
            },
          },
          required: ["bausteine", "angebotsdaten"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0].message.content;
  const jsonString = typeof content === "string" ? content : JSON.stringify(content);

  try {
    const extracted = JSON.parse(jsonString);
    return extracted as ExtrahierteBausteine;
  } catch (error) {
    throw new Error("Fehler beim Parsen der LLM-Antwort");
  }
}
