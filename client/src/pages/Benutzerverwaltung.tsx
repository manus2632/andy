import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, Edit, UserX, Key } from "lucide-react";

export default function Benutzerverwaltung() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"admin" | "intern" | "extern">("extern");
  const [newPassword, setNewPassword] = useState("");

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.authNew.getAllUsers.useQuery();

  const createMutation = trpc.authNew.createUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich erstellt");
      setCreateDialogOpen(false);
      resetForm();
      utils.authNew.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen");
    },
  });

  const updateMutation = trpc.authNew.updateUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer erfolgreich aktualisiert");
      setEditDialogOpen(false);
      setSelectedUser(null);
      utils.authNew.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren");
    },
  });

  const deactivateMutation = trpc.authNew.deactivateUser.useMutation({
    onSuccess: () => {
      toast.success("Benutzer deaktiviert");
      utils.authNew.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Deaktivieren");
    },
  });

  const changePasswordMutation = trpc.authNew.changeUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Passwort erfolgreich geändert");
      setPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Ändern des Passworts");
    },
  });

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setRole("extern");
  };

  const handleCreate = () => {
    if (!email || !password) {
      toast.error("E-Mail und Passwort sind Pflichtfelder");
      return;
    }

    createMutation.mutate({
      email,
      password,
      name: name || undefined,
      role,
    });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setName(user.name || "");
    setEmail(user.email);
    setRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedUser) return;

    updateMutation.mutate({
      userId: selectedUser.id,
      name,
      email,
      role,
    });
  };

  const handleDeactivate = (userId: number) => {
    if (confirm("Möchten Sie diesen Benutzer wirklich deaktivieren?")) {
      deactivateMutation.mutate({ userId });
    }
  };

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword) {
      toast.error("Bitte neues Passwort eingeben");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    changePasswordMutation.mutate({
      userId: selectedUser.id,
      newPassword,
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      admin: "destructive",
      intern: "default",
      extern: "secondary",
    };

    const labels: Record<string, string> = {
      admin: "Admin",
      intern: "B+L Intern",
      extern: "Extern",
    };

    return (
      <Badge variant={variants[role] || "default"}>{labels[role] || role}</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Lade Benutzer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Benutzerverwaltung</h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Benutzer und deren Rollen
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-Mail</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Letzter Login</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.name || "-"}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  {user.aktiv ? (
                    <Badge variant="default">Aktiv</Badge>
                  ) : (
                    <Badge variant="secondary">Deaktiviert</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.lastSignedIn
                    ? new Date(user.lastSignedIn).toLocaleDateString("de-DE")
                    : "-"}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setPasswordDialogOpen(true);
                    }}
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                  {user.aktiv && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(user.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Benutzer mit E-Mail und Passwort
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">E-Mail *</Label>
              <Input
                id="create-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="benutzer@beispiel.de"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Passwort *</Label>
              <Input
                id="create-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-name">Name (optional)</Label>
              <Input
                id="create-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Rolle *</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extern">Extern</SelectItem>
                  <SelectItem value="intern">B+L Intern</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Erstelle..." : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie die Benutzerdaten und Rolle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-Mail *</Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rolle *</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extern">Extern</SelectItem>
                  <SelectItem value="intern">B+L Intern</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Speichere..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Setzen Sie ein neues Passwort für {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Neues Passwort *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Ändere..." : "Ändern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
