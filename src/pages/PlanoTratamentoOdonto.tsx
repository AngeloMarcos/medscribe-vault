import { useState, useMemo } from "react";
import { 
  ClipboardList, 
  Plus, 
  Search,
  Trash2,
  Edit,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  planosTratamentoMock, 
  pacientesOdontoMock,
  PlanoTratamento,
  ItemPlanoTratamento,
  StatusItemTratamento,
  ProcedimentoOdontologico,
  Dentista,
  UrgenciaTratamento,
} from "@/data/dentalMockData";
import { MiniOdontograma } from "@/components/odonto/MiniOdontograma";
import { AddTreatmentItemDialog } from "@/components/odonto/AddTreatmentItemDialog";
import { TreatmentSummaryCard } from "@/components/odonto/TreatmentSummaryCard";

const statusConfig: Record<StatusItemTratamento, { label: string; color: string; icon: React.ReactNode }> = {
  planejado: { label: 'Planejado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: <Clock className="h-3 w-3" /> },
  em_andamento: { label: 'Em andamento', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300', icon: <AlertCircle className="h-3 w-3" /> },
  concluido: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300', icon: <CheckCircle className="h-3 w-3" /> },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <XCircle className="h-3 w-3" /> },
};

const urgenciaConfig: Record<UrgenciaTratamento, { label: string; color: string }> = {
  baixa: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
  media: { label: 'Média', color: 'bg-amber-100 text-amber-800' },
  alta: { label: 'Alta', color: 'bg-red-100 text-red-800' },
};

export default function PlanoTratamentoOdonto() {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(pacientesOdontoMock[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [planos, setPlanos] = useState<PlanoTratamento[]>(planosTratamentoMock);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);

  const selectedPaciente = pacientesOdontoMock.find(p => p.id === selectedPacienteId);
  const planoAtual = planos.find(p => p.paciente.id === selectedPacienteId) || null;

  const filteredItens = useMemo(() => {
    if (!planoAtual) return [];
    
    return planoAtual.itens.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.procedimento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.dente?.toString().includes(searchTerm));
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [planoAtual, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!planoAtual) return { total: 0, concluidos: 0, pendentes: 0, valor: 0 };
    
    return {
      total: planoAtual.itens.length,
      concluidos: planoAtual.itens.filter(i => i.status === 'concluido').length,
      pendentes: planoAtual.itens.filter(i => i.status === 'planejado').length,
      valor: planoAtual.itens.reduce((acc, i) => acc + i.valorFinal, 0),
    };
  }, [planoAtual]);

  const teethStatus = useMemo(() => {
    if (!planoAtual) return [];
    return planoAtual.itens
      .filter(i => i.dente !== null)
      .map(i => ({ dente: i.dente!, status: i.status }));
  }, [planoAtual]);

  const handleAddItem = (item: {
    dente: number | null;
    superficie?: string;
    procedimento: ProcedimentoOdontologico;
    dentista?: Dentista;
    valorUnitario: number;
    desconto: number;
    valorFinal: number;
    urgencia: UrgenciaTratamento;
    observacoes?: string;
  }) => {
    if (!planoAtual) {
      // Create new plan
      const newPlano: PlanoTratamento = {
        id: `plan-${Date.now()}`,
        paciente: selectedPaciente!,
        dataInicio: new Date().toISOString().split('T')[0],
        status: 'orcamento',
        itens: [{
          id: `item-${Date.now()}`,
          ...item,
          status: 'planejado',
          ordemPrioridade: 1,
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlanos([...planos, newPlano]);
    } else {
      // Add to existing plan
      const updatedPlanos = planos.map(p => {
        if (p.id === planoAtual.id) {
          return {
            ...p,
            itens: [...p.itens, {
              id: `item-${Date.now()}`,
              ...item,
              status: 'planejado' as StatusItemTratamento,
              ordemPrioridade: p.itens.length + 1,
            }],
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });
      setPlanos(updatedPlanos);
    }
    toast.success('Procedimento adicionado ao plano');
  };

  const handleStatusChange = (itemId: string, newStatus: StatusItemTratamento) => {
    const updatedPlanos = planos.map(p => {
      if (p.id === planoAtual?.id) {
        return {
          ...p,
          itens: p.itens.map(i => {
            if (i.id === itemId) {
              return {
                ...i,
                status: newStatus,
                dataRealizacao: newStatus === 'concluido' ? new Date().toISOString().split('T')[0] : i.dataRealizacao,
              };
            }
            return i;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setPlanos(updatedPlanos);
    toast.success(`Status alterado para ${statusConfig[newStatus].label}`);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedPlanos = planos.map(p => {
      if (p.id === planoAtual?.id) {
        return {
          ...p,
          itens: p.itens.filter(i => i.id !== itemId),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setPlanos(updatedPlanos);
    toast.success('Procedimento removido do plano');
  };

  const handleApprove = () => {
    if (!planoAtual) return;
    
    const updatedPlanos = planos.map(p => {
      if (p.id === planoAtual.id) {
        return {
          ...p,
          status: 'aprovado' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setPlanos(updatedPlanos);
    toast.success('Orçamento aprovado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Plano de Tratamento</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie procedimentos e orçamentos odontológicos
            </p>
          </div>
        </div>
        
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Procedimento
        </Button>
      </div>

      {/* Patient Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Paciente</label>
              <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesOdontoMock.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} - {p.prontuario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPaciente && (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Idade:</span>{' '}
                  <span className="font-medium">{selectedPaciente.idade} anos</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Prontuário:</span>{' '}
                  <span className="font-medium">{selectedPaciente.prontuario}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.concluidos}</div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pendentes}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">
              R$ {stats.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimento ou dente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                <TabsTrigger value="planejado" className="text-xs">Planejados</TabsTrigger>
                <TabsTrigger value="em_andamento" className="text-xs">Em andamento</TabsTrigger>
                <TabsTrigger value="concluido" className="text-xs">Concluídos</TabsTrigger>
                <TabsTrigger value="cancelado" className="text-xs">Cancelados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Table */}
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Dente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {planoAtual 
                          ? 'Nenhum procedimento encontrado'
                          : 'Nenhum plano de tratamento para este paciente'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItens.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {item.dente ? (
                            <div>
                              <span className="font-medium">{item.dente}</span>
                              {item.superficie && (
                                <span className="text-xs text-muted-foreground block">
                                  {item.superficie}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Geral</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{item.procedimento.nome}</span>
                            {item.dentista && (
                              <span className="text-xs text-muted-foreground block">
                                {item.dentista.nome}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium">
                              R$ {item.valorFinal.toFixed(2)}
                            </span>
                            {item.desconto > 0 && (
                              <span className="text-xs text-emerald-600 block">
                                -{item.desconto}% desc.
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${statusConfig[item.status].color} gap-1`}
                          >
                            {statusConfig[item.status].icon}
                            {statusConfig[item.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'em_andamento')}>
                                <Clock className="h-4 w-4 mr-2" />
                                Marcar Em Andamento
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'concluido')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar Concluído
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Agendar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mini Odontograma */}
          <Card className="print:hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Dentes no Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <MiniOdontograma teethStatus={teethStatus} />
            </CardContent>
          </Card>

          {/* Summary Card */}
          {planoAtual && (
            <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen} className="lg:block">
              <CollapsibleTrigger asChild className="lg:hidden">
                <Button variant="outline" className="w-full justify-between mb-2">
                  Resumo Financeiro
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="lg:block">
                <TreatmentSummaryCard 
                  plano={planoAtual}
                  onApprove={planoAtual.status === 'orcamento' ? handleApprove : undefined}
                  onPrint={handlePrint}
                />
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>

      {/* Add Item Dialog */}
      <AddTreatmentItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
      />
    </div>
  );
}
