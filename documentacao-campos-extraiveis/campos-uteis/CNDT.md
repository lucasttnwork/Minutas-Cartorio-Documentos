# CNDT - Certidao Negativa de Debitos Trabalhistas (Campos Uteis)

**Total de Campos Uteis**: 10 campos
**Categorias**: Pessoa Natural (5), Pessoa Juridica (5), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CNDT e uma das certidoes obrigatorias para escrituras, comprovando que o alienante nao possui debitos trabalhistas.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do titular | "JOAO DA SILVA" | SIM |
| CPF | CPF do titular | "123.456.789-00" | SIM |
| NUMERO DA CNDT | Numero da certidao | "12345678901234567890" | SIM |
| DATA DE EXPEDICAO DA CNDT | Data de emissao | "27/01/2026" | SIM |
| HORA DE EXPEDICAO DA CNDT | Hora de emissao | "10:30:45" | SIM |

### 2.2 Pessoa Juridica (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| CNPJ | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |
| NUMERO DA CNDT | Numero da certidao PJ | "98765432109876543210" | SIM (se PJ) |
| DATA DE EXPEDICAO DA CNDT | Data de emissao PJ | "27/01/2026" | SIM (se PJ) |
| HORA DE EXPEDICAO DA CNDT | Hora de emissao PJ | "11:15:30" | SIM (se PJ) |

### 2.3-2.4 Imovel e Negocio

A CNDT nao alimenta campos de imovel ou negocio juridico.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_pessoa | nome / pj_denominacao | pessoa_natural / pessoa_juridica |
| cpf | cpf | pessoa_natural |
| cnpj | pj_cnpj | pessoa_juridica |
| numero_certidao | cndt_numero / pj_cndt_numero | pessoa_natural / pessoa_juridica |
| data_expedicao | cndt_data_expedicao / pj_cndt_data_expedicao | pessoa_natural / pessoa_juridica |
| hora_expedicao | cndt_hora_expedicao / pj_cndt_hora_expedicao | pessoa_natural / pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

### Pessoa Fisica

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "cndt_numero": "12345678901234567890",
    "cndt_data_expedicao": "27/01/2026",
    "cndt_hora_expedicao": "10:30:45"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

### Pessoa Juridica

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {
    "pj_denominacao": "XYZ EMPREENDIMENTOS LTDA",
    "pj_cnpj": "12.345.678/0001-90",
    "pj_cndt_numero": "98765432109876543210",
    "pj_cndt_data_expedicao": "27/01/2026",
    "pj_cndt_hora_expedicao": "11:15:30"
  },
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Referencia na Escritura
- `cndt_numero` -> Citado na escritura como certidao apresentada
- `cndt_data_expedicao` -> Data de emissao para verificar validade (180 dias)

### 5.2 Validacao
- CPF/CNPJ deve corresponder ao alienante
- Certidao deve estar dentro da validade na data da escritura
- Status deve ser "NADA CONSTA" (extraido mas nao mapeado)

### 5.3 Conjunto de Certidoes Obrigatorias

| Certidao | Fonte | Campos Mapeados |
|----------|-------|-----------------|
| CNDT | TST | cndt_* / pj_cndt_* |
| CND Federal | Receita/PGFN | certidao_uniao_* / pj_certidao_uniao_* |
| CND Estadual | Sefaz | (nao mapeados especificos) |
| CND Municipal | Prefeitura | imovel_cnd_iptu_* |

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_CASAMENTO, etc. (20 docs) | Correlacionar com alienante |
| cpf | RG, CNH, CERTIDAO_CASAMENTO, etc. (17 docs) | Identificar pessoa |
| pj_denominacao | CONTRATO_SOCIAL, CND_FEDERAL (11 docs) | Identificar empresa |
| pj_cnpj | CONTRATO_SOCIAL, CND_FEDERAL (11 docs) | Identificar empresa |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

A CNDT fornece apenas dados de identificacao e da propria certidao. Para qualificacao completa:

### Pessoa Natural
- `rg`, `data_nascimento`, `filiacao_*`: Obter de RG
- `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `profissao`, `domicilio_*`: Obter de ESCRITURA, COMPROVANTE_RESIDENCIA
- `certidao_uniao_*`: Obter de CND_FEDERAL

### Pessoa Juridica
- `pj_sede_*`: Obter de CONTRATO_SOCIAL
- `pj_admin_*`: Obter de CONTRATO_SOCIAL
- `pj_certidao_uniao_*`: Obter de CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guias: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md` e `campos-pessoa-juridica.md`
- Campos Completos: `campos-completos/CNDT.md`
- Site TST: https://www.tst.jus.br/certidao
