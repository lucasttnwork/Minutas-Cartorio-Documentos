# Manual de Operação

Este documento contém instruções práticas para executar o sistema de processamento de documentos cartoriais.

---

## 1. Pré-Requisitos

### 1.1 Ambiente Python
```bash
# Verificar Python
python --version  # Requer 3.8+

# Instalar dependências
pip install -r execution/requirements.txt
```

### 1.2 Configuração de Credenciais

**Arquivo `.env`:** (copie de `.env.example` e preencha com seus valores)
```env
GOOGLE_APPLICATION_CREDENTIALS=credentials/[SEU_ARQUIVO_CREDENCIAIS].json
GOOGLE_PROJECT_ID=[SEU_PROJECT_ID]
DOCUMENT_AI_PROCESSOR_ID=[SEU_PROCESSOR_ID]
DOCUMENT_AI_LOCATION=us
GEMINI_API_KEY=[SUA_GEMINI_API_KEY]
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_MODEL_FALLBACK=gemini-2.5-flash
```

**Credencial Google Cloud:**
- Arquivo JSON em `credentials/`
- Tipo: Service Account

### 1.3 Estrutura de Documentos de Entrada

```
Test-Docs/
└── {nome_escritura}/
    ├── COMPRADORA/     # Docs do comprador
    │   ├── RG.jpg
    │   ├── Certidao_Casamento.pdf
    │   └── ...
    ├── VENDEDORES/     # Docs do vendedor
    │   ├── RG.pdf
    │   ├── CNDT.pdf
    │   └── ...
    └── recibos/        # Comprovantes
        └── ...
```

---

## 2. Comandos de Execução

### 2.1 Pipeline Completo

> **NOTA:** Este projeto usa exclusivamente o plano pago do Gemini (150 RPM).
> Os scripts já vêm com configurações otimizadas. Basta usar `--parallel`.

Execute as fases na ordem:

```bash
# Defina o caso
CASO="FC_515_124_p280509"

# Fase 1: Catalogação
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"
python execution/classify_with_gemini.py $CASO --parallel
python execution/generate_catalog.py $CASO

# Fase 3: Extração
python execution/extract_with_gemini.py $CASO --parallel

# Fase 4: Mapeamento
python execution/map_to_fields.py $CASO
```

**Pipeline Completo em Uma Linha:**
```bash
CASO="FC_515_124_p280509"

python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509" && \
python execution/classify_with_gemini.py $CASO --parallel && \
python execution/generate_catalog.py $CASO && \
python execution/extract_with_gemini.py $CASO --parallel && \
python execution/map_to_fields.py $CASO
```

### 2.2 Fase 1: Catalogação

```bash
# 1.1 Inventário bruto
python execution/inventory_files.py "Test-Docs/{pasta_escritura}"
# Saída: .tmp/inventarios/{caso_id}_bruto.json

# 1.2 Classificação visual (já otimizado para plano pago)
python execution/classify_with_gemini.py {caso_id} --parallel
# Saída: .tmp/classificacoes/{caso_id}_classificacao.json

# 1.3 Gerar catálogo final
python execution/generate_catalog.py {caso_id}
# Saída: .tmp/catalogos/{caso_id}.json
```

**Flags disponíveis para classify_with_gemini.py:**

| Flag | Descrição | Default |
|------|-----------|---------|
| `--parallel` / `-p` | Ativa modo paralelo otimizado | False |
| `--api-workers N` | Workers para chamadas API paralelas | 5 |
| `--batch-size N` / `-b N` | Imagens por request (1=desabilita batch) | 4 |
| `--workers N` / `-w N` | Workers para preparação de documentos | 10 |
| `--mock` / `-m` | Teste sem API (classifica por nome) | False |
| `--limit N` / `-l N` | Processar apenas N arquivos | Todos |
| `--verbose` / `-v` | Log detalhado | False |
| `--consolidar-descobertas` | Agrupa documentos DESCONHECIDO | - |

**Otimizações de Performance:**

