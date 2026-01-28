# Plano de Catalogacao e Extracao de Dados de Documentos

**Versao:** 2.0
**Data:** 2026-01-27
**Status:** Fase 1 Completa - Fase 3 em Producao (OCR Deprecated)
**Ultima Atualizacao:** Nova arquitetura com Gemini 3 Flash (sem OCR)

---

## Changelog

### v2.1 (2026-01-27) - Correções Críticas de Processamento
- **CORRIGIDO** processamento multipágina de PDFs - todas as páginas agora extraídas
- **ADICIONADO** suporte a arquivos DOCX via conversão automática
- Validação de qualidade com 37 subagentes (média 7.5/10)
- 37/39 documentos extraídos com sucesso (94.9%)

### v2.0 (2026-01-27) - Nova Arquitetura Gemini 3 Flash
- **DEPRECATED** Fase 2 (OCR) - Gemini 3 Flash processa documentos diretamente
- Migrado SDK de `google.generativeai` para `google.genai`
- Fase 3 agora usa extração multimodal direta
- Adicionada Fase 4 para mapeamento de campos finais
- Prompts atualizados com exemplos genéricos (não específicos)
- Implementadas regras anti-fabricação de dados

### v1.2 (2026-01-27) - Fase 1 Validada
- Adicionados 2 novos tipos de documento: PROTOCOLO_ONR, ASSINATURA_DIGITAL
- Adicionada nova categoria "2.5 Documentos Administrativos e Digitais"
- Documentado batch processing paralelo (flag --parallel)
- Validacao completa com 39 documentos reais (100% sucesso, 100% alta confianca)
- Adicionada secao "6.5 Batch Processing Paralelo" com decisoes de design
- Performance: preparacao 50% mais rapida em modo paralelo
- Documentados learnings de uso em producao (secao 11)
- Atualizada secao 10 com status da Fase 2

### v1.1 (2026-01-27)
- Ajustes na Fase 1 - exclusao de subpastas finais e classificacao via Gemini

### v1.0 (2026-01-27)
- Versao inicial do plano

---

## 1. VISAO GERAL

### 1.1 Objetivo Final
Criar um sistema que:
1. Identifique e catalogue todos os tipos de documentos em uma escritura
2. Extraia texto via OCR (Google Document AI)
3. Estruture os dados extraidos em variaveis padronizadas
4. Mapeie esses dados para os campos necessarios da minuta

### 1.2 Contexto do Problema
Escrituras de compra e venda de imoveis requerem o preenchimento de **180+ campos** divididos em 4 categorias:

| Categoria | Campos | Arquivo de Referencia |
|-----------|--------|----------------------|
| Pessoa Natural | 39 | `campos-pessoa-natural.md` |
| Pessoa Juridica | 76 | `campos-pessoa-juridica.md` |
| Dados do Imovel | 33+ | `campos-dados-imovel.md` |
| Negocio Juridico | 33+ | `campos-negocio-juridico.md` |

Esses campos devem ser preenchidos a partir de **documentos fisicos digitalizados** (PDFs, fotos) que chegam desorganizados.

### 1.3 Escrituras de Teste
Temos 2 escrituras completas em `Test-Docs/`:

```
Test-Docs/
├── FC 515 - 124 p280509/     # Escritura 1 (39 arquivos) - VALIDADA
│   ├── COMPRADORA/           # Docs da compradora - PROCESSADA
│   ├── VENDEDORES/           # Docs dos vendedores - PROCESSADA
│   ├── FC515 - 124/          # IGNORADA (escritura final)
│   └── recibos/              # Comprovantes - PROCESSADA
│
└── GS 357 - 11 p.281773/     # Escritura 2 (~25 arquivos)
    ├── Compradora/           # Docs da compradora - PROCESSAR
    ├── Vendedores/           # Docs dos vendedores - PROCESSAR
    ├── Comprovantes/         # Comprovantes - PROCESSAR
    └── GS 357 - 11/          # IGNORADA (escritura final)
```

### 1.4 Regras de Exclusao
**IMPORTANTE:** Subpastas cujo nome e similar ao da pasta mae devem ser IGNORADAS:
- `FC515 - 124/` dentro de `FC 515 - 124 p280509/`
- `GS 357 - 11/` dentro de `GS 357 - 11 p.281773/`

**Motivo:** Essas subpastas contem apenas os documentos finais da escritura ja lavrada (minuta final, boletos, prenotacao). Nao sao fonte de dados para extracao.

---

## 2. TIPOS DE DOCUMENTOS IDENTIFICADOS

