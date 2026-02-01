# REVISAO: COMPROMISSO_COMPRA_VENDA.md

**Data da Revisao:** 2026-01-30
**Revisor:** Claude Agent
**Status:** APROVADO COM RESSALVAS

---

## PROBLEMAS ENCONTRADOS

### 1. CAMPOS AUSENTES NA DOCUMENTACAO

Os seguintes campos presentes no **exemplo de extracao real** NAO estao documentados:

#### 1.1 Campos Raiz
- `local_assinatura` (string) - Ex: "Sao Paulo"
- `eh_aditivo` (boolean) - Indica se e aditivo ao contrato original
- `intermediador` (object) - Dados da imobiliaria/plataforma intermediadora
- `instrucoes_importantes` (array) - Lista de instrucoes adicionais
- `documento_referenciado` (string/null) - Referencia a documento anterior (se aditivo)

#### 1.2 Subcampos de vendedores[] e compradores[]
- `vendedores[].regime_casamento` (string) - No schema esta como `regime_bens`
- INCONSISTENCIA: Schema usa `regime_bens`, mas extracao usa `regime_casamento`

#### 1.3 Subcampos de imovel
- `imovel.matriculas` (array) - No exemplo e array, no schema e string simples
- `imovel.matriculas[].numero` (string)
- `imovel.matriculas[].tipo_unidade` (string)
- `imovel.matriculas[].cartorio` (string)
- `imovel.matriculas[].cidade_cartorio` (string)
- `imovel.matriculas[].status` (string) - Ex: "principal"
- `imovel.logradouro` - NAO esta no schema, mas ESTA na documentacao
- `imovel.numero` - NAO esta no schema, mas ESTA na documentacao
- `imovel.bairro` - NAO esta no schema, mas ESTA na documentacao
- `imovel.cidade` - NAO esta no schema, mas ESTA na documentacao
- `imovel.estado` - NAO esta no schema, mas ESTA na documentacao
- `imovel.cep` - NAO esta no schema, mas ESTA na documentacao

#### 1.4 Novos objetos
- `valores_financeiros` (object) - Agregador de dados financeiros
  - `valores_financeiros.preco_total` (number)
  - `valores_financeiros.sinal_entrada` (number)
  - `valores_financeiros.saldo` (number)
  - `valores_financeiros.sinal_percentual_calculado` (number)
  - `valores_financeiros.validacao_valores_ok` (boolean)
- `prazos` (object) - Agregador de prazos
  - `prazos.prazo_pagamento_sinal_dias` (number)
  - `prazos.prazo_pagamento_saldo_dias` (number)
  - `prazos.prazo_escritura` (string)
  - `prazos.prazo_diligencia_dias` (number)
  - `prazos.transferencia_posse` (string)
- `penalidades` (object) - Agregador de penalidades
  - `penalidades.multa_rescisoria_percentual` (number)
  - `penalidades.multa_rescisoria_valor_calculado` (number)
  - `penalidades.multa_moratoria_percentual_dia` (number)
  - `penalidades.juros_mora_percentual_mes` (number)
- `responsabilidades` (object) - Agregador de responsabilidades
  - `responsabilidades.itbi` (string)
  - `responsabilidades.registro_imovel` (string)
  - `responsabilidades.custas_cartorio` (string)
  - `responsabilidades.debitos_anteriores` (string)
  - `responsabilidades.comissao_corretagem` (object)
- `assinatura_digital` (object) - Agregador de dados de assinatura
  - `assinatura_digital.plataforma` (string)
  - `assinatura_digital.envelope_id` (string)
  - `assinatura_digital.status` (string)
  - `assinatura_digital.data_assinatura` (date)

### 2. CAMPOS DOCUMENTADOS MAS NAO NO SCHEMA

- `imovel.logradouro` - Documentado, mas NAO esta no schema JSON
- `imovel.numero` - Documentado, mas NAO esta no schema JSON
- `imovel.bairro` - Documentado, mas NAO esta no schema JSON
- `imovel.cidade` - Documentado, mas NAO esta no schema JSON
- `imovel.estado` - Documentado, mas NAO esta no schema JSON
- `imovel.cep` - Documentado, mas NAO esta no schema JSON

### 3. INCONSISTENCIAS DE NOMENCLATURA

| Documentacao | Schema | Extracao Real | Problema |
|--------------|--------|---------------|----------|
| `regime_bens` | `regime_bens` | `regime_casamento` | Nomes diferentes |
| `imovel.matricula` (string) | `imovel.matricula` (string) | `imovel.matriculas` (array) | Tipo diferente |
| N/A | N/A | `intermediador` | Campo ausente |

### 4. ESTRUTURA DE DADOS DIVERGENTE

**Problema critico:** A estrutura de extracao real usa objetos agregadores (`valores_financeiros`, `prazos`, `penalidades`, `responsabilidades`) que NAO existem no schema nem na documentacao.

**Impacto:** A documentacao descreve campos raiz (ex: `preco_total`, `valor_sinal`), mas a extracao real agrupa esses campos em objetos nested.

---

## VERIFICACOES OBRIGATORIAS

### ✅ 1. Todos os campos do schema estao documentados?
**SIM** - Todos os 17 campos raiz do schema estao documentados.

### ⚠️ 2. Os tipos de dados estao corretos?
**PARCIALMENTE** - Tipo `imovel.matricula` diverge (string vs array).

### ✅ 3. Os exemplos sao realistas?
**SIM** - Exemplos condizem com extracoes reais.

### ✅ 4. A estrutura segue o template?
**SIM** - Estrutura e formatacao seguem o padrao esperado.

### ❌ 5. Campos nested/arrays estao documentados?
**NAO TOTALMENTE** - Faltam objetos agregadores usados na extracao real.

---

## RECOMENDACOES

1. **Adicionar campos ausentes** listados na secao 1 ao documento
2. **Sincronizar schema JSON** com campos documentados de `imovel` (logradouro, numero, etc)
3. **Padronizar nomenclatura** de `regime_bens` vs `regime_casamento`
4. **Documentar objetos agregadores** (`valores_financeiros`, `prazos`, `penalidades`, etc)
5. **Revisar tipo de `imovel.matricula`** - Decidir se e string ou array

---

## CONCLUSAO

A documentacao esta **BEM ESTRUTURADA** e cobre os campos principais, mas ha **DIVERGENCIAS CRITICAS** entre schema, documentacao e extracao real. Recomenda-se alinhamento dos tres artefatos antes de considerar a documentacao finalizada.
