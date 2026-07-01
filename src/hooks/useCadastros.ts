import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Profissional {
  id: string;
  nome: string;
  cpf?: string | null;
  registro_profissional: string;
  tipo_registro: string;
  telefone?: string | null;
  email?: string | null;
  especialidade_id: string | null;
  equipe_id: string | null;
  ativo: boolean;
  user_id?: string | null;
  especialidade?: { nome: string } | null;
}

export interface Especialidade {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  cor_hex: string | null;
  ativo: boolean;
}

export interface Sala {
  id: string;
  numero: string;
  nome: string | null;
  andar: string | null;
  tipo: string | null;
  capacidade: number;
  equipamentos: string[] | null;
  ativo: boolean;
}

export interface Equipe {
  id: string;
  nome: string;
  descricao: string | null;
  especialidade_id: string | null;
  ativo: boolean;
  especialidade?: { nome: string } | null;
}

export interface Zona {
  id: string;
  nome: string;
  codigo: string;
  descricao: string | null;
  ativo: boolean;
}

// Profissionais
export function useProfissionais() {
  return useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*, especialidade:especialidades(nome)')
        .order('nome');
      if (error) throw error;
      return data as Profissional[];
    },
  });
}

export function useCreateProfissional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Profissional, 'id' | 'especialidade'> & { cpf: string }) => {
      const { error } = await supabase.from('profissionais').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profissional criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateProfissional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, especialidade: _e, ...data }: Partial<Profissional> & { id: string }) => {
      const { error } = await supabase.from('profissionais').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profissional atualizado!');
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteProfissional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profissionais').update({ ativo: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profissional desativado!');
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Especialidades
export function useEspecialidades() {
  return useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('especialidades')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Especialidade[];
    },
  });
}

export function useCreateEspecialidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Especialidade, 'id'>) => {
      const { error } = await supabase.from('especialidades').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Especialidade criada!');
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateEspecialidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Especialidade> & { id: string }) => {
      const { error } = await supabase.from('especialidades').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Especialidade atualizada!');
      queryClient.invalidateQueries({ queryKey: ['especialidades'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Salas
export function useSalas() {
  return useQuery({
    queryKey: ['salas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .order('numero');
      if (error) throw error;
      return data as Sala[];
    },
  });
}

export function useCreateSala() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Sala, 'id'>) => {
      const { error } = await supabase.from('salas').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sala criada!');
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateSala() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Sala> & { id: string }) => {
      const { error } = await supabase.from('salas').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sala atualizada!');
      queryClient.invalidateQueries({ queryKey: ['salas'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Equipes
export function useEquipes() {
  return useQuery({
    queryKey: ['equipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipes')
        .select('*, especialidade:especialidades(nome)')
        .order('nome');
      if (error) throw error;
      return data as Equipe[];
    },
  });
}

export function useCreateEquipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Equipe, 'id' | 'especialidade'>) => {
      const { error } = await supabase.from('equipes').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Equipe criada!');
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateEquipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, especialidade: _e, ...data }: Partial<Equipe> & { id: string }) => {
      const { error } = await supabase.from('equipes').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Equipe atualizada!');
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

// Zonas
export function useZonas() {
  return useQuery({
    queryKey: ['zonas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zonas')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Zona[];
    },
  });
}

export function useCreateZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Zona, 'id'>) => {
      const { error } = await supabase.from('zonas').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Zona criada!');
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateZona() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Zona> & { id: string }) => {
      const { error } = await supabase.from('zonas').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Zona atualizada!');
      queryClient.invalidateQueries({ queryKey: ['zonas'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
