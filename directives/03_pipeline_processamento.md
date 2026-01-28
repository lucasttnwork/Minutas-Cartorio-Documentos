# Pipeline de Processamento

Este documento descreve as 3 fases de processamento de documentos cartoriais.

---

## Visão Geral

```
ENTRADA: Pasta com documentos de uma escritura

    ↓ FASE 1: CATALOGAÇÃO E CLASSIFICAÇÃO
    │   Scripts: inventory_files.py, classify_with_gemini.py, generate_catalog.py
    │   Saída: .tmp/catalogos/{caso_id}.json
    │
    ↓ FASE 3: EXTRAÇÃO ESTRUTURADA (Gemini 3 Flash)
    │   Script: extract_with_gemini.py
    │   Saída: .tmp/contextual/{caso_id}/*.json
    │
    ↓ FASE 4: MAPEAMENTO PARA MINUTA
    │   Script: map_to_fields.py
    │   Saída: .tmp/mapped/{caso_id}.json

SAÍDA: Dados estruturados prontos para preencher minuta
```

---

## Fase 1: Catalogação e Classificação

### 1.1 Objetivo
Identificar e catalogar todos os tipos de documentos em uma escritura usando classificação visual via Gemini.

### 1.2 Por Que Classificação Visual?
Nomes de arquivos frequentemente NÃO refletem o conteúdo real:
- `WhatsApp Image 2023-10-25 at 16.44.43.jpeg` → MATRICULA_IMOVEL
- `PSX_20230819_105401.jpg` → CERTIDAO_NASCIMENTO
- `Summary.pdf` → ASSINATURA_DIGITAL

### 1.3 Etapas

#### Etapa 1.1: Inventário Bruto
**Script:** `execution/inventory_files.py`

**Função:**
- Percorre recursivamente a pasta da escritura
- Exclui subpastas similares ao nome da pasta mãe (contêm documentos finais)
- Coleta metadados: nome, extensão, tamanho, caminho relativo, subpasta
- Gera lista bruta de arquivos

**Saída:** `.tmp/inventarios/{caso_id}_bruto.json`

#### Etapa 1.2: Classificação Visual via Gemini
**Script:** `execution/classify_with_gemini.py`

**Função:**
- Lê inventário bruto
- Para cada arquivo: carrega imagem/PDF e envia ao Gemini 2.0 Flash
- Recebe: tipo de documento, confiança, pessoa relacionada, observação

**Modos de Execução:**
- `--parallel`: Preparação em paralelo, envio serial (rate limiting)
- `--mock`: Teste sem API
- `--limit N`: Limitar quantidade para testes

**Rate Limiting:** 6 segundos entre requests (10 RPM do Gemini API free tier)

**Saída:** `.tmp/classificacoes/{caso_id}_classificacao.json`

#### Tratamento de Documentos Não Reconhecidos na Classificação

Quando o Gemini não consegue classificar um documento nos 26 tipos conhecidos, ele deve:

**1. Responder com tipo `DESCONHECIDO`:**
```json
{
  "tipo": "DESCONHECIDO",
  "confianca": 0.0,
  "tipo_sugerido": "INVENTARIO_EXTRAJUDICIAL",
  "descricao_documento": "Documento de partilha de bens com lista de herdeiros",
  "categoria_recomendada": "Documentos do Negócio",
  "caracteristicas_identificadoras": [
    "Título contendo 'Inventário' ou 'Partilha'",
    "Lista de herdeiros com qualificação completa",
    "Relação de bens com valores atribuídos",
    "Assinatura de advogado com OAB"
  ],
  "pessoa_relacionada": "ESPÓLIO DE FULANO DE TAL",
  "observacao": "Documento não catalogado - sugestão de novo tipo"
}
```

