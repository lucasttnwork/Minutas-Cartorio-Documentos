# Fase 4: Mapeamento de Campos da Minuta

**Versao:** 1.0
**Data:** 2026-01-28
**Status:** COMPLETA
**Dependencias:** Fase 3 (Extração Contextual)

---

## 1. VISAO GERAL

### 1.1 Objetivo

Mapear os dados extraídos dos documentos de cartório (Fase 3) para os campos padronizados da minuta de escritura. Este processo consolida informações de múltiplas fontes (RG, certidões, matrículas, compromissos) em uma estrutura única organizada por papel na transação.

### 1.2 Fluxo do Processo

```
ENTRADA: JSONs estruturados (.tmp/contextual/{caso_id}/*.json)
PROCESSAMENTO: Identificação de papéis, mapeamento, resolução de conflitos
SAIDA: Arquivo consolidado (.tmp/mapped/{caso_id}.json)
```

**Arquitetura:**
```
+---------------------+     +------------------+     +------------------+
| Dados Extraidos     | --> | Script de        | --> | Campos Finais    |
| (Fase 3)            |     | Mapeamento       |     | Mapeados         |
+---------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   .tmp/contextual/        map_to_fields.py          .tmp/mapped/
   37 JSONs                Resolve conflitos         1 JSON consolidado
```

### 1.3 Estrutura da Saida

```json
{
  "metadata": {
    "caso_id": "FC_515_124_p280509",
    "data_processamento": "2026-01-28T10:30:00",
    "documentos_processados": 37,
    "campos_preenchidos": 85,
    "campos_faltantes": ["alienante[0].naturalidade", ...]
  },
  "alienantes": [
    {
      "tipo": "pessoa_natural",
      "nome": "FULANO DE TAL",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      // ... demais campos
      "_fontes": {
        "nome": ["001_RG.json", "005_COMPROMISSO.json"],
        "cpf": ["005_COMPROMISSO.json"]
      }
    }
  ],
  "adquirentes": [...],
  "imovel": {...},
  "negocio": {...},
  "certidoes": {...}
}
```

---

## 2. SCRIPT PRINCIPAL

### 2.1 `execution/map_to_fields.py`

Script Python que realiza o mapeamento completo de dados extraídos para campos da minuta.

**Funcionalidades:**
- Carrega todos os JSONs de dados extraídos
- Identifica alienantes (vendedores) e adquirentes (compradores)
- Mapeia campos específicos de cada tipo de documento
- Resolve conflitos entre fontes usando sistema de prioridades
- Normaliza formatos (CPF, valores monetários, áreas)
- Rastreia origem de cada campo (rastreamento de fontes)
- Gera arquivo consolidado com metadados

### 2.2 Uso

**Comando básico:**
```bash
python execution/map_to_fields.py FC_515_124_p280509
```

**Com modo verbose:**
```bash
python execution/map_to_fields.py FC_515_124_p280509 --verbose
```

**Com resumo detalhado:**
```bash
python execution/map_to_fields.py FC_515_124_p280509 --output-format summary
```

### 2.3 Entrada

O script espera:
- Diretório `.tmp/contextual/{caso_id}/` com JSONs da Fase 3
- Arquivo `.tmp/catalogos/{caso_id}.json` (catálogo da Fase 1)

### 2.4 Saída

**Arquivo gerado:**
```
.tmp/mapped/{caso_id}.json
```

**Estrutura do output:**
- `metadata`: Informações sobre o processamento
- `alienantes`: Lista de pessoas vendendo o imóvel
- `adquirentes`: Lista de pessoas comprando o imóvel
- `imovel`: Dados do imóvel (matrícula, endereço, áreas, valores)
- `negocio`: Dados da transação (valores, pagamento, ITBI, corretagem)
- `certidoes`: Certidões consolidadas (CNDT, CND Municipal, VVR)

---

## 3. ESTRUTURA DE DADOS

