import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  User,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  Save,
  Printer,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { DentalArch } from '@/components/odontograma/DentalArch';
import { ToothConditionPanel } from '@/components/odontograma/ToothConditionPanel';
import { ToothCondition } from '@/components/odontograma/teeth/toothUtils';
import { useAgendamentoOdonto, useUpdateAgendamentoStatus } from '@/hooks/useAgendamentosOdonto';
import { useCreateEvolucaoOdonto, useEvolucoesOdontoByPatient, ProcedimentoRealizado } from '@/hooks/useEvolucoesOdonto';
import { useOdontogramaByPatient } from '@/hooks/useOdontograma';
import { usePlanosByPatient, useUpdateItemStatus } from '@/hooks/usePlanoTratamento';

export default function AtendimentoOdonto() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('odontograma');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [localConditions, setLocalConditions] = useState<Record<number, ToothCondition[]>>({});
  const [queixaPrincipal, setQueixaPrincipal] = useState('');
  const [evolucaoTexto, setEvolucaoTexto] = useState('');
  const [procedimentosRealizados, setProcedimentosRealizados] = useState<string[]>([]);

  const { data: agendamento, isLoading: loadingAgendamento } = useAgendamentoOdonto(id || null);
  const { data: odontograma } = useOdontogramaByPatient(agendamento?.paciente_id || null);
  const { data: evolucoes } = useEvolucoesOdontoByPatient(agendamento?.paciente_id || null);
  const { data: planos } = usePlanosByPatient(agendamento?.paciente_id || null);

  const updateStatus = useUpdateAgendamentoStatus();
  const createEvolucao = useCreateEvolucaoOdonto();
  const updateItemStatus = useUpdateItemStatus();

  // Sync odontograma data
  useEffect(() => {
    if (odontograma?.dados) {
      setLocalConditions(odontograma.dados as Record<number, ToothCondition[]>);
    }
  }, [odontograma]);

  // Start attendance if status is 'aguardando'
  useEffect(() => {
    if (agendamento && agendamento.status === 'aguardando') {
      updateStatus.mutate({ id: agendamento.id, status: 'em_atendimento' });
    }
  }, [agendamento?.id, agendamento?.status]);

  const handleToothClick = (toothNumber: number) => {
    setSelectedTooth(prev => prev === toothNumber ? null : toothNumber);
  };

  const handleAddCondition = (condition: ToothCondition) => {
    if (!selectedTooth) return;
    const currentConditions = localConditions[selectedTooth] || [];
    setLocalConditions(prev => ({
      ...prev,
      [selectedTooth]: [...currentConditions, condition],
    }));
  };

  const handleRemoveCondition = (index: number) => {
    if (!selectedTooth) return;
    const currentConditions = localConditions[selectedTooth] || [];
    setLocalConditions(prev => ({
      ...prev,
      [selectedTooth]: currentConditions.filter((_, i) => i !== index),
    }));
  };

  const handleClearConditions = () => {
    if (!selectedTooth) return;
    setLocalConditions(prev => ({
      ...prev,
      [selectedTooth]: [],
    }));
  };

  const toggleProcedimentoRealizado = (procedimentoId: string) => {
    setProcedimentosRealizados(prev => 
      prev.includes(procedimentoId)
        ? prev.filter(id => id !== procedimentoId)
        : [...prev, procedimentoId]
    );
  };

  const handleSalvarEvolucao = async () => {
    if (!agendamento?.paciente_id) return;

    const procedimentosData: ProcedimentoRealizado[] = agendamento.procedimentos
      ?.filter(p => procedimentosRealizados.includes(p.procedimento_id))
      .map(p => ({
        procedimento_id: p.procedimento_id,
        procedimento_nome: p.procedimento?.nome || '',
      })) || [];

    await createEvolucao.mutateAsync({
      agendamento_id: agendamento.id,
      paciente_id: agendamento.paciente_id,
      profissional_id: agendamento.profissional_id || undefined,
      queixa_principal: queixaPrincipal || undefined,
      evolucao: evolucaoTexto || undefined,
      procedimentos_realizados: procedimentosData,
    });

    // Update treatment plan items if any
    for (const plano of planos || []) {
      for (const item of plano.itens || []) {
        if (procedimentosRealizados.includes(item.procedimento_id)) {
          await updateItemStatus.mutateAsync({
            itemId: item.id,
            planoId: plano.id,
            updates: {
              status: 'concluido',
              data_realizacao: format(new Date(), 'yyyy-MM-dd'),
            },
          });
        }
      }
    }

    toast.success('Evolução salva com sucesso!');
  };

  const handleFinalizarAtendimento = async () => {
    if (!agendamento) return;

    // Save evolution first if there's content
    if (evolucaoTexto || procedimentosRealizados.length > 0) {
      await handleSalvarEvolucao();
    }

    await updateStatus.mutateAsync({ id: agendamento.id, status: 'atendido' });
    toast.success('Atendimento finalizado!');
    navigate('/lista-pacientes-odonto');
  };

  if (loadingAgendamento) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agendamento) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Agendamento não encontrado.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const patientAge = agendamento.paciente?.birth_date 
    ? differenceInYears(new Date(), new Date(agendamento.paciente.birth_date))
    : null;

  const planoAtivo = planos?.find(p => p.status === 'em_andamento' || p.status === 'aprovado');

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Atendimento Odontológico
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(agendamento.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {agendamento.hora_inicio?.slice(0, 5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button size="sm" onClick={handleFinalizarAtendimento} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Finalizar
          </Button>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{agendamento.paciente?.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Prontuário: {agendamento.paciente?.medical_record_number || 'N/A'}</span>
                  {patientAge && (
                    <>
                      <span>•</span>
                      <span>{patientAge} anos</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:ml-auto">
              {agendamento.procedimentos?.map(proc => (
                <Badge key={proc.id} variant="secondary">
                  {proc.procedimento?.nome}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{agendamento.profissional?.nome}</span>
              {agendamento.cadeira && (
                <>
                  <span>•</span>
                  <span>{agendamento.cadeira}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="plano">Plano de Tratamento</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* Odontograma Tab */}
        <TabsContent value="odontograma" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Odontograma</CardTitle>
                  <CardDescription>Clique em um dente para visualizar ou adicionar condições</CardDescription>
                </CardHeader>
                <CardContent>
                  <DentalArch
                    teethConditions={localConditions}
                    selectedTooth={selectedTooth}
                    onToothClick={handleToothClick}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {selectedTooth ? (
                <ToothConditionPanel
                  toothNumber={selectedTooth}
                  conditions={localConditions[selectedTooth] || []}
                  onAddCondition={handleAddCondition}
                  onRemoveCondition={handleRemoveCondition}
                  onClearAll={handleClearConditions}
                  onClose={() => setSelectedTooth(null)}
                  patientId={agendamento.paciente_id}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um dente para ver ou adicionar condições
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Evolução Tab */}
        <TabsContent value="evolucao" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Evolução</CardTitle>
                <CardDescription>Registre a evolução do atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Queixa Principal</label>
                  <Textarea
                    placeholder="Descreva a queixa principal do paciente..."
                    value={queixaPrincipal}
                    onChange={(e) => setQueixaPrincipal(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Evolução / Anotações</label>
                  <Textarea
                    placeholder="Registre a evolução do atendimento, observações clínicas, etc..."
                    value={evolucaoTexto}
                    onChange={(e) => setEvolucaoTexto(e.target.value)}
                    rows={6}
                  />
                </div>

                {agendamento.procedimentos && agendamento.procedimentos.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Procedimentos Realizados</label>
                    <div className="space-y-2">
                      {agendamento.procedimentos.map(proc => (
                        <div
                          key={proc.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            procedimentosRealizados.includes(proc.procedimento_id)
                              ? "bg-green-50 border-green-200"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => toggleProcedimentoRealizado(proc.procedimento_id)}
                        >
                          <Checkbox
                            checked={procedimentosRealizados.includes(proc.procedimento_id)}
                          />
                          <span className="font-medium">{proc.procedimento?.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSalvarEvolucao} 
                  disabled={createEvolucao.isPending}
                  className="w-full"
                >
                  {createEvolucao.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Evolução
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evoluções Anteriores</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {evolucoes && evolucoes.length > 0 ? (
                    <div className="space-y-4">
                      {evolucoes.map(ev => (
                        <div key={ev.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {format(new Date(ev.created_at), "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {ev.profissional?.nome}
                            </span>
                          </div>
                          {ev.queixa_principal && (
                            <p className="text-sm mb-2">
                              <strong>Queixa:</strong> {ev.queixa_principal}
                            </p>
                          )}
                          {ev.evolucao && (
                            <p className="text-sm whitespace-pre-wrap">{ev.evolucao}</p>
                          )}
                          {ev.procedimentos_realizados.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {ev.procedimentos_realizados.map((p, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {p.procedimento_nome}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma evolução registrada
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plano de Tratamento Tab */}
        <TabsContent value="plano" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Tratamento Ativo</CardTitle>
              {planoAtivo && (
                <CardDescription>
                  Iniciado em {format(new Date(planoAtivo.data_inicio), 'dd/MM/yyyy')}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {planoAtivo && planoAtivo.itens ? (
                <div className="space-y-3">
                  {planoAtivo.itens.map(item => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border",
                        item.status === 'concluido' && "bg-green-50 border-green-200",
                        item.status === 'em_andamento' && "bg-amber-50 border-amber-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.status === 'concluido'}
                          disabled={item.status === 'concluido'}
                        />
                        <div>
                          <p className="font-medium">{item.procedimento?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.dente ? `Dente ${item.dente}` : 'Geral'}
                            {item.superficie && ` - ${item.superficie}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={item.status === 'concluido' ? 'default' : 'secondary'}>
                        {item.status === 'concluido' ? 'Concluído' : 
                         item.status === 'em_andamento' ? 'Em Andamento' : 'Planejado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum plano de tratamento ativo para este paciente.
                  <br />
                  <Button 
                    variant="link" 
                    onClick={() => navigate(`/plano-tratamento-odonto?paciente=${agendamento.paciente_id}`)}
                  >
                    Criar novo plano
                  </Button>
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="historico" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atendimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {evolucoes && evolucoes.length > 0 ? (
                  <div className="space-y-4">
                    {evolucoes.map(ev => (
                      <div key={ev.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(ev.created_at), "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {ev.profissional?.nome}
                          </span>
                        </div>
                        
                        {ev.queixa_principal && (
                          <>
                            <p className="text-sm font-medium text-muted-foreground">Queixa:</p>
                            <p className="text-sm mb-2">{ev.queixa_principal}</p>
                          </>
                        )}
                        
                        {ev.evolucao && (
                          <>
                            <p className="text-sm font-medium text-muted-foreground">Evolução:</p>
                            <p className="text-sm whitespace-pre-wrap">{ev.evolucao}</p>
                          </>
                        )}
                        
                        {ev.procedimentos_realizados.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Procedimentos:</p>
                            <div className="flex flex-wrap gap-1">
                              {ev.procedimentos_realizados.map((p, i) => (
                                <Badge key={i} variant="secondary">
                                  {p.procedimento_nome}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum histórico de atendimento encontrado
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
