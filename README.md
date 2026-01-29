# Agentic-Dev-Minuta-IA

Sistema de catalogacao e extracao de dados de documentos para escrituras de compra e venda de imoveis.

## Estrutura de Pastas

- `directives/`: Procedimentos Operacionais Padrao (SOPs) em Markdown.
- `execution/`: Scripts Python deterministicos para execucao de tarefas.
- `.tmp/`: Arquivos intermediarios e temporarios (nao versionados).
- `.env`: Variaveis de ambiente e segredos (nao versionados).
- `Test-Docs/`: Documentos de teste para validacao do sistema.
- `Guia-de-campos-e-variaveis/`: Referencia dos 180+ campos de minutas.
- `documentacao/`: Documentacao tecnica detalhada do sistema.

## Diretrizes de Operacao

O sistema opera atraves de uma arquitetura de 3 camadas:
1. **Layer 1: Diretiva** (O que fazer) - `directives/`
2. **Layer 2: Orquestracao** (Como coordenar) - Agente IA
3. **Layer 3: Execucao** (Acao tecnica) - `execution/`

Para mais detalhes, consulte `directives/01_arquitetura_sistema.md`.

---

## Pipeline de Processamento

O sistema processa documentos em 3 fases principais:

```
ENTRADA: Pasta com documentos de uma escritura

    | FASE 1: CATALOGACAO E CLASSIFICACAO
    |   Scripts: inventory_files.py, classify_with_gemini.py, generate_catalog.py
    |   Saida: .tmp/catalogos/{caso_id}.json
    |
    v
    | FASE 3: EXTRACAO ESTRUTURADA (Gemini 3 Flash - Multimodal)
    |   Script: extract_with_gemini.py
    |   Saida: .tmp/contextual/{caso_id}/*.json
    |
    v
    | FASE 4: MAPEAMENTO PARA MINUTA
    |   Script: map_to_fields.py
    |   Saida: .tmp/mapped/{caso_id}.json

SAIDA: Dados estruturados prontos para preencher minuta (180+ campos)
```

> **IMPORTANTE:** O sistema utiliza **Gemini 3 Flash** para processar documentos diretamente (multimodal), sem necessidade de OCR intermediario.

---

## Pre-requisitos

### Ambiente Python
```bash
# Verificar Python
python --version  # Requer 3.8+

# Instalar dependencias
pip install -r execution/requirements.txt
```

### Configuracao de Credenciais

Copie `.env.example` para `.env` e preencha:
```env
GEMINI_API_KEY=[SUA_GEMINI_API_KEY]
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_MODEL_FALLBACK=gemini-2.5-flash
GOOGLE_APPLICATION_CREDENTIALS=credentials/[SEU_ARQUIVO].json
GOOGLE_PROJECT_ID=[SEU_PROJECT_ID]
```

---

## Uso

### Pipeline Completo (Recomendado)

> **NOTA:** Este projeto usa exclusivamente o plano pago do Gemini (150 RPM).
> Os scripts ja vem com configuracoes otimizadas. Basta usar `--parallel`.

```bash
# Defina o caso
CASO="FC_515_124_p280509"

# Pipeline completo em uma linha
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509" && \
python execution/classify_with_gemini.py $CASO --parallel && \
python execution/generate_catalog.py $CASO && \
python execution/extract_with_gemini.py $CASO --parallel && \
python execution/map_to_fields.py $CASO
```

---

### Fase 1: Catalogacao e Classificacao

#### Etapa 1.1: Inventario de Arquivos

Gera lista bruta de todos os arquivos em uma pasta de escritura.

```bash
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"
```

**Saida:** `.tmp/inventarios/FC_515_124_p280509_bruto.json`

#### Etapa 1.2: Classificacao Visual

Classifica cada documento usando Gemini Vision (26 tipos reconhecidos).

```bash
# Modo paralelo (recomendado)
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel

# Modo mock (teste sem API)
python execution/classify_with_gemini.py FC_515_124_p280509 --mock

# Limitar quantidade (para testes)
python execution/classify_with_gemini.py FC_515_124_p280509 --limit 5
```