### 3.1 Categoria: Alienantes (Vendedores)

**Campos mapeados por categoria:**

#### Identificação Pessoal
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| nome | RG | CERTIDAO_NASCIMENTO, COMPROMISSO_COMPRA_VENDA |
| cpf | RG, COMPROMISSO | CERTIDAO_CASAMENTO, CNDT |
| rg | RG | - |
| orgao_emissor_rg | RG | - |
| estado_emissor_rg | RG | - |
| data_emissao_rg | RG | - |
| data_nascimento | RG | CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO |

#### Naturalidade e Filiação
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| nacionalidade | COMPROMISSO | - |
| naturalidade | RG | CERTIDAO_NASCIMENTO |
| filiacao_pai | RG | CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO |
| filiacao_mae | RG | CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO |

#### Estado Civil e Profissão
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| estado_civil | CERTIDAO_CASAMENTO | COMPROMISSO, MATRICULA |
| regime_bens | CERTIDAO_CASAMENTO | COMPROMISSO |
| data_casamento | CERTIDAO_CASAMENTO | - |
| conjuge | CERTIDAO_CASAMENTO | COMPROMISSO |
| profissao | COMPROMISSO | MATRICULA |

#### Domicílio
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| domicilio.logradouro | COMPROMISSO | - |
| domicilio.numero | COMPROMISSO | - |
| domicilio.complemento | COMPROMISSO | - |
| domicilio.bairro | COMPROMISSO | - |
| domicilio.cidade | COMPROMISSO | - |
| domicilio.estado | COMPROMISSO | - |
| domicilio.cep | COMPROMISSO | - |

#### Certidões
| Campo | Fonte Principal |
|-------|----------------|
| cndt.numero | CNDT |
| cndt.data_expedicao | CNDT |
| cndt.hora_expedicao | CNDT |
| cndt.validade | CNDT |
| cndt.status | CNDT |

#### Transação
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| fracao_ideal | COMPROMISSO | MATRICULA |
| valor_alienacao | COMPROMISSO | - |

### 3.2 Categoria: Adquirentes (Compradores)

Mesma estrutura dos Alienantes, com campos idênticos.

### 3.3 Categoria: Imóvel

#### Matrícula
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| matricula.numero | MATRICULA_IMOVEL | COMPROMISSO |
| matricula.registro_imoveis | MATRICULA_IMOVEL | - |
| matricula.cidade | MATRICULA_IMOVEL | - |
| matricula.estado | MATRICULA_IMOVEL | - |

#### Descrição
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| descricao.tipo | MATRICULA_IMOVEL | COMPROMISSO |
| descricao.edificio | MATRICULA_IMOVEL | - |
| descricao.unidade | MATRICULA_IMOVEL | - |
| descricao.bloco | MATRICULA_IMOVEL | COMPROMISSO |
| descricao.andar | MATRICULA_IMOVEL | - |
| descricao.area_total | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.area_privativa | MATRICULA_IMOVEL | COMPROMISSO |
| descricao.area_comum | MATRICULA_IMOVEL | COMPROMISSO |
| descricao.fracao_ideal | MATRICULA_IMOVEL | COMPROMISSO |

#### Endereço
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| descricao.logradouro | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.numero | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.complemento | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.bairro | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.cidade | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.estado | MATRICULA_IMOVEL | COMPROMISSO, IPTU |
| descricao.cep | MATRICULA_IMOVEL | COMPROMISSO, IPTU |

#### Cadastro Municipal
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| cadastro.sql | MATRICULA_IMOVEL | IPTU, VVR, CND_MUNICIPAL, COMPROMISSO |

#### Valores Venais
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| valores_venais.iptu | IPTU | - |
| valores_venais.vvr | VVR | - |
| valores_venais.ano_exercicio | IPTU | - |

