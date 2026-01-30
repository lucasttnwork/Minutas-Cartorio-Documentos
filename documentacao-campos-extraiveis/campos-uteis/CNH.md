# CNH - Carteira Nacional de Habilitacao (Campos Uteis)

**Total de Campos Uteis**: 10 campos
**Categorias**: Pessoa Natural (10), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CNH e alternativa ao RG para identificacao pessoal, sendo a fonte primaria para o numero da CNH e tambem extraindo RG e CPF.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome completo | "MARIA DA SILVA" | SIM |
| cpf | CPF | "123.456.789-00" | SIM |
| rg | RG (impresso na CNH) | "12.345.678-9" | SIM |
| orgao_emissor_rg | Orgao emissor RG | "SSP" | SIM |
| estado_emissor_rg | UF do RG | "SP" | SIM |
| cnh | Numero da CNH | "12345678901" | SIM |
| orgao_emissor_cnh | DETRAN emissor | "DETRAN-SP" | SIM |
| data_nascimento | Data de nascimento | "10/05/1985" | SIM |
| filiacao_pai | Nome do pai | "JOSE DA SILVA" | Condicional |
| filiacao_mae | Nome da mae | "ANA DA SILVA" | SIM |

**Notas:**
- A CNH contem tanto o numero da CNH quanto o RG
- O campo orgao_emissor_cnh e formado por "DETRAN-" + UF
- Filiacao paterna pode estar omitida em alguns casos

---

### 2.2-2.4 Outras Categorias

A CNH nao alimenta campos de Pessoa Juridica, Imovel ou Negocio Juridico.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_completo | nome | pessoa_natural |
| cpf | cpf | pessoa_natural |
| rg | rg | pessoa_natural |
| orgao_rg | orgao_emissor_rg | pessoa_natural |
| uf_rg | estado_emissor_rg | pessoa_natural |
| numero_registro | cnh | pessoa_natural |
| "DETRAN-" + uf_emissor | orgao_emissor_cnh | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |
| filiacao_pai | filiacao_pai | pessoa_natural |
| filiacao_mae | filiacao_mae | pessoa_natural |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "MARIA DA SILVA",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "orgao_emissor_rg": "SSP",
    "estado_emissor_rg": "SP",
    "cnh": "12345678901",
    "orgao_emissor_cnh": "DETRAN-SP",
    "data_nascimento": "10/05/1985",
    "filiacao_pai": "JOSE DA SILVA",
    "filiacao_mae": "ANA DA SILVA"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao das Partes
- `nome` -> Nome completo na qualificacao
- `cpf` -> CPF na qualificacao
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg` -> RG formatado (ex: "12.345.678-9 SSP-SP")

### 5.2 Documento Alternativo ao RG
A CNH pode ser usada como identificacao quando o RG nao esta disponivel.

### 5.3 Uso do Numero da CNH
Em alguns casos, a CNH pode ser citada como documento adicional de identificacao na minuta.

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CERTIDAO_CASAMENTO, CNDT, etc. (20 docs) | Identificar pessoa |
| cpf | RG, CERTIDAO_CASAMENTO, CNDT, etc. (17 docs) | Identificar pessoa |
| rg | RG, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL (8 docs) | Identificar pessoa |
| data_nascimento | RG, CERTIDAO_NASCIMENTO (7 docs) | Validar idade |
| filiacao_* | RG, CERTIDAO_NASCIMENTO | Confirmar identidade |

### 6.1 Hierarquia de Fontes
1. **RG**: Fonte primaria para numero do RG
2. **CNH**: Fonte primaria para numero da CNH, secundaria para RG

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem da CNH:
- `data_emissao_rg`: Obter de RG
- `naturalidade`: Obter de RG, CERTIDAO_NASCIMENTO
- `profissao`: Obter de CERTIDAO_CASAMENTO, ESCRITURA
- `estado_civil`: Obter de CERTIDAO_CASAMENTO
- `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- Campos de certidoes: Obter de CNDT, CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CNH.md`
