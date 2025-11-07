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