#### CND Municipal
| Campo | Fonte Principal |
|-------|----------------|
| certidao_negativa_municipal.numero | CND_MUNICIPAL |
| certidao_negativa_municipal.data_emissao | CND_MUNICIPAL |
| certidao_negativa_municipal.validade | CND_MUNICIPAL |
| certidao_negativa_municipal.status | CND_MUNICIPAL |

#### Proprietários e Ônus
| Campo | Fonte Principal |
|-------|----------------|
| proprietarios | MATRICULA_IMOVEL |
| onus | MATRICULA_IMOVEL |

### 3.4 Categoria: Negócio Jurídico

#### Valores
| Campo | Fonte Principal | Fontes Alternativas |
|-------|----------------|---------------------|
| valor.total | COMPROMISSO | - |
| valor.fracao_alienada | ITBI | COMPROMISSO |

#### Forma de Pagamento
| Campo | Fonte Principal |
|-------|----------------|
| forma_pagamento.tipo | COMPROMISSO |
| forma_pagamento.sinal | COMPROMISSO |
| forma_pagamento.saldo | COMPROMISSO |
| forma_pagamento.prazo | COMPROMISSO |

#### ITBI
| Campo | Fonte Principal |
|-------|----------------|
| itbi.numero_guia | ITBI |
| itbi.base_calculo | ITBI |
| itbi.valor | ITBI |
| itbi.data_vencimento | ITBI |
| itbi.data_pagamento | ITBI |

#### Corretagem
| Campo | Fonte Principal |
|-------|----------------|
| corretagem.valor | COMPROMISSO |
| corretagem.responsavel | COMPROMISSO |
| corretagem.intermediador | COMPROMISSO |

### 3.5 Categoria: Certidões Consolidadas

Seção especial que agrupa certidões importantes:

```json
{
  "certidoes": {
    "cndt_alienantes": [
      {
        "nome": "FULANO DE TAL",
        "cpf": "123.456.789-00",
        "cndt": {
          "numero": "...",
          "data_expedicao": "...",
          "validade": "...",
          "status": "NEGATIVA"
        }
      }
    ],
    "cnd_municipal": {
      "numero": "...",
      "data_emissao": "...",
      "validade": "...",
      "status": "NEGATIVA"
    },
    "vvr": {
      "valor": "R$ 450.000,00"
    }
  }
}
```

---

## 4. SISTEMA DE RESOLUCAO DE CONFLITOS

### 4.1 Problema

Múltiplos documentos podem conter o mesmo dado com valores diferentes. Exemplo:
- RG indica nome como "FULANO DE TAL SILVA"
- Compromisso indica nome como "FULANO DE TAL"

### 4.2 Solução: Prioridade por Tipo de Documento

O script usa uma tabela de prioridades onde documentos mais confiáveis sobrescrevem os menos confiáveis.

**Tabela de Prioridades (maior = mais confiável):**

| Tipo de Documento | Prioridade | Justificativa |
|-------------------|------------|---------------|
| RG | 100 | Documento oficial de identificação |
| CERTIDAO_NASCIMENTO | 95 | Documento oficial de estado civil |
| CERTIDAO_CASAMENTO | 90 | Documento oficial para dados matrimoniais |
| COMPROMISSO_COMPRA_VENDA | 85 | Documento assinado pelas partes |
| MATRICULA_IMOVEL | 80 | Documento oficial do registro de imóveis |
| CNDT | 75 | Certidão oficial |
| ITBI | 70 | Documento oficial de tributo |
| IPTU | 65 | Documento oficial municipal |
| VVR | 60 | Documento oficial de avaliação |
| CND_MUNICIPAL | 55 | Certidão oficial municipal |
| ESCRITURA | 50 | Documento final (não usado para extração) |
| COMPROVANTE_PAGAMENTO | 40 | Documento auxiliar |
| PROTOCOLO_ONR | 30 | Documento de controle |
| ASSINATURA_DIGITAL | 20 | Certificado de assinatura |
| OUTRO | 10 | Documento não classificado |

