import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Atestado {
  id: string;
  consulta_id: string | null;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  data_emissao: string;
  data_inicio: string;
  data_fim: string;
  dias_afastamento: number;
  cid_codigo: string | null;
  motivo: string | null;
  observacoes: string | null;
  impresso: boolean;
  created_at: string;
}

export interface CreateAtestadoData {
  consulta_id?: string;
  paciente_id: string;
  profissional_id?: string;
  tenant_id?: string;
  data_inicio: string;
  data_fim: string;
  dias_afastamento: number;
  cid_codigo?: string;
  motivo?: string;
  observacoes?: string;
}

export function useAtestados(pacienteId?: string, consultaId?: string) {
  return useQuery({
    queryKey: ["atestados", pacienteId, consultaId],
    queryFn: async () => {
      let query = supabase
        .from("atestados")
        .select("*")
        .order("created_at", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }
      if (consultaId) {
        query = query.eq("consulta_id", consultaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Atestado[];
    },
    enabled: !!pacienteId || !!consultaId,
  });
}

export function useCreateAtestado() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAtestadoData) => {
      const { data: atestado, error } = await supabase
        .from("atestados")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return atestado as Atestado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atestados"] });
      toast({
        title: "Atestado criado",
        description: "O atestado foi salvo com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating atestado:", error);
      toast({
        title: "Erro ao criar atestado",
        description: "Não foi possível salvar o atestado.",
        variant: "destructive",
      });
    },
  });
}
