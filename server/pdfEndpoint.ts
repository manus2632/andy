import express from 'express';
import { generiereAngebotPDF } from './pdfGenerator';
import { getDb } from './db';
import { angebote, angebotBausteine, bausteine, laender, angebotLaender, ansprechpartner } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const pdfRouter = express.Router();

pdfRouter.get('/angebot/:id/pdf', async (req, res) => {
  try {
    const angebotId = parseInt(req.params.id);
    const db = await getDb();
    
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // Angebot abrufen
    const [angebot] = await db.select().from(angebote).where(eq(angebote.id, angebotId));
    if (!angebot) {
      return res.status(404).json({ error: 'Angebot nicht gefunden' });
    }

    // Ansprechpartner abrufen
    let ansprechpartnerData = null;
    if (angebot.ansprechpartnerId) {
      const [ap] = await db.select().from(ansprechpartner).where(eq(ansprechpartner.id, angebot.ansprechpartnerId));
      ansprechpartnerData = ap;
    }

    // Bausteine abrufen
    const angebotBausteineData = await db
      .select({
        baustein: bausteine,
        angepassterPreis: angebotBausteine.angepassterPreis,
      })
      .from(angebotBausteine)
      .innerJoin(bausteine, eq(angebotBausteine.bausteinId, bausteine.id))
      .where(eq(angebotBausteine.angebotId, angebotId));

    // Länder abrufen
    const angebotLaenderData = await db
      .select({ land: laender })
      .from(angebotLaender)
      .innerJoin(laender, eq(angebotLaender.landId, laender.id))
      .where(eq(angebotLaender.angebotId, angebotId));

    // HTML generieren (LLM-Texte sind bereits im Angebot enthalten)
    const html = generiereAngebotHTML(angebot, angebotBausteineData, angebotLaenderData, ansprechpartnerData);

    // PDF generieren
    const pdfBuffer = await generiereAngebotPDF(html);

    // PDF senden
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Angebot_${angebot.kundenname}_${angebot.projekttitel}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF-Generierung fehlgeschlagen:', error);
    res.status(500).json({ error: 'PDF-Generierung fehlgeschlagen' });
  }
});

export function generiereAngebotHTML(
  angebot: any,
  bausteineData: any[],
  laenderData: any[],
  ansprechpartner: any
): string {
  const gesamtpreis = angebot.gesamtpreis.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const datum = new Date(angebot.gueltigkeitsdatum).toLocaleDateString('de-DE');

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #1a1a1a;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #1a1a1a;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    h3 {
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 1.1em;
    }
    .header {
      margin-bottom: 40px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-label {
      font-weight: 600;
      color: #666;
    }
    .baustein {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-left: 4px solid #000;
    }
    .baustein-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    }
    .baustein-name {
      font-size: 1.2em;
      font-weight: 600;
      color: #1a1a1a;
    }
    .baustein-preis {
      font-size: 1.1em;
      font-weight: 600;
      color: #000;
    }
    .baustein-beschreibung {
      margin-top: 10px;
      white-space: pre-wrap;
    }
    .baustein-section {
      margin-top: 15px;
    }
    .baustein-section-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    ul {
      margin: 5px 0;
      padding-left: 20px;
    }
    .gesamtpreis {
      margin-top: 40px;
      padding: 20px;
      background: #1a1a1a;
      color: white;
      text-align: right;
      font-size: 1.3em;
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
      font-size: 0.9em;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1 style="margin: 0; border: none;">Angebot</h1>
      <div style="text-align: right;">
        <div style="font-weight: 600; font-size: 1.2em;">B+L Marktdaten GmbH</div>
        <div style="color: #666; font-size: 0.9em;">Marktforschung & Consulting</div>
      </div>
    </div>
    <div class="info-grid">
      <div class="info-label">Kunde:</div>
      <div>${angebot.kundenname}</div>
      
      <div class="info-label">Projekttitel:</div>
      <div>${angebot.projekttitel}</div>
      
      <div class="info-label">Gültig bis:</div>
      <div>${datum}</div>
      
      ${ansprechpartner ? `
      <div class="info-label">Ansprechpartner:</div>
      <div>${ansprechpartner.name}${ansprechpartner.email ? ` (${ansprechpartner.email})` : ''}</div>
      ` : ''}
      
      <div class="info-label">Länder:</div>
      <div>${laenderData.map(l => l.land.name).join(', ')}</div>
      
      <div class="info-label">Lieferart:</div>
      <div>${angebot.lieferart === 'einmalig' ? 'Einmalige Lieferung' : 'Rahmenvertrag'}</div>
    </div>
  </div>

  ${angebot.llmFirmenvorstellung ? `
  <h2>Über B+L Marktdaten</h2>
  <div style="margin-bottom: 30px; white-space: pre-wrap;">${angebot.llmFirmenvorstellung}</div>
  ` : ''}

  ${angebot.llmKundenEinleitung ? `
  <h2>Einleitung</h2>
  <div style="margin-bottom: 30px; white-space: pre-wrap;">${angebot.llmKundenEinleitung}</div>
  ` : ''}

  <h2>Leistungsumfang</h2>
  ${bausteineData.map((item, index) => {
    const baustein = item.baustein;
    const preis = item.angepassterPreis || baustein.einzelpreis;
    
    return `
    <div class="baustein">
      <div class="baustein-header">
        <div class="baustein-name">${index + 1}. ${baustein.name}</div>
        <div class="baustein-preis">${preis.toLocaleString('de-DE')} EUR</div>
      </div>
      
      ${baustein.beschreibung ? `
      <div class="baustein-beschreibung">${baustein.beschreibung}</div>
      ` : ''}
      
      ${baustein.langbeschreibung ? `
      <div class="baustein-section">
        <div class="baustein-section-title">Detaillierte Beschreibung</div>
        <div class="baustein-beschreibung">${baustein.langbeschreibung}</div>
      </div>
      ` : ''}
      
      ${baustein.lieferumfang ? `
      <div class="baustein-section">
        <div class="baustein-section-title">Lieferumfang</div>
        <div class="baustein-beschreibung">${baustein.lieferumfang}</div>
      </div>
      ` : ''}
      
      ${baustein.unterpunkte ? `
      <div class="baustein-section">
        <div class="baustein-section-title">Unterpunkte</div>
        <div class="baustein-beschreibung">${baustein.unterpunkte}</div>
      </div>
      ` : ''}
      
      ${baustein.methodik ? `
      <div class="baustein-section">
        <div class="baustein-section-title">Methodik</div>
        <div class="baustein-beschreibung">${baustein.methodik}</div>
      </div>
      ` : ''}
    </div>
    `;
  }).join('')}

  <div class="gesamtpreis">
    Gesamtpreis: ${gesamtpreis} EUR
  </div>

  ${angebot.llmMethodik ? `
  <h2>Methodik</h2>
  <div style="margin-top: 30px; white-space: pre-wrap;">${angebot.llmMethodik}</div>
  ` : ''}

  <div class="footer">
    <p>Dieses Angebot wurde mit Bob - Angebotsgenerator erstellt.</p>
    <p>Gültig bis ${datum}. Alle Preise verstehen sich zzgl. MwSt.</p>
  </div>
</body>
</html>
  `;
}