### 4.3 Exemplo de Resolução

**Cenário:**
1. RG indica: `nome = "FULANO DE TAL SILVA"` (prioridade 100)
2. Compromisso indica: `nome = "FULANO DE TAL"` (prioridade 85)

**Resultado:**
- Campo `nome` recebe `"FULANO DE TAL SILVA"` (RG vence)
- Campo `_fontes.nome` registra ambos: `["001_RG.json", "005_COMPROMISSO.json"]`

**Logs de Debug:**
```
Conflito resolvido para nome: substituindo 'FULANO DE TAL' por 'FULANO DE TAL SILVA' (maior prioridade)
```

### 4.4 Campos Null

Se um campo está null em uma fonte de maior prioridade, fontes de menor prioridade podem preenchê-lo.

**Exemplo:**
- RG não tem CPF (null)
- Compromisso tem CPF: "123.456.789-00"
- Resultado: CPF preenchido com valor do Compromisso

---

## 5. RASTREAMENTO DE FONTES

### 5.1 Objetivo

Saber exatamente de qual documento cada dado foi extraído para auditoria e resolução de inconsistências.

### 5.2 Campo `_fontes`

Cada objeto (pessoa, imóvel, negócio) possui um campo especial `_fontes` que mapeia campo → lista de arquivos fonte.

**Exemplo:**
```json
{
  "nome": "FULANO DE TAL SILVA",
  "cpf": "123.456.789-00",
  "rg": "12.345.678-9",
  "estado_civil": "CASADO",
  "_fontes": {
    "nome": ["001_RG.json", "005_COMPROMISSO.json"],
    "cpf": ["005_COMPROMISSO.json"],
    "rg": ["001_RG.json"],
    "estado_civil": ["003_CERTIDAO_CASAMENTO.json", "005_COMPROMISSO.json"]
  }
}
```

### 5.3 Uso do Rastreamento

**Auditoria:**
- Verificar origem de dados sensíveis
- Identificar documentos que contribuíram para cada campo

**Debug:**
- Entender por que um valor específico foi escolhido
- Rastrear conflitos resolvidos

**Validação:**
- Confirmar que dados críticos vieram de documentos oficiais
- Exemplo: CPF deve vir de RG ou Compromisso, não de fonte secundária

---

## 6. NORMALIZACAO DE DADOS

### 6.1 CPF

**Formato de saída:** `XXX.XXX.XXX-XX`

**Lógica:**
```python
def normalizar_cpf(cpf: str) -> str:
    # Remove caracteres não numéricos
    numeros = re.sub(r'\D', '', cpf)

    # Valida comprimento
    if len(numeros) != 11:
        return cpf  # Retorna original se inválido

    # Formata
    return f"{numeros[:3]}.{numeros[3:6]}.{numeros[6:9]}-{numeros[9:]}"
```

**Exemplos:**
- `"12345678900"` → `"123.456.789-00"`
- `"123.456.789-00"` → `"123.456.789-00"` (já formatado)
- `"123456789"` → `"123456789"` (inválido, mantém original)

### 6.2 Valores Monetários

**Formato de saída:** `R$ X.XXX.XXX,XX`

**Lógica:**
```python
def normalizar_valor(valor: Any) -> str:
    # Aceita int, float ou string
    # Converte para formato brasileiro com separador de milhares
    # Exemplo: 615000.00 → "R$ 615.000,00"
```

**Exemplos:**
- `615000` → `"R$ 615.000,00"`
- `"R$ 615.000,00"` → `"R$ 615.000,00"` (já formatado)
- `"615000.00"` → `"R$ 615.000,00"`

### 6.3 Áreas

**Formato de saída:** `XX,XX m2`

**Lógica:**
```python
def normalizar_area(area: Any) -> str:
    # Aceita int, float ou string
    # Converte para formato brasileiro com vírgula decimal
    # Adiciona sufixo "m2" se ausente
    # Exemplo: 85.5 → "85,50 m2"
```