### 2.1 Documentos Pessoais (7 tipos)
| Documento | Dados Extraiveis | Campos Alvo |
|-----------|-----------------|-------------|
| RG | Nome, RG, Orgao Emissor, UF, Data Emissao, Filiacao | Pessoa Natural 1-6 |
| CNH | Nome, CNH, CPF, Data Nasc., Orgao Emissor | Pessoa Natural 1-2, 9, 11-12 |
| CPF | CPF, Nome, Data Nasc. | Pessoa Natural (CPF) |
| Certidao de Nascimento | Nome, Data Nasc., Filiacao, Naturalidade | Pessoa Natural 1, 7, 9 |
| Certidao de Casamento | Nomes, Data Casamento, Regime de Bens, Cartorio | Pessoa Natural (Dados Familiares) |
| Certidao de Obito | Nome, Data Obito, Local | Pessoa Natural (Sucessao) |
| Comprovante de Residencia | Endereco completo | Pessoa Natural (Endereco) |

### 2.2 Certidoes (7 tipos)
| Documento | Dados Extraiveis | Campos Alvo |
|-----------|-----------------|-------------|
| CNDT | Numero, Data/Hora Expedicao, Nome/CPF | Pessoa Natural (CNDT) |
| CND Federal | Tipo Certidao, Data Emissao, Validade, Codigo | Pessoa Natural (Certidao Uniao) |
| CND Estadual | Tipo Certidao, Data Emissao, Validade | Pessoa Natural (Certidao Estado) |
| CND Municipal | SQL, Debitos, Validade | Dados Imovel (Negativa IPTU) |
| CND Imovel | SQL, Debitos, Validade | Dados Imovel (Negativa IPTU) |
| CND Condominio | Unidade, Debitos, Data | Negocio Juridico (Declaracoes) |
| Contrato Social | CNPJ, Razao Social, Socios, Capital | Pessoa Juridica (todos) |

### 2.3 Documentos do Imovel (6 tipos)
| Documento | Dados Extraiveis | Campos Alvo |
|-----------|-----------------|-------------|
| Matricula | N. Matricula, RI, Descricao, Proprietarios, Onus | Dados Imovel (todos) |
| ITBI | N. Guia, Base Calculo, Valor | Negocio Juridico (Imposto) |
| VVR | Valor Venal Referencia, SQL | Dados Imovel (Valores Venais) |
| IPTU | SQL, Valor Venal, Area | Dados Imovel (Valores Venais) |
| Dados Cadastrais | SQL, Endereco, Area | Dados Imovel (Cadastro) |
| Escritura | Dados completos da transacao | Referencia/Validacao |

### 2.4 Documentos do Negocio (3 tipos)
| Documento | Dados Extraiveis | Campos Alvo |
|-----------|-----------------|-------------|
| Compromisso de Compra e Venda | Valor, Condicoes, Partes | Negocio Juridico (varios) |
| Procuracao | Outorgante, Outorgado, Poderes | Pessoa Natural (Representante) |
| Comprovante de Pagamento | Valor, Data, Beneficiario | Negocio Juridico (Pagamento) |

### 2.5 Documentos Administrativos e Digitais (3 tipos) - NOVO v1.2
| Documento | Dados Extraiveis | Campos Alvo |
|-----------|-----------------|-------------|
| PROTOCOLO_ONR | Numero protocolo, Data, Status pedido | Controle interno (rastreamento de certidoes) |
| ASSINATURA_DIGITAL | Signatarios, Data assinatura, Status validacao | Controle interno (comprovacao de assinaturas) |
| OUTRO | Variavel | Revisao Manual |

**Quando usar PROTOCOLO_ONR:**
- Comprovantes de geracao de protocolo SAEC (Sistema de Atendimento Eletronico ao Cidadao)
- Confirmacoes de pedido no site do ONR (Operador Nacional do Registro)
- Recibos de solicitacao de certidao digital
- Documentos com mencao a "protocolo gerado", "SAEC", "ONR", "certidao digital solicitada"

**Quando usar ASSINATURA_DIGITAL:**
- Certificados de conclusao de assinatura eletronica (DocuSign, Adobe Sign, GOV.BR)
- Documentos tipo "Summary" que listam todas as assinaturas de um contrato
- Comprovantes de validacao de assinatura digital
- NAO usar para documentos que apenas possuem assinatura digital (usar o tipo do documento em si)

**Edge Cases:**
- Se o documento for uma certidao COM protocolo ONR visivel, classificar como o tipo da certidao (ex: MATRICULA_IMOVEL), nao como PROTOCOLO_ONR
- PROTOCOLO_ONR e apenas para comprovantes de SOLICITACAO, nao para certidoes prontas
- ASSINATURA_DIGITAL e para documentos SOBRE assinaturas, nao documentos assinados digitalmente

