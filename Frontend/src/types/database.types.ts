/**
 * Tipos gerados automaticamente do schema do Supabase
 *
 * IMPORTANTE: Este arquivo deve ser regenerado apos alteracoes no schema.
 *
 * Comando para regenerar:
 *   npx supabase gen types typescript --local > src/types/database.types.ts
 *
 * Este arquivo placeholder sera substituido pelo comando acima.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      minutas: {
        Row: {
          id: string
          user_id: string
          titulo: string
          tipo_ato: string
          status: Database['public']['Enums']['status_minuta']
          dados_estruturados: Json | null
          texto_final: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          tipo_ato: string
          status?: Database['public']['Enums']['status_minuta']
          dados_estruturados?: Json | null
          texto_final?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          tipo_ato?: string
          status?: Database['public']['Enums']['status_minuta']
          dados_estruturados?: Json | null
          texto_final?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          id: string
          minuta_id: string
          nome_arquivo: string
          storage_path: string
          tipo_documento: Database['public']['Enums']['tipo_documento'] | null
          status: Database['public']['Enums']['status_documento']
          dados_extraidos: Json | null
          confianca_classificacao: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          minuta_id: string
          nome_arquivo: string
          storage_path: string
          tipo_documento?: Database['public']['Enums']['tipo_documento'] | null
          status?: Database['public']['Enums']['status_documento']
          dados_extraidos?: Json | null
          confianca_classificacao?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string
          nome_arquivo?: string
          storage_path?: string
          tipo_documento?: Database['public']['Enums']['tipo_documento'] | null
          status?: Database['public']['Enums']['status_documento']
          dados_extraidos?: Json | null
          confianca_classificacao?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          }
        ]
      }
      pessoas_naturais: {
        Row: {
          id: string
          minuta_id: string
          documento_origem_id: string | null
          nome_completo: string
          cpf: string | null
          rg: string | null
          nacionalidade: string | null
          estado_civil: string | null
          profissao: string | null
          endereco: Json | null
          papel: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          minuta_id: string
          documento_origem_id?: string | null
          nome_completo: string
          cpf?: string | null
          rg?: string | null
          nacionalidade?: string | null
          estado_civil?: string | null
          profissao?: string | null
          endereco?: Json | null
          papel?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string
          documento_origem_id?: string | null
          nome_completo?: string
          cpf?: string | null
          rg?: string | null
          nacionalidade?: string | null
          estado_civil?: string | null
          profissao?: string | null
          endereco?: Json | null
          papel?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_naturais_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_naturais_documento_origem_id_fkey"
            columns: ["documento_origem_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          }
        ]
      }
      pessoas_juridicas: {
        Row: {
          id: string
          minuta_id: string
          documento_origem_id: string | null
          razao_social: string
          nome_fantasia: string | null
          cnpj: string | null
          inscricao_estadual: string | null
          endereco: Json | null
          representante_id: string | null
          papel: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          minuta_id: string
          documento_origem_id?: string | null
          razao_social: string
          nome_fantasia?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          endereco?: Json | null
          representante_id?: string | null
          papel?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string
          documento_origem_id?: string | null
          razao_social?: string
          nome_fantasia?: string | null
          cnpj?: string | null
          inscricao_estadual?: string | null
          endereco?: Json | null
          representante_id?: string | null
          papel?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_juridicas_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          }
        ]
      }
      imoveis: {
        Row: {
          id: string
          minuta_id: string
          documento_origem_id: string | null
          tipo_imovel: string | null
          endereco_completo: string | null
          matricula: string | null
          cartorio_registro: string | null
          area_total: number | null
          area_construida: number | null
          inscricao_municipal: string | null
          dados_adicionais: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          minuta_id: string
          documento_origem_id?: string | null
          tipo_imovel?: string | null
          endereco_completo?: string | null
          matricula?: string | null
          cartorio_registro?: string | null
          area_total?: number | null
          area_construida?: number | null
          inscricao_municipal?: string | null
          dados_adicionais?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string
          documento_origem_id?: string | null
          tipo_imovel?: string | null
          endereco_completo?: string | null
          matricula?: string | null
          cartorio_registro?: string | null
          area_total?: number | null
          area_construida?: number | null
          inscricao_municipal?: string | null
          dados_adicionais?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          }
        ]
      }
      negocios_juridicos: {
        Row: {
          id: string
          minuta_id: string
          tipo_negocio: string
          valor: number | null
          moeda: string | null
          forma_pagamento: string | null
          condicoes: Json | null
          data_assinatura: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          minuta_id: string
          tipo_negocio: string
          valor?: number | null
          moeda?: string | null
          forma_pagamento?: string | null
          condicoes?: Json | null
          data_assinatura?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string
          tipo_negocio?: string
          valor?: number | null
          moeda?: string | null
          forma_pagamento?: string | null
          condicoes?: Json | null
          data_assinatura?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "negocios_juridicos_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          nome: string | null
          cargo: 'admin' | 'escrevente' | 'tabeliao' | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome?: string | null
          cargo?: 'admin' | 'escrevente' | 'tabeliao' | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string | null
          cargo?: 'admin' | 'escrevente' | 'tabeliao' | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_logs: {
        Row: {
          id: string
          minuta_id: string | null
          documento_id: string | null
          agent_type: string
          input_data: Json | null
          output_data: Json | null
          tokens_used: number | null
          duration_ms: number | null
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          minuta_id?: string | null
          documento_id?: string | null
          agent_type: string
          input_data?: Json | null
          output_data?: Json | null
          tokens_used?: number | null
          duration_ms?: number | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          minuta_id?: string | null
          documento_id?: string | null
          agent_type?: string
          input_data?: Json | null
          output_data?: Json | null
          tokens_used?: number | null
          duration_ms?: number | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      extraction_prompts: {
        Row: {
          id: string
          tipo_documento: string
          prompt_template: string
          versao: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tipo_documento: string
          prompt_template: string
          versao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tipo_documento?: string
          prompt_template?: string
          versao?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      status_minuta: 'rascunho' | 'processando' | 'revisao' | 'concluida' | 'cancelada'
      status_documento: 'pendente' | 'classificando' | 'extraindo' | 'concluido' | 'erro'
      tipo_documento:
        | 'rg'
        | 'cpf'
        | 'cnh'
        | 'certidao_nascimento'
        | 'certidao_casamento'
        | 'certidao_obito'
        | 'comprovante_residencia'
        | 'matricula_imovel'
        | 'iptu'
        | 'escritura'
        | 'contrato'
        | 'procuracao'
        | 'cnpj'
        | 'contrato_social'
        | 'certidao_negativa'
        | 'comprovante_renda'
        | 'extrato_bancario'
        | 'declaracao_ir'
        | 'laudo_avaliacao'
        | 'planta_imovel'
        | 'habite_se'
        | 'outro'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