**Exemplos:**
- `85.5` → `"85,50 m2"`
- `"85,50"` → `"85,50 m2"`
- `"85.50 m2"` → `"85,50 m2"`

---

## 7. IDENTIFICACAO DE PAPEIS

### 7.1 Como Identificar Alienantes e Adquirentes

O script identifica quem vende (alienante) e quem compra (adquirente) usando duas estratégias:

#### Estratégia 1: Compromisso de Compra e Venda (Principal)

O Compromisso define explicitamente:
- `dados_catalogados.vendedores[]` → Alienantes
- `dados_catalogados.compradores[]` → Adquirentes

**Exemplo:**
```json
{
  "tipo_documento": "COMPROMISSO_COMPRA_VENDA",
  "dados_catalogados": {
    "vendedores": [
      {"nome": "FULANO", "cpf": "123.456.789-00"}
    ],
    "compradores": [
      {"nome": "CICLANO", "cpf": "987.654.321-00"}
    ]
  }
}
```

#### Estratégia 2: Papel Inferido do Catálogo (Fallback)

Se uma pessoa não aparece no Compromisso, o script consulta o campo `papel_inferido` do catálogo (Fase 1):

```json
{
  "arquivos": [
    {
      "nome": "RG_Fulano.pdf",
      "tipo_documento": "RG",
      "pessoa_relacionada": "FULANO DE TAL",
      "papel_inferido": "vendedor",  // Baseado na subpasta "VENDEDORES/"
      "subpasta": "VENDEDORES"
    }
  ]
}
```

### 7.2 Consolidação de Pessoas

Pessoas podem aparecer em múltiplos documentos. O script consolida:

**Por CPF (Principal):**
- Se dois documentos têm mesmo CPF → mesma pessoa

**Por Nome (Fallback):**
- Se documentos sem CPF têm mesmo nome → mesma pessoa (posteriormente consolidada)

**Exemplo:**
1. RG indica: `nome="FULANO", cpf="123.456.789-00"`
2. Compromisso indica: `nome="FULANO DE TAL", cpf="123.456.789-00"`
3. CNDT indica: `nome="FULANO DE TAL SILVA", cpf="123.456.789-00"`

**Resultado:** Uma única pessoa com nome do RG (prioridade 100) e dados complementares dos outros documentos.

---

## 8. FUNCOES DE MAPEAMENTO POR TIPO

### 8.1 Estrutura

Cada tipo de documento possui uma função específica que sabe quais campos extrair:

```python
def map_rg_to_pessoa(dados: Dict, pessoa: PessoaNatural, source: str) -> None:
    """Mapeia campos de RG para pessoa."""
    dados_cat = dados.get('dados_catalogados', {})

    pessoa.set_field('nome', dados_cat.get('nome_completo'), source)
    pessoa.set_field('rg', dados_cat.get('numero_rg'), source)
    pessoa.set_field('cpf', normalizar_cpf(dados_cat.get('cpf')), source)
    # ... demais campos
```

### 8.2 Funções Implementadas

| Tipo de Documento | Função | Alvo |
|-------------------|--------|------|
| RG | `map_rg_to_pessoa()` | PessoaNatural |
| CERTIDAO_NASCIMENTO | `map_certidao_nascimento_to_pessoa()` | PessoaNatural |
| CERTIDAO_CASAMENTO | `map_certidao_casamento_to_pessoa()` | PessoaNatural |
| CNDT | `map_cndt_to_pessoa()` | PessoaNatural |
| COMPROMISSO_COMPRA_VENDA | `map_compromisso_to_partes()` | Pessoas, Imovel, Negocio |
| MATRICULA_IMOVEL | `map_matricula_to_imovel()` | Imovel |
| IPTU | `map_iptu_to_imovel()` | Imovel |
| VVR | `map_vvr_to_imovel()` | Imovel |
| CND_MUNICIPAL | `map_cnd_municipal_to_imovel()` | Imovel |
| ITBI | `map_itbi_to_negocio()` | Negocio |

