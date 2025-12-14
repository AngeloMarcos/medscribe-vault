import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Calendar,
  Clock,
  UserCheck,
  Activity,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function NewDashboard() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayDate = new Date().toISOString().split('T')[0];

  // Fetch today's consultas
  const { data: consultas, isLoading: isLoadingConsultas } = useQuery({
    queryKey: ["dashboard-consultas", todayDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select(`
          *,
          patients:paciente_id(name, medical_record_number),
          especialidades:especialidade_id(nome),
          salas:sala_id(numero)
        `)
        .eq("data_consulta", todayDate)
        .order("hora_inicio", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch total patients count
  const { data: patientsCount, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["dashboard-patients-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("patients")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      title: "Pacientes Hoje",
      value: consultas?.length || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Aguardando",
      value: consultas?.filter((c) => c.status === "aguardando").length || 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Em Atendimento",
      value: consultas?.filter((c) => c.status === "em_atendimento").length || 0,
      icon: Activity,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Atendidos",
      value: consultas?.filter((c) => c.status === "finalizado").length || 0,
      icon: UserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const upcomingConsultas = consultas?.filter(
    (c) => c.status === "agendado" || c.status === "aguardando"
  ).slice(0, 5) || [];

  const ausentesCount = consultas?.filter((c) => c.faltou_paciente).length || 0;
  const pendentesCount = consultas?.filter((c) => c.status === "pendente").length || 0;
  const totalAtendidos = consultas?.filter((c) => c.status === "finalizado").length || 0;
  const totalConsultas = consultas?.length || 0;
  const taxaComparecimento = totalConsultas > 0 
    ? Math.round(((totalConsultas - ausentesCount) / totalConsultas) * 100) 
    : 0;

  const isLoading = isLoadingConsultas || isLoadingPatients;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Painel Geral</h1>
          <p className="text-muted-foreground capitalize text-sm mt-1">{today}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="shadow-sm">
            <Link to="/marcar-consulta">Nova Consulta</Link>
          </Button>
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/lista-pacientes">Ver Lista de Pacientes</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-neumorphic border-0 hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    {isLoading ? (
                      <Skeleton className="h-9 w-12 mt-2" />
                    ) : (
                      <p className="text-3xl font-bold mt-2 tracking-tight">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <Card className="card-neumorphic lg:col-span-2 border-0">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Próximos Atendimentos</CardTitle>
              <CardDescription className="mt-1">Pacientes agendados para hoje</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/lista-pacientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : upcomingConsultas.length > 0 ? (
              <div className="space-y-4">
                {upcomingConsultas.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{consulta.patients?.name || "Paciente"}</p>
                        <p className="text-sm text-muted-foreground">
                          {consulta.especialidades?.nome || "Consulta"} • Sala {consulta.salas?.numero || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{consulta.hora_inicio?.slice(0, 5)}</p>
                      <Badge
                        variant="secondary"
                        className={
                          consulta.status === "aguardando"
                            ? "bg-warning/20 text-warning"
                            : "bg-muted"
                        }
                      >
                        {consulta.status === "aguardando" ? "Aguardando" : "Agendado"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma consulta agendada para hoje
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <Card className="card-neumorphic border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Resumo do Dia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Cadastrados</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className="font-semibold">{patientsCount}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ausentes</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className="font-semibold text-destructive">{ausentesCount}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pendentes</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className="font-semibold text-warning">{pendentesCount}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa Comparecimento</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className="font-semibold text-success">{taxaComparecimento}%</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="card-neumorphic border-l-4 border-l-warning border-t-0 border-r-0 border-b-0">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <CardTitle className="text-lg font-semibold">Alertas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ausentesCount > 0 ? (
                <div className="p-3 rounded-lg bg-destructive/10 text-sm">
                  <p className="font-medium text-destructive">Pacientes Ausentes</p>
                  <p className="text-muted-foreground">
                    {ausentesCount} paciente(s) não compareceu(ram) hoje
                  </p>
                </div>
              ) : null}
              {pendentesCount > 0 ? (
                <div className="p-3 rounded-lg bg-warning/10 text-sm">
                  <p className="font-medium text-warning">Consultas Pendentes</p>
                  <p className="text-muted-foreground">
                    {pendentesCount} consulta(s) aguardando confirmação
                  </p>
                </div>
              ) : null}
              {ausentesCount === 0 && pendentesCount === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Nenhum alerta no momento
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
