# LLM-Konfiguration für Andy Angebotsgenerator

## Aktuelle Konfiguration

Andy nutzt **OpenWebUI** mit folgendem Setup:

- **API-Endpunkt**: `https://maxproxy.bl2020.com/api/chat/completions`
- **Modell**: `gpt-oss:120b`
- **Authentifizierung**: Bearer Token

## Umgebungsvariablen

Die LLM-Konfiguration erfolgt über folgende ENV-Variablen:

```bash
# OpenWebUI API-Endpunkt
OPENWEBUI_API_URL=https://maxproxy.bl2020.com/api/chat/completions

# API Bearer Token
OPENWEBUI_API_KEY=sk-bd621b0666474be1b054b3c5360b3cef

# Modellname
OPENWEBUI_MODEL=gpt-oss:120b
```

## Konfiguration ändern

### Wechsel zu anderem OpenWebUI-Server

1. ENV-Variablen anpassen:
   ```bash
   OPENWEBUI_API_URL=https://ihr-server.com/api/chat/completions
   OPENWEBUI_API_KEY=ihr-api-key
   OPENWEBUI_MODEL=ihr-modell
   ```

2. Server neu starten

### Wechsel zu anderem LLM-Provider

Um zu einem anderen OpenAI-kompatiblen Provider zu wechseln:

1. ENV-Variablen setzen:
   ```bash
   OPENWEBUI_API_URL=http://ihr-server:11434/v1/chat/completions
   OPENWEBUI_API_KEY=ihr-api-key
   OPENWEBUI_MODEL=llama3
   ```

2. API-Kompatibilität prüfen: Der neue Endpunkt muss OpenAI-kompatibles Format unterstützen

3. Server neu starten

## Verwendete LLM-Funktionen

Andy nutzt das LLM für:

### 1. Firmenvorstellung generieren
**Datei**: `server/llmService.ts` → `generiereFirmenvorstellung()`

Erstellt individualisierte Firmenvorstellung basierend auf:
- Kundenname
- Projekttitel
- Analysebereiche (Bausteine)
- Länder

### 2. Methodikbeschreibung generieren
**Datei**: `server/llmService.ts` → `generiereMethodik()`

Erstellt detaillierte Methodikbeschreibung basierend auf:
- Projekttitel
- Analysebereiche
- Länder

### 3. Word-Dokumente analysieren
**Datei**: `server/dokumentExtraktion.ts` → `analysiereAngebotsDokument()`

Extrahiert strukturierte Daten aus hochgeladenen Angeboten:
- Bausteine (Name, Beschreibung, Preis, Kategorie)
- Angebotsdaten (Kunde, Projekt, Länder)

Nutzt JSON-Schema für strukturierte Ausgabe.

## Wichtige Hinweise

- **Keine Code-Änderungen nötig**: Nur ENV-Variablen anpassen
- **API-Kompatibilität**: Neuer Endpunkt muss OpenAI-kompatibel sein
- **JSON-Schema Support**: Für Dokument-Extraktion wird `response_format` mit JSON-Schema benötigt
- **Modellleistung**: Modell sollte für Textgenerierung und strukturierte Ausgaben geeignet sein
- **Fehlerbehandlung**: Bei API-Fehlern wird eine aussagekräftige Fehlermeldung ausgegeben

## Generierte Texte

Bei jeder Angebotserstellung werden automatisch generiert:

1. **Firmenvorstellung** (Feld: `llmFirmenvorstellung`)
2. **Methodikbeschreibung** (Feld: `llmMethodik`)

Die Texte werden in der Datenbank gespeichert und im Angebot angezeigt.

## Zukünftige Erweiterungen

- **Web-Recherche**: Funktion `sucheKundenNews()` in `server/llmService.ts` kann erweitert werden
- **Kundenspezifische Einleitung**: Basierend auf aktuellen News über den Kunden (Funktion `generiereKundenspezifischeEinleitung()`)