### 8.3 Extensibilidade

Para adicionar suporte a um novo tipo de documento:

1. Criar função `map_{tipo}_to_{alvo}()`
2. Adicionar chamada no loop principal
3. Definir prioridade em `SOURCE_PRIORITY`
4. Testar com documento real

---

## 9. METRICAS E VALIDACAO

### 9.1 Campos Monitorados

O script calcula automaticamente:

**Metadata:**
- `documentos_processados`: Total de JSONs lidos
- `campos_preenchidos`: Total de campos com valor
- `campos_faltantes`: Lista de campos sem valor

**Exemplo de saída:**
```json
{
  "metadata": {
    "caso_id": "FC_515_124_p280509",
    "documentos_processados": 37,
    "campos_preenchidos": 85,
    "campos_faltantes": [
      "alienante[0].naturalidade",
      "alienante[1].data_nascimento",
      "imovel.descricao.andar",
      "negocio.corretagem.valor"
    ]
  }
}
```

### 9.2 Códigos de Saída

O script retorna códigos de saída diferentes:

| Código | Significado |
|--------|-------------|
| 0 | Sucesso (≤20 campos faltantes) |
| 1 | Erro fatal (arquivo não encontrado, exceção) |
| 2 | Alerta (>20 campos faltantes) |

### 9.3 Validação de Qualidade

**Campos críticos que devem estar preenchidos:**

**Alienantes:**
- nome, cpf, rg, estado_civil, profissao

**Adquirentes:**
- nome, cpf, rg, estado_civil, profissao

**Imóvel:**
- matricula.numero, cadastro.sql, descricao.area_total, descricao.logradouro

**Negócio:**
- valor.total, itbi.numero_guia, itbi.valor

---

## 10. LOGS E DEBUGGING

### 10.1 Níveis de Log

**Modo Normal (INFO):**
```
2026-01-28 10:30:00 - INFO - Carregando documentos extraidos de FC_515_124_p280509...
2026-01-28 10:30:01 - INFO - Total de documentos carregados: 37
2026-01-28 10:30:02 - INFO - Compromisso processado: 2 vendedores, 1 compradores
```

**Modo Verbose (DEBUG):**
```
2026-01-28 10:30:02 - DEBUG - Processando RG: 001_RG.json
2026-01-28 10:30:02 - DEBUG - Conflito resolvido para nome: substituindo 'FULANO' por 'FULANO DE TAL SILVA'
2026-01-28 10:30:02 - DEBUG - Processando CERTIDAO_CASAMENTO: 003_CERTIDAO_CASAMENTO.json
```

### 10.2 Avisos Comuns

**Documento com erro:**
```
WARNING - Documento com erro ignorado: 038_ESCRITURA.json
```

**RG sem CPF:**
```
WARNING - RG sem nome ou CPF ignorado: 015_RG.json
```

**Pessoa não encontrada:**
```
DEBUG - Pessoa 'FULANO DE TAL' nao encontrada no mapeamento, pulando documento
```

---

## 11. PROXIMOS PASSOS

### 11.1 Possíveis Extensões

1. **Validação de Dados Obrigatórios**
   - Script que verifica se todos os campos críticos estão preenchidos
   - Alerta sobre campos obrigatórios faltantes

2. **Geração de Minuta**
   - Template de minuta em DOCX/PDF
   - Substituição automática de variáveis
   - Exportação para Google Docs

3. **Interface de Revisão**
   - Web app para revisar campos mapeados
   - Correção manual de campos com conflito
   - Validação antes de gerar minuta final

4. **Integração com Sistema de Minutas**
   - API para enviar dados mapeados
   - Sincronização com banco de dados
   - Workflow de aprovação

### 11.2 Melhorias de Qualidade

