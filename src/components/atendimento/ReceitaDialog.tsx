import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicamentoSearch } from "./MedicamentoSearch";
import { useCreateReceita, ReceitaItem } from "@/hooks/useReceitas";
import { Medicamento } from "@/hooks/useMedicamentos";
import { 
  Pill, 
  Plus, 
  Trash2, 
  GripVertical, 
  Printer,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ReceitaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultaId: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId?: string;
  profissionalNome: string;
  profissionalRegistro: string;
  profissionalTipoRegistro: string;
}

const VIAS = [
  "oral",
  "sublingual",
  "retal",
  "tópica",
  "transdérmica",
  "intramuscular (IM)",
  "endovenosa (EV)",
  "subcutânea (SC)",
  "inalatória",
  "nasal",
  "oftálmica",
  "otológica",
];

const FREQUENCIAS = [
  "1x ao dia",
  "2x ao dia (12/12h)",
  "3x ao dia (8/8h)",
  "4x ao dia (6/6h)",
  "de 4/4 horas",
  "a cada 48 horas",
  "1x por semana",
  "se necessário (SOS)",
  "uso contínuo",
];

const UNIDADES = ["mg", "g", "mL", "gotas", "UI", "comprimido(s)", "cápsula(s)", "ampola(s)"];

interface MedicamentoFormData {
  medicamento_id?: string;
  medicamento_nome: string;
  apresentacao: string;
  dose: string;
  unidade: string;
  via: string;
  frequencia: string;
  duracao_dias: number | null;
  duracao_texto: string;
  quantidade_total: number | null;
  orientacoes: string;
  controlado: boolean;
  tipo_receita: string;
}

const emptyMedicamento: MedicamentoFormData = {
  medicamento_nome: "",
  apresentacao: "",
  dose: "",
  unidade: "comprimido(s)",
  via: "oral",
  frequencia: "1x ao dia",
  duracao_dias: 7,
  duracao_texto: "",
  quantidade_total: null,
  orientacoes: "",
  controlado: false,
  tipo_receita: "simples",
};

