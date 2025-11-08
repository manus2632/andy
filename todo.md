# Andy - B+L Angebotsgenerator TODO

## Phase 1: Grundfunktionen

- [x] Datenbankschema für Bausteine, Länder, Ansprechpartner, Angebote erstellen
- [x] Seed-Daten für Bausteine und Ansprechpartner einfügen
- [x] Backend: Preisberechnungslogik implementieren
- [x] Backend: tRPC Routers für Bausteine, Länder, Angebote erstellen
- [x] Frontend: Angebots-Eingabeformular entwickeln
- [x] Frontend: Live-Preisberechnung implementieren
- [x] Backend: HTML-Template für Angebot erstellen
- [ ] Backend: PDF-Generierung implementieren
- [x] Frontend: Angebots-Vorschau anzeigen
- [ ] Frontend: PDF-Download-Funktion

## Phase 2: Erweiterungen (später)

- [ ] Kundenlogin und Selbstkonfiguration
- [ ] Anbindung an Projekttool
- [ ] Mehrsprachigkeit
- [ ] Angebots-Historie und Verwaltung

## Baustein-Verwaltung

- [x] Backend: CRUD-Routers für Bausteine (Erstellen, Bearbeiten, Löschen)
- [x] Backend: Duplizieren-Funktion für Bausteine
- [x] Frontend: Baustein-Bibliothek Seite erstellen
- [x] Frontend: Suchfunktion für Bausteine
- [x] Frontend: Baustein erstellen Dialog
- [x] Frontend: Baustein bearbeiten Dialog
- [x] Frontend: Baustein duplizieren Funktion

## Individuelle Preisanpassung

- [x] Datenbankschema: Angepasste Preise pro Baustein im Angebot speichern
- [x] Backend: Preisberechnung mit individuellen Baustein-Preisen
- [x] Frontend: Preisanpassungs-Dialog für Bausteine
- [x] Frontend: Anzeige angepasster Preise im Formular
- [x] Angebot: Nur Endpreise anzeigen, keine Anpassungshinweise

## Routing-Optimierung

- [x] Startseite entfernen, direkt zur Angebotserstellung weiterleiten
- [x] Navigation anpassen

## Vorschau-Problem

- [x] Vorschau-Fehler analysieren und beheben

## LLM-Integration für dynamische Texte

- [x] Backend: LLM-Service mit austauschbarer Konfiguration
- [x] Backend: Firmenvorstellung per LLM generieren
- [x] Backend: Methodikbeschreibung per LLM generieren
- [ ] Backend: Optional Web-Recherche für Kunden-News
- [x] Backend: Texte bei Angebotserstellung generieren und speichern
- [x] Frontend: Generierte Texte in Vorschau anzeigen
- [x] Dokumentation: ENV-Variablen für IT-Kollegen

## Word-Dokument Upload & Extraktion

- [x] Backend: Word-Dokument Upload-Endpoint
- [x] Backend: Text-Extraktion aus .docx
- [x] Backend: LLM-Analyse zur Extraktion von Bausteinen und Angebotsdaten
- [x] Backend: Automatisches Speichern in Baustein-Bibliothek
- [x] Frontend: Upload-Dialog auf Angebotserstellungs-Seite
- [x] Frontend: Fortschrittsanzeige während Verarbeitung
- [x] Frontend: Vorschau der extrahierten Daten

## Deduplizierung

- [x] Backend: Prüfung auf existierende Bausteine (Name + Einzelpreis)
- [x] Backend: Überspringen von Duplikaten beim Upload
- [x] Frontend: Feedback über übersprungene Duplikate

## Angebots-Archiv

- [x] Backend: Angebots-Liste mit allen gespeicherten Angeboten
- [x] Backend: Angebot duplizieren mit neuem Namen
- [x] Backend: Angebot aktualisieren
- [x] Frontend: Archiv-Seite mit Tabelle
- [x] Frontend: Sortierung nach Datum, Projekttitel, Kunde, Ansprechpartner
- [x] Frontend: Suchfunktion
- [x] Frontend: Angebot bearbeiten (lädt Daten in Formular)
- [ ] Frontend: Export-Funktion (PDF)