### 2.6 Resumo: 26 Tipos de Documentos

| Categoria | Tipos | Total |
|-----------|-------|-------|
| Documentos Pessoais | RG, CNH, CPF, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, CERTIDAO_OBITO, COMPROVANTE_RESIDENCIA | 7 |
| Certidoes | CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, CND_IMOVEL, CND_CONDOMINIO, CONTRATO_SOCIAL | 7 |
| Documentos do Imovel | MATRICULA_IMOVEL, ITBI, VVR, IPTU, DADOS_CADASTRAIS, ESCRITURA | 6 |
| Documentos do Negocio | COMPROMISSO_COMPRA_VENDA, PROCURACAO, COMPROVANTE_PAGAMENTO | 3 |
| Documentos Administrativos | PROTOCOLO_ONR, ASSINATURA_DIGITAL, OUTRO | 3 |
| **Total** | | **26** |

---

## 3. PIPELINE DE PROCESSAMENTO

### FASE 1: Inventario e Catalogacao com Classificacao Visual - COMPLETA

**Status:** VALIDADA COM SUCESSO
**Resultado:** 39 documentos processados, 100% sucesso, 100% alta confianca

```
ENTRADA: Pasta de uma escritura
SAIDA: catalogo.json com lista de arquivos e classificacao precisa via Gemini
```

**Problema resolvido:** Nomes de arquivos frequentemente NAO refletem o conteudo real.
Exemplos reais encontrados:
- `WhatsApp Image 2023-10-25 at 16.44.43.jpeg` -> MATRICULA_IMOVEL
- `PSX_20230819_105401.jpg` -> CERTIDAO_NASCIMENTO
- `Summary.pdf` -> ASSINATURA_DIGITAL (certificado DocuSign)

**Solucao:** Gemini Vision analisa visualmente cada documento e identifica seu tipo.

#### Etapa 1.1: Inventario Bruto
**Script:** `execution/inventory_files.py`
**Status:** IMPLEMENTADO E VALIDADO

**Tarefas:**
- [x] Percorrer recursivamente a pasta da escritura
- [x] EXCLUIR subpastas que sao similares ao nome da pasta mae (ver Regras de Exclusao 1.4)
- [x] Coletar metadados basicos: nome, extensao, tamanho, caminho relativo, subpasta
- [x] Gerar lista bruta de arquivos

**Saida:** `inventario_bruto.json`
```json
{
  "escritura_id": "FC_515_124_p280509",
  "data_inventario": "2026-01-27",
  "total_arquivos": 39,
  "arquivos": [
    {
      "id": "001",
      "nome": "WhatsApp Image 2023-10-25 at 16.44.43.jpeg",
      "caminho_relativo": "VENDEDORES/WhatsApp Image 2023-10-25 at 16.44.43.jpeg",
      "extensao": "jpeg",
      "tamanho_bytes": 318698,
      "subpasta": "VENDEDORES"
    }
  ]
}
```

#### Etapa 1.2: Classificacao Visual via Gemini
**Script:** `execution/classify_with_gemini.py`
**Status:** IMPLEMENTADO E VALIDADO

**Fluxo:**
1. Ler `inventario_bruto.json`
2. Para cada arquivo:
   a. Carregar arquivo (imagem ou PDF primeira pagina)
   b. Enviar ao Gemini 2.0 Flash com prompt de classificacao
   c. Receber tipo de documento identificado + pessoa relacionada
   d. Atualizar status

**Modos de Execucao:**

```bash
# Modo serial (padrao) - 1 arquivo por vez, rate limiting de 6s
python execution/classify_with_gemini.py FC_515_124_p280509

# Modo paralelo (recomendado) - preparacao em paralelo, envio serial
python execution/classify_with_gemini.py FC_515_124_p280509 --parallel

# Modo mock (teste sem API)
python execution/classify_with_gemini.py FC_515_124_p280509 --mock

# Limitar quantidade (para testes)
python execution/classify_with_gemini.py FC_515_124_p280509 --limit 5
```

**Batch Processing Paralelo (v1.2):**
- Preparacao de imagens em threads paralelas
- Envio para API continua serial (rate limiting obrigatorio)
- Reducao de ~50% no tempo de preparacao
- Flag: `--parallel`

**Tempos Estimados de Processamento:**

| Arquivos | Modo Serial | Modo Paralelo | Economia |
|----------|-------------|---------------|----------|
| 10 | ~1 min | ~40s | 33% |
| 39 | ~4 min | ~2.5 min | 38% |
| 100 | ~10 min | ~6 min | 40% |

