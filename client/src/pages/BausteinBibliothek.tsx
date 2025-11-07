import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    einzelpreis: 0,
    kategorie: "",
    reihenfolge: 0,
  });

  const [duplicateName, setDuplicateName] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: bausteine = [], isLoading } = trpc.bausteine.search.useQuery({
    searchTerm,
  });

  // Mutations
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
    if (confirm("Möchten Sie diesen Baustein wirklich löschen?")) {
      deleteMutation.mutate({ id });
    }
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
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Baustein-Bibliothek</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Baustein
          </Button>
        </div>

        {/* Suchleiste */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Bausteine durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Bausteine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bausteine.map((baustein) => (
            <Card key={baustein.id} className={!baustein.aktiv ? "opacity-50" : ""}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-start">
                  <span>{baustein.name}</span>
                  {!baustein.aktiv && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">Inaktiv</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
                  {baustein.beschreibung || "Keine Beschreibung"}
                </p>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {baustein.einzelpreis === 0
                      ? "Kostenlos"
                      : `${baustein.einzelpreis.toLocaleString("de-DE")} EUR`}
                  </p>
                  {baustein.kategorie && (
                    <p className="text-xs text-gray-500 mt-1">Kategorie: {baustein.kategorie}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(baustein)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Bearbeiten
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
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {bausteine.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Bausteine gefunden</p>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
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
                <Label htmlFor="create-beschreibung">Beschreibung</Label>
                <Input
                  id="create-beschreibung"
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
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
          <DialogContent>
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
                <Label htmlFor="edit-beschreibung">Beschreibung</Label>
                <Input
                  id="edit-beschreibung"
                  value={formData.beschreibung}
                  onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
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
