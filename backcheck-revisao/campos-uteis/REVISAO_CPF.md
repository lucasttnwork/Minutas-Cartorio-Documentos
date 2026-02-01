# REVISAO: CPF.md (Campos Uteis)

**Data da Revisao**: 2026-01-30
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-uteis/CPF.md`
**Status**: APROVADO

---

## VERIFICACOES REALIZADAS

### 1. Total de Campos Uteis vs Mapeamento
- **Mapeamento oficial** (`execution/mapeamento_documento_campos.json`): 3 campos
- **Campos uteis documentados**: 3 campos
- **Status**: OK

### 2. Campos Listados vs Mapeamento

**Campos no mapeamento (secao CPF):**
```json
"pessoa_natural": ["nome", "cpf", "data_nascimento"]
```

**Campos documentados na secao 2.1:**
- nome
- cpf
- data_nascimento

**Status**: OK - Todos os campos do mapeamento estao listados

### 3. Categorias Corretas

**Distribuicao documentada:**
- pessoa_natural: 3 campos
- pessoa_juridica: 0 campos
- imovel: 0 campos
- negocio: 0 campos

**Distribuicao no mapeamento:**
- pessoa_natural: 3 campos
- pessoa_juridica: 0 campos
- imovel: 0 campos
- negocio: 0 campos

**Status**: OK - Categorias corretas

### 4. Campos Extras ou Omitidos
- **Campos extras**: Nenhum
- **Campos omitidos**: Nenhum
- **Status**: OK

### 5. Validacao com Guia de Campos

Conferido com `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`:
- nome: Campo #1 - OK
- cpf: Campo #2 - OK
- data_nascimento: Campo #9 - OK

**Status**: OK - Todos os campos existem no guia oficial

---

## MAPEAMENTO REVERSO (SECAO 3)

**Conforme documentado:**
| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_completo | nome | pessoa_natural |
| numero_cpf | cpf | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |

**Observacao**: O mapeamento reverso esta correto. O documento de schema original usa `nome_completo` e `numero_cpf`, que sao corretamente mapeados para os campos uteis `nome` e `cpf`.

**Status**: OK

---

## EXEMPLO JSON (SECAO 4)

O exemplo simplificado reflete corretamente os 3 campos uteis:
```json
{
  "pessoa_natural": {
    "nome": "JOSE DA SILVA",
    "cpf": "123.456.789-00",
    "data_nascimento": "15/03/1980"
  }
}
```

**Status**: OK

---

## CORRELACAO (SECAO 6)

Documento indica que CPF e util em 17 documentos diferentes. Confirmando no mapeamento JSON:

**Documentos que incluem `cpf` em pessoa_natural:**
1. RG
2. CNH
3. CPF
4. CERTIDAO_NASCIMENTO
5. CERTIDAO_CASAMENTO
6. CERTIDAO_OBITO
7. COMPROVANTE_RESIDENCIA
8. CNDT
9. CND_FEDERAL
10. CND_ESTADUAL
11. CND_MUNICIPAL
12. MATRICULA_IMOVEL
13. ITBI
14. IPTU
15. ESCRITURA
16. COMPROMISSO_COMPRA_VENDA
17. PROCURACAO
18. COMPROVANTE_PAGAMENTO

**Total**: 18 documentos (nao 17 como indicado)

**Status**: DISCREPANCIA MENOR - O documento afirma 17, mas o mapeamento mostra 18 documentos

---

## PROBLEMAS ENCONTRADOS

### PROBLEMA 1: Contagem de documentos com CPF

**Secao**: 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

**Problema**: O documento afirma que `cpf` e util em "17 docs", mas o mapeamento JSON mostra 18 documentos.

**Localizacao**: Linha 114, tabela de correlacao

**Sugestao**: Atualizar para "18 docs" ou verificar se algum documento nao deveria incluir CPF

---

## CONCLUSAO

O arquivo `CPF.md` esta **quase perfeito** com apenas uma discrepancia menor na contagem de documentos correlacionados.

**Conformidade Geral**: 99%
**Necessita Correcao**: Sim (menor)
**Aprovado para Uso**: Sim (com ressalva)