1. **Validação de CPF**
   - Verificar dígitos verificadores
   - Alertar sobre CPFs inválidos

2. **Validação de Datas**
   - Verificar consistência (nascimento < casamento)
   - Normalizar formatos de data

3. **Detecção de Duplicatas**
   - Identificar pessoas repetidas com nomes similares
   - Sugerir merge de entradas

4. **Score de Confiança**
   - Calcular score baseado em número de fontes
   - Priorizar revisão de campos com baixo score

---

## 12. REFERENCIAS

### 12.1 Documentos Relacionados

| Documento | Descrição |
|-----------|-----------|
| `01_plano_catalogacao_documentos.md` | Visão geral do pipeline completo |
| `04_fase3_extracao_estruturada.md` | Extração de dados (fase anterior) |
| `Guia-de-campos-e-variaveis/*.md` | Referência completa dos 180+ campos |

### 12.2 Estrutura de Arquivos

```
Minutas-Cartorio-Documentos/
├── execution/
│   └── map_to_fields.py           # Script principal da Fase 4
├── .tmp/
│   ├── contextual/
│   │   └── FC_515_124_p280509/    # Entrada: JSONs da Fase 3
│   │       ├── 001_IPTU.json
│   │       ├── 002_RG.json
│   │       └── ...
│   ├── catalogos/
│   │   └── FC_515_124_p280509.json  # Catálogo da Fase 1
│   └── mapped/
│       └── FC_515_124_p280509.json  # Saída: Dados consolidados
```

### 12.3 Guias de Campos

Os arquivos em `Guia-de-campos-e-variaveis/` definem os 180+ campos da minuta:

- `campos-pessoa-natural.md` (39 campos)
- `campos-pessoa-juridica.md` (76 campos)
- `campos-dados-imovel.md` (33+ campos)
- `campos-negocio-juridico.md` (33+ campos)

---

## 13. TROUBLESHOOTING

### 13.1 Erro: "Diretorio de dados contextuais nao encontrado"

**Causa:** Fase 3 não foi executada para o caso.

**Solução:**
```bash
python execution/extract_with_gemini.py FC_515_124_p280509
```

### 13.2 Erro: "Catalogo nao encontrado"

**Causa:** Fase 1 não foi executada para o caso.

**Solução:**
```bash
python execution/inventory_files.py FC_515_124_p280509
python execution/classify_with_gemini.py FC_515_124_p280509
python execution/generate_catalog.py FC_515_124_p280509
```

### 13.3 Muitos campos faltantes

**Causa:** Documentos essenciais não foram extraídos ou têm dados null.

**Diagnóstico:**
```bash
python execution/map_to_fields.py FC_515_124_p280509 --output-format summary
```

**Solução:**
- Revisar lista de campos faltantes
- Verificar se documentos correspondentes existem
- Reprocessar documentos com erro na Fase 3

### 13.4 Pessoas não identificadas

**Causa:** CPF não encontrado em múltiplos documentos da mesma pessoa.

**Solução:**
- Verificar se Compromisso foi processado (define papéis)
- Verificar consistência de nomes entre documentos
- Adicionar normalização de nomes similar (ex: "JOSE" = "JOSÉ")

---

## 14. ADENDO: DIRETIVAS DE PRODUCAO (FUTURO)

> **NOTA PARA AGENTES FUTUROS**
>
> Esta diretiva foi escrita durante o DESENVOLVIMENTO da Fase 4, contendo
> detalhes técnicos, decisões de design e histórico de implementação.
>
> **Quando o sistema estiver em produção:**
> - Criar diretiva simplificada focada em OPERAÇÃO
> - Remover detalhes de desenvolvimento
> - Manter apenas instruções de uso e troubleshooting comum
>
> Esta diretiva deve ser mantida como REFERÊNCIA TÉCNICA para evolução futura.

---

*Este documento define a Fase 4 do pipeline de processamento de documentos.*
*Última atualização: 2026-01-28*
