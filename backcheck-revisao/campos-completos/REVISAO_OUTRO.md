# REVISAO: campos-completos/OUTRO.md

**Data da Revisao:** 2026-01-30
**Revisor:** Claude Agent
**Status:** APROVADO COM RESSALVAS

---

## VERIFICACOES REALIZADAS

### 1. Cobertura de Campos do Schema
**STATUS: COMPLETO**
- Todos os 6 campos principais do schema estao documentados
- Subcampos documentados adequadamente

### 2. Tipos de Dados
**STATUS: CORRETO**
- Tipos estao alinhados com o schema JSON

### 3. Exemplos
**STATUS: OK**
- Exemplo JSON completo e coerente (linhas 210-265)
- Exemplo realista de LAUDO_AVALIACAO_IMOVEL

### 4. Estrutura do Template
**STATUS: CORRETO**
- Segue estrutura padrao
- Secoes bem organizadas

### 5. Arrays e Objetos Nested
**STATUS: COMPLETO**
- `campos_recomendados` array documentado com item_schema completo
- `dados_extraidos` subcampos documentados

---

## PROBLEMAS ENCONTRADOS

### PROBLEMA CRITICO: Desalinhamento Schema vs Realidade

**Localizacao:** Secao 2 (Campos do Schema)

**Observacao:** O schema `desconhecido.json` define uma estrutura complexa e elaborada para documentos nao reconhecidos, MAS os arquivos JSON reais extraidos usam uma estrutura completamente diferente.

**Evidencia:**

**O que o schema define:**
```json
{
  "analise_documento": {...},
  "caracteristicas_identificadoras": {...},
  "campos_recomendados": [...],
  "padroes_identificacao": {...},
  "schema_sugerido": {...},
  "dados_extraidos": {...}
}
```

**O que os JSONs reais contem (012_OUTRO.json, 028_OUTRO.json, 009_OUTRO.json):**
```json
{
  "tipo_documento": "OUTRO",
  "dados_catalogados": {
    "tipo_documento_identificado": null,
    "tipo_documento_sugerido": "ORCAMENTO_ESCRITURA",
    "categoria_documento": "DOCUMENTOS_NEGOCIO",
    ...
  }
}
```

**Impacto:** A documentacao descreve campos que NAO existem nas extrações reais:
- `analise_documento` (nao existe nos JSONs reais)
- `caracteristicas_identificadoras` (nao existe)
- `campos_recomendados` (nao existe)
- `padroes_identificacao` (nao existe)
- `schema_sugerido` (nao existe)

---

## RECOMENDACOES

1. **URGENTE:** Alinhar schema com a realidade
   - Opcao A: Atualizar `desconhecido.json` para refletir estrutura real
   - Opcao B: Atualizar pipeline de extracao para gerar campos do schema
   - Opcao C: Documentar estrutura real em vez da ideal

2. Verificar se existe `prompts/desconhecido.txt` e se esta gerando output correto

3. Testar extracao de documento desconhecido para validar qual estrutura esta sendo usada

---

## CONCLUSAO

A documentacao esta bem escrita e estruturada, MAS documenta um schema que nao esta sendo usado na pratica. Os documentos classificados como OUTRO usam a estrutura generica `dados_catalogados`, nao os campos especializados definidos no schema.

**Acao Necessaria:** Decidir se o problema esta no schema, no pipeline ou na documentacao.
