import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { reportSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  patientId: string;
}

const AddReportDialog = ({
  open,
  onOpenChange,
  onSuccess,
  patientId,
}: AddReportDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: "atestado",
    text: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = reportSchema.safeParse(formData);
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
      const { error } = await supabase.from("reports").insert([
        {
          patient_id: patientId,
          ...formData,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Relatório gerado com sucesso.",
      });
      onOpenChange(false);
      onSuccess();
      setFormData({
        type: "atestado",
        text: "",
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      atestado: "Atestado",
      relatorio: "Relatório",
      prescricao: "Prescrição",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Relatório</DialogTitle>
          <DialogDescription>Gerar atestado, relatório ou prescrição</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de documento *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atestado">Atestado</SelectItem>
                  <SelectItem value="relatorio">Relatório</SelectItem>
                  <SelectItem value="prescricao">Prescrição</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="text">Texto do {getTypeLabel(formData.type).toLowerCase()} *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder={`Escreva o conteúdo do ${getTypeLabel(formData.type).toLowerCase()}`}
                rows={8}
                maxLength={10000}
                required
              />
              {errors.text && <p className="text-sm text-destructive">{errors.text}</p>}
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

export default AddReportDialog;