1. **Pré-classificação por Nome:** Documentos com nomes óbvios (RG_, CNDT_, ITBI_) são classificados localmente sem API
2. **Batch Processing:** Múltiplas imagens enviadas em um único request (--batch-size 4)
3. **API Workers Paralelos:** Múltiplas chamadas simultâneas respeitando rate limit global

### 2.3 Fase 3: Extração

```bash
# Modo serial (básico)
python execution/extract_with_gemini.py {caso_id}

# Modo paralelo (recomendado para produção)
python execution/extract_with_gemini.py {caso_id} --parallel --workers 10

# Com filtro de tipo
python execution/extract_with_gemini.py {caso_id} --type MATRICULA_IMOVEL

# Com limite (para testes)
python execution/extract_with_gemini.py {caso_id} --limit 5 --verbose
```

**Flags disponíveis:**

| Flag | Descrição | Default |
|------|-----------|---------|
| `--parallel` / `-p` | Ativa modo paralelo | False |
| `--workers N` / `-w N` | Número de workers | 5 |
| `--rpm N` | Rate limit (req/min) | 150 |
| `--type TIPO` | Filtrar por tipo de documento | Todos |
| `--limit N` | Limitar quantidade | Todos |
| `--verbose` | Log detalhado | False |

**Saída:** `.tmp/contextual/{caso_id}/*.json`

### 2.4 Fase 4: Mapeamento

```bash
# Mapeamento básico
python execution/map_to_fields.py {caso_id}

# Com log verbose
python execution/map_to_fields.py {caso_id} --verbose

# Com resumo detalhado
python execution/map_to_fields.py {caso_id} --output-format summary
```

**Saída:** `.tmp/mapped/{caso_id}.json`

---

## 3. Utilitários

### 3.1 Limpeza de Arquivos Temporários

```bash
# Ver o que seria limpo (dry-run)
python execution/clean_temp_files.py

# Executar limpeza
python execution/clean_temp_files.py --execute
```

### 3.2 Verificar Catálogo

```bash
# Ver estatísticas do catálogo
python -c "import json; d = json.load(open('.tmp/catalogos/{caso_id}.json')); print(json.dumps(d['estatisticas'], indent=2))"
```

### 3.3 Listar Documentos por Tipo

```bash
# Ver distribuição de tipos
python -c "import json; d = json.load(open('.tmp/catalogos/{caso_id}.json')); print(json.dumps(d['arquivos_por_tipo'], indent=2))"
```

---

## 4. Troubleshooting

### 4.1 Erro: "Diretório não encontrado"

**Sintoma:** Script não encontra pasta de documentos.

**Causa:** Caminho incorreto ou caracteres especiais.

**Solução:**
```bash
# Use aspas para caminhos com espaços
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"
```

### 4.2 Erro: "Rate limit exceeded" (429)

**Sintoma:** API retorna erro 429.

**Causa:** Muitas requisições simultâneas ou tier incorreto.

**Solução para Classificação:**
- Reduzir workers API: `--api-workers 2`
- Desabilitar batch: `--batch-size 1`
- Para free tier: editar `RATE_LIMIT_DELAY = 4.0` no script

**Solução para Extração:**
- Reduzir workers: `--workers 3`
- Para free tier: `--rpm 15 --workers 3`

### 4.2.1 Erro: "503 Service Unavailable" / "Model is overloaded"

**Sintoma:** API retorna erro 503 com mensagem de modelo sobrecarregado.

**Causa:** Modelo Gemini temporariamente indisponível.

**Solução:** O script já implementa retry automático com backoff exponencial. Se persistir:
- Reduzir batch size: `--batch-size 2`
- Usar modelo fallback: editar `GEMINI_MODEL` no .env para `gemini-2.5-flash`

### 4.3 Erro: "Catálogo não encontrado"

**Sintoma:** Fase 3 ou 4 não encontra catálogo.

**Causa:** Fase 1 não executada.

