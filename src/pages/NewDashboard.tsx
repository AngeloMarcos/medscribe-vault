import { useQuery } from "@tanstack/react-query";
import {
  UserRound,
  CalendarHeart,
  Clock,
  UserCheck,
  AlertTriangle,
  Users,
  TrendingUp,
  Stethoscope,
  BarChart3,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { WeeklyChart, EspecialidadeChart, AttendanceGauge, TopCidsChart } from "@/components/dashboard/DashboardCharts";
import { StatCardWithTrend } from "@/components/dashboard/StatCardWithTrend";
import { DayProgressBar } from "@/components/dashboard/DayProgressBar";
import { HourlyChart } from "@/components/dashboard/HourlyChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { AnimatedNumber } from "@/components/dashboard/AnimatedNumber";
import { cn } from "@/lib/utils";

export default function NewDashboard() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayDate = new Date().toISOString().split('T')[0];

  const { trendData, waitTimeData, hourlyStats, isLoadingTrend, isLoadingWaitTime, isLoadingHourly } = useDashboardStats();

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

  const totalConsultas = consultas?.length || 0;
  const aguardandoCount = consultas?.filter((c) => c.status === "aguardando").length || 0;
  const emAtendimentoCount = consultas?.filter((c) => c.status === "em_atendimento").length || 0;
  const finalizadosCount = consultas?.filter((c) => c.status === "finalizado").length || 0;
  const ausentesCount = consultas?.filter((c) => c.faltou_paciente).length || 0;
  const pendentesCount = consultas?.filter((c) => c.status === "pendente").length || 0;

  const upcomingConsultas = consultas?.filter(
    (c) => c.status === "agendado" || c.status === "aguardando" || c.status === "em_atendimento"
  ).slice(0, 6) || [];

  const isLoading = isLoadingConsultas || isLoadingPatients;

  return (
    <div className="space-y-8 pb-12">
      {/* Header with fade-in animation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in">
        <div>
          <h1 className="text-page-title">Painel Geral</h1>
          <p className="text-caption capitalize mt-1">Acompanhe os atendimentos do dia • {today}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="shadow-sm hover:shadow-md transition-shadow">
            <Link to="/relatorios">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Link>
          </Button>
          <Button asChild className="shadow-sm hover:shadow-md transition-shadow">
            <Link to="/marcar-consulta">
              <CalendarHeart className="h-4 w-4 mr-2" />
              Nova Consulta
            </Link>
          </Button>
        </div>
      </div>

      {/* Day Progress Bar */}
      <DayProgressBar
        totalScheduled={totalConsultas}
        completed={finalizadosCount}
        inProgress={emAtendimentoCount}
        waiting={aguardandoCount}
        isLoading={isLoading}
      />

      {/* Stats Cards with Trends - Staggered animation via index prop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCardWithTrend
          title="Pacientes Hoje"
          value={totalConsultas}
          icon={UserRound}
          trend={trendData?.total}
          description="Total agendado"
          isLoading={isLoading || isLoadingTrend}
          index={0}
        />
        <StatCardWithTrend
          title="Aguardando"
          value={aguardandoCount}
          icon={Clock}
          trend={trendData?.aguardando}
          description="Na sala de espera"
          isLoading={isLoading || isLoadingTrend}
          colorVariant="warning"
          index={1}
        />
        <StatCardWithTrend
          title="Atendidos"
          value={finalizadosCount}
          icon={UserCheck}
          trend={trendData?.finalizados}
          description="Consultas finalizadas"
          isLoading={isLoading || isLoadingTrend}
          colorVariant="success"
          index={2}
        />
        <StatCardWithTrend
          title="Tempo de Espera"
          value={waitTimeData?.avgMinutes || 0}
          icon={Timer}
          description={`${waitTimeData?.count || 0} pacientes atendidos`}
          isLoading={isLoading || isLoadingWaitTime}
          colorVariant="info"
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Upcoming Appointments */}
        <Card className="bg-card lg:col-span-2 border border-border shadow-sm rounded-2xl opacity-0 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10 transition-transform hover:scale-105">
                <Stethoscope className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-card-title">Próximos Atendimentos</CardTitle>
                <CardDescription className="text-caption mt-0.5">Pacientes agendados para hoje</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="hover:shadow-sm transition-shadow">
              <Link to="/lista-pacientes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 w-full rounded-xl bg-muted relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
                  </div>
                ))}
              </div>
            ) : upcomingConsultas.length > 0 ? (
              <QuickActions consultas={upcomingConsultas} />
            ) : (
              <div className="text-center py-12 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <CalendarHeart className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-body text-muted-foreground">Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats & Alerts */}
        <div className="space-y-6">
          {/* Resumo do Dia */}
          <Card className="bg-card border border-border shadow-sm rounded-2xl opacity-0 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-4 px-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10 transition-transform hover:scale-105">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-card-title">Resumo do Dia</CardTitle>
                  <CardDescription className="text-caption mt-0.5">Estatísticas rápidas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {[
                { icon: Users, label: "Cadastrados", value: patientsCount, isLoading: isLoadingPatients, delay: 100 },
                { label: "Ausentes", value: ausentesCount, highlight: ausentesCount > 0 ? 'text-destructive' : '', delay: 200 },
                { label: "Pendentes", value: pendentesCount, highlight: pendentesCount > 0 ? 'text-warning' : '', delay: 300 },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors opacity-0 animate-fade-in"
                  style={{ animationDelay: `${400 + item.delay}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-body text-muted-foreground">{item.label}</span>
                  </div>
                  {item.isLoading ? (
                    <Skeleton className="h-5 w-12" />
                  ) : (
                    <span className={cn("font-semibold", item.highlight)}>
                      <AnimatedNumber value={item.value || 0} />
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alertas with pulse animation */}
          {(ausentesCount > 0 || pendentesCount > 0) && (
            <Card className="bg-card border border-border border-l-4 border-l-warning shadow-sm rounded-2xl opacity-0 animate-scale-in" style={{ animationDelay: "400ms" }}>
              <CardHeader className="pb-3 px-6 pt-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning animate-pulse-soft" />
                  <CardTitle className="text-card-title">Atenção</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-6 pb-5">
                {ausentesCount > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
                    <p className="text-sm text-destructive font-medium">{ausentesCount} paciente{ausentesCount > 1 ? 's' : ''} ausente{ausentesCount > 1 ? 's' : ''}</p>
                  </div>
                )}
                {pendentesCount > 0 && (
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
                    <p className="text-sm text-warning font-medium">{pendentesCount} consulta{pendentesCount > 1 ? 's' : ''} pendente{pendentesCount > 1 ? 's' : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Charts Section with staggered animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <HourlyChart data={hourlyStats || []} isLoading={isLoadingHourly} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "500ms" }}>
          <WeeklyChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "600ms" }}>
          <EspecialidadeChart />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "700ms" }}>
          <AttendanceGauge />
        </div>
      </div>

      <div className="grid grid-cols-1 opacity-0 animate-slide-up" style={{ animationDelay: "800ms" }}>
        <TopCidsChart />
      </div>
    </div>
  );
}
