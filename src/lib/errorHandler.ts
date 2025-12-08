/**
 * Maps database/API errors to user-friendly messages
 * Prevents exposure of internal implementation details
 */
export const getUserFriendlyError = (error: any): string => {
  // Handle Supabase/Postgres error codes
  if (error?.code) {
    switch (error.code) {
      case '23505':
        return 'Este registro já existe no sistema.';
      case '23503':
        return 'Não é possível realizar esta ação. Verifique os dados relacionados.';
      case '23502':
        return 'Campos obrigatórios não foram preenchidos.';
      case '42501':
        return 'Você não tem permissão para realizar esta ação.';
      case '42P01':
        return 'Recurso não encontrado.';
      case 'PGRST301':
        return 'Dados não encontrados.';
      case 'PGRST116':
        return 'Nenhum resultado encontrado.';
      default:
        break;
    }
  }

  // Handle Supabase Auth errors
  if (error?.message) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid login credentials')) {
      return 'Email ou senha inválidos.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    }
    if (msg.includes('user already registered')) {
      return 'Este email já está cadastrado.';
    }
    if (msg.includes('password')) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (msg.includes('rate limit')) {
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return 'Erro de conexão. Verifique sua internet.';
    }
  }

  // Default generic error
  return 'Ocorreu um erro. Tente novamente.';
};
