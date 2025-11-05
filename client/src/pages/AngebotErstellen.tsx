import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Settings } from "lucide-react";

interface BausteinMitPreis {
  bausteinId: number;
  angepassterPreis?: number;
  anpassungsTyp?: "direkt" | "prozent";
  anpassungsWert?: number;
}

export default function AngebotErstellen() {
  const [, setLocation] = useLocation();

  // Form state
  const [kundenname, setKundenname] = useState("");
  const [projekttitel, setProjekttitel] = useState("");
  const [gueltigkeitsdatum, setGueltigkeitsdatum] = useState("");
  const [ansprechpartnerId, setAnsprechpartnerId] = useState<string>("");
  const [selectedBausteine, setSelectedBausteine] = useState<BausteinMitPreis[]>([]);
  const [selectedLaender, setSelectedLaender] = useState<number[]>([]);
  const [lieferart, setLieferart] = useState<"einmalig" | "rahmenvertrag">("einmalig");

  // Price adjustment dialog
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [currentBaustein, setCurrentBaustein] = useState<number | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"direkt" | "prozent">("direkt");
  const [adjustmentValue, setAdjustmentValue] = useState<string>("");

  // Queries
  const { data: bausteine = [], isLoading: bausteineLoading } = trpc.bausteine.list.useQuery();
  const { data: laender = [], isLoading: laenderLoading } = trpc.laender.list.useQuery();
  const { data: ansprechpartner = [], isLoading: ansprechpartnerLoading } =
    trpc.ansprechpartner.list.useQuery();

  // Calculate price
  const calculateMutation = trpc.angebot.calculate.useMutation();

  const berechnung = useMemo(() => {
    if (selectedBausteine.length === 0 || selectedLaender.length === 0) {
      return null;
    }

    const bausteinIds = selectedBausteine.map((b) => b.bausteinId);
    calculateMutation.mutate({
      bausteinIds,
      laenderIds: selectedLaender,
      lieferart,
    });

    return calculateMutation.data;
  }, [selectedBausteine, selectedLaender, lieferart]);

  // Create angebot
  const createMutation = trpc.angebot.create.useMutation({
    onSuccess: (data) => {
      toast.success("Angebot erfolgreich erstellt");
      setLocation(`/angebot/${data.angebotId}`);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!kundenname || !projekttitel || !gueltigkeitsdatum || !ansprechpartnerId) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
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

    createMutation.mutate({
      kundenname,
      projekttitel,
      gueltigkeitsdatum,
      ansprechpartnerId: parseInt(ansprechpartnerId),
      bausteine: selectedBausteine,
      laenderIds: selectedLaender,
      lieferart,
    });
  };

  const toggleBaustein = (id: number) => {
    setSelectedBausteine((prev) => {
      const exists = prev.find((b) => b.bausteinId === id);
      if (exists) {
        return prev.filter((b) => b.bausteinId !== id);
      } else {
        return [...prev, { bausteinId: id }];
      }
    });
  };

  const toggleLand = (id: number) => {
    setSelectedLaender((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openPriceDialog = (bausteinId: number) => {
    const baustein = selectedBausteine.find((b) => b.bausteinId === bausteinId);
    setCurrentBaustein(bausteinId);
    
    if (baustein?.anpassungsTyp) {
      setAdjustmentType(baustein.anpassungsTyp);
      setAdjustmentValue(baustein.anpassungsWert?.toString() || "");
    } else {
      setAdjustmentType("direkt");
      setAdjustmentValue("");
    }
    
    setIsPriceDialogOpen(true);
  };

  const savePriceAdjustment = () => {
    if (!currentBaustein) return;

    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) {
      toast.error("Bitte geben Sie einen gültigen Wert ein");
      return;
    }

    setSelectedBausteine((prev) =>
      prev.map((b) => {
        if (b.bausteinId === currentBaustein) {
          const originalBaustein = bausteine.find((bs) => bs.id === currentBaustein);
          const originalPreis = originalBaustein?.einzelpreis || 0;

          let angepassterPreis: number;
          if (adjustmentType === "direkt") {
            angepassterPreis = value;
          } else {
            // Prozentuale Anpassung
            angepassterPreis = Math.round(originalPreis * (1 + value / 100));
          }

          return {
            ...b,
            angepassterPreis,
            anpassungsTyp: adjustmentType,
            anpassungsWert: value,
          };
        }
        return b;
      })
    );

    setIsPriceDialogOpen(false);
    setCurrentBaustein(null);
    setAdjustmentValue("");
  };

  const removePriceAdjustment = () => {
    if (!currentBaustein) return;

    setSelectedBausteine((prev) =>
      prev.map((b) => {
        if (b.bausteinId === currentBaustein) {
          return {
            bausteinId: b.bausteinId,
          };
        }
        return b;
      })
    );

    setIsPriceDialogOpen(false);
    setCurrentBaustein(null);
    setAdjustmentValue("");
  };

  const getDisplayPrice = (bausteinId: number): number => {
    const selected = selectedBausteine.find((b) => b.bausteinId === bausteinId);
    if (selected?.angepassterPreis !== undefined) {
      return selected.angepassterPreis;
    }
    const baustein = bausteine.find((b) => b.id === bausteinId);
    return baustein?.einzelpreis || 0;
  };

  if (bausteineLoading || laenderLoading || ansprechpartnerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setLocation("/")}>
            ← Zurück
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Neues Angebot erstellen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Linke Spalte: Formular */}
            <div className="lg:col-span-2 space-y-6">
              {/* Grunddaten */}
              <Card>
                <CardHeader>
                  <CardTitle>Grunddaten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="kundenname">Kundenname *</Label>
                    <Input
                      id="kundenname"
                      value={kundenname}
                      onChange={(e) => setKundenname(e.target.value)}
                      placeholder="z.B. WKO"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projekttitel">Projekttitel *</Label>
                    <Input
                      id="projekttitel"
                      value={projekttitel}
                      onChange={(e) => setProjekttitel(e.target.value)}
                      placeholder="z.B. Markt- und Distributionsanalyse Elektro AT"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gueltigkeitsdatum">Gültigkeitsdatum *</Label>
                    <Input
                      id="gueltigkeitsdatum"
                      type="date"
                      value={gueltigkeitsdatum}
                      onChange={(e) => setGueltigkeitsdatum(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ansprechpartner">Ansprechpartner *</Label>
                    <Select value={ansprechpartnerId} onValueChange={setAnsprechpartnerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {ansprechpartner.map((ap) => (
                          <SelectItem key={ap.id} value={ap.id.toString()}>
                            {ap.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Bausteine */}
              <Card>
                <CardHeader>
                  <CardTitle>Bausteine auswählen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bausteine.map((baustein) => {
                      const isSelected = selectedBausteine.some((b) => b.bausteinId === baustein.id);
                      const displayPrice = getDisplayPrice(baustein.id);
                      const hasAdjustment = selectedBausteine.find((b) => b.bausteinId === baustein.id)?.angepassterPreis !== undefined;

                      return (
                        <div key={baustein.id} className="flex items-start space-x-3 border-b pb-3">
                          <Checkbox
                            id={`baustein-${baustein.id}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleBaustein(baustein.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`baustein-${baustein.id}`}
                              className="font-medium cursor-pointer"
                            >
                              {baustein.name}
                            </Label>
                            <p className="text-sm text-gray-500">{baustein.beschreibung}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className={`text-sm font-semibold ${hasAdjustment ? 'text-orange-600' : 'text-blue-600'}`}>
                                {displayPrice === 0
                                  ? "Kostenlos"
                                  : `${displayPrice.toLocaleString("de-DE")} EUR`}
                              </p>
                              {isSelected && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPriceDialog(baustein.id)}
                                  className="h-6 px-2"
                                >
                                  <Settings className="h-3 w-3 mr-1" />
                                  {hasAdjustment ? "Angepasst" : "Anpassen"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Länder */}
              <Card>
                <CardHeader>
                  <CardTitle>Länder auswählen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {laender.map((land) => (
                      <div key={land.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`land-${land.id}`}
                          checked={selectedLaender.includes(land.id)}
                          onCheckedChange={() => toggleLand(land.id)}
                        />
                        <Label htmlFor={`land-${land.id}`} className="cursor-pointer">
                          {land.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lieferart */}
              <Card>
                <CardHeader>
                  <CardTitle>Lieferart</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={lieferart} onValueChange={(v) => setLieferart(v as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="einmalig" id="einmalig" />
                      <Label htmlFor="einmalig">Einmalige Lieferung</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rahmenvertrag" id="rahmenvertrag" />
                      <Label htmlFor="rahmenvertrag">Rahmenvertrag (-16%)</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Rechte Spalte: Preisanzeige */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Preisberechnung</CardTitle>
                </CardHeader>
                <CardContent>
                  {calculateMutation.data ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Basispreis</p>
                        <p className="text-lg font-semibold">
                          {calculateMutation.data.basispreis.toLocaleString("de-DE")} EUR
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Anzahl Länder</p>
                        <p className="text-lg font-semibold">
                          {calculateMutation.data.anzahlLaender}
                        </p>
                      </div>

                      {calculateMutation.data.rabattProzent > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Rabatt</p>
                          <p className="text-lg font-semibold text-green-600">
                            -{calculateMutation.data.rabattProzent}%
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-600">Preis pro Land</p>
                        <p className="text-lg font-semibold">
                          {calculateMutation.data.preisProLand.toLocaleString("de-DE")} EUR
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">Gesamtpreis</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {calculateMutation.data.gesamtpreis.toLocaleString("de-DE")} EUR
                        </p>
                        <p className="text-xs text-gray-500 mt-1">zzgl. MwSt.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Wählen Sie Bausteine und Länder aus, um den Preis zu berechnen.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Angebot erstellen"
              )}
            </Button>
          </div>
        </form>

        {/* Price Adjustment Dialog */}
        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Preis anpassen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <RadioGroup value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direkt" id="adj-direkt" />
                  <Label htmlFor="adj-direkt">Direkter Preis (EUR)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prozent" id="adj-prozent" />
                  <Label htmlFor="adj-prozent">Prozentuale Anpassung (%)</Label>
                </div>
              </RadioGroup>

              <div>
                <Label htmlFor="adjustment-value">
                  {adjustmentType === "direkt" ? "Neuer Preis (EUR)" : "Anpassung (%)"}
                </Label>
                <Input
                  id="adjustment-value"
                  type="number"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder={adjustmentType === "direkt" ? "z.B. 2000" : "z.B. -10 oder +15"}
                />
                {adjustmentType === "prozent" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Negative Werte für Rabatt, positive für Aufschlag
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={removePriceAdjustment}>
                Zurücksetzen
              </Button>
              <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={savePriceAdjustment}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