**Solução:** Execute Fase 1 completa:
```bash
python execution/inventory_files.py "Test-Docs/{pasta}"
python execution/classify_with_gemini.py {caso_id}
python execution/generate_catalog.py {caso_id}
```

### 4.4 Erro: "Diretório contextual não encontrado"

**Sintoma:** Fase 4 não encontra dados extraídos.

**Causa:** Fase 3 não executada.

**Solução:** Execute Fase 3:
```bash
python execution/extract_with_gemini.py {caso_id} --parallel
```

### 4.5 Muitos Campos Faltantes no Mapeamento

**Sintoma:** Saída da Fase 4 tem muitos campos vazios.

**Diagnóstico:**
```bash
python execution/map_to_fields.py {caso_id} --output-format summary
```

**Causas possíveis:**
1. Documentos essenciais não foram processados
2. Extração retornou muitos `null` (documento ilegível)
3. Compromisso de Compra e Venda não foi encontrado

**Solução:**
- Verificar se Compromisso foi classificado corretamente
- Revisar documentos com erro em `.tmp/contextual/`
- Reprocessar documentos específicos: `--type COMPROMISSO_COMPRA_VENDA`

### 4.6 Classificação Incorreta

**Sintoma:** Documento classificado como tipo errado.

**Diagnóstico:** Verificar classificação em `.tmp/classificacoes/{caso_id}_classificacao.json`

**Solução:**
1. Editar manualmente o arquivo de classificação
2. Reexecutar `generate_catalog.py`
3. Reexecutar extração

### 4.7 DOCX Não Processado

**Sintoma:** Arquivos DOCX falham na extração.

**Causa:** Dependência `docx2pdf` não instalada ou Microsoft Word não disponível.

**Solução:**
```bash
pip install docx2pdf
# No Windows: Microsoft Word deve estar instalado
```

### 4.8 PDF Multipágina Incompleto

**Sintoma:** Apenas primeira página extraída.

**Diagnóstico:** Verificar tamanho da imagem gerada no log.

**Solução:** O script já concatena todas as páginas. Se ainda falhar:
- Verificar se PDF não está corrompido
- Verificar se `PyMuPDF` está instalado: `pip install PyMuPDF`

---

## 5. Validação de Resultados

### 5.1 Verificar Extração

```bash
# Ver um JSON de extração
cat ".tmp/contextual/{caso_id}/001_RG.json" | python -m json.tool

# Verificar campos obrigatórios
python -c "
import json
d = json.load(open('.tmp/contextual/{caso_id}/001_RG.json'))
print('Tipo:', d.get('tipo_documento'))
print('Explicação:', d.get('explicacao_contextual', '')[:100])
print('Dados:', list(d.get('dados_catalogados', {}).keys()))
"
```

### 5.2 Verificar Mapeamento

```bash
# Ver estrutura do mapeamento
python -c "
import json
d = json.load(open('.tmp/mapped/{caso_id}.json'))
print('Metadata:', d.get('metadata'))
print('Alienantes:', len(d.get('alienantes', [])))
print('Adquirentes:', len(d.get('adquirentes', [])))
print('Campos faltantes:', len(d.get('metadata', {}).get('campos_faltantes', [])))
"
```

### 5.3 Checklist de Qualidade

**Após Fase 1:**
- [ ] Total de arquivos no catálogo corresponde ao esperado
- [ ] Poucos arquivos marcados como OUTRO
- [ ] Alta confiança na maioria das classificações

**Após Fase 3:**
- [ ] Todos os arquivos foram processados (verificar relatório)
- [ ] `explicacao_contextual` não está vazia
- [ ] Dados críticos não estão null

**Após Fase 4:**
- [ ] Alienantes e adquirentes identificados
- [ ] Campos críticos preenchidos: nome, CPF, RG
- [ ] Dados do imóvel: matrícula, SQL, áreas
- [ ] Valores do negócio: total, ITBI

---

## 6. Referência Rápida

