# REVISAO: CNDT.md
**Data**: 2026-01-30
**Revisor**: Agent
**Status**: PROBLEMAS IDENTIFICADOS

---

## RESUMO EXECUTIVO

**7 PROBLEMAS ENCONTRADOS**
- 4 inconsistencias criticas entre schema, documentacao e extracao real
- 2 problemas de nomenclatura de campos
- 1 campo documentado nao existe no schema

---

## PROBLEMAS CRITICOS

### 1. CAMPO `cpf` MARCADO COMO OBRIGATORIO NO SCHEMA
**Severidade**: ALTA

**Schema** (linha 30): `"obrigatorio": true`
**Documentacao** (linha 54): Campo listado como "Obrigatorio"
**Realidade**: Campo deve ser condicional (PF tem CPF, PJ nao tem)

**Impacto**: Validacao vai falhar para certidoes de Pessoa Juridica que nao tem CPF.

**Correcao**: Alterar schema para `"obrigatorio": false` ou criar logica condicional (obrigatorio SE tipo_pessoa = PF).

---

### 2. CAMPO `hora_expedicao` vs `hora_emissao`
**Severidade**: ALTA

**Schema** (linha 58): `"nome": "hora_expedicao"`
**Documentacao** (linha 64): `hora_expedicao`
**Extracao Real** (linha 18): `"hora_emissao": "15:17:00"`

**Impacto**: Mapeamento entre extracao e schema vai falhar. Campo nao sera encontrado.

**Correcao**: Padronizar nome. Sugestao: usar `hora_expedicao` (consistente com `data_expedicao`).

---

### 3. CAMPO `data_expedicao` vs `data_emissao`
**Severidade**: ALTA

**Schema** (linha 48): `"nome": "data_expedicao"`
**Documentacao** (linha 55): `data_expedicao`
**Extracao Real** (linha 17): `"data_emissao": "26/10/2023"`

**Impacto**: Mapeamento entre extracao e schema vai falhar. Campo nao sera encontrado.

**Correcao**: Padronizar nome. Sugestao: usar `data_expedicao` (mantendo coerencia entre data e hora).

---

### 4. CAMPO `status_certidao` - VALORES DIFERENTES
**Severidade**: MEDIA

**Schema** (linha 81): `"regex": "(NADA CONSTA|POSITIVA|NEGATIVA)"`
**Extracao Real** (linha 21): `"status": "NÃO CONSTA"`

**Problema**: Extracao usa "NÃO CONSTA" (com tilde), schema aceita "NADA CONSTA" ou "NEGATIVA".

**Impacto**: Validacao por regex vai falhar. Ambos valores significam a mesma coisa.

**Correcao**: Regex deve aceitar ambos: `(NADA CONSTA|NÃO CONSTA|POSITIVA|NEGATIVA)`

---

## PROBLEMAS DE ESTRUTURA

### 5. NOME DO CAMPO NO SCHEMA vs EXTRACAO
**Severidade**: MEDIA

**Schema** (linha 78): `"nome": "status_certidao"`
**Extracao Real** (linha 21): `"status": "NÃO CONSTA"`

**Problema**: Nome do campo difere entre schema e extracao real.

**Correcao**: Padronizar. Sugestao: usar `status_certidao` no schema e nas extracoes.

---

### 6. CAMPO `numero_certidao` - FORMATO REAL DIFERENTE
**Severidade**: BAIXA

**Schema** (linha 11): `"regex": "\\d{20,}"` (apenas digitos, 20+)
**Documentacao** (linha 52): `"12345678901234567890"` (apenas digitos)
**Extracao Real** (linha 16): `"numero_certidao": "59444927/2023"` (tem barra)

**Problema**: Regex nao aceita formatacao com barra, mas extracao real possui.

**Correcao**: Atualizar regex para aceitar ambos formatos: `\\d{8,}/\\d{4}|\\d{20,}`

---

## CAMPOS NAO MAPEADOS

### 7. CAMPOS PRESENTES NA EXTRACAO, AUSENTES NO SCHEMA
**Severidade**: BAIXA

Campos presentes na extracao real mas nao no schema:
- `tipo_certidao` (linha 10 da extracao)
- `tipo_pessoa` (linha 15)
- `prazo_validade_dias` (linha 20)
- `resultado_certidao` (linha 22)
- `situacao_regular` (linha 23)
- `base_legal` (objeto nested, linhas 24-36)
- `url_verificacao` (linha 37)
- `contato` (objeto nested, linhas 38-40)
- `observacoes` (linha 41)

**Impacto**: Schema nao captura campos que podem ser uteis. Principalmente `tipo_pessoa` e `resultado_certidao`.

**Recomendacao**: Avaliar se esses campos devem ser adicionados ao schema, especialmente:
- `tipo_pessoa` (ajuda na validacao condicional de CPF/CNPJ)
- `resultado_certidao` (interpretacao do status)
- `situacao_regular` (boolean util para validacoes)

---

## VERIFICACAO DE COMPLETUDE

### Todos os campos do schema documentados?
**SIM** - Todos os 9 campos do schema estao documentados na secao 2.

### Tipos de dados corretos?
**SIM** - Tipos estao corretos (string, date).

### Exemplos realistas?
**PARCIAL** - Exemplos na documentacao sao validos, mas nao refletem formato real (ex: numero_certidao com barra).

### Estrutura segue template?
**SIM** - Documentacao segue estrutura padrao de 8 secoes.

### Campos nested documentados?
**SIM** - Secao 2.3 informa corretamente que nao ha estrutura nested.

---

## RECOMENDACOES

1. **URGENTE**: Corrigir inconsistencias de nomenclatura (data_expedicao vs data_emissao, hora_expedicao vs hora_emissao)
2. **URGENTE**: Ajustar obrigatoriedade do campo CPF (condicional)
3. **ALTA**: Atualizar regex de status_certidao para aceitar "NÃO CONSTA"
4. **MEDIA**: Atualizar regex de numero_certidao para aceitar formato com barra
5. **BAIXA**: Considerar adicionar campos `tipo_pessoa`, `resultado_certidao` e `situacao_regular` ao schema

---

## CONCLUSAO

Documentacao bem estruturada e completa, mas existem inconsistencias criticas entre schema e extracao real que vao causar falhas de validacao e mapeamento. Priorizar correcoes de nomenclatura e obrigatoriedade.
