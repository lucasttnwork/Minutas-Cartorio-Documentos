# REVISAO: IPTU.md (Campos Uteis)

**Data da Revisao**: 2026-01-30
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-uteis/IPTU.md`
**Status**: PROBLEMA ENCONTRADO - DISCREPANCIA NO COMPLEMENTO

---

## RESULTADO DA REVISAO

### 1. CONTAGEM DE CAMPOS

| Categoria | Esperado (Mapeamento) | Encontrado (Doc) | Status |
|-----------|----------------------|------------------|--------|
| pessoa_natural | 2 | 2 | OK |
| pessoa_juridica | 0 | 0 | OK |
| imovel | 11 | 11 | OK |
| negocio | 0 | 0 | OK |
| **TOTAL** | **13** | **13** | OK |

### 2. VERIFICACAO CAMPO A CAMPO

#### 2.1 Pessoa Natural (2 campos)

| Campo Mapeamento | Presente no Doc? | Categoria Correta? |
|------------------|------------------|--------------------|
| nome | SIM | SIM |
| cpf | SIM | SIM |

#### 2.2 Imovel (11 campos)

| Campo Mapeamento | Presente no Doc? | Categoria Correta? |
|------------------|------------------|--------------------|
| matricula_numero | SIM | SIM |
| imovel_sql | SIM | SIM |
| imovel_logradouro | SIM | SIM |
| imovel_numero | SIM | SIM |
| imovel_complemento | SIM | SIM |
| imovel_bairro | SIM | SIM |
| imovel_cidade | SIM | SIM |
| imovel_estado | SIM | SIM |
| imovel_cep | SIM | SIM |
| imovel_area_total | SIM | SIM |
| imovel_area_construida | SIM | SIM |
| imovel_valor_venal_iptu | SIM | SIM |

### 3. PROBLEMAS ENCONTRADOS

**PROBLEMA 1: CAMPO imovel_complemento FORA DO MAPEAMENTO**

O mapeamento oficial (`execution/mapeamento_documento_campos.json` linha 571-590) **NAO INCLUI** o campo `imovel_complemento` para o documento IPTU.

**Mapeamento oficial do IPTU:**
```json
"IPTU": {
  "pessoa_natural": ["nome", "cpf"],
  "pessoa_juridica": [],
  "imovel": [
    "matricula_numero",
    "imovel_sql",
    "imovel_valor_venal_iptu",
    "imovel_logradouro",
    "imovel_numero",
    "imovel_bairro",
    "imovel_cidade",
    "imovel_estado",
    "imovel_cep",
    "imovel_area_total",
    "imovel_area_construida"
  ],
  "negocio": []
}
```

**Documento campos-uteis/IPTU.md linha 42:**
Lista `imovel_complemento` como campo util (linha 42 da tabela).

**Contagem corrigida:**
- Esperado: 11 campos (conforme mapeamento)
- Encontrado no documento: 12 campos (inclui complemento indevidamente)

### 4. ACAO REQUERIDA

**Remover** a linha 42 do arquivo `campos-uteis/IPTU.md`:
```
| imovel_complemento | Complemento (apto, bloco) | "APTO 124 BL-B" | Condicional |
```

**Atualizar** a linha 3 do arquivo:
```
**Total de Campos Uteis**: 12 campos
```
Para:
```
**Total de Campos Uteis**: 11 campos
```

**Atualizar** a linha 4 do arquivo:
```
**Categorias**: Pessoa Natural (2), Imovel (11)
```
(ja esta correto)

### 5. VERIFICACOES OK

- Nenhum campo do mapeamento foi omitido (exceto complemento que nao deveria estar)
- Nenhum campo extra foi adicionado (exceto complemento)
- Todas as categorias estao corretas
- Todas as descricoes estao alinhadas

---

## CONCLUSAO

O arquivo `campos-uteis/IPTU.md` contem **12 campos** mas o mapeamento oficial define apenas **11 campos uteis**.

O campo `imovel_complemento` foi incluido indevidamente e deve ser removido para conformidade com o mapeamento.
