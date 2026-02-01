# REVISAO: CERTIDAO_OBITO (Campos Uteis)

**Data**: 2026-01-30
**Status**: DISCREPANCIA ENCONTRADA
**Arquivo**: `documentacao-campos-extraiveis/campos-uteis/CERTIDAO_OBITO.md`

---

## RESUMO EXECUTIVO

PROBLEMA CRITICO: O arquivo lista 7 campos, mas o mapeamento oficial possui apenas 7 campos. Contudo, existe **DIVERGENCIA** na contagem e nos campos listados.

---

## 1. CONTAGEM DE CAMPOS

| Fonte | Total | Match? |
|-------|-------|--------|
| Mapeamento oficial (`mapeamento_documento_campos.json`) | **7 campos** | - |
| Arquivo campos-uteis (`CERTIDAO_OBITO.md`) | **7 campos** | ✓ |

**Resultado**: Contagem bate (7 = 7).

---

## 2. VERIFICACAO CAMPO A CAMPO

### Campos no Mapeamento Oficial:
```json
"CERTIDAO_OBITO": {
  "pessoa_natural": [
    "nome",
    "cpf",
    "rg",
    "data_nascimento",
    "data_obito",
    "estado_civil",
    "data_falecimento_conjuge"
  ]
}
```

### Campos Listados no Arquivo campos-uteis:

| # | Campo Listado | No Mapeamento? | Status |
|---|---------------|----------------|--------|
| 1 | nome | ✓ | OK |
| 2 | cpf | ✓ | OK |
| 3 | rg | ✓ | OK |
| 4 | data_nascimento | ✓ | OK |
| 5 | data_obito | ✓ | OK |
| 6 | estado_civil | ✓ | OK |
| 7 | data_falecimento_conjuge | ✓ | OK |

**Resultado**: Todos os 7 campos batem perfeitamente.

---

## 3. VERIFICACAO DE CATEGORIAS

| Categoria | No Mapeamento | No Arquivo | Match? |
|-----------|---------------|------------|--------|
| pessoa_natural | 7 | 7 | ✓ |
| pessoa_juridica | 0 | 0 | ✓ |
| imovel | 0 | 0 | ✓ |
| negocio | 0 | 0 | ✓ |

**Resultado**: Categorias corretas.

---

## 4. VERIFICACAO DE MAPEAMENTO REVERSO (Secao 3)

### Comparacao:

Arquivo lista na Secao 3 (Mapeamento Reverso):

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_falecido | nome | pessoa_natural |
| cpf_falecido | cpf | pessoa_natural |
| rg_falecido | rg | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |
| data_obito | data_obito | pessoa_natural |
| estado_civil | estado_civil | pessoa_natural |
| data_obito (alias) | data_falecimento_conjuge | pessoa_natural |

**PROBLEMA**: A Secao 3 cita "Campo no Schema" mas **CERTIDAO_OBITO NAO TEM SCHEMA DEDICADO** conforme documentado no arquivo campos-completos.

**Observacao**: O mapeamento reverso esta tecnicamente correto em mapear os campos extraidos para os campos do modelo, mas a terminologia "Campo no Schema" e imprecisa.

---

## 5. VERIFICACAO COM CAMPOS-COMPLETOS

Comparando com `campos-completos/CERTIDAO_OBITO.md`:

- Campos completos mapeados no Schema: ~25 campos (incluindo filiacao, conjuge, cartorio, etc.)
- Campos uteis: 7 campos
- **Reducao**: ~18 campos nao considerados uteis

**Campos presentes no completo MAS NAO nos uteis**:
- filiacao_pai, filiacao_mae (conforme Secao 7 do arquivo campos-uteis)
- matricula, livro, folha, termo
- hora_obito, local_obito
- causa_mortis, declarante, medico_atestante
- cemiterio, data_sepultamento
- cartorio, municipio_cartorio, estado_cartorio

**Status**: Coerente com a documentacao.

---

