import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { KeyRound, Loader2, Mail, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string;
  } | null;
}

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) {
  const [sent, setSent] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      // Log activity
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.from("user_activity_log").insert({
          user_id: currentUser.id,
          action: "password_reset",
          resource: "profiles",
          resource_id: user?.id,
          details: { target_email: email, initiated_by: "admin" },
        });
      }
    },
    onSuccess: () => {
      setSent(true);
      toast.success("Email de redefinição enviado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar email de redefinição");
    },
  });

  const handleReset = () => {
    if (user?.email) {
      resetPasswordMutation.mutate(user.email);
    }
  };

  const handleClose = () => {
    setSent(false);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Redefinir Senha
          </DialogTitle>
          <DialogDescription>
            Enviar email de redefinição de senha para o usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {sent ? (
            <Alert className="bg-green-50 border-green-200">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Um email foi enviado para <strong>{user.email}</strong> com
                instruções para redefinir a senha.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Um email será enviado ao usuário com um link para criar uma
                  nova senha. O link expira em 24 horas.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          {sent ? (
            <Button onClick={handleClose}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
