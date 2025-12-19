import { useState, useMemo } from "react";
import { 
  ClipboardCheck, Shield, Wrench, Syringe, Layers, 
  Scissors, Crown, Smile, Search, Clock, Calendar,
  User, CheckCircle2, X, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useCreateAgendamentoOdonto } from "@/hooks/useAgendamentosOdonto";
import { useProcedimentosByCategoria, useDentistas } from "@/hooks/usePlanoTratamento";
import { categoriasOdontoConfig } from "@/types/dental";

const categoriasOdontologicas = [
  { id: 'avaliacaoInicial', nome: 'Avaliação', icone: 'ClipboardCheck', cor: 'bg-blue-500' },
  { id: 'preventivos', nome: 'Preventivo', icone: 'Shield', cor: 'bg-green-500' },
  { id: 'restauradores', nome: 'Restauração', icone: 'Wrench', cor: 'bg-orange-500' },
  { id: 'endodontia', nome: 'Endodontia', icone: 'Syringe', cor: 'bg-red-500' },
  { id: 'periodontia', nome: 'Periodontia', icone: 'Layers', cor: 'bg-purple-500' },
  { id: 'cirurgia', nome: 'Cirurgia', icone: 'Scissors', cor: 'bg-rose-500' },
  { id: 'protese', nome: 'Prótese', icone: 'Crown', cor: 'bg-amber-500' },
  { id: 'ortodontia', nome: 'Ortodontia', icone: 'Smile', cor: 'bg-cyan-500' },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck, Shield, Wrench, Syringe, Layers, Scissors, Crown, Smile,
};

const horariosDisponiveis = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const cadeirasOdonto = ['Cadeira 1', 'Cadeira 2', 'Cadeira 3', 'Cadeira 4'];

interface Paciente {
  id: string;
  name: string;
  cpf: string;
  medical_record_number: string | null;
}

interface ProcedimentoSelecionado {
  id: string;
  nome: string;
  duracao_minutos: number;
  codigo: string;
}