## 6. VERIFICACAO DE OBRIGATORIEDADE

| Campo | Obrigatorio no Arquivo | Observacao |
|-------|------------------------|------------|
| nome | SIM | Correto |
| cpf | Condicional | Correto - certidoes antigas podem nao ter |
| rg | Condicional | Correto - certidoes antigas podem nao ter |
| data_nascimento | Condicional | Correto |
| data_obito | SIM | Correto |
| estado_civil | Condicional | Correto |
| data_falecimento_conjuge | SIM | **ATENCAO**: Este e um alias de data_obito |

**Observacao**: A marcacao de `data_falecimento_conjuge` como SIM e tecnicamente correta se sempre que ha data_obito, este campo e populado como alias. O arquivo explica claramente esta logica nas linhas 46-49.

---

## 7. VERIFICACAO DE CORRELACOES (Secao 6)

Arquivo lista correlatamente:
- nome: RG, CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL
- cpf: RG, CNH, CND_FEDERAL, CNDT
- rg: RG, CNH, CERTIDAO_CASAMENTO
- data_nascimento: RG, CNH, CERTIDAO_NASCIMENTO
- estado_civil: CERTIDAO_CASAMENTO

**Status**: Correlacoes plausivas e corretas.

---

## 8. CAMPOS PRESENTES MAS NAO MAPEADOS (Secao 7)

Arquivo cita corretamente em Secao 7 que os seguintes campos NAO SAO considerados uteis:
- profissao, nacionalidade, domicilio_*, email, telefone
- orgao_emissor_rg, estado_emissor_rg
- regime_bens
- filiacao_pai, filiacao_mae (embora presentes, nao sao campos uteis)

**Observacao**: O arquivo menciona que "filiacao_pai" e "filiacao_mae" estao presentes na certidao mas NAO estao mapeados como uteis. POREM, na versao campos-completos (linha 167-169), esses campos ESTAO mapeados para pessoa_natural.

**DIVERGENCIA**: Campos-completos mapeia filiacao_pai e filiacao_mae, mas campos-uteis NAO os inclui. Verificar mapeamento oficial.

**VERIFICACAO NO MAPEAMENTO**:
```json
"CERTIDAO_OBITO": {
  "pessoa_natural": [
    "nome",
    "cpf",
    "rg",
    "data_nascimento",
    "data_obito",
    "estado_civil",
    "data_falecimento_conjuge"
  ]
}
```

**Resultado**: Mapeamento oficial NAO inclui filiacao_pai/mae. O arquivo campos-uteis esta CORRETO. O arquivo campos-completos esta ERRADO.

---

## CONCLUSAO FINAL

**STATUS GERAL**: ✓ CONFORME

### Pontos Positivos:
1. Contagem de campos bate (7 = 7)
2. Todos os campos listados estao no mapeamento oficial
3. Nenhum campo extra foi adicionado
4. Nenhum campo foi omitido
5. Categorias corretas
6. Correlacoes bem documentadas
7. Secao 7 explica corretamente campos nao-mapeados

### Observacoes Menores:
1. Secao 3 usa termo "Campo no Schema" mas CERTIDAO_OBITO nao tem schema dedicado - terminologia imprecisa mas funcional
2. Campo `data_falecimento_conjuge` e alias de `data_obito` - bem documentado

### Inconsistencia Externa:
- **Arquivo campos-completos/CERTIDAO_OBITO.md** lista filiacao_pai e filiacao_mae como mapeados (linhas 167-169), MAS o mapeamento oficial NAO os inclui
- **Recomendacao**: Corrigir arquivo campos-completos para remover filiacao_pai/mae da secao 3.1

---

## ACOES NECESSARIAS

**NENHUMA** - Arquivo campos-uteis/CERTIDAO_OBITO.md esta correto e conforme mapeamento oficial.

**Acao futura**: Revisar campos-completos/CERTIDAO_OBITO.md para corrigir mapeamento de filiacao.
