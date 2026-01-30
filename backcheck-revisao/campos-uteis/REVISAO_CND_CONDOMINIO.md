# REVISAO: CND_CONDOMINIO (Campos Uteis)

**Data**: 2026-01-30
**Status**: ✅ APROVADO

---

## VERIFICACOES OBRIGATORIAS

### ✅ 1. Total de campos uteis bate com mapeamento?

**Mapeamento oficial** (`mapeamento_documento_campos.json`):
- pessoa_natural: 1 campo
- pessoa_juridica: 0 campos
- imovel: 1 campo
- negocio: 0 campos
- **TOTAL: 2 campos**

**Documento campos-uteis** (`CND_CONDOMINIO.md`):
- pessoa_natural: 1 campo
- pessoa_juridica: 0 campos
- imovel: 1 campo
- negocio: 0 campos
- **TOTAL: 2 campos**

**Resultado**: ✅ CORRETO (2 = 2)

---

### ✅ 2. Campos listados sao exatamente os do mapeamento?

**Mapeamento oficial**:
- pessoa_natural: `["nome"]`
- pessoa_juridica: `[]`
- imovel: `["imovel_complemento"]`
- negocio: `[]`

**Documento campos-uteis**:
- pessoa_natural: `nome`
- pessoa_juridica: (nenhum)
- imovel: `imovel_complemento`
- negocio: (nenhum)

**Resultado**: ✅ CORRETO (campos identicos)

---

### ✅ 3. Categorias corretas?

**Mapeamento oficial**:
- `nome` → pessoa_natural ✅
- `imovel_complemento` → imovel ✅

**Documento campos-uteis**:
- `nome` → pessoa_natural ✅
- `imovel_complemento` → imovel ✅

**Resultado**: ✅ CORRETO (categorias identicas)

---

### ✅ 4. Nenhum campo extra foi adicionado?

**Campos extras**: NENHUM

**Resultado**: ✅ CORRETO

---

### ✅ 5. Nenhum campo foi omitido?

**Campos omitidos**: NENHUM

**Resultado**: ✅ CORRETO

---

## MAPEAMENTO REVERSO VERIFICADO

| Campo no Documento | Campo Util Mapeado | Categoria | Status |
|-------------------|-------------------|-----------|--------|
| proprietario | nome | pessoa_natural | ✅ OK |
| unidade | imovel_complemento | imovel | ✅ OK |

---

## OBSERVACOES

1. **Menor cobertura do sistema**: CND_CONDOMINIO possui uma das menores coberturas de campos uteis (apenas 2 campos), o que esta correto dado que o documento serve principalmente para **validacao de regularidade**, nao como fonte primaria de dados.

2. **Uso adequado**: O documento corretamente enfatiza que:
   - `nome` é usado APENAS para validação cruzada (não é fonte primária)
   - `imovel_complemento` é usado para validação com IPTU e MATRICULA_IMOVEL

3. **Documentacao completa**: O arquivo fornece excelente contexto sobre:
   - Lei 4.591/64 e obrigacao propter rem
   - Diferenca entre CND_CONDOMINIO e CND_MUNICIPAL
   - Status possiveis (QUITADO, EM DIA, NADA CONSTA, COM DEBITOS)

4. **Consistencia com campos-completos**: A versao completa lista ~12 campos catalogados, dos quais apenas 2 sao mapeados como uteis, o que esta correto.

---

## CONCLUSAO

✅ **DOCUMENTO APROVADO**

Nenhum problema encontrado. O documento `campos-uteis/CND_CONDOMINIO.md` esta perfeitamente alinhado com o mapeamento oficial.
