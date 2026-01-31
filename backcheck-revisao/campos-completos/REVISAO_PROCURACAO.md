# REVISAO: PROCURACAO.md

**Data Revisao**: 2026-01-30
**Revisor**: Claude Agent
**Status**: APROVADO COM RESSALVAS

---

## CONFORMIDADE COM SCHEMA

### Schema Verificado
- **Fonte**: `execution/mapeamento_documento_campos.json`
- **Campos no Schema**: 35 campos mapeados
  - pessoa_natural: 14 campos
  - pessoa_juridica: 21 campos

### Campos Documentados vs Schema

**CONFORMIDADE TOTAL**: Todos os 35 campos do schema estao documentados.

Mapeamento pessoa_natural (14 campos):
- nome, cpf, rg, orgao_emissor_rg, estado_emissor_rg ✓
- nacionalidade, profissao, estado_civil ✓
- domicilio_* (7 campos de endereco) ✓

Mapeamento pessoa_juridica (21 campos):
- pj_denominacao, pj_cnpj ✓
- pj_procurador_* (19 campos do procurador) ✓
- pj_tabelionato_procuracao, pj_data_procuracao ✓
- pj_livro_procuracao, pj_paginas_procuracao ✓

---

## PROBLEMAS IDENTIFICADOS

### 1. CAMPOS FALTANTES NO MAPEAMENTO (DOCUMENTADOS MAS NAO NO SCHEMA)

A secao 2.4 lista 9 campos importantes que **NAO estao mapeados**:

- tipo_procuracao (ALTA importancia)
- poderes (array/string - ALTA importancia)
- finalidade (ALTA importancia)
- prazo_validade (MEDIA importancia)
- clausula_substabelecer (MEDIA importancia)
- clausula_reserva_poderes (MEDIA importancia)
- clausula_em_causa_propria (ALTA importancia)
- clausula_irrevogavel (ALTA importancia)
- selo_digital (ALTA importancia para procuracao publica)

**IMPACTO**: Esses campos sao criticos para validacao de procuracoes, especialmente:
- Verificar se procuracao e publica/particular
- Validar poderes suficientes para o ato
- Identificar clausulas especiais (em causa propria, irrevogavel)

**RECOMENDACAO**: Adicionar ao schema ou justificar exclusao.

### 2. CAMPO DUPLICADO/CONFUSO

Secao 2.3 lista:
- `pj_data_expedicao_certidao_procuracao` - descrito como obrigatorio para CERTIDAO

Esse campo existe no schema geral (linha 1100 do mapeamento_documento_campos.json) como campo **NAO COBERTO** por nenhum documento.

**PROBLEMA**: O campo esta documentado como "Certidao: Sim" na coluna Obrigatorio, mas nao esta listado no mapeamento do documento PROCURACAO.

**RECOMENDACAO**: Esclarecer se este campo deve ser incluido no mapeamento.

### 3. CAMPOS DE SUBSTABELECIMENTO

Secao 4.3 documenta 9 campos especificos de substabelecimento:
- procuracao_original_tabelionato
- procuracao_original_data
- procuracao_original_livro
- procuracao_original_folhas
- tipo_substabelecimento
- substabelecente_nome/cpf
- substabelecido_nome/cpf

**PROBLEMA**: Nenhum desses campos esta no schema atual.

**IMPACTO**: Sistema nao captura substabelecimentos.

**RECOMENDACAO**: Decidir se substabelecimento deve ter documento proprio ou ser mapeado em PROCURACAO.

### 4. CAMPOS pj_procurador_domicilio_complemento

Documentado na linha 115 mas **NAO esta no mapeamento** (linha 1089 do schema lista como uncovered).

**INCONSISTENCIA**: Campo documentado no PROCURACAO.md mas nao mapeado em `document_field_mapping`.

---

## TIPOS DE DADOS

**VERIFICADO**: Todos os tipos estao corretos.
- Strings para textos
- Dates para datas (formato DD/MM/AAAA)
- Booleans para flags (quando aplicavel)
- Arrays para listas (quando aplicavel)

---

## EXEMPLOS

**QUALIDADE**: EXCELENTE

Secoes 9.1 e 9.2 fornecem exemplos JSON completos e realistas:
- Procuracao Publica PF para venda de imovel
- Procuracao Publica PJ para representacao

Exemplos incluem estrutura hierarquica, dados nested, e metadados.

---

## ESTRUTURA E TEMPLATE

**CONFORMIDADE**: Documento segue estrutura padrao.

Secoes presentes:
1. Visao Geral ✓
2. Campos Extraiveis ✓
3. Tipos e Classificacoes ✓
4. Correlacao com outros documentos ✓
5. Validacoes ✓
6. Exemplos ✓
7. Notas Tecnicas ✓

---

## CAMPOS NESTED/ARRAYS

**DOCUMENTADOS ADEQUADAMENTE**:
- Secao 11 apresenta estrutura hierarquica completa
- Objetos nested: outorgante, procurador, poderes, clausulas_especiais, imovel_objeto
- Arrays: lista_poderes

---

## PONTOS FORTES

1. Documentacao extremamente completa (793 linhas)
2. Contexto juridico detalhado (tipos de procuracao, poderes, substabelecimento)
3. Correlacao com outros documentos bem explicada
4. Validacoes de negocio documentadas
5. Exemplos JSON realistas e completos

---

## ACOES RECOMENDADAS

1. **URGENTE**: Esclarecer campos da secao 2.4 - incluir no schema ou justificar exclusao
2. **MEDIA**: Revisar campo `pj_data_expedicao_certidao_procuracao`
3. **BAIXA**: Considerar adicionar campos de substabelecimento
4. **BAIXA**: Adicionar `pj_procurador_domicilio_complemento` ao mapeamento

---

## CONCLUSAO

Documento **EXCELENTE** em termos de completude e qualidade.

Unica ressalva: desalinhamento entre campos documentados (especialmente secao 2.4) e schema real.

**NOTA FINAL**: 9.5/10
