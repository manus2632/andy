# Andy Angebotsgenerator - Technikbeschreibung

## Tech Stack Übersicht

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS 4
- **UI-Komponenten**: shadcn/ui
- **Routing**: Wouter
- **API-Client**: tRPC React Query
- **Build-Tool**: Vite 7
- **Sprache**: TypeScript

### Backend
- **Runtime**: Node.js 22
- **Framework**: Express 4
- **API**: tRPC 11 (Type-safe RPC)
- **Authentifizierung**: Manus OAuth
- **Sprache**: TypeScript

### Datenbank
- **System**: MySQL/TiDB (kompatibel)
- **ORM**: Drizzle ORM
- **Migrations**: Drizzle Kit

### LLM-Integration
- **Provider**: OpenWebUI
- **API-Endpunkt**: https://maxproxy.bl2020.com/api/chat/completions
- **Modell**: gpt-oss:120b
- **Verwendung**: 
  - Firmenvorstellung generieren
  - Methodikbeschreibung generieren
  - Word-Dokumente analysieren

### Externe Abhängigkeiten
- **Word-Verarbeitung**: mammoth (DOCX zu Text)
- **Datumsformatierung**: date-fns
- **Superjson**: Automatische Serialisierung (Date-Objekte)

## Architektur

### Monorepo-Struktur
```
andy/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/      # Seiten-Komponenten
│   │   ├── components/ # UI-Komponenten
│   │   └── lib/        # tRPC Client
│   └── public/         # Statische Assets
├── server/             # Backend (Express + tRPC)
│   ├── _core/          # Framework-Code (OAuth, Context)
│   ├── routers.ts      # tRPC API-Definitionen
│   ├── db.ts           # Datenbankhelfer
│   ├── llmService.ts   # LLM-Integration
│   └── dokumentExtraktion.ts
├── drizzle/            # Datenbankschema & Migrations
│   └── schema.ts
└── shared/             # Geteilte Typen & Konstanten
```

### API-Kommunikation
- **tRPC**: Type-safe End-to-End API
- **Superjson**: Automatische Serialisierung komplexer Typen
- **React Query**: Caching & State Management

### Authentifizierung
- **Manus OAuth**: Integriertes SSO-System
- **Session-basiert**: HTTP-only Cookies
- **Protected Procedures**: Automatische User-Injection

## Deployment-Anforderungen

### System-Anforderungen
- **Node.js**: Version 22.x
- **pnpm**: Version 10.x (Package Manager)
- **MySQL/TiDB**: Version 8.0+ (oder kompatibel)
- **Speicher**: Mindestens 512 MB RAM
- **Ports**: 
  - 3000 (Standard, konfigurierbar)
  - Auto-Port-Detection bei Konflikten

### Umgebungsvariablen (ENV)

#### Datenbank
```bash
DATABASE_URL=mysql://user:password@host:port/database
```

#### Authentifizierung (Manus)
```bash
JWT_SECRET=<generiert>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=<app-id>
OWNER_OPEN_ID=<owner-id>
OWNER_NAME=<owner-name>
```

#### LLM (OpenWebUI)
```bash
OPENWEBUI_API_URL=https://maxproxy.bl2020.com/api/chat/completions
OPENWEBUI_API_KEY=sk-bd621b0666474be1b054b3c5360b3cef
OPENWEBUI_MODEL=gpt-oss:120b
```

#### Frontend-Konfiguration
```bash
VITE_APP_TITLE=Andy - B+L Angebotsgenerator
VITE_APP_LOGO=<logo-url>
```

### Build & Deployment

#### Development
```bash
pnpm install
pnpm db:push          # Datenbank-Schema erstellen
pnpm dev              # Dev-Server starten (Port 3000)
```

#### Production Build
```bash
pnpm install --prod
pnpm build            # Frontend + Backend kompilieren
pnpm start            # Production-Server starten
```

#### Datenbank-Setup
```bash
# Schema erstellen
pnpm db:push

# Optional: Seed-Daten einfügen
npx tsx scripts/seed.ts
```

### Deployment-Optionen

#### Option 1: Bare Metal / VM
1. Node.js 22 installieren
2. pnpm installieren
3. Repository klonen
4. ENV-Variablen setzen
5. `pnpm install && pnpm build`
6. Process Manager (PM2) für Prozess-Management
7. Nginx als Reverse Proxy

#### Option 2: Docker
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

#### Option 3: Platform-as-a-Service
- Vercel, Railway, Render, etc.
- Automatisches Build & Deployment
- ENV-Variablen über Dashboard

### Reverse Proxy (Nginx Beispiel)
```nginx
server {
    listen 80;
    server_name andy.ihr-domain.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS
- Let's Encrypt mit Certbot empfohlen
- Automatische Zertifikatserneuerung

## Performance & Skalierung

### Caching
- React Query: Frontend-Caching
- Superjson: Effiziente Serialisierung

### Datenbank
- Drizzle ORM: Optimierte Queries
- Connection Pooling: Automatisch
- Indizes: Auf häufig abgefragten Feldern

### Skalierung
- **Horizontal**: Load Balancer + mehrere Instanzen
- **Vertikal**: CPU/RAM erhöhen
- **Datenbank**: Read Replicas für Lesezugriffe

## Monitoring & Logging

### Empfohlene Tools
- **Application Monitoring**: PM2, New Relic
- **Error Tracking**: Sentry
- **Logs**: Winston, Pino
- **Uptime**: UptimeRobot, Pingdom

### Logging-Punkte
- API-Fehler (tRPC)
- LLM-API-Fehler
- Datenbank-Verbindungsfehler
- Authentifizierungsfehler

## Sicherheit

### Implementiert
- HTTP-only Session Cookies
- CSRF-Protection (tRPC)
- SQL-Injection-Schutz (Drizzle ORM)
- Input-Validierung (Zod)
- Protected API-Endpoints

### Empfehlungen
- HTTPS erzwingen
- Rate Limiting (z.B. express-rate-limit)
- Helmet.js für Security Headers
- Regelmäßige Dependency-Updates

## Backup & Recovery

### Datenbank-Backup
```bash
# MySQL Backup
mysqldump -u user -p database > backup.sql

# Restore
mysql -u user -p database < backup.sql
```

### Automatisierung
- Cron-Job für tägliche Backups
- S3/Object Storage für Backup-Speicherung
- Retention Policy: 30 Tage

## Wartung

### Updates
```bash
# Dependencies aktualisieren
pnpm update

# Security-Patches
pnpm audit
pnpm audit fix
```

### Datenbank-Migrationen
```bash
# Schema-Änderungen
pnpm db:push

# Bei Problemen: Rollback über Backup
```

## Support & Dokumentation

### Wichtige Dateien
- `README.md`: Projekt-Übersicht
- `LLM_KONFIGURATION.md`: LLM-Setup
- `todo.md`: Feature-Tracking
- `TECHSTACK.md`: Diese Datei

### Kontakt
- Projekt: Andy - B+L Angebotsgenerator
- Framework: Manus Web Template (tRPC + Auth + DB)
