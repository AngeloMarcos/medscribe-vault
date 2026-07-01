export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamento_procedimentos: {
        Row: {
          agendamento_id: string
          id: string
          ordem: number | null
          procedimento_id: string
        }
        Insert: {
          agendamento_id: string
          id?: string
          ordem?: number | null
          procedimento_id: string
        }
        Update: {
          agendamento_id?: string
          id?: string
          ordem?: number | null
          procedimento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_procedimentos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_odonto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_procedimentos_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "procedimentos_odonto"
            referencedColumns: ["id"]
          },
        ]
      }
      agendamentos_odonto: {
        Row: {
          cadeira: string | null
          created_at: string | null
          created_by: string | null
          data: string
          duracao_minutos: number | null
          hora_chegada: string | null
          hora_fim: string | null
          hora_inicio: string
          id: string
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          cadeira?: string | null
          created_at?: string | null
          created_by?: string | null
          data: string
          duracao_minutos?: number | null
          hora_chegada?: string | null
          hora_fim?: string | null
          hora_inicio: string
          id?: string
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          cadeira?: string | null
          created_at?: string | null
          created_by?: string | null
          data?: string
          duracao_minutos?: number | null
          hora_chegada?: string | null
          hora_fim?: string | null
          hora_inicio?: string
          id?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_odonto_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_odonto_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_odonto_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      anamneses: {
        Row: {
          created_at: string
          family_history: string | null
          hda: string | null
          id: string
          main_complaint: string | null
          patient_id: string
          personal_history: string | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          family_history?: string | null
          hda?: string | null
          id?: string
          main_complaint?: string | null
          patient_id: string
          personal_history?: string | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          family_history?: string | null
          hda?: string | null
          id?: string
          main_complaint?: string | null
          patient_id?: string
          personal_history?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamneses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          date_time: string
          description: string | null
          id: string
          patient_id: string
          status: string
          tenant_id: string | null
          type: string
        }
        Insert: {
          date_time: string
          description?: string | null
          id?: string
          patient_id: string
          status: string
          tenant_id?: string | null
          type: string
        }
        Update: {
          date_time?: string
          description?: string | null
          id?: string
          patient_id?: string
          status?: string
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimentos: {
        Row: {
          anamnese: string | null
          assinado: boolean | null
          atestado: string | null
          atestado_dias: number | null
          cid_principal: string | null
          cids_secundarios: string[] | null
          consulta_id: string
          created_at: string | null
          data_assinatura: string | null
          encaminhamentos: string | null
          evolucao: string | null
          id: string
          observacoes: string | null
          paciente_id: string
          prescricao: string | null
          procedimentos_realizados: Json | null
          profissional_id: string | null
          relatorio: string | null
          retorno_previsto: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          anamnese?: string | null
          assinado?: boolean | null
          atestado?: string | null
          atestado_dias?: number | null
          cid_principal?: string | null
          cids_secundarios?: string[] | null
          consulta_id: string
          created_at?: string | null
          data_assinatura?: string | null
          encaminhamentos?: string | null
          evolucao?: string | null
          id?: string
          observacoes?: string | null
          paciente_id: string
          prescricao?: string | null
          procedimentos_realizados?: Json | null
          profissional_id?: string | null
          relatorio?: string | null
          retorno_previsto?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          anamnese?: string | null
          assinado?: boolean | null
          atestado?: string | null
          atestado_dias?: number | null
          cid_principal?: string | null
          cids_secundarios?: string[] | null
          consulta_id?: string
          created_at?: string | null
          data_assinatura?: string | null
          encaminhamentos?: string | null
          evolucao?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string
          prescricao?: string | null
          procedimentos_realizados?: Json | null
          profissional_id?: string | null
          relatorio?: string | null
          retorno_previsto?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      atestados: {
        Row: {
          cid_codigo: string | null
          consulta_id: string | null
          created_at: string | null
          data_emissao: string | null
          data_fim: string
          data_inicio: string
          dias_afastamento: number
          id: string
          impresso: boolean | null
          motivo: string | null
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          tenant_id: string
        }
        Insert: {
          cid_codigo?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_fim: string
          data_inicio: string
          dias_afastamento: number
          id?: string
          impresso?: boolean | null
          motivo?: string | null
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          tenant_id: string
        }
        Update: {
          cid_codigo?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_emissao?: string | null
          data_fim?: string
          data_inicio?: string
          dias_afastamento?: number
          id?: string
          impresso?: boolean | null
          motivo?: string | null
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atestados_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atestados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atestados_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atestados_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cids: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string
          descricao: string
          id: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          descricao: string
          id?: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          descricao?: string
          id?: string
        }
        Relationships: []
      }
      consultas: {
        Row: {
          created_at: string | null
          data_consulta: string
          equipe_id: string | null
          especialidade_id: string | null
          faltou_paciente: boolean | null
          faltou_profissional: boolean | null
          grade_id: string | null
          hora_chegada: string | null
          hora_fim: string | null
          hora_fim_atendimento: string | null
          hora_inicio: string
          hora_inicio_atendimento: string | null
          id: string
          motivo_consulta: string | null
          numero_consulta: string
          observacoes: string | null
          paciente_id: string
          profissional_id: string | null
          sala_id: string | null
          status: string | null
          tenant_id: string
          tipo_consulta: string | null
          updated_at: string | null
          zona_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_consulta: string
          equipe_id?: string | null
          especialidade_id?: string | null
          faltou_paciente?: boolean | null
          faltou_profissional?: boolean | null
          grade_id?: string | null
          hora_chegada?: string | null
          hora_fim?: string | null
          hora_fim_atendimento?: string | null
          hora_inicio: string
          hora_inicio_atendimento?: string | null
          id?: string
          motivo_consulta?: string | null
          numero_consulta: string
          observacoes?: string | null
          paciente_id: string
          profissional_id?: string | null
          sala_id?: string | null
          status?: string | null
          tenant_id: string
          tipo_consulta?: string | null
          updated_at?: string | null
          zona_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_consulta?: string
          equipe_id?: string | null
          especialidade_id?: string | null
          faltou_paciente?: boolean | null
          faltou_profissional?: boolean | null
          grade_id?: string | null
          hora_chegada?: string | null
          hora_fim?: string | null
          hora_fim_atendimento?: string | null
          hora_inicio?: string
          hora_inicio_atendimento?: string | null
          id?: string
          motivo_consulta?: string | null
          numero_consulta?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_id?: string | null
          sala_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo_consulta?: string | null
          updated_at?: string | null
          zona_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultas_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_grade_id_fkey"
            columns: ["grade_id"]
            isOneToOne: false
            referencedRelation: "grades_horarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      encaminhamentos: {
        Row: {
          cid_principal: string | null
          consulta_id: string | null
          created_at: string | null
          data_encaminhamento: string | null
          especialidade_destino: string | null
          hipotese_diagnostica: string | null
          id: string
          justificativa: string
          observacoes: string | null
          paciente_id: string
          profissional_destino: string | null
          profissional_id: string | null
          status: string
          tenant_id: string
          tipo: string
          transporte: string | null
          unidade_destino: string | null
          updated_at: string | null
          urgencia: string
        }
        Insert: {
          cid_principal?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_encaminhamento?: string | null
          especialidade_destino?: string | null
          hipotese_diagnostica?: string | null
          id?: string
          justificativa: string
          observacoes?: string | null
          paciente_id: string
          profissional_destino?: string | null
          profissional_id?: string | null
          status?: string
          tenant_id: string
          tipo: string
          transporte?: string | null
          unidade_destino?: string | null
          updated_at?: string | null
          urgencia?: string
        }
        Update: {
          cid_principal?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_encaminhamento?: string | null
          especialidade_destino?: string | null
          hipotese_diagnostica?: string | null
          id?: string
          justificativa?: string
          observacoes?: string | null
          paciente_id?: string
          profissional_destino?: string | null
          profissional_id?: string | null
          status?: string
          tenant_id?: string
          tipo?: string
          transporte?: string | null
          unidade_destino?: string | null
          updated_at?: string | null
          urgencia?: string
        }
        Relationships: [
          {
            foreignKeyName: "encaminhamentos_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encaminhamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      equipes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          especialidade_id: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          especialidade_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          especialidade_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipes_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          ativo: boolean | null
          codigo: string
          cor_hex: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          cor_hex?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          cor_hex?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      estornos_consultas: {
        Row: {
          consulta_id: string
          created_at: string | null
          data_estorno: string | null
          id: string
          motivo: string
          status_anterior: string | null
          tenant_id: string
          usuario_id: string | null
        }
        Insert: {
          consulta_id: string
          created_at?: string | null
          data_estorno?: string | null
          id?: string
          motivo: string
          status_anterior?: string | null
          tenant_id: string
          usuario_id?: string | null
        }
        Update: {
          consulta_id?: string
          created_at?: string | null
          data_estorno?: string | null
          id?: string
          motivo?: string
          status_anterior?: string | null
          tenant_id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "estornos_consultas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estornos_consultas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      evolucoes_odonto: {
        Row: {
          agendamento_id: string | null
          created_at: string | null
          evolucao: string | null
          id: string
          paciente_id: string
          procedimentos_realizados: Json | null
          profissional_id: string | null
          queixa_principal: string | null
          tenant_id: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string | null
          evolucao?: string | null
          id?: string
          paciente_id: string
          procedimentos_realizados?: Json | null
          profissional_id?: string | null
          queixa_principal?: string | null
          tenant_id: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string | null
          evolucao?: string | null
          id?: string
          paciente_id?: string
          procedimentos_realizados?: Json | null
          profissional_id?: string | null
          queixa_principal?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolucoes_odonto_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos_odonto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_odonto_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_odonto_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolucoes_odonto_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      evolutions: {
        Row: {
          date: string
          id: string
          patient_id: string
          plan: string | null
          professional: string | null
          tenant_id: string | null
          text: string | null
        }
        Insert: {
          date: string
          id?: string
          patient_id: string
          plan?: string | null
          professional?: string | null
          tenant_id?: string | null
          text?: string | null
        }
        Update: {
          date?: string
          id?: string
          patient_id?: string
          plan?: string | null
          professional?: string | null
          tenant_id?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolutions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolutions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_requests: {
        Row: {
          created_at: string
          exams_list: string
          id: string
          justification: string | null
          patient_id: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string
          exams_list: string
          id?: string
          justification?: string | null
          patient_id: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string
          exams_list?: string
          id?: string
          justification?: string | null
          patient_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      exames_catalogo: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string
          created_at: string | null
          id: string
          nome: string
          prazo_resultado: string | null
          preparo: string | null
          requer_autorizacao: boolean | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          created_at?: string | null
          id?: string
          nome: string
          prazo_resultado?: string | null
          preparo?: string | null
          requer_autorizacao?: boolean | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          created_at?: string | null
          id?: string
          nome?: string
          prazo_resultado?: string | null
          preparo?: string | null
          requer_autorizacao?: boolean | null
          tipo?: string | null
        }
        Relationships: []
      }
      grades_horarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          dia_semana: number | null
          duracao_consulta: number | null
          equipe_id: string | null
          especialidade_id: string
          hora_fim: string
          hora_inicio: string
          id: string
          profissional_id: string
          sala_id: string | null
          turno: string | null
          vagas_totais: number | null
          zona_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          dia_semana?: number | null
          duracao_consulta?: number | null
          equipe_id?: string | null
          especialidade_id: string
          hora_fim: string
          hora_inicio: string
          id?: string
          profissional_id: string
          sala_id?: string | null
          turno?: string | null
          vagas_totais?: number | null
          zona_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_semana?: number | null
          duracao_consulta?: number | null
          equipe_id?: string | null
          especialidade_id?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          profissional_id?: string
          sala_id?: string | null
          turno?: string | null
          vagas_totais?: number | null
          zona_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_horarios_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_horarios_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_horarios_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_horarios_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_horarios_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "zonas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_plano_tratamento: {
        Row: {
          created_at: string | null
          data_realizacao: string | null
          dente: number | null
          desconto_percentual: number | null
          id: string
          observacoes: string | null
          ordem_prioridade: number | null
          plano_id: string
          procedimento_id: string
          profissional_id: string | null
          status: string | null
          superficie: string | null
          tenant_id: string | null
          updated_at: string | null
          urgencia: string | null
          valor_final: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          data_realizacao?: string | null
          dente?: number | null
          desconto_percentual?: number | null
          id?: string
          observacoes?: string | null
          ordem_prioridade?: number | null
          plano_id: string
          procedimento_id: string
          profissional_id?: string | null
          status?: string | null
          superficie?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_final: number
          valor_unitario: number
        }
        Update: {
          created_at?: string | null
          data_realizacao?: string | null
          dente?: number | null
          desconto_percentual?: number | null
          id?: string
          observacoes?: string | null
          ordem_prioridade?: number | null
          plano_id?: string
          procedimento_id?: string
          profissional_id?: string | null
          status?: string | null
          superficie?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          urgencia?: string | null
          valor_final?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_plano_tratamento_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos_tratamento_odonto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_plano_tratamento_procedimento_id_fkey"
            columns: ["procedimento_id"]
            isOneToOne: false
            referencedRelation: "procedimentos_odonto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_plano_tratamento_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_plano_tratamento_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      medicamentos_remume: {
        Row: {
          apresentacao: string
          ativo: boolean | null
          categoria: string | null
          codigo: string
          concentracao: string | null
          controlado: boolean | null
          created_at: string | null
          forma_farmaceutica: string | null
          id: string
          nome_comercial: string | null
          nome_generico: string
          tipo_receita: string | null
          unidade_medida: string | null
          via_padrao: string | null
        }
        Insert: {
          apresentacao: string
          ativo?: boolean | null
          categoria?: string | null
          codigo: string
          concentracao?: string | null
          controlado?: boolean | null
          created_at?: string | null
          forma_farmaceutica?: string | null
          id?: string
          nome_comercial?: string | null
          nome_generico: string
          tipo_receita?: string | null
          unidade_medida?: string | null
          via_padrao?: string | null
        }
        Update: {
          apresentacao?: string
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string
          concentracao?: string | null
          controlado?: boolean | null
          created_at?: string | null
          forma_farmaceutica?: string | null
          id?: string
          nome_comercial?: string | null
          nome_generico?: string
          tipo_receita?: string | null
          unidade_medida?: string | null
          via_padrao?: string | null
        }
        Relationships: []
      }
      medication_administrations: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          created_at: string | null
          id: string
          observation: string | null
          patient_id: string
          prescription_item_id: string
          scheduled_time: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string | null
          id?: string
          observation?: string | null
          patient_id: string
          prescription_item_id: string
          scheduled_time: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          created_at?: string | null
          id?: string
          observation?: string | null
          patient_id?: string
          prescription_item_id?: string
          scheduled_time?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_administrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_prescription_item_id_fkey"
            columns: ["prescription_item_id"]
            isOneToOne: false
            referencedRelation: "prescription_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_notes: {
        Row: {
          consulta_id: string | null
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_critical: boolean | null
          note_type: string | null
          patient_id: string
          tenant_id: string
        }
        Insert: {
          consulta_id?: string | null
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_critical?: boolean | null
          note_type?: string | null
          patient_id: string
          tenant_id: string
        }
        Update: {
          consulta_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_critical?: boolean | null
          note_type?: string | null
          patient_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_notes_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_queue: {
        Row: {
          attended_by: string | null
          completed_at: string | null
          consulta_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          patient_id: string
          priority: string | null
          referred_from: string | null
          sector: string
          started_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          attended_by?: string | null
          completed_at?: string | null
          consulta_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          priority?: string | null
          referred_from?: string | null
          sector: string
          started_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          attended_by?: string | null
          completed_at?: string | null
          consulta_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          priority?: string | null
          referred_from?: string | null
          sector?: string
          started_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nursing_queue_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_queue_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_queue_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      odontograma_historico: {
        Row: {
          acao: string
          condicao: string
          created_at: string | null
          created_by: string | null
          dente: number
          id: string
          observacao: string | null
          odontograma_id: string
          patient_id: string
          profissional_id: string | null
          superficie: string | null
          tenant_id: string
        }
        Insert: {
          acao: string
          condicao: string
          created_at?: string | null
          created_by?: string | null
          dente: number
          id?: string
          observacao?: string | null
          odontograma_id: string
          patient_id: string
          profissional_id?: string | null
          superficie?: string | null
          tenant_id: string
        }
        Update: {
          acao?: string
          condicao?: string
          created_at?: string | null
          created_by?: string | null
          dente?: number
          id?: string
          observacao?: string | null
          odontograma_id?: string
          patient_id?: string
          profissional_id?: string | null
          superficie?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "odontograma_historico_odontograma_id_fkey"
            columns: ["odontograma_id"]
            isOneToOne: false
            referencedRelation: "odontogramas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontograma_historico_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontograma_historico_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontograma_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      odontogramas: {
        Row: {
          created_at: string | null
          dados: Json
          id: string
          observacoes: string | null
          patient_id: string
          profissional_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dados?: Json
          id?: string
          observacoes?: string | null
          patient_id: string
          profissional_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dados?: Json
          id?: string
          observacoes?: string | null
          patient_id?: string
          profissional_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "odontogramas_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogramas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odontogramas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          birth_date: string | null
          cpf: string
          created_at: string
          id: string
          insurance: string | null
          medical_record_number: string | null
          name: string
          phone: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          cpf: string
          created_at?: string
          id?: string
          insurance?: string | null
          medical_record_number?: string | null
          name: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          cpf?: string
          created_at?: string
          id?: string
          insurance?: string | null
          medical_record_number?: string | null
          name?: string
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_tratamento_odonto: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_inicio: string
          data_previsao_fim: string | null
          id: string
          observacoes_gerais: string | null
          patient_id: string
          profissional_id: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string
          data_previsao_fim?: string | null
          id?: string
          observacoes_gerais?: string | null
          patient_id: string
          profissional_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_inicio?: string
          data_previsao_fim?: string | null
          id?: string
          observacoes_gerais?: string | null
          patient_id?: string
          profissional_id?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_tratamento_odonto_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_tratamento_odonto_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planos_tratamento_odonto_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          is_high_risk: boolean | null
          item_details: Json | null
          item_type: string
          observation: string | null
          prescription_id: string
          sequence_order: number
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          is_high_risk?: boolean | null
          item_details?: Json | null
          item_type: string
          observation?: string | null
          prescription_id: string
          sequence_order?: number
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          is_high_risk?: boolean | null
          item_details?: Json | null
          item_type?: string
          observation?: string | null
          prescription_id?: string
          sequence_order?: number
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          created_by: string | null
          expected_discharge_date: string | null
          id: string
          is_pediatric: boolean | null
          patient_id: string
          prescription_date: string
          status: string | null
          tenant_id: string
          updated_at: string | null
          validity_end: string
          validity_start: string
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_discharge_date?: string | null
          id?: string
          is_pediatric?: boolean | null
          patient_id: string
          prescription_date?: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          validity_end?: string
          validity_start?: string
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_discharge_date?: string | null
          id?: string
          is_pediatric?: boolean | null
          patient_id?: string
          prescription_date?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          validity_end?: string
          validity_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      procedimentos_odonto: {
        Row: {
          ativo: boolean | null
          categoria: string
          codigo: string
          created_at: string | null
          descricao: string | null
          duracao_minutos: number | null
          id: string
          nome: string
          preco_padrao: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria: string
          codigo: string
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          nome: string
          preco_padrao?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: string
          nome?: string
          preco_padrao?: number | null
        }
        Relationships: []
      }
      procedures: {
        Row: {
          date_time: string
          description: string
          id: string
          notes: string | null
          patient_id: string
          professional: string | null
          tenant_id: string | null
        }
        Insert: {
          date_time: string
          description: string
          id?: string
          notes?: string | null
          patient_id: string
          professional?: string | null
          tenant_id?: string | null
        }
        Update: {
          date_time?: string
          description?: string
          id?: string
          notes?: string | null
          patient_id?: string
          professional?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procedures_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procedures_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          phone?: string | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          assinatura_digital: string | null
          ativo: boolean | null
          cpf: string
          created_at: string | null
          email: string | null
          equipe_id: string | null
          especialidade_id: string | null
          id: string
          nome: string
          registro_profissional: string
          telefone: string | null
          tipo_registro: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assinatura_digital?: string | null
          ativo?: boolean | null
          cpf: string
          created_at?: string | null
          email?: string | null
          equipe_id?: string | null
          especialidade_id?: string | null
          id?: string
          nome: string
          registro_profissional: string
          telefone?: string | null
          tipo_registro: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assinatura_digital?: string | null
          ativo?: boolean | null
          cpf?: string
          created_at?: string | null
          email?: string | null
          equipe_id?: string | null
          especialidade_id?: string | null
          id?: string
          nome?: string
          registro_profissional?: string
          telefone?: string | null
          tipo_registro?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissionais_equipe_id_fkey"
            columns: ["equipe_id"]
            isOneToOne: false
            referencedRelation: "equipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissionais_especialidade_id_fkey"
            columns: ["especialidade_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_call_history: {
        Row: {
          called_at: string | null
          guiche: string
          id: string
          tenant_id: string | null
          ticket_id: string | null
          ticket_number: string
        }
        Insert: {
          called_at?: string | null
          guiche: string
          id?: string
          tenant_id?: string | null
          ticket_id?: string | null
          ticket_number: string
        }
        Update: {
          called_at?: string | null
          guiche?: string
          id?: string
          tenant_id?: string | null
          ticket_id?: string | null
          ticket_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_call_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_call_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "queue_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_tickets: {
        Row: {
          called_at: string | null
          called_by: string | null
          completed_at: string | null
          created_at: string | null
          guiche: string | null
          id: string
          patient_id: string | null
          patient_name: string | null
          sector: string
          status: string
          tenant_id: string | null
          ticket_number: string
          ticket_type: string
        }
        Insert: {
          called_at?: string | null
          called_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          guiche?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string | null
          sector?: string
          status?: string
          tenant_id?: string | null
          ticket_number: string
          ticket_type?: string
        }
        Update: {
          called_at?: string | null
          called_by?: string | null
          completed_at?: string | null
          created_at?: string | null
          guiche?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string | null
          sector?: string
          status?: string
          tenant_id?: string | null
          ticket_number?: string
          ticket_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_tickets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      receita_itens: {
        Row: {
          created_at: string | null
          dose: string
          duracao_dias: number | null
          duracao_texto: string | null
          frequencia: string
          id: string
          medicamento_id: string | null
          medicamento_nome: string
          ordem: number | null
          orientacoes: string | null
          quantidade_total: number | null
          receita_id: string
          unidade: string
          via: string
        }
        Insert: {
          created_at?: string | null
          dose: string
          duracao_dias?: number | null
          duracao_texto?: string | null
          frequencia: string
          id?: string
          medicamento_id?: string | null
          medicamento_nome: string
          ordem?: number | null
          orientacoes?: string | null
          quantidade_total?: number | null
          receita_id: string
          unidade: string
          via: string
        }
        Update: {
          created_at?: string | null
          dose?: string
          duracao_dias?: number | null
          duracao_texto?: string | null
          frequencia?: string
          id?: string
          medicamento_id?: string | null
          medicamento_nome?: string
          ordem?: number | null
          orientacoes?: string | null
          quantidade_total?: number | null
          receita_id?: string
          unidade?: string
          via?: string
        }
        Relationships: [
          {
            foreignKeyName: "receita_itens_medicamento_id_fkey"
            columns: ["medicamento_id"]
            isOneToOne: false
            referencedRelation: "medicamentos_remume"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_itens_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          consulta_id: string | null
          created_at: string | null
          data_emissao: string | null
          id: string
          paciente_id: string
          profissional_id: string | null
          status: string | null
          tenant_id: string
          tipo: string | null
        }
        Insert: {
          consulta_id?: string | null
          created_at?: string | null
          data_emissao?: string | null
          id?: string
          paciente_id: string
          profissional_id?: string | null
          status?: string | null
          tenant_id: string
          tipo?: string | null
        }
        Update: {
          consulta_id?: string | null
          created_at?: string | null
          data_emissao?: string | null
          id?: string
          paciente_id?: string
          profissional_id?: string | null
          status?: string | null
          tenant_id?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receitas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          tenant_id: string | null
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          tenant_id?: string | null
          text: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          tenant_id?: string | null
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      salas: {
        Row: {
          andar: string | null
          ativo: boolean | null
          capacidade: number | null
          created_at: string | null
          equipamentos: string[] | null
          id: string
          nome: string | null
          numero: string
          tipo: string | null
        }
        Insert: {
          andar?: string | null
          ativo?: boolean | null
          capacidade?: number | null
          created_at?: string | null
          equipamentos?: string[] | null
          id?: string
          nome?: string | null
          numero: string
          tipo?: string | null
        }
        Update: {
          andar?: string | null
          ativo?: boolean | null
          capacidade?: number | null
          created_at?: string | null
          equipamentos?: string[] | null
          id?: string
          nome?: string | null
          numero?: string
          tipo?: string | null
        }
        Relationships: []
      }
      solicitacao_exame_itens: {
        Row: {
          created_at: string | null
          data_realizacao: string | null
          exame_id: string | null
          exame_nome: string
          id: string
          observacao: string | null
          resultado: string | null
          solicitacao_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          data_realizacao?: string | null
          exame_id?: string | null
          exame_nome: string
          id?: string
          observacao?: string | null
          resultado?: string | null
          solicitacao_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          data_realizacao?: string | null
          exame_id?: string | null
          exame_nome?: string
          id?: string
          observacao?: string | null
          resultado?: string | null
          solicitacao_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacao_exame_itens_exame_id_fkey"
            columns: ["exame_id"]
            isOneToOne: false
            referencedRelation: "exames_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacao_exame_itens_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_exames"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes_exames: {
        Row: {
          cid_justificativa: string | null
          consulta_id: string | null
          created_at: string | null
          data_solicitacao: string | null
          hipotese_diagnostica: string | null
          id: string
          paciente_id: string
          profissional_id: string | null
          status: string | null
          tenant_id: string
          urgencia: string | null
        }
        Insert: {
          cid_justificativa?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_solicitacao?: string | null
          hipotese_diagnostica?: string | null
          id?: string
          paciente_id: string
          profissional_id?: string | null
          status?: string | null
          tenant_id: string
          urgencia?: string | null
        }
        Update: {
          cid_justificativa?: string | null
          consulta_id?: string | null
          created_at?: string | null
          data_solicitacao?: string | null
          hipotese_diagnostica?: string | null
          id?: string
          paciente_id?: string
          profissional_id?: string | null
          status?: string | null
          tenant_id?: string
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_exames_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_exames_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_exames_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitacoes_exames_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_audit_log: {
        Row: {
          action: string
          after_value: Json | null
          before_value: Json | null
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          target_user_id: string | null
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          tenant_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          target_user_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_modules: {
        Row: {
          config: Json | null
          created_at: string | null
          disabled_at: string | null
          enabled_at: string | null
          id: string
          is_enabled: boolean | null
          module_key: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_key: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          disabled_at?: string | null
          enabled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          module_key?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_modules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_user_permissions: {
        Row: {
          created_at: string | null
          denied_permissions: string[] | null
          granted_by: string | null
          granted_permissions: string[] | null
          id: string
          notes: string | null
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          denied_permissions?: string[] | null
          granted_by?: string | null
          granted_permissions?: string[] | null
          id?: string
          notes?: string | null
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          denied_permissions?: string[] | null
          granted_by?: string | null
          granted_permissions?: string[] | null
          id?: string
          notes?: string | null
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_permissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_owner: boolean | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          theme: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          theme?: Json | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          theme?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource: string | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          blood_pressure: string | null
          created_at: string
          heart_rate: string | null
          id: string
          o2_sat: string | null
          patient_id: string
          respiratory_rate: string | null
          temperature: string | null
          tenant_id: string | null
        }
        Insert: {
          blood_pressure?: string | null
          created_at?: string
          heart_rate?: string | null
          id?: string
          o2_sat?: string | null
          patient_id: string
          respiratory_rate?: string | null
          temperature?: string | null
          tenant_id?: string | null
        }
        Update: {
          blood_pressure?: string | null
          created_at?: string
          heart_rate?: string | null
          id?: string
          o2_sat?: string | null
          patient_id?: string
          respiratory_rate?: string | null
          temperature?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vitals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      zonas: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profissional_full: {
        Args: { _id: string }
        Returns: {
          ativo: boolean
          cpf: string
          created_at: string
          email: string
          equipe_id: string
          especialidade_id: string
          id: string
          nome: string
          registro_profissional: string
          telefone: string
          tipo_registro: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_effective_permissions: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: string[]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_medical_role: { Args: { _user_id: string }; Returns: boolean }
      has_nursing_role: { Args: { _user_id: string }; Returns: boolean }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_tenant_permission: {
        Args: { _permission: string; _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_tenant_owner: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      user_belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "medico"
        | "enfermeiro"
        | "recepcao"
        | "farmaceutico"
        | "tecnico_enfermagem"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "medico",
        "enfermeiro",
        "recepcao",
        "farmaceutico",
        "tecnico_enfermagem",
      ],
    },
  },
} as const
