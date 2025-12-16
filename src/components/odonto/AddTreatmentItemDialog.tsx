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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useProcedimentosByCategoria, useDentistas } from "@/hooks/usePlanoTratamento";
import type { ProcedimentoOdonto, UrgenciaTratamento } from "@/types/dental";
import { categoriasOdontoConfig } from "@/types/dental";

interface AddTreatmentItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    dente: number | null;
    superficie?: string;
    procedimento: ProcedimentoOdonto;
    profissionalId?: string;
    valorUnitario: number;
    desconto: number;
    valorFinal: number;
    urgencia: UrgenciaTratamento;
    observacoes?: string;
  }) => void;
}

const superficies = ['Oclusal', 'Mesial', 'Distal', 'Vestibular', 'Lingual/Palatina'];

const urgenciaOptions: { value: UrgenciaTratamento; label: string; color: string }[] = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'media', label: 'Média', color: 'bg-amber-100 text-amber-800' },
  { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-800' },
];

export function AddTreatmentItemDialog({
  open,
  onOpenChange,
  onAdd,
}: AddTreatmentItemDialogProps) {
  const [categoria, setCategoria] = useState<string>('');
  const [procedimento, setProcedimento] = useState<ProcedimentoOdonto | null>(null);
  const [dente, setDente] = useState<string>('');
  const [superficiesSelecionadas, setSuperficiesSelecionadas] = useState<string[]>([]);
  const [profissionalId, setProfissionalId] = useState<string>('');
  const [desconto, setDesconto] = useState<number>(0);
  const [urgencia, setUrgencia] = useState<UrgenciaTratamento>('baixa');
  const [observacoes, setObservacoes] = useState('');

  // Fetch data from Supabase
  const { data: procedimentosGrouped, isLoading: loadingProcedimentos } = useProcedimentosByCategoria();
  const { data: profissionais, isLoading: loadingProfissionais } = useDentistas();

  const procedimentosCategoria = useMemo(() => {
    if (!categoria || !procedimentosGrouped) return [];
    return procedimentosGrouped[categoria] || [];
  }, [categoria, procedimentosGrouped]);

  const categorias = useMemo(() => {
    if (!procedimentosGrouped) return [];
    return Object.keys(procedimentosGrouped).map(key => ({
      id: key,
      nome: categoriasOdontoConfig[key]?.nome || key,
      cor: categoriasOdontoConfig[key]?.cor || 'bg-gray-500',
    }));
  }, [procedimentosGrouped]);

  const valorUnitario = procedimento?.preco_padrao || 0;
  const valorFinal = valorUnitario - (valorUnitario * desconto / 100);

  const handleSuperificieChange = (superficie: string, checked: boolean) => {
    if (checked) {
      setSuperficiesSelecionadas([...superficiesSelecionadas, superficie]);
    } else {
      setSuperficiesSelecionadas(superficiesSelecionadas.filter(s => s !== superficie));
    }
  };

  const handleSubmit = () => {
    if (!procedimento) return;
    
    onAdd({
      dente: dente ? parseInt(dente) : null,
      superficie: superficiesSelecionadas.length > 0 ? superficiesSelecionadas.join(', ') : undefined,
      procedimento,
      profissionalId: profissionalId || undefined,
      valorUnitario,
      desconto,
      valorFinal,
      urgencia,
      observacoes: observacoes || undefined,
    });

    // Reset form
    setCategoria('');
    setProcedimento(null);
    setDente('');
    setSuperficiesSelecionadas([]);
    setProfissionalId('');
    setDesconto(0);
    setUrgencia('baixa');
    setObservacoes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adicionar Procedimento ao Plano</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2 sm:pr-4">
          <div className="space-y-4 py-4">
            {/* Dente e Urgência */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dente (opcional)</Label>
                <Input
                  type="number"
                  placeholder="Ex: 16, 21, 36..."
                  value={dente}
                  onChange={(e) => setDente(e.target.value)}
                  min={11}
                  max={48}
                />
              </div>
              
              {/* Urgência */}
              <div className="space-y-2">
                <Label>Urgência</Label>
                <Select value={urgencia} onValueChange={(v) => setUrgencia(v as UrgenciaTratamento)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgenciaOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <Badge variant="secondary" className={opt.color}>
                          {opt.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Superfícies */}
            {dente && (
              <div className="space-y-2">
                <Label>Superfícies</Label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  {superficies.map(sup => (
                    <div key={sup} className="flex items-center space-x-2">
                      <Checkbox
                        id={sup}
                        checked={superficiesSelecionadas.includes(sup)}
                        onCheckedChange={(checked) => handleSuperificieChange(sup, checked as boolean)}
                      />
                      <label htmlFor={sup} className="text-sm cursor-pointer">
                        {sup}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              {loadingProcedimentos ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={categoria} onValueChange={(v) => {
                  setCategoria(v);
                  setProcedimento(null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${cat.cor}`} />
                          {cat.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Procedimento */}
            {categoria && (
              <div className="space-y-2">
                <Label>Procedimento</Label>
                <Select 
                  value={procedimento?.id || ''} 
                  onValueChange={(v) => {
                    const proc = procedimentosCategoria.find(p => p.id === v);
                    setProcedimento(proc || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o procedimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedimentosCategoria.map(proc => (
                      <SelectItem key={proc.id} value={proc.id}>
                        <div className="flex justify-between items-center w-full gap-4">
                          <span>{proc.nome}</span>
                          <Badge variant="outline" className="ml-2">
                            R$ {Number(proc.preco_padrao).toFixed(2)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dentista */}
            <div className="space-y-2">
              <Label>Dentista Responsável (opcional)</Label>
              {loadingProfissionais ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={profissionalId} onValueChange={setProfissionalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dentista" />
                  </SelectTrigger>
                  <SelectContent>
                    {profissionais?.map(d => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome} - {d.registro_profissional}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Valores */}
            {procedimento && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label>Valor Unitário</Label>
                  <Input
                    value={`R$ ${Number(valorUnitario).toFixed(2)}`}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input
                    type="number"
                    value={desconto}
                    onChange={(e) => setDesconto(Math.max(0, Math.min(100, Number(e.target.value))))}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Final</Label>
                  <Input
                    value={`R$ ${valorFinal.toFixed(2)}`}
                    disabled
                    className="bg-muted font-semibold text-primary"
                  />
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                placeholder="Observações sobre o procedimento..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!procedimento}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
