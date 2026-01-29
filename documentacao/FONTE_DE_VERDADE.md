# FONTE DE VERDADE - Sistema de Minutas de Cartório

**Versão:** 1.0
**Última Atualização:** 2026-01-28
**Status:** Produção

> **Este documento é a referência central para qualquer agente de IA que trabalhe neste projeto.**
> Leia este documento completamente antes de fazer qualquer modificação no código.

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 O Que É Este Projeto

Sistema automatizado para processar documentos de escrituras de compra e venda de imóveis e extrair dados estruturados para preencher minutas cartoriais.

### 1.2 Problema Resolvido

Escritórios de cartório recebem pastas com dezenas de documentos desorganizados (RGs, certidões, matrículas, etc.) e precisam manualmente localizar e copiar dados para preencher minutas de escritura - um processo tedioso e propenso a erros.

### 1.3 Solução

Pipeline automatizado de 4 fases que:
1. **Cataloga** todos os documentos de uma escritura
2. **Classifica** visualmente cada documento (26 tipos)
3. **Extrai** dados estruturados usando IA (Gemini 3 Flash)
4. **Mapeia** os dados extraídos para os 180+ campos padronizados da minuta

### 1.4 Característica Fundamental: Sistema Auto-Melhorável

O sistema é projetado para **evoluir continuamente**. Documentos não reconhecidos não são falhas - são oportunidades de aprendizado que alimentam o ciclo de melhoria contínua (self-annealing). O agente orquestrador monitora, aprende e expande as capacidades do sistema automaticamente.

---

## 2. ARQUITETURA DE 3 CAMADAS

O projeto segue uma arquitetura que separa claramente responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: DIRECTIVES (directives/)                          │
│  ├── SOPs em Markdown                                       │
│  ├── Definem: objetivos, inputs, outputs, ferramentas       │
│  └── Como instruções para um funcionário                    │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: ORCHESTRATION (Agente IA - você)                  │
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

## 3. ESTRUTURA DE DIRETÓRIOS

```
Minutas-Cartorio-Documentos/
├── .claude/                    # Metadados do Claude Code
├── .env                        # Variáveis de ambiente (API keys)
├── .gitignore                  # Arquivos ignorados
├── .tmp/                       # Arquivos intermediários (não commitados)
│   ├── catalogos/              # Catálogos gerados (Fase 1)
│   ├── classificacoes/         # Classificações (Fase 1)
│   ├── contextual/             # Extrações Gemini (Fase 3)
│   ├── descobertas/            # Documentos não reconhecidos (self-annealing)
│   ├── inventarios/            # Inventários brutos (Fase 1)
│   ├── mapped/                 # Dados mapeados (Fase 4)
│   ├── ocr/                    # Textos OCR (Fase 2 - deprecated)
│   └── structured/             # Dados estruturados (Fase 3 - alternativo)
├── CLAUDE.md                   # Instruções para agentes (este arquivo referencia)
├── credentials/                # Credenciais Google (não commitadas)
├── directives/                 # SOPs - Procedimentos operacionais
│   ├── 01_arquitetura_sistema.md
│   ├── 02_tipos_documentos.md
│   ├── 03_pipeline_processamento.md
│   └── 04_manual_operacao.md
├── documentacao/               # Esta pasta - documentação completa
├── execution/                  # Scripts Python
│   ├── prompts/                # 15 templates de prompt por tipo
│   ├── schemas/                # 14 schemas JSON por tipo
│   ├── classify_with_gemini.py # Fase 1.2
│   ├── clean_temp_files.py     # Utilitário
│   ├── document_field_mapping.py # Referência de mapeamento
│   ├── extract_structured.py   # Fase 3 (alternativo regex)
│   ├── extract_with_gemini.py  # Fase 3 (principal)
│   ├── generate_catalog.py     # Fase 1.3
│   ├── inventory_files.py      # Fase 1.1
│   ├── map_to_fields.py        # Fase 4
│   └── requirements.txt        # Dependências Python
├── Guia-de-campos-e-variaveis/ # Referência dos 180+ campos
├── README.md                   # Documentação principal
└── Test-Docs/                  # Documentos de teste
```

---

## 4. PIPELINE DE PROCESSAMENTO

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
    │       ├── Classifica visualmente cada documento (26 tipos)
    │       └── Documentos não reconhecidos: tipo="DESCONHECIDO"
    │           (registrados em .tmp/descobertas/ para análise)
    │
    └── 1.3 generate_catalog.py
            └── Combina inventário + classificações = catálogo

    ↓ FASE 2: OCR [DEPRECATED - pulada]
    │   Gemini 3 Flash processa diretamente, sem OCR intermediário
    │

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

