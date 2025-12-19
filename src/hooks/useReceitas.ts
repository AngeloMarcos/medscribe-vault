import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReceitaItem {
  id?: string;
  medicamento_id?: string | null;
  medicamento_nome: string;
  dose: string;
  unidade: string;
  via: string;
  frequencia: string;
  duracao_dias?: number | null;
  duracao_texto?: string | null;
  quantidade_total?: number | null;
  orientacoes?: string | null;
  ordem: number;
}

export interface Receita {
  id: string;
  consulta_id: string | null;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  tipo: string;
  status: string;
  data_emissao: string;
  created_at: string;
  itens?: ReceitaItem[];
}

export interface CreateReceitaData {
  consulta_id?: string;
  paciente_id: string;
  profissional_id?: string;
  tenant_id?: string;
  tipo?: string;
  itens: Omit<ReceitaItem, "id">[];
}

export function useReceitas(pacienteId?: string, consultaId?: string) {
  return useQuery({
    queryKey: ["receitas", pacienteId, consultaId],
    queryFn: async () => {
      let query = supabase
        .from("receitas")
        .select(`
          *,
          receita_itens (*)
        `)
        .order("created_at", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }
      if (consultaId) {
        query = query.eq("consulta_id", consultaId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Receita & { receita_itens: ReceitaItem[] })[];
    },
    enabled: !!pacienteId || !!consultaId,
  });
}

export function useCreateReceita() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateReceitaData) => {
      // Create the prescription first
      const { data: receita, error: receitaError } = await supabase
        .from("receitas")
        .insert({
          consulta_id: data.consulta_id,
          paciente_id: data.paciente_id,
          profissional_id: data.profissional_id,
          tenant_id: data.tenant_id,
          tipo: data.tipo || "simples",
        })
        .select()
        .single();

      if (receitaError) throw receitaError;

      // Then insert the items
      if (data.itens.length > 0) {
        const itensWithReceitaId = data.itens.map((item, index) => ({
          ...item,
          receita_id: receita.id,
          ordem: index,
        }));

        const { error: itensError } = await supabase
          .from("receita_itens")
          .insert(itensWithReceitaId);

        if (itensError) throw itensError;
      }

      return receita;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receitas"] });
      toast({
        title: "Receita criada",
        description: "A receita foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating receita:", error);
      toast({
        title: "Erro ao criar receita",
        description: "Não foi possível salvar a receita.",
        variant: "destructive",
      });
    },
  });
}