**2. Campos obrigatórios para DESCONHECIDO:**

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `tipo` | Sim | Sempre "DESCONHECIDO" |
| `confianca` | Sim | Sempre 0.0 para não reconhecidos |
| `tipo_sugerido` | Sim | Nome sugerido em MAIÚSCULAS_COM_UNDERSCORE |
| `descricao_documento` | Sim | O que o documento parece ser (1-2 frases) |
| `categoria_recomendada` | Sim | Uma das 5 categorias existentes |
| `caracteristicas_identificadoras` | Sim | Lista de 3-5 características visuais |
| `pessoa_relacionada` | Não | Nome da pessoa se identificável |
| `observacao` | Não | Contexto adicional |

**3. Fluxo de processamento para DESCONHECIDO:**

```
Documento classificado como DESCONHECIDO
        │
        ▼
┌─────────────────────────────────────────┐
│ Salvar em .tmp/novos_tipos/{caso_id}/   │
│  - Copiar documento original            │
│  - Salvar classificação com sugestões   │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Continuar pipeline normalmente          │
│  - Documento vai para catálogo          │
│  - Marcado para revisão manual          │
│  - Extração usa prompt genérico         │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│ Ao final do processamento:              │
│  - Gerar relatório de não reconhecidos  │
│  - Agregar sugestões de tipos novos     │
│  - Alertar operador para revisão        │
└─────────────────────────────────────────┘
```

**4. Critérios para classificar como DESCONHECIDO:**

- Nenhum dos 26 tipos se aplica
- Confiança em qualquer tipo seria < 50%
- Documento claramente é de um tipo novo (não é lixo ou duplicata)
- Documento tem dados úteis para a escritura

**5. Quando NÃO usar DESCONHECIDO:**

- Documento é claramente lixo (página em branco, propaganda)
- Documento é ilegível (usar `ILEGIVEL` como observação em `OUTRO`)
- Documento é duplicata de outro já classificado
- Documento poderia ser classificado com confiança >= 50%

#### Etapa 1.3: Geração do Catálogo Final
**Script:** `execution/generate_catalog.py`

**Função:**
- Combina inventário + classificação + contexto de subpasta
- Gera estatísticas: total, alta/média/baixa confiança
- Lista arquivos para revisão manual

**Saída:** `.tmp/catalogos/{caso_id}.json`

### 1.4 Regras de Exclusão

Subpastas cujo nome é similar ao da pasta mãe devem ser IGNORADAS:
- `FC515 - 124/` dentro de `FC 515 - 124 p280509/`
- `GS 357 - 11/` dentro de `GS 357 - 11 p.281773/`

**Motivo:** Contêm apenas documentos finais da escritura já lavrada.

---

## Fase 3: Extração Contextual com Gemini 3 Flash

### 3.1 Objetivo
Extrair dados estruturados diretamente de documentos visuais usando Gemini 3 Flash.

### 3.2 Arquitetura

```
+------------------+     +---------------------+     +------------------+
|   Documento      | --> | Gemini 3 Flash      | --> | Saída            |
|   Original       |     | (Prompt Espec.)     |     | Estruturada      |
+------------------+     +---------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   Arquivo PDF/IMG         Interpretação            JSON + Markdown
   (Direto - sem OCR)      Contextual               Catalogado
```

**IMPORTANTE:** O OCR foi removido. Gemini 3 Flash processa diretamente PDFs e imagens.

### 3.3 Script Principal
**Script:** `execution/extract_with_gemini.py`

**Função:**
- Carrega documento original (PDF/imagem) diretamente
- Seleciona prompt apropriado para o tipo de documento
- Envia para Gemini 3 Flash (multimodal)
- Processa resposta em 3 outputs: reescrita, explicação, JSON
- Salva arquivos estruturados

**Modos de Execução:**
- Serial: Processamento sequencial
- `--parallel`: Processamento paralelo com rate limiting
- `--workers N`: Número de workers paralelos
- `--rpm N`: Rate limit configurável

**Saída:** `.tmp/contextual/{caso_id}/*.json`

### 3.4 Processamento de Arquivos

| Extensão | Processamento |
|----------|--------------|
| .pdf | Extrai todas as páginas e concatena verticalmente |
| .docx | Converte para PDF, depois extrai páginas |
| .jpg, .jpeg, .png | Leitura direta |
| .tiff, .bmp | Conversão para JPEG |

