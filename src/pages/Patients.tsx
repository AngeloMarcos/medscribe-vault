import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import AddPatientDialog from "@/components/AddPatientDialog";

const Patients = () => {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: patients, isLoading, refetch } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredPatients = patients?.filter(
    (patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.cpf.includes(search) ||
      patient.medical_record_number?.includes(search)
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header com stacking responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-page-title">Pacientes</h2>
          <p className="text-caption mt-1">Gerencie os pacientes cadastrados no sistema</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CPF ou prontuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border border-border">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grid de Cards */}
      {!isLoading && (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients?.map((patient) => (
            <Link key={patient.id} to={`/patients/${patient.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md border border-border h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-card-title truncate">{patient.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-body gap-2">
                    <span className="text-muted-foreground shrink-0">CPF:</span>
                    <span className="font-medium truncate">{patient.cpf}</span>
                  </div>
                  {patient.phone && (
                    <div className="flex justify-between text-body gap-2">
                      <span className="text-muted-foreground shrink-0">Telefone:</span>
                      <span className="font-medium truncate">{patient.phone}</span>
                    </div>
                  )}
                  {patient.medical_record_number && (
                    <div className="flex justify-between text-body gap-2">
                      <span className="text-muted-foreground shrink-0">Prontuário:</span>
                      <span className="font-medium truncate">{patient.medical_record_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPatients?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-caption">Nenhum paciente encontrado com os critérios informados</p>
        </div>
      )}

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Patients;