**Rate Limiting:** 6 segundos entre requests (10 RPM do Gemini API)

**Tipos de Documentos Reconhecidos (26 tipos):**
```
RG, CNH, CPF, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO,
CERTIDAO_OBITO, CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL,
CND_CONDOMINIO, MATRICULA_IMOVEL, ITBI, VVR, IPTU,
DADOS_CADASTRAIS, COMPROMISSO_COMPRA_VENDA, ESCRITURA, PROCURACAO,
COMPROVANTE_RESIDENCIA, COMPROVANTE_PAGAMENTO, CONTRATO_SOCIAL,
PROTOCOLO_ONR, ASSINATURA_DIGITAL, OUTRO, ILEGIVEL
```

**Prompt de Classificacao:**
```
Voce e um especialista em documentos brasileiros de cartorio e registro de imoveis.

Analise esta imagem de documento e identifique:
1. TIPO_DOCUMENTO: Qual o tipo exato?
2. CONFIANCA: Alta, Media ou Baixa
3. PESSOA_RELACIONADA: Se identificavel, nome da pessoa no documento
4. OBSERVACAO: Breve descricao do que voce ve (max 100 caracteres)

Responda APENAS em JSON valido.
```

**Consideracoes:**
- PDFs multipaginas: primeira pagina para classificacao
- Arquivos DOCX: classificacao por heuristica de nome
- Arquivos corrompidos: marcar como "ERRO_LEITURA"
- Documentos nao reconhecidos: marcar como "OUTRO" para revisao manual

#### Etapa 1.3: Geracao do Catalogo Final
**Script:** `execution/generate_catalog.py`
**Status:** IMPLEMENTADO E VALIDADO

**Combina inventario + classificacao + contexto de subpasta**

**Saida:** `catalogo.json`
```json
{
  "escritura_id": "FC_515_124_p280509",
  "data_catalogo": "2026-01-27",
  "versao_catalogo": "1.0",
  "estatisticas": {
    "total_arquivos": 39,
    "classificados_sucesso": 39,
    "classificados_erro": 0,
    "alta_confianca": 39,
    "media_confianca": 0,
    "baixa_confianca": 0
  },
  "arquivos_por_tipo": {
    "RG": 5,
    "MATRICULA_IMOVEL": 6,
    "CERTIDAO_CASAMENTO": 3,
    "COMPROMISSO_COMPRA_VENDA": 4,
    "COMPROVANTE_PAGAMENTO": 6,
    "ITBI": 3,
    "CERTIDAO_NASCIMENTO": 2,
    "CNDT": 2,
    "CND_MUNICIPAL": 1,
    "VVR": 1,
    "IPTU": 1,
    "ESCRITURA": 1,
    "OUTRO": 4
  },
  "arquivos": [...],
  "arquivos_para_revisao": [...],
  "arquivos_com_erro": []
}
```

**Resultados da Validacao (FC 515 - 124):**
- 39 documentos processados
- 100% taxa de sucesso
- 100% alta confianca
- 4 arquivos marcados para revisao (tipo OUTRO)
- 0 erros de processamento

---

### FASE 2: OCR com Google Document AI - DEPRECATED
**Status:** SUBSTITUÍDA pela extração direta com Gemini 3 Flash

> ⚠️ **Esta fase foi removida do pipeline.**
>
> O Gemini 3 Flash processa documentos (PDF/imagens) diretamente sem
> necessidade de OCR intermediário. Veja `03_fase2_ocr_completa.md` para
> documentação histórica.

---

### FASE 3: Extração Contextual com Gemini 3 Flash - COMPLETA
**Objetivo:** Extrair dados estruturados diretamente de documentos visuais.

```
ENTRADA: Documento Original (PDF/imagem) + Tipo de documento (Fase 1)
SAIDA: JSON estruturado + Explicação Contextual
```

**Arquitetura:**
```
+------------------+     +---------------------+     +------------------+
|   Documento      | --> | Gemini 3 Flash      | --> | Saida            |
|   Original       |     | (Prompt Espec.)     |     | Estruturada      |
+------------------+     +---------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   Arquivo PDF/IMG         Interpretacao            JSON + Markdown
   (Direto - sem OCR)      Contextual               Catalogado
```

