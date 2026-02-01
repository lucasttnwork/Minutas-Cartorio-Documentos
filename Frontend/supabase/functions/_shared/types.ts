export const VALID_DOCUMENT_TYPES = [
  'RG', 'CNH', 'CPF', 'CERTIDAO_NASCIMENTO', 'CERTIDAO_CASAMENTO',
  'CERTIDAO_OBITO', 'CNDT', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_MUNICIPAL',
  'CND_CONDOMINIO', 'MATRICULA_IMOVEL', 'ITBI', 'VVR', 'IPTU',
  'DADOS_CADASTRAIS', 'COMPROMISSO_COMPRA_VENDA', 'ESCRITURA', 'PROCURACAO',
  'COMPROVANTE_RESIDENCIA', 'COMPROVANTE_PAGAMENTO', 'CONTRATO_SOCIAL',
  'PROTOCOLO_ONR', 'ASSINATURA_DIGITAL', 'OUTRO', 'ILEGIVEL', 'DESCONHECIDO'
] as const;

export type DocumentType = typeof VALID_DOCUMENT_TYPES[number];

export interface ClassificationResult {
  tipo_documento: DocumentType;
  confianca: 'Alta' | 'Media' | 'Baixa';
  pessoa_relacionada: string | null;
  observacao: string;
  // For DESCONHECIDO
  tipo_sugerido?: string;
  descricao?: string;
  categoria_recomendada?: string;
  caracteristicas_identificadoras?: string[];
  campos_principais?: string[];
}

export interface ExtractionResult {
  dados_estruturados: Record<string, unknown>;
  explicacao_contextual: string;
  campos_extraidos: string[];
  campos_faltantes: string[];
}

export interface MappedFields {
  alienantes: PessoaNatural[];
  adquirentes: PessoaNatural[];
  anuentes: PessoaNatural[];
  imovel: Imovel;
  negocio: NegocioJuridico;
  alertas_juridicos: AlertaJuridico[];
  metadata: MappingMetadata;
}

export interface PessoaNatural {
  nome: string;
  cpf?: string;
  rg?: string;
  orgao_emissor_rg?: string;
  estado_emissor_rg?: string;
  data_emissao_rg?: string;
  data_nascimento?: string;
  nacionalidade?: string;
  naturalidade?: string;
  profissao?: string;
  estado_civil?: string;
  regime_bens?: string;
  conjuge?: string;
  data_casamento?: string;
  filiacao_pai?: string;
  filiacao_mae?: string;
  endereco?: Endereco;
  cndt?: Certidao;
  _fontes?: Record<string, string[]>;
}

export interface Endereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface Certidao {
  numero?: string;
  data_expedicao?: string;
  hora_expedicao?: string;
  validade?: string;
  status?: string;
}

export interface Imovel {
  matricula_numero?: string;
  registro_imoveis?: string;
  cidade?: string;
  estado?: string;
  tipo?: string;
  edificio?: string;
  unidade?: string;
  bloco?: string;
  andar?: string;
  area_total?: string;
  area_privativa?: string;
  area_comum?: string;
  fracao_ideal?: string;
  endereco?: Endereco;
  sql?: string;
  iptu_valor_venal?: string;
  vvr_valor?: string;
  proprietarios?: Array<{ nome: string; cpf?: string }>;
  onus_ativos?: Onus[];
  onus_historicos?: Onus[];
}

export interface Onus {
  tipo: string;
  numero_registro?: string;
  data_registro?: string;
  valor?: string;
  credor?: string;
  status: 'ativo' | 'quitado' | 'cancelado';
}

export interface NegocioJuridico {
  tipo: string;
  valor_total?: string;
  fracao_alienada?: string;
  pagamento?: {
    tipo?: string;
    sinal?: string;
    saldo?: string;
    prazo?: string;
  };
  itbi?: {
    numero_guia?: string;
    base_calculo?: string;
    valor?: string;
    data_vencimento?: string;
    data_pagamento?: string;
  };
  corretagem?: {
    valor?: string;
    responsavel?: string;
    intermediador?: string;
  };
}

export interface AlertaJuridico {
  tipo: string;
  severidade: 'ALTA' | 'MEDIA' | 'BAIXA';
  pessoa?: string;
  mensagem: string;
  recomendacao?: string;
}

export interface MappingMetadata {
  documentos_processados: number;
  campos_preenchidos: number;
  campos_faltantes: string[];
}
