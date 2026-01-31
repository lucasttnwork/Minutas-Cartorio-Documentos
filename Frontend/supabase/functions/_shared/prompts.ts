import { createServiceClient } from './supabase-client.ts';

// Classification prompt (embedded, same as Python)
export const CLASSIFICATION_PROMPT = `Voce e um especialista em documentos brasileiros de cartorio e registro de imoveis.

Analise esta imagem de documento e identifique:

1. TIPO_DOCUMENTO: Qual o tipo exato? Escolha APENAS uma opcao:
   - RG (Registro Geral / Carteira de Identidade)
   - CNH (Carteira Nacional de Habilitacao)
   - CPF (Cadastro de Pessoa Fisica - documento avulso)
   - CERTIDAO_NASCIMENTO
   - CERTIDAO_CASAMENTO
   - CERTIDAO_OBITO
   - CNDT (Certidao Negativa de Debitos Trabalhistas)
   - CND_FEDERAL (Certidao da Receita Federal / PGFN)
   - CND_ESTADUAL
   - CND_MUNICIPAL (Certidao de Tributos Municipais / IPTU)
   - CND_CONDOMINIO (Declaracao de quitacao condominial)
   - MATRICULA_IMOVEL (Certidao de Matricula do Registro de Imoveis)
   - ITBI (Guia de ITBI ou comprovante)
   - VVR (Valor Venal de Referencia)
   - IPTU (Carne ou certidao de IPTU)
   - DADOS_CADASTRAIS (Ficha cadastral do imovel)
   - COMPROMISSO_COMPRA_VENDA (Contrato particular)
   - ESCRITURA (Escritura publica)
   - PROCURACAO
   - COMPROVANTE_RESIDENCIA
   - COMPROVANTE_PAGAMENTO (Recibo, transferencia, etc)
   - CONTRATO_SOCIAL (Pessoa Juridica)
   - PROTOCOLO_ONR (Protocolo/comprovante do Operador Nacional do Registro)
   - ASSINATURA_DIGITAL (Certificado de assinatura eletronica)
   - OUTRO (documento reconhecido mas nao se encaixa nas categorias)
   - ILEGIVEL (documento muito ruim para identificar)
   - DESCONHECIDO (documento identificavel mas tipo nao existe na lista)

2. CONFIANCA: Alta, Media ou Baixa

3. PESSOA_RELACIONADA: Nome da pessoa no documento (ou null)

4. OBSERVACAO: Breve descricao (maximo 100 caracteres)

Responda APENAS em JSON valido, sem markdown:
{"tipo_documento": "RG", "confianca": "Alta", "pessoa_relacionada": "JOAO SILVA", "observacao": "RG do estado de SP"}`;

// Load extraction prompt from database
export async function loadExtractionPrompt(tipoDocumento: string, fileSize?: number): Promise<string> {
  const supabase = createServiceClient();

  const tipo = tipoDocumento.toLowerCase();

  // For large matriculas, try compact version first
  if (tipo === 'matricula_imovel' && fileSize && fileSize > 2_000_000) {
    const { data: compact } = await supabase
      .from('agent_prompts')
      .select('prompt_text')
      .eq('tipo_documento', 'matricula_imovel_compact')
      .eq('ativo', true)
      .order('versao', { ascending: false })
      .limit(1)
      .single();

    if (compact) return compact.prompt_text;
  }

  // Get latest version of prompt for type
  const { data: prompt } = await supabase
    .from('agent_prompts')
    .select('prompt_text')
    .eq('tipo_documento', tipo)
    .eq('ativo', true)
    .order('versao', { ascending: false })
    .limit(1)
    .single();

  if (prompt) return prompt.prompt_text;

  // Fallback to generic
  const { data: generic } = await supabase
    .from('agent_prompts')
    .select('prompt_text')
    .eq('tipo_documento', 'generic')
    .eq('ativo', true)
    .limit(1)
    .single();

  if (generic) return generic.prompt_text;

  throw new Error(`No prompt found for document type: ${tipoDocumento}`);
}
