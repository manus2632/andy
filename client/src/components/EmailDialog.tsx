import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EmailDialogProps {
  angebotId: number;
  kundenname: string;
  projekttitel: string;
}

export function EmailDialog({ angebotId, kundenname, projekttitel }: EmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const sendeMutation = trpc.email.sendeAngebot.useMutation({
    onSuccess: () => {
      toast.success("Angebot per E-Mail versendet");
      setOpen(false);
      setEmail("");
      // Seite neu laden um Status-Update zu zeigen
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Fehler beim Versand: ${error.message}`);
    },
  });

  const handleSenden = () => {
    if (!email || !email.includes("@")) {
      toast.error("Bitte gültige E-Mail-Adresse eingeben");
      return;
    }

    sendeMutation.mutate({
      angebotId,
      empfaengerEmail: email,
    });
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default">
        <Mail className="mr-2 h-4 w-4" />
        Per E-Mail versenden
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Angebot per E-Mail versenden</DialogTitle>
            <DialogDescription>
              Das Angebot wird als PDF-Anhang an die angegebene E-Mail-Adresse gesendet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kunde</Label>
              <div className="text-sm text-muted-foreground">{kundenname}</div>
            </div>

            <div className="space-y-2">
              <Label>Projekttitel</Label>
              <div className="text-sm text-muted-foreground">{projekttitel}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Empfänger E-Mail-Adresse *</Label>
              <Input
                id="email"
                type="email"
                placeholder="kunde@beispiel.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={sendeMutation.isPending}>
              Abbrechen
            </Button>
            <Button onClick={handleSenden} disabled={sendeMutation.isPending}>
              {sendeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