**Zoom Adaptativo:**
- ≤10 páginas: zoom 2.0
- >10 páginas: zoom 1.5

### 3.5 Regras Críticas de Extração

#### REGRA #1: NUNCA FABRICAR DADOS
- Se ilegível, retornar `null`
- PROIBIDO: "EXEMPLO DE NOME", "01/01/XXXX", dados por suposição
- Preferir `null` a dados incorretos

#### REGRA #2: EXPLICAÇÃO CONTEXTUAL OBRIGATÓRIA
- Campo `explicacao_contextual` deve ter 3-5 parágrafos
- Identificar o que é o documento
- Descrever dados principais
- Explicar situação/contexto
- Listar observações relevantes

#### REGRA #3: VALIDAÇÃO DE VALORES FINANCEIROS
Em contratos de compra e venda:
```
sinal + saldo = preco_total
```
Não confundir entrada com valor total.

#### REGRA #4: CÓDIGO DE AUTENTICAÇÃO
Campo OBRIGATÓRIO em comprovantes de pagamento.
Procurar em: página 2, rodapé, área de validação.

#### REGRA #5: ÔNUS EM MATRÍCULAS
- Capturar TODOS os ônus (ativos e históricos)
- Verificar status: QUITADA, BAIXADA, EM VIGÊNCIA
- Estruturar em `onus_ativos` e `onus_historicos`

#### REGRA #6: DISTINGUIR PESSOAS
- TITULAR: pessoa do documento (quem é identificado/certificado)
- AUTORIDADE: oficial que emite/assina
- Nunca retornar nome da autoridade como titular

### 3.6 Prompts Especializados

| Tipo de Documento | Arquivo de Prompt |
|-------------------|-------------------|
| RG | `execution/prompts/rg.txt` |
| CNDT | `execution/prompts/cndt.txt` |
| MATRICULA_IMOVEL | `execution/prompts/matricula_imovel.txt` |
| COMPROMISSO_COMPRA_VENDA | `execution/prompts/compromisso_compra_venda.txt` |
| IPTU | `execution/prompts/iptu.txt` |
| ITBI | `execution/prompts/itbi.txt` |
| (outros) | `execution/prompts/generic.txt` |

---

## Fase 4: Mapeamento para Campos da Minuta

### 4.1 Objetivo
Mapear dados extraídos para os 180+ campos padronizados da minuta, consolidando informações de múltiplas fontes.

### 4.2 Script Principal
**Script:** `execution/map_to_fields.py`

**Função:**
- Carrega todos os JSONs de dados extraídos
- Identifica alienantes (vendedores) e adquirentes (compradores)
- Mapeia campos específicos de cada tipo de documento
- Resolve conflitos entre fontes usando sistema de prioridades
- Normaliza formatos (CPF, valores monetários, áreas)
- Rastreia origem de cada campo
- Gera arquivo consolidado com metadados

**Saída:** `.tmp/mapped/{caso_id}.json`

### 4.3 Estrutura da Saída

```json
{
  "metadata": {
    "caso_id": "FC_515_124_p280509",
    "documentos_processados": 37,
    "campos_preenchidos": 85,
    "campos_faltantes": ["alienante[0].naturalidade", ...]
  },
  "alienantes": [...],
  "adquirentes": [...],
  "imovel": {...},
  "negocio": {...},
  "certidoes": {...}
}
```

### 4.4 Sistema de Resolução de Conflitos

Quando o mesmo dado aparece em múltiplos documentos, usar esta prioridade:

