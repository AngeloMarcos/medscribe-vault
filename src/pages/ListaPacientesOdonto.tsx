import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Smile,
  Search,
  Filter,
  ChevronDown,
  Clock,
  User,
  Play,
  Eye,
  MoreHorizontal,
  Calendar,
  Armchair,
  RefreshCw,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/useResponsive';
import {
  agendamentosOdontoMock,
  dentistas,
  categoriasOdontologicas,
  cadeirasOdonto,
  AgendamentoOdonto,
} from '@/data/dentalMockData';
import { cn } from '@/lib/utils';

type StatusType = 'todos' | 'agendado' | 'aguardando' | 'em_atendimento' | 'atendido' | 'ausente' | 'cancelado';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  agendado: { label: 'Agendado', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  aguardando: { label: 'Aguardando', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  em_atendimento: { label: 'Em Atendimento', color: 'text-teal-700', bgColor: 'bg-teal-100' },
  atendido: { label: 'Atendido', color: 'text-green-700', bgColor: 'bg-green-100' },
  ausente: { label: 'Ausente', color: 'text-red-700', bgColor: 'bg-red-100' },
  cancelado: { label: 'Cancelado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const getCategoriaColor = (categoriaId: string) => {
  const cat = categoriasOdontologicas.find((c) => c.id === categoriaId);
  return cat?.cor || 'bg-gray-500';
};

const getProcedimentoCategoria = (procedimentoId: string): string => {
  for (const [catId, procs] of Object.entries(
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@/data/dentalMockData').procedimentosOdontologicos
  )) {
    if (Array.isArray(procs) && procs.some((p: { id: string }) => p.id === procedimentoId)) {
      return catId;
    }
  }
  return '';
};

export default function ListaPacientesOdonto() {
  const { isMobile } = useResponsive();
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDentista, setSelectedDentista] = useState<string>('todos');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedCadeira, setSelectedCadeira] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<StatusType>('todos');
  const [agendamentos, setAgendamentos] = useState<AgendamentoOdonto[]>(agendamentosOdontoMock);

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter((ag) => {
      // Filter by date
      if (ag.data !== format(selectedDate, 'yyyy-MM-dd')) return false;

      // Filter by search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = ag.paciente.nome.toLowerCase().includes(term);
        const matchProntuario = ag.paciente.prontuario.includes(term);
        if (!matchName && !matchProntuario) return false;
      }

      // Filter by dentista
      if (selectedDentista !== 'todos' && ag.dentista.id !== selectedDentista) return false;

      // Filter by categoria
      if (selectedCategoria !== 'todos') {
        const hasCategoria = ag.procedimentos.some((p) => getProcedimentoCategoria(p.id) === selectedCategoria);
        if (!hasCategoria) return false;
      }

      // Filter by cadeira
      if (selectedCadeira !== 'todos' && ag.cadeira !== selectedCadeira) return false;

      // Filter by status tab
      if (activeTab !== 'todos' && ag.status !== activeTab) return false;

      return true;
    });
  }, [agendamentos, selectedDate, searchTerm, selectedDentista, selectedCategoria, selectedCadeira, activeTab]);

  const statusCounts = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayAgendamentos = agendamentos.filter((ag) => ag.data === dateStr);
    return {
      todos: dayAgendamentos.length,
      agendado: dayAgendamentos.filter((a) => a.status === 'agendado').length,
      aguardando: dayAgendamentos.filter((a) => a.status === 'aguardando').length,
      em_atendimento: dayAgendamentos.filter((a) => a.status === 'em_atendimento').length,
      atendido: dayAgendamentos.filter((a) => a.status === 'atendido').length,
      ausente: dayAgendamentos.filter((a) => a.status === 'ausente').length,
      cancelado: dayAgendamentos.filter((a) => a.status === 'cancelado').length,
    };
  }, [agendamentos, selectedDate]);

  const handleIniciarAtendimento = (id: string) => {
    setAgendamentos((prev) =>
      prev.map((ag) => (ag.id === id ? { ...ag, status: 'em_atendimento' as const } : ag))
    );
    toast.success('Atendimento iniciado!');
  };

  const handleMarcarAusencia = (id: string) => {
    setAgendamentos((prev) =>
      prev.map((ag) => (ag.id === id ? { ...ag, status: 'ausente' as const } : ag))
    );
    toast.info('Paciente marcado como ausente');
  };

  const handleRegistrarChegada = (id: string) => {
    const horaAtual = format(new Date(), 'HH:mm');
    setAgendamentos((prev) =>
      prev.map((ag) =>
        ag.id === id ? { ...ag, status: 'aguardando' as const, horaChegada: horaAtual } : ag
      )
    );
    toast.success('Chegada registrada!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDentista('todos');
    setSelectedCategoria('todos');
    setSelectedCadeira('todos');
  };

  const renderStatusBadge = (status: string) => {
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={cn('font-medium', config.bgColor, config.color)}>
        {config.label}
      </Badge>
    );
  };

  const renderProcedimentosBadges = (procedimentos: AgendamentoOdonto['procedimentos']) => {
    return (
      <div className="flex flex-wrap gap-1">
        {procedimentos.map((proc) => {
          const catId = getProcedimentoCategoria(proc.id);
          const catColor = getCategoriaColor(catId);
          return (
            <Badge
              key={proc.id}
              variant="outline"
              className={cn('text-xs text-white border-0', catColor)}
            >
              {proc.nome}
            </Badge>
          );
        })}
      </div>
    );
  };

  const renderActions = (ag: AgendamentoOdonto) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => toast.info('Visualizar detalhes')}>
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </DropdownMenuItem>
        {ag.status === 'agendado' && (
          <DropdownMenuItem onClick={() => handleRegistrarChegada(ag.id)}>
            <Clock className="h-4 w-4 mr-2" />
            Registrar Chegada
          </DropdownMenuItem>
        )}
        {ag.status === 'aguardando' && (
          <DropdownMenuItem onClick={() => handleIniciarAtendimento(ag.id)}>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Atendimento
          </DropdownMenuItem>
        )}
        {(ag.status === 'agendado' || ag.status === 'aguardando') && (
          <DropdownMenuItem
            onClick={() => handleMarcarAusencia(ag.id)}
            className="text-destructive"
          >
            <UserX className="h-4 w-4 mr-2" />
            Marcar Ausência
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderMobileCard = (ag: AgendamentoOdonto) => (
    <Card key={ag.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{ag.hora}</span>
            <span className="text-sm text-muted-foreground">({ag.duracao}min)</span>
          </div>
          {renderStatusBadge(ag.status)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{ag.paciente.nome}</span>
            <span className="text-sm text-muted-foreground">({ag.paciente.idade} anos)</span>
          </div>

          <div className="text-sm text-muted-foreground">
            Prontuário: {ag.paciente.prontuario}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Armchair className="h-4 w-4 text-muted-foreground" />
            <span>{ag.cadeira}</span>
            <span className="text-muted-foreground">•</span>
            <span>{ag.dentista.nome}</span>
          </div>

          <div className="pt-2">{renderProcedimentosBadges(ag.procedimentos)}</div>

          {ag.horaChegada && (
            <div className="text-sm text-muted-foreground">
              Chegou às {ag.horaChegada}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {ag.status === 'agendado' && (
            <Button size="sm" variant="outline" onClick={() => handleRegistrarChegada(ag.id)}>
              <Clock className="h-4 w-4 mr-1" />
              Chegada
            </Button>
          )}
          {ag.status === 'aguardando' && (
            <Button size="sm" onClick={() => handleIniciarAtendimento(ag.id)}>
              <Play className="h-4 w-4 mr-1" />
              Iniciar
            </Button>
          )}
          {renderActions(ag)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100">
            <Smile className="h-6 w-6 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Lista de Pacientes - Odontologia
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {format(selectedDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={() => toast.info('Atualizando...')}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <CardTitle className="text-base">Filtros</CardTitle>
                </div>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', filtersOpen && 'rotate-180')}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar paciente ou prontuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <Select value={selectedDentista} onValueChange={setSelectedDentista}>
                  <SelectTrigger>
                    <SelectValue placeholder="Dentista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Dentistas</SelectItem>
                    {dentistas.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Categorias</SelectItem>
                    {categoriasOdontologicas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCadeira} onValueChange={setSelectedCadeira}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cadeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas as Cadeiras</SelectItem>
                    {cadeirasOdonto.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(searchTerm || selectedDentista !== 'todos' || selectedCategoria !== 'todos' || selectedCadeira !== 'todos') && (
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusType)}>
        <TabsList className="w-full overflow-x-auto flex justify-start h-auto p-1 bg-muted/50">
          <TabsTrigger value="todos" className="flex-shrink-0">
            Todos ({statusCounts.todos})
          </TabsTrigger>
          <TabsTrigger value="agendado" className="flex-shrink-0">
            Agendados ({statusCounts.agendado})
          </TabsTrigger>
          <TabsTrigger value="aguardando" className="flex-shrink-0">
            Aguardando ({statusCounts.aguardando})
          </TabsTrigger>
          <TabsTrigger value="em_atendimento" className="flex-shrink-0">
            Em Atendimento ({statusCounts.em_atendimento})
          </TabsTrigger>
          <TabsTrigger value="atendido" className="flex-shrink-0">
            Atendidos ({statusCounts.atendido})
          </TabsTrigger>
          <TabsTrigger value="ausente" className="flex-shrink-0">
            Ausentes ({statusCounts.ausente})
          </TabsTrigger>
          <TabsTrigger value="cancelado" className="flex-shrink-0">
            Cancelados ({statusCounts.cancelado})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredAgendamentos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Smile className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
              </CardContent>
            </Card>
          ) : isMobile ? (
            <div>{filteredAgendamentos.map(renderMobileCard)}</div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead className="w-[60px]">Idade</TableHead>
                      <TableHead>Prontuário</TableHead>
                      <TableHead>Procedimentos</TableHead>
                      <TableHead>Dentista</TableHead>
                      <TableHead>Cadeira</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgendamentos.map((ag) => (
                      <TableRow key={ag.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{ag.hora}</span>
                            <span className="text-xs text-muted-foreground">
                              ({ag.duracao}min)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{ag.paciente.nome}</TableCell>
                        <TableCell>{ag.paciente.idade}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {ag.paciente.prontuario}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {renderProcedimentosBadges(ag.procedimentos)}
                        </TableCell>
                        <TableCell>{ag.dentista.nome}</TableCell>
                        <TableCell>{ag.cadeira}</TableCell>
                        <TableCell>{renderStatusBadge(ag.status)}</TableCell>
                        <TableCell>{renderActions(ag)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}