import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { APP_TITLE } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {APP_TITLE}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Automatisierte Erstellung von B+L Marktanalyse-Angeboten
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Professionelle Angebote mit HTML/PDF-Export und intelligenter Preiskalkulation
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/angebot/erstellen")}
              className="px-8 py-6 text-lg"
            >
              Neues Angebot erstellen
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/bausteine")}
              className="px-8 py-6 text-lg"
            >
              Baustein-Bibliothek
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Intelligente Kalkulation</h3>
              <p className="text-gray-600 text-sm">
                Automatische Rabattberechnung basierend auf Länderanzahl und Lieferart
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">PDF-Export</h3>
              <p className="text-gray-600 text-sm">
                Professionelle Angebotsdokumente mit B+L Corporate Design
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Schnell & Einfach</h3>
              <p className="text-gray-600 text-sm">
                Angebote in wenigen Minuten erstellen statt Stunden
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
