import nodemailer from 'nodemailer';

// E-Mail-Konfiguration aus ENV-Variablen
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@bl-marktdaten.de';

/**
 * E-Mail-Transporter erstellen
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
}

/**
 * Angebot per E-Mail versenden
 */
export async function sendeAngebotEmail(
  empfaengerEmail: string,
  kundenname: string,
  projekttitel: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: EMAIL_FROM,
      to: empfaengerEmail,
      subject: `Angebot: ${projekttitel}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Ihr Angebot von B+L Marktdaten</h2>
          
          <p>Sehr geehrte Damen und Herren,</p>
          
          <p>vielen Dank für Ihr Interesse an unseren Marktanalysen.</p>
          
          <p>Im Anhang finden Sie unser detailliertes Angebot für das Projekt <strong>${projekttitel}</strong>.</p>
          
          <p>Das Angebot umfasst:</p>
          <ul>
            <li>Detaillierte Leistungsbeschreibungen</li>
            <li>Transparente Preisgestaltung</li>
            <li>Informationen zu unserer Methodik</li>
            <li>Lieferumfang und Zeitplan</li>
          </ul>
          
          <p>Bei Fragen oder Anmerkungen stehen wir Ihnen gerne zur Verfügung.</p>
          
          <p>Mit freundlichen Grüßen<br>
          <strong>B+L Marktdaten GmbH</strong><br>
          Marktforschung & Consulting</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 0.9em; color: #666;">
            Diese E-Mail wurde automatisch generiert mit Bob - Angebotsgenerator.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Angebot_${kundenname}_${projekttitel}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('E-Mail-Versand fehlgeschlagen:', error);
    return false;
  }
}