export default function AgendarOdonto() {
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState<ProcedimentoSelecionado[]>([]);
  const [dentistaSelecionado, setDentistaSelecionado] = useState<string>("");
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");
  const [cadeiraSelecionada, setCadeiraSelecionada] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");

  const createAgendamento = useCreateAgendamentoOdonto();
  const { data: procedimentosByCategoria, isLoading: loadingProcedimentos } = useProcedimentosByCategoria();
  const { data: dentistas, isLoading: loadingDentistas } = useDentistas();

  // Search patients from database
  const { data: pacientesFiltrados = [], isLoading: searchingPatients } = useQuery({
    queryKey: ['patients-search', buscaPaciente],
    queryFn: async () => {
      if (!buscaPaciente.trim() || buscaPaciente.length < 2) return [];
      
      const termo = buscaPaciente.toLowerCase();
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, cpf, medical_record_number')
        .or(`name.ilike.%${termo}%,cpf.ilike.%${termo}%,medical_record_number.ilike.%${termo}%`)
        .limit(10);

      if (error) throw error;
      return data as Paciente[];
    },
    enabled: buscaPaciente.length >= 2,
  });

  // Procedimentos da categoria selecionada
  const procedimentosDisponiveis = useMemo(() => {
    if (!categoriaSelecionada || !procedimentosByCategoria) return [];
    return procedimentosByCategoria[categoriaSelecionada] || [];
  }, [categoriaSelecionada, procedimentosByCategoria]);

  // Duração total estimada
  const duracaoTotal = useMemo(() => {
    return procedimentosSelecionados.reduce((acc, proc) => acc + proc.duracao_minutos, 0);
  }, [procedimentosSelecionados]);

  const toggleProcedimento = (procedimento: ProcedimentoSelecionado) => {
    setProcedimentosSelecionados(prev => {
      const exists = prev.find(p => p.id === procedimento.id);
      if (exists) {
        return prev.filter(p => p.id !== procedimento.id);
      }
      return [...prev, procedimento];
    });
  };

  const removerProcedimento = (procedimentoId: string) => {
    setProcedimentosSelecionados(prev => prev.filter(p => p.id !== procedimentoId));
  };

  const handleConfirmar = async () => {
    if (!pacienteSelecionado || procedimentosSelecionados.length === 0 || !dentistaSelecionado || !dataSelecionada || !horarioSelecionado) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await createAgendamento.mutateAsync({
        paciente_id: pacienteSelecionado.id,
        profissional_id: dentistaSelecionado,
        data: format(dataSelecionada, 'yyyy-MM-dd'),
        hora_inicio: horarioSelecionado,
        duracao_minutos: duracaoTotal,
        cadeira: cadeiraSelecionada || undefined,
        observacoes: observacoes || undefined,
        procedimentos_ids: procedimentosSelecionados.map(p => p.id),
      });

      // Reset form
      setPacienteSelecionado(null);
      setBuscaPaciente("");
      setCategoriaSelecionada(null);
      setProcedimentosSelecionados([]);
      setDentistaSelecionado("");
      setDataSelecionada(undefined);
      setHorarioSelecionado("");
      setCadeiraSelecionada("");
      setObservacoes("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const podeConfirmar = pacienteSelecionado && 
    procedimentosSelecionados.length > 0 && 
    dentistaSelecionado && 
    dataSelecionada && 
    horarioSelecionado;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-2xl">🦷</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agendar Atendimento Odontológico</h1>
          <p className="text-muted-foreground">Selecione o paciente, procedimentos e horário</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Busca de Paciente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pacienteSelecionado ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{pacienteSelecionado.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Prontuário: {pacienteSelecionado.medical_record_number || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setPacienteSelecionado(null);
                      setBuscaPaciente("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, prontuário ou CPF (mín. 2 caracteres)..."
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    className="pl-10"
                  />
                  {searchingPatients && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {pacientesFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-auto">
                      {pacientesFiltrados.map(paciente => (
                        <button
                          key={paciente.id}
                          onClick={() => {
                            setPacienteSelecionado(paciente);
                            setBuscaPaciente("");
                          }}
                          className="w-full p-3 text-left hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          <p className="font-medium text-foreground">{paciente.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Prontuário: {paciente.medical_record_number || 'N/A'} | CPF: {paciente.cpf}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categorias de Procedimentos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categoria do Procedimento</CardTitle>
              <CardDescription>Selecione uma categoria para ver os procedimentos disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categoriasOdontologicas.map(categoria => {
                  const Icon = iconMap[categoria.icone];
                  const isSelected = categoriaSelecionada === categoria.id;
                  
                  return (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaSelecionada(isSelected ? null : categoria.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                        isSelected 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", categoria.cor)}>
                        {Icon && <Icon className="h-5 w-5 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{categoria.nome}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lista de Procedimentos */}
          {categoriaSelecionada && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Procedimentos - {categoriasOdontologicas.find(c => c.id === categoriaSelecionada)?.nome}
                </CardTitle>
                <CardDescription>Selecione um ou mais procedimentos</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProcedimentos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-2">
                      {procedimentosDisponiveis.map(procedimento => {
                        const isSelected = procedimentosSelecionados.some(p => p.id === procedimento.id);
                        
                        return (
                          <div
                            key={procedimento.id}
                            onClick={() => toggleProcedimento({
                              id: procedimento.id,
                              nome: procedimento.nome,
                              duracao_minutos: procedimento.duracao_minutos || 30,
                              codigo: procedimento.codigo,
                            })}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                              isSelected 
                                ? "bg-primary/10 border-primary" 
                                : "border-border hover:bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox checked={isSelected} />
                              <div>
                                <span className="font-medium text-foreground">{procedimento.nome}</span>
                                <p className="text-xs text-muted-foreground">{procedimento.codigo}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {procedimento.duracao_minutos || 30} min
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}

          {/* Seleção de Dentista e Horário */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dentista */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Dentista</label>
                <Select value={dentistaSelecionado} onValueChange={setDentistaSelecionado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dentista" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDentistas ? (
                      <div className="p-2 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      dentistas?.map(dentista => (
                        <SelectItem key={dentista.id} value={dentista.id}>
                          <div className="flex flex-col">
                            <span>{dentista.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {dentista.especialidade?.nome || 'Clínico Geral'} - {dentista.registro_profissional}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Data, Hora e Cadeira */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Data</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dataSelecionada && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dataSelecionada 
                          ? format(dataSelecionada, "dd/MM/yyyy")
                          : "Selecione"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dataSelecionada}
                        onSelect={setDataSelecionada}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Horário</label>
                  <Select value={horarioSelecionado} onValueChange={setHorarioSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horariosDisponiveis.map(horario => (
                        <SelectItem key={horario} value={horario}>
                          {horario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Cadeira</label>
                  <Select value={cadeiraSelecionada} onValueChange={setCadeiraSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cadeira" />
                    </SelectTrigger>
                    <SelectContent>
                      {cadeirasOdonto.map(cadeira => (
                        <SelectItem key={cadeira} value={cadeira}>
                          {cadeira}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Observações</label>
                <Textarea 
                  placeholder="Observações sobre o agendamento..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Resumo */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Resumo do Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Paciente */}
              <div>
                <p className="text-sm text-muted-foreground">Paciente</p>
                <p className="font-medium text-foreground">
                  {pacienteSelecionado?.name || "Não selecionado"}
                </p>
              </div>

              <Separator />

              {/* Procedimentos Selecionados */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Procedimentos ({procedimentosSelecionados.length})
                </p>
                {procedimentosSelecionados.length > 0 ? (
                  <div className="space-y-2">
                    {procedimentosSelecionados.map(proc => (
                      <div 
                        key={proc.id} 
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{proc.nome}</p>
                          <p className="text-xs text-muted-foreground">{proc.duracao_minutos} min</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0"
                          onClick={() => removerProcedimento(proc.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Nenhum procedimento selecionado</p>
                )}
              </div>

              {duracaoTotal > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duração estimada</span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duracaoTotal} min
                    </Badge>
                  </div>
                </>
              )}

              <Separator />

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {dataSelecionada ? format(dataSelecionada, "dd/MM/yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">
                    {horarioSelecionado || "-"}
                  </p>
                </div>
              </div>

              {/* Dentista */}
              <div>
                <p className="text-sm text-muted-foreground">Dentista</p>
                <p className="font-medium text-foreground">
                  {dentistas?.find(d => d.id === dentistaSelecionado)?.nome || "Não selecionado"}
                </p>
              </div>

              {cadeiraSelecionada && (
                <div>
                  <p className="text-sm text-muted-foreground">Cadeira</p>
                  <p className="font-medium text-foreground">{cadeiraSelecionada}</p>
                </div>
              )}

              <Separator />

              {/* Botão Confirmar */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleConfirmar}
                disabled={!podeConfirmar || createAgendamento.isPending}
              >
                {createAgendamento.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
