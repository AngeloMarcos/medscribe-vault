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
import { useToast } from "@/hooks/use-toast";
import { examRequestSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface AddExamRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  patientId: string;
}

const AddExamRequestDialog = ({
  open,
  onOpenChange,
  onSuccess,
  patientId,
}: AddExamRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    exams_list: "",
    justification: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = examRequestSchema.safeParse(formData);
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
      const { error } = await supabase.from("exam_requests").insert([
        {
          patient_id: patientId,
          ...formData,
        },
      ]);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Solicitação de exames registrada com sucesso.",
      });
      onOpenChange(false);
      onSuccess();
      setFormData({
        exams_list: "",
        justification: "",
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
          <DialogTitle>Solicitar Exames</DialogTitle>
          <DialogDescription>Registrar solicitação de exames</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exams_list">Exames solicitados *</Label>
              <Textarea
                id="exams_list"
                value={formData.exams_list}
                onChange={(e) => setFormData({ ...formData, exams_list: e.target.value })}
                placeholder="Liste os exames solicitados"
                rows={4}
                maxLength={2000}
                required
              />
              {errors.exams_list && <p className="text-sm text-destructive">{errors.exams_list}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="justification">Justificativa clínica</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Justificativa para a solicitação"
                rows={3}
                maxLength={1000}
              />
              {errors.justification && <p className="text-sm text-destructive">{errors.justification}</p>}
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

export default AddExamRequestDialog;
