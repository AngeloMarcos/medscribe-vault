import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DocumentGenerator } from "@/components/atendimento/DocumentGenerator";
import { FinishAttendanceModal } from "@/components/atendimento/FinishAttendanceModal";
import { ReferralDialog } from "@/components/atendimento/ReferralDialog";
import { ReferralList } from "@/components/atendimento/ReferralList";
import { useToast } from "@/hooks/use-toast";
import { useResponsive } from "@/hooks/useResponsive";
import { format, differenceInYears, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { atendimentoSchema, vitalsSchema } from "@/lib/validationSchemas";
import {
  User,
  Calendar,
  Phone,
  CreditCard,
  Clock,
  FileText,
  Stethoscope,
  Activity,
  Pill,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Search,
  Menu,
  Send,
} from "lucide-react";

export default function Atendimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const showDrawer = isMobile || isTablet;
  
  const [anamnese, setAnamnese] = useState("");
  const [evolucao, setEvolucao] = useState("");
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [cidSearch, setCidSearch] = useState("");
  const [prescricao, setPrescricao] = useState("");
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Vitals state
  const [vitals, setVitals] = useState({
    blood_pressure: "",
    heart_rate: "",
    respiratory_rate: "",
    temperature: "",
    o2_sat: "",
  });

  // Fetch consultation data
  const { data: consulta, isLoading: isLoadingConsulta } = useQuery({
    queryKey: ["consulta", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          *,
          patients:paciente_id (id, name, cpf, birth_date, phone, insurance, medical_record_number),
          profissionais:profissional_id (id, nome, registro_profissional, tipo_registro)
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch existing atendimento if any
  const { data: atendimento } = useQuery({
    queryKey: ["atendimento", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atendimentos")
        .select("*")
        .eq("consulta_id", id!)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch CIDs for search
  const { data: cids } = useQuery({
    queryKey: ["cids", cidSearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cids")
        .select("codigo, descricao")
        .or(`codigo.ilike.%${cidSearch}%,descricao.ilike.%${cidSearch}%`)
        .eq("ativo", true)
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: cidSearch.length >= 2,
  });

  // Fetch previous evolutions
  const { data: previousEvolutions } = useQuery({
    queryKey: ["evolutions", consulta?.patients?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolutions")
        .select("*")
        .eq("patient_id", consulta!.patients!.id)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled: !!consulta?.patients?.id,
  });

  // Load existing atendimento data
  useEffect(() => {
    if (atendimento) {
      setAnamnese(atendimento.anamnese || "");
      setEvolucao(atendimento.evolucao || "");
      setPrescricao(atendimento.prescricao || "");
      setSelectedCids([
        ...(atendimento.cid_principal ? [atendimento.cid_principal] : []),
        ...(atendimento.cids_secundarios || []),
      ]);
    }
  }, [atendimento]);

  const handleAddCid = (codigo: string) => {
    if (!selectedCids.includes(codigo)) {
      setSelectedCids([...selectedCids, codigo]);
    }
    setCidSearch("");
  };

  const handleRemoveCid = (codigo: string) => {
    setSelectedCids(selectedCids.filter((c) => c !== codigo));
  };

  const handleSaveVitals = async () => {
    if (!consulta?.patients?.id) return;

    const validation = vitalsSchema.safeParse(vitals);
    if (!validation.success) {
      toast({
        title: "Dados inválidos",
        description: validation.error.errors[0]?.message || "Verifique os valores informados.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("vitals").insert({
        patient_id: consulta.patients.id,
        ...vitals,
      });

      if (error) throw error;

      toast({
        title: "Sinais vitais salvos",
        description: "Os sinais vitais foram registrados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar sinais vitais.",
        variant: "destructive",
      });
    }
  };

  const handleFinishAttendance = async (data: {
    conduta: string;
    destino: string;
    setorEncaminhamento?: string;
    observacoes?: string;
  }) => {
    if (!consulta?.patients?.id || !id) return;

    const clinicalValidation = atendimentoSchema.safeParse({ anamnese, evolucao, prescricao });
    if (!clinicalValidation.success) {
      throw new Error(clinicalValidation.error.errors[0]?.message || "Dados clínicos inválidos");
    }

    const atendimentoData = {
      consulta_id: id,
      paciente_id: consulta.patients.id,
      profissional_id: consulta.profissional_id,
      anamnese: anamnese.slice(0, 10000),
      evolucao: evolucao.slice(0, 10000),
      prescricao: prescricao.slice(0, 10000),
      cid_principal: selectedCids[0] || null,
      cids_secundarios: selectedCids.slice(1),
      observacoes: data.observacoes?.slice(0, 2000),
      assinado: true,
      data_assinatura: new Date().toISOString(),
    };

    const { error: atendimentoError } = await supabase
      .from("atendimentos")
      .upsert(atendimentoData, { onConflict: "consulta_id" });

    if (atendimentoError) throw atendimentoError;

    const { error: consultaError } = await supabase
      .from("consultas")
      .update({
        status: "finalizado",
        hora_fim_atendimento: new Date().toISOString(),
      })
      .eq("id", id);

    if (consultaError) throw consultaError;

    navigate("/lista-pacientes");
  };

  if (isLoadingConsulta) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!consulta || !consulta.patients) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Consulta não encontrada</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const patient = consulta.patients;
  const profissional = consulta.profissionais || {
    nome: "Médico não definido",
    registro_profissional: "---",
    tipo_registro: "CRM",
  };

  const idade = patient.birth_date
    ? differenceInYears(new Date(), parseISO(patient.birth_date))
    : null;

  // Patient Sidebar Content
  const PatientSidebarContent = () => (
    <div className="flex flex-col h-full">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-base lg:text-lg truncate">{patient.name}</h2>
          {idade !== null && (
            <p className="text-muted-foreground text-sm">{idade} anos</p>
          )}
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">CPF: {patient.cpf}</span>
        </div>
        {patient.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{patient.phone}</span>
          </div>
        )}
        {patient.medical_record_number && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">Prontuário: {patient.medical_record_number}</span>
          </div>
        )}
        {patient.insurance && (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{patient.insurance}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      <div className="text-sm space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(parseISO(consulta.data_consulta), "dd/MM/yyyy", { locale: ptBR })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{consulta.hora_inicio}</span>
        </div>
        {consulta.tipo_consulta && (
          <Badge variant="secondary" className="mt-2">
            {consulta.tipo_consulta}
          </Badge>
        )}
      </div>

      {selectedCids.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              CIDs Selecionados
            </Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCids.map((cid) => (
                <Badge key={cid} variant="outline" className="text-xs">
                  {cid}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-auto pt-6">
        <Button
          className="w-full bg-success hover:bg-success/90"
          size="lg"
          onClick={() => {
            setSidebarOpen(false);
            setFinishModalOpen(true);
          }}
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          Finalizar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
      {/* Mobile Header with Patient Button */}
      {showDrawer && (
        <div className="flex items-center gap-2 p-3 border-b border-border bg-card lg:hidden">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                Ver Paciente
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-4">
              <SheetHeader className="sr-only">
                <SheetTitle>Dados do Paciente</SheetTitle>
              </SheetHeader>
              <PatientSidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{patient.name}</p>
            <p className="text-xs text-muted-foreground">
              {idade} anos • {patient.medical_record_number}
            </p>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!showDrawer && (
        <div className="w-80 border-r border-border bg-card p-6 flex flex-col">
          <PatientSidebarContent />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="resumo" className="h-full flex flex-col">
          <div className="border-b border-border px-3 lg:px-6 pt-2 lg:pt-4">
            <div className="overflow-x-auto scrollbar-thin">
              <TabsList className="inline-flex w-max min-w-full lg:w-auto">
                <TabsTrigger value="resumo" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Clock className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Resumo</span>
                </TabsTrigger>
                <TabsTrigger value="anamnese" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Stethoscope className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Anamnese</span>
                </TabsTrigger>
                <TabsTrigger value="vitais" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Activity className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Vitais</span>
                </TabsTrigger>
                <TabsTrigger value="cid" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Search className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">CID-10</span>
                </TabsTrigger>
                <TabsTrigger value="prescricao" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Pill className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Prescrição</span>
                </TabsTrigger>
                <TabsTrigger value="encaminhamento" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <Send className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Encam.</span>
                </TabsTrigger>
                <TabsTrigger value="documentos" className="gap-1 lg:gap-2 text-xs lg:text-sm px-2 lg:px-3">
                  <FileText className="h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="hidden sm:inline">Docs</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 lg:p-6">
              {/* Resumo Tab */}
              <TabsContent value="resumo" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Histórico de Atendimentos</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0">
                    {previousEvolutions && previousEvolutions.length > 0 ? (
                      <div className="space-y-3 lg:space-y-4">
                        {previousEvolutions.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3 lg:p-4 rounded-lg bg-muted/50 border-l-4 border-primary"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                              <span className="font-medium text-sm lg:text-base">
                                {format(parseISO(ev.date), "dd/MM/yyyy")}
                              </span>
                              {ev.professional && (
                                <Badge variant="outline" className="w-fit text-xs">
                                  {ev.professional}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ev.text || "Sem evolução registrada"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8 text-sm">
                        Nenhum atendimento anterior registrado.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Anamnese Tab */}
              <TabsContent value="anamnese" className="mt-0 space-y-4 lg:space-y-6">
                <Card className="card-neumorphic">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Anamnese e Evolução</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0 space-y-4">
                    <div>
                      <Label htmlFor="anamnese" className="text-sm">Anamnese / Queixa Principal</Label>
                      <Textarea
                        id="anamnese"
                        value={anamnese}
                        onChange={(e) => setAnamnese(e.target.value)}
                        placeholder="Descreva a queixa principal..."
                        rows={isMobile ? 4 : 6}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="evolucao" className="text-sm">Evolução</Label>
                      <Textarea
                        id="evolucao"
                        value={evolucao}
                        onChange={(e) => setEvolucao(e.target.value)}
                        placeholder="Descreva a evolução..."
                        rows={isMobile ? 4 : 6}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sinais Vitais Tab */}
              <TabsContent value="vitais" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Sinais Vitais</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                      <div>
                        <Label htmlFor="pa" className="text-xs lg:text-sm">PA (mmHg)</Label>
                        <Input
                          id="pa"
                          value={vitals.blood_pressure}
                          onChange={(e) =>
                            setVitals({ ...vitals, blood_pressure: e.target.value })
                          }
                          placeholder="120/80"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fc" className="text-xs lg:text-sm">FC (bpm)</Label>
                        <Input
                          id="fc"
                          value={vitals.heart_rate}
                          onChange={(e) =>
                            setVitals({ ...vitals, heart_rate: e.target.value })
                          }
                          placeholder="72"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fr" className="text-xs lg:text-sm">FR (ipm)</Label>
                        <Input
                          id="fr"
                          value={vitals.respiratory_rate}
                          onChange={(e) =>
                            setVitals({ ...vitals, respiratory_rate: e.target.value })
                          }
                          placeholder="16"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="temp" className="text-xs lg:text-sm">Temp (°C)</Label>
                        <Input
                          id="temp"
                          value={vitals.temperature}
                          onChange={(e) =>
                            setVitals({ ...vitals, temperature: e.target.value })
                          }
                          placeholder="36.5"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="spo2" className="text-xs lg:text-sm">SpO2 (%)</Label>
                        <Input
                          id="spo2"
                          value={vitals.o2_sat}
                          onChange={(e) =>
                            setVitals({ ...vitals, o2_sat: e.target.value })
                          }
                          placeholder="98"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveVitals} className="mt-4 lg:mt-6 w-full sm:w-auto">
                      Salvar Sinais Vitais
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CID Tab */}
              <TabsContent value="cid" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Diagnóstico - CID-10</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0 space-y-4">
                    <div>
                      <Label htmlFor="cid-search" className="text-sm">Buscar CID</Label>
                      <Input
                        id="cid-search"
                        value={cidSearch}
                        onChange={(e) => setCidSearch(e.target.value)}
                        placeholder="Digite o código ou descrição..."
                        className="mt-1"
                      />
                    </div>

                    {cids && cids.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                        {cids.map((cid) => (
                          <button
                            key={cid.codigo}
                            className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => handleAddCid(cid.codigo)}
                          >
                            <span className="font-medium text-sm">{cid.codigo}</span>
                            <span className="text-muted-foreground ml-2 text-sm">
                              {cid.descricao}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCids.length > 0 && (
                      <div className="mt-4 lg:mt-6">
                        <Label className="text-sm">CIDs Selecionados</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedCids.map((cid, index) => (
                            <Badge
                              key={cid}
                              variant={index === 0 ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleRemoveCid(cid)}
                            >
                              {cid}
                              {index === 0 && " (Principal)"}
                              <span className="ml-1 text-xs">×</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescrição Tab */}
              <TabsContent value="prescricao" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="text-base lg:text-lg">Prescrição Médica</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 lg:p-6 pt-0">
                    <Textarea
                      value={prescricao}
                      onChange={(e) => setPrescricao(e.target.value)}
                      placeholder="1. Medicamento - Dose - Posologia&#10;2. Medicamento - Dose - Posologia&#10;..."
                      rows={isMobile ? 8 : 12}
                      className="font-mono text-sm"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Encaminhamento Tab */}
              <TabsContent value="encaminhamento" className="mt-0 space-y-4">
                <div className="flex justify-end">
                  <ReferralDialog
                    consultaId={id!}
                    pacienteId={patient.id}
                    pacienteNome={patient.name}
                    pacienteCpf={patient.cpf}
                    pacienteIdade={idade || undefined}
                    profissionalNome={profissional.nome}
                    profissionalRegistro={profissional.registro_profissional}
                    profissionalTipoRegistro={profissional.tipo_registro}
                    selectedCids={selectedCids}
                  />
                </div>
                <ReferralList pacienteId={patient.id} consultaId={id} />
              </TabsContent>

              {/* Documentos Tab */}
              <TabsContent value="documentos" className="mt-0">
                <DocumentGenerator
                  paciente={{
                    id: patient.id,
                    nome: patient.name,
                    cpf: patient.cpf,
                  }}
                  profissional={{
                    nome: profissional.nome,
                    registro: profissional.registro_profissional,
                    tipo_registro: profissional.tipo_registro,
                  }}
                  onDocumentSaved={(tipo, conteudo) => {
                    toast({
                      title: "Documento salvo",
                      description: `O documento foi salvo com sucesso.`,
                    });
                  }}
                />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Finish Modal */}
      <FinishAttendanceModal
        open={finishModalOpen}
        onOpenChange={setFinishModalOpen}
        cids={selectedCids}
        pacienteNome={patient.name}
        onFinish={handleFinishAttendance}
      />
    </div>
  );
}
