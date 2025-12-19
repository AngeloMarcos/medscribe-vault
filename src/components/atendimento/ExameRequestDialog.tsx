import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExamesCatalogo, useCreateSolicitacaoExame, ExameCatalogo } from "@/hooks/useExames";
import { 
  FlaskConical, 
  Search, 
  Printer,
  Loader2,
  AlertTriangle,
  CheckSquare,
  Info,
} from "lucide-react";

interface ExameRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  consultaId: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId?: string;
  profissionalNome: string;
  profissionalRegistro: string;
  profissionalTipoRegistro: string;
  selectedCids?: string[];
}

export function ExameRequestDialog({
  open,
  onOpenChange,
  consultaId,
  pacienteId,
  pacienteNome,
  profissionalId,
  profissionalNome,
  profissionalRegistro,
  profissionalTipoRegistro,
  selectedCids = [],
}: ExameRequestDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExames, setSelectedExames] = useState<ExameCatalogo[]>([]);
  const [cidJustificativa, setCidJustificativa] = useState<string>(selectedCids[0] || "");
  const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState<string>("");
  const [urgencia, setUrgencia] = useState<"normal" | "urgente">("normal");

  const { data: exames, isLoading } = useExamesCatalogo(searchTerm);
  const createSolicitacao = useCreateSolicitacaoExame();

  // Group exams by category
  const groupedExames = useMemo(() => {
    if (!exames) return {};
    return exames.reduce((acc, exam) => {
      const category = exam.categoria || "Outros";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(exam);
      return acc;
    }, {} as Record<string, ExameCatalogo[]>);
  }, [exames]);

  const handleToggleExame = (exame: ExameCatalogo) => {
    const isSelected = selectedExames.some((e) => e.id === exame.id);
    if (isSelected) {
      setSelectedExames(selectedExames.filter((e) => e.id !== exame.id));
    } else {
      setSelectedExames([...selectedExames, exame]);
    }
  };

  const handleSave = async () => {
    if (selectedExames.length === 0) return;

    await createSolicitacao.mutateAsync({
      consulta_id: consultaId,
      paciente_id: pacienteId,
      profissional_id: profissionalId,
      cid_justificativa: cidJustificativa || undefined,
      hipotese_diagnostica: hipoteseDiagnostica || undefined,
      urgencia,
      itens: selectedExames.map((exame) => ({
        exame_id: exame.id,
        exame_nome: exame.nome,
      })),
    });

    // Reset form
    setSelectedExames([]);
    setCidJustificativa(selectedCids[0] || "");
    setHipoteseDiagnostica("");
    setUrgencia("normal");
    setSearchTerm("");
    onOpenChange(false);
  };

  const hasAutorizacao = selectedExames.some((e) => e.requer_autorizacao);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Solicitação de Exames
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Patient and Urgency Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Paciente:</span>{" "}
              <strong>{pacienteNome}</strong>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Urgência:</span>
              <Select
                value={urgencia}
                onValueChange={(v) => setUrgencia(v as "normal" | "urgente")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasAutorizacao && (
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Requer Autorização
              </Badge>
            )}
          </div>

          <Separator />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar exame por nome, código ou categoria..."
              className="pl-9"
            />
          </div>

          {/* Exams List */}
          <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Available Exams */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 font-medium text-sm">
                Exames Disponíveis
              </div>
              <ScrollArea className="h-[250px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : exames && exames.length > 0 ? (
                  <div className="p-2">
                    {Object.entries(groupedExames).map(([category, categoryExames]) => (
                      <div key={category} className="mb-3 last:mb-0">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1 sticky top-0 bg-background">
                          {category}
                        </div>
                        {categoryExames.map((exame) => {
                          const isSelected = selectedExames.some((e) => e.id === exame.id);
                          return (
                            <button
                              key={exame.id}
                              onClick={() => handleToggleExame(exame)}
                              className={`w-full text-left p-2 rounded-md transition-colors ${
                                isSelected
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate">
                                    {exame.nome}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {exame.codigo}
                                    </Badge>
                                    {exame.prazo_resultado && (
                                      <span className="text-xs text-muted-foreground">
                                        Prazo: {exame.prazo_resultado}
                                      </span>
                                    )}
                                    {exame.requer_autorizacao && (
                                      <Badge variant="secondary" className="text-xs">
                                        Autorização
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchTerm.length >= 2
                      ? "Nenhum exame encontrado"
                      : "Digite para buscar exames"}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Selected Exams */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 font-medium text-sm flex items-center justify-between">
                <span>Exames Selecionados</span>
                <Badge variant="secondary">{selectedExames.length}</Badge>
              </div>
              <ScrollArea className="h-[250px]">
                {selectedExames.length > 0 ? (
                  <div className="p-2 space-y-2">
                    {selectedExames.map((exame) => (
                      <div
                        key={exame.id}
                        className="flex items-start gap-2 p-2 bg-primary/5 rounded-md"
                      >
                        <CheckSquare className="h-4 w-4 text-primary mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{exame.nome}</div>
                          {exame.preparo && (
                            <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
                              <Info className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>{exame.preparo}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleExame(exame)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Selecione os exames na lista ao lado
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <Separator />

          {/* Justification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CID-10 (Justificativa)</Label>
              <div className="flex gap-2 flex-wrap">
                <Input
                  value={cidJustificativa}
                  onChange={(e) => setCidJustificativa(e.target.value.toUpperCase())}
                  placeholder="Ex: J11.1"
                  className="w-32"
                />
                {selectedCids.length > 0 && (
                  <div className="flex gap-1 items-center">
                    {selectedCids.map((cid) => (
                      <Badge
                        key={cid}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setCidJustificativa(cid)}
                      >
                        {cid}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Hipótese Diagnóstica</Label>
              <Input
                value={hipoteseDiagnostica}
                onChange={(e) => setHipoteseDiagnostica(e.target.value)}
                placeholder="Descrição da hipótese diagnóstica..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedExames.length === 0 || createSolicitacao.isPending}
          >
            {createSolicitacao.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Salvar Solicitação ({selectedExames.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
