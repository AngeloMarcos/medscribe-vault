import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, FileText, AlertTriangle, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type SortField = "local" | "name" | "age" | "record" | "responsible" | "date" | "stay";
type SortDirection = "asc" | "desc";

interface PatientData {
  id: string;
  consultaId: string;
  local: string;
  name: string;
  birthDate: string | null;
  medicalRecord: string | null;
  responsible: string | null;
  attendanceDate: string;
  arrivalTime: string | null;
  hasAllergy: boolean;
}

const PrescriptionList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ["prescription-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          id,
          data_consulta,
          hora_chegada,
          sala_id,
          paciente_id,
          patients:paciente_id (
            id,
            name,
            birth_date,
            medical_record_number
          ),
          salas:sala_id (
            numero,
            nome
          ),
          profissionais:profissional_id (
            nome
          )
        `)
        .in("status", ["em_atendimento", "aguardando", "agendado"])
        .order("data_consulta", { ascending: false });

      if (error) throw error;

      return (data || []).map((consulta: any): PatientData => ({
        id: consulta.patients?.id || consulta.paciente_id,
        consultaId: consulta.id,
        local: consulta.salas ? `${consulta.salas.numero}${consulta.salas.nome ? ` - ${consulta.salas.nome}` : ""}` : "-",
        name: consulta.patients?.name || "Paciente não identificado",
        birthDate: consulta.patients?.birth_date || null,
        medicalRecord: consulta.patients?.medical_record_number || null,
        responsible: consulta.profissionais?.nome || null,
        attendanceDate: consulta.data_consulta,
        arrivalTime: consulta.hora_chegada,
        hasAllergy: false, // TODO: Verificar tabela de alergias quando disponível
      }));
    },
  });

  if (error) {
    toast.error("Erro ao carregar lista de pacientes");
  }

  const calculateAge = (birthDate: string | null): string => {
    if (!birthDate) return "-";
    const years = differenceInYears(new Date(), new Date(birthDate));
    return `${years}a`;
  };

  const calculateStayDays = (arrivalTime: string | null): number => {
    if (!arrivalTime) return 0;
    return differenceInDays(new Date(), new Date(arrivalTime));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedPatients = useMemo(() => {
    if (!patients) return [];

    let result = patients.filter((patient) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        patient.name.toLowerCase().includes(searchLower) ||
        patient.medicalRecord?.toLowerCase().includes(searchLower) ||
        patient.local.toLowerCase().includes(searchLower);

      const matchesUnit = selectedUnit === "all" || patient.local.includes(selectedUnit);

      return matchesSearch && matchesUnit;
    });

    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "local":
            comparison = a.local.localeCompare(b.local);
            break;
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "age":
            const ageA = a.birthDate ? differenceInYears(new Date(), new Date(a.birthDate)) : 0;
            const ageB = b.birthDate ? differenceInYears(new Date(), new Date(b.birthDate)) : 0;
            comparison = ageA - ageB;
            break;
          case "record":
            comparison = (a.medicalRecord || "").localeCompare(b.medicalRecord || "");
            break;
          case "responsible":
            comparison = (a.responsible || "").localeCompare(b.responsible || "");
            break;
          case "date":
            comparison = new Date(a.attendanceDate).getTime() - new Date(b.attendanceDate).getTime();
            break;
          case "stay":
            comparison = calculateStayDays(a.arrivalTime) - calculateStayDays(b.arrivalTime);
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [patients, search, selectedUnit, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="text-2xl text-primary">
            Prescrição Médica - Lista de Pacientes
          </CardTitle>
          <CardDescription>
            Selecione o paciente para iniciar a prescrição
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, prontuário ou leito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Unidade Funcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Unidades</SelectItem>
                <SelectItem value="UTI">UTI</SelectItem>
                <SelectItem value="Enfermaria">Enfermaria</SelectItem>
                <SelectItem value="Emergência">Emergência</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="local">Local</SortableHeader>
                  <SortableHeader field="name">Nome</SortableHeader>
                  <SortableHeader field="age">Idade</SortableHeader>
                  <SortableHeader field="record">Prontuário</SortableHeader>
                  <SortableHeader field="responsible">Responsável</SortableHeader>
                  <SortableHeader field="date">Dt. Atend.</SortableHeader>
                  <SortableHeader field="stay">Perm.</SortableHeader>
                  <TableHead>Alergias</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredAndSortedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum paciente encontrado com os critérios de busca
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedPatients.map((patient) => (
                    <TableRow key={patient.consultaId} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{patient.local}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{calculateAge(patient.birthDate)}</TableCell>
                      <TableCell>{patient.medicalRecord || "-"}</TableCell>
                      <TableCell>{patient.responsible || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(patient.attendanceDate), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {calculateStayDays(patient.arrivalTime)}d
                      </TableCell>
                      <TableCell>
                        {patient.hasAllergy ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sim
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Não
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => navigate(`/prescription/create/${patient.id}`)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Prescrever
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Rodapé com contagem */}
          {!isLoading && (
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredAndSortedPatients.length} paciente(s) encontrado(s)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionList;
