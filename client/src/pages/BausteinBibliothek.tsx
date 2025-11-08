import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Search, Plus, Edit, Copy, Trash2 } from "lucide-react";
import { Baustein } from "../../../drizzle/schema";

export default function BausteinBibliothek() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [selectedBaustein, setSelectedBaustein] = useState<Baustein | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    beschreibung: "",
    langbeschreibung: "",
    lieferumfang: "",
    unterpunkte: "",
    methodik: "",
    einzelpreis: 0,
    kategorie: "",
    reihenfolge: 0,
  });

  const [duplicateName, setDuplicateName] = useState("");

  const utils = trpc.useUtils();

  const { data: bausteine, isLoading } = trpc.bausteine.search.useQuery({
    searchTerm,
  });

  const createMutation = trpc.bausteine.create.useMutation({
    onSuccess: () => {
      toast.success("Baustein erstellt");
      setIsCreateDialogOpen(false);
      resetForm();
      utils.bausteine.search.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateMutation = trpc.bausteine.update.useMutation({
    onSuccess: () => {
      toast.success("Baustein aktualisiert");
      setIsEditDialogOpen(false);
      setSelectedBaustein(null);
      resetForm();
      utils.bausteine.search.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.bausteine.delete.useMutation({
    onSuccess: () => {
      toast.success("Baustein gelöscht");
      utils.bausteine.search.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.bausteine.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Baustein dupliziert");
      setIsDuplicateDialogOpen(false);
      setSelectedBaustein(null);
      setDuplicateName("");
      utils.bausteine.search.invalidate();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      beschreibung: "",
      langbeschreibung: "",
      lieferumfang: "",
      unterpunkte: "",
      methodik: "",
      einzelpreis: 0,
      kategorie: "",
      reihenfolge: 0,
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (baustein: Baustein) => {
    setSelectedBaustein(baustein);
    setFormData({
      name: baustein.name,
      beschreibung: baustein.beschreibung || "",
      langbeschreibung: baustein.langbeschreibung || "",
      lieferumfang: baustein.lieferumfang || "",
      unterpunkte: baustein.unterpunkte || "",
      methodik: baustein.methodik || "",
      einzelpreis: baustein.einzelpreis,
      kategorie: baustein.kategorie || "",
      reihenfolge: baustein.reihenfolge || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedBaustein || !formData.name) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    updateMutation.mutate({
      id: selectedBaustein.id,
      ...formData,
    });
  };

  const handleDuplicate = (baustein: Baustein) => {
    setSelectedBaustein(baustein);
    setDuplicateName(`${baustein.name} (Kopie)`);
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateConfirm = () => {
    if (!selectedBaustein || !duplicateName) {
      toast.error("Bitte geben Sie einen Namen ein");
      return;
    }
    duplicateMutation.mutate({
      id: selectedBaustein.id,
      newName: duplicateName,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Baustein wirklich löschen?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Baustein-Bibliothek</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Baustein
          </Button>
        </div>

        {/* Suchfeld */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Suche nach Name, Beschreibung oder Kategorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bausteine Liste */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : bausteine && bausteine.length > 0 ? (
          <div className="grid gap-4">
            {bausteine.map((baustein) => (
              <Card key={baustein.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{baustein.name}</h3>
                    {baustein.beschreibung && (
                      <p className="text-gray-600 mb-2">{baustein.beschreibung}</p>
                    )}
                    {baustein.kategorie && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {baustein.kategorie}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-bold text-blue-600">
                      {baustein.einzelpreis.toLocaleString("de-DE")} EUR
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(baustein)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(baustein)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(baustein.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Keine Bausteine gefunden
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Neuen Baustein erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="create-beschreibung">Kurzbeschreibung</Label>
                <Textarea
                  id="create-beschreibung"
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                  rows={2}
                  placeholder="1-2 Sätze Zusammenfassung"
                />
              </div>
              <div>
                <Label htmlFor="create-langbeschreibung">Detaillierte Beschreibung</Label>
                <Textarea
                  id="create-langbeschreibung"
                  value={formData.langbeschreibung}
                  onChange={(e) => setFormData({ ...formData, langbeschreibung: e.target.value })}
                  rows={6}
                  placeholder="Mehrere Absätze mit Details zum Baustein"
                />
              </div>
              <div>
                <Label htmlFor="create-lieferumfang">Lieferumfang</Label>
                <Textarea
                  id="create-lieferumfang"
                  value={formData.lieferumfang}
                  onChange={(e) => setFormData({ ...formData, lieferumfang: e.target.value })}
                  rows={4}
                  placeholder="Ein Punkt pro Zeile, z.B.&#10;Excel-Tabellen mit Rohdaten&#10;PDF-Report mit Grafiken&#10;Präsentation der Ergebnisse"
                />
              </div>
              <div>
                <Label htmlFor="create-unterpunkte">Unterpunkte / Inhalte</Label>
                <Textarea
                  id="create-unterpunkte"
                  value={formData.unterpunkte}
                  onChange={(e) => setFormData({ ...formData, unterpunkte: e.target.value })}
                  rows={6}
                  placeholder="Hierarchische Struktur, z.B.&#10;■ Hauptpunkt 1&#10;  o Unterpunkt 1.1&#10;  o Unterpunkt 1.2&#10;■ Hauptpunkt 2"
                />
              </div>
              <div>
                <Label htmlFor="create-methodik">Methodik / Erhebungsmethode</Label>
                <Textarea
                  id="create-methodik"
                  value={formData.methodik}
                  onChange={(e) => setFormData({ ...formData, methodik: e.target.value })}
                  rows={4}
                  placeholder="Beschreibung der Datenerhebung und Analysemethoden"
                />
              </div>
              <div>
                <Label htmlFor="create-einzelpreis">Einzelpreis (EUR) *</Label>
                <Input
                  id="create-einzelpreis"
                  type="number"
                  value={formData.einzelpreis}
                  onChange={(e) =>
                    setFormData({ ...formData, einzelpreis: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="create-kategorie">Kategorie</Label>
                <Input
                  id="create-kategorie"
                  value={formData.kategorie}
                  onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                  placeholder="z.B. Marktanalyse, Distribution, Produktentwicklung"
                />
              </div>
              <div>
                <Label htmlFor="create-reihenfolge">Reihenfolge</Label>
                <Input
                  id="create-reihenfolge"
                  type="number"
                  value={formData.reihenfolge}
                  onChange={(e) =>
                    setFormData({ ...formData, reihenfolge: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Erstellen"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Baustein bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-beschreibung">Kurzbeschreibung</Label>
                <Textarea
                  id="edit-beschreibung"
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
                  rows={2}
                  placeholder="1-2 Sätze Zusammenfassung"
                />
              </div>
              <div>
                <Label htmlFor="edit-langbeschreibung">Detaillierte Beschreibung</Label>
                <Textarea
                  id="edit-langbeschreibung"
                  value={formData.langbeschreibung}
                  onChange={(e) => setFormData({ ...formData, langbeschreibung: e.target.value })}
                  rows={6}
                  placeholder="Mehrere Absätze mit Details zum Baustein"
                />
              </div>
              <div>
                <Label htmlFor="edit-lieferumfang">Lieferumfang</Label>
                <Textarea
                  id="edit-lieferumfang"
                  value={formData.lieferumfang}
                  onChange={(e) => setFormData({ ...formData, lieferumfang: e.target.value })}
                  rows={4}
                  placeholder="Ein Punkt pro Zeile"
                />
              </div>
              <div>
                <Label htmlFor="edit-unterpunkte">Unterpunkte / Inhalte</Label>
                <Textarea
                  id="edit-unterpunkte"
                  value={formData.unterpunkte}
                  onChange={(e) => setFormData({ ...formData, unterpunkte: e.target.value })}
                  rows={6}
                  placeholder="Hierarchische Struktur"
                />
              </div>
              <div>
                <Label htmlFor="edit-methodik">Methodik / Erhebungsmethode</Label>
                <Textarea
                  id="edit-methodik"
                  value={formData.methodik}
                  onChange={(e) => setFormData({ ...formData, methodik: e.target.value })}
                  rows={4}
                  placeholder="Beschreibung der Datenerhebung"
                />
              </div>
              <div>
                <Label htmlFor="edit-einzelpreis">Einzelpreis (EUR) *</Label>
                <Input
                  id="edit-einzelpreis"
                  type="number"
                  value={formData.einzelpreis}
                  onChange={(e) =>
                    setFormData({ ...formData, einzelpreis: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-kategorie">Kategorie</Label>
                <Input
                  id="edit-kategorie"
                  value={formData.kategorie}
                  onChange={(e) => setFormData({ ...formData, kategorie: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-reihenfolge">Reihenfolge</Label>
                <Input
                  id="edit-reihenfolge"
                  type="number"
                  value={formData.reihenfolge}
                  onChange={(e) =>
                    setFormData({ ...formData, reihenfolge: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird gespeichert...
                  </>
                ) : (
                  "Speichern"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Baustein duplizieren</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="duplicate-name">Neuer Name *</Label>
                <Input
                  id="duplicate-name"
                  value={duplicateName}
                  onChange={(e) => setDuplicateName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleDuplicateConfirm} disabled={duplicateMutation.isPending}>
                {duplicateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird dupliziert...
                  </>
                ) : (
                  "Duplizieren"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
