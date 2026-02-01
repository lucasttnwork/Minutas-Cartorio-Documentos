-- Migration: Add minuta generation fields
-- Purpose: Support the minuta generation workflow with status tracking and template versioning

-- ============================================================================
-- PART 1: Add generation tracking fields to minutas table
-- ============================================================================

-- Campo para armazenar conteúdo gerado (pode ser diferente de minuta_texto que é editável)
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS conteudo_gerado TEXT;

-- Campo para armazenar template usado na geração
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS template_usado TEXT;

-- Campo para status específico de geração (separado do status geral da minuta)
-- pendente: aguardando geração
-- gerando: geração em andamento
-- gerado: geração concluída com sucesso
-- erro: erro durante geração
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS geracao_status TEXT
  CHECK (geracao_status IN ('pendente', 'gerando', 'gerado', 'erro'));

-- Timestamp de quando a minuta foi gerada
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS gerado_em TIMESTAMPTZ;

-- Mensagem de erro caso a geração falhe
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS geracao_erro TEXT;

-- Versão do prompt usado (para rastreabilidade)
ALTER TABLE public.minutas ADD COLUMN IF NOT EXISTS prompt_versao INTEGER;

-- Comentários para documentação
COMMENT ON COLUMN public.minutas.conteudo_gerado IS 'Conteúdo original gerado pela IA (preservado para comparação)';
COMMENT ON COLUMN public.minutas.template_usado IS 'Nome/ID do template usado na geração';
COMMENT ON COLUMN public.minutas.geracao_status IS 'Status do processo de geração: pendente, gerando, gerado, erro';
COMMENT ON COLUMN public.minutas.gerado_em IS 'Timestamp de quando a minuta foi gerada';
COMMENT ON COLUMN public.minutas.geracao_erro IS 'Mensagem de erro caso a geração tenha falhado';
COMMENT ON COLUMN public.minutas.prompt_versao IS 'Versão do prompt usado na geração';

-- ============================================================================
-- PART 2: Add index for generation status queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_minutas_geracao_status ON public.minutas(geracao_status);

-- ============================================================================
-- PART 3: Add generation prompt to agent_prompts table
-- ============================================================================

