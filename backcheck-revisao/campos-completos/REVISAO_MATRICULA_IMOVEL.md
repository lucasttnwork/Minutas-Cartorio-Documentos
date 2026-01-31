# REVISAO: MATRICULA_IMOVEL.md

**Data da Revisao**: 2026-01-30
**Revisor**: Claude Code
**Status**: PROBLEMAS IDENTIFICADOS

---

## PROBLEMAS ENCONTRADOS

### 1. DIVERGENCIA ENTRE SCHEMA E DOCUMENTACAO

**Severidade**: ALTA

**Campo `areas.privativa` vs `areas.util`**
- Schema: Define tanto `privativa` quanto `util` como campos separados (linhas 107-108)
- Documentacao: Linha 136 afirma "Em condominios, a area util pode ser igual a privativa"
- Exemplo Real: Usa `area_util_m2` (linha 31) mas nao existe `area_privativa_m2`
- PROBLEMA: Confusao entre nomenclaturas. Definir qual e o termo oficial.

**Campo `areas.total`**
- Schema: Marca como obrigatorio (linha 110)
- Documentacao: Linha 131 marca como obrigatorio
- Exemplo Real: Usa `area_total_m2` (linha 33)
- OK mas nomenclatura difere do schema (`total` vs `area_total_m2`)

### 2. CAMPOS PRESENTES NO EXEMPLO MAS NAO NO SCHEMA

**Severidade**: ALTA

Os seguintes campos aparecem no exemplo real mas NAO estao no schema:

- `data_abertura_matricula` (linha 15 do exemplo)
- `cadeia_dominial` (array completo, linha 36-109 do exemplo)
- `matriculas_relacionadas` (linha 201)
- `cessoes_direitos` (linha 202-216)
- `contexto_pagina` (linha 229-235)
- `data_ultima_atualizacao` (linha 243)

ACAO: Adicionar esses campos ao schema ou remover do exemplo.

### 3. CAMPOS DO SCHEMA NAO DOCUMENTADOS

**Severidade**: MEDIA

Todos os campos do schema estao documentados. OK.

### 4. ESTRUTURA DE DADOS INCONSISTENTE

**Severidade**: ALTA

**Proprietarios:**
- Schema: Define `proprietarios[].conjuge` como object (linha 154)
- Documentacao: Define estrutura do conjuge (linhas 179-186)
- Exemplo Real: Usa estrutura diferente dentro de `cadeia_dominial` (linha 51-56)
- PROBLEMA: Conjuge pode estar dentro ou fora da estrutura de proprietario.

**Registros:**
- Schema: `registros[].tipo_ato` (linha 168)
- Exemplo Real: Usa `tipo` com valores diferentes (ex: "CONSTITUICAO_HIPOTECA" vs "TRANSMISSAO_VENDA")
- Documentacao: Lista valores corretos (linhas 202-212)
- OK mas verificar consistencia nos prompts.

### 5. NOMENCLATURA SQL

**Severidade**: BAIXA

- Documentacao: Linha 67 define "SQL - Setor Quadra Lote"
- Schema: Linha 95 define "SQL - Setor Quadra Lote"
- Exemplo Real: Usa apenas `sql` (linha 30)
- NOTA: SQL e sigla conhecida no cartorio, mas pode gerar confusao com linguagem SQL.

### 6. CAMPOS COMPUTADOS NAO IMPLEMENTADOS

**Severidade**: MEDIA

Documentacao menciona campos computados (linhas 570-574):
- `situacao_imovel`: Presente no schema mas nao no exemplo real
- `proprietario_fracao_ideal`: Exemplo usa estrutura nested diferente
- `certidao_valida`: Nao implementado

### 7. TIPOS DE DATA INCONSISTENTES

**Severidade**: BAIXA

- Schema: Define tipo `date` (linha 169, 189, 206, 207, 232, 233)
- Exemplo Real: Usa strings no formato "DD/MM/YYYY"
- Documentacao: Usa formato "DD/MM/YYYY" nos exemplos
- NOTA: Definir se tipo e string ou Date object.

---

## CAMPOS EXTRAS NO EXEMPLO NAO MENCIONADOS NA DOC

1. `arquivo_origem` (linha 3)
2. `arquivo_ocr` (linha 4)
3. `data_processamento` (linha 5)
4. `modelo` (linha 6)
5. `reescrita_interpretada` (linha 7)
6. `explicacao_contextual` (linha 8)
7. `metadados` (linha 245-249)
8. `status` (linha 250)
9. `erro` (linha 251)
10. `id` (linha 252)
11. `nome_arquivo` (linha 253)
12. `pessoa_relacionada` (linha 254)
13. `papel_inferido` (linha 255)
14. `worker_id` (linha 256)

Esses campos sao metadados do pipeline e nao do documento em si.
Considerar separar em dois schemas: `matricula_imovel_dados.json` e `matricula_imovel_metadados.json`

---

## ACOES RECOMENDADAS

1. URGENTE: Alinhar schema com exemplo real (adicionar campos faltantes)
2. URGENTE: Resolver divergencia `privativa` vs `util` nas areas
3. ALTA: Documentar campos de cadeia dominial completa
4. MEDIA: Padronizar tipos de data (string vs Date)
5. BAIXA: Adicionar nota sobre sigla SQL para evitar confusao

---

## SCORE DE QUALIDADE

- Completude da Documentacao: 85%
- Alinhamento Schema-Docs: 70%
- Alinhamento Schema-Exemplo: 60%
- Clareza dos Exemplos: 90%

**SCORE GERAL**: 76%
