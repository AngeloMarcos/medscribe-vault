import { toast } from "sonner";

/**
 * Mensagens padronizadas de toast para o módulo de prescrição
 * Centraliza todas as mensagens de feedback do sistema
 */
export const prescriptionToasts = {
  // Item actions
  itemAdded: () => toast.success("Item adicionado à prescrição"),
  itemUpdated: () => toast.success("Item atualizado"),
  itemRemoved: () => toast.success("Item removido da prescrição"),
  itemCopied: () => toast.success("Item duplicado"),
  itemSuspended: (isSuspended: boolean) => 
    toast.success(isSuspended ? "Item suspenso" : "Item reativado"),
  
  // Prescription actions
  prescriptionCreated: () => toast.success("Prescrição criada com sucesso"),
  prescriptionSaved: () => toast.success("Prescrição salva como pendente"),
  prescriptionConfirmed: () => toast.success("Prescrição confirmada e disponível para enfermagem"),
  prescriptionCancelled: () => toast.info("Prescrição cancelada"),
  
  // Loading errors
  errorLoading: (entity = "dados") => 
    toast.error(`Erro ao carregar ${entity}. Tente novamente.`),
  errorSaving: () => toast.error("Erro ao salvar prescrição. Tente novamente."),
  errorDeleting: () => toast.error("Erro ao excluir item. Tente novamente."),
  
  // Validation errors
  validationError: (message: string) => toast.error(message),
  requiredField: (fieldName: string) => 
    toast.error(`Campo obrigatório: ${fieldName}`),
  
  // Allergy warnings
  allergyWarning: (allergens: string[]) => 
    toast.warning(`Atenção: Possível alergia a ${allergens.join(", ")}`),
  
  // High-risk warnings
  highRiskWarning: () => 
    toast.warning("Este medicamento é classificado como alto risco"),
  
  // General
  operationSuccess: (message: string) => toast.success(message),
  operationError: (message: string) => toast.error(message),
  operationInfo: (message: string) => toast.info(message),
};

/**
 * Mensagens gerais do sistema
 */
export const systemToasts = {
  sessionExpired: () => toast.error("Sua sessão expirou. Faça login novamente."),
  networkError: () => toast.error("Erro de conexão. Verifique sua internet."),
  permissionDenied: () => toast.error("Você não tem permissão para esta ação."),
  saveSuccess: () => toast.success("Alterações salvas com sucesso"),
  deleteSuccess: () => toast.success("Registro excluído com sucesso"),
};
