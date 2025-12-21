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
  Plus,
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
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

export default function NewDashboard() {
  const { isMobile, isTablet } = useResponsive();
  
  // Formato de data adaptativo
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: isMobile ? "short" : "long",
    year: "numeric",
    month: isMobile ? "short" : "long",
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
  ).slice(0, isMobile ? 4 : 6) || [];

  const isLoading = isLoadingConsultas || isLoadingPatients;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-6 sm:pb-8 lg:pb-12">
      {/* Header Responsivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between opacity-0 animate-fade-in">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Painel Geral</h1>
          <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-0.5 sm:mt-1 truncate">
            {isMobile ? today : `Acompanhe os atendimentos do dia • ${today}`}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0">
          <Button 
            variant="outline" 
            asChild 
            size={isMobile ? "sm" : "default"}
            className="shadow-sm hover:shadow-md transition-shadow flex-1 sm:flex-none"
          >
            <Link to="/relatorios">
              <BarChart3 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Relatórios</span>
            </Link>
          </Button>
          <Button 
            asChild 
            size={isMobile ? "sm" : "default"}
            className="shadow-sm hover:shadow-md transition-shadow flex-1 sm:flex-none"
          >
            <Link to="/marcar-consulta">
              <Plus className="h-4 w-4 sm:hidden" />
              <CalendarHeart className="h-4 w-4 mr-2 hidden sm:block" />
              <span className="hidden sm:inline">Nova Consulta</span>
              <span className="sm:hidden">Nova</span>
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

      {/* Stats Cards - Grid 2x2 em mobile, 4 colunas em desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCardWithTrend
          title="Pacientes Hoje"
          value={totalConsultas}
          icon={UserRound}
          trend={trendData?.total}
          description={!isMobile ? "Total agendado" : undefined}
          isLoading={isLoading || isLoadingTrend}
          index={0}
        />
        <StatCardWithTrend
          title="Aguardando"
          value={aguardandoCount}
          icon={Clock}
          trend={trendData?.aguardando}
          description={!isMobile ? "Na sala de espera" : undefined}
          isLoading={isLoading || isLoadingTrend}
          colorVariant="warning"
          index={1}
        />
        <StatCardWithTrend
          title="Atendidos"
          value={finalizadosCount}
          icon={UserCheck}
          trend={trendData?.finalizados}
          description={!isMobile ? "Consultas finalizadas" : undefined}
          isLoading={isLoading || isLoadingTrend}
          colorVariant="success"
          index={2}
        />
        <StatCardWithTrend
          title={isMobile ? "Espera" : "Tempo de Espera"}
          value={waitTimeData?.avgMinutes || 0}
          icon={Timer}
          description={!isMobile ? `${waitTimeData?.count || 0} pacientes atendidos` : undefined}
          isLoading={isLoading || isLoadingWaitTime}
          colorVariant="info"
          index={3}
          suffix="min"
        />
      </div>

      {/* Main Content Grid - Resumo primeiro em mobile */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Resumo do Dia - Primeiro em mobile, último em desktop */}
        <div className="order-first xl:order-last space-y-4 sm:space-y-6">
          {/* Resumo do Dia */}
          <Card className="bg-card border border-border shadow-sm rounded-xl sm:rounded-2xl opacity-0 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10 transition-transform hover:scale-105">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold">Resumo do Dia</CardTitle>
                  <CardDescription className="text-xs mt-0.5 hidden sm:block">Estatísticas rápidas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 px-4 sm:px-6 pb-4 sm:pb-6">
              {[
                { icon: Users, label: "Cadastrados", value: patientsCount, isLoading: isLoadingPatients, delay: 100 },
                { label: "Ausentes", value: ausentesCount, highlight: ausentesCount > 0 ? 'text-destructive' : '', delay: 200 },
                { label: "Pendentes", value: pendentesCount, highlight: pendentesCount > 0 ? 'text-warning' : '', delay: 300 },
              ].map((item) => (
                <div 
                  key={item.label}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors opacity-0 animate-fade-in"
                  style={{ animationDelay: `${400 + item.delay}ms` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    {item.icon && <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />}
                    <span className="text-xs sm:text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  {item.isLoading ? (
                    <Skeleton className="h-4 sm:h-5 w-10 sm:w-12" />
                  ) : (
                    <span className={cn("text-sm sm:text-base font-semibold", item.highlight)}>
                      <AnimatedNumber value={item.value || 0} />
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Alertas */}
          {(ausentesCount > 0 || pendentesCount > 0) && (
            <Card className="bg-card border border-border border-l-4 border-l-warning shadow-sm rounded-xl sm:rounded-2xl opacity-0 animate-scale-in" style={{ animationDelay: "300ms" }}>
              <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-warning animate-pulse-soft" />
                  <CardTitle className="text-sm sm:text-base font-semibold">Atenção</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 sm:px-6 pb-4 sm:pb-5">
                {ausentesCount > 0 && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
                    <p className="text-xs sm:text-sm text-destructive font-medium">{ausentesCount} paciente{ausentesCount > 1 ? 's' : ''} ausente{ausentesCount > 1 ? 's' : ''}</p>
                  </div>
                )}
                {pendentesCount > 0 && (
                  <div className="p-2.5 sm:p-3 rounded-lg bg-warning/10 border border-warning/20 opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
                    <p className="text-xs sm:text-sm text-warning font-medium">{pendentesCount} consulta{pendentesCount > 1 ? 's' : ''} pendente{pendentesCount > 1 ? 's' : ''}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Próximos Atendimentos */}
        <Card className="bg-card xl:col-span-2 border border-border shadow-sm rounded-xl sm:rounded-2xl opacity-0 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-secondary/10 transition-transform hover:scale-105">
                <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-semibold">Próximos Atendimentos</CardTitle>
                <CardDescription className="text-xs mt-0.5 hidden sm:block">Pacientes agendados para hoje</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="hover:shadow-sm transition-shadow h-8 px-2 sm:px-3">
              <Link to="/lista-pacientes">
                <span className="hidden sm:inline">Ver todos</span>
                <span className="sm:hidden">Ver</span>
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {isLoading ? (
              <div className="space-y-2 sm:space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 sm:h-16 w-full rounded-lg sm:rounded-xl bg-muted skeleton-shimmer" />
                ))}
              </div>
            ) : upcomingConsultas.length > 0 ? (
              <QuickActions consultas={upcomingConsultas} />
            ) : (
              <div className="text-center py-8 sm:py-12 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <CalendarHeart className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhuma consulta agendada para hoje</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Stacked em mobile, 2 colunas em tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "400ms" }}>
          <HourlyChart data={hourlyStats || []} isLoading={isLoadingHourly} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: "500ms" }}>
          <WeeklyChart />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
