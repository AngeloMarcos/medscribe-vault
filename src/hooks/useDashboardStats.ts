import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from "date-fns";

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

export function useDashboardStats() {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Stats dos últimos 7 dias
  const { data: weeklyStats, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["dashboard-weekly-stats"],
    queryFn: async () => {
      const days: DailyStats[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from("consultas")
          .select("id, status, faltou_paciente")
          .eq("data_consulta", dateStr);
        
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
  });

  // Stats por especialidade (mês atual)
  const { data: especialidadeStats, isLoading: isLoadingEspecialidade } = useQuery({
    queryKey: ["dashboard-especialidade-stats"],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      const { data: consultas, error } = await supabase
        .from("consultas")
        .select(`
          id,
          especialidades:especialidade_id(id, nome, cor_hex)
        `)
        .gte("data_consulta", startMonth)
        .lte("data_consulta", endMonth);
      
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
  });

  // Top 10 CIDs (mês atual)
  const { data: cidStats, isLoading: isLoadingCids } = useQuery({
    queryKey: ["dashboard-cid-stats"],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      const { data: atendimentos, error } = await supabase
        .from("atendimentos")
        .select("cid_principal")
        .not("cid_principal", "is", null)
        .gte("created_at", startMonth)
        .lte("created_at", endMonth);
      
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
  });

  // Taxa de comparecimento geral
  const { data: attendanceRate, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["dashboard-attendance-rate"],
    queryFn: async () => {
      const startMonth = format(startOfMonth(today), 'yyyy-MM-dd');
      const endMonth = format(endOfMonth(today), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from("consultas")
        .select("id, faltou_paciente, status")
        .gte("data_consulta", startMonth)
        .lte("data_consulta", endMonth);
      
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
  });

  return {
    weeklyStats,
    especialidadeStats,
    cidStats,
    attendanceRate,
    isLoading: isLoadingWeekly || isLoadingEspecialidade || isLoadingCids || isLoadingAttendance,
  };
}

export function useReportStats(startDate: string, endDate: string) {
  // Produção por profissional
  const { data: profissionalStats, isLoading } = useQuery({
    queryKey: ["report-profissional-stats", startDate, endDate],
    queryFn: async () => {
      const { data: consultas, error } = await supabase
        .from("consultas")
        .select(`
          id,
          status,
          faltou_paciente,
          profissionais:profissional_id(id, nome, especialidades:especialidade_id(nome))
        `)
        .gte("data_consulta", startDate)
        .lte("data_consulta", endDate);
      
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
    enabled: !!startDate && !!endDate,
  });

  // Stats gerais do período
  const { data: periodStats } = useQuery({
    queryKey: ["report-period-stats", startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultas")
        .select("id, status, faltou_paciente")
        .gte("data_consulta", startDate)
        .lte("data_consulta", endDate);
      
      if (error) throw error;
      
      return {
        total: data?.length || 0,
        finalizados: data?.filter(c => c.status === 'finalizado').length || 0,
        ausentes: data?.filter(c => c.faltou_paciente).length || 0,
        cancelados: data?.filter(c => c.status === 'cancelado').length || 0,
      };
    },
    enabled: !!startDate && !!endDate,
  });

  return {
    profissionalStats,
    periodStats,
    isLoading,
  };
}