## OpenWebUI Integration

- [x] LLM-Service auf OpenWebUI umstellen
- [x] API-Credentials als ENV-Variablen
- [x] Alle LLM-Aufrufe auf neues System migrieren
- [x] Dokumentation aktualisieren

## Sidebar-Navigation

- [x] Sidebar-Layout-Komponente erstellen
- [x] Navigation mit Icons (Angebote, Archiv, Bausteine)
- [x] Aktiver Menüpunkt-Highlighting
- [x] Responsive Sidebar (collapsible)

## Angebots-Versionierung

- [x] Datenbankschema: Versions-Tabelle
- [x] Backend: Version erstellen bei Änderungen
- [x] Backend: Versionshistorie abrufen
- [x] Frontend: Versionshistorie anzeigen
- [ ] Frontend: Ältere Version wiederherstellen (optional)
- [ ] Frontend: Versionen vergleichen (optional)

## Status-Workflow

- [x] Backend: Status auf "fertig" setzen
- [x] Frontend: "Angebot abschließen"-Button in Vorschau
- [x] Frontend: Status-Badge in Archiv

## Angebots-Bearbeitung

- [x] Backend: Angebot aktualisieren
- [x] Backend: Automatische Versionierung bei Änderungen
- [x] Frontend: "Bearbeiten"-Button im Archiv
- [x] Frontend: Formular mit vorausgefüllten Daten
- [x] Frontend: Update statt Create bei Bearbeitung

## Erweiterte Bausteinstruktur

- [x] Datenbankschema: Zusätzliche Felder für detaillierte Bausteinbeschreibung
- [x] Datenbankschema: Unterpunkte/Lieferumfang pro Baustein
- [x] Backend: CRUD für erweiterte Bausteinfelder
- [x] Frontend: Erweiterte Baustein-Eingabefelder (Beschreibung, Unterpunkte)
- [x] Frontend: Anzeige detaillierter Bausteine im Angebot
- [ ] LLM: Generierung detaillierter Bausteinbeschreibungen aus Vorlagen

## Umbenennung zu "Bob"

- [x] APP_TITLE in const.ts auf "Bob" ändern
- [x] Schlichtes Text-Logo erstellen (SVG)
- [x] Logo in const.ts referenzieren
- [x] Alle "Andy"-Referenzen in Code ersetzen

## Sidebar-Korrektur

- [x] Untertitel "Andy - B+L Angebotsgenerator" entfernen oder auf "Bob" ändern

## Upload-Funktion reparieren

- [x] Upload-Vorausfüllung testen
- [x] Fehler in Formular-Vorausfüllung beheben

## PDF-Generator

- [x] Backend: PDF-Generierung mit puppeteer
- [x] Backend: PDF-Endpoint für Angebote
- [x] Frontend: PDF-Download-Button in AngebotVorschau
- [x] PDF enthält nur Angebots-Inhalt (ohne Sidebar/Navigation)

## LLM-Texte und Logo in PDF

- [x] LLM-generierte Firmenvorstellung in PDF einfügen
- [x] LLM-generierte Methodikbeschreibung in PDF einfügen
- [x] B+L Logo im PDF-Header platzieren (als Text)

## Seed-Daten aus Vorlagen

- [x] Word-Vorlagen analysieren für Bausteinbeschreibungen
- [x] Seed-Script mit detaillierten Bausteinen erstellen
- [x] Seed-Daten in Datenbank importieren

## E-Mail-Versand

- [x] Backend: E-Mail-Service mit nodemailer
- [x] Backend: PDF als Anhang generieren
- [x] Backend: E-Mail-Template für Angebote
- [x] Backend: Status auf "gesendet" aktualisieren
- [x] Frontend: E-Mail-Versand-Dialog mit Empfänger-Eingabe
- [x] Frontend: E-Mail-Button in AngebotVorschau