**Implementação Completa (v2.1):**
- [x] 3.1 Script `execution/extract_with_gemini.py` (SDK google.genai)
- [x] 3.2 14 prompts especializados em `execution/prompts/`
- [x] 3.3 Regras anti-fabricação de dados
- [x] 3.4 Validação de valores financeiros (sinal + saldo = total)
- [x] 3.5 Extração de códigos de autenticação
- [x] 3.6 Cadeia dominial completa em matrículas
- [x] 3.7 Processamento multipágina de PDFs (todas as páginas concatenadas)
- [x] 3.8 Suporte a arquivos DOCX (conversão automática)
- [x] 3.9 Zoom adaptativo (2.0 para ≤10 páginas, 1.5 para maiores)
- [x] 3.10 Qualidade JPEG adaptativa por tamanho
- [x] 3.11 Validação de qualidade com subagentes (7.5/10 média)

**Resultados:**
- 37/39 documentos extraídos com sucesso (94.9%)
- Qualidade média: 7.5/10 (validada por 37 subagentes QA)
- 2 falhas: documentos não-processáveis (custas/minuta internos)

**Saída:**
```
.tmp/contextual/
├── FC_515_124_p280509/
│   ├── 001_IPTU.json
│   ├── 002_PROTOCOLO_ONR.json
│   ├── ...
│   └── relatorio_contextual.json
```

**Veja:** `04_fase3_extracao_estruturada.md` para detalhes completos.

---

### FASE 4: Mapeamento para Campos da Minuta - PLANEJADO
**Objetivo:** Mapear dados extraídos (Fase 3) para os campos finais da minuta.

```
ENTRADA: JSONs estruturados da Fase 3 (.tmp/contextual/)
SAIDA: Arquivos limpos com apenas campos mapeados para a minuta
```

**Arquitetura:**
```
+---------------------+     +------------------+     +------------------+
| Dados Extraidos     | --> | Script de        | --> | Campos Finais    |
| (Fase 3)            |     | Mapeamento       |     | Mapeados         |
+---------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   .tmp/contextual/        Guia-de-campos/           .tmp/mapped/
   *.json                  *.md                      *.json
```

**Campos Alvo (180+ campos):**
| Categoria | Campos | Arquivo de Referencia |
|-----------|--------|----------------------|
| Pessoa Natural | 39 | `Guia-de-campos-e-variaveis/campos-pessoa-natural.md` |
| Pessoa Juridica | 76 | `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md` |
| Dados do Imovel | 33+ | `Guia-de-campos-e-variaveis/campos-dados-imovel.md` |
| Negocio Juridico | 33+ | `Guia-de-campos-e-variaveis/campos-negocio-juridico.md` |

**Tarefas:**
- [ ] 4.1 Criar script `execution/map_to_fields.py`
  - Ler JSONs da Fase 3
  - Aplicar regras de mapeamento
  - Resolver conflitos (prioridade por tipo de documento)
  - Gerar arquivos finais mapeados

- [ ] 4.2 Criar arquivo de regras de mapeamento
  - `execution/mapping_rules.json`
  - Define: documento.campo → minuta.campo

- [ ] 4.3 Gerar relatório de mapeamento por escritura
  ```json
  {
    "escritura_id": "FC_515_124_p280509",
    "pessoa_natural": {
      "NOME": { "valor": "FULANO DE TAL", "fonte": "030_RG.json", "campo_origem": "dados_catalogados.nome_completo" },
      "CPF": { "valor": "000.000.000-00", "fonte": "007_COMPROMISSO.json", "campo_origem": "dados_catalogados.compradores[0].cpf" }
    },
    "dados_imovel": {...},
    "negocio_juridico": {...},
    "campos_faltantes": [...],
    "campos_conflitantes": [...]
  }
  ```

- [ ] 4.4 Criar diretiva `05_fase4_mapeamento_campos.md`

**Veja:** `Guia-de-campos-e-variaveis/` para referência dos 180+ campos.

---

## 4. ESTRUTURA DE ARQUIVOS

