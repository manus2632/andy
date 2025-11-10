import { Router } from "express";
import multer from "multer";
import { extrahiereTextAusWord } from "./dokumentExtraktion";

const router = Router();

// Multer für In-Memory-Upload konfigurieren
const upload = multer({ storage: multer.memoryStorage() });

router.post("/extract-word", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Keine Datei übermittelt" });
    }

    // Buffer direkt von Multer verwenden
    const buffer = req.file.buffer;

    // Text extrahieren
    const text = await extrahiereTextAusWord(buffer);

    res.json({ text });
  } catch (error) {
    console.error("Fehler bei Word-Extraktion:", error);
    res.status(500).json({ error: "Fehler beim Extrahieren des Textes" });
  }
});

export default router;
