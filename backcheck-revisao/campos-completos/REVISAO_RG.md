# REVISAO: RG.md

**Data**: 2026-01-30
**Revisor**: Agent
**Status**: DISCREPANCIAS ENCONTRADAS

---

## PROBLEMAS IDENTIFICADOS

### 1. CAMPOS DO SCHEMA NAO DOCUMENTADOS

Campos presentes no **schema** mas AUSENTES na documentacao:

NENHUM - Todos os campos do schema estao documentados.

### 2. CAMPOS DOCUMENTADOS NAO PRESENTES NO SCHEMA

Campos presentes na **documentacao** mas AUSENTES no schema:

NENHUM - Documentacao alinhada com schema.

### 3. DIVERGENCIAS DE ESTRUTURA

#### 3.1 Estrutura de Filiacao

- **Schema**: Campos planos `nome_pai` e `nome_mae` (nivel raiz)
- **Documentacao (Secao 2.3.1)**: Descreve como objeto nested `filiacao` com subcampos `pai` e `mae`
- **Extracao Real**: Usa estrutura nested `filiacao: { pai: "", mae: "" }`

**PROBLEMA**: Schema define campos planos, mas extracao real usa estrutura nested.
**IMPACTO**: Documentacao esta correta quanto ao comportamento real, mas schema nao reflete a implementacao.

#### 3.2 Campos Ausentes no Schema mas Presentes na Extracao

Campos presentes na **extracao real** mas AUSENTES no schema:

- `via_documento` (presente na extracao como "2 via")
- `modelo_documento` (presente como "8000-2")
- `instituto_emissor` (presente como "Ricardo Gumbleton Daunt")
- `tipo_rg` (presente como "antigo_papel")
- `documentos_complementares` (objeto com titulo_eleitor, cnh, nis_pis_pasep, ctps, cert_militar, cns)
- `observacoes_legais`
- `fator_rh`
- `campos_vazios`
- `elementos_presentes` (objeto com foto, assinatura_titular, impressao_digital)
- `autoridade_emissora` (objeto com nome e cargo)

**PROBLEMA**: Schema incompleto. Pipeline extrai mais campos do que o schema define.
**IMPACTO**: Documentacao menciona alguns desses campos (elementos_presentes, tipo_rg), mas schema nao os possui.

### 4. DIVERGENCIAS DE TIPO DE DADOS

NENHUMA - Tipos de dados estao corretos.

### 5. DIVERGENCIAS DE EXEMPLOS

Os exemplos na documentacao sao realistas e consistentes.

---

## CAMPOS NESTED/ARRAYS

### Status: PARCIALMENTE DOCUMENTADO

- **filiacao**: Documentado como nested (Secao 2.3.1), mas schema usa campos planos
- **documentos_complementares**: Documentado (Secao 2.3.2), mas AUSENTE no schema
- **elementos_presentes**: Documentado (Secao 2.3.3), mas AUSENTE no schema

---

## RECOMENDACOES

1. **ATUALIZAR SCHEMA**: Adicionar campos faltantes ao `execution/schemas/rg.json`:
   - `modelo_documento`, `instituto_emissor`, `tipo_rg`
   - `observacoes_legais`, `fator_rh`, `campos_vazios`
   - Objetos nested: `filiacao`, `documentos_complementares`, `elementos_presentes`, `autoridade_emissora`

2. **CORRIGIR ESTRUTURA**: Decidir se filiacao deve ser plano ou nested e alinhar schema com implementacao

3. **VALIDAR EXTRACAO**: Confirmar se todos os campos extras sao necessarios ou se pipeline esta extraindo mais do que deveria

---

## CONCLUSAO

**A documentacao RG.md esta BEM ESCRITA e COMPLETA**, mas ha INCONSISTENCIAS entre:
- Schema JSON (incompleto)
- Documentacao (completa e precisa)
- Extracao real (implementacao com mais campos que schema)

**Prioridade**: MEDIA - Documentacao funciona como referencia, mas schema precisa ser atualizado para refletir implementacao real.
