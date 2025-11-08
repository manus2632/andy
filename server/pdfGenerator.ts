import puppeteer from 'puppeteer';

export async function generiereAngebotPDF(angebotHtml: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    // HTML mit Styling setzen
    await page.setContent(angebotHtml, {
      waitUntil: 'networkidle0',
    });

    // PDF generieren
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
