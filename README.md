# Agentic-Dev-Minuta-IA

Sistema de catalogacao e extracao de dados de documentos para escrituras de compra e venda de imoveis.

## Estrutura de Pastas

- `directives/`: Procedimentos Operacionais Padrao (SOPs) em Markdown.
- `execution/`: Scripts Python deterministicos para execucao de tarefas.
- `.tmp/`: Arquivos intermediarios e temporarios (nao versionados).
- `.env`: Variaveis de ambiente e segredos (nao versionados).
- `Test-Docs/`: Documentos de teste para validacao do sistema.
- `Guia-de-campos-e-variaveis/`: Referencia dos 180+ campos de minutas.

## Diretrizes de Operacao

O sistema opera atraves de uma arquitetura de 3 camadas:
1. **Layer 1: Diretiva** (O que fazer) - `directives/`
2. **Layer 2: Orquestracao** (Como coordenar) - Agente IA
3. **Layer 3: Execucao** (Acao tecnica) - `execution/`

Para mais detalhes, consulte `directives/00_system_architecture.md`.

---

## Uso

### Fase 1: Catalogacao de Documentos

A Fase 1 consiste em 3 etapas para catalogar e classificar documentos de uma escritura.

#### Pre-requisitos

1. Configure o arquivo `.env` com as credenciais:
```env
GEMINI_API_KEY=sua_chave_api
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/credentials.json
```

2. Instale as dependencias:
```bash
pip install python-dotenv google-generativeai Pillow PyMuPDF
```

#### Etapa 1.1: Inventario de Arquivos

Gera lista bruta de todos os arquivos em uma pasta de escritura.

```bash
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"
```

**Saida:** `.tmp/inventarios/FC_515_124_p280509_bruto.json`

#### Etapa 1.2: Classificacao Visual

Classifica cada documento usando Gemini Vision.

**Modo Serial (padrao):**
```bash
python execution/classify_with_gemini.py FC_515_124_p280509
```

**Modo Paralelo (recomendado para >10 arquivos):**
```bash
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel
```

**Modo Mock (teste sem API):**
```bash
python execution/classify_with_gemini.py FC_515_124_p280509 --mock
```

**Limitar quantidade (para testes):**
```bash
python execution/classify_with_gemini.py FC_515_124_p280509 --limit 5
```

**Saida:** `.tmp/classificacoes/FC_515_124_p280509_classificacao.json`

#### Etapa 1.3: Geracao do Catalogo Final

Combina inventario e classificacao em um catalogo estruturado.

```bash
python execution/generate_catalog.py FC_515_124_p280509
```

**Saida:** `.tmp/catalogos/FC_515_124_p280509.json`

---

### Flags Disponiveis

| Flag | Descricao | Uso |
|------|-----------|-----|
| `--parallel` | Preparacao de imagens em paralelo | Reduz tempo em ~40% para >10 arquivos |
| `--mock` | Classificacao por heuristica de nome | Testes sem consumir API |
| `--limit N` | Processa apenas N arquivos | Testes rapidos |
| `--verbose` | Saida detalhada | Debug |
| `--input` | Caminho customizado para inventario | Uso avancado |
| `--output` | Caminho customizado para saida | Uso avancado |

---

### Tempos de Processamento

| Arquivos | Modo Serial | Modo Paralelo |
|----------|-------------|---------------|
| 10 | ~1 min | ~40s |
| 39 | ~4 min | ~2.5 min |
| 100 | ~10 min | ~6 min |

**Nota:** Tempos estimados. Variam com conexao e tamanho dos arquivos.

---

### Tipos de Documentos Reconhecidos

O sistema reconhece 26 tipos de documentos:

**Documentos Pessoais (7):** RG, CNH, CPF, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, CERTIDAO_OBITO, COMPROVANTE_RESIDENCIA

**Certidoes (7):** CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, CND_IMOVEL, CND_CONDOMINIO, CONTRATO_SOCIAL

**Documentos do Imovel (6):** MATRICULA_IMOVEL, ITBI, VVR, IPTU, DADOS_CADASTRAIS, ESCRITURA

**Documentos do Negocio (3):** COMPROMISSO_COMPRA_VENDA, PROCURACAO, COMPROVANTE_PAGAMENTO

**Documentos Administrativos (3):** PROTOCOLO_ONR, ASSINATURA_DIGITAL, OUTRO

Para detalhes de cada tipo, consulte `directives/02_tipos_documentos_completo.md`.

---

### Exemplo Completo

```bash
# 1. Inventario
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"

# 2. Classificacao (modo paralelo)
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel

# 3. Catalogo final
python execution/generate_catalog.py FC_515_124_p280509

# Ver resultado
cat .tmp/catalogos/FC_515_124_p280509.json
```

---

### Fase 2: OCR com Document AI

