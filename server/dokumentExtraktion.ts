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

  const responseText = await callOpenWebUI(
    [
      {
        role: "system",
        content:
          "Du bist ein Experte für strukturierte Datenextraktion aus Geschäftsdokumenten. Du antwortest ausschließlich mit validen JSON-Objekten ohne zusätzliche Erklärungen oder Markdown-Formatierung.",
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
