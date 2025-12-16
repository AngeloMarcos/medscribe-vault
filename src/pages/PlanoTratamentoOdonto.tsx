import { useState, useMemo, useEffect } from "react";
import { 
  ClipboardList, 
  Plus, 
  Search,
  Trash2,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useResponsive } from "@/hooks/useResponsive";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/contexts/AuthContext";
import { 
  usePlanosByPatient,
  usePlanoComItens,
  useCreatePlano,
  useAddItem,
  useUpdateItemStatus,
  useDeleteItem,
  useUpdatePlanoStatus,
  useProcedimentosByCategoria,
  useDentistas,
} from "@/hooks/usePlanoTratamento";
import type { 
  StatusItemTratamento, 
  UrgenciaTratamento,
  ProcedimentoOdonto,
  PlanoTratamentoOdonto,
  ItemPlanoTratamento,
} from "@/types/dental";
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
  const { isMobile } = useResponsive();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [selectedPlanoId, setSelectedPlanoId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Fetch patients
  const { data: patients, isLoading: loadingPatients } = useQuery({
    queryKey: ['patients-odonto', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, cpf, birth_date, medical_record_number')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  // Fetch planos for selected patient
  const { data: planos, isLoading: loadingPlanos } = usePlanosByPatient(selectedPacienteId);
  
  // Fetch selected plan with items
  const { data: planoAtual, isLoading: loadingPlano } = usePlanoComItens(selectedPlanoId);

  // Mutations
  const createPlano = useCreatePlano();
  const addItem = useAddItem();
  const updateItemStatus = useUpdateItemStatus();
  const deleteItem = useDeleteItem();
  const updatePlanoStatus = useUpdatePlanoStatus();

  // Auto-select first patient
  useEffect(() => {
    if (patients?.length && !selectedPacienteId) {
      setSelectedPacienteId(patients[0].id);
    }
  }, [patients, selectedPacienteId]);

  // Auto-select active/most recent plan when patient changes
  useEffect(() => {
    if (planos?.length) {
      const activePlano = planos.find(p => ['orcamento', 'aprovado', 'em_andamento'].includes(p.status));
      setSelectedPlanoId(activePlano?.id || planos[0]?.id || null);
    } else {
      setSelectedPlanoId(null);
    }
  }, [planos]);

  const selectedPaciente = patients?.find(p => p.id === selectedPacienteId);
  const selectedPacienteAge = selectedPaciente?.birth_date 
    ? Math.floor((new Date().getTime() - new Date(selectedPaciente.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const filteredItens = useMemo(() => {
    if (!planoAtual?.itens) return [];
    
    return planoAtual.itens.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.procedimento?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.dente?.toString().includes(searchTerm));
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [planoAtual, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    if (!planoAtual?.itens) return { total: 0, concluidos: 0, pendentes: 0, valor: 0 };
    
    return {
      total: planoAtual.itens.length,
      concluidos: planoAtual.itens.filter(i => i.status === 'concluido').length,
      pendentes: planoAtual.itens.filter(i => i.status === 'planejado').length,
      valor: planoAtual.itens.reduce((acc, i) => acc + Number(i.valor_final), 0),
    };
  }, [planoAtual]);

  const teethStatus = useMemo(() => {
    if (!planoAtual?.itens) return [];
    return planoAtual.itens
      .filter(i => i.dente !== null && i.dente !== undefined)
      .map(i => ({ dente: i.dente!, status: i.status }));
  }, [planoAtual]);

  const handleAddItem = async (item: {
    dente: number | null;
    superficie?: string;
    procedimento: ProcedimentoOdonto;
    profissionalId?: string;
    valorUnitario: number;
    desconto: number;
    valorFinal: number;
    urgencia: UrgenciaTratamento;
    observacoes?: string;
  }) => {
    if (!selectedPacienteId) return;

    let planoId = selectedPlanoId;

    // Create new plan if needed
    if (!planoId) {
      try {
        const newPlano = await createPlano.mutateAsync({
          patient_id: selectedPacienteId,
          created_by: user?.id,
          status: 'orcamento',
        });
        planoId = newPlano.id;
        setSelectedPlanoId(planoId);
      } catch (error) {
        return;
      }
    }

    // Add item to plan
    const nextOrder = (planoAtual?.itens?.length || 0) + 1;
    await addItem.mutateAsync({
      plano_id: planoId,
      procedimento_id: item.procedimento.id,
      profissional_id: item.profissionalId,
      dente: item.dente ?? undefined,
      superficie: item.superficie,
      valor_unitario: item.valorUnitario,
      desconto_percentual: item.desconto,
      valor_final: item.valorFinal,
      urgencia: item.urgencia,
      observacoes: item.observacoes,
      ordem_prioridade: nextOrder,
    });
  };

  const handleStatusChange = async (itemId: string, newStatus: StatusItemTratamento) => {
    if (!selectedPlanoId) return;
    
    await updateItemStatus.mutateAsync({
      itemId,
      planoId: selectedPlanoId,
      updates: {
        status: newStatus,
        data_realizacao: newStatus === 'concluido' ? new Date().toISOString().split('T')[0] : undefined,
      },
    });
    toast.success(`Status alterado para ${statusConfig[newStatus].label}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!selectedPlanoId) return;
    await deleteItem.mutateAsync({ itemId, planoId: selectedPlanoId });
  };

  const handleApprove = async () => {
    if (!selectedPlanoId || !selectedPacienteId) return;
    await updatePlanoStatus.mutateAsync({
      planoId: selectedPlanoId,
      patientId: selectedPacienteId,
      status: 'aprovado',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const isLoading = loadingPatients || loadingPlanos || loadingPlano;

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
        
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          disabled={!selectedPacienteId}
        >
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
              {loadingPatients ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedPacienteId || ''} onValueChange={setSelectedPacienteId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients?.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} - {p.medical_record_number || p.cpf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedPaciente && (
              <div className="flex gap-4 text-sm items-center">
                {selectedPacienteAge !== null && (
                  <div>
                    <span className="text-muted-foreground">Idade:</span>{' '}
                    <span className="font-medium">{selectedPacienteAge} anos</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Prontuário:</span>{' '}
                  <span className="font-medium">{selectedPaciente.medical_record_number || '-'}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.concluidos}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.pendentes}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-1" />
            ) : (
              <div className="text-lg sm:text-2xl font-bold text-primary">
                R$ {stats.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">Valor Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Table Section */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar procedimento ou dente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="w-full h-auto p-1 flex overflow-x-auto scrollbar-hide">
                <TabsTrigger value="all" className="text-xs flex-shrink-0">Todos</TabsTrigger>
                <TabsTrigger value="planejado" className="text-xs flex-shrink-0">Planejados</TabsTrigger>
                <TabsTrigger value="em_andamento" className="text-xs flex-shrink-0 whitespace-nowrap">Em andamento</TabsTrigger>
                <TabsTrigger value="concluido" className="text-xs flex-shrink-0">Concluídos</TabsTrigger>
                <TabsTrigger value="cancelado" className="text-xs flex-shrink-0">Cancelados</TabsTrigger>
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
                  {loadingPlano ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredItens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {planoAtual 
                          ? 'Nenhum procedimento encontrado'
                          : 'Nenhum plano de tratamento para este paciente. Adicione um procedimento para criar.'}
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
                            <span className="font-medium">{item.procedimento?.nome}</span>
                            {item.profissional && (
                              <span className="text-xs text-muted-foreground block">
                                {item.profissional.nome}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium">
                              R$ {Number(item.valor_final).toFixed(2)}
                            </span>
                            {Number(item.desconto_percentual) > 0 && (
                              <span className="text-xs text-emerald-600 block">
                                -{item.desconto_percentual}% desc.
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

        {/* Sidebar - Collapsible on mobile */}
        <div className="space-y-4">
          {/* Mobile toggle for sidebar content */}
          {isMobile && (
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Odontograma e Resumo
              <ChevronDown className={`h-4 w-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
            </Button>
          )}

          {(isSidebarOpen || !isMobile) && (
            <>
              {/* Mini Odontograma */}
              <Card className="print:hidden">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base">Dentes no Plano</CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <MiniOdontograma teethStatus={teethStatus} />
                </CardContent>
              </Card>

              {/* Summary Card */}
              {planoAtual && (
                <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
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
            </>
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
