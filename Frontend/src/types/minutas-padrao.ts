// src/types/minutas-padrao.ts

// Tipos de negócio suportados para templates
export type TipoNegocio =
  | 'compra_venda'
  | 'doacao'
  | 'permuta'
  | 'hipoteca'
  | 'inventario'
  | 'geral';

// Status de extração de texto
export type StatusExtracao =
  | 'pendente'
  | 'extraindo'
  | 'extraido'
  | 'erro'
  | 'revisado';

// Interface principal do template
export interface MinutaPadrao {
  id: string;
  user_id: string | null;
  is_global: boolean;
  nome: string;
  descricao: string | null;
  tipo_negocio: TipoNegocio;

  // Campos de arquivo (agora opcionais - null se criado via texto)
  storage_path: string | null;
  nome_original: string | null;
  mime_type: string | null;
  tamanho_bytes: number | null;
  thumbnail_path: string | null;

  // Campos de extração de texto
  texto_extraido: string | null;
  conteudo_markdown: string | null;
  status_extracao: StatusExtracao;
  erro_extracao: string | null;
  extraido_em: string | null;
  revisado_em: string | null;

  // Campos de controle
  uso_count: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

// Para inserção via UPLOAD de arquivo
export interface MinutaPadraoInsertUpload {
  user_id?: string;
  is_global?: boolean;
  nome: string;
  descricao?: string | null;
  tipo_negocio: TipoNegocio;
  storage_path: string;
  nome_original: string;
  mime_type: string;
  tamanho_bytes: number;
  thumbnail_path?: string | null;
  status_extracao?: 'pendente';
}

// Para inserção via TEXTO colado/escrito
export interface MinutaPadraoInsertText {
  user_id?: string;
  is_global?: boolean;
  nome: string;
  descricao?: string | null;
  tipo_negocio: TipoNegocio;
  texto_extraido: string;
  status_extracao: 'extraido';
}

// Union type para inserção (arquivo OU texto)
export type MinutaPadraoInsert = MinutaPadraoInsertUpload | MinutaPadraoInsertText;

// Para atualização (todos opcionais)
export interface MinutaPadraoUpdate {
  nome?: string;
  descricao?: string | null;
  tipo_negocio?: TipoNegocio;
  thumbnail_path?: string | null;
  conteudo_markdown?: string | null;
  status_extracao?: StatusExtracao;
  revisado_em?: string | null;
}

// Labels para exibição
export const TIPO_NEGOCIO_LABELS: Record<TipoNegocio, string> = {
  compra_venda: 'Compra e Venda',
  doacao: 'Doação',
  permuta: 'Permuta',
  hipoteca: 'Hipoteca',
  inventario: 'Inventário',
  geral: 'Geral',
};

// MIME types aceitos
export const MIME_TYPES_ACEITOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export type MimeTypeAceito = typeof MIME_TYPES_ACEITOS[number];
