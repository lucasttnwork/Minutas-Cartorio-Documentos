# REVISAO: ASSINATURA_DIGITAL.md

**Data**: 2026-01-30
**Revisor**: Claude Agent
**Status**: PROBLEMAS ENCONTRADOS

---

## PROBLEMAS ENCONTADOS

### 1. DIVERGENCIAS SCHEMA vs DOCUMENTACAO

#### 1.1 Campos Ausentes na Documentacao
O schema JSON possui apenas 8 campos, mas a documentação lista MUITO MAIS campos. Campos presentes na EXTRACAO REAL mas AUSENTES NO SCHEMA:

- `identificacao_documento.codigo_rastreamento`
- `identificacao_documento.assunto_email`
- `identificacao_documento.fuso_horario`
- `rastreamento_registros` (objeto completo)
- `configuracoes_envelope.certificar_paginas`
- `configuracoes_envelope.selo_envelope_id`
- `remetente_envelope` (objeto completo)
- `metadados_plataforma` (objeto completo)
- `partes_contratantes[].ordem`
- `partes_contratantes[].papel`
- `partes_contratantes[].nivel_seguranca`
- `partes_contratantes[].termos_assinatura_eletronica`
- `partes_contratantes[].metodo_adocao_assinatura`
- `partes_contratantes[].tipo_assinatura_visual`
- `partes_contratantes[].marca_assinatura`
- `partes_contratantes[].timeline.reenviado`
- `pessoas_copiadas` (array completo)
- `eventos_resumo_envelope` (array completo)
- `imovel_referenciado` (objeto completo)
- `validacao_documento` (objeto completo)
- `qualidade_extracao` (objeto completo)

#### 1.2 Campos no Schema Ausentes na Extracao
- `documento_nome` (schema) vs `identificacao_documento.titulo_documento_completo` (extracao)

### 2. INCONSISTENCIAS DE NOMENCLATURA

#### 2.1 Array "signatarios" vs "partes_contratantes"
- Schema usa: `signatarios`
- Documentacao Secao 2.3.1 usa: `signatarios[]`
- Extracao real usa: `partes_contratantes[]`
- **CONFLITO CRITICO**

#### 2.2 Status dos Signatarios
- Documentacao lista valores: ASSINADO, PENDENTE, RECUSADO, CANCELADO, EXPIRADO
- Extracao real tem campo `papel: "OUTRO"` mas nao tem campo `status` nos signatarios
- Extracao tem array separado `pessoas_copiadas` com status "COPIADO"

### 3. ESTRUTURA DE DADOS DIVERGENTE

#### 3.1 Objetos Nested Nao Definidos no Schema
O schema JSON e minimalista (8 campos), mas a extracao real tem estrutura profunda:
- `identificacao_documento` (6 subcampos)
- `datas_envelope` (3 subcampos)
- `rastreamento_registros` (4 subcampos)
- `configuracoes_envelope` (6 subcampos)
- `remetente_envelope` (4 subcampos)
- `metadados_plataforma` (5 subcampos)

Essa estrutura nested NAO esta refletida no schema.

#### 3.2 Timeline Inconsistente
- Documentacao diz: `signatarios[].timeline.enviado`
- Extracao tem: `partes_contratantes[].timeline.enviado`
- Extracao adiciona: `timeline.reenviado` (nao documentado)

### 4. CAMPOS DOCUMENTADOS MAS NAO EXTRAIDOS

#### 4.1 Secao 2.2 - Campos Raiz Opcionais
Campos listados mas ausentes na extracao real:
- `total_assinaturas` (existe como `configuracoes_envelope.total_assinaturas_esperadas`)
- `total_rubricas` (existe como `configuracoes_envelope.total_rubricas`)
- `assinatura_guiada` (existe como `configuracoes_envelope.assinatura_guiada`)

### 5. EXEMPLO JSON SECAO 4 vs EXTRACAO REAL

O exemplo na Secao 4 usa estrutura simplificada:
```
plataforma, envelope_id, signatarios[]
```

A extracao real usa estrutura complexa:
```
identificacao_documento.plataforma, identificacao_documento.envelope_id, partes_contratantes[]
```

**DIVERGENCIA TOTAL DE ESTRUTURA**

---

## RECOMENDACOES

### CRITICAS (Bloqueantes)
1. **ATUALIZAR SCHEMA JSON** para refletir estrutura real extraida
2. **UNIFICAR NOMENCLATURA** de arrays: decidir entre `signatarios` ou `partes_contratantes`
3. **AJUSTAR SECAO 2** para refletir objetos nested reais

### IMPORTANTES
4. Adicionar campos ausentes ao schema (25+ campos faltando)
5. Atualizar exemplo da Secao 4 com estrutura real
6. Documentar `pessoas_copiadas` e `eventos_resumo_envelope`

### OPCIONALES
7. Revisar Secao 3 (Mapeamento) - pode estar desatualizada
8. Adicionar validacoes para novos campos
