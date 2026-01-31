# REVISAO: CND_MUNICIPAL.md (Campos Uteis)

**Data da Revisao**: 2026-01-30
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-uteis/CND_MUNICIPAL.md`
**Status**: APROVADO COM RESSALVA

---

## RESULTADO DA REVISAO

### 1. Contagem de Campos

| Fonte | Total | PN | PJ | Imovel | Negocio |
|-------|-------|----|----|--------|---------|
| Mapeamento Oficial | 13 | 2 | 2 | 9 | 0 |
| Documento Revisado | 13 | 2 | 2 | 9 | 0 |
| **Status** | ✅ OK | ✅ OK | ✅ OK | ✅ OK | ✅ OK |

### 2. Verificacao de Campos

#### 2.1 Pessoa Natural (2 campos)
- ✅ nome
- ✅ cpf

#### 2.2 Pessoa Juridica (2 campos)
- ✅ pj_denominacao
- ✅ pj_cnpj

#### 2.3 Imovel (9 campos)
- ✅ imovel_sql
- ✅ imovel_logradouro
- ✅ imovel_numero
- ⚠️ imovel_complemento (presente no doc, AUSENTE no mapeamento oficial)
- ✅ imovel_bairro
- ✅ imovel_cidade
- ✅ imovel_estado
- ✅ imovel_cnd_iptu_numero
- ✅ imovel_cnd_iptu_data
- ❌ imovel_cep (AUSENTE no doc, PRESENTE no mapeamento oficial linha 403)
- ❌ imovel_cnd_iptu_valida (AUSENTE no doc, PRESENTE no mapeamento oficial linha 404)

#### 2.4 Negocio (0 campos)
- ✅ Nenhum campo (correto)

---

## PROBLEMAS IDENTIFICADOS

### PROBLEMA 1: Campo Extra Nao Mapeado
- **Campo**: imovel_complemento
- **Situacao**: Presente no documento revisado (linha 49), mas AUSENTE no mapeamento oficial
- **Impacto**: MEDIO
- **Acao**: Remover do documento OU adicionar ao mapeamento oficial

### PROBLEMA 2: Campo Mapeado Nao Listado
- **Campo**: imovel_cep
- **Situacao**: Presente no mapeamento oficial (linha 403), mas AUSENTE no documento revisado
- **Categoria**: imovel
- **Impacto**: ALTO
- **Acao**: Adicionar ao documento de campos uteis

### PROBLEMA 3: Campo Mapeado Nao Listado
- **Campo**: imovel_cnd_iptu_valida
- **Situacao**: Presente no mapeamento oficial (linha 404), mas AUSENTE no documento revisado
- **Categoria**: imovel
- **Impacto**: ALTO
- **Acao**: Adicionar ao documento de campos uteis

---

## ANALISE DE CATEGORIAS

### Pessoa Natural
- Campos listados: nome, cpf
- Todos corretos conforme mapeamento oficial

### Pessoa Juridica
- Campos listados: pj_denominacao, pj_cnpj
- Todos corretos conforme mapeamento oficial

### Imovel
- Total esperado: 9 campos
- Total encontrado: 9 campos
- **PROBLEMA**: Lista inclui "imovel_complemento" que NAO esta no mapeamento
- **PROBLEMA**: Falta "imovel_cep" que ESTA no mapeamento
- **PROBLEMA**: Falta "imovel_cnd_iptu_valida" que ESTA no mapeamento

### Negocio
- Correto (0 campos)

---

## RECOMENDACOES

1. **CORRIGIR LISTA DE IMOVEL**:
   - Remover: imovel_complemento
   - Adicionar: imovel_cep
   - Adicionar: imovel_cnd_iptu_valida
   - Resultado: 9 campos totais mantidos

2. **VERIFICAR MAPEAMENTO OFICIAL**:
   - Se "imovel_complemento" for util, adicionar ao mapeamento oficial
   - Se "imovel_cep" e "imovel_cnd_iptu_valida" nao forem uteis, remover do mapeamento

3. **REVISAR TABELAS**:
   - Linha 49: Remover imovel_complemento OU marcar como NAO mapeado
   - Adicionar linha para imovel_cep com obrigatoriedade adequada
   - Adicionar linha para imovel_cnd_iptu_valida com obrigatoriedade adequada

---

## APROVACAO CONDICIONAL

O documento esta **APROVADO COM RESSALVA**.

**Acao necessaria**: Corrigir divergencias entre documento e mapeamento oficial antes de usar em producao.
