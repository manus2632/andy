import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Eye, Copy, ArrowUpDown, Search } from "lucide-react";
import { format } from "date-fns";

type SortField = "createdAt" | "projekttitel" | "kundenname" | "ansprechpartner";
type SortDirection = "asc" | "desc";

export default function AngebotArchiv() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isDuplizierenDialogOpen, setIsDuplizierenDialogOpen] = useState(false);
  const [selectedAngebotId, setSelectedAngebotId] = useState<number | null>(null);
  const [neuerKundenname, setNeuerKundenname] = useState("");
  const [neuerProjekttitel, setNeuerProjekttitel] = useState("");

  const { data: angebote = [], isLoading } = trpc.angebot.list.useQuery();

  const duplizierenMutation = trpc.angebot.duplizieren.useMutation({
    onSuccess: (data) => {
      toast.success("Angebot dupliziert");
      setLocation(`/angebot/${data.angebotId}`);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedAngebote = useMemo(() => {
    let result = [...angebote];

    // Filtern
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.kundenname.toLowerCase().includes(term) ||
          a.projekttitel.toLowerCase().includes(term)
      );
    }

    // Sortieren
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "projekttitel":
          aVal = a.projekttitel.toLowerCase();
          bVal = b.projekttitel.toLowerCase();
          break;
        case "kundenname":
          aVal = a.kundenname.toLowerCase();
          bVal = b.kundenname.toLowerCase();
          break;
        case "ansprechpartner":
          aVal = a.ansprechpartnerId;
          bVal = b.ansprechpartnerId;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [angebote, searchTerm, sortField, sortDirection]);

  const openDuplizierenDialog = (angebotId: number, kundenname: string, projekttitel: string) => {
    setSelectedAngebotId(angebotId);
    setNeuerKundenname(kundenname);
    setNeuerProjekttitel(projekttitel);
    setIsDuplizierenDialogOpen(true);
  };

  const handleDuplizieren = () => {
    if (!selectedAngebotId) return;

    duplizierenMutation.mutate({
      id: selectedAngebotId,
      neuerKundenname,
      neuerProjekttitel,
    });

    setIsDuplizierenDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Angebots-Archiv</h1>
        </div>

        {/* Suchleiste */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Suche nach Kunde oder Projekttitel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1"
                  >
                    Datum
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("projekttitel")}
                    className="flex items-center gap-1"
                  >
                    Projekttitel
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("kundenname")}
                    className="flex items-center gap-1"
                  >
                    Kunde
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Gesamtpreis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedAngebote.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? "Keine Angebote gefunden" : "Noch keine Angebote vorhanden"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedAngebote.map((angebot) => (
                  <TableRow key={angebot.id}>
                    <TableCell>{format(new Date(angebot.createdAt), "dd.MM.yyyy")}</TableCell>
                    <TableCell className="font-medium">{angebot.projekttitel}</TableCell>
                    <TableCell>{angebot.kundenname}</TableCell>
                    <TableCell>{angebot.gesamtpreis.toLocaleString("de-DE")} EUR</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          angebot.status === "entwurf"
                            ? "bg-gray-100 text-gray-800"
                            : angebot.status === "versendet"
                              ? "bg-blue-100 text-blue-800"
                              : angebot.status === "angenommen"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {angebot.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/angebot/${angebot.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ansehen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openDuplizierenDialog(
                              angebot.id,
                              angebot.kundenname,
                              angebot.projekttitel
                            )
                          }
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplizieren
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Duplizieren Dialog */}
      <Dialog open={isDuplizierenDialogOpen} onOpenChange={setIsDuplizierenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Angebot duplizieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="neuerKundenname">Kundenname</Label>
              <Input
                id="neuerKundenname"
                value={neuerKundenname}
                onChange={(e) => setNeuerKundenname(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="neuerProjekttitel">Projekttitel</Label>
              <Input
                id="neuerProjekttitel"
                value={neuerProjekttitel}
                onChange={(e) => setNeuerProjekttitel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplizierenDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleDuplizieren}>Duplizieren</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