### 4.2 Comandos de Execução

```bash
# Fase 1 - Catalogação completa
python execution/inventory_files.py "Test-Docs/FC 515 - 124 p280509"
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel --workers 6
python execution/generate_catalog.py FC_515_124_p280509

# Fase 3 - Extração estruturada
python execution/extract_with_gemini.py FC_515_124_p280509 --parallel --workers 10

# Fase 4 - Mapeamento
python execution/map_to_fields.py FC_515_124_p280509

# Utilitário - Limpeza
python execution/clean_temp_files.py --execute
```

---

## 5. TIPOS DE DOCUMENTOS SUPORTADOS

O sistema reconhece **26 tipos de documentos** organizados em 5 categorias:

### 5.1 Documentos Pessoais (7)
| Código | Descrição |
|--------|-----------|
| `RG` | Carteira de Identidade |
| `CNH` | Carteira Nacional de Habilitação |
| `CPF` | Cadastro de Pessoa Física |
| `CERTIDAO_NASCIMENTO` | Certidão de Nascimento |
| `CERTIDAO_CASAMENTO` | Certidão de Casamento |
| `CERTIDAO_OBITO` | Certidão de Óbito |
| `COMPROVANTE_RESIDENCIA` | Comprovante de Endereço |

### 5.2 Certidões (7)
| Código | Descrição |
|--------|-----------|
| `CNDT` | Certidão Negativa de Débitos Trabalhistas |
| `CND_FEDERAL` | Certidão Negativa Federal |
| `CND_ESTADUAL` | Certidão Negativa Estadual |
| `CND_MUNICIPAL` | Certidão Negativa Municipal |
| `CND_IMOVEL` | Certidão Negativa do Imóvel |
| `CND_CONDOMINIO` | Certidão Negativa de Condomínio |
| `CONTRATO_SOCIAL` | Contrato Social (PJ) |

### 5.3 Documentos do Imóvel (6)
| Código | Descrição |
|--------|-----------|
| `MATRICULA_IMOVEL` | Matrícula do Imóvel |
| `ITBI` | Imposto de Transmissão |
| `VVR` | Valor Venal de Referência |
| `IPTU` | Carnê ou Certidão de IPTU |
| `DADOS_CADASTRAIS` | Dados Cadastrais do Imóvel |
| `ESCRITURA` | Escritura Anterior |

### 5.4 Documentos do Negócio (3)
| Código | Descrição |
|--------|-----------|
| `COMPROMISSO_COMPRA_VENDA` | Compromisso de Compra e Venda |
| `PROCURACAO` | Procuração |
| `COMPROVANTE_PAGAMENTO` | Comprovante de Pagamento |

### 5.5 Administrativos (3)
| Código | Descrição |
|--------|-----------|
| `PROTOCOLO_ONR` | Protocolo do ONR |
| `ASSINATURA_DIGITAL` | Certificado de Assinatura Digital |
| `OUTRO` | Documento não classificado |

### 5.6 Tipos Especiais
| Código | Descrição |
|--------|-----------|
| `DESCONHECIDO` | Documento não reconhecido pelo sistema (candidato a novo tipo) |

> **Nota sobre expansibilidade**: A lista de tipos não é fixa. Através do sistema de self-annealing (Seção 10), novos tipos podem ser adicionados quando documentos recorrentes não se encaixam nas categorias existentes. Documentos classificados como `DESCONHECIDO` são registrados para análise e possível criação de novos tipos.

---

## 6. CONFIGURAÇÃO DO AMBIENTE

### 6.1 Variáveis de Ambiente (.env)

```env
# Veja .env.example para a lista completa de variaveis
# NUNCA commite o arquivo .env com valores reais!

# Google Cloud - Document AI
GOOGLE_APPLICATION_CREDENTIALS=credentials/[SEU_ARQUIVO_CREDENCIAIS].json
GOOGLE_PROJECT_ID=[SEU_PROJECT_ID]
DOCUMENT_AI_PROCESSOR_ID=[SEU_PROCESSOR_ID]
DOCUMENT_AI_LOCATION=us

# Google Gemini (PRINCIPAL)
GEMINI_API_KEY=[SUA_GEMINI_API_KEY]
GEMINI_MODEL=gemini-3-flash-preview
GEMINI_MODEL_FALLBACK=gemini-2.5-flash
```

### 6.2 Dependências Python

