# Arquitetura do Sistema

Este documento define a arquitetura do sistema de processamento de documentos cartoriais para geração de minutas de escritura.

---

## 1. Visão Geral

### 1.1 O Que É Este Sistema

Sistema automatizado para processar documentos de escrituras de compra e venda de imóveis e extrair dados estruturados para preencher minutas cartoriais.

### 1.2 Problema Resolvido

Escritórios de cartório recebem pastas com dezenas de documentos desorganizados (RGs, certidões, matrículas, etc.) e precisam manualmente localizar e copiar dados para preencher minutas de escritura - um processo tedioso e propenso a erros.

### 1.3 Solução

Pipeline automatizado de 3 fases que:
1. **Cataloga** todos os documentos de uma escritura
2. **Extrai** dados estruturados usando IA (Gemini 3 Flash)
3. **Mapeia** os dados extraídos para os 180+ campos padronizados da minuta

---

## 2. Arquitetura de 3 Camadas

O projeto segue uma arquitetura que separa claramente responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: DIRECTIVES (directives/)                          │
│  ├── SOPs em Markdown                                       │
│  ├── Definem: objetivos, inputs, outputs, ferramentas       │
│  └── Como instruções para um funcionário                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: ORCHESTRATION (Agente IA)                         │
│  ├── Lê diretivas, toma decisões                            │
│  ├── Chama scripts na ordem correta                         │
│  ├── Trata erros, pede clarificações                        │
│  └── Atualiza diretivas com aprendizados                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 3: EXECUTION (execution/)                            │
│  ├── Scripts Python determinísticos                         │
│  ├── APIs, processamento, operações de arquivo              │
│  └── Testáveis, confiáveis, rápidos                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Por Que Esta Arquitetura?

LLMs são probabilísticos; código é determinístico. Separar as camadas permite:
- **Reduzir erros compostos**: 90% acurácia/passo = 59% em 5 passos se feito diretamente
- **Facilitar manutenção**: Diretivas e código evoluem independentemente
- **Permitir self-annealing**: Sistema aprende e melhora com erros

---

## 3. Estrutura de Diretórios

```
Minutas-Cartorio-Documentos/
├── .env                        # Variáveis de ambiente (API keys)
├── .tmp/                       # Arquivos intermediários (não commitados)
│   ├── catalogos/              # Catálogos gerados (Fase 1)
│   ├── classificacoes/         # Classificações (Fase 1)
│   ├── contextual/             # Extrações Gemini (Fase 3)
│   ├── inventarios/            # Inventários brutos (Fase 1)
│   └── mapped/                 # Dados mapeados (Fase 4)
├── CLAUDE.md                   # Instruções para agentes
├── credentials/                # Credenciais Google (não commitadas)
├── directives/                 # SOPs - Procedimentos operacionais
│   ├── 01_arquitetura_sistema.md
│   ├── 02_tipos_documentos.md
│   ├── 03_pipeline_processamento.md
│   └── 04_manual_operacao.md
├── documentacao/               # Documentação técnica completa
├── execution/                  # Scripts Python
│   ├── prompts/                # 15 templates de prompt por tipo
│   ├── schemas/                # 14 schemas JSON por tipo
│   ├── classify_with_gemini.py # Fase 1.2
│   ├── clean_temp_files.py     # Utilitário
│   ├── extract_with_gemini.py  # Fase 3
│   ├── generate_catalog.py     # Fase 1.3
│   ├── inventory_files.py      # Fase 1.1
│   ├── map_to_fields.py        # Fase 4
│   └── requirements.txt        # Dependências Python
├── Guia-de-campos-e-variaveis/ # Referência dos 180+ campos
└── Test-Docs/                  # Documentos de teste
```

---

## 4. Pipeline de Processamento

### 4.1 Fluxo Completo

```
ENTRADA: Pasta com documentos de uma escritura
         └── PDFs, imagens, DOCX desorganizados

    ↓ FASE 1: CATALOGAÇÃO E CLASSIFICAÇÃO
    │
    ├── 1.1 inventory_files.py
    │       └── Percorre pasta, gera inventário bruto
    │
    ├── 1.2 classify_with_gemini.py
    │       └── Classifica visualmente cada documento (26 tipos)
    │
    └── 1.3 generate_catalog.py
            └── Combina inventário + classificações = catálogo

    ↓ FASE 3: EXTRAÇÃO ESTRUTURADA
    │
    └── extract_with_gemini.py
            ├── Processa cada documento com Gemini 3 Flash
            ├── Usa prompt especializado por tipo de documento
            └── Gera JSON estruturado com dados extraídos

    ↓ FASE 4: MAPEAMENTO PARA MINUTA
    │
    └── map_to_fields.py
            ├── Consolida dados de múltiplos documentos
            ├── Resolve conflitos por prioridade de fonte
            ├── Rastreia origem de cada campo
            └── Gera arquivo final com 180+ campos

SAÍDA: .tmp/mapped/{caso_id}.json
       └── Dados estruturados prontos para preencher minuta
```

---

## 5. Princípios Operacionais

### 5.1 Check for Tools First
Antes de escrever um script, verificar se já existe em `execution/`.