### 6.1 Estrutura de Saída

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
│       ├── 001_IPTU.json           # Fase 3
│       ├── 002_RG.json
│       └── ...
└── mapped/
    └── {caso_id}.json              # Fase 4
```

### 6.2 Caso de ID

O `caso_id` é derivado do nome da pasta:
- Pasta: `FC 515 - 124 p280509`
- caso_id: `FC_515_124_p280509` (espaços → underscore)

### 6.3 Ordem de Execução

1. `inventory_files.py` (requer: pasta de documentos)
2. `classify_with_gemini.py` (requer: inventário)
3. `generate_catalog.py` (requer: classificações)
4. `extract_with_gemini.py` (requer: catálogo)
5. `map_to_fields.py` (requer: extrações)

---

## 7. Dicas de Performance

> **IMPORTANTE:** Este projeto utiliza exclusivamente o **PLANO PAGO** do Gemini API (150 RPM).
> Todas as configurações padrão já estão otimizadas. Não é necessário especificar flags extras.

### 7.1 Configuração Padrão (Plano Pago - 150 RPM)

Os scripts já vêm configurados com valores otimizados para o plano pago:

```bash
# Classificação - basta usar --parallel (valores padrão já são otimizados)
python execution/classify_with_gemini.py {caso_id} --parallel

# Extração - basta usar --parallel
python execution/extract_with_gemini.py {caso_id} --parallel
```

**Valores padrão no código:**
- `RATE_LIMIT_DELAY = 0.5s` (150 RPM)
- `API_WORKERS = 5`
- `CLASSIFICATION_BATCH_SIZE = 4`
- `PARALLEL_WORKERS = 10`

### 7.2 Configurações Explícitas (opcional)

Se precisar ajustar manualmente:

```bash
# Classificação com configuração explícita
python execution/classify_with_gemini.py {caso_id} --parallel --api-workers 5 --batch-size 4