**Saida:** `.tmp/classificacoes/FC_515_124_p280509_classificacao.json`

**Flags disponiveis:**

| Flag | Descricao | Default |
|------|-----------|---------|
| `--parallel` / `-p` | Modo paralelo otimizado | False |
| `--api-workers N` | Workers para chamadas API | 5 |
| `--batch-size N` | Imagens por request | 4 |
| `--mock` / `-m` | Teste sem API | False |
| `--limit N` | Processar apenas N arquivos | Todos |
| `--verbose` / `-v` | Log detalhado | False |

#### Etapa 1.3: Geracao do Catalogo Final

```bash
python execution/generate_catalog.py FC_515_124_p280509
```

**Saida:** `.tmp/catalogos/FC_515_124_p280509.json`

---

### Fase 3: Extracao Estruturada

Extrai dados estruturados diretamente dos documentos usando Gemini 3 Flash (multimodal).

```bash
# Modo paralelo (recomendado)
python execution/extract_with_gemini.py FC_515_124_p280509 --parallel

# Com filtro de tipo
python execution/extract_with_gemini.py FC_515_124_p280509 --type MATRICULA_IMOVEL

# Com limite (para testes)
python execution/extract_with_gemini.py FC_515_124_p280509 --limit 5 --verbose
```

**Saida:** `.tmp/contextual/FC_515_124_p280509/*.json`

**Flags disponiveis:**

| Flag | Descricao | Default |
|------|-----------|---------|
| `--parallel` / `-p` | Modo paralelo | False |
| `--workers N` | Numero de workers | 5 |
| `--rpm N` | Rate limit (req/min) | 150 |
| `--type TIPO` | Filtrar por tipo | Todos |
| `--limit N` | Limitar quantidade | Todos |
| `--verbose` | Log detalhado | False |

**Caracteristicas:**
- Processa PDFs e imagens diretamente (sem OCR intermediario)
- Usa prompts especializados por tipo de documento (20 prompts)
- Selecao automatica de prompt compacto para matriculas grandes (>2MB)
- Gera JSON estruturado + explicacao contextual

---

### Fase 4: Mapeamento para Minuta

Mapeia dados extraidos para os 180+ campos padronizados da minuta.

```bash
# Mapeamento basico
python execution/map_to_fields.py FC_515_124_p280509

# Com log verbose
python execution/map_to_fields.py FC_515_124_p280509 --verbose
```

**Saida:** `.tmp/mapped/FC_515_124_p280509.json`

**Estrutura da saida:**
```json
{
  "metadata": {
    "caso_id": "FC_515_124_p280509",
    "documentos_processados": 37,
    "campos_preenchidos": 85,
    "campos_faltantes": [...]
  },
  "alienantes": [...],
  "anuentes": [...],
  "adquirentes": [...],
  "imovel": {...},
  "negocio": {...}
}
```

**Funcionalidades:**
- Identifica automaticamente alienantes (vendedores) e adquirentes (compradores)
- Resolve conflitos entre fontes usando sistema de prioridades
- Consolida pessoas com CPFs divergentes (erros de OCR)
- Separa conjuge anuentes dos alienantes
- Rastreia origem de cada campo

---

## Tipos de Documentos Reconhecidos

O sistema reconhece **26 tipos** de documentos:

| Categoria | Tipos |
|-----------|-------|
| **Pessoais (7)** | RG, CNH, CPF, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, CERTIDAO_OBITO, COMPROVANTE_RESIDENCIA |
| **Certidoes (7)** | CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, CND_IMOVEL, CND_CONDOMINIO, CONTRATO_SOCIAL |
| **Imovel (6)** | MATRICULA_IMOVEL, ITBI, VVR, IPTU, DADOS_CADASTRAIS, ESCRITURA |
| **Negocio (3)** | COMPROMISSO_COMPRA_VENDA, PROCURACAO, COMPROVANTE_PAGAMENTO |
| **Administrativos (3)** | PROTOCOLO_ONR, ASSINATURA_DIGITAL, OUTRO |

