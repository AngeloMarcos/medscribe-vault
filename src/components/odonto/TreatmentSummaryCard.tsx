import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Printer, FileText } from "lucide-react";
import type { PlanoTratamentoOdonto } from "@/types/dental";

interface TreatmentSummaryCardProps {
  plano: PlanoTratamentoOdonto;
  onApprove?: () => void;
  onPrint?: () => void;
}

export function TreatmentSummaryCard({ plano, onApprove, onPrint }: TreatmentSummaryCardProps) {
  const itens = plano.itens || [];
  const totalItens = itens.length;
  const concluidos = itens.filter(i => i.status === 'concluido').length;
  const emAndamento = itens.filter(i => i.status === 'em_andamento').length;
  const pendentes = itens.filter(i => i.status === 'planejado').length;
  
  const subtotal = itens.reduce((acc, item) => acc + Number(item.valor_unitario), 0);
  const descontoTotal = itens.reduce((acc, item) => acc + (Number(item.valor_unitario) - Number(item.valor_final)), 0);
  const total = itens.reduce((acc, item) => acc + Number(item.valor_final), 0);
  
  const progresso = totalItens > 0 ? (concluidos / totalItens) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Resumo do Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progresso.toFixed(0)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>

        {/* Status dos itens */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-1.5 sm:p-2">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 mx-auto mb-0.5 sm:mb-1" />
            <div className="text-base sm:text-lg font-semibold text-emerald-700 dark:text-emerald-400">{concluidos}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-1.5 sm:p-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 mx-auto mb-0.5 sm:mb-1" />
            <div className="text-base sm:text-lg font-semibold text-amber-700 dark:text-amber-400">{emAndamento}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Em andamento</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-1.5 sm:p-2">
            <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-blue-500 mx-auto mb-0.5 sm:mb-1" />
            <div className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-400">{pendentes}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Pendentes</div>
          </div>
        </div>

        <Separator />

        {/* Resumo financeiro */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-600">
            <span>Descontos</span>
            <span>- R$ {descontoTotal.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="space-y-2">
          {plano.status === 'orcamento' && onApprove && (
            <Button onClick={onApprove} className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar Orçamento
            </Button>
          )}
          <Button variant="outline" onClick={onPrint} className="w-full">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
