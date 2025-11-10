import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

/**
 * Interaktiver Konfigurator für Kunden
 * Ermöglicht Auswahl von Bausteinen und Ländern mit Live-Preisberechnung
 */
export default function Konfigurator() {
  const [selectedBausteine, setSelectedBausteine] = useState<number[]>([]);
  const [selectedLaender, setSelectedLaender] = useState<number[]>([]);
  const [kundenname, setKundenname] = useState("");
  const [email, setEmail] = useState("");

  const { data: bausteine, isLoading: bausteineLoading } = trpc.bausteine.list.useQuery();
  const { data: laender, isLoading: laenderLoading } = trpc.laender.list.useQuery();

  // URL-Parameter auslesen und Vorauswahl setzen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bausteinParam = params.get('bausteine');
    const laenderParam = params.get('laender');

    if (bausteinParam) {
      const ids = bausteinParam.split(',').map(Number).filter(n => !isNaN(n));
      setSelectedBausteine(ids);
    }

    if (laenderParam) {
      const ids = laenderParam.split(',').map(Number).filter(n => !isNaN(n));
      setSelectedLaender(ids);
    }
  }, []);

  // Live-Preisberechnung
  const berechnung = useMemo(() => {
    if (!bausteine || selectedBausteine.length === 0) {
      return { basispreis: 0, preisProLand: 0, gesamtpreis: 0 };
    }

    const basispreis = selectedBausteine.reduce((sum, id) => {
      const baustein = bausteine.find((b: any) => b.id === id);
      return sum + (baustein?.einzelpreis || 0);
    }, 0);

    const preisProLand = Math.round(basispreis * 0.6);
    const anzahlLaender = selectedLaender.length;
    const gesamtpreis = basispreis + (preisProLand * anzahlLaender);

    return { basispreis, preisProLand, gesamtpreis };
  }, [bausteine, selectedBausteine, selectedLaender]);

  const toggleBaustein = (id: number) => {
    setSelectedBausteine(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleLand = (id: number) => {
    setSelectedLaender(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleAnfrage = () => {
    if (!kundenname || !email) {
      toast.error("Bitte geben Sie Ihren Namen und E-Mail-Adresse ein");
      return;
    }
    if (selectedBausteine.length === 0) {
      toast.error("Bitte wählen Sie mindestens einen Baustein aus");
      return;
    }
    if (selectedLaender.length === 0) {
      toast.error("Bitte wählen Sie mindestens ein Land aus");
      return;
    }

    // TODO: Anfrage an Backend senden
    toast.success("Vielen Dank! Wir werden uns in Kürze bei Ihnen melden.");
  };

  if (bausteineLoading || laenderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Angebots-Konfigurator</h1>
              <p className="text-sm text-gray-600">Stellen Sie Ihr individuelles Angebot zusammen</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Linke Spalte: Auswahl */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bausteine */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">1. Wählen Sie Ihre Leistungen</h2>
              <div className="space-y-4">
                {bausteine && bausteine.map((baustein: any) => (
                  <div
                    key={baustein.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedBausteine.includes(baustein.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleBaustein(baustein.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedBausteine.includes(baustein.id)}
                        onCheckedChange={() => toggleBaustein(baustein.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{baustein.name}</h3>
                            {baustein.beschreibung && (
                              <p className="text-sm text-gray-600 mt-1">{baustein.beschreibung}</p>
                            )}
                            {baustein.kategorie && (
                              <span className="inline-block mt-2 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {baustein.kategorie}
                              </span>
                            )}
                          </div>
                          {baustein.bildUrl && (
                            <img
                              src={baustein.bildUrl}
                              alt={baustein.name}
                              className="w-20 h-20 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="mt-2 text-lg font-bold text-blue-600">
                          {baustein.einzelpreis.toLocaleString('de-DE')} EUR
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Länder */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">2. Wählen Sie Ihre Zielmärkte</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {laender && laender.map((land: any) => (
                  <div
                    key={land.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedLaender.includes(land.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => toggleLand(land.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedLaender.includes(land.id)}
                        onCheckedChange={() => toggleLand(land.id)}
                      />
                      <span className="text-sm font-medium">{land.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Kontaktdaten */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">3. Ihre Kontaktdaten</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="kundenname">Ihr Name / Firma *</Label>
                  <Input
                    id="kundenname"
                    value={kundenname}
                    onChange={(e) => setKundenname(e.target.value)}
                    placeholder="Max Mustermann GmbH"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@mustermann.de"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Rechte Spalte: Zusammenfassung */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ihre Auswahl
              </h2>

              {/* Gewählte Bausteine */}
              {selectedBausteine.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Leistungen:</h3>
                  <ul className="space-y-1">
                    {selectedBausteine.map(id => {
                      const baustein = bausteine?.find((b: any) => b.id === id);
                      return baustein ? (
                        <li key={id} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{baustein.name}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              {/* Gewählte Länder */}
              {selectedLaender.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Zielmärkte:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLaender.map(id => {
                      const land = laender?.find((l: any) => l.id === id);
                      return land ? (
                        <span key={id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {land.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Preisberechnung */}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Basispreis:</span>
                  <span className="font-semibold">{berechnung.basispreis.toLocaleString('de-DE')} EUR</span>
                </div>
                {selectedLaender.length > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Preis pro Land:</span>
                      <span>{berechnung.preisProLand.toLocaleString('de-DE')} EUR</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>× {selectedLaender.length} Länder:</span>
                      <span>{(berechnung.preisProLand * selectedLaender.length).toLocaleString('de-DE')} EUR</span>
                    </div>
                  </>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamtpreis:</span>
                    <span className="text-blue-600">{berechnung.gesamtpreis.toLocaleString('de-DE')} EUR</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleAnfrage}
                disabled={selectedBausteine.length === 0 || selectedLaender.length === 0 || !kundenname || !email}
              >
                Unverbindliche Anfrage senden
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Alle Preise zzgl. MwSt. Unverbindliches Angebot.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