Para detalhes de cada tipo, consulte `directives/02_tipos_documentos.md`.

---

## Tempos de Processamento

| Fase | Configuracao | Tempo (40 docs) |
|------|--------------|-----------------|
| 1.2 Classificacao | Paralelo + Batch | ~2.5 min |
| 3 Extracao | 10 workers | ~4 min |
| 4 Mapeamento | - | ~1 seg |
| **TOTAL** | Otimizado | **~7 min** |

---

## Status do Projeto

| Fase | Status | Descricao |
|------|--------|-----------|
| Fase 1 | **COMPLETA** | Catalogacao e classificacao visual |
| Fase 3 | **COMPLETA** | Extracao estruturada com Gemini 3 Flash |
| Fase 4 | **COMPLETA** | Mapeamento para 180+ campos da minuta |

---

## Funcionalidades Avancadas

### Selecao Automatica de Prompt para Matriculas Grandes

Matriculas de imovel grandes (>2MB) usam automaticamente um prompt compacto otimizado para evitar estouro de tokens.

### Consolidacao de Pessoas com CPFs Duplicados

O sistema detecta e consolida automaticamente registros duplicados causados por erros de leitura:
1. CPF com digito verificador valido tem prioridade
2. CPF mais frequente e o correto
3. Em empate, fonte de maior prioridade vence (RG > CNH > Compromisso)

### Processamento de CNH

Documentos CNH sao processados e extraem: nome, CPF, RG, data de nascimento, filiacao.

### Tratamento de Anuentes

Conjuges que anuem na venda sao separados em campo proprio (`anuentes`), vinculados ao alienante correspondente.

---

## Estrutura de Saida

```
.tmp/
├── inventarios/
│   └── {caso_id}_bruto.json        # Fase 1.1
├── classificacoes/
│   └── {caso_id}_classificacao.json # Fase 1.2
├── catalogos/
│   └── {caso_id}.json              # Fase 1.3
├── contextual/
│   └── {caso_id}/
│       ├── 001_RG.json             # Fase 3
│       ├── 002_MATRICULA_IMOVEL.json
│       └── ...
└── mapped/
    └── {caso_id}.json              # Fase 4
```

---

## Documentacao

| Documento | Descricao |
|-----------|-----------|
| `directives/01_arquitetura_sistema.md` | Arquitetura de 3 camadas e self-annealing |
| `directives/02_tipos_documentos.md` | Referencia dos 26 tipos de documentos |
| `directives/03_pipeline_processamento.md` | Detalhes tecnicos das fases |
| `directives/04_manual_operacao.md` | Manual completo de operacao |
| `documentacao/FONTE_DE_VERDADE.md` | Referencia central autoritativa |
| `documentacao/DOCUMENTACAO_SCHEMAS_PROMPTS.md` | Schemas e prompts detalhados |
| `Guia-de-campos-e-variaveis/` | Campos de minutas (180+) |

---

## Utilitarios

### Limpeza de Arquivos Temporarios
```bash
python execution/clean_temp_files.py --execute
```

### Verificar Catalogo
```bash
python -c "import json; d = json.load(open('.tmp/catalogos/{caso_id}.json')); print(json.dumps(d['estatisticas'], indent=2))"
```

### Verificar Mapeamento
```bash
python -c "
import json
d = json.load(open('.tmp/mapped/{caso_id}.json'))
print('Alienantes:', len(d.get('alienantes', [])))
print('Adquirentes:', len(d.get('adquirentes', [])))
print('Campos faltantes:', len(d.get('metadata', {}).get('campos_faltantes', [])))
"
```

---

## Creditos

Desenvolvido com:
- **Google Gemini 3 Flash** (classificacao e extracao multimodal)
- Arquitetura 3-Layer para sistemas agentivos

---

*Versao 2.0 - 2026-01-29*
