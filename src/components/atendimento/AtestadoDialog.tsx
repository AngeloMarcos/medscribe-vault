import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateAtestado } from "@/hooks/useAtestados";
import { 
  FileText, 
  CalendarIcon, 
  Printer,
  Loader2,
  Calculator,
} from "lucide-react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AtestadoDialogProps {
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

export function AtestadoDialog({
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
}: AtestadoDialogProps) {
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);
  const [diasAfastamento, setDiasAfastamento] = useState<number>(1);
  const [cidCodigo, setCidCodigo] = useState<string>(selectedCids[0] || "");
  const [motivo, setMotivo] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [calcMode, setCalcMode] = useState<"dias" | "data">("dias");

  const createAtestado = useCreateAtestado();

  // Calculate end date when days change
  useEffect(() => {
    if (calcMode === "dias" && diasAfastamento > 0) {
      const newEndDate = addDays(dataInicio, diasAfastamento - 1);
      setDataFim(newEndDate);
    }
  }, [diasAfastamento, dataInicio, calcMode]);

  // Calculate days when end date changes
  useEffect(() => {
    if (calcMode === "data" && dataFim) {
      const days = differenceInDays(dataFim, dataInicio) + 1;
      if (days > 0) {
        setDiasAfastamento(days);
      }
    }
  }, [dataFim, dataInicio, calcMode]);

  // Update CID when selectedCids changes
  useEffect(() => {
    if (selectedCids.length > 0 && !cidCodigo) {
      setCidCodigo(selectedCids[0]);
    }
  }, [selectedCids, cidCodigo]);

  const handleDiasChange = (value: string) => {
    setCalcMode("dias");
    const dias = parseInt(value) || 0;
    setDiasAfastamento(dias);
  };

  const handleDataFimChange = (date: Date | undefined) => {
    if (date) {
      setCalcMode("data");
      setDataFim(date);
    }
  };

  const handleSave = async () => {
    if (!dataFim || diasAfastamento < 1) return;

    await createAtestado.mutateAsync({
      consulta_id: consultaId,
      paciente_id: pacienteId,
      profissional_id: profissionalId,
      data_inicio: format(dataInicio, "yyyy-MM-dd"),
      data_fim: format(dataFim, "yyyy-MM-dd"),
      dias_afastamento: diasAfastamento,
      cid_codigo: cidCodigo || undefined,
      motivo: motivo || undefined,
      observacoes: observacoes || undefined,
    });

    // Reset form
    setDataInicio(new Date());
    setDataFim(undefined);
    setDiasAfastamento(1);
    setCidCodigo(selectedCids[0] || "");
    setMotivo("");
    setObservacoes("");
    onOpenChange(false);
  };

  const formatPeriodo = () => {
    if (!dataFim) return "";
    return `de ${format(dataInicio, "dd/MM/yyyy")} a ${format(dataFim, "dd/MM/yyyy")} (${diasAfastamento} ${diasAfastamento === 1 ? "dia" : "dias"})`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Novo Atestado Médico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="text-sm">
            <span className="text-muted-foreground">Paciente:</span>{" "}
            <strong>{pacienteNome}</strong>
          </div>

          <Separator />

          {/* Date Calculation Section */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium">Período de Afastamento</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataInicio && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dataInicio, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={(date) => date && setDataInicio(date)}
                      locale={ptBR}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Days */}
              <div className="space-y-2">
                <Label>Dias de Afastamento</Label>
                <Input
                  type="number"
                  min={1}
                  value={diasAfastamento}
                  onChange={(e) => handleDiasChange(e.target.value)}
                  className="text-center"
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFim && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={handleDataFimChange}
                      locale={ptBR}
                      disabled={(date) => date < dataInicio}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Calculated Period Display */}
            {dataFim && (
              <div className="mt-2 p-2 bg-primary/10 rounded text-center">
                <span className="font-medium text-primary">
                  Período: {formatPeriodo()}
                </span>
              </div>
            )}
          </div>

          {/* CID */}
          <div className="space-y-2">
            <Label>CID-10 (opcional)</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={cidCodigo}
                onChange={(e) => setCidCodigo(e.target.value.toUpperCase())}
                placeholder="Ex: J11.1"
                className="w-32"
              />
              {selectedCids.length > 0 && (
                <div className="flex gap-1 items-center">
                  <span className="text-sm text-muted-foreground">CIDs da consulta:</span>
                  {selectedCids.map((cid) => (
                    <Badge
                      key={cid}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setCidCodigo(cid)}
                    >
                      {cid}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Motivo / Descrição</Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Atesto que o(a) paciente acima identificado(a) esteve sob meus cuidados profissionais..."
              rows={3}
            />
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <Label>Observações (opcional)</Label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!dataFim || diasAfastamento < 1 || createAtestado.isPending}
          >
            {createAtestado.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Salvar Atestado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
