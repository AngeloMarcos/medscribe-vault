import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GradeHorario {
  id: string;
  profissional_id: string;
  especialidade_id: string;
  equipe_id: string | null;
  sala_id: string | null;
  zona_id: string | null;
  dia_semana: number | null;
  hora_inicio: string;
  hora_fim: string;
  duracao_consulta: number | null;
  vagas_totais: number | null;
  data_inicio: string;
  data_fim: string | null;
  turno: string | null;
  ativo: boolean | null;
  created_at: string | null;
  // Joined data
  profissional?: { id: string; nome: string };
  especialidade?: { id: string; nome: string; cor_hex: string | null };
  equipe?: { id: string; nome: string } | null;
  sala?: { id: string; numero: string; nome: string | null } | null;
  zona?: { id: string; nome: string } | null;
}

export interface GradeFormData {
  profissional_id: string;
  especialidade_id: string;
  equipe_id?: string | null;
  sala_id?: string | null;
  zona_id?: string | null;
  dias_semana: number[];
  hora_inicio: string;
  hora_fim: string;
  duracao_consulta: number;
  vagas_totais: number;
  data_inicio: string;
  data_fim?: string | null;
  turno?: string | null;
  ativo?: boolean;
}

// Hook to list all grades with joins
export function useGradesHorarios(filters?: {
  especialidade_id?: string;
  profissional_id?: string;
  turno?: string;
  ativo?: boolean;
}) {
  return useQuery({
    queryKey: ['grades-horarios', filters],
    queryFn: async () => {
      let query = supabase
        .from('grades_horarios')
        .select(`
          *,
          profissional:profissionais(id, nome),
          especialidade:especialidades(id, nome, cor_hex),
          equipe:equipes(id, nome),
          sala:salas(id, numero, nome),
          zona:zonas(id, nome)
        `)
        .order('hora_inicio', { ascending: true });

      if (filters?.especialidade_id) {
        query = query.eq('especialidade_id', filters.especialidade_id);
      }
      if (filters?.profissional_id) {
        query = query.eq('profissional_id', filters.profissional_id);
      }
      if (filters?.turno) {
        query = query.eq('turno', filters.turno);
      }
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GradeHorario[];
    },
  });
}

// Hook to create a new grade
export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: GradeFormData) => {
      const gradesToCreate = formData.dias_semana.map(dia => ({
        profissional_id: formData.profissional_id,
        especialidade_id: formData.especialidade_id,
        equipe_id: formData.equipe_id || null,
        sala_id: formData.sala_id || null,
        zona_id: formData.zona_id || null,
        dia_semana: dia,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        duracao_consulta: formData.duracao_consulta,
        vagas_totais: formData.vagas_totais,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim || null,
        turno: formData.turno || null,
        ativo: formData.ativo ?? true,
      }));

      const { data, error } = await supabase
        .from('grades_horarios')
        .insert(gradesToCreate)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-horarios'] });
      toast.success('Grade criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao criar grade: ' + error.message);
    },
  });
}

// Hook to update a grade
export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GradeFormData> }) => {
      const updateData: Record<string, unknown> = {};
      
      if (data.profissional_id) updateData.profissional_id = data.profissional_id;
      if (data.especialidade_id) updateData.especialidade_id = data.especialidade_id;
      if (data.equipe_id !== undefined) updateData.equipe_id = data.equipe_id;
      if (data.sala_id !== undefined) updateData.sala_id = data.sala_id;
      if (data.zona_id !== undefined) updateData.zona_id = data.zona_id;
      if (data.hora_inicio) updateData.hora_inicio = data.hora_inicio;
      if (data.hora_fim) updateData.hora_fim = data.hora_fim;
      if (data.duracao_consulta) updateData.duracao_consulta = data.duracao_consulta;
      if (data.vagas_totais) updateData.vagas_totais = data.vagas_totais;
      if (data.data_inicio) updateData.data_inicio = data.data_inicio;
      if (data.data_fim !== undefined) updateData.data_fim = data.data_fim;
      if (data.turno !== undefined) updateData.turno = data.turno;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;
      if (data.dias_semana && data.dias_semana.length === 1) {
        updateData.dia_semana = data.dias_semana[0];
      }

      const { data: result, error } = await supabase
        .from('grades_horarios')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-horarios'] });
      toast.success('Grade atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar grade: ' + error.message);
    },
  });
}

// Hook to delete a grade
export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('grades_horarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-horarios'] });
      toast.success('Grade excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao excluir grade: ' + error.message);
    },
  });
}

// Hook to toggle grade status
export function useToggleGradeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from('grades_horarios')
        .update({ ativo })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades-horarios'] });
      toast.success('Status da grade atualizado!');
    },
    onError: (error: Error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

// Hook to list professionals
export function useProfissionais() {
  return useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, registro_profissional, tipo_registro, especialidade:especialidades(id, nome)')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });
}

// Hook to list specialties
export function useEspecialidades() {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('especialidades')
        .select('id, nome, codigo, cor_hex')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });
}

// Hook to list rooms
export function useSalas() {
  return useQuery({
    queryKey: ['salas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salas')
        .select('id, numero, nome, andar, tipo')
        .eq('ativo', true)
        .order('numero');

      if (error) throw error;
      return data;
    },
  });
}

// Hook to list teams
export function useEquipes() {
  return useQuery({
    queryKey: ['equipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, descricao, especialidade:especialidades(id, nome)')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });
}

// Hook to list zones
export function useZonas() {
  return useQuery({
    queryKey: ['zonas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zonas')
        .select('id, nome, codigo, descricao')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      return data;
    },
  });
}

// Utility functions
export const DIAS_SEMANA = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda', short: 'Seg' },
  { value: 2, label: 'Terça', short: 'Ter' },
  { value: 3, label: 'Quarta', short: 'Qua' },
  { value: 4, label: 'Quinta', short: 'Qui' },
  { value: 5, label: 'Sexta', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

export const TURNOS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'integral', label: 'Integral' },
];

export function getDiaSemanaLabel(dia: number | null): string {
  if (dia === null) return '-';
  return DIAS_SEMANA.find(d => d.value === dia)?.label || '-';
}

export function getDiaSemanaShort(dia: number | null): string {
  if (dia === null) return '-';
  return DIAS_SEMANA.find(d => d.value === dia)?.short || '-';
}

export function getTurnoLabel(turno: string | null): string {
  if (!turno) return '-';
  return TURNOS.find(t => t.value === turno)?.label || turno;
}
