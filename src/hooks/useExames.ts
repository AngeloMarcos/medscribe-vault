import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ExameCatalogo {
  id: string;
  codigo: string;
  nome: string;
  categoria: string | null;
  tipo: string | null;
  preparo: string | null;
  prazo_resultado: string | null;
  requer_autorizacao: boolean;
  ativo: boolean;
}

export interface SolicitacaoExameItem {
  id?: string;
  exame_id?: string | null;
  exame_nome: string;
  observacao?: string | null;
  status?: string;
  data_realizacao?: string | null;
  resultado?: string | null;
}

export interface SolicitacaoExame {
  id: string;
  consulta_id: string | null;
  paciente_id: string;
  profissional_id: string | null;
  tenant_id: string | null;
  cid_justificativa: string | null;
  hipotese_diagnostica: string | null;
  urgencia: string;
  status: string;
  data_solicitacao: string;
  created_at: string;
  itens?: SolicitacaoExameItem[];
}

export interface CreateSolicitacaoExameData {
  consulta_id?: string;
  paciente_id: string;
  profissional_id?: string;
  tenant_id?: string;
  cid_justificativa?: string;
  hipotese_diagnostica?: string;
  urgencia?: string;
  itens: Omit<SolicitacaoExameItem, "id">[];
}

export function useExamesCatalogo(searchTerm: string = "") {
  return useQuery({
    queryKey: ["exames_catalogo", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("exames_catalogo")
        .select("*")
        .eq("ativo", true)
        .order("categoria")
        .order("nome");

      if (searchTerm.length >= 2) {
        query = query.or(
          `nome.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as ExameCatalogo[];
    },
    enabled: searchTerm.length === 0 || searchTerm.length >= 2,
  });
}

export function useSolicitacoesExames(pacienteId?: string, consultaId?: string) {
  return useQuery({
    queryKey: ["solicitacoes_exames", pacienteId, consultaId],
    queryFn: async () => {
      let query = supabase
        .from("solicitacoes_exames")
        .select(`
          *,
          solicitacao_exame_itens (*)
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
      return data as (SolicitacaoExame & { solicitacao_exame_itens: SolicitacaoExameItem[] })[];
    },
    enabled: !!pacienteId || !!consultaId,
  });
}

export function useCreateSolicitacaoExame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSolicitacaoExameData) => {
      // Create the request first
      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from("solicitacoes_exames")
        .insert({
          consulta_id: data.consulta_id,
          paciente_id: data.paciente_id,
          profissional_id: data.profissional_id,
          tenant_id: data.tenant_id,
          cid_justificativa: data.cid_justificativa,
          hipotese_diagnostica: data.hipotese_diagnostica,
          urgencia: data.urgencia || "normal",
        })
        .select()
        .single();

      if (solicitacaoError) throw solicitacaoError;

      // Then insert the items
      if (data.itens.length > 0) {
        const itensWithSolicitacaoId = data.itens.map((item) => ({
          ...item,
          solicitacao_id: solicitacao.id,
        }));

        const { error: itensError } = await supabase
          .from("solicitacao_exame_itens")
          .insert(itensWithSolicitacaoId);

        if (itensError) throw itensError;
      }

      return solicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solicitacoes_exames"] });
      toast({
        title: "Solicitação criada",
        description: "A solicitação de exames foi salva com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating solicitacao:", error);
      toast({
        title: "Erro ao criar solicitação",
        description: "Não foi possível salvar a solicitação de exames.",
        variant: "destructive",
      });
    },
  });
}