### 5.2 Self-Annealing
Quando algo quebra, o sistema deve:
1. **Ler** erro e stack trace
2. **Corrigir** o script
3. **Testar** novamente
4. **Atualizar** a diretiva com o aprendizado
5. Sistema fica mais forte

### 5.3 File Standards
- `.tmp/`: Dados intermediários (nunca commitar)
- `execution/`: Lógica pura e interação com APIs
- `directives/`: Documentação clara de procedimentos
- **Deliverables**: Baseados em cloud (Google Sheets, etc.) quando possível

---

## 6. Sistema Auto-Melhorável (Self-Annealing)

### 6.1 Conceito no Contexto deste Projeto

O sistema é projetado para **melhorar continuamente** ao encontrar novos tipos de documentos ou situações não previstas. Assim como um metal se torna mais forte através do processo de annealing (recozimento), o sistema se fortalece a cada erro ou descoberta.

**Princípio Central:** Quando o Gemini encontra um documento que não consegue classificar nos 26 tipos conhecidos, isso NÃO é uma falha - é uma **oportunidade de aprendizado** que deve resultar em melhoria do sistema.

### 6.2 Detecção de Documentos Não Reconhecidos

O script `classify_with_gemini.py` identifica documentos não reconhecidos quando:

1. **Classificação como DESCONHECIDO**: Gemini não consegue mapear para nenhum dos 26 tipos
2. **Baixa confiança**: Classificação com confiança < 50% em qualquer tipo
3. **Tipo sugerido novo**: Gemini sugere um tipo que não existe na lista oficial

**Output de detecção:**
```json
{
  "tipo": "DESCONHECIDO",
  "confianca": 0.0,
  "tipo_sugerido": "INVENTARIO_EXTRAJUDICIAL",
  "descricao_documento": "Documento com lista de bens e herdeiros para partilha",
  "categoria_recomendada": "Documentos do Negócio",
  "caracteristicas_identificadoras": [
    "Título 'Inventário' ou 'Partilha'",
    "Lista de herdeiros com CPF",
    "Relação de bens com valores",
    "Assinatura de advogado"
  ],
  "observacao": "Documento parece ser inventário extrajudicial, tipo não catalogado"
}
```

### 6.3 Fluxo de Trabalho para Novos Tipos

```
DOCUMENTO NÃO RECONHECIDO DETECTADO
        │
        ▼
┌───────────────────────────────────────┐
│ 1. REGISTRO AUTOMÁTICO                │
│    - Salva em .tmp/novos_tipos/       │
│    - Gera relatório com sugestões     │
│    - Marca para revisão               │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 2. REVISÃO HUMANA                     │
│    - Avaliar sugestão do Gemini       │
│    - Decidir: novo tipo ou existente? │
│    - Validar características          │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 3. ATUALIZAÇÃO DO SISTEMA             │
│    - Adicionar tipo em 02_tipos.md    │
│    - Criar prompt em prompts/         │
│    - Criar schema em schemas/         │
│    - Atualizar classify_with_gemini   │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 4. VALIDAÇÃO                          │
│    - Reprocessar documento original   │
│    - Verificar classificação correta  │
│    - Verificar extração de dados      │
└───────────────────────────────────────┘
        │
        ▼
    SISTEMA FORTALECIDO
```

### 6.4 Papel do Agente Orquestrador

O agente orquestrador (Layer 2) tem responsabilidades específicas na melhoria contínua:

**Durante o Processamento:**
- Monitorar classificações com baixa confiança
- Identificar padrões em documentos DESCONHECIDO
- Agregar sugestões similares do Gemini

**Após o Processamento:**
- Revisar `.tmp/novos_tipos/` se existir
- Apresentar relatório de documentos não reconhecidos
- Propor criação de novos tipos quando padrão se repete

**Na Melhoria do Sistema:**
- Criar novos prompts seguindo o padrão existente
- Atualizar diretivas com novos tipos
- Testar o tipo novo antes de considerar implementado
- Documentar edge cases descobertos

### 6.5 Arquivos de Self-Annealing

| Arquivo | Propósito |
|---------|-----------|
| `.tmp/novos_tipos/{caso_id}.json` | Documentos não reconhecidos aguardando revisão |
| `.tmp/novos_tipos/sugestoes.json` | Agregação de tipos sugeridos pelo Gemini |
| `execution/prompts/{novo_tipo}.txt` | Prompt para novo tipo (após aprovação) |
| `execution/schemas/{novo_tipo}.json` | Schema para novo tipo (após aprovação) |

---

## 7. Referências

| Documento | Localização | Propósito |
|-----------|-------------|-----------|
| Fonte de Verdade | `documentacao/FONTE_DE_VERDADE.md` | Referência central autoritativa |
| Tipos de Documentos | `directives/02_tipos_documentos.md` | 26 tipos com características |
| Pipeline | `directives/03_pipeline_processamento.md` | Detalhes técnicos das fases |
| Manual de Operação | `directives/04_manual_operacao.md` | Como executar o sistema |
| Schemas | `execution/schemas/*.json` | Estrutura de dados por tipo |
| Prompts | `execution/prompts/*.txt` | Templates de extração |
| Campos Minuta | `Guia-de-campos-e-variaveis/` | 180+ campos detalhados |
