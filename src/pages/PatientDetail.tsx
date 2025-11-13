import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

  const { data: patient } = useQuery({
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

  const { data: evolutions, refetch: refetchEvolutions } = useQuery({
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

  if (!patient) return <div>Carregando...</div>;

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            {patient.name}
          </h2>
          <p className="text-muted-foreground">Detalhes do paciente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">CPF</p>
            <p className="font-medium">{patient.cpf}</p>
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

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="vitals">Sinais Vitais</TabsTrigger>
          <TabsTrigger value="evolutions">Evoluções</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="exams">Exames</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments && appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {appointment.type === "consulta" ? "Consulta" : "Procedimento"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date_time).toLocaleString("pt-BR")}
                        </p>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground">
                            {appointment.description}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">
                    Nenhuma consulta encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sinais Vitais</CardTitle>
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
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
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
                  <p className="text-center text-muted-foreground">
                    Nenhum registro de sinais vitais
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evolutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evoluções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evolutions && evolutions.length > 0 ? (
                  evolutions.map((evolution) => (
                    <div
                      key={evolution.id}
                      className="rounded-lg border border-border p-4 space-y-2"
                    >
                      <div className="flex justify-between">
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
                  <p className="text-center text-muted-foreground">
                    Nenhuma evolução registrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Procedimentos</CardTitle>
              <Button onClick={() => setIsProcedureDialogOpen(true)} size="sm" className="gap-2">
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
                      <div className="flex justify-between">
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
                  <p className="text-center text-muted-foreground">
                    Nenhum procedimento registrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Solicitações de Exames</CardTitle>
              <Button onClick={() => setIsExamRequestDialogOpen(true)} size="sm" className="gap-2">
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
                  <p className="text-center text-muted-foreground">
                    Nenhuma solicitação de exames
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Relatórios e Documentos</CardTitle>
              <Button onClick={() => setIsReportDialogOpen(true)} size="sm" className="gap-2">
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
                      <div className="flex justify-between items-start">
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
                  <p className="text-center text-muted-foreground">
                    Nenhum relatório gerado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddProcedureDialog
        open={isProcedureDialogOpen}
        onOpenChange={setIsProcedureDialogOpen}
        onSuccess={refetchProcedures}
        patientId={id!}
      />
      <AddExamRequestDialog
        open={isExamRequestDialogOpen}
        onOpenChange={setIsExamRequestDialogOpen}
        onSuccess={refetchExamRequests}
        patientId={id!}
      />
      <AddReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onSuccess={refetchReports}
        patientId={id!}
      />
    </div>
  );
};

export default PatientDetail;
