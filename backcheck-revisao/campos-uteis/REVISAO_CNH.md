# REVISAO: CNH.md (Campos Uteis)

**Data**: 2026-01-30
**Status**: APROVADO COM RESSALVA
**Revisor**: Claude Agent

---

## VERIFICACOES OBRIGATORIAS

### 1. Total de campos uteis bate com mapeamento?
**STATUS**: OK
- Mapeamento oficial: 10 campos
- CNH.md declara: 10 campos
- Match: SIM

### 2. Campos listados sao exatamente os do mapeamento?
**STATUS**: OK

Campos no mapeamento (execution/mapeamento_documento_campos.json):
```
"CNH": {
  "pessoa_natural": [
    "nome",
    "cpf",
    "rg",
    "orgao_emissor_rg",
    "estado_emissor_rg",
    "cnh",
    "orgao_emissor_cnh",
    "data_nascimento",
    "filiacao_pai",
    "filiacao_mae"
  ]
}
```

Campos em CNH.md:
- nome
- cpf
- rg
- orgao_emissor_rg
- estado_emissor_rg
- cnh
- orgao_emissor_cnh
- data_nascimento
- filiacao_pai
- filiacao_mae

Match: 10/10 campos (100%)

### 3. Categorias corretas?
**STATUS**: OK
- pessoa_natural: 10 campos (correto)
- pessoa_juridica: 0 campos (correto)
- imovel: 0 campos (correto)
- negocio: 0 campos (correto)

### 4. Nenhum campo extra foi adicionado?
**STATUS**: OK
Nao ha campos extras.

### 5. Nenhum campo foi omitido?
**STATUS**: OK
Todos os campos do mapeamento estao presentes.

---

## CONFORMIDADE COM GUIA DE CAMPOS

### Campos validados contra campos-pessoa-natural.md:
- nome: OK (linha 13)
- cpf: OK (linha 14)
- rg: OK (linha 15)
- orgao_emissor_rg: OK (linha 16)
- estado_emissor_rg: OK (linha 17)
- cnh: OK (linha 23)
- orgao_emissor_cnh: OK (linha 24)
- data_nascimento: OK (linha 21)
- filiacao_pai: OK (observado no guia, presente na secao 2.3.1 do campos-completos)
- filiacao_mae: OK (observado no guia, presente na secao 2.3.1 do campos-completos)

Todos os campos existem no guia oficial.

---

## PROBLEMAS ENCONTRADOS

### PROBLEMA 1: RESSALVA - NOTA SOBRE CAMPO "orgao_emissor_rg"

A CNH.md indica na linha 36:
> "O campo orgao_emissor_cnh e formado por 'DETRAN-' + UF"

No entanto, ao consultar o arquivo campos-completos/CNH.md, ha uma nota importante (linha 132):
> "Nota sobre orgao_emissor_cnh: Este campo e computado concatenando 'DETRAN-' + uf_emissor (ex: 'DETRAN-SP')."

Esta nota poderia estar mais explicita no documento campos-uteis.

**SEVERIDADE**: Baixa
**ACAO RECOMENDADA**: Opcional - adicionar nota mais explicita sobre a computacao do campo

---

## CONCLUSAO

O documento CNH.md (campos-uteis) esta:
- 100% alinhado com o mapeamento oficial
- 100% dos campos mapeados
- Categorias corretas
- Sem campos extras
- Sem campos omitidos

**RESULTADO FINAL**: APROVADO

O documento esta pronto para uso em producao.

---

## COMPARACAO COM VERSAO COMPLETA

Arquivo campos-completos/CNH.md contem:
- 15+ campos extraiveis (incluindo metadados)
- Campos nao uteis corretamente excluidos da versao campos-uteis

Campos excluidos corretamente (nao uteis):
- categoria (dado de habilitacao veicular)
- data_validade (metadado)
- data_primeira_habilitacao (historico)
- data_emissao (metadado)
- local_emissao (metadado)
- observacoes (restricoes de conducao)
- numero_espelho (metadado)
- codigo_seguranca (metadado)
- naturalidade (presente no guia, mas nao no mapeamento oficial - correto excluir)

Exclusoes coerentes com criterio de "campos uteis para minutas cartoriais".