```
Minutas-Cartorio-Documentos/
├── directives/
│   ├── 00_system_architecture.md          # Arquitetura 3 camadas
│   ├── 01_plano_catalogacao_documentos.md # ESTE ARQUIVO
│   ├── 02_tipos_documentos_completo.md    # Referencia de 26 tipos (v1.2)
│   └── 03_mapeamento_documento_campos.md  # A criar (Fase 4)
│
├── execution/
│   ├── inventory_files.py                 # Fase 1.1 - Inventario bruto [OK]
│   ├── classify_with_gemini.py            # Fase 1.2 - Classificacao visual [OK]
│   ├── generate_catalog.py                # Fase 1.3 - Gerar catalogo final [OK]
│   ├── ocr_document_ai.py                 # Fase 2 - OCR documento unico [TODO]
│   ├── batch_ocr.py                       # Fase 2 - OCR em lote [TODO]
│   ├── extract_with_gemini.py             # Fase 3 - Extracao estruturada [TODO]
│   ├── mapping_rules.py                   # Fase 4 - Regras de mapeamento [TODO]
│   └── schemas/
│       ├── pessoa_natural.json
│       ├── pessoa_juridica.json
│       ├── dados_imovel.json
│       └── negocio_juridico.json
│
├── .tmp/                                  # Arquivos intermediarios (NAO COMMITAR)
│   ├── inventarios/                       # Fase 1.1 [POPULADO]
│   │   └── FC_515_124_p280509_bruto.json
│   ├── classificacoes/                    # Fase 1.2 [POPULADO]
│   │   └── FC_515_124_p280509_classificacao.json
│   ├── catalogos/                         # Fase 1.3 [POPULADO]
│   │   └── FC_515_124_p280509.json
│   ├── ocr/                               # Fase 2 [TODO]
│   └── structured/                        # Fase 3 [TODO]
│
├── Guia-de-campos-e-variaveis/            # Referencia de campos (180+)
└── Test-Docs/                             # Documentos de entrada
```

---

## 5. CHECKLIST DE EXECUCAO

### Sprint 1: Inventario e Classificacao Visual - COMPLETO
- [x] Criar `execution/inventory_files.py`
  - [x] Implementar logica de exclusao de subpastas
  - [x] Gerar `inventario_bruto.json`
- [x] Criar `execution/classify_with_gemini.py`
  - [x] Configurar cliente Gemini 2.0 Flash
  - [x] Implementar envio de imagens/PDFs para classificacao
  - [x] Criar prompt de classificacao padronizado
  - [x] Tratar erros (arquivos corrompidos, timeout, etc.)
  - [x] Implementar batch processing paralelo (v1.2)
- [x] Criar `execution/generate_catalog.py`
  - [x] Combinar inventario + classificacao
  - [x] Gerar lista de arquivos para revisao manual
- [x] Executar pipeline na escritura FC 515 - 124
- [x] Validar classificacoes (100% sucesso)
- [x] Documentar tipos de documentos encontrados

### Sprint 2: OCR - DEPRECATED
> ⚠️ Esta sprint foi **SUBSTITUÍDA** pela Sprint 3 com Gemini 3 Flash direto.
- [x] ~~Validar credenciais Google Document AI~~ (não mais necessário)
- [x] ~~Criar `execution/ocr_document_ai.py`~~ (mantido apenas para referência)
- [x] ~~Criar `execution/batch_ocr.py`~~ (mantido apenas para referência)

### Sprint 3: Extração com Gemini 3 Flash - COMPLETA
- [x] Atualizar script para usar Gemini 3 Flash direto (sem OCR)
- [x] Migrar SDK de `google.generativeai` para `google.genai`
- [x] Criar 14 prompts especializados por tipo de documento
- [x] Implementar regras anti-fabricação de dados
- [x] Validação de valores financeiros (sinal + saldo = total)
- [x] Exemplos genéricos em todos os prompts
- [x] Testar com escritura FC_515_124_p280509
- [x] Processar 37/39 documentos com sucesso (94.9%)
- [x] Corrigir processamento multipágina de PDFs
- [x] Adicionar suporte a arquivos DOCX
- [x] Validação de qualidade com subagentes (7.5/10 média)

### Sprint 4: Mapeamento para Campos da Minuta - PRÓXIMA
- [ ] Criar script `execution/map_to_fields.py`
- [ ] Criar arquivo de regras `execution/mapping_rules.json`
- [ ] Mapear dados extraídos → campos da minuta (180+ campos)
- [ ] Resolver conflitos (mesmo dado em múltiplos documentos)
- [ ] Gerar relatório de mapeamento com campos faltantes
- [ ] Criar `directives/05_fase4_mapeamento_campos.md`

### Sprint 5: Refinamento e Validação
- [ ] Tratar casos especiais (documentos ruins, extração falha)
- [ ] Implementar validação de dados (CPF válido, datas consistentes)
- [ ] Criar relatório de campos faltantes por escritura
- [ ] Testar com segunda escritura (GS 357 - 11)
- [ ] Documentar limitações e melhorias futuras

---

## 6. DECISOES DE DESIGN

### 6.1 Classificacao de Documentos: Gemini Vision (OBRIGATORIO)
**Decisao:** Usar Gemini 2.0 Flash para classificacao visual de TODOS os documentos
- Nomes de arquivos NAO sao confiaveis (ex: "WhatsApp Image...", "PSX_...")
- Gemini analisa visualmente o documento e identifica o tipo
- Abordagem mais robusta que regras baseadas em nome de arquivo

