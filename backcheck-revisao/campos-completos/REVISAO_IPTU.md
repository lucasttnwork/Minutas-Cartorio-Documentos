# REVISÃO: IPTU.md

**Data**: 2026-01-30
**Revisor**: Claude Agent
**Status**: ✅ APROVADO COM OBSERVAÇÕES

---

## ANÁLISE GERAL

Documentação **COMPLETA** e **BEM ESTRUTURADA**. Todos os campos do schema estão documentados. Estrutura segue template corretamente. Exemplos realistas.

---

## PROBLEMAS ENCONTRADOS

### 1. CAMPOS INTERNOS NÃO DOCUMENTADOS

**Severidade**: MÉDIA

O exemplo real contém campos que não estão no schema nem na documentação:

#### 1.1 `dados_terreno.area_incorporada_m2` e `area_nao_incorporada_m2`
- **No exemplo**: `"area_incorporada_m2": 1666`, `"area_nao_incorporada_m2": 0`
- **Na doc**: Mencionado na linha 121 ("subdivisão em area incorporada e area não incorporada")
- **No schema**: NÃO PRESENTE
- **Recomendação**: Adicionar ao schema como subcampos de `dados_terreno`

#### 1.2 `dados_construcao.area_ocupada`
- **No exemplo**: `"area_ocupada_m2": 1332`
- **Na doc**: Mencionado no exemplo JSON linha 290
- **No schema**: NÃO PRESENTE
- **Recomendação**: Adicionar ao schema como subcampo opcional

### 2. INCONSISTÊNCIA ENTRE SCHEMA E EXEMPLO

**Severidade**: BAIXA

- **Schema linha 84**: `"exemplo": {"area": 65.00, "tipo": "APARTAMENTO", "padrao": "MEDIO", "ano": 2010}`
- **Exemplo real**: `"padrao_construcao": "2-C"` (formato diferente)
- **Exemplo real**: `"uso": "residência"` (campo adicional não documentado)
- **Recomendação**: Ajustar exemplo do schema para refletir formato real "2-C"

### 3. CAMPOS INFERIDOS NÃO EXPLÍCITOS NO SCHEMA

**Severidade**: BAIXA

Documentação menciona campos inferidos (linhas 416-421) que não aparecem no schema:
- `imovel_cidade` (inferido de "Prefeitura de São Paulo")
- `imovel_estado` (inferido de "Prefeitura de São Paulo")

**Recomendação**: Considerar adicionar nota no schema sobre inferência destes campos.

---

## VALIDAÇÕES EXECUTADAS

✅ **Todos os campos obrigatórios do schema estão documentados**
- `cadastro_imovel` ✅
- `ano_exercicio` ✅
- `endereco_imovel` ✅
- `contribuintes` ✅
- `valor_venal_total` ✅

✅ **Todos os campos opcionais do schema estão documentados**

✅ **Tipos de dados corretos**

✅ **Exemplos realistas** (confirmados pelo exemplo real de extração)

✅ **Estrutura de objetos nested documentada**

✅ **Arrays documentados** (contribuintes)

✅ **Regex patterns corretos** (confirmados no schema)

---

## RECOMENDAÇÕES

1. **Atualizar schema** `execution/schemas/iptu.json`:
   - Adicionar `area_incorporada_m2` e `area_nao_incorporada_m2` em `dados_terreno.campos_internos`
   - Adicionar `area_ocupada` em `dados_construcao.campos_internos`
   - Corrigir exemplo do padrão de construção para formato real ("2-C" em vez de "MEDIO")

2. **Documentar no MD** (opcional):
   - Adicionar subcampo `dados_construcao.uso` na seção 2.3.4 (aparece no exemplo real)

3. **Nenhuma ação necessária na documentação** - está correta e completa

---

## RESUMO

**Documentação**: 9/10
**Cobertura de campos**: 100%
**Qualidade dos exemplos**: Excelente
**Ação necessária**: Atualizar schema JSON apenas
