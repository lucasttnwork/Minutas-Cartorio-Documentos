# REVISAO: ITBI.md

**Data**: 2026-01-30
**Revisor**: Claude (Agent)
**Status**: APROVADO COM RESSALVAS

---

## PROBLEMAS IDENTIFICADOS

### 1. DIVERGENCIA ESTRUTURAL: Schema vs Documentacao

**Schema JSON** usa estrutura simples:
- `dados_imovel.sql`
- `dados_imovel.endereco` (string unica)
- `dados_imovel.matricula`
- `dados_imovel.area`

**Extrações reais** usam estrutura expandida:
- `imovel.logradouro`
- `imovel.numero`
- `imovel.complemento`
- `imovel.bairro`
- `imovel.cep`
- `imovel.cidade`
- `imovel.estado`
- `imovel.matricula`
- `imovel.cartorio_registro`
- `imovel.tipo_imovel`
- `imovel.endereco_completo` (montado)

**Impacto**: A documentacao esta correta ao dizer que `endereco` e um campo unico segundo o schema, mas as extracoes reais quebram o endereco em componentes. Isso NAO esta documentado.

---

### 2. CAMPOS AUSENTES NO SCHEMA MAS PRESENTES NAS EXTRACOES

Os seguintes campos aparecem nas extracoes mas NAO estao no schema:

**Secao `identificacao`**:
- `emitente`
- `especificacao_tributo`
- `codigo_tributo`
- `ctrl`
- `numero_serie`

**Secao `imovel`**:
- `tipo_imovel` (ex: "APARTAMENTO")

**Secao `transacao`**:
- `tipo_instrumento`
- `transmissao_totalidade` (boolean)

**Secao `partes`**:
- `observacao` (transmitente)

**Secao `valores`**:
- `atualizacao_monetaria`

**Secao `pagamento`**:
- `codigo_identificacao`
- `codigo_autenticacao`
- `banco_pagamento`

**Secoes completamente ausentes no schema**:
- `metadados_documento`
- `validacoes_realizadas`
- `observacoes`

---

### 3. ARRAY VENDEDORES: CONSOLIDACAO NAO DOCUMENTADA

**Exemplo real** (GS_357_11_p281773):
- 4 vendedores no documento original
- Extraido como: `"nome": "MILTON PEREIRA DA SILVA (e outros 3)"`
- Apenas o CPF do primeiro vendedor e capturado
- `"observacao": "Existem 4 vendedores listados no documento."`

**Problema**: A documentacao diz que `vendedores` e um array, mas nao documenta como lidar com multiplos vendedores quando o campo e consolidado.

---

### 4. CAMPO `proporcao_adquirida` vs `proporcao_transmitida`

**Schema**: `dados_transacao.proporcao_adquirida` (number)
**Extrações**: `transacao.proporcao_transmitida` (number)

Nomes diferentes para o mesmo campo. A documentacao usa `proporcao_adquirida`, as extracoes usam `proporcao_transmitida`.

---

## VALIDACOES EXECUTADAS

### Campos Obrigatorios do Schema

| Campo | Presente no ITBI.md | Presente nas Extracoes | Status |
|-------|---------------------|------------------------|--------|
| numero_transacao | SIM | SIM | OK |
| data_emissao | SIM | SIM | OK |
| dados_imovel | SIM | SIM | OK |
| compradores | SIM | SIM (singular: adquirente) | DIVERGENCIA |
| vendedores | SIM | SIM (singular: transmitente) | DIVERGENCIA |
| dados_transacao | SIM | SIM | OK |
| dados_calculo | SIM | SIM (expandido como valores) | DIVERGENCIA |

### Arrays Internos

| Array | Subcampos Documentados | Subcampos Extraidos | Status |
|-------|------------------------|---------------------|--------|
| compradores[] | nome, cpf, percentual | nome, cpf_cnpj | FALTA percentual |
| vendedores[] | nome, cpf, percentual | nome, cpf_cnpj, observacao | DIVERGENCIA |

---

## RECOMENDACOES

1. **Alinhar nomenclatura**: Decidir entre `compradores`/`vendedores` (plural) vs `adquirente`/`transmitente` (singular).

2. **Documentar tratamento de arrays**: Como lidar quando ha 4+ vendedores? Sistema consolida ou mantem array completo?

3. **Atualizar schema**: Adicionar campos realmente extraidos (`tipo_imovel`, `transmissao_totalidade`, etc.).

4. **Revisar secao 2.3.1**: Documentar que `endereco` e parseado em componentes nas extracoes.

5. **Adicionar secao**: Documentar `metadados_documento`, `validacoes_realizadas` e `observacoes`.

---

## CONCLUSAO

Documentacao esta **CORRETA** para o schema oficial, mas **DESATUALIZADA** em relacao as extracoes reais. As extracoes usam uma estrutura mais rica e expandida que NAO esta refletida no schema JSON.

Sugestao: Atualizar o schema primeiro, depois revisar a documentacao.