**Fluxo:**
```
Arquivo -> Gemini Vision -> Tipo identificado -> Catalogo
```

### 6.2 OCR: Google Document AI
**Decisao:** Usar Google Document AI para extracao de texto
- Ja temos credenciais configuradas
- Otimizado para documentos em portugues brasileiro
- Melhor precisao para documentos formais (certidoes, matriculas)

### 6.3 Extracao Estruturada: Gemini com Contexto
**Decisao:** Usar Gemini para extrair dados estruturados
- Ja sabemos o tipo do documento (da Fase 1)
- Prompt especifico por tipo de documento
- Retorna JSON validavel com os campos esperados

### 6.4 Subpastas a Ignorar
**Decisao:** Excluir subpastas cujo nome e similar ao da pasta mae
- Contem apenas documentos finais (escritura lavrada)
- Nao sao fonte de dados para extracao
- Regra: Se `subpasta.lower()` esta contido em `pasta_mae.lower()`, IGNORAR

### 6.5 Batch Processing Paralelo (v1.2)
**Decisao:** Paralelizar preparacao de arquivos, manter envio serial

**Justificativa:**
- Preparacao de imagens (carregar, converter PDF) e CPU-bound
- Envio para API e limitado por rate limiting (10 RPM)
- Solucao: ThreadPoolExecutor para preparacao + fila serial para envio

**Arquitetura:**
```
+---------------------+
|   Thread Pool       |
|  +---+ +---+ +---+  |     +--------------+     +---------+
|  |T1 | |T2 | |T3 |  | --> | Fila Serial  | --> | Gemini  |
|  +---+ +---+ +---+  |     | (rate limit) |     |   API   |
|   (preparacao)      |     +--------------+     +---------+
+---------------------+
```

**Trade-offs:**
| Aspecto | Preparacao Paralela | Preparacao Serial |
|---------|--------------------|--------------------|
| Tempo total | ~40% menor | Baseline |
| Uso de memoria | Maior (buffer) | Menor |
| Complexidade | Media | Baixa |
| Resiliencia | Igual (retry mantido) | Igual |

**Quando usar:**
- `--parallel`: Processamento em lote (>10 arquivos)
- Padrao (serial): Testes, debugging, baixo volume

---

## 7. DEPENDENCIAS E REQUISITOS

### 7.1 Bibliotecas Python
```
google-genai               # Novo SDK unificado (Fase 1 e Fase 3)
python-dotenv              # Carregar .env
Pillow                     # Manipulacao de imagens
PyMuPDF (fitz)             # Converter PDF para imagem

# DEPRECATED (mantido para referência histórica):
# google-cloud-documentai  # OCR na Fase 2 (não mais usado)
# google-generativeai      # SDK antigo (substituído por google-genai)
```

### 7.2 Credenciais Necessarias
- [x] Google Document AI (configurado em `.env`)
- [x] Gemini API Key (configurado em `.env`)

### 7.3 Recursos
- Processador Document AI: `9bc0134de4126073`
- Projeto GCP: `ia-cartorio-fluxo-minutas`
- Regiao: `us`

### 7.4 Requisitos de Sistema (v1.2)
| Modo | CPU | Memoria | Observacao |
|------|-----|---------|------------|
| Serial | 1 core | ~200MB | Padrao, baixo consumo |
| Paralelo | 4+ cores | ~500MB | Recomendado para >10 arquivos |

**Nota:** Threading e nativo do Python, sem dependencias adicionais.

---

## 8. METRICAS DE SUCESSO

| Metrica | Alvo | Resultado Fase 1 |
|---------|------|------------------|
| Documentos catalogados | 100% dos arquivos | 100% (39/39) |
| Classificacao correta | >90% | 100% alta confianca |
| OCR processado | 100% dos documentos relevantes | - (Fase 2) |
| Campos extraidos corretamente | >90% dos campos visiveis | - (Fase 3) |
| Mapeamento completo | Todos os tipos mapeados | - (Fase 4) |

---

## 9. RISCOS E MITIGACOES

| Risco | Mitigacao | Status |
|-------|-----------|--------|
| OCR ruim em fotos de baixa qualidade | Usar Gemini Vision como fallback | Planejado |
| Documentos em formatos nao padrao | Classificacao manual + extrator generico | Mitigado |
| Limite de API Document AI | Implementar batch com rate limiting | Planejado |
| Campos ambiguos (mesmo dado em 2 docs) | Definir prioridade por tipo de documento | Planejado |
| Nomes de arquivo nao informativos | Gemini Vision para classificacao | RESOLVIDO |

