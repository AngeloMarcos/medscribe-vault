import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subDays, format, differenceInMinutes, parseISO } from "date-fns";
import { useTenant } from "@/hooks/useTenant";

export interface DailyStats {
  date: string;
  total: number;
  finalizados: number;
  ausentes: number;
}

export interface EspecialidadeStats {
  nome: string;
  total: number;
  cor: string;
}

export interface CidStats {
  codigo: string;
  descricao: string;
  total: number;
}

export interface ProfissionalStats {
  id: string;
  nome: string;
  especialidade: string;
  total_consultas: number;
  finalizados: number;
  ausentes: number;
  taxa_comparecimento: number;
}

export interface HourlyStats {
  hora: string;
  agendados: number;
  atendidos: number;
}

export interface TrendData {
  value: number;
  direction: "up" | "down" | "neutral";
}

export function useDashboardStats() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');
  const { tenant } = useTenant();
  
  // Stats dos últimos 7 dias
  const { data: weeklyStats, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["dashboard-weekly-stats", tenant?.id],
    queryFn: async () => {
      const days: DailyStats[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        let query = supabase
          .from("consultas")
          .select("id, status, faltou_paciente")
          .eq("data_consulta", dateStr);
        
        if (tenant?.id) {
          query = query.eq("tenant_id", tenant.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        days.push({
          date: format(date, 'dd/MM'),
          total: data?.length || 0,
          finalizados: data?.filter(c => c.status === 'finalizado').length || 0,
          ausentes: data?.filter(c => c.faltou_paciente).length || 0,
        });
      }
      
      return days;
    },
    enabled: !!tenant?.id,
    staleTime: 30000, // 30 seconds
  });

  // Tendência vs ontem
  const { data: trendData, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["dashboard-trend", tenant?.id, todayStr, yesterdayStr],
    queryFn: async () => {
      // Dados de hoje
      let todayQuery = supabase
        .from("consultas")
        .select("id, status, faltou_paciente")
        .eq("data_consulta", todayStr);
      
      if (tenant?.id) {
        todayQuery = todayQuery.eq("tenant_id", tenant.id);
      }
      
      const { data: todayData } = await todayQuery;
      
      // Dados de ontem
      let yesterdayQuery = supabase
        .from("consultas")
        .select("id, status, faltou_paciente")
        .eq("data_consulta", yesterdayStr);
      
      if (tenant?.id) {
        yesterdayQuery = yesterdayQuery.eq("tenant_id", tenant.id);
      }
      
      const { data: yesterdayData } = await yesterdayQuery;
      
      const todayTotal = todayData?.length || 0;
      const yesterdayTotal = yesterdayData?.length || 0;
      
      const todayFinalizados = todayData?.filter(c => c.status === 'finalizado').length || 0;
      const yesterdayFinalizados = yesterdayData?.filter(c => c.status === 'finalizado').length || 0;
      
      const todayAguardando = todayData?.filter(c => c.status === 'aguardando').length || 0;
      const yesterdayAguardando = yesterdayData?.filter(c => c.status === 'aguardando').length || 0;
      
      const calcTrend = (current: number, previous: number): TrendData => {
        if (previous === 0) {
          return { value: current > 0 ? 100 : 0, direction: current > 0 ? "up" : "neutral" };
        }
        const diff = Math.round(((current - previous) / previous) * 100);
        return {
          value: Math.abs(diff),
          direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
        };
      };
      
      return {
        total: calcTrend(todayTotal, yesterdayTotal),
        finalizados: calcTrend(todayFinalizados, yesterdayFinalizados),
        aguardando: calcTrend(todayAguardando, yesterdayAguardando),
      };
    },
    enabled: !!tenant?.id,
    staleTime: 30000,
  });

  // Tempo médio de espera (hoje)
  const { data: waitTimeData, isLoading: isLoadingWaitTime } = useQuery({
    queryKey: ["dashboard-wait-time", tenant?.id, todayStr],
    queryFn: async () => {
      let query = supabase
        .from("consultas")
        .select("hora_chegada, hora_inicio_atendimento")
        .eq("data_consulta", todayStr)
        .not("hora_chegada", "is", null)
        .not("hora_inicio_atendimento", "is", null);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return { avgMinutes: 0, count: 0 };
      }
      
      let totalMinutes = 0;
      let validCount = 0;
      
      data.forEach((c) => {
        try {
          const chegada = parseISO(`${todayStr}T${c.hora_chegada}`);
          const inicio = parseISO(`${todayStr}T${c.hora_inicio_atendimento}`);
          const diff = differenceInMinutes(inicio, chegada);
          if (diff >= 0 && diff < 240) { // Max 4 hours
            totalMinutes += diff;
            validCount++;
          }
        } catch {
          // Skip invalid times
        }
      });
      
      return {
        avgMinutes: validCount > 0 ? Math.round(totalMinutes / validCount) : 0,
        count: validCount,
      };
    },
    enabled: !!tenant?.id,
    staleTime: 30000,
  });

  // Fluxo por hora (hoje)
  const { data: hourlyStats, isLoading: isLoadingHourly } = useQuery({
    queryKey: ["dashboard-hourly-stats", tenant?.id, todayStr],
    queryFn: async () => {
      let query = supabase
        .from("consultas")
        .select("hora_inicio, status")
        .eq("data_consulta", todayStr);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Initialize hours from 7:00 to 19:00
      const hours: Record<string, HourlyStats> = {};
      for (let h = 7; h <= 19; h++) {
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        hours[hourStr] = { hora: hourStr, agendados: 0, atendidos: 0 };
      }
      
      data?.forEach((c) => {
        const hour = c.hora_inicio?.slice(0, 2);
        if (hour) {
          const hourKey = `${hour}:00`;
          if (hours[hourKey]) {
            hours[hourKey].agendados++;
            if (c.status === 'finalizado') {
              hours[hourKey].atendidos++;
            }
          }
        }
      });
      
      return Object.values(hours);
    },
    enabled: !!tenant?.id,
    staleTime: 30000,
  });

  // Stats por especialidade (mês atual)
  const { data: especialidadeStats, isLoading: isLoadingEspecialidade } = useQuery({
    queryKey: ["dashboard-especialidade-stats", tenant?.id],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      let query = supabase
        .from("consultas")
        .select(`
          id,
          especialidades:especialidade_id(id, nome, cor_hex)
        `)
        .gte("data_consulta", startMonth)
        .lte("data_consulta", endMonth);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data: consultas, error } = await query;
      
      if (error) throw error;
      
      const grouped: Record<string, { nome: string; total: number; cor: string }> = {};
      
      consultas?.forEach((c: any) => {
        const esp = c.especialidades;
        if (esp) {
          if (!grouped[esp.id]) {
            grouped[esp.id] = { nome: esp.nome, total: 0, cor: esp.cor_hex || '#00A896' };
          }
          grouped[esp.id].total++;
        }
      });
      
      return Object.values(grouped).sort((a, b) => b.total - a.total);
    },
    enabled: !!tenant?.id,
  });

  // Top 10 CIDs (mês atual)
  const { data: cidStats, isLoading: isLoadingCids } = useQuery({
    queryKey: ["dashboard-cid-stats", tenant?.id],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      let query = supabase
        .from("atendimentos")
        .select("cid_principal")
        .not("cid_principal", "is", null)
        .gte("created_at", startMonth)
        .lte("created_at", endMonth);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data: atendimentos, error } = await query;
      
      if (error) throw error;
      
      const cidCounts: Record<string, number> = {};
      atendimentos?.forEach((a) => {
        if (a.cid_principal) {
          cidCounts[a.cid_principal] = (cidCounts[a.cid_principal] || 0) + 1;
        }
      });
      
      // Buscar descrições dos CIDs
      const cidCodes = Object.keys(cidCounts);
      if (cidCodes.length === 0) return [];
      
      const { data: cids } = await supabase
        .from("cids")
        .select("codigo, descricao")
        .in("codigo", cidCodes);
      
      const cidMap = new Map(cids?.map(c => [c.codigo, c.descricao]) || []);
      
      return Object.entries(cidCounts)
        .map(([codigo, total]) => ({
          codigo,
          descricao: cidMap.get(codigo) || codigo,
          total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
    },
    enabled: !!tenant?.id,
  });

  // Taxa de comparecimento geral
  const { data: attendanceRate, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["dashboard-attendance-rate", tenant?.id],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      let query = supabase
        .from("consultas")
        .select("id, faltou_paciente, status")
        .gte("data_consulta", startMonth)
        .lte("data_consulta", endMonth);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const total = data?.length || 0;
      const ausentes = data?.filter(c => c.faltou_paciente).length || 0;
      const finalizados = data?.filter(c => c.status === 'finalizado').length || 0;
      
      return {
        total,
        ausentes,
        finalizados,
        taxa: total > 0 ? Math.round(((total - ausentes) / total) * 100) : 0,
      };
    },
    enabled: !!tenant?.id,
  });

  return {
    weeklyStats,
    especialidadeStats,
    cidStats,
    attendanceRate,
    trendData,
    waitTimeData,
    hourlyStats,
    isLoading: isLoadingWeekly || isLoadingEspecialidade || isLoadingCids || isLoadingAttendance,
    isLoadingTrend,
    isLoadingWaitTime,
    isLoadingHourly,
  };
}

