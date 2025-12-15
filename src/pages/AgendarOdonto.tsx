import { useState, useMemo } from "react";
import { 
  ClipboardCheck, Shield, Wrench, Syringe, Layers, 
  Scissors, Crown, Smile, Search, Clock, Calendar,
  User, CheckCircle2, X
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";

import { 
  procedimentosOdontologicos, 
  categoriasOdontologicas, 
  dentistas,
  horariosDisponiveis,
  type ProcedimentoOdontologico 
} from "@/data/dentalMockData";

// Mapeamento de ícones
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  Shield,
  Wrench,
  Syringe,
  Layers,
  Scissors,
  Crown,
  Smile,
};

// Mock de pacientes para busca
const pacientesMock = [
  { id: '1', nome: 'Maria Silva', prontuario: '2025000001', cpf: '123.456.789-00' },
  { id: '2', nome: 'João Santos', prontuario: '2025000002', cpf: '234.567.890-11' },
  { id: '3', nome: 'Ana Oliveira', prontuario: '2025000003', cpf: '345.678.901-22' },
  { id: '4', nome: 'Pedro Costa', prontuario: '2025000004', cpf: '456.789.012-33' },
];

export default function AgendarOdonto() {
  // Estados
  const [buscaPaciente, setBuscaPaciente] = useState("");
  const [pacienteSelecionado, setPacienteSelecionado] = useState<typeof pacientesMock[0] | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [procedimentosSelecionados, setProcedimentosSelecionados] = useState<ProcedimentoOdontologico[]>([]);
  const [dentistaSelecionado, setDentistaSelecionado] = useState<string>("");
  const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(undefined);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>("");

  // Pacientes filtrados pela busca
  const pacientesFiltrados = useMemo(() => {
    if (!buscaPaciente.trim()) return [];
    const termo = buscaPaciente.toLowerCase();
    return pacientesMock.filter(p => 
      p.nome.toLowerCase().includes(termo) || 
      p.prontuario.includes(termo) ||
      p.cpf.includes(termo)
    );
  }, [buscaPaciente]);

  // Procedimentos da categoria selecionada
  const procedimentosDisponiveis = useMemo(() => {
    if (!categoriaSelecionada) return [];
    return procedimentosOdontologicos[categoriaSelecionada] || [];
  }, [categoriaSelecionada]);

  // Duração total estimada
  const duracaoTotal = useMemo(() => {
    return procedimentosSelecionados.reduce((acc, proc) => acc + proc.duracao, 0);
  }, [procedimentosSelecionados]);

  // Toggle procedimento
  const toggleProcedimento = (procedimento: ProcedimentoOdontologico) => {
    setProcedimentosSelecionados(prev => {
      const exists = prev.find(p => p.id === procedimento.id);
      if (exists) {
        return prev.filter(p => p.id !== procedimento.id);
      }
      return [...prev, procedimento];
    });
  };

  // Remover procedimento
  const removerProcedimento = (procedimentoId: string) => {
    setProcedimentosSelecionados(prev => prev.filter(p => p.id !== procedimentoId));
  };

  // Confirmar agendamento
  const handleConfirmar = () => {
    if (!pacienteSelecionado || procedimentosSelecionados.length === 0 || !dentistaSelecionado || !dataSelecionada || !horarioSelecionado) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const dentista = dentistas.find(d => d.id === dentistaSelecionado);
    
    toast.success("Atendimento agendado com sucesso!", {
      description: `${pacienteSelecionado.nome} - ${format(dataSelecionada, "dd/MM/yyyy")} às ${horarioSelecionado} com ${dentista?.nome}`,
    });

    // Reset form
    setPacienteSelecionado(null);
    setBuscaPaciente("");
    setCategoriaSelecionada(null);
    setProcedimentosSelecionados([]);
    setDentistaSelecionado("");
    setDataSelecionada(undefined);
    setHorarioSelecionado("");
  };

  // Verificar se pode confirmar
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
                      <p className="font-medium text-foreground">{pacienteSelecionado.nome}</p>
                      <p className="text-sm text-muted-foreground">Prontuário: {pacienteSelecionado.prontuario}</p>
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
                    placeholder="Buscar por nome, prontuário ou CPF..."
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    className="pl-10"
                  />
                  {pacientesFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10">
                      {pacientesFiltrados.map(paciente => (
                        <button
                          key={paciente.id}
                          onClick={() => {
                            setPacienteSelecionado(paciente);
                            setBuscaPaciente("");
                          }}
                          className="w-full p-3 text-left hover:bg-muted/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          <p className="font-medium text-foreground">{paciente.nome}</p>
                          <p className="text-sm text-muted-foreground">Prontuário: {paciente.prontuario}</p>
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
                <ScrollArea className="h-[280px] pr-4">
                  <div className="space-y-2">
                    {procedimentosDisponiveis.map(procedimento => {
                      const isSelected = procedimentosSelecionados.some(p => p.id === procedimento.id);
                      
                      return (
                        <div
                          key={procedimento.id}
                          onClick={() => toggleProcedimento(procedimento)}
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
                            {procedimento.duracao} min
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
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
                    {dentistas.map(dentista => (
                      <SelectItem key={dentista.id} value={dentista.id}>
                        <div className="flex flex-col">
                          <span>{dentista.nome}</span>
                          <span className="text-xs text-muted-foreground">{dentista.especialidade} - {dentista.cro}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          ? format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                          : "Selecione a data"
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
                      <SelectValue placeholder="Selecione o horário" />
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
                  {pacienteSelecionado?.nome || "Não selecionado"}
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
                          <p className="text-xs text-muted-foreground">{proc.duracao} min</p>
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

              {/* Duração Total */}
              {duracaoTotal > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Duração Estimada</span>
                    </div>
                    <Badge variant="default" className="text-sm">
                      {duracaoTotal} min
                    </Badge>
                  </div>
                </>
              )}

              <Separator />

              {/* Dentista */}
              <div>
                <p className="text-sm text-muted-foreground">Dentista</p>
                <p className="font-medium text-foreground">
                  {dentistas.find(d => d.id === dentistaSelecionado)?.nome || "Não selecionado"}
                </p>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground">
                    {dataSelecionada 
                      ? format(dataSelecionada, "dd/MM/yyyy")
                      : "Não selecionada"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">
                    {horarioSelecionado || "Não selecionado"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Botão Confirmar */}
              <Button 
                className="w-full" 
                size="lg"
                disabled={!podeConfirmar}
                onClick={handleConfirmar}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Agendamento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
