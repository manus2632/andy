import mammoth from "mammoth";

const OPENWEBUI_API_URL = process.env.OPENWEBUI_API_URL || "https://maxproxy.bl2020.com/api/chat/completions";
const OPENWEBUI_API_KEY = process.env.OPENWEBUI_API_KEY || "sk-bd621b0666474be1b054b3c5360b3cef";
const OPENWEBUI_MODEL = process.env.OPENWEBUI_MODEL || "gpt-oss:120b";

async function callOpenWebUI(messages: Array<{ role: string; content: string }>, responseFormat?: any): Promise<string> {
  const body: any = {
    model: OPENWEBUI_MODEL,
    messages,
    temperature: 0.3,
  };

  if (responseFormat) {
    body.response_format = responseFormat;
  }

  const response = await fetch(OPENWEBUI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENWEBUI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenWebUI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

interface ExtrahierteBausteine {
  bausteine: Array<{
    name: string;
    beschreibung: string;
    langbeschreibung: string;
    lieferumfang: string[];
    unterpunkte: Array<{
      titel: string;
      beschreibung: string;
      unterpunkte?: Array<{
        titel: string;
        beschreibung: string;
      }>;
    }>;
    methodik: string;
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

Analysiere das folgende Angebots-Dokument und extrahiere ALLE Details zu jedem Baustein:

1. **Bausteine**: Alle angebotenen Leistungsbausteine mit:
   - **name**: Baustein-Name (z.B. "Marktgröße/-entwicklung", "TOP-Anbieter")
   - **beschreibung**: Kurzbeschreibung (1-2 Sätze)
   - **langbeschreibung**: Detaillierte Beschreibung mit allen Absätzen aus dem Dokument (mehrere Absätze, vollständig)
   - **lieferumfang**: Array mit allen Lieferbestandteilen (z.B. ["Excel-Tabellen mit Marktdaten", "PDF-Report", "Telefonische Erläuterung"])
   - **unterpunkte**: Hierarchische Struktur mit Unterpunkten und deren Beschreibungen
   - **methodik**: Beschreibung der Erhebungsmethode (z.B. "Desk Research", "Experteninterviews", "Online-Befragung")
   - **einzelpreis**: Preis in EUR (nur Zahlen, keine Währung)
   - **kategorie**: Kategorie (z.B. "Marktdaten", "Wettbewerb", "Distribution")

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
      "name": "Marktgröße/-entwicklung",
      "beschreibung": "Analyse der Marktgröße und -entwicklung",
      "langbeschreibung": "Detaillierte mehrzeilige Beschreibung mit allen Absätzen aus dem Dokument. Hier steht der vollständige Text, der im Angebot zu diesem Baustein steht.",
      "lieferumfang": ["Excel-Tabellen mit Marktdaten", "PDF-Report", "Telefonische Erläuterung"],
      "unterpunkte": [
        {
          "titel": "Marktvolumen",
          "beschreibung": "Analyse des aktuellen Marktvolumens",
          "unterpunkte": [
            {
              "titel": "Nach Segmenten",
              "beschreibung": "Aufschlüsselung nach Produktsegmenten"
            }
          ]
        }
      ],
      "methodik": "Desk Research auf Basis von Marktdatenbanken, Geschäftsberichten und Branchenpublikationen",
      "einzelpreis": 2300,
      "kategorie": "Marktdaten"
    }
  ],
  "angebotsdaten": {
    "kundenname": "Kundenname",
    "projekttitel": "Projekttitel",
    "laender": ["Deutschland", "Österreich"]
  }
}

Wichtig:
- Extrahiere ALLE verfügbaren Details aus dem Dokument
- langbeschreibung soll den VOLLSTÄNDIGEN Text aus dem Dokument enthalten (mehrere Absätze)
- lieferumfang: Alle genannten Deliverables als Array
- unterpunkte: Hierarchische Struktur mit allen Untergliederungen
- methodik: Vollständige Beschreibung der Erhebungsmethode
- Preise nur als Zahlen (ohne EUR, ohne Punkte/Kommas als Tausendertrennzeichen)
- Wenn Informationen fehlen, nutze leere Strings oder leere Arrays
- Keine zusätzlichen Erklärungen, nur JSON`;

  const responseText = await callOpenWebUI(
    [
      {
        role: "system",
        content:
          "Du bist ein Experte für strukturierte Datenextraktion aus Geschäftsdokumenten. Du antwortest ausschließlich mit validen JSON-Objekten ohne zusätzliche Erklärungen oder Markdown-Formatierung. Extrahiere ALLE verfügbaren Details vollständig.",
      },
      { role: "user", content: prompt },
    ]
  );

  try {
    // Entferne eventuelle Markdown-Code-Blöcke
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }
    
    const extracted = JSON.parse(cleanedText);
    return extracted as ExtrahierteBausteine;
  } catch (error) {
    console.error("LLM-Antwort:", responseText);
    throw new Error(`Fehler beim Parsen der LLM-Antwort: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}
