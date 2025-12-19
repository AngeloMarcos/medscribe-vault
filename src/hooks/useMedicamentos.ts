import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Medicamento {
  id: string;
  codigo: string;
  nome_generico: string;
  nome_comercial: string | null;
  apresentacao: string;
  forma_farmaceutica: string | null;
  concentracao: string | null;
  unidade_medida: string | null;
  via_padrao: string | null;
  categoria: string | null;
  controlado: boolean;
  tipo_receita: string;
  ativo: boolean;
}

export function useMedicamentos(searchTerm: string = "") {
  return useQuery({
    queryKey: ["medicamentos_remume", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("medicamentos_remume")
        .select("*")
        .eq("ativo", true)
        .order("nome_generico");

      if (searchTerm.length >= 2) {
        query = query.or(
          `nome_generico.ilike.%${searchTerm}%,nome_comercial.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data as Medicamento[];
    },
    enabled: searchTerm.length === 0 || searchTerm.length >= 2,
  });
}

export function useMedicamentoById(id: string | null) {
  return useQuery({
    queryKey: ["medicamento", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("medicamentos_remume")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Medicamento;
    },
    enabled: !!id,
  });
}
