# Andy Deployment-Anleitung

## Schnellstart für Live-Server

### Voraussetzungen
- Linux-Server (Ubuntu 22.04 empfohlen)
- Root- oder Sudo-Zugriff
- Domain (optional, für SSL)

### 1. Server vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 22 installieren
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm installieren
npm install -g pnpm

# MySQL installieren (falls nicht vorhanden)
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### 2. Datenbank einrichten

```bash
# MySQL-Shell öffnen
sudo mysql

# Datenbank und User erstellen
CREATE DATABASE andy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'andy_user'@'localhost' IDENTIFIED BY 'SICHERES_PASSWORT';
GRANT ALL PRIVILEGES ON andy.* TO 'andy_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Anwendung deployen

```bash
# Projekt-Verzeichnis erstellen
sudo mkdir -p /var/www/andy
sudo chown $USER:$USER /var/www/andy
cd /var/www/andy

# Repository klonen (oder Dateien hochladen)
# git clone <repository-url> .
# ODER: Dateien per SCP/SFTP hochladen

# Dependencies installieren
pnpm install --prod

# ENV-Variablen setzen (siehe unten)
nano .env

# Datenbank-Schema erstellen
pnpm db:push

# Optional: Seed-Daten einfügen
npx tsx scripts/seed.ts

# Production Build
pnpm build
```

### 4. ENV-Variablen konfigurieren

Erstellen Sie `.env` im Projekt-Root:

```bash
# Datenbank
DATABASE_URL=mysql://andy_user:SICHERES_PASSWORT@localhost:3306/andy

# OpenWebUI LLM
OPENWEBUI_API_URL=https://maxproxy.bl2020.com/api/chat/completions
OPENWEBUI_API_KEY=sk-bd621b0666474be1b054b3c5360b3cef
OPENWEBUI_MODEL=gpt-oss:120b

# Manus OAuth (falls verwendet)
JWT_SECRET=<generiertes-secret>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=<ihre-app-id>
OWNER_OPEN_ID=<owner-id>
OWNER_NAME=<owner-name>

# Frontend
VITE_APP_TITLE=Andy - B+L Angebotsgenerator
VITE_APP_LOGO=<logo-url>

# Production Mode
NODE_ENV=production
```

### 5. Process Manager (PM2)

```bash
# PM2 installieren
npm install -g pm2

# Anwendung starten
pm2 start npm --name "andy" -- start

# Auto-Start bei Server-Neustart
pm2 startup
pm2 save

# Status prüfen
pm2 status
pm2 logs andy

# Neustart
pm2 restart andy
```

### 6. Nginx Reverse Proxy

```bash
# Nginx installieren
sudo apt install -y nginx

# Konfiguration erstellen
sudo nano /etc/nginx/sites-available/andy
```

**Nginx-Konfiguration:**

```nginx
server {
    listen 80;
    server_name andy.ihr-domain.de;

    # Größere Upload-Limits für Word-Dokumente
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts für LLM-Anfragen
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

```bash
# Konfiguration aktivieren
sudo ln -s /etc/nginx/sites-available/andy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL mit Let's Encrypt

```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d andy.ihr-domain.de

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## Alternative: Docker Deployment

### Dockerfile erstellen

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

# Source Code
COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://andy_user:password@db:3306/andy
      - OPENWEBUI_API_URL=https://maxproxy.bl2020.com/api/chat/completions
      - OPENWEBUI_API_KEY=sk-bd621b0666474be1b054b3c5360b3cef
      - OPENWEBUI_MODEL=gpt-oss:120b
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=andy
      - MYSQL_USER=andy_user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
```

```bash
# Starten
docker-compose up -d

# Logs
docker-compose logs -f

# Stoppen
docker-compose down
```

## Wartung & Monitoring

### Logs prüfen
```bash
# PM2 Logs
pm2 logs andy

# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup-Strategie

```bash
# Datenbank-Backup (täglich via Cron)
mysqldump -u andy_user -p andy > /backup/andy_$(date +%Y%m%d).sql

# Cron-Job einrichten
crontab -e
# Täglich um 2 Uhr nachts
0 2 * * * mysqldump -u andy_user -pPASSWORT andy > /backup/andy_$(date +\%Y\%m\%d).sql
```

### Updates deployen

```bash
cd /var/www/andy

# Code aktualisieren
git pull  # oder neue Dateien hochladen

# Dependencies aktualisieren
pnpm install --prod

# Datenbank-Schema aktualisieren (falls nötig)
pnpm db:push

# Neu bauen
pnpm build

# Anwendung neu starten
pm2 restart andy
```

## Troubleshooting

### Port bereits belegt
```bash
# Port-Nutzung prüfen
sudo lsof -i :3000

# Prozess beenden
sudo kill -9 <PID>
```

### Datenbank-Verbindungsfehler
```bash
# MySQL-Status prüfen
sudo systemctl status mysql

# Verbindung testen
mysql -u andy_user -p -h localhost andy
```

### LLM-API-Fehler
```bash
# API-Erreichbarkeit testen
curl -X POST https://maxproxy.bl2020.com/api/chat/completions \
  -H "Authorization: Bearer sk-bd621b0666474be1b054b3c5360b3cef" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-oss:120b","messages":[{"role":"user","content":"test"}]}'
```

### Nginx-Fehler
```bash
# Konfiguration testen
sudo nginx -t

# Logs prüfen
sudo tail -f /var/log/nginx/error.log
```

## Performance-Optimierung

### PM2 Cluster-Modus
```bash
# Mehrere Instanzen starten
pm2 start npm --name "andy" -i max -- start
```

### Nginx Caching
```nginx
# In Nginx-Config hinzufügen
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=andy_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache andy_cache;
    proxy_cache_valid 200 10m;
    # ... restliche Proxy-Einstellungen
}
```

## Sicherheit

### Firewall einrichten
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Fail2Ban (Brute-Force-Schutz)
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Support

Bei Problemen:
1. Logs prüfen (PM2, Nginx, MySQL)
2. ENV-Variablen verifizieren
3. Datenbank-Verbindung testen
4. LLM-API-Erreichbarkeit prüfen
