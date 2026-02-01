# REVISAO: COMPROVANTE_PAGAMENTO - Campos Uteis

**Data da Revisao**: 2026-01-30
**Revisor**: Sistema Automatizado
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-uteis/COMPROVANTE_PAGAMENTO.md`

---

## STATUS: PROBLEMAS ENCONTRADOS

### PROBLEMA 1: DIVERGENCIA NO TOTAL DE CAMPOS UTEIS

**Declarado no documento**: 14 campos
**Mapeamento oficial**: 14 campos
**Status**: ✅ CORRETO

---

### PROBLEMA 2: CAMPOS DA CATEGORIA NEGOCIO NAO BATEM

**Campos listados no documento uteis (10 campos)**:
1. pagamento_valor
2. pagamento_data
3. pagamento_tipo
4. pagamento_modo
5. pagamento_banco_origem
6. pagamento_conta_origem (conta + agencia combinados)
7. pagamento_banco_destino
8. pagamento_conta_destino (conta + agencia combinados)
9. pagamento_codigo_autenticacao
10. pagamento_descricao

**Campos no mapeamento oficial (10 campos)**:
1. negocio_valor_total
2. pagamento_tipo
3. pagamento_modo
4. pagamento_data
5. pagamento_banco_origem
6. pagamento_agencia_origem
7. pagamento_conta_origem
8. pagamento_banco_destino
9. pagamento_agencia_destino
10. pagamento_conta_destino

**Divergencias identificadas**:

❌ **CAMPO AUSENTE**: `negocio_valor_total` - presente no mapeamento, mas documentado como `pagamento_valor`
❌ **CAMPO EXTRA**: `pagamento_codigo_autenticacao` - listado no documento, mas NAO esta no mapeamento
❌ **CAMPO EXTRA**: `pagamento_descricao` - listado no documento, mas NAO esta no mapeamento
❌ **CAMPOS FALTANTES**: `pagamento_agencia_origem` e `pagamento_agencia_destino` - presentes no mapeamento, mas nao listados separadamente (parecem ter sido combinados com conta)

---

### PROBLEMA 3: MAPEAMENTO REVERSO INCORRETO

**Secao 4 do documento** lista mapeamento reverso com campos que NAO estao no mapeamento oficial:

- `pagamento_codigo_autenticacao` <- NAO ESTA NO MAPEAMENTO
- `pagamento_descricao` <- NAO ESTA NO MAPEAMENTO
- `pagamento_valor` <- deveria ser `negocio_valor_total`

---

### PROBLEMA 4: EXEMPLOS JSON UTILIZAM CAMPOS INCORRETOS

**Secao 5 (Exemplos)** usa:
- `pagamento_valor` ao inves de `negocio_valor_total`
- `pagamento_codigo_autenticacao` (nao mapeado)
- `pagamento_descricao` (nao mapeado)

---

## RECOMENDACOES

### CORRECOES OBRIGATORIAS:

1. **Substituir** `pagamento_valor` por `negocio_valor_total` em todo o documento
2. **Remover** `pagamento_codigo_autenticacao` da lista de campos uteis
3. **Remover** `pagamento_descricao` da lista de campos uteis
4. **Separar** as contas e agencias nos exemplos:
   - `pagamento_conta_origem` → apenas numero da conta
   - `pagamento_agencia_origem` → apenas agencia
   - `pagamento_conta_destino` → apenas numero da conta
   - `pagamento_agencia_destino` → apenas agencia

5. **Atualizar secao 3.3** com a lista correta:
   - negocio_valor_total (nao pagamento_valor)
   - pagamento_data
   - pagamento_tipo
   - pagamento_modo
   - pagamento_banco_origem
   - pagamento_agencia_origem
   - pagamento_conta_origem
   - pagamento_banco_destino
   - pagamento_agencia_destino
   - pagamento_conta_destino

6. **Atualizar Mapeamento Reverso (Secao 4)** removendo campos nao mapeados

7. **Corrigir todos os exemplos JSON** nas secoes 5 e 6

---

## VERIFICACAO FINAL

- ✅ Total de campos: 14 (correto)
- ✅ Categorias: pessoa_natural (2), pessoa_juridica (2), negocio (10) - correto
- ❌ Campos listados: contém 2 campos extras e nome incorreto para 1 campo
- ❌ Nenhum campo foi omitido, mas alguns estao incorretos ou extras

---

## CAMPOS CORRETOS CONFIRMADOS

### Pessoa Natural (2) - ✅ CORRETO
- nome
- cpf

### Pessoa Juridica (2) - ✅ CORRETO
- pj_denominacao
- pj_cnpj

### Negocio (10) - ❌ NECESSITA CORRECAO
**Deve ser**:
1. negocio_valor_total (nao pagamento_valor)
2. pagamento_tipo
3. pagamento_modo
4. pagamento_data
5. pagamento_banco_origem
6. pagamento_agencia_origem (separado, nao junto com conta)
7. pagamento_conta_origem (separado, nao junto com agencia)
8. pagamento_banco_destino
9. pagamento_agencia_destino (separado, nao junto com conta)
10. pagamento_conta_destino (separado, nao junto com agencia)

---

## CONCLUSAO

O documento esta QUASE correto, mas tem **divergencias importantes**:
- Nome do campo de valor esta incorreto
- Dois campos extras foram adicionados que nao estao no mapeamento
- Contas e agencias devem ser separadas

**Acao requerida**: CORRIGIR conforme recomendacoes acima.