| Prioridade | Tipo de Documento | Justificativa |
|------------|-------------------|---------------|
| 100 | RG | Documento oficial de identificação |
| 95 | CERTIDAO_NASCIMENTO | Oficial estado civil |
| 90 | CERTIDAO_CASAMENTO | Oficial matrimonial |
| 85 | COMPROMISSO_COMPRA_VENDA | Assinado pelas partes |
| 80 | MATRICULA_IMOVEL | Oficial do RI |
| 75 | CNDT | Certidão oficial trabalhista |
| 70 | ITBI | Oficial tributo municipal |
| 65 | IPTU | Oficial cadastro municipal |
| 60 | VVR | Oficial avaliação municipal |
| 55 | CND_MUNICIPAL | Certidão municipal |
| 50 | ESCRITURA | Referência |
| 40 | COMPROVANTE_PAGAMENTO | Auxiliar |
| 30 | PROTOCOLO_ONR | Controle administrativo |
| 20 | ASSINATURA_DIGITAL | Certificado técnico |
| 10 | OUTRO | Não classificado |

### 4.5 Rastreamento de Fontes

Cada campo registra de qual documento veio:

```json
{
  "nome": "FULANO DE TAL SILVA",
  "cpf": "123.456.789-00",
  "_fontes": {
    "nome": ["001_RG.json", "005_COMPROMISSO.json"],
    "cpf": ["005_COMPROMISSO.json"]
  }
}
```

### 4.6 Normalização de Dados

| Tipo | Formato de Saída | Exemplo |
|------|------------------|---------|
| CPF | XXX.XXX.XXX-XX | 123.456.789-00 |
| Valores | R$ X.XXX.XXX,XX | R$ 615.000,00 |
| Áreas | XX,XX m2 | 85,50 m2 |
| Datas | DD/MM/AAAA | 27/01/2026 |

### 4.7 Identificação de Papéis

O script identifica quem vende (alienante) e quem compra (adquirente):

**Estratégia 1: Compromisso de Compra e Venda (Principal)**
- `vendedores[]` → Alienantes
- `compradores[]` → Adquirentes

**Estratégia 2: Catálogo (Fallback)**
- Campo `papel_inferido` baseado na subpasta (VENDEDORES/, COMPRADORA/)

---

## Campos Mapeados por Categoria

### Alienantes/Adquirentes (Pessoas)

**Identificação Pessoal:**
- nome, cpf, rg, orgao_emissor_rg, estado_emissor_rg, data_emissao_rg, data_nascimento

**Naturalidade e Filiação:**
- nacionalidade, naturalidade, filiacao_pai, filiacao_mae

**Estado Civil:**
- estado_civil, regime_bens, data_casamento, conjuge, profissao

**Domicílio:**
- logradouro, numero, complemento, bairro, cidade, estado, cep

**Certidões:**
- cndt (numero, data_expedicao, hora_expedicao, validade, status)

### Imóvel

**Matrícula:**
- numero, registro_imoveis, cidade, estado

**Descrição:**
- tipo, edificio, unidade, bloco, andar
- area_total, area_privativa, area_comum, fracao_ideal

**Endereço:**
- logradouro, numero, complemento, bairro, cidade, estado, cep

**Cadastro Municipal:**
- sql

**Valores Venais:**
- iptu, vvr, ano_exercicio

**Ônus:**
- proprietarios, onus_ativos, onus_historicos

### Negócio Jurídico

**Valores:**
- total, fracao_alienada

**Forma de Pagamento:**
- tipo, sinal, saldo, prazo

**ITBI:**
- numero_guia, base_calculo, valor, data_vencimento, data_pagamento

**Corretagem:**
- valor, responsavel, intermediador

---

## Configuração do Gemini

### Modelo e Parâmetros

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| Modelo | `gemini-3-flash-preview` | Última versão, melhor performance |
| Temperature | 0.1 | Respostas determinísticas |
| Max Output Tokens | 16384 | Documentos longos + explicações |

### Rate Limiting por Tier

| Tier | RPM | Workers Recomendados |
|------|-----|---------------------|
| Free | 15 | 3 |
| Paid | 150 | 10 |

### Custos Estimados

| Métrica | Valor |
|---------|-------|
| Input | $0.50 / 1M tokens |
| Output | $3.00 / 1M tokens |
| Documento médio | ~3K tokens in, ~2K tokens out |
| Custo por documento | ~$0.008 |
| Escritura (40 docs) | ~$0.32 |
