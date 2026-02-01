# REVISAO: CERTIDAO_NASCIMENTO (campos-uteis)

**Data**: 2026-01-30
**Status**: APROVADO COM RESSALVA

---

## PROBLEMAS ENCONTRADOS

### 1. CAMPO EXTRA: "cpf"

**Linha 267 do mapeamento_documento_campos.json** lista `cpf` como campo útil para CERTIDAO_NASCIMENTO.

**PROBLEMA**: Certidão de nascimento NÃO contém CPF (conforme campos-completos linha 249):
```
"cpf | RG (moderno), CNH, CNDT | Certidao de nascimento nao tem CPF"
```

**ARQUIVO campos-uteis CORRETO**: Não lista "cpf" (linha 68-81).

**CONCLUSÃO**: O mapeamento JSON contém um erro. O arquivo campos-uteis está correto.

---

## VERIFICAÇÃO DAS CONTAGENS

### Mapeamento Oficial (execution/mapeamento_documento_campos.json)
```json
"CERTIDAO_NASCIMENTO": {
  "pessoa_natural": [
    "nome",
    "cpf",  ← ERRO
    "data_nascimento",
    "naturalidade",
    "filiacao_pai",
    "filiacao_mae",
    "certidao_nascimento_matricula",
    "certidao_nascimento_livro",
    "certidao_nascimento_folha",
    "certidao_nascimento_termo",
    "certidao_nascimento_cartorio"
  ]
}
```
**Total no mapeamento**: 11 campos (mas 1 está errado)

### Arquivo campos-uteis/CERTIDAO_NASCIMENTO.md
**Total declarado**: 11 campos (linha 3)
**Campos listados** (linhas 69-81):
1. nome
2. data_nascimento
3. naturalidade
4. sexo
5. filiacao_pai
6. filiacao_mae
7. certidao_nascimento_livro
8. certidao_nascimento_folha
9. certidao_nascimento_termo
10. certidao_nascimento_cartorio
11. certidao_nascimento_matricula

**PROBLEMA**: O arquivo campos-uteis lista "sexo", mas o mapeamento JSON NÃO lista.

---

## ANÁLISE DOS CAMPOS

### Campos no JSON mas NÃO no campos-uteis:
- `cpf` ← Erro no JSON (certidão não tem CPF)

### Campos no campos-uteis mas NÃO no JSON:
- `sexo` ← Questionável se é útil

---

## AVALIAÇÃO DO CAMPO "sexo"

**Arquivo campos-uteis linha 74**:
```
| sexo | Sexo do registrado | "FEMININO" | Condicional |
```

**Observação linha 86**:
```
"sexo geralmente nao e usado em minutas, mas pode ser necessario em qualificacoes especificas"
```

**Arquivo campos-completos linha 109**:
```
| sexo | string | Nao | Sexo do registrado | "FEMININO" | Sempre presente em certidoes completas | Alta |
```

**CONCLUSÃO**: Campo "sexo" está presente no documento mas raramente usado. Inclusão é discutível.

---

## RECOMENDAÇÕES

1. **CORRIGIR mapeamento JSON**: Remover "cpf" de CERTIDAO_NASCIMENTO
2. **DECIDIR sobre "sexo"**:
   - Se critério = "usado em minutas" → remover do campos-uteis
   - Se critério = "pode ser útil eventualmente" → adicionar ao mapeamento JSON
3. **Alinhar contagens** após decisão

---

## RESUMO EXECUTIVO

**Arquivo campos-uteis**: BEM ESCRITO, estrutura correta, explicações claras
**Mapeamento JSON**: ERRO - contém campo "cpf" que não existe no documento
**Divergência**: Campo "sexo" em campos-uteis mas não em mapeamento

**Ação necessária**: Corrigir mapeamento JSON ou alinhar campos-uteis.
