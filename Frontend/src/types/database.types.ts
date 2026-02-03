export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_executions: {
        Row: {
          agent_type: string
          completed_at: string | null
          cost_estimate: number | null
          created_at: string
          documento_id: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_tokens: number | null
          minuta_id: string | null
          model_name: string
          output_tokens: number | null
          prompt_used: string | null
          prompt_version: number | null
          result: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          agent_type: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          documento_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          minuta_id?: string | null
          model_name?: string
          output_tokens?: number | null
          prompt_used?: string | null
          prompt_version?: number | null
          result?: Json | null
          started_at?: string | null
          status: string
        }
        Update: {
          agent_type?: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          documento_id?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_tokens?: number | null
          minuta_id?: string | null
          model_name?: string
          output_tokens?: number | null
          prompt_used?: string | null
          prompt_version?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_executions_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompts: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          prompt_text: string
          tipo_documento: string
          updated_at: string
          versao: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          prompt_text: string
          tipo_documento: string
          updated_at?: string
          versao?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          prompt_text?: string
          tipo_documento?: string
          updated_at?: string
          versao?: number
        }
        Relationships: []
      }
      agentes_especialistas_prompts: {
        Row: {
          agent_slug: string
          ativo: boolean
          categoria: string
          created_at: string
          criado_por: string | null
          descricao: string | null
          id: string
          nome_exibicao: string
          system_prompt: string
          updated_at: string
          versao: number
        }
        Insert: {
          agent_slug: string
          ativo?: boolean
          categoria: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome_exibicao: string
          system_prompt: string
          updated_at?: string
          versao?: number
        }
        Update: {
          agent_slug?: string
          ativo?: boolean
          categoria?: string
          created_at?: string
          criado_por?: string | null
          descricao?: string | null
          id?: string
          nome_exibicao?: string
          system_prompt?: string
          updated_at?: string
          versao?: number
        }
        Relationships: []
      }
      agentes_especialistas_runs: {
        Row: {
          agent_nome: string
          agent_slug: string
          completed_at: string | null
          cost_estimate: number | null
          created_at: string
          documentos: Json
          duration_ms: number | null
          erro_mensagem: string | null
          id: string
          input_tokens: number | null
          instrucoes_customizadas: string | null
          modelo: string
          output_texto: string | null
          output_thinking: string | null
          output_tokens: number | null
          prompt_usado: string
          prompt_versao: number
          started_at: string | null
          status: Database["public"]["Enums"]["agentes_especialistas_status"]
          thinking_duration_ms: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_nome: string
          agent_slug: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          documentos?: Json
          duration_ms?: number | null
          erro_mensagem?: string | null
          id?: string
          input_tokens?: number | null
          instrucoes_customizadas?: string | null
          modelo?: string
          output_texto?: string | null
          output_thinking?: string | null
          output_tokens?: number | null
          prompt_usado: string
          prompt_versao: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["agentes_especialistas_status"]
          thinking_duration_ms?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_nome?: string
          agent_slug?: string
          completed_at?: string | null
          cost_estimate?: number | null
          created_at?: string
          documentos?: Json
          duration_ms?: number | null
          erro_mensagem?: string | null
          id?: string
          input_tokens?: number | null
          instrucoes_customizadas?: string | null
          modelo?: string
          output_texto?: string | null
          output_thinking?: string | null
          output_tokens?: number | null
          prompt_usado?: string
          prompt_versao?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["agentes_especialistas_status"]
          thinking_duration_ms?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documentos: {
        Row: {
          classificacao_confianca: string | null
          created_at: string
          dados_extraidos: Json | null
          erro_mensagem: string | null
          id: string
          mime_type: string
          minuta_id: string
          nome_original: string
          pessoa_relacionada: string | null
          status: string
          storage_path: string
          tamanho_bytes: number
          tipo_documento: string | null
          updated_at: string
        }
        Insert: {
          classificacao_confianca?: string | null
          created_at?: string
          dados_extraidos?: Json | null
          erro_mensagem?: string | null
          id?: string
          mime_type: string
          minuta_id: string
          nome_original: string
          pessoa_relacionada?: string | null
          status?: string
          storage_path: string
          tamanho_bytes: number
          tipo_documento?: string | null
          updated_at?: string
        }
        Update: {
          classificacao_confianca?: string | null
          created_at?: string
          dados_extraidos?: Json | null
          erro_mensagem?: string | null
          id?: string
          mime_type?: string
          minuta_id?: string
          nome_original?: string
          pessoa_relacionada?: string | null
          status?: string
          storage_path?: string
          tamanho_bytes?: number
          tipo_documento?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
        ]
      }
      imoveis: {
        Row: {
          andar: string | null
          ano_exercicio: number | null
          area_comum: number | null
          area_privativa: number | null
          area_total: number | null
          bairro: string | null
          bloco: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string
          descricao_completa: string | null
          edificio_nome: string | null
          estado: string | null
          fontes: Json | null
          fracao_ideal: string | null
          id: string
          iptu_valor_venal: number | null
          logradouro: string | null
          matricula_cidade: string | null
          matricula_estado: string | null
          matricula_numero: string | null
          matricula_registro_imoveis: string | null
          minuta_id: string
          numero: string | null
          onus_ativos: Json | null
          onus_historicos: Json | null
          proprietarios: Json | null
          sql_inscricao: string | null
          tipo_imovel: string | null
          unidade: string | null
          updated_at: string
          vvr_valor: number | null
        }
        Insert: {
          andar?: string | null
          ano_exercicio?: number | null
          area_comum?: number | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          bloco?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          descricao_completa?: string | null
          edificio_nome?: string | null
          estado?: string | null
          fontes?: Json | null
          fracao_ideal?: string | null
          id?: string
          iptu_valor_venal?: number | null
          logradouro?: string | null
          matricula_cidade?: string | null
          matricula_estado?: string | null
          matricula_numero?: string | null
          matricula_registro_imoveis?: string | null
          minuta_id: string
          numero?: string | null
          onus_ativos?: Json | null
          onus_historicos?: Json | null
          proprietarios?: Json | null
          sql_inscricao?: string | null
          tipo_imovel?: string | null
          unidade?: string | null
          updated_at?: string
          vvr_valor?: number | null
        }
        Update: {
          andar?: string | null
          ano_exercicio?: number | null
          area_comum?: number | null
          area_privativa?: number | null
          area_total?: number | null
          bairro?: string | null
          bloco?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string
          descricao_completa?: string | null
          edificio_nome?: string | null
          estado?: string | null
          fontes?: Json | null
          fracao_ideal?: string | null
          id?: string
          iptu_valor_venal?: number | null
          logradouro?: string | null
          matricula_cidade?: string | null
          matricula_estado?: string | null
          matricula_numero?: string | null
          matricula_registro_imoveis?: string | null
          minuta_id?: string
          numero?: string | null
          onus_ativos?: Json | null
          onus_historicos?: Json | null
          proprietarios?: Json | null
          sql_inscricao?: string | null
          tipo_imovel?: string | null
          unidade?: string | null
          updated_at?: string
          vvr_valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "imoveis_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
        ]
      }
      minuta_templates: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          template_text: string
          tipo_negocio: string
          updated_at: string
          variaveis: Json | null
          versao: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          template_text: string
          tipo_negocio: string
          updated_at?: string
          variaveis?: Json | null
          versao?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          template_text?: string
          tipo_negocio?: string
          updated_at?: string
          variaveis?: Json | null
          versao?: number
        }
        Relationships: []
      }
      minutas: {
        Row: {
          conteudo_gerado: string | null
          created_at: string
          current_step: string
          geracao_erro: string | null
          geracao_status: string | null
          gerado_em: string | null
          id: string
          minuta_texto: string | null
          prompt_versao: number | null
          status: string
          template_usado: string | null
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          conteudo_gerado?: string | null
          created_at?: string
          current_step?: string
          geracao_erro?: string | null
          geracao_status?: string | null
          gerado_em?: string | null
          id?: string
          minuta_texto?: string | null
          prompt_versao?: number | null
          status?: string
          template_usado?: string | null
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          conteudo_gerado?: string | null
          created_at?: string
          current_step?: string
          geracao_erro?: string | null
          geracao_status?: string | null
          gerado_em?: string | null
          id?: string
          minuta_texto?: string | null
          prompt_versao?: number | null
          status?: string
          template_usado?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      negocios_juridicos: {
        Row: {
          alertas_juridicos: Json | null
          condicoes_especiais: string | null
          corretagem_intermediador: string | null
          corretagem_responsavel: string | null
          corretagem_valor: number | null
          created_at: string
          fontes: Json | null
          fracao_alienada: string | null
          id: string
          imovel_id: string | null
          itbi_base_calculo: number | null
          itbi_codigo_autenticacao: string | null
          itbi_data_pagamento: string | null
          itbi_data_vencimento: string | null
          itbi_numero_guia: string | null
          itbi_valor: number | null
          minuta_id: string
          pagamento_descricao: string | null
          pagamento_prazo: string | null
          pagamento_tipo: string | null
          tipo: string
          updated_at: string
          valor_saldo: number | null
          valor_sinal: number | null
          valor_total: number | null
        }
        Insert: {
          alertas_juridicos?: Json | null
          condicoes_especiais?: string | null
          corretagem_intermediador?: string | null
          corretagem_responsavel?: string | null
          corretagem_valor?: number | null
          created_at?: string
          fontes?: Json | null
          fracao_alienada?: string | null
          id?: string
          imovel_id?: string | null
          itbi_base_calculo?: number | null
          itbi_codigo_autenticacao?: string | null
          itbi_data_pagamento?: string | null
          itbi_data_vencimento?: string | null
          itbi_numero_guia?: string | null
          itbi_valor?: number | null
          minuta_id: string
          pagamento_descricao?: string | null
          pagamento_prazo?: string | null
          pagamento_tipo?: string | null
          tipo: string
          updated_at?: string
          valor_saldo?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Update: {
          alertas_juridicos?: Json | null
          condicoes_especiais?: string | null
          corretagem_intermediador?: string | null
          corretagem_responsavel?: string | null
          corretagem_valor?: number | null
          created_at?: string
          fontes?: Json | null
          fracao_alienada?: string | null
          id?: string
          imovel_id?: string | null
          itbi_base_calculo?: number | null
          itbi_codigo_autenticacao?: string | null
          itbi_data_pagamento?: string | null
          itbi_data_vencimento?: string | null
          itbi_numero_guia?: string | null
          itbi_valor?: number | null
          minuta_id?: string
          pagamento_descricao?: string | null
          pagamento_prazo?: string | null
          pagamento_tipo?: string | null
          tipo?: string
          updated_at?: string
          valor_saldo?: number | null
          valor_sinal?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "negocios_juridicos_imovel_id_fkey"
            columns: ["imovel_id"]
            isOneToOne: false
            referencedRelation: "imoveis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "negocios_juridicos_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_negocio: {
        Row: {
          created_at: string
          id: string
          negocio_id: string
          papel: string
          percentual: number | null
          pessoa_juridica_id: string | null
          pessoa_natural_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          negocio_id: string
          papel: string
          percentual?: number | null
          pessoa_juridica_id?: string | null
          pessoa_natural_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          negocio_id?: string
          papel?: string
          percentual?: number | null
          pessoa_juridica_id?: string | null
          pessoa_natural_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participantes_negocio_negocio_id_fkey"
            columns: ["negocio_id"]
            isOneToOne: false
            referencedRelation: "negocios_juridicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_negocio_pessoa_juridica_id_fkey"
            columns: ["pessoa_juridica_id"]
            isOneToOne: false
            referencedRelation: "pessoas_juridicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_negocio_pessoa_natural_id_fkey"
            columns: ["pessoa_natural_id"]
            isOneToOne: false
            referencedRelation: "pessoas_naturais"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas_juridicas: {
        Row: {
          capital_social: number | null
          cnpj: string | null
          created_at: string
          data_constituicao: string | null
          email: string | null
          fontes: Json | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          minuta_id: string
          nome_fantasia: string | null
          papel: string
          razao_social: string
          sede_bairro: string | null
          sede_cep: string | null
          sede_cidade: string | null
          sede_complemento: string | null
          sede_estado: string | null
          sede_logradouro: string | null
          sede_numero: string | null
          telefone: string | null
          tipo_societario: string | null
          updated_at: string
        }
        Insert: {
          capital_social?: number | null
          cnpj?: string | null
          created_at?: string
          data_constituicao?: string | null
          email?: string | null
          fontes?: Json | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          minuta_id: string
          nome_fantasia?: string | null
          papel: string
          razao_social: string
          sede_bairro?: string | null
          sede_cep?: string | null
          sede_cidade?: string | null
          sede_complemento?: string | null
          sede_estado?: string | null
          sede_logradouro?: string | null
          sede_numero?: string | null
          telefone?: string | null
          tipo_societario?: string | null
          updated_at?: string
        }
        Update: {
          capital_social?: number | null
          cnpj?: string | null
          created_at?: string
          data_constituicao?: string | null
          email?: string | null
          fontes?: Json | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          minuta_id?: string
          nome_fantasia?: string | null
          papel?: string
          razao_social?: string
          sede_bairro?: string | null
          sede_cep?: string | null
          sede_cidade?: string | null
          sede_complemento?: string | null
          sede_estado?: string | null
          sede_logradouro?: string | null
          sede_numero?: string | null
          telefone?: string | null
          tipo_societario?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_juridicas_minuta_id_fkey"
            columns: ["minuta_id"]
            isOneToOne: false
            referencedRelation: "minutas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas_naturais: {
        Row: {
          cndt_data_expedicao: string | null
          cndt_numero: string | null
          cndt_status: string | null
          cndt_validade: string | null
          conjuge_cpf: string | null
          conjuge_nome: string | null
          cpf: string | null
          created_at: string
          data_casamento: string | null
          data_nascimento: string | null
          email: string | null
          endereco_bairro: string | null
          endereco_cep: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_estado: string | null
          endereco_logradouro: string | null
          endereco_numero: string | null
          estado_civil: string | null
          fontes: Json | null
          id: string
          minuta_id: string
          nacionalidade: string | null
          naturalidade: string | null
          nome: string
          nome_mae: string | null
          nome_pai: string | null
          papel: string
          profissao: string | null
          regime_bens: string | null
          rg: string | null
          rg_data_emissao: string | null
          rg_estado: string | null
          rg_orgao_emissor: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cndt_data_expedicao?: string | null
          cndt_numero?: string | null
          cndt_status?: string | null
          cndt_validade?: string | null
          conjuge_cpf?: string | null
          conjuge_nome?: string | null
          cpf?: string | null
          created_at?: string
          data_casamento?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_estado?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          estado_civil?: string | null
          fontes?: Json | null
          id?: string
          minuta_id: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome: string
          nome_mae?: string | null
          nome_pai?: string | null
          papel: string
          profissao?: string | null
          regime_bens?: string | null
          rg?: string | null
          rg_data_emissao?: string | null
          rg_estado?: string | null
          rg_orgao_emissor?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cndt_data_expedicao?: string | null
          cndt_numero?: string | null
          cndt_status?: string | null
          cndt_validade?: string | null
          conjuge_cpf?: string | null
          conjuge_nome?: string | null
          cpf?: string | null
          created_at?: string
          data_casamento?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cep?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_estado?: string | null
          endereco_logradouro?: string | null
          endereco_numero?: string | null
          estado_civil?: string | null
          fontes?: Json | null
          id?: string
          minuta_id?: string
          nacionalidade?: string | null
          naturalidade?: string | null
          nome?: string
          nome_mae?: string | null
          nome_pai?: string | null
          papel?: string
          profissao?: string | null
          regime_bens?: string | null
          rg?: string | null
          rg_data_emissao?: string | null
          rg_estado?: string | null
          rg_orgao_emissor?: string | null
          telefone?: string | null
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
        ]
      }
      profiles: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      representantes: {
        Row: {
          cargo: string | null
          cpf: string | null
          created_at: string
          id: string
          nome: string | null
          pessoa_juridica_id: string
          pessoa_natural_id: string | null
          procuracao_data: string | null
          procuracao_poderes: string | null
          procuracao_tipo: string | null
          procuracao_validade: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          pessoa_juridica_id: string
          pessoa_natural_id?: string | null
          procuracao_data?: string | null
          procuracao_poderes?: string | null
          procuracao_tipo?: string | null
          procuracao_validade?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          cargo?: string | null
          cpf?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          pessoa_juridica_id?: string
          pessoa_natural_id?: string | null
          procuracao_data?: string | null
          procuracao_poderes?: string | null
          procuracao_tipo?: string | null
          procuracao_validade?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "representantes_pessoa_juridica_id_fkey"
            columns: ["pessoa_juridica_id"]
            isOneToOne: false
            referencedRelation: "pessoas_juridicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "representantes_pessoa_natural_id_fkey"
            columns: ["pessoa_natural_id"]
            isOneToOne: false
            referencedRelation: "pessoas_naturais"
            referencedColumns: ["id"]
          },
        ]
      }
      minutas_padrao: {
        Row: {
          id: string
          user_id: string | null
          is_global: boolean
          nome: string
          descricao: string | null
          tipo_negocio: string
          storage_path: string | null
          nome_original: string | null
          mime_type: string | null
          tamanho_bytes: number | null
          thumbnail_path: string | null
          texto_extraido: string | null
          conteudo_markdown: string | null
          variaveis_detectadas: Json | null
          status_extracao: string | null
          erro_extracao: string | null
          extraido_em: string | null
          revisado_em: string | null
          uso_count: number
          ativo: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          is_global?: boolean
          nome: string
          descricao?: string | null
          tipo_negocio: string
          storage_path?: string | null
          nome_original?: string | null
          mime_type?: string | null
          tamanho_bytes?: number | null
          thumbnail_path?: string | null
          texto_extraido?: string | null
          conteudo_markdown?: string | null
          variaveis_detectadas?: Json | null
          status_extracao?: string | null
          erro_extracao?: string | null
          extraido_em?: string | null
          revisado_em?: string | null
          uso_count?: number
          ativo?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          is_global?: boolean
          nome?: string
          descricao?: string | null
          tipo_negocio?: string
          storage_path?: string | null
          nome_original?: string | null
          mime_type?: string | null
          tamanho_bytes?: number | null
          thumbnail_path?: string | null
          texto_extraido?: string | null
          conteudo_markdown?: string | null
          variaveis_detectadas?: Json | null
          status_extracao?: string | null
          erro_extracao?: string | null
          extraido_em?: string | null
          revisado_em?: string | null
          uso_count?: number
          ativo?: boolean
          deleted_at?: string | null
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
      auth_user_cargo: { Args: never; Returns: string }
      complete_specialist_run: {
        Args: {
          p_cost_estimate?: number
          p_erro_mensagem?: string
          p_input_tokens?: number
          p_output_texto: string
          p_output_thinking?: string
          p_output_tokens?: number
          p_run_id: string
          p_status?: Database["public"]["Enums"]["agentes_especialistas_status"]
          p_thinking_duration_ms?: number
        }
        Returns: undefined
      }
      create_specialist_run: {
        Args: {
          p_agent_slug: string
          p_documentos?: Json
          p_instrucoes_customizadas?: string
          p_user_id: string
        }
        Returns: string
      }
      get_active_specialist_prompt: {
        Args: { p_agent_slug: string }
        Returns: {
          agent_slug: string
          categoria: string
          descricao: string
          id: string
          nome_exibicao: string
          system_prompt: string
          versao: number
        }[]
      }
      get_specialist_runs_history: {
        Args: {
          p_agent_slug?: string
          p_limit?: number
          p_offset?: number
          p_user_id: string
        }
        Returns: {
          agent_nome: string
          agent_slug: string
          created_at: string
          documentos: Json
          duration_ms: number
          erro_mensagem: string
          id: string
          input_tokens: number
          instrucoes_customizadas: string
          output_texto: string
          output_tokens: number
          status: Database["public"]["Enums"]["agentes_especialistas_status"]
        }[]
      }
      is_current_user_admin: { Args: never; Returns: boolean }
      list_specialist_agents: {
        Args: never
        Returns: {
          agent_slug: string
          categoria: string
          descricao: string
          nome_exibicao: string
          versao: number
        }[]
      }
      increment_template_usage: {
        Args: { template_id: string }
        Returns: undefined
      }
    }
    Enums: {
      status_minuta: "rascunho" | "em_andamento" | "finalizado" | "cancelado"
      status_documento: "pendente" | "processando" | "processado" | "erro"
      tipo_documento: "CNH" | "RG" | "CPF" | "CERTIDAO_CASAMENTO" | "CERTIDAO_NASCIMENTO" | "MATRICULA" | "IPTU" | "CONTRATO" | "PROCURACAO" | "OUTROS"
      agentes_especialistas_status:
        | "pending"
        | "processing"
        | "streaming"
        | "completed"
        | "stopped"
        | "error"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agentes_especialistas_status: [
        "pending",
        "processing",
        "streaming",
        "completed",
        "stopped",
        "error",
      ],
    },
  },
} as const