```
google-cloud-documentai>=2.0.0    # OCR (deprecated)
google-generativeai>=0.3.0        # Gemini Vision
python-dotenv>=1.0.0              # Variáveis de ambiente
Pillow>=10.0.0                    # Processamento de imagens
PyMuPDF>=1.23.0                   # Extração de PDFs
docx2pdf>=0.1.8                   # Conversão DOCX
```

### 6.3 Instalação

```bash
cd execution
pip install -r requirements.txt
```

---

## 7. REGRAS CRÍTICAS DE EXTRAÇÃO

### 7.1 NUNCA FABRICAR DADOS
- Se um campo não estiver visível/legível, retornar `null`
- Proibido: "EXEMPLO DE NOME", "01/01/XXXX", dados por suposição
- Preferir `null` a dados incorretos

### 7.2 Explicação Contextual Obrigatória
- Cada extração deve incluir 3-5 parágrafos de explicação
- Identificar o que é o documento
- Descrever dados principais encontrados
- Explicar situação/contexto
- Listar observações relevantes

### 7.3 Validação de Valores Financeiros
- Em contratos: `sinal + saldo = preco_total`
- Não confundir entrada com valor total
- Verificar moeda e data de referência

### 7.4 Distinguir Pessoas
- **TITULAR**: pessoa do documento (quem é identificado/certificado)
- **AUTORIDADE**: oficial que emite/assina
- Nunca retornar nome da autoridade como titular

### 7.5 Ônus em Matrículas
- Capturar TODOS os ônus (ativos e históricos)
- Verificar status: QUITADA, BAIXADA, EM VIGÊNCIA
- Estruturar em `onus_ativos` e `onus_historicos`

---

## 8. RESOLUÇÃO DE CONFLITOS

Quando o mesmo dado aparece em múltiplos documentos, usar esta prioridade:

| Prioridade | Tipo de Documento | Justificativa |
|------------|------------------|---------------|
| 100 | RG | Documento oficial de identificação |
| 95 | Certidão de Nascimento | Oficial estado civil |
| 90 | Certidão de Casamento | Oficial matrimonial |
| 85 | Compromisso de Compra e Venda | Assinado pelas partes |
| 80 | Matrícula do Imóvel | Oficial do RI |
| 75 | CNDT | Certidão oficial trabalhista |
| 70 | ITBI | Oficial tributo municipal |
| 65 | IPTU | Oficial cadastro municipal |
| 60 | VVR | Oficial avaliação municipal |
| 55 | CND Municipal | Certidão municipal |
| 50 | Escritura | Referência (documento final) |
| 40 | Comprovante Pagamento | Auxiliar financeiro |
| 30 | Protocolo ONR | Controle administrativo |
| 20 | Assinatura Digital | Certificado técnico |
| 10 | Outro | Não classificado |

---

## 9. MÉTRICAS DE SUCESSO VALIDADAS

### 9.1 Fase 1 - Catalogação
- **Documentos catalogados**: 39/39 (100%)
- **Confiança classificação**: 100% alta
- **Taxa de sucesso**: 100%

### 9.2 Fase 3 - Extração
- **Documentos extraídos**: 37/39 (94.9%)
- **Qualidade média**: 7.5/10 (validada por 37 subagentes)
- **Taxa de sucesso**: 94.9%

### 9.3 Performance
- **Pipeline serial**: ~30-40 minutos (39 docs)
- **Pipeline paralelo (10 workers)**: ~5-10 minutos (39 docs)
- **Custo por escritura**: ~$0.32 (Gemini 3 Flash)

### 9.4 Métricas de Qualidade do Sistema
- **Taxa de documentos não reconhecidos**: Ideal < 5%
  - Acima de 5% indica necessidade de expandir tipos suportados
  - Monitorar via arquivos em `.tmp/descobertas/`

---

## 10. SISTEMA AUTO-MELHORÁVEL (SELF-ANNEALING)

O sistema é projetado para melhorar continuamente através de dois mecanismos:

### 10.1 Conceito

- **Erros são oportunidades**: Cada falha ou documento não reconhecido alimenta o ciclo de melhoria
- **Evolução contínua**: O sistema expande suas capacidades ao longo do tempo
- **Responsabilidade do orquestrador**: O agente de IA identifica, propõe e implementa melhorias
- **Documentação viva**: Diretivas e schemas são atualizados com aprendizados

### 10.2 Self-Annealing de Erros

Quando algo quebra, o sistema deve:

1. **Ler** erro e stack trace
2. **Corrigir** o script
3. **Testar** novamente
4. **Atualizar** a diretiva com o aprendizado
5. **Sistema fica mais forte**

