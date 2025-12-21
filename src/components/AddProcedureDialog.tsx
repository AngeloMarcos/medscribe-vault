import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { procedureSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { useTenant } from "@/hooks/useTenant";

interface AddProcedureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  patientId: string;
}

const AddProcedureDialog = ({
  open,
  onOpenChange,
  onSuccess,
  patientId,
}: AddProcedureDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [formData, setFormData] = useState({
    date_time: "",
    description: "",
    professional: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = procedureSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("procedures").insert([
        {
          patient_id: patientId,
          ...formData,
          tenant_id: tenant?.id || null,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Procedimento registrado com sucesso.",
      });
      onOpenChange(false);
      onSuccess();
      setFormData({
        date_time: "",
        description: "",
        professional: "",
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Procedimento</DialogTitle>
          <DialogDescription>Registrar procedimento realizado</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date_time">Data/Horário *</Label>
              <Input
                id="date_time"
                type="datetime-local"
                value={formData.date_time}
                onChange={(e) => setFormData({ ...formData, date_time: e.target.value })}
                required
              />
              {errors.date_time && <p className="text-sm text-destructive">{errors.date_time}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição do procedimento *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
                required
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="professional">Profissional responsável</Label>
              <Input
                id="professional"
                value={formData.professional}
                onChange={(e) => setFormData({ ...formData, professional: e.target.value })}
                maxLength={255}
              />
              {errors.professional && <p className="text-sm text-destructive">{errors.professional}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Observações/intercorrências</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                maxLength={2000}
              />
              {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProcedureDialog;