-- Prompt para geração de minuta de compra e venda
INSERT INTO public.agent_prompts (tipo_documento, versao, prompt_text, descricao, ativo)
VALUES ('MINUTA_VENDA_COMPRA', 1, E'Voce e um especialista em minutas de escritura publica brasileira, especificamente em escrituras de compra e venda de imoveis.

## OBJETIVO
Gerar o texto completo de uma minuta de escritura publica de compra e venda, formatada de acordo com os padroes cartoriais brasileiros, especialmente do Estado de Sao Paulo.

## REGRAS OBRIGATORIAS

1. **NUNCA INVENTAR DADOS**: Use APENAS os dados fornecidos no contexto. Se algum dado estiver faltando, indique com [CAMPO_FALTANTE: descricao].

2. **FORMATO JURIDICO**: Use linguagem juridica formal, seguindo os padroes de escrituras publicas.

3. **ESTRUTURA OBRIGATORIA**:
   - Cabecalho com data por extenso
   - Identificacao do cartorio e tabeliao
   - Qualificacao completa das partes (outorgantes vendedores e outorgados compradores)
   - Descricao do imovel conforme matricula
   - Origem da propriedade
   - Valores e forma de pagamento
   - Clausulas de estilo
   - Declaracoes das partes
   - Fecho

4. **QUALIFICACAO DAS PARTES**: Incluir todos os dados disponveis:
   - Nome completo
   - Nacionalidade
   - Estado civil e regime de bens (se casado)
   - Profissao
   - RG e orgao expedidor
   - CPF
   - Endereco completo

5. **DESCRICAO DO IMOVEL**: Incluir:
   - Tipo do imovel
   - Endereco completo
   - Area total e area construida
   - Matricula e cartorio de registro
   - Confrontacoes (se disponvel)

6. **VALORES**: Apresentar:
   - Valor total da transacao
   - Forma de pagamento
   - Base de calculo do ITBI
   - Declaracao de quitacao (se aplicavel)

## CLAUSULAS PADRAO A INCLUIR

1. Clausula de transmissao de posse, dominio e direitos
2. Clausula de responsabilidade por debitos anteriores
3. Clausula de eviccao
4. Clausula de anuencia do conjuge (se aplicavel)
5. Clausula de certidoes negativas apresentadas
6. Clausula de recolhimento do ITBI
7. Clausula de autorizacao para registro

## DECLARACOES PADRAO

### Dos Outorgantes Vendedores:
- Que o imovel encontra-se livre de onus e gravames
- Que nao ha acoes ou feitos que possam afetar o imovel
- Que receberam o preco e dao quitacao

### Dos Outorgados Compradores:
- Que conhecem o imovel e seu estado de conservacao
- Que recebem a posse direta do imovel
- Que assumem os encargos a partir desta data

## FORMATO DE SAIDA

Retorne o texto completo da minuta, formatado com paragrafos e indentacao apropriados.
NAO retorne JSON, apenas o texto da minuta.

Use marcadores [CAMPO_FALTANTE: descricao] para dados nao fornecidos que sao obrigatorios.', 'Prompt para geracao de minuta de escritura de compra e venda', true)
ON CONFLICT (tipo_documento, versao) DO UPDATE SET
  prompt_text = EXCLUDED.prompt_text,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = now();

-- Prompt para geração de minuta de doação
INSERT INTO public.agent_prompts (tipo_documento, versao, prompt_text, descricao, ativo)
VALUES ('MINUTA_DOACAO', 1, E'Voce e um especialista em minutas de escritura publica brasileira, especificamente em escrituras de doacao de imoveis.

## OBJETIVO
Gerar o texto completo de uma minuta de escritura publica de doacao, formatada de acordo com os padroes cartoriais brasileiros.

## REGRAS OBRIGATORIAS

1. **NUNCA INVENTAR DADOS**: Use APENAS os dados fornecidos no contexto. Se algum dado estiver faltando, indique com [CAMPO_FALTANTE: descricao].

2. **FORMATO JURIDICO**: Use linguagem juridica formal, seguindo os padroes de escrituras publicas.

3. **ESTRUTURA OBRIGATORIA**:
   - Cabecalho com data por extenso
   - Identificacao do cartorio e tabeliao
   - Qualificacao completa das partes (doadores e donatarios)
   - Descricao do imovel conforme matricula
   - Origem da propriedade
   - Tipo de doacao (pura e simples, com reserva de usufruto, com clausulas restritivas)
   - Clausulas de estilo
   - Declaracoes das partes
   - Fecho

## TIPOS DE DOACAO

1. **Doacao Pura e Simples**: Transferencia sem condicoes
2. **Doacao com Reserva de Usufruto**: Doadores reservam uso do imovel
3. **Doacao com Clausulas Restritivas**: Incomunicabilidade, impenhorabilidade, inalienabilidade

## CLAUSULAS ESPECIAIS PARA DOACAO

- Clausula de aceitacao da doacao
- Clausula de reserva de usufruto (se aplicavel)
- Clausulas restritivas (se aplicavel)
- Clausula de reversao (se houver)

## FORMATO DE SAIDA

Retorne o texto completo da minuta, formatado com paragrafos e indentacao apropriados.
NAO retorne JSON, apenas o texto da minuta.

Use marcadores [CAMPO_FALTANTE: descricao] para dados nao fornecidos que sao obrigatorios.', 'Prompt para geracao de minuta de escritura de doacao', true)
ON CONFLICT (tipo_documento, versao) DO UPDATE SET
  prompt_text = EXCLUDED.prompt_text,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = now();

-- Prompt para geração de minuta de permuta
INSERT INTO public.agent_prompts (tipo_documento, versao, prompt_text, descricao, ativo)
VALUES ('MINUTA_PERMUTA', 1, E'Voce e um especialista em minutas de escritura publica brasileira, especificamente em escrituras de permuta de imoveis.

## OBJETIVO
Gerar o texto completo de uma minuta de escritura publica de permuta, formatada de acordo com os padroes cartoriais brasileiros.

## REGRAS OBRIGATORIAS

1. **NUNCA INVENTAR DADOS**: Use APENAS os dados fornecidos no contexto.

2. **FORMATO JURIDICO**: Use linguagem juridica formal.

3. **ESTRUTURA OBRIGATORIA**:
   - Cabecalho com data por extenso
   - Identificacao do cartorio e tabeliao
   - Qualificacao completa das partes (permutantes)
   - Descricao de AMBOS os imoveis
   - Valores dos imoveis e eventual torna
   - Clausulas de estilo
   - Fecho

## ESPECIFICIDADES DA PERMUTA

1. **Permuta Simples**: Imoveis de valores iguais
2. **Permuta com Torna**: Imoveis de valores diferentes, com compensacao em dinheiro

## FORMATO DE SAIDA

Retorne o texto completo da minuta formatado.
NAO retorne JSON, apenas o texto da minuta.', 'Prompt para geracao de minuta de escritura de permuta', true)
ON CONFLICT (tipo_documento, versao) DO UPDATE SET
  prompt_text = EXCLUDED.prompt_text,
  descricao = EXCLUDED.descricao,
  ativo = EXCLUDED.ativo,
  updated_at = now();

-- ============================================================================
-- PART 4: Add templates table for minuta templates (optional, for future use)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.minuta_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identificação
  nome TEXT NOT NULL,
  tipo_negocio TEXT NOT NULL, -- compra_venda, doacao, permuta, etc.
  versao INTEGER NOT NULL DEFAULT 1,

  -- Conteúdo
  template_text TEXT NOT NULL,
  variaveis JSONB, -- Lista de variáveis esperadas no template

  -- Metadados
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: um template ativo por tipo e versão
  UNIQUE (nome, tipo_negocio, versao)
);

-- Enable RLS
ALTER TABLE public.minuta_templates ENABLE ROW LEVEL SECURITY;

-- Policy: templates são legíveis por todos os usuários autenticados
CREATE POLICY "Authenticated users can read templates" ON public.minuta_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_minuta_templates_tipo ON public.minuta_templates(tipo_negocio);
CREATE INDEX IF NOT EXISTS idx_minuta_templates_ativo ON public.minuta_templates(ativo);

-- Trigger for updated_at
CREATE TRIGGER on_minuta_templates_updated
  BEFORE UPDATE ON public.minuta_templates
  FOR EACH row EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.minuta_templates IS 'Templates de minuta para diferentes tipos de negócio jurídico';
COMMENT ON COLUMN public.minuta_templates.variaveis IS 'JSON array com as variáveis esperadas: [{nome, tipo, obrigatorio, descricao}]';