export function ReceitaDialog({
  open,
  onOpenChange,
  consultaId,
  pacienteId,
  pacienteNome,
  profissionalId,
  profissionalNome,
  profissionalRegistro,
  profissionalTipoRegistro,
}: ReceitaDialogProps) {
  const [medicamentos, setMedicamentos] = useState<MedicamentoFormData[]>([]);
  const [currentMedicamento, setCurrentMedicamento] = useState<MedicamentoFormData>(emptyMedicamento);
  const [tipoReceita, setTipoReceita] = useState<"simples" | "especial">("simples");

  const createReceita = useCreateReceita();

  const handleSelectMedicamento = (med: Medicamento) => {
    setCurrentMedicamento({
      ...currentMedicamento,
      medicamento_id: med.id,
      medicamento_nome: med.nome_generico,
      apresentacao: med.apresentacao,
      via: med.via_padrao || "oral",
      controlado: med.controlado,
      tipo_receita: med.tipo_receita,
    });

    // Update recipe type if it's a controlled medication
    if (med.controlado && tipoReceita === "simples") {
      setTipoReceita("especial");
    }
  };

  const handleAddMedicamento = () => {
    if (!currentMedicamento.medicamento_nome || !currentMedicamento.dose) {
      return;
    }

    setMedicamentos([...medicamentos, currentMedicamento]);
    setCurrentMedicamento(emptyMedicamento);
  };

  const handleRemoveMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (medicamentos.length === 0) return;

    const itens: Omit<ReceitaItem, "id">[] = medicamentos.map((med, index) => ({
      medicamento_id: med.medicamento_id || null,
      medicamento_nome: `${med.medicamento_nome} - ${med.apresentacao}`,
      dose: med.dose,
      unidade: med.unidade,
      via: med.via,
      frequencia: med.frequencia,
      duracao_dias: med.duracao_dias,
      duracao_texto: med.duracao_texto || null,
      quantidade_total: med.quantidade_total,
      orientacoes: med.orientacoes || null,
      ordem: index,
    }));

    await createReceita.mutateAsync({
      consulta_id: consultaId,
      paciente_id: pacienteId,
      profissional_id: profissionalId,
      tipo: tipoReceita,
      itens,
    });

    setMedicamentos([]);
    setCurrentMedicamento(emptyMedicamento);
    onOpenChange(false);
  };

  const hasControlado = medicamentos.some((m) => m.controlado);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Nova Receita Médica
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Patient and Type Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente:</span>{" "}
              <strong>{pacienteNome}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Tipo:</span>
              <Select
                value={tipoReceita}
                onValueChange={(v) => setTipoReceita(v as "simples" | "especial")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasControlado && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Contém Controlados
              </Badge>
            )}
          </div>

          <Separator />

          {/* Medication Search and Form */}
          <div className="space-y-4">
            <MedicamentoSearch onSelect={handleSelectMedicamento} />

            {currentMedicamento.medicamento_nome && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg border">
                <div className="col-span-full">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{currentMedicamento.medicamento_nome}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentMedicamento.apresentacao}
                    </span>
                    {currentMedicamento.controlado && (
                      <Badge variant="destructive" className="text-xs">Controlado</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Dose *</Label>
                  <Input
                    value={currentMedicamento.dose}
                    onChange={(e) =>
                      setCurrentMedicamento({ ...currentMedicamento, dose: e.target.value })
                    }
                    placeholder="Ex: 1, 500, 10"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Unidade</Label>
                  <Select
                    value={currentMedicamento.unidade}
                    onValueChange={(v) =>
                      setCurrentMedicamento({ ...currentMedicamento, unidade: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Via</Label>
                  <Select
                    value={currentMedicamento.via}
                    onValueChange={(v) =>
                      setCurrentMedicamento({ ...currentMedicamento, via: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIAS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Frequência</Label>
                  <Select
                    value={currentMedicamento.frequencia}
                    onValueChange={(v) =>
                      setCurrentMedicamento({ ...currentMedicamento, frequencia: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIAS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Duração (dias)</Label>
                  <Input
                    type="number"
                    value={currentMedicamento.duracao_dias || ""}
                    onChange={(e) =>
                      setCurrentMedicamento({
                        ...currentMedicamento,
                        duracao_dias: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="7"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Ou duração (texto)</Label>
                  <Input
                    value={currentMedicamento.duracao_texto}
                    onChange={(e) =>
                      setCurrentMedicamento({
                        ...currentMedicamento,
                        duracao_texto: e.target.value,
                      })
                    }
                    placeholder="Uso contínuo"
                  />
                </div>

                <div className="col-span-full space-y-1">
                  <Label className="text-xs">Orientações</Label>
                  <Input
                    value={currentMedicamento.orientacoes}
                    onChange={(e) =>
                      setCurrentMedicamento({
                        ...currentMedicamento,
                        orientacoes: e.target.value,
                      })
                    }
                    placeholder="Em jejum, antes das refeições, etc."
                  />
                </div>

                <div className="col-span-full flex justify-end">
                  <Button onClick={handleAddMedicamento} disabled={!currentMedicamento.dose}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Medicamento
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Medication List */}
          <div className="flex-1 min-h-0">
            <Label className="text-sm font-medium">Medicamentos na Receita</Label>
            <ScrollArea className="h-[200px] mt-2 border rounded-md">
              {medicamentos.length > 0 ? (
                <div className="p-2 space-y-2">
                  {medicamentos.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-card rounded-md border"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-1 cursor-grab" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{index + 1}.</span>
                          <span className="font-medium">{med.medicamento_nome}</span>
                          <span className="text-muted-foreground text-sm">
                            {med.apresentacao}
                          </span>
                          {med.controlado && (
                            <Badge variant="destructive" className="text-xs">
                              Controlado
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {med.dose} {med.unidade}, via {med.via}, {med.frequencia}
                          {med.duracao_dias && ` por ${med.duracao_dias} dias`}
                          {med.duracao_texto && ` - ${med.duracao_texto}`}
                        </div>
                        {med.orientacoes && (
                          <div className="text-sm text-primary mt-1 italic">
                            {med.orientacoes}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMedicamento(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum medicamento adicionado. Busque e adicione medicamentos acima.
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={medicamentos.length === 0 || createReceita.isPending}
          >
            {createReceita.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Salvar Receita
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
