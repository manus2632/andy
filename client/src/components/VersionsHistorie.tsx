import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, History, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface VersionsHistorieProps {
  angebotId: number;
}

export function VersionsHistorie({ angebotId }: VersionsHistorieProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateVersionDialogOpen, setIsCreateVersionDialogOpen] = useState(false);
  const [aenderungsgrund, setAenderungsgrund] = useState("");

  const utils = trpc.useUtils();

  const { data: versionen = [], isLoading } = trpc.angebot.versionen.useQuery(
    { angebotId },
    { enabled: isDialogOpen }
  );

  const erstelleVersionMutation = trpc.angebot.erstelleVersion.useMutation({
    onSuccess: () => {
      toast.success("Version erstellt");
      setIsCreateVersionDialogOpen(false);
      setAenderungsgrund("");
      utils.angebot.versionen.invalidate({ angebotId });
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleErstelleVersion = () => {
    erstelleVersionMutation.mutate({
      angebotId,
      aenderungsgrund: aenderungsgrund || undefined,
    });
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <History className="mr-2 h-4 w-4" />
        Versionshistorie
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Versionshistorie</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateVersionDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Neue Version erstellen
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : versionen.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Keine Versionen vorhanden
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Erstellt von</TableHead>
                    <TableHead>Änderungsgrund</TableHead>
                    <TableHead>Gesamtpreis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versionen.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell className="font-medium">
                        v{version.versionNummer}
                      </TableCell>
                      <TableCell>
                        {format(new Date(version.createdAt), "dd.MM.yyyy HH:mm", {
                          locale: de,
                        })}
                      </TableCell>
                      <TableCell>{version.erstelltVon || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {version.aenderungsgrund || "-"}
                      </TableCell>
                      <TableCell>
                        {version.gesamtpreis.toLocaleString("de-DE")} EUR
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateVersionDialogOpen}
        onOpenChange={setIsCreateVersionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Version erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="aenderungsgrund">
                Änderungsgrund (optional)
              </Label>
              <Textarea
                id="aenderungsgrund"
                value={aenderungsgrund}
                onChange={(e) => setAenderungsgrund(e.target.value)}
                placeholder="z.B. Preisanpassung, neue Bausteine hinzugefügt..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateVersionDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleErstelleVersion}
              disabled={erstelleVersionMutation.isPending}
            >
              {erstelleVersionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird erstellt...
                </>
              ) : (
                "Version erstellen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
