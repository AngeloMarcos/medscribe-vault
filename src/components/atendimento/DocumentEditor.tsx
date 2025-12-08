import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { A4DocumentPreview } from "./A4DocumentPreview";
import { TipoDocumento, getDocumentTypeLabel } from "@/types/atendimento";
import { Printer, Save, X } from "lucide-react";

interface DocumentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoDocumento;
  paciente: {
    nome: string;
    cpf: string;
  };
  profissional: {
    nome: string;
    registro: string;
    tipo_registro: string;
  };
  onSave?: (conteudo: string) => void;
}

const templatesPorTipo: Record<TipoDocumento, string> = {
  atestado: `Atesto, para os devidos fins, que o(a) paciente acima identificado(a) esteve sob meus cuidados médicos nesta data, necessitando de afastamento de suas atividades por um período de ___ (___) dias, a contar desta data.

CID-10: ___`,
  receita_simples: `Uso Interno:

1. _______________________________________________
   Posologia: ___________________________________

2. _______________________________________________
   Posologia: ___________________________________

3. _______________________________________________
   Posologia: ___________________________________`,
  receita_especial: `RECEITUÁRIO DE CONTROLE ESPECIAL

Medicamento: ___________________________________
Quantidade: ____________________________________
Posologia: _____________________________________

Observações: ___________________________________`,
  pedido_exame: `Solicito a realização dos seguintes exames complementares:

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Hipótese Diagnóstica: ___________________________

Justificativa Clínica: __________________________`,
  encaminhamento: `Encaminho o(a) paciente acima identificado(a) para avaliação e conduta com a especialidade de _____________________.

Resumo Clínico:
________________________________________________

Hipótese Diagnóstica: ___________________________

CID-10: ___`,
};

export function DocumentEditor({
  open,
  onOpenChange,
  tipo,
  paciente,
  profissional,
  onSave,
}: DocumentEditorProps) {
  const [conteudo, setConteudo] = useState(templatesPorTipo[tipo] || "");
  const [diasAfastamento, setDiasAfastamento] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    onSave?.(conteudo);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <span>{getDocumentTypeLabel(tipo)}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-6 p-6 pt-4 h-[calc(90vh-100px)]">
          {/* Editor Panel */}
          <div className="w-1/3 flex flex-col gap-4">
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Paciente
                </Label>
                <p className="font-medium">{paciente.nome}</p>
                <p className="text-sm text-muted-foreground">{paciente.cpf}</p>
              </div>

              {tipo === "atestado" && (
                <div>
                  <Label htmlFor="dias">Dias de afastamento</Label>
                  <Input
                    id="dias"
                    type="number"
                    min="1"
                    value={diasAfastamento}
                    onChange={(e) => setDiasAfastamento(e.target.value)}
                    placeholder="Ex: 3"
                  />
                </div>
              )}

              <div className="flex-1">
                <Label htmlFor="conteudo">Conteúdo do Documento</Label>
                <Textarea
                  id="conteudo"
                  value={conteudo}
                  onChange={(e) => setConteudo(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Digite o conteúdo do documento..."
                />
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 bg-muted/50 rounded-lg overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-8 flex justify-center">
                <div className="transform scale-[0.7] origin-top">
                  <A4DocumentPreview
                    ref={printRef}
                    tipo={tipo}
                    conteudo={conteudo}
                    paciente={paciente}
                    profissional={profissional}
                  />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
