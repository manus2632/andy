import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AngebotUploadProps {
  onExtraktionErfolgreich: (data: {
    bausteine: Array<{ name: string; beschreibung: string; einzelpreis: number; kategorie: string }>;
    angebotsdaten: {
      kundenname: string;
      projekttitel: string;
      laender: string[];
    };
  }) => void;
}

export default function AngebotUpload({ onExtraktionErfolgreich }: AngebotUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const analysiereMutation = trpc.upload.analysiereAngebot.useMutation({
    onSuccess: (data) => {
      const stats = (data as any).statistik;
      if (stats) {
        const messages = [
          `${stats.hinzugefuegt} Bausteine hinzugefügt`,
          stats.uebersprungen > 0 ? `${stats.uebersprungen} Duplikate übersprungen` : null,
          stats.laenderGematcht !== undefined ? `${stats.laenderGematcht}/${stats.laenderGesamt} Länder zugeordnet` : null,
        ].filter(Boolean).join(", ");
        toast.success(messages);
      } else {
        toast.success("Angebot erfolgreich analysiert");
      }
      onExtraktionErfolgreich(data);
      setIsOpen(false);
      setFile(null);
      setProgress("");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
      setIsProcessing(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".docx")) {
        toast.error("Bitte nur .docx Dateien hochladen");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }

    setIsProcessing(true);
    setProgress("Dokument wird gelesen...");

    try {
      setProgress("Text wird extrahiert...");

      // FormData für Multipart-Upload verwenden
      const formData = new FormData();
      formData.append("file", file);

      // Text-Extraktion über separaten Endpoint
      const response = await fetch("/api/extract-word", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unbekannter Fehler" }));
        throw new Error(errorData.error || "Fehler bei der Text-Extraktion");
      }

      const { text } = await response.json();

      setProgress("Angebot wird analysiert...");

      // LLM-Analyse
      await analysiereMutation.mutateAsync({ dokumentText: text });

      setIsProcessing(false);
    } catch (error: any) {
      console.error("Upload-Fehler:", error);
      toast.error(`Fehler: ${error.message || 'Unbekannter Fehler'}`);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Altes Angebot importieren
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Angebot importieren</DialogTitle>
            <DialogDescription>
              Laden Sie ein altes Word-Angebot (.docx) hoch. Die Bausteine werden automatisch
              extrahiert und in die Bibliothek übernommen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isProcessing ? (
              <>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klicken zum Hochladen</span>
                      </p>
                      <p className="text-xs text-gray-500">Word-Dokument (.docx)</p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept=".docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                {file && (
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                )}

                <Button onClick={handleUpload} disabled={!file} className="w-full">
                  Analysieren
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600">{progress}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