A Fase 2 extrai texto de cada documento catalogado usando Google Document AI.

#### Pre-requisitos

1. Configure as credenciais do Document AI no `.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=caminho/para/credentials.json
PROJECT_ID=seu-projeto-gcp
PROCESSOR_ID=seu-processador-document-ai
```

2. Instale dependencias adicionais:
```bash
pip install google-cloud-documentai pywin32
```

#### Uso Basico

**Processar documento unico:**
```bash
python execution/ocr_document_ai.py "Test-Docs/FC 515 - 124 p280509/COMPRADORA/RG.jpg"
```

**Processar em lote (recomendado):**
```bash
python execution/batch_ocr.py FC_515_124_p280509
```

**Modo paralelo (mais rapido):**
```bash
python execution/batch_ocr.py FC_515_124_p280509 --parallel --workers 4
```

**Modo mock (teste sem API):**
```bash
python execution/batch_ocr.py FC_515_124_p280509 --mock
```

**Reprocessar documentos:**
```bash
python execution/batch_ocr.py FC_515_124_p280509 --force
```

#### Flags Disponiveis (Fase 2)

| Flag | Descricao | Uso |
|------|-----------|-----|
| `--parallel` | Processamento em paralelo | Reduz tempo em ~60% |
| `--workers N` | Numero de workers paralelos | Padrao: 4 |
| `--force` | Reprocessa documentos ja processados | Corrigir erros |
| `--mock` | OCR simulado sem API | Testes rapidos |

#### Saidas

- `.tmp/ocr/{escritura_id}/` - Arquivos `.txt` com texto extraido
- `.tmp/ocr/{escritura_id}_relatorio.json` - Relatorio de processamento
- Catalogo atualizado com campos `status_ocr`, `data_ocr`, `confianca_ocr`

#### Limpeza de Arquivos Temporarios

```bash
python execution/clean_temp_files.py
```

---

## Status do Projeto

| Fase | Status | Descricao |
|------|--------|-----------|
| Fase 1 | COMPLETA | Catalogacao e classificacao visual |
| Fase 2 | COMPLETA | OCR com Google Document AI |
| Fase 3 | COMPLETA | Extracao de dados estruturados |
| Fase 4 | PLANEJADA | Mapeamento para campos da minuta |

### Resultados da Validacao (Fase 1)

- **39 documentos** processados
- **100%** taxa de sucesso
- **100%** classificados com alta confianca
- **0** erros de processamento
- **4** arquivos para revisao manual (tipo OUTRO)

### Resultados da Validacao (Fase 2)

- **39 documentos** processados via OCR
- **93.36%** confianca media
- **0** erros de processamento
- **~1m 40s** tempo total (paralelo, 4 workers)
- **2 DOCX** convertidos para PDF automaticamente

**Qualidade por tipo de documento:**
| Tipo | Confianca | Observacao |
|------|-----------|------------|
| COMPROVANTE_PAGAMENTO | 97.7% | Melhor qualidade |
| VVR | 97.1% | Excelente |
| ITBI | 96.6% | Excelente |
| CERTIDAO_NASCIMENTO | 84.1% | Ainda aceitavel |

### Resultados da Validacao (Fase 3)

- **39 documentos** processados
- **38 com campos extraidos** (97.4%)
- **81.35%** confianca media
- **0.06s** tempo total

---

### Fase 3: Extracao Estruturada

A Fase 3 extrai campos estruturados de cada documento usando os textos OCR.

#### Uso Basico

```bash
python execution/extract_structured.py FC_515_124_p280509
```

#### Flags Disponiveis (Fase 3)

| Flag | Descricao | Uso |
|------|-----------|-----|
| `--type TIPO` | Filtra por tipo de documento | Processar apenas RG, CNH, etc |
| `--limit N` | Processa apenas N documentos | Testes rapidos |
| `--verbose` | Saida detalhada | Debug |

#### Saida

- `.tmp/structured/{escritura_id}/*.json` - Arquivos JSON com campos extraidos por documento

---

## Documentacao

| Documento | Descricao |
|-----------|-----------|
| `directives/00_system_architecture.md` | Arquitetura de 3 camadas |
| `directives/01_plano_catalogacao_documentos.md` | Plano completo do projeto |
| `directives/02_tipos_documentos_completo.md` | Referencia dos 26 tipos de documentos |
| `directives/03_fase2_ocr_completa.md` | Documentacao da Fase 2 (OCR) |
| `Guia-de-campos-e-variaveis/` | Campos de minutas (180+) |

---

## Creditos

Desenvolvido com:
- Google Gemini Vision (classificacao)
- Google Document AI (OCR - Fase 2)
- Arquitetura 3-Layer para sistemas agentivos

---

*Versao 1.4 - 2026-01-27*
