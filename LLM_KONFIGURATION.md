# LLM-Konfiguration für Andy Angebotsgenerator

## Aktuelle Konfiguration

Andy nutzt aktuell das **Manus Built-in LLM** (GPT-4o-mini) für die Generierung von Angebots-Texten.

## Umstellung auf eigenes Ollama-Modell

Für die Nutzung eines intern gehosteten Ollama-Modells sind folgende Schritte erforderlich:

### 1. LLM-Service anpassen

Datei: `server/_core/llm.ts`

Die Funktion `invokeLLM` muss angepasst werden, um statt der Manus-API das eigene Ollama zu verwenden.

**Beispiel-Implementation für Ollama:**

```typescript
import { ENV } from './env';

export async function invokeLLM(params: {
  messages: Array<{ role: string; content: string }>;
}) {
  const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://localhost:11434';
  const LLM_MODEL = process.env.LLM_MODEL_NAME || 'llama3';

  const response = await fetch(`${LLM_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: params.messages,
      stream: false,
    }),
  });

  const data = await response.json();
  
  return {
    choices: [{
      message: {
        content: data.message.content
      }
    }]
  };
}
```

### 2. Umgebungsvariablen setzen

Fügen Sie folgende ENV-Variablen hinzu:

```bash
LLM_BASE_URL=http://your-ollama-server:11434
LLM_MODEL_NAME=gpt4o-mini  # oder llama3, mistral, etc.
```

### 3. Keine weiteren Änderungen erforderlich

Der restliche Code in `server/llmService.ts` funktioniert unverändert, da die Schnittstelle gleich bleibt.

## Generierte Texte

Andy generiert bei jeder Angebotserstellung automatisch:

1. **Firmenvorstellung**: Individualisiert basierend auf Kunde, Projekt und Analysebereichen
2. **Methodikbeschreibung**: Angepasst an die spezifischen Bausteine und Länder

Die Texte werden in der Datenbank gespeichert (Felder: `llmFirmenvorstellung`, `llmMethodik`) und im Angebot angezeigt.

## Zukünftige Erweiterungen

- **Web-Recherche**: Funktion `sucheKundenNews()` in `server/llmService.ts` kann erweitert werden
- **Kundenspezifische Einleitung**: Basierend auf aktuellen News über den Kunden
