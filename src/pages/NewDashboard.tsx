import { useQuery } from "@tanstack/react-query";
import {
  UserRound,
  CalendarHeart,
  Clock,
  UserCheck,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  Stethoscope,
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
          salas:sala_id(numero),
          profissionais:profissional_id(nome)
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
      description: "Total de consultas agendadas",
      value: consultas?.length || 0,
      icon: UserRound,
    },
    {
      title: "Aguardando Atendimento",
      description: "Na recepção ou sala de espera",
      value: consultas?.filter((c) => c.status === "aguardando").length || 0,
      icon: Clock,
    },
    {
      title: "Em Atendimento",
      description: "Sendo atendidos agora",
      value: consultas?.filter((c) => c.status === "em_atendimento").length || 0,
      icon: Activity,
    },
    {
      title: "Atendidos Hoje",
      description: "Consultas finalizadas",
      value: consultas?.filter((c) => c.status === "finalizado").length || 0,
      icon: UserCheck,
    },
  ];

  const upcomingConsultas = consultas?.filter(
    (c) => c.status === "agendado" || c.status === "aguardando" || c.status === "em_atendimento"
  ).slice(0, 5) || [];

  const ausentesCount = consultas?.filter((c) => c.faltou_paciente).length || 0;
  const pendentesCount = consultas?.filter((c) => c.status === "pendente").length || 0;
  const totalConsultas = consultas?.length || 0;
  const taxaComparecimento = totalConsultas > 0 
    ? Math.round(((totalConsultas - ausentesCount) / totalConsultas) * 100) 
    : 0;

  // Função para cor condicional da taxa de comparecimento
  const getTaxaColor = (taxa: number) => {
    if (taxa >= 80) return 'text-success';
    if (taxa >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getTaxaBgColor = (taxa: number) => {
    if (taxa >= 80) return 'bg-success/15';
    if (taxa >= 50) return 'bg-warning/15';
    return 'bg-destructive/15';
  };

  // Função para badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aguardando":
        return {
          label: "Aguardando",
          className: "bg-warning/15 text-warning border-warning/30",
        };
      case "em_atendimento":
        return {
          label: "Em atendimento",
          className: "bg-secondary/15 text-secondary border-secondary/30",
        };
      case "finalizado":
        return {
          label: "Concluído",
          className: "bg-success/15 text-success border-success/30",
        };
      default:
        return {
          label: "Agendado",
          className: "bg-muted text-muted-foreground border-border",
        };
    }
  };

  const isLoading = isLoadingConsultas || isLoadingPatients;

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-page-title">Painel Geral</h1>
          <p className="text-caption capitalize mt-1">Acompanhe os atendimentos do dia • {today}</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="shadow-sm">
            <Link to="/marcar-consulta">
              <CalendarHeart className="h-4 w-4 mr-2" />
              Nova Consulta
            </Link>
          </Button>
          <Button variant="outline" asChild className="shadow-sm">
            <Link to="/lista-pacientes">Ver Pacientes</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Ícone no canto superior direito */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="relative overflow-hidden bg-card border border-border hover:border-secondary/40 hover:shadow-lg transition-all duration-300 shadow-sm rounded-2xl"
            >
              <CardContent className="p-6 lg:p-7">
                {/* Ícone posicionado no canto superior direito */}
                <div className="absolute top-5 right-5 p-3 rounded-full bg-muted">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                
                {/* Conteúdo principal */}
                <div className="pr-14">
                  <p className="text-label text-muted-foreground">{stat.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-12 w-16 mt-3" />
                  ) : (
                    <p className="text-4xl font-bold mt-3 tracking-tight text-foreground">{stat.value}</p>
                  )}
                  <p className="text-helper mt-2">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Upcoming Appointments - Lista aprimorada */}
        <Card className="bg-card lg:col-span-2 border border-border shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 lg:px-8 pt-6 lg:pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Stethoscope className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-card-title">Próximos Atendimentos</CardTitle>
                <CardDescription className="text-caption mt-0.5">Pacientes agendados para hoje</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/lista-pacientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-6 lg:px-8 pb-6 lg:pb-8">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : upcomingConsultas.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {upcomingConsultas.map((consulta) => {
                  const statusBadge = getStatusBadge(consulta.status);
                  return (
                    <div
                      key={consulta.id}
                      className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 lg:gap-6 sm:items-center p-4 lg:p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 border border-transparent hover:border-border"
                    >
                      {/* Paciente + Badge mobile */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <UserRound className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-label truncate">{consulta.patients?.name || "Paciente"}</p>
                          <p className="text-caption truncate">
                            {consulta.especialidades?.nome || "Consulta"} • Sala {consulta.salas?.numero || "-"}
                          </p>
                        </div>
                        {/* Badge visível apenas em mobile */}
                        <Badge
                          variant="outline"
                          className={`sm:hidden text-xs font-medium border shrink-0 ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </Badge>
                      </div>
                      
                      {/* Info row mobile / grid items desktop */}
                      <div className="flex items-center justify-between sm:contents pl-13 sm:pl-0">
                        {/* Horário */}
                        <div className="flex items-center gap-2 sm:block sm:text-center">
                          <span className="text-xs text-muted-foreground sm:hidden">Horário:</span>
                          <p className="text-base sm:text-lg font-semibold text-foreground">{consulta.hora_inicio?.slice(0, 5)}</p>
                        </div>
                        
                        {/* Profissional - hidden mobile */}
                        <div className="hidden md:block text-right min-w-0">
                          <p className="text-body text-muted-foreground truncate max-w-[140px]">
                            {consulta.profissionais?.nome || "—"}
                          </p>
                        </div>
                        
                        {/* Status - hidden mobile (já mostrado acima) */}
                        <div className="hidden sm:block text-right">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium border ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <CalendarHeart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-body text-muted-foreground">Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Alerts */}
        <div className="space-y-8">
          {/* Resumo do Dia */}
          <Card className="bg-card border border-border shadow-sm rounded-2xl">
            <CardHeader className="pb-4 px-6 lg:px-7 pt-6 lg:pt-7">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-card-title">Resumo do Dia</CardTitle>
                  <CardDescription className="text-caption mt-0.5">Estatísticas dos atendimentos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-6 lg:px-7 pb-6 lg:pb-7">
              {/* Total cadastrados */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-body text-muted-foreground">Total cadastrados</span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-12" />
                ) : (
                  <span className="font-semibold text-foreground">{patientsCount}</span>
                )}
              </div>
              
              {/* Ausentes */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-body text-muted-foreground">Ausentes</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className={`font-semibold ${ausentesCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {ausentesCount}
                  </span>
                )}
              </div>
              
              {/* Pendentes */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-body text-muted-foreground">Pendentes</span>
                {isLoading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className={`font-semibold ${pendentesCount > 0 ? 'text-warning' : 'text-foreground'}`}>
                    {pendentesCount}
                  </span>
                )}
              </div>
              
              {/* Taxa de comparecimento com cor condicional */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                <span className="text-body font-medium text-foreground">Taxa de comparecimento</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <span className={`font-bold text-lg px-4 py-1.5 rounded-full ${getTaxaBgColor(taxaComparecimento)} ${getTaxaColor(taxaComparecimento)}`}>
                    {taxaComparecimento}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Alertas */}
          <Card className="bg-card border border-border border-l-4 border-l-warning shadow-sm rounded-2xl">
            <CardHeader className="pb-4 px-6 lg:px-7 pt-6 lg:pt-7">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle className="text-card-title">Atenção</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 lg:px-7 pb-6 lg:pb-7">
              {ausentesCount > 0 && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-label text-destructive">Pacientes não compareceram</p>
                  <p className="text-caption mt-1">
                    {ausentesCount} paciente{ausentesCount > 1 ? 's' : ''} ainda não chegou para a consulta
                  </p>
                </div>
              )}
              {pendentesCount > 0 && (
                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <p className="text-label text-warning">Consultas pendentes</p>
                  <p className="text-caption mt-1">
                    {pendentesCount} consulta{pendentesCount > 1 ? 's' : ''} precisa{pendentesCount > 1 ? 'm' : ''} de confirmação
                  </p>
                </div>
              )}
              {ausentesCount === 0 && pendentesCount === 0 && (
                <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                  <p className="text-body text-success font-medium">
                    ✓ Tudo em ordem por aqui!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