**Exemplo:**
```
Problema: Rate limit da API
→ Investigar API
→ Descobrir endpoint batch
→ Reescrever script para usar batch
→ Testar
→ Atualizar diretiva com nova informação
```

### 10.3 Fluxo de Descoberta de Novos Tipos de Documentos

Quando Gemini classifica um documento como `DESCONHECIDO`:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DETECÇÃO                                                     │
│     └── Gemini retorna tipo="DESCONHECIDO"                      │
│         com justificativa e características observadas           │
├─────────────────────────────────────────────────────────────────┤
│  2. REGISTRO                                                     │
│     └── Sistema salva em .tmp/descobertas/                      │
│         {timestamp}_{arquivo}.json com:                          │
│         - Caminho do arquivo original                            │
│         - Output completo do Gemini                              │
│         - Características identificadas                          │
├─────────────────────────────────────────────────────────────────┤
│  3. ANÁLISE (Orquestrador)                                       │
│     ├── Revisa descobertas pendentes                             │
│     ├── Agrupa por padrões similares                             │
│     └── Decide ação:                                             │
│         - Criar novo tipo                                        │
│         - Mapear para tipo existente (ajustar prompt)            │
│         - Marcar como irrelevante                                │
├─────────────────────────────────────────────────────────────────┤
│  4. IMPLEMENTAÇÃO                                                │
│     ├── Criar novo prompt em execution/prompts/                  │
│     ├── Criar novo schema em execution/schemas/                  │
│     ├── Atualizar classify_with_gemini.py                        │
│     └── Atualizar documentação                                   │
├─────────────────────────────────────────────────────────────────┤
│  5. VALIDAÇÃO                                                    │
│     └── Reprocessar documento original                           │
│         para confirmar classificação correta                     │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Arquivos do Sistema de Self-Annealing

| Arquivo/Diretório | Propósito |
|------------------|-----------|
| `.tmp/descobertas/` | Descobertas de novos tipos pendentes de análise |
| `execution/prompts/desconhecido.txt` | Prompt para análise exploratória de documentos não reconhecidos |
| `execution/schemas/desconhecido.json` | Schema para capturar características de documentos desconhecidos |

### 10.5 Responsabilidades do Orquestrador

O agente de IA (Layer 2) deve:

1. **Monitorar** classificações com tipo `DESCONHECIDO`
2. **Analisar** padrões em descobertas acumuladas
3. **Propor** novos tipos quando houver recorrência (3+ documentos similares)
4. **Implementar** expansões aprovadas (prompts, schemas, código)
5. **Atualizar** diretivas com aprendizados
6. **Validar** que novas capacidades funcionam corretamente

---

## 11. CHECKLIST PARA NOVOS AGENTES

Antes de fazer qualquer modificação:

- [ ] Li este documento completamente
- [ ] Entendi a arquitetura de 3 camadas
- [ ] Sei qual fase/script preciso modificar
- [ ] Verifiquei se já existe ferramenta para a tarefa
- [ ] Li a diretiva relevante em `directives/`
- [ ] Vou atualizar a diretiva se aprender algo novo

---

## 12. REFERÊNCIA CRUZADA DE DOCUMENTOS

| Documento | Localização | Propósito |
|-----------|-------------|-----------|
| Este arquivo | `documentacao/FONTE_DE_VERDADE.md` | Referência central |
| Instruções agente | `CLAUDE.md` | Regras de operação |
| Arquitetura | `directives/01_arquitetura_sistema.md` | Visão geral do sistema |
| Tipos documentos | `directives/02_tipos_documentos.md` | 26 tipos com características |
| Pipeline | `directives/03_pipeline_processamento.md` | Detalhes técnicos das fases |
| Manual operação | `directives/04_manual_operacao.md` | Comandos e troubleshooting |
| Schemas | `execution/schemas/*.json` | Estrutura de dados por tipo |
| Prompts | `execution/prompts/*.txt` | Templates de extração |
| Prompt desconhecido | `execution/prompts/desconhecido.txt` | Análise exploratória de docs não reconhecidos |
| Schema desconhecido | `execution/schemas/desconhecido.json` | Estrutura para captura de características |
| Campos minuta | `Guia-de-campos-e-variaveis/` | 180+ campos detalhados |

---

## 13. CONTATO E MANUTENÇÃO

- **Repositório**: Local (não publicado)
- **Branch principal**: `main`
- **Branch atual**: `feature/full-project-upload`
- **Última atualização**: 2026-01-28

---

> **Lembre-se**: Este documento é a fonte de verdade. Se houver conflito entre este documento e outro arquivo, este documento prevalece. Se descobrir informações desatualizadas, atualize este documento.
