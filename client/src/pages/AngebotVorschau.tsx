import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { VersionsHistorie } from "@/components/VersionsHistorie";

export default function AngebotVorschau() {
  const [, params] = useRoute("/angebot/:id");
  const [, setLocation] = useLocation();
  const angebotId = params?.id ? parseInt(params.id) : 0;

  const { data, isLoading, error } = trpc.angebot.getById.useQuery({ id: angebotId });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Angebot nicht gefunden</h2>
          <Button onClick={() => setLocation("/")}>Zurück zur Startseite</Button>
        </div>
      </div>
    );
  }

  const { angebot, bausteine, laender, ansprechpartner } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6 flex justify-end gap-2">
          <VersionsHistorie angebotId={angebotId} />
          <Button onClick={() => window.print()}>PDF herunterladen</Button>
        </div>

        {/* Angebot Dokument */}
        <div className="bg-white shadow-lg p-12 print:shadow-none" id="angebot-dokument">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-2xl font-bold mb-2">Angebot für {angebot.kundenname}</h1>
            <h2 className="text-xl mb-4">{angebot.projekttitel}</h2>
            <p className="text-gray-600">
              {format(new Date(angebot.erstellungsdatum), "dd.MM.yyyy", { locale: de })}
            </p>
            <div className="mt-6">
              <p className="font-semibold">B+L Marktdaten GmbH</p>
              <p>Markt 26 | 53111 Bonn (Germany)</p>
              {ansprechpartner && (
                <div className="mt-2">
                  <p>
                    {ansprechpartner.name} | {ansprechpartner.telefon} |{" "}
                    {ansprechpartner.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Kapitel 1: Firmenvorstellung */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">1 B+L Firmenvorstellung</h3>
            {angebot.llmFirmenvorstellung ? (
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {angebot.llmFirmenvorstellung}
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed mb-3">
                  B+L hat Erfahrung aus hunderten von Produktstudien. Wir untersuchen seit 1994
                  kontinuierlich die Märkte für Bauprodukte in allen relevanten Weltmärkten. Durch
                  die Kombination von Methodensicherheit und Branchen- und Marktkenntnis erzielen
                  wir in kürzester Zeit abgesicherte Ergebnisse.
                </p>
                <p className="text-sm leading-relaxed mb-3">
                  Die Basis der Marktprognosen wird gebildet aus einer umfassenden Analyse der
                  Einflussfaktoren auf den Markt, kombiniert mit Erkenntnissen aus fortlaufenden
                  B+L Endverbraucher- und Zielgruppenbefragungen, die insbesondere Aufschluss über
                  Produkttrends und Renovierverhalten geben.
                </p>
                <p className="text-sm leading-relaxed">
                  In unserem Hauptsitz in Bonn arbeitet ein internationales Team von erfahrenen
                  Industrieanalysten. Weiterhin nutzen wir unser hausinternes Team von
                  muttersprachlichen Telefoninterviewern zum Zweck der Datenerhebung.
                </p>
              </>
            )}
          </section>

          {/* Kapitel 2: Studieninhalte */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">2 Studieninhalte</h3>
            <p className="text-sm leading-relaxed mb-4">
              Die Studie umfasst folgende Bausteine:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {bausteine.map((baustein) => (
                <li key={baustein.id}>
                  <strong>{baustein.name}:</strong> {baustein.beschreibung}
                </li>
              ))}
            </ul>
          </section>

          {/* Kapitel 3: Länderübersicht */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">3 Länderübersicht</h3>
            <p className="text-sm leading-relaxed mb-3">
              Die Analyse wird für folgende Länder durchgeführt:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {laender.map((land) => (
                <li key={land.id}>{land.name}</li>
              ))}
            </ul>
          </section>

          {/* Kapitel 4: Erhebungsmethode */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">4 Erhebungsmethode</h3>
            {angebot.llmMethodik ? (
              <div className="text-sm leading-relaxed whitespace-pre-line">
                {angebot.llmMethodik}
              </div>
            ) : (
              <p className="text-sm leading-relaxed mb-3">
                Die Basis des Datengerüsts bilden Primärerhebungen in den Stufen Industrie,
                Handel und Verarbeitung. Der ermittelte Gesamtmarkt wird abschließend mit
                Fachexperten aus verschiedenen Bereichen diskutiert und abgestimmt. Durch den
                triangulatorischen Ansatz werden weitgehend abgesicherte Ergebnisse erzielt.
              </p>
            )}
          </section>

          {/* Kapitel 5: Datenqualität */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">5 Datenqualität B+L</h3>
            <p className="text-sm leading-relaxed mb-2">
              Die Sicherstellung der Datenqualität wird gewährleistet durch:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Spezialisierte Industrieanalysten mit mehr als 15-jähriger Erfahrung</li>
              <li>Geschulte und erfahrene, muttersprachliche Interviewer</li>
              <li>Zentrales Research Center in Bonn</li>
              <li>Double Checks aller Erhebungs-Ergebnisse</li>
            </ul>
          </section>

          {/* Kapitel 6: Dokumentation */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">6 Dokumentation und Lieferzeit</h3>
            <p className="text-sm leading-relaxed">
              Die Studie wird als PDF und als Excel-Datei zur Verfügung gestellt. Lieferzeit:
              ca. 4 KW (nach Auftragserteilung).
            </p>
          </section>

          {/* Kapitel 7: Aufwand */}
          <section className="mb-8">
            <h3 className="text-lg font-bold mb-3">7 Aufwand</h3>
            <p className="text-sm leading-relaxed mb-4">
              Der Aufwand für die oben beschriebenen Inhalte setzt sich wie folgt zusammen:
            </p>

            <div className="mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Baustein</th>
                    <th className="text-right py-2">Einzelpreis (EUR)</th>
                  </tr>
                </thead>
                <tbody>
                  {bausteine.map((baustein) => (
                    <tr key={baustein.id} className="border-b">
                      <td className="py-2">{baustein.name}</td>
                      <td className="text-right py-2">
                        {baustein.einzelpreis.toLocaleString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Basispreis:</span>
                <span className="font-semibold">
                  {angebot.basispreis.toLocaleString("de-DE")} EUR
                </span>
              </div>
              <div className="flex justify-between">
                <span>Anzahl Länder:</span>
                <span className="font-semibold">{angebot.anzahlLaender}</span>
              </div>
              {angebot.rabattProzent > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Rabatt ({angebot.lieferart === "rahmenvertrag" ? "Rahmenvertrag" : "Mengenrabatt"}):</span>
                  <span className="font-semibold">-{angebot.rabattProzent}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Preis pro Land:</span>
                <span className="font-semibold">
                  {angebot.preisProLand.toLocaleString("de-DE")} EUR
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t text-lg">
                <span className="font-bold">Gesamtaufwand:</span>
                <span className="font-bold">
                  {angebot.gesamtpreis.toLocaleString("de-DE")} EUR
                </span>
              </div>
            </div>

            <p className="text-sm mt-4">Die Preise verstehen sich zzgl. MwSt.</p>
          </section>

          {/* Footer */}
          <section className="mt-12 pt-6 border-t">
            <p className="text-xs text-gray-600 mb-4">
              <strong>Anmerkungen zur Vertraulichkeit:</strong> Inhalte und Preise dieses
              Angebots sind ausschließlich zum internen Gebrauch gedacht. Die Weitergabe –
              auch von Teilen dieses Angebotes – an Dritte (z.B. Berater) bedarf der
              Zustimmung durch die B+L GmbH.
            </p>
            <p className="text-sm">
              <strong>Angebot gültig bis:</strong>{" "}
              {format(new Date(angebot.gueltigkeitsdatum), "dd.MM.yyyy", { locale: de })}
            </p>
            <p className="text-sm mt-2">
              Bonn,{" "}
              {format(new Date(angebot.erstellungsdatum), "dd.MM.yyyy", { locale: de })}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
