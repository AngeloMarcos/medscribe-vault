import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AddProcedureDialog from "@/components/AddProcedureDialog";
import AddExamRequestDialog from "@/components/AddExamRequestDialog";
import AddReportDialog from "@/components/AddReportDialog";

const PatientDetail = () => {
  const { id } = useParams();
  const [isProcedureDialogOpen, setIsProcedureDialogOpen] = useState(false);
  const [isExamRequestDialogOpen, setIsExamRequestDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ["patient-appointments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", id)
        .order("date_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: vitals } = useQuery({
    queryKey: ["patient-vitals", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vitals")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: evolutions } = useQuery({
    queryKey: ["patient-evolutions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolutions")
        .select("*")
        .eq("patient_id", id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: procedures, refetch: refetchProcedures } = useQuery({
    queryKey: ["patient-procedures", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procedures")
        .select("*")
        .eq("patient_id", id)
        .order("date_time", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: examRequests, refetch: refetchExamRequests } = useQuery({
    queryKey: ["patient-exam-requests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_requests")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reports, refetch: refetchReports } = useQuery({
    queryKey: ["patient-reports", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("patient_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Loading state
  if (isLoadingPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!patient) return <div>Paciente não encontrado</div>;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      agendado: "default",
      realizado: "secondary",
      cancelado: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header com stacking responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon" className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate">
            {patient.name}
          </h2>
          <p className="text-muted-foreground text-sm">Detalhes do paciente</p>
        </div>
      </div>

      {/* Informações Pessoais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-card-title">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">CPF</p>
            <p className="font-medium truncate">{patient.cpf}</p>
          </div>
          {patient.birth_date && (
            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p className="font-medium">
                {new Date(patient.birth_date).toLocaleDateString("pt-BR")}
              </p>
            </div>
          )}
          {patient.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
          )}
          {patient.insurance && (
            <div>
              <p className="text-sm text-muted-foreground">Convênio</p>
              <p className="font-medium">{patient.insurance}</p>
            </div>
          )}
          {patient.medical_record_number && (
            <div>
              <p className="text-sm text-muted-foreground">Prontuário</p>
              <p className="font-medium">{patient.medical_record_number}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs com scroll horizontal em mobile */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-muted">
          <TabsList className="inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-6 h-auto">
            <TabsTrigger value="appointments" className="whitespace-nowrap px-3 py-2">
              Consultas
            </TabsTrigger>
            <TabsTrigger value="vitals" className="whitespace-nowrap px-3 py-2">
              Sinais Vitais
            </TabsTrigger>
            <TabsTrigger value="evolutions" className="whitespace-nowrap px-3 py-2">
              Evoluções
            </TabsTrigger>
            <TabsTrigger value="procedures" className="whitespace-nowrap px-3 py-2">
              Procedimentos
            </TabsTrigger>
            <TabsTrigger value="exams" className="whitespace-nowrap px-3 py-2">
              Exames
            </TabsTrigger>
            <TabsTrigger value="reports" className="whitespace-nowrap px-3 py-2">
              Relatórios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-card-title">Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium">
                          {appointment.type === "consulta" ? "Consulta" : "Procedimento"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date_time).toLocaleString("pt-BR")}
                        </p>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma consulta encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-card-title">Sinais Vitais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitals && vitals.length > 0 ? (
                  vitals.map((vital) => (
                    <div
                      key={vital.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <p className="text-sm text-muted-foreground">
                        {new Date(vital.created_at).toLocaleString("pt-BR")}
                      </p>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {vital.blood_pressure && (
                          <div>
                            <p className="text-xs text-muted-foreground">PA</p>
                            <p className="font-medium">{vital.blood_pressure}</p>
                          </div>
                        )}
                        {vital.heart_rate && (
                          <div>
                            <p className="text-xs text-muted-foreground">FC</p>
                            <p className="font-medium">{vital.heart_rate} bpm</p>
                          </div>
                        )}
                        {vital.temperature && (
                          <div>
                            <p className="text-xs text-muted-foreground">Temp</p>
                            <p className="font-medium">{vital.temperature}°C</p>
                          </div>
                        )}
                        {vital.respiratory_rate && (
                          <div>
                            <p className="text-xs text-muted-foreground">FR</p>
                            <p className="font-medium">{vital.respiratory_rate} rpm</p>
                          </div>
                        )}
                        {vital.o2_sat && (
                          <div>
                            <p className="text-xs text-muted-foreground">SpO2</p>
                            <p className="font-medium">{vital.o2_sat}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum registro de sinais vitais
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolutions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-card-title">Evoluções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evolutions && evolutions.length > 0 ? (
                  evolutions.map((evolution) => (
                    <div
                      key={evolution.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <p className="font-medium">
                          {new Date(evolution.date).toLocaleDateString("pt-BR")}
                        </p>
                        {evolution.professional && (
                          <p className="text-sm text-muted-foreground">
                            {evolution.professional}
                          </p>
                        )}
                      </div>
                      {evolution.text && (
                        <p className="text-sm text-foreground">{evolution.text}</p>
                      )}
                      {evolution.plan && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">Plano:</p>
                          <p className="text-sm">{evolution.plan}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma evolução registrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            {/* CardHeader responsivo */}
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <CardTitle className="text-card-title">Procedimentos</CardTitle>
              <Button 
                onClick={() => setIsProcedureDialogOpen(true)} 
                size="sm" 
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Procedimento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {procedures && procedures.length > 0 ? (
                  procedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <p className="font-medium">{procedure.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(procedure.date_time).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      {procedure.professional && (
                        <p className="text-sm text-muted-foreground">
                          Profissional: {procedure.professional}
                        </p>
                      )}
                      {procedure.notes && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground">Observações:</p>
                          <p className="text-sm">{procedure.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum procedimento registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <CardTitle className="text-card-title">Solicitações de Exames</CardTitle>
              <Button 
                onClick={() => setIsExamRequestDialogOpen(true)} 
                size="sm" 
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                Nova Solicitação
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {examRequests && examRequests.length > 0 ? (
                  examRequests.map((examRequest) => (
                    <div
                      key={examRequest.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <p className="text-sm text-muted-foreground">
                        {new Date(examRequest.created_at).toLocaleString("pt-BR")}
                      </p>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">Exames:</p>
                        <p className="text-sm whitespace-pre-wrap">{examRequest.exams_list}</p>
                      </div>
                      {examRequest.justification && (
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground font-semibold">
                            Justificativa:
                          </p>
                          <p className="text-sm">{examRequest.justification}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma solicitação de exames
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
              <CardTitle className="text-card-title">Relatórios e Documentos</CardTitle>
              <Button 
                onClick={() => setIsReportDialogOpen(true)} 
                size="sm" 
                className="w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Relatório
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <Badge variant="secondary">
                          {report.type === "atestado"
                            ? "Atestado"
                            : report.type === "relatorio"
                            ? "Relatório"
                            : "Prescrição"}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{report.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum relatório ou documento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <AddProcedureDialog
        open={isProcedureDialogOpen}
        onOpenChange={setIsProcedureDialogOpen}
        patientId={id || ""}
        onSuccess={refetchProcedures}
      />
      <AddExamRequestDialog
        open={isExamRequestDialogOpen}
        onOpenChange={setIsExamRequestDialogOpen}
        patientId={id || ""}
        onSuccess={refetchExamRequests}
      />
      <AddReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        patientId={id || ""}
        onSuccess={refetchReports}
      />
    </div>
  );
};

export default PatientDetail;
