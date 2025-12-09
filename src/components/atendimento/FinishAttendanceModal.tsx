import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { finishAttendanceSchema } from "@/lib/validationSchemas";
interface FinishAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cids: string[];
  pacienteNome: string;
  onFinish: (data: {
    conduta: string;
    destino: string;
    setorEncaminhamento?: string;
    observacoes?: string;
  }) => Promise<void>;
}

const destinoOptions = [
  { value: "alta", label: "Alta - Retorno ao domicílio" },
  { value: "internacao", label: "Internação Hospitalar" },
  { value: "medicacao", label: "Encaminhar para Sala de Medicação" },
  { value: "observacao", label: "Encaminhar para Observação" },
  { value: "especialidade", label: "Encaminhar para Especialidade" },
  { value: "urgencia", label: "Encaminhar para Urgência" },
];

export function FinishAttendanceModal({
  open,
  onOpenChange,
  cids,
  pacienteNome,
  onFinish,
}: FinishAttendanceModalProps) {
  const [conduta, setConduta] = useState("");
  const [destino, setDestino] = useState("");
  const [setorEncaminhamento, setSetorEncaminhamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFinish = async () => {
    setError("");

    const validation = finishAttendanceSchema.safeParse({
      conduta,
      destino,
      setorEncaminhamento: destino !== "alta" ? setorEncaminhamento : undefined,
      observacoes: observacoes || undefined,
    });

    if (!validation.success) {
      setError(validation.error.errors[0]?.message || "Dados inválidos");
      return;
    }

    setLoading(true);

    try {
      await onFinish({
        conduta,
        destino,
        setorEncaminhamento: destino !== "alta" ? setorEncaminhamento : undefined,
        observacoes: observacoes || undefined,
      });

      toast({
        title: "Atendimento finalizado",
        description: `O atendimento de ${pacienteNome} foi encerrado com sucesso.`,
      });

      onOpenChange(false);
      
      // Reset form
      setConduta("");
      setDestino("");
      setSetorEncaminhamento("");
      setObservacoes("");
    } catch (err) {
      toast({
        title: "Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o atendimento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const needsEncaminhamento = destino && destino !== "alta" && destino !== "internacao";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Finalizar Atendimento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para encerrar o atendimento de{" "}
            <strong>{pacienteNome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* CIDs Summary */}
          {cids.length > 0 && (
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wide mb-2 block">
                Diagnósticos (CID-10)
              </Label>
              <div className="flex flex-wrap gap-2">
                {cids.map((cid) => (
                  <Badge key={cid} variant="secondary">
                    {cid}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {cids.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Nenhum CID foi selecionado para este atendimento.</span>
            </div>
          )}

          {/* Conduta */}
          <div className="space-y-2">
            <Label htmlFor="conduta">Conduta *</Label>
            <Textarea
              id="conduta"
              value={conduta}
              onChange={(e) => setConduta(e.target.value)}
              placeholder="Descreva a conduta tomada (ex: Alta com orientações, Internação para observação...)"
              rows={3}
            />
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <Label htmlFor="destino">Destino do Paciente *</Label>
            <Select value={destino} onValueChange={setDestino}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o destino" />
              </SelectTrigger>
              <SelectContent>
                {destinoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Setor de Encaminhamento */}
          {needsEncaminhamento && (
            <div className="space-y-2">
              <Label htmlFor="setor">Setor de Encaminhamento</Label>
              <Select value={setorEncaminhamento} onValueChange={setSetorEncaminhamento}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="triagem">Triagem</SelectItem>
                  <SelectItem value="consultorio">Consultório Médico</SelectItem>
                  <SelectItem value="medicacao">Sala de Medicação</SelectItem>
                  <SelectItem value="observacao">Sala de Observação</SelectItem>
                  <SelectItem value="procedimentos">Sala de Procedimentos</SelectItem>
                  <SelectItem value="exames">Setor de Exames</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Adicionais</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Informações adicionais (opcional)"
              rows={2}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleFinish} disabled={loading} className="bg-success hover:bg-success/90">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Atendimento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
