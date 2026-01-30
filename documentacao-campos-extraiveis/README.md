# Documentacao de Campos Extraiveis

Estrutura organizada de documentacao sobre campos extraiveis de documentos cartoriais.

## Estrutura

### `campos-completos/`
TODOS os campos possiveis de extrair de cada tipo de documento, conforme schemas JSON.

**Use quando:**
- Voce quer entender a estrutura completa de um documento
- Precisa saber quais campos tecnicos existem no schema
- Quer ver exemplos reais de extracao com todos os campos

### `campos-uteis/`
APENAS os campos uteis mapeados para o projeto de minutas cartoriais.

**Use quando:**
- Voce quer saber quais campos sao realmente usados
- Precisa entender o mapeamento para minutas
- Quer focar apenas nos dados relevantes para escrituras

## Comparacao

| Aspecto | Campos Completos | Campos Uteis |
|---------|-----------------|--------------|
| Quantidade | ~300+ campos (incluindo nested) | 205 campos |
| Fonte | Schemas JSON tecnicos | Mapeamento de negocio |
| Publico | Desenvolvedores/tecnicos | Usuarios de minutas |
| Estrutura | Hierarquica (nested/arrays) | Plana (4 categorias) |
| Exemplos | JSON completo | JSON simplificado |

## Tipos de Documentos (26 total)

### Grupo 1 - Documentos Pessoais (7)
| Documento | Campos Uteis | Complexidade |
|-----------|-------------|--------------|
| RG | 10 | Baixa |
| CNH | 10 | Baixa |
| CPF | 3 | Baixa |
| CERTIDAO_NASCIMENTO | 11 | Media |
| CERTIDAO_CASAMENTO | 13 | Media |
| CERTIDAO_OBITO | 7 | Media |
| COMPROVANTE_RESIDENCIA | 9 | Baixa |

### Grupo 2 - Certidoes (7)
| Documento | Campos Uteis | Complexidade |
|-----------|-------------|--------------|
| CNDT | 10 | Baixa |
| CND_FEDERAL | 14 | Baixa |
| CND_ESTADUAL | 4 | Baixa |
| CND_MUNICIPAL | 13 | Media |
| CND_IMOVEL | 11 | Media |
| CND_CONDOMINIO | 2 | Baixa |
| CONTRATO_SOCIAL | 32 | Alta |

### Grupo 3 - Documentos do Imovel (6)
| Documento | Campos Uteis | Complexidade |
|-----------|-------------|--------------|
| MATRICULA_IMOVEL | 43 | Muito Alta |
| ITBI | 22 | Alta |
| VVR | 6 | Baixa |
| IPTU | 13 | Media |
| DADOS_CADASTRAIS | 13 | Media |
| ESCRITURA | 41 | Muito Alta |

### Grupo 4 - Documentos do Negocio (3)
| Documento | Campos Uteis | Complexidade |
|-----------|-------------|--------------|
| COMPROMISSO_COMPRA_VENDA | 53 | Muito Alta |
| PROCURACAO | 35 | Alta |
| COMPROVANTE_PAGAMENTO | 14 | Media |

### Grupo 5 - Documentos Administrativos (3)
| Documento | Campos Uteis | Complexidade |
|-----------|-------------|--------------|
| PROTOCOLO_ONR | 2 | Baixa |
| ASSINATURA_DIGITAL | 1 | Baixa |
| OUTRO | 0 | N/A |

## Categorias de Campos Uteis

| Categoria | Total de Campos | Descricao |
|-----------|----------------|-----------|
| pessoa_natural | 47 | Dados de pessoas fisicas |
| pessoa_juridica | 76 | Dados de empresas |
| imovel | 44 | Dados de imoveis |
| negocio | 37 | Dados da transacao |

## Correlacao Entre Documentos

Campos-chave que aparecem em multiplos documentos:

| Campo | Documentos | Uso |
|-------|-----------|-----|
| nome | 20 | Identificar pessoa |
| cpf | 17 | Identificar pessoa fisica |
| pj_denominacao | 11 | Identificar empresa |
| pj_cnpj | 11 | Identificar empresa |
| imovel_logradouro | 9 | Identificar imovel |
| imovel_numero | 9 | Identificar imovel |
| matricula_numero | 9 | Identificar matricula |
| imovel_bairro | 8 | Localizacao imovel |
| imovel_cidade | 8 | Localizacao imovel |
| imovel_estado | 8 | Localizacao imovel |
| rg | 8 | Identificar pessoa |
| imovel_sql | 7 | Cadastro municipal |
| data_nascimento | 7 | Identificar pessoa |

## Referencias Tecnicas

- **Schemas JSON**: `execution/schemas/*.json` (15 schemas)
- **Prompts de Extracao**: `execution/prompts/*.txt`
- **Mapeamento**: `execution/mapeamento_documento_campos.json`
- **Guias de Campos**: `Guia-de-campos-e-variaveis/campos-*.md` (4 guias)
- **Documento Mestre**: `DOCUMENTOS_E_CAMPOS_REFERENCIA.md`
- **Exemplos Reais**: `.tmp/contextual/*/` (documentos extraidos)

## Estatisticas

- **Total de tipos de documentos**: 26
- **Total de campos uteis**: 205
- **Schemas disponiveis**: 15
- **Campos com cobertura**: 156
- **Campos sem cobertura**: 35 (ainda nao mapeados para documentos)

---

**Ultima atualizacao**: 2026-01-30
**Versao do mapeamento**: 1.1
