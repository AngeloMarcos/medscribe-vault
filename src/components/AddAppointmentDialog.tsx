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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { appointmentSchema } from "@/lib/validationSchemas";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AddAppointmentDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: AddAppointmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    patient_id: "",
    date_time: "",
    type: "consulta",
    description: "",
    status: "agendado",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: patients } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = appointmentSchema.safeParse(formData);
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
      const { error } = await supabase.from("appointments").insert([formData]);
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Consulta agendada com sucesso.",
      });
      onOpenChange(false);
      onSuccess();
      setFormData({
        patient_id: "",
        date_time: "",
        type: "consulta",
        description: "",
        status: "agendado",
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
          <DialogTitle>Nova Consulta</DialogTitle>
          <DialogDescription>Agendar nova consulta ou procedimento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient_id">Paciente *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_time">Data e Hora *</Label>
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
              <Label htmlFor="type">Tipo *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="procedimento">Procedimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={1000}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
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

export default AddAppointmentDialog;