export function useReportStats(startDate: string, endDate: string) {
  const { tenant } = useTenant();
  
  // Produção por profissional
  const { data: profissionalStats, isLoading } = useQuery({
    queryKey: ["report-profissional-stats", startDate, endDate, tenant?.id],
    queryFn: async () => {
      let query = supabase
        .from("consultas")
        .select(`
          id,
          status,
          faltou_paciente,
          profissionais:profissional_id(id, nome, especialidades:especialidade_id(nome))
        `)
        .gte("data_consulta", startDate)
        .lte("data_consulta", endDate);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data: consultas, error } = await query;
      
      if (error) throw error;
      
      const grouped: Record<string, ProfissionalStats> = {};
      
      consultas?.forEach((c: any) => {
        const prof = c.profissionais;
        if (prof) {
          if (!grouped[prof.id]) {
            grouped[prof.id] = {
              id: prof.id,
              nome: prof.nome,
              especialidade: prof.especialidades?.nome || 'N/A',
              total_consultas: 0,
              finalizados: 0,
              ausentes: 0,
              taxa_comparecimento: 0,
            };
          }
          grouped[prof.id].total_consultas++;
          if (c.status === 'finalizado') grouped[prof.id].finalizados++;
          if (c.faltou_paciente) grouped[prof.id].ausentes++;
        }
      });
      
      // Calcular taxas
      Object.values(grouped).forEach((p) => {
        p.taxa_comparecimento = p.total_consultas > 0 
          ? Math.round(((p.total_consultas - p.ausentes) / p.total_consultas) * 100)
          : 0;
      });
      
      return Object.values(grouped).sort((a, b) => b.total_consultas - a.total_consultas);
    },
    enabled: !!startDate && !!endDate && !!tenant?.id,
  });

  // Stats gerais do período
  const { data: periodStats } = useQuery({
    queryKey: ["report-period-stats", startDate, endDate, tenant?.id],
    queryFn: async () => {
      let query = supabase
        .from("consultas")
        .select("id, status, faltou_paciente")
        .gte("data_consulta", startDate)
        .lte("data_consulta", endDate);
      
      if (tenant?.id) {
        query = query.eq("tenant_id", tenant.id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        finalizados: data?.filter(c => c.status === 'finalizado').length || 0,
        ausentes: data?.filter(c => c.faltou_paciente).length || 0,
        cancelados: data?.filter(c => c.status === 'cancelado').length || 0,
      };
    },
    enabled: !!startDate && !!endDate && !!tenant?.id,
  });

  return {
    profissionalStats,
    periodStats,
    isLoading,
  };
}