# Extração com configuração explícita
python execution/extract_with_gemini.py {caso_id} --parallel --workers 10 --rpm 150
```

### 7.3 Tempos Estimados (40 documentos)

| Fase | Configuração | Tempo Anterior | Tempo Otimizado | Melhoria |
|------|--------------|----------------|-----------------|----------|
| **1.2 Classificação** | Serial (antigo) | ~6 min | - | - |
| **1.2 Classificação** | Paralelo + Batch | - | ~2.5 min | **~58%** |
| **3 Extração** | 10 workers | ~3.5 min | ~4.3 min | - |
| **TOTAL Pipeline** | Otimizado | ~10 min | ~7 min | **~30%** |

### 7.4 Configurações Padrão (Plano Pago)

| Parâmetro | Valor Padrão | Descrição |
|-----------|--------------|-----------|
| Rate Limit Classificação | 0.5s | Intervalo entre requests |
| API Workers Classificação | 5 | Workers para chamadas paralelas |
| Batch Size | 4 | Imagens por request |
| Prep Workers | 10 | Workers para preparação I/O |
| Workers Extração | 10 | Workers para extração paralela |
| RPM Extração | 150 | Rate limit da extração |

### 7.5 Como as Otimizações Funcionam

**1. Pré-classificação por Nome de Arquivo:**
- Documentos com prefixos óbvios (RG_, CNDT_, ITBI_, etc.) são classificados localmente
- Economia: ~5-10% das chamadas API
- Confiança: Só aplica quando tem certeza Alta

**2. Batch Processing:**
- Agrupa 4 imagens por request ao invés de 1
- Economia: ~75% das chamadas API (39 docs → 9 batches)
- Prompt especial pede array JSON de respostas

**3. Workers API Paralelos:**
- Múltiplas chamadas simultâneas ao Gemini
- Rate limit global de 0.5s entre requests
- Throughput: ~2 requests/segundo (vs 0.25/s antes)

---

## 8. Tratamento de Documentos Não Reconhecidos

### 8.1 Como Identificar Documentos Não Reconhecidos

**No catálogo (`/.tmp/catalogos/{caso_id}.json`):**
```bash
# Listar documentos não reconhecidos
python -c "
import json
d = json.load(open('.tmp/catalogos/{caso_id}.json'))
desconhecidos = [a for a in d['documentos'] if a['tipo'] == 'DESCONHECIDO']
for doc in desconhecidos:
    print(f\"Arquivo: {doc['arquivo']}\")
    print(f\"  Tipo sugerido: {doc.get('tipo_sugerido', 'N/A')}\")
    print(f\"  Descrição: {doc.get('descricao_documento', 'N/A')}\")
    print()
"
```

**Na pasta de novos tipos (`/.tmp/novos_tipos/`):**
```bash
# Ver sugestões agregadas
cat .tmp/novos_tipos/sugestoes.json | python -m json.tool
```

### 8.2 Processo de Revisão e Decisão

Ao encontrar documentos não reconhecidos, siga este fluxo:

```
DOCUMENTO NÃO RECONHECIDO
        │
        ▼
┌─────────────────────────────────────────┐
│ ANÁLISE INICIAL                         │
│ 1. Abrir documento original             │
│ 2. Ler sugestão do Gemini               │
│ 3. Verificar características            │
└─────────────────────────────────────────┘
        │
        ▼
    ┌───┴───┐
    │       │
    ▼       ▼
 TIPO    TIPO NÃO
 NOVO    CATALOGADO
    │       │
    │       ▼
    │   ┌───────────────────────────────┐
    │   │ É um tipo existente?          │
    │   │ - Verificar tipos similares   │
    │   │ - Comparar características    │
    │   └───────────────────────────────┘
    │       │
    │       ├─── SIM ──▶ Reclassificar manualmente
    │       │            e reprocessar
    │       │
    │       └─── NÃO ──▶ Criar novo tipo
    │                    (ver seção 8.3)
    ▼
┌─────────────────────────────────────────┐
│ AÇÃO FINAL                              │
│ - Atualizar classificação               │
│ - Reprocessar se necessário             │
│ - Documentar decisão                    │
└─────────────────────────────────────────┘
```

**Decisões possíveis:**

| Decisão | Quando Usar | Ação |
|---------|-------------|------|
| **Aceitar sugestão** | Sugestão do Gemini faz sentido, tipo é útil | Criar novo tipo conforme seção 8.3 |
| **Mapear para existente** | É um caso especial de tipo já catalogado | Reclassificar e documentar variação |
| **Criar tipo diferente** | Sugestão não é adequada, mas documento é útil | Criar tipo com nome/estrutura melhor |
| **Ignorar** | Documento não é útil para minutas | Manter como OUTRO ou remover |

### 8.3 Como Criar Novos Prompts e Schemas

**Passo 1: Criar o prompt de extração**

```bash
# Criar arquivo de prompt
touch execution/prompts/{novo_tipo}.txt
```

Estrutura do prompt:
```text
Você é um especialista em análise de documentos cartoriais brasileiros.

## DOCUMENTO A ANALISAR
Este é um documento do tipo: {NOME_DO_TIPO}

## DESCRIÇÃO
{Descreva o que é o documento e para que serve}

## O QUE EXTRAIR
Extraia os seguintes dados:
1. **campo1**: descrição
2. **campo2**: descrição
[...]

## REGRAS CRÍTICAS
1. NUNCA fabricar dados - se ilegível, retorne null
2. Extrair EXATAMENTE como aparece
3. {Regras específicas do tipo}

## FORMATO DE SAÍDA
Retorne JSON:
{
  "tipo_documento": "{NOME_DO_TIPO}",
  "dados_catalogados": { ... },
  "explicacao_contextual": "..."
}
```

**Passo 2: Criar schema de validação (opcional)**

```bash
# Criar arquivo de schema
touch execution/schemas/{novo_tipo}.json
```

Estrutura do schema:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["tipo_documento", "dados_catalogados"],
  "properties": {
    "tipo_documento": {
      "type": "string",
      "const": "{NOME_DO_TIPO}"
    },
    "dados_catalogados": {
      "type": "object",
      "properties": {
        "campo1": { "type": ["string", "null"] },
        "campo2": { "type": ["string", "null"] }
      }
    }
  }
}
```

**Passo 3: Testar o novo tipo**

```bash
# Reprocessar apenas o documento específico
python execution/extract_with_gemini.py {caso_id} --file {arquivo_especifico}

# Verificar extração
cat .tmp/contextual/{caso_id}/{arquivo}.json | python -m json.tool
```

### 8.4 Checklist: Adicionar Novo Tipo de Documento

Use esta checklist ao adicionar um novo tipo ao sistema:

**Fase 1: Documentação**
- [ ] Analisar documento original e anotar características
- [ ] Definir código do tipo (ex: `INVENTARIO_EXTRAJUDICIAL`)
- [ ] Listar campos extraíveis
- [ ] Identificar tipos similares para desambiguação

**Fase 2: Atualização de Diretivas**
- [ ] Adicionar seção em `directives/02_tipos_documentos.md`
  - [ ] Código, descrição, características visuais
  - [ ] Dados extraíveis
  - [ ] Regra "Não confundir com"
- [ ] Atualizar contagem total de tipos (26 → 27, etc.)
- [ ] Atualizar tabela de resumo por categoria

**Fase 3: Implementação**
- [ ] Criar `execution/prompts/{tipo}.txt`
- [ ] Criar `execution/schemas/{tipo}.json` (se necessário)
- [ ] Adicionar tipo na lista de tipos válidos do classificador

**Fase 4: Teste e Validação**
- [ ] Testar classificação com documento original
- [ ] Testar extração com documento original
- [ ] Verificar que dados foram extraídos corretamente
- [ ] Verificar que não quebrou outros tipos

**Fase 5: Mapeamento (se aplicável)**
- [ ] Atualizar `map_to_fields.py` se campos devem ir para a minuta
- [ ] Definir prioridade do tipo na resolução de conflitos
- [ ] Testar mapeamento completo

**Fase 6: Finalização**
- [ ] Remover documento de `.tmp/novos_tipos/`
- [ ] Documentar a adição no changelog ou commit
- [ ] Reprocessar caso completo para validar integração

### 8.5 Exemplo Completo: Adicionando INVENTARIO_EXTRAJUDICIAL

**1. Identificação:**
- Gemini classificou documento como DESCONHECIDO
- Sugeriu tipo: `INVENTARIO_EXTRAJUDICIAL`
- Características: lista de herdeiros, relação de bens, advogado

**2. Criar prompt (`execution/prompts/inventario_extrajudicial.txt`):**
```text
Você é um especialista em análise de documentos cartoriais brasileiros.

## DOCUMENTO A ANALISAR
Este é um documento do tipo: INVENTARIO_EXTRAJUDICIAL

## DESCRIÇÃO
Escritura pública de inventário e partilha extrajudicial de bens,
lavrada em tabelionato de notas quando todos os herdeiros são maiores
e capazes e há consenso sobre a divisão dos bens.

## O QUE EXTRAIR
1. **falecido**: Nome completo do de cujus
2. **data_obito**: Data do falecimento
3. **herdeiros**: Lista com nome, CPF, grau de parentesco
4. **bens**: Lista de bens com descrição e valor
5. **advogado**: Nome e OAB do advogado
6. **tabelionato**: Nome do cartório
7. **data_lavratura**: Data da escritura

## REGRAS CRÍTICAS
1. NUNCA fabricar dados - se ilegível, retorne null
2. Capturar TODOS os herdeiros listados
3. Capturar TODOS os bens, mesmo que parcialmente legíveis

## FORMATO DE SAÍDA
{
  "tipo_documento": "INVENTARIO_EXTRAJUDICIAL",
  "dados_catalogados": {
    "falecido": "...",
    "data_obito": "...",
    "herdeiros": [...],
    "bens": [...],
    "advogado": "...",
    "oab_advogado": "...",
    "tabelionato": "...",
    "data_lavratura": "..."
  },
  "explicacao_contextual": "..."
}
```

**3. Adicionar em `02_tipos_documentos.md`:**
```markdown
### 4.4 INVENTARIO_EXTRAJUDICIAL
**Código:** `INVENTARIO_EXTRAJUDICIAL`

**Descrição:** Escritura pública de inventário e partilha extrajudicial

**Características Visuais:**
- Papel timbrado de tabelionato de notas
- Título "ESCRITURA PÚBLICA DE INVENTÁRIO"
- Lista de herdeiros com qualificação completa
- Relação de bens com valores
- Assinatura de advogado com OAB

**Dados Extraíveis:**
- Falecido, Data óbito, Herdeiros, Bens, Advogado, Tabelionato

**Não Confundir Com:** COMPROMISSO_COMPRA_VENDA, ESCRITURA
```

**4. Testar:**
```bash
# Reclassificar
python execution/classify_with_gemini.py {caso_id} --file {arquivo}

# Extrair
python execution/extract_with_gemini.py {caso_id} --file {arquivo}

# Verificar
cat .tmp/contextual/{caso_id}/{arquivo}.json | python -m json.tool
```

---

## 9. Novas Funcionalidades (Janeiro 2026)

### 9.1 Seleção Automática de Prompt para Matrículas Grandes

O sistema agora detecta automaticamente matrículas de imóvel grandes (>2MB) e usa um prompt compacto otimizado para evitar estouro de tokens.

**Comportamento:**
- Arquivo < 2MB → `matricula_imovel.txt` (prompt completo com reescrita)
- Arquivo ≥ 2MB → `matricula_imovel_compact.txt` (prioriza JSON estruturado)

**Não requer ação do operador** - a seleção é automática.

### 9.2 Consolidação de Pessoas com CPFs Duplicados

O sistema agora detecta e consolida automaticamente registros de pessoas duplicadas causados por erros de OCR em CPFs.

**Critérios de consolidação (em ordem):**
1. CPF com dígito verificador válido tem prioridade
2. CPF que aparece mais vezes (votação) é o correto
3. Em empate, fonte de maior prioridade vence (RG > CNH > Compromisso)

**Verificar consolidação:**
```bash
# Ver pessoas consolidadas no mapeamento
python -c "
import json
d = json.load(open('.tmp/mapped/{caso_id}.json'))
for tipo in ['alienantes', 'adquirentes']:
    for p in d.get(tipo, []):
        if p.get('_consolidado'):
            print(f'{tipo}: {p[\"nome\"]}')
            print(f'  CPFs encontrados: {p.get(\"_cpfs_encontrados\", [])}')
"
```

### 9.3 Processamento de CNH

O sistema agora processa documentos CNH e extrai:
- Nome, CPF, RG, Data de nascimento
- Filiação (pai e mãe)
- Dados da habilitação (categoria, validade, etc.)

**Prioridade CNH = 90** (menor que RG direto = 100, mas útil como fonte secundária quando não há RG disponível)

### 9.4 Campo Anuentes na Saída

A estrutura de saída agora inclui um campo `anuentes` separado para cônjuges que anuem na venda:

```json
{
  "metadata": {...},
  "alienantes": [...],
  "anuentes": [
    {
      "nome": "CÍNTIA VIANA DE ARAÚJO SILVA",
      "cpf": "...",
      "anuente_de": "FERNANDO FAEDO DA SILVA",
      ...
    }
  ],
  "adquirentes": [...],
  "imovel": {...},
  "negocio": {...}
}
```

**Verificar anuentes:**
```bash
python -c "
import json
d = json.load(open('.tmp/mapped/{caso_id}.json'))
print(f'Alienantes: {len(d.get(\"alienantes\", []))}')
print(f'Anuentes: {len(d.get(\"anuentes\", []))}')
for a in d.get('anuentes', []):
    print(f'  - {a[\"nome\"]} (anuente de {a.get(\"anuente_de\", \"?\")})')
"
```
