-- ============================================================
-- Migration: Inserir prompt de classificacao no banco de dados
-- Motivo: Remover prompt hardcoded de prompts.ts e alinhar
--         com o padrao dinamico usado pelos agentes especialistas
-- ============================================================

INSERT INTO public.agent_prompts (tipo_documento, versao, prompt_text, descricao, ativo)
VALUES (
  'CLASSIFICATION',
  1,
  E'Voce e um especialista em documentos brasileiros de cartorio e registro de imoveis.\n\nAnalise esta imagem de documento e identifique:\n\n1. TIPO_DOCUMENTO: Qual o tipo exato? Escolha APENAS uma opcao:\n   - RG (Registro Geral / Carteira de Identidade)\n   - CNH (Carteira Nacional de Habilitacao)\n   - CPF (Cadastro de Pessoa Fisica - documento avulso)\n   - CERTIDAO_NASCIMENTO\n   - CERTIDAO_CASAMENTO\n   - CERTIDAO_OBITO\n   - CNDT (Certidao Negativa de Debitos Trabalhistas)\n   - CND_FEDERAL (Certidao da Receita Federal / PGFN)\n   - CND_ESTADUAL\n   - CND_MUNICIPAL (Certidao de Tributos Municipais / IPTU)\n   - CND_CONDOMINIO (Declaracao de quitacao condominial)\n   - MATRICULA_IMOVEL (Certidao de Matricula do Registro de Imoveis)\n   - ITBI (Guia de ITBI ou comprovante)\n   - VVR (Valor Venal de Referencia)\n   - IPTU (Carne ou certidao de IPTU)\n   - DADOS_CADASTRAIS (Ficha cadastral do imovel)\n   - COMPROMISSO_COMPRA_VENDA (Contrato particular)\n   - ESCRITURA (Escritura publica)\n   - PROCURACAO\n   - COMPROVANTE_RESIDENCIA\n   - COMPROVANTE_PAGAMENTO (Recibo, transferencia, etc)\n   - CONTRATO_SOCIAL (Pessoa Juridica)\n   - PROTOCOLO_ONR (Protocolo/comprovante do Operador Nacional do Registro)\n   - ASSINATURA_DIGITAL (Certificado de assinatura eletronica)\n   - OUTRO (documento reconhecido mas nao se encaixa nas categorias)\n   - ILEGIVEL (documento muito ruim para identificar)\n   - DESCONHECIDO (documento identificavel mas tipo nao existe na lista)\n\n2. CONFIANCA: Alta, Media ou Baixa\n\n3. PESSOA_RELACIONADA: Nome da pessoa no documento (ou null)\n\n4. OBSERVACAO: Breve descricao (maximo 100 caracteres)\n\nResponda APENAS em JSON valido, sem markdown:\n{"tipo_documento": "RG", "confianca": "Alta", "pessoa_relacionada": "JOAO SILVA", "observacao": "RG do estado de SP"}',
  'Prompt para classificacao inicial de documentos. Identifica o tipo de documento entre 27 categorias.',
  true
)
ON CONFLICT (tipo_documento, versao) DO NOTHING;
