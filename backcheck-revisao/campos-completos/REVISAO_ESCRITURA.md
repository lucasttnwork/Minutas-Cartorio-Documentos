# REVISAO: ESCRITURA.md

**Data**: 2026-01-30
**Revisor**: Claude Agent
**Arquivos Analisados**:
- `documentacao-campos-extraiveis/campos-completos/ESCRITURA.md`
- `execution/schemas/escritura.json`
- `.tmp/contextual/FC_515_124_p280509/017_ESCRITURA.json`
- `.tmp/contextual/GS_357_11_p281773/014_ESCRITURA.json`

---

## STATUS GERAL: APROVADO COM OBSERVACOES

A documentacao esta **COMPLETA** e **BEM ESTRUTURADA**. Todos os campos do schema estao documentados com exemplos realistas. Estrutura segue o template estabelecido.

---

## PROBLEMAS IDENTIFICADOS

### 1. DISCREPANCIA: Campo "tabeliao" (BAIXA SEVERIDADE)

**Problema**: Schema nao define campo "tabeliao", mas extrações reais possuem.

**No schema** (linha 18-26):
```json
{
  "nome": "tabelionato",
  "tipo": "string",
  "obrigatorio": false
}
```

**Nas extrações**:
- FC_515_124: `"tabeliao": "MARIA HELENA DA SILVA"`
- GS_357_11: `"tabeliao": "JOÃO MATEUS BLANCO DOS ANJOS"`

**Na documentacao** (linha 56):
Apenas campo `tabelionato` esta documentado, sem mencao a campo `tabeliao` separado.

**Recomendacao**: Adicionar campo `tabeliao` (nome do tabeliao) como campo opcional separado de `tabelionato` (nome da serventia).

---

### 2. DISCREPANCIA: Estrutura "partes" nao esta no schema (MEDIA SEVERIDADE)

**Problema**: Extrações reais usam estrutura `partes` que nao existe no schema.

**No schema**: Campos `outorgantes` e `outorgados` estao na raiz.

**Nas extrações**: Campos estao dentro de `partes`:
```json
"partes": {
  "outorgantes_vendedores": [...],
  "outorgados_compradores": [...],
  "procuradores": [],
  "intervenientes": [...]
}
```

**Na documentacao** (linha 47-48): Documentacao segue o schema (outorgantes/outorgados na raiz).

**Recomendacao**:
- OPCAO A: Atualizar schema para incluir objeto "partes"
- OPCAO B: Corrigir extrações para seguir schema (sem wrapper "partes")

---

### 3. CAMPO ADICIONAL: "procuradores" (BAIXA SEVERIDADE)

**Problema**: Extrações possuem array `procuradores` que nao existe no schema.

**Nas extrações**:
```json
"procuradores": []
```

**No schema**: Nao existe campo `procuradores`.

**Na documentacao**: Nao menciona campo `procuradores`.

**Recomendacao**: Adicionar campo `procuradores` (array) ao schema e documentacao.

---

### 4. CAMPO ADICIONAL: "intervenientes" DOCUMENTADO MAS NAO NO SCHEMA (MEDIA SEVERIDADE)

**Problema**: Campo `intervenientes` esta documentado (linha 221-230) mas NAO existe no schema.

**Na documentacao** (linha 221-230):
```markdown
#### 2.4.5 intervenientes (array)
```

**No schema**: Nao existe.

**Nas extrações**: Campo presente e populado.

**Recomendacao**: Adicionar campo `intervenientes` ao schema.

---

### 5. DISCREPANCIA: Estrutura de "valores" (BAIXA SEVERIDADE)

**Problema**: Extrações usam objeto `valores` que agrupa campos de valor, mas schema define apenas `valor_transacao` na raiz.

**No schema** (linha 116-124):
```json
{
  "nome": "valor_transacao",
  "tipo": "number"
}
```

**Nas extrações**:
```json
"valores": {
  "valor_transacao": 615000.0,
  "valor_declarado_itbi": 615000.0,
  "valor_venal_referencia": 301147.0,
  "valor_recursos_proprios": 615000.0
}
```

**Na documentacao**: Segue schema (campo na raiz).

**Recomendacao**: Documentar que extrações reais agrupam em `valores`, ou atualizar schema.

---

### 6. CAMPOS ADICIONAIS NAS EXTRACOES (INFORMATIVA)

Campos presentes nas extrações que NAO existem no schema:

- `valores.valor_declarado_itbi`
- `valores.valor_venal_referencia`
- `valores.valor_recursos_proprios`
- `valores.valor_fgts`
- `valores.moeda`
- `imovel.contribuinte` (duplicata de sql_inscricao_municipal)
- `imovel.area_terreno_m2`
- `partes.procuradores`
- `onus_gravames` (mencionado na doc linha 324, mas nao no schema)
- `observacoes`

**Impacto**: Baixo. Campos extras sao capturados mas nao validados.

---

## VALIDACOES POSITIVAS

### CAMPOS DO SCHEMA 100% DOCUMENTADOS
Todos os 15 campos do schema estao documentados com descricao, tipo, exemplo.

### TIPOS DE DADOS CORRETOS
Todos os tipos (string, number, date, array, object) conferem entre schema e documentacao.

### EXEMPLOS REALISTAS
Exemplos na documentacao sao identicos ou muito proximos aos dados reais extraidos.

### ESTRUTURA SEGUE TEMPLATE
Secoes 1-9 completas: Visao Geral, Campos, Mapeamento, Exemplos, Correlacao, Validacoes, Notas Tecnicas, Referencias, Historico.

### CAMPOS NESTED/ARRAYS BEM DOCUMENTADOS
Secoes 2.3 e 2.4 documentam objetos e arrays com todas as propriedades internas.

---

## RECOMENDACOES

1. **ALTA PRIORIDADE**: Alinhar schema com extrações reais (adicionar campos faltantes: tabeliao, intervenientes, procuradores, estrutura partes/valores).

2. **MEDIA PRIORIDADE**: Documentar campos extras capturados nas extrações (onus_gravames, observacoes, valor_venal_referencia).

3. **BAIXA PRIORIDADE**: Adicionar nota sobre diferenca entre estrutura do schema (flat) vs estrutura das extrações (agrupada em partes/valores).

---

## CONCLUSAO

Documentacao **EXCELENTE**. Problema principal e desalinhamento entre schema (estrutura flat) e extrações reais (estrutura agrupada). Isso nao afeta uso pratico, mas deve ser corrigido para consistencia.

**Score**: 8.5/10
