import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Plus, 
  LogOut, 
  Skull, 
  FileSearch, 
  FileText,
  ClipboardList
} from "lucide-react";
import { differenceInYears } from "date-fns";
import { PrescriptionBreadcrumb } from "@/components/prescription/PrescriptionBreadcrumb";

export default function CreatePrescription() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  // Fetch patient data
  const { data: patient, isLoading: isLoadingPatient } = useQuery({
    queryKey: ["prescription-patient", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Fetch active consultation
  const { data: consultation, isLoading: isLoadingConsultation } = useQuery({
    queryKey: ["prescription-consultation", patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          *,
          salas:sala_id (numero, nome),
          especialidades:especialidade_id (nome)
        `)
        .eq("paciente_id", patientId)
        .in("status", ["em_atendimento", "aguardando"])
        .order("data_consulta", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!patientId,
  });

  // Placeholder for prescriptions (table doesn't exist yet)
  const prescriptions: any[] = [];

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "N/I";
    return `${differenceInYears(new Date(), new Date(birthDate))} anos`;
  };

  const isLoading = isLoadingPatient || isLoadingConsultation;

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 space-y-4 md:space-y-6">
      {/* Breadcrumb */}
      <PrescriptionBreadcrumb 
        items={[
          { label: patient?.name || "Elaborar Prescrição" }
        ]} 
      />

      {/* Header com stacking responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/prescription")}
          className="self-start"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Prescrição Médica - Elaborar
        </h1>
      </div>

      {/* Patient Data Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Dados do Paciente</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          ) : patient ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Column 1 */}
              <div className="space-y-2">
                <p className="text-lg md:text-xl font-semibold text-foreground truncate">
                  {patient.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Prontuário:</span>{" "}
                  {patient.medical_record_number || "N/I"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Local:</span>{" "}
                  L:{consultation?.salas?.numero || "N/I"}
                  {consultation?.salas?.nome && ` - ${consultation.salas.nome}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Idade:</span>{" "}
                  {calculateAge(patient.birth_date)}
                </p>
              </div>

              {/* Column 2 */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Código:</span>{" "}
                  {patient.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Unidade Funcional:</span>{" "}
                  {consultation?.especialidades?.nome || "N/I"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Atendimento:</span>{" "}
                  {consultation?.numero_consulta || "N/I"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Paciente não encontrado</p>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Prescrições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prescriptions.length > 0 ? (
            <div className="space-y-2">
              {prescriptions.map((prescription, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-muted/50"
                >
                  {/* Prescription item */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Nenhuma prescrição cadastrada para este atendimento.
            </p>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate(`/prescription/maintain/${patientId}`)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Nova Prescrição
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Action Buttons - Empilhados em mobile */}
      <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
        <Button variant="outline" className="flex-1 xs:flex-none gap-2 justify-center">
          <LogOut className="h-4 w-4" />
          Alta
        </Button>
        <Button variant="outline" className="flex-1 xs:flex-none gap-2 justify-center">
          <Skull className="h-4 w-4" />
          Óbito
        </Button>
        <Button variant="outline" className="flex-1 xs:flex-none gap-2 justify-center">
          <FileSearch className="h-4 w-4" />
          Solicitar Exames
        </Button>
        <Button variant="outline" className="flex-1 xs:flex-none gap-2 justify-center">
          <FileText className="h-4 w-4" />
          Anamnese/Evolução
        </Button>
      </div>
    </div>
  );
}
