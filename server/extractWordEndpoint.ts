import { Router } from "express";
import { extrahiereTextAusWord } from "./dokumentExtraktion";

const router = Router();

router.post("/extract-word", async (req, res) => {
  try {
    const { fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: "Keine Datei übermittelt" });
    }

    // Base64 zu Buffer konvertieren
    const buffer = Buffer.from(fileData, "base64");

    // Text extrahieren
    const text = await extrahiereTextAusWord(buffer);

    res.json({ text });
  } catch (error) {
    console.error("Fehler bei Word-Extraktion:", error);
    res.status(500).json({ error: "Fehler beim Extrahieren des Textes" });
  }
});

export default router;
