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
import { DocumentGenerator } from "@/components/atendimento/DocumentGenerator";
import { FinishAttendanceModal } from "@/components/atendimento/FinishAttendanceModal";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";

export default function Atendimento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [anamnese, setAnamnese] = useState("");
  const [evolucao, setEvolucao] = useState("");
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [cidSearch, setCidSearch] = useState("");
  const [prescricao, setPrescricao] = useState("");
  const [finishModalOpen, setFinishModalOpen] = useState(false);

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

    // Validate clinical data before saving
    const clinicalValidation = atendimentoSchema.safeParse({ anamnese, evolucao, prescricao });
    if (!clinicalValidation.success) {
      throw new Error(clinicalValidation.error.errors[0]?.message || "Dados clínicos inválidos");
    }

    // Upsert atendimento record
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

    // Update consulta status
    const { error: consultaError } = await supabase
      .from("consultas")
      .update({
        status: "finalizado",
        hora_fim_atendimento: new Date().toISOString(),
      })
      .eq("id", id);

    if (consultaError) throw consultaError;

    // Navigate back to patient list
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

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Sidebar - Patient Summary */}
      <div className="w-80 border-r border-border bg-card p-6 flex flex-col">
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
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{patient.name}</h2>
            {idade !== null && (
              <p className="text-muted-foreground">{idade} anos</p>
            )}
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>CPF: {patient.cpf}</span>
          </div>
          {patient.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.medical_record_number && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>Prontuário: {patient.medical_record_number}</span>
            </div>
          )}
          {patient.insurance && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{patient.insurance}</span>
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

        {/* CIDs Selected */}
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

        {/* Finish Button */}
        <div className="mt-auto pt-6">
          <Button
            className="w-full bg-success hover:bg-success/90"
            size="lg"
            onClick={() => setFinishModalOpen(true)}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Finalizar Atendimento
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="resumo" className="h-full flex flex-col">
          <div className="border-b border-border px-6 pt-4">
            <TabsList>
              <TabsTrigger value="resumo" className="gap-2">
                <Clock className="h-4 w-4" />
                Resumo
              </TabsTrigger>
              <TabsTrigger value="anamnese" className="gap-2">
                <Stethoscope className="h-4 w-4" />
                Anamnese
              </TabsTrigger>
              <TabsTrigger value="vitais" className="gap-2">
                <Activity className="h-4 w-4" />
                Sinais Vitais
              </TabsTrigger>
              <TabsTrigger value="cid" className="gap-2">
                <Search className="h-4 w-4" />
                CID-10
              </TabsTrigger>
              <TabsTrigger value="prescricao" className="gap-2">
                <Pill className="h-4 w-4" />
                Prescrição
              </TabsTrigger>
              <TabsTrigger value="documentos" className="gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {/* Resumo Tab */}
              <TabsContent value="resumo" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader>
                    <CardTitle>Histórico de Atendimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {previousEvolutions && previousEvolutions.length > 0 ? (
                      <div className="space-y-4">
                        {previousEvolutions.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">
                                {format(parseISO(ev.date), "dd/MM/yyyy")}
                              </span>
                              {ev.professional && (
                                <Badge variant="outline">{ev.professional}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {ev.text || "Sem evolução registrada"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Nenhum atendimento anterior registrado.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Anamnese Tab */}
              <TabsContent value="anamnese" className="mt-0 space-y-6">
                <Card className="card-neumorphic">
                  <CardHeader>
                    <CardTitle>Anamnese e Evolução</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="anamnese">Anamnese / Queixa Principal</Label>
                      <Textarea
                        id="anamnese"
                        value={anamnese}
                        onChange={(e) => setAnamnese(e.target.value)}
                        placeholder="Descreva a queixa principal, história da doença atual..."
                        rows={6}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="evolucao">Evolução</Label>
                      <Textarea
                        id="evolucao"
                        value={evolucao}
                        onChange={(e) => setEvolucao(e.target.value)}
                        placeholder="Descreva a evolução do quadro clínico..."
                        rows={6}
                        className="mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sinais Vitais Tab */}
              <TabsContent value="vitais" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader>
                    <CardTitle>Sinais Vitais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="pa">Pressão Arterial (mmHg)</Label>
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
                        <Label htmlFor="fc">Freq. Cardíaca (bpm)</Label>
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
                        <Label htmlFor="fr">Freq. Respiratória (ipm)</Label>
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
                        <Label htmlFor="temp">Temperatura (°C)</Label>
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
                        <Label htmlFor="spo2">SpO2 (%)</Label>
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
                    <Button onClick={handleSaveVitals} className="mt-6">
                      Salvar Sinais Vitais
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* CID Tab */}
              <TabsContent value="cid" className="mt-0">
                <Card className="card-neumorphic">
                  <CardHeader>
                    <CardTitle>Diagnóstico - CID-10</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cid-search">Buscar CID</Label>
                      <Input
                        id="cid-search"
                        value={cidSearch}
                        onChange={(e) => setCidSearch(e.target.value)}
                        placeholder="Digite o código ou descrição..."
                        className="mt-1"
                      />
                    </div>

                    {cids && cids.length > 0 && (
                      <div className="border rounded-lg divide-y">
                        {cids.map((cid) => (
                          <button
                            key={cid.codigo}
                            className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex justify-between items-center"
                            onClick={() => handleAddCid(cid.codigo)}
                          >
                            <div>
                              <span className="font-medium">{cid.codigo}</span>
                              <span className="text-muted-foreground ml-2">
                                {cid.descricao}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedCids.length > 0 && (
                      <div className="mt-6">
                        <Label>CIDs Selecionados</Label>
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
                  <CardHeader>
                    <CardTitle>Prescrição Médica</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={prescricao}
                      onChange={(e) => setPrescricao(e.target.value)}
                      placeholder="1. Medicamento - Dose - Posologia&#10;2. Medicamento - Dose - Posologia&#10;..."
                      rows={12}
                      className="font-mono"
                    />
                  </CardContent>
                </Card>
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
