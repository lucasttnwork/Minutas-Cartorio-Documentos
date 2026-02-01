# REVISAO: CERTIDAO_CASAMENTO.md

**Data da Revisao**: 2026-01-30
**Revisor**: Claude Agent
**Modo**: SOMENTE LEITURA

---

## STATUS GERAL

**APROVADO** - Documentacao de alta qualidade e completude.

---

## VERIFICACOES REALIZADAS

### 1. Cobertura do Schema

**COMPLETO** - Todos os 22 campos do schema estao documentados.

Campos do schema vs. documentacao:
- [x] matricula
- [x] livro
- [x] folha
- [x] termo
- [x] nome_conjuge_1
- [x] nome_conjuge_2
- [x] cpf_conjuge_1
- [x] cpf_conjuge_2
- [x] data_nascimento_conjuge_1
- [x] data_nascimento_conjuge_2
- [x] naturalidade_conjuge_1
- [x] naturalidade_conjuge_2
- [x] pai_conjuge_1
- [x] mae_conjuge_1
- [x] pai_conjuge_2
- [x] mae_conjuge_2
- [x] data_casamento
- [x] regime_bens
- [x] pacto_antenupcial
- [x] nome_pos_casamento_conjuge_1
- [x] nome_pos_casamento_conjuge_2
- [x] averbacoes (array)
- [x] cartorio
- [x] selo_digital

### 2. Consistencia de Tipos

**CORRETO** - Todos os tipos de dados estao corretamente especificados.

### 3. Exemplos Realistas

**EXCELENTE** - Tres exemplos reais completos extraidos de certidoes processadas:
- Exemplo 1: Casamento vigente com conversao de uniao estavel
- Exemplo 2: Casamento com averbacoes de separacao e divorcio
- Exemplo 3: Casamento antigo com alteracao de nome

### 4. Estrutura Nested/Arrays

**COMPLETO** - Estruturas complexas devidamente documentadas:
- averbacoes[] com 7 subcampos
- conversao_uniao_estavel com 3 subcampos
- pacto_antenupcial com 5 subcampos
- conjuge1/conjuge2 com estrutura de filiacao

### 5. Campos Adicionais na Extracao Real

**IDENTIFICADOS** - A extracao real possui campos que NAO estao no schema:

Campos presentes na extracao mas ausentes no schema:
- `tipo_certidao` (presente em todas as extracoes)
- `local_casamento` (presente em todas as extracoes)
- `conjuge1.nome_completo` (estrutura aninhada no JSON real vs. campo flat no schema)
- `conjuge1.nome_solteiro` (nao documentado no schema)
- `conjuge1.nome_casado` (nao documentado no schema)
- `conjuge1.houve_alteracao_nome` (nao documentado no schema)
- `conjuge1.filiacao.pai` (estrutura aninhada vs. campo flat no schema)
- `conjuge1.filiacao.mae` (estrutura aninhada vs. campo flat no schema)
- `conversao_uniao_estavel` (objeto completo nao documentado no schema)
- `situacao_atual_vinculo` (nao documentado no schema)
- `data_emissao_certidao` (nao documentado no schema)
- `responsaveis.oficial` (nao documentado no schema)
- `responsaveis.escrevente` (nao documentado no schema)

---

## PROBLEMAS IDENTIFICADOS

### PROBLEMA 1: Discrepancia entre Schema e Extracao Real

**Severidade**: MEDIA

O schema JSON define campos em estrutura flat (ex: `nome_conjuge_1`, `pai_conjuge_1`), mas a extracao real utiliza estrutura aninhada:

```json
"conjuge1": {
  "nome_completo": "...",
  "nome_solteiro": "...",
  "nome_casado": "...",
  "houve_alteracao_nome": false,
  "cpf": "...",
  "filiacao": {
    "pai": "...",
    "mae": "..."
  }
}
```

**Impacto**: O schema nao reflete a estrutura real dos dados extraidos.

**Recomendacao**: Atualizar o schema para refletir a estrutura aninhada real ou ajustar a extracao para seguir o schema flat.

### PROBLEMA 2: Campos Importantes Ausentes no Schema

**Severidade**: ALTA

Campos criticos para o negocio estao sendo extraidos mas NAO estao documentados no schema:

- `situacao_atual_vinculo` (CASADOS/DIVORCIADOS/SEPARADOS/VIUVO)
- `data_emissao_certidao`
- `tipo_certidao`
- `local_casamento`
- `responsaveis` (oficial e escrevente)
- `conversao_uniao_estavel` (objeto completo)

**Impacto**: O schema esta incompleto e nao serve como contrato de dados confiavel.

**Recomendacao**: Adicionar estes campos ao schema ou remover da extracao.

### PROBLEMA 3: Campo `averbacoes` Sub-estrutura Indefinida

**Severidade**: BAIXA

O schema define `averbacoes` como array, mas nao especifica a estrutura dos objetos dentro do array. A documentacao .md sim (secao 2.3.1), mas o schema JSON nao.

**Recomendacao**: Adicionar definicao de subcampos de `averbacoes[]` no schema JSON.

---

## PONTOS POSITIVOS

1. Documentacao extremamente completa e bem estruturada
2. Secoes de correlacao com outros documentos (5.1-5.4)
3. Validacoes e conferencias bem definidas (6.1-6.3)
4. Notas tecnicas com campos computados e inferidos
5. Contexto historico de regimes de bens
6. Exemplos reais com fontes rastreables
7. Mapeamento claro para modelo de dados de minutas

---

## RECOMENDACOES

1. **URGENTE**: Alinhar schema JSON com estrutura real de extracao
2. **IMPORTANTE**: Adicionar campos ausentes ao schema ou remover da extracao
3. **SUGERIDO**: Definir sub-estrutura de arrays no schema JSON
4. Manter consistencia entre nomenclatura do schema e extracao (flat vs. nested)

---

## CONCLUSAO

A documentacao CERTIDAO_CASAMENTO.md e de qualidade excepcional, com cobertura completa, exemplos reais e contexto de negocio. O principal problema e a **discrepancia entre o schema declarado e a estrutura real extraida**, que pode causar inconsistencias no pipeline de dados.

Recomenda-se revisar o schema JSON para alinhar com a realidade da extracao.