---

## 10. PROXIMOS PASSOS

### Fase 1 - CONCLUÍDA ✅
1. ~~Revisar este plano~~
2. ~~Criar estrutura de pastas~~
3. ~~Implementar Fase 1~~
4. ~~Validar com escritura real~~

### Fase 2 - DEPRECATED ⚠️
> Substituída pela extração direta com Gemini 3 Flash.

### Fase 3 - COMPLETA ✅
1. ~~Atualizar script para Gemini 3 Flash~~
2. ~~Migrar para SDK google.genai~~
3. ~~Criar 14 prompts especializados~~
4. ~~Implementar regras anti-fabricação~~
5. ~~Corrigir processamento multipágina de PDFs~~
6. ~~Adicionar suporte a arquivos DOCX~~
7. ~~Executar extração completa (37/39 documentos - 94.9%)~~
8. ~~Validação de qualidade com subagentes (média 7.5/10)~~

### Fase 4 - PRÓXIMA 🔜
1. Criar script de mapeamento para campos da minuta
2. Mapear dados extraídos → 180+ campos
3. Gerar arquivos limpos com campos finais

### Futuro
- Fase 5: Integração com sistema de minutas
- Fase 6: Pipeline automatizado

---

## 11. LEARNINGS DA FASE 1

### 11.1 Tipos de Documentos Mais Frequentes
Com base nos 39 documentos processados:

| Tipo | Quantidade | % |
|------|------------|---|
| MATRICULA_IMOVEL | 6 | 15% |
| COMPROVANTE_PAGAMENTO | 6 | 15% |
| RG | 5 | 13% |
| COMPROMISSO_COMPRA_VENDA | 4 | 10% |
| OUTRO | 4 | 10% |
| CERTIDAO_CASAMENTO | 3 | 8% |
| ITBI | 3 | 8% |
| Demais | 8 | 21% |

### 11.2 Insights Importantes
1. **WhatsApp Images sao comuns** - Maioria dos documentos de vendedores chega como foto de WhatsApp
2. **Gemini identifica pessoas** - Consegue extrair nomes mesmo de fotos de baixa qualidade
3. **Documentos digitais crescendo** - Protocolos ONR e assinaturas DocuSign aparecem frequentemente
4. **Subpastas organizam por parte** - COMPRADORA, VENDEDORES ajudam na inferencia de papel

### 11.3 Arquivos Classificados como OUTRO
Documentos que foram para revisao manual:
- `Certidao Digital - SAEC ap.pdf` - Protocolo ONR (novo tipo)
- `Certidao Digital - SAEC.pdf` - Protocolo ONR (novo tipo)
- `Summary.pdf` - Certificado DocuSign (novo tipo)
- `Custas - FC 515 - 124.docx` - Planilha de custas (mantido como OUTRO)

### 11.4 Melhorias Sugeridas para Futuro
1. **Agrupamento automatico** - Agrupar documentos da mesma pessoa
2. **Deteccao de duplicatas** - Mesmo documento em formatos diferentes
3. **OCR preventivo** - Fazer OCR durante classificacao para documentos suspeitos
4. **Feedback loop** - Correcoes manuais melhoram prompts futuros

---

## 12. ADENDO: DIRETIVAS DE PRODUÇÃO (FUTURO)

> **IMPORTANTE PARA AGENTES FUTUROS**
>
> Este documento e as demais diretivas do projeto foram escritas durante a fase de
> DESENVOLVIMENTO, contendo detalhes técnicos, decisões de design, troubleshooting
> e histórico que foram úteis para construir o sistema.
>
> **Quando todas as fases estiverem completas e funcionando:**
> - Deverá ser criada uma nova diretiva (ou conjunto de diretivas) simplificada
> - Foco em OPERAÇÃO/PRODUÇÃO, não em desenvolvimento
> - Instruções claras de "como usar" sem o histórico de "como foi construído"
> - Remoção de tokens desnecessários para agentes operacionais
>
> **Estrutura sugerida para diretivas de produção:**
> - `PRODUCAO_01_como_processar_escritura.md` - Passo a passo operacional
> - `PRODUCAO_02_resolucao_problemas.md` - Troubleshooting comum
> - `PRODUCAO_03_manutencao.md` - Como atualizar prompts, adicionar tipos
>
> As diretivas atuais (01-04) devem ser mantidas como REFERÊNCIA TÉCNICA
> para futuras evoluções do sistema.

---

*Este documento sera atualizado conforme o projeto evolui.*
*Ultima atualizacao: 2026-01-27 - Validacao Fase 1 completa*
