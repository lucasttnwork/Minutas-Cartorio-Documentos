# REVISAO: CND_FEDERAL (Campos Uteis)

**Data**: 2026-01-30
**Status**: ✅ APROVADO
**Revisor**: Claude Agent

---

## VERIFICACOES OBRIGATORIAS

### 1. Total de Campos Uteis
- **Declarado no arquivo**: 14 campos
- **Contagem no mapeamento oficial**: 14 campos (7 PF + 7 PJ)
- **Status**: ✅ CORRETO

### 2. Campos Listados vs Mapeamento Oficial
**Pessoa Natural (7 campos):**
- ✅ nome
- ✅ cpf
- ✅ certidao_uniao_tipo
- ✅ certidao_uniao_data_emissao
- ✅ certidao_uniao_hora_emissao
- ✅ certidao_uniao_validade
- ✅ certidao_uniao_codigo_controle

**Pessoa Juridica (7 campos):**
- ✅ pj_denominacao
- ✅ pj_cnpj
- ✅ pj_certidao_uniao_tipo
- ✅ pj_certidao_uniao_data_emissao
- ✅ pj_certidao_uniao_hora_emissao
- ✅ pj_certidao_uniao_validade
- ✅ pj_certidao_uniao_codigo_controle

**Status**: ✅ TODOS OS CAMPOS PRESENTES

### 3. Categorias Corretas
- pessoa_natural: ✅ 7 campos
- pessoa_juridica: ✅ 7 campos
- imovel: ✅ 0 campos (correto)
- negocio: ✅ 0 campos (correto)

**Status**: ✅ CATEGORIAS CORRETAS

### 4. Campos Extras ou Omitidos
- Campos extras no arquivo uteis: ❌ NENHUM
- Campos omitidos do mapeamento: ❌ NENHUM

**Status**: ✅ SEM DIVERGENCIAS

### 5. Validacao dos Exemplos JSON
**Exemplo 4.1 (Pessoa Fisica)**: ✅ CORRETO
**Exemplo 4.2 (Pessoa Juridica)**: ✅ CORRETO

---

## RESULTADO FINAL

✅ **APROVADO SEM RESSALVAS**

O arquivo `CND_FEDERAL.md` (campos uteis) esta 100% alinhado com o mapeamento oficial.

**Resumo**:
- Total de campos: 14 (correto)
- Categorias: Corretas
- Exemplos: Corretos
- Mapeamento reverso: Correto
- Correlacoes: Corretas
- Documentacao: Completa e clara

---

## OBSERVACOES POSITIVAS

1. Excelente explicacao sobre validade de 180 dias
2. Diferenciacao clara entre PF e PJ com prefixo `pj_`
3. Mapeamento reverso bem estruturado
4. Correlacoes com outras certidoes bem documentadas
5. Exemplos JSON claros e corretos
6. Secao de uso em minutas bem detalhada
