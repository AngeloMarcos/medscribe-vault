import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/hooks/use-toast";
import { patientSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { useTenant } from "@/hooks/useTenant";

interface AddPatientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddPatientDialog = ({ open, onOpenChange, onSuccess }: AddPatientDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birth_date: "",
    phone: "",
    insurance: "",
    medical_record_number: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = patientSchema.safeParse(formData);
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
      const { error } = await supabase.from("patients").insert([{
        ...formData,
        tenant_id: tenant?.id || null,
      }]);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Paciente cadastrado com sucesso.",
      });
      onOpenChange(false);
      onSuccess();
      setFormData({
        name: "",
        cpf: "",
        birth_date: "",
        phone: "",
        insurance: "",
        medical_record_number: "",
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
          <DialogTitle>Novo Paciente</DialogTitle>
          <DialogDescription>Cadastre um novo paciente no sistema</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={255}
                required
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                maxLength={20}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Input
                id="insurance"
                value={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="medical_record_number">Número do Prontuário</Label>
              <Input
                id="medical_record_number"
                value={formData.medical_record_number}
                onChange={(e) =>
                  setFormData({ ...formData, medical_record_number: e.target.value })
                }
                maxLength={50}
              />
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

export default AddPatientDialog;
