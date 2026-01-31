# CND_FEDERAL - Certidao Negativa de Debitos Federais (Campos Uteis)

**Total de Campos Uteis**: 14 campos
**Categorias**: Pessoa Natural (7), Pessoa Juridica (7), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 14 campos (este arquivo)
- Campos Completos: ~12 campos raiz + validacoes (ver `campos-completos/CND_FEDERAL.md`)

A CND Federal e fonte primaria para comprovacao de regularidade fiscal perante a Uniao, podendo ser emitida tanto para **Pessoa Fisica (CPF)** quanto para **Pessoa Juridica (CNPJ)**. A certidao e documento obrigatorio para lavratura de escrituras publicas.

**IMPORTANTE - Validade da Certidao:**
A CND Federal possui validade de **180 dias** a partir da emissao. A certidao deve estar vigente na data da lavratura da escritura. O sistema deve sempre verificar se `data_validade` e posterior a data atual.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (7 campos)

Campos mapeados quando a CND Federal e de uma **pessoa fisica (CPF)**.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome completo do contribuinte | "JOAO DA SILVA" | SIM (validacao) |
| CPF | CPF do contribuinte | "123.456.789-00" | SIM (validacao) |
| TIPO | Tipo da certidao | "NEGATIVA" ou "POSITIVA COM EFEITOS DE NEGATIVA" | SIM |
| DATA DE EMISSAO | Data de emissao | "27/01/2026" | SIM |
| HORA DE EMISSAO | Hora de emissao | "10:30:45" | Condicional |
| VALIDADE | Data de validade (180 dias) | "26/07/2026" | SIM |
| CODIGO DE CONTROLE | Codigo para verificacao online | "ABCD.1234.EFGH.5678" | Condicional |

**Notas:**
- Os campos `nome` e `cpf` sao usados apenas para **validacao/correlacao**, nao vao para a minuta
- Os campos de certidao (`certidao_uniao_*`) sao usados na minuta como comprovacao de regularidade fiscal
- A `certidao_uniao_validade` deve ser verificada na data da escritura
- Tipo "POSITIVA COM EFEITOS DE NEGATIVA" indica debitos com exigibilidade suspensa (parcelamento, recurso, etc.)

---

### 2.2 Pessoa Juridica (7 campos)

Campos mapeados quando a CND Federal e de uma **pessoa juridica (CNPJ)**.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social da empresa | "EMPRESA EXEMPLO LTDA" | SIM (validacao) |
| CNPJ | CNPJ da empresa | "12.345.678/0001-90" | SIM (validacao) |
| TIPO | Tipo da certidao | "NEGATIVA" ou "POSITIVA COM EFEITOS DE NEGATIVA" | SIM |
| DATA DE EMISSAO | Data de emissao | "27/01/2026" | SIM |
| HORA DE EMISSAO | Hora de emissao | "14:22:10" | Condicional |
| VALIDADE | Data de validade (180 dias) | "26/07/2026" | SIM |
| CODIGO DE CONTROLE | Codigo para verificacao online | "WXYZ.9876.ABCD.5432" | Condicional |

**Notas:**
- Os campos `pj_denominacao` e `pj_cnpj` sao usados apenas para **validacao/correlacao**
- A identificacao PF vs PJ e feita pela presenca de `cpf` ou `cnpj` no documento
- Todos os campos de PJ possuem prefixo `pj_` para diferenciacao

---

### 2.3-2.4 Outras Categorias

A CND Federal **nao alimenta** campos de Imovel ou Negocio Juridico.

A certidao e vinculada a **pessoa** (fisica ou juridica), nao ao imovel objeto da transacao. Para certidoes vinculadas ao imovel, deve-se utilizar a CND_MUNICIPAL (tributos imobiliarios como IPTU).

---

## 3. MAPEAMENTO REVERSO

### 3.1 Pessoa Natural

| Campo no Documento | Campo Util Mapeado | Categoria |
|--------------------|-------------------|-----------|
| nome_contribuinte | nome | pessoa_natural |
| cpf | cpf | pessoa_natural |
| situacao | certidao_uniao_tipo | pessoa_natural |
| data_emissao | certidao_uniao_data_emissao | pessoa_natural |
| hora_emissao | certidao_uniao_hora_emissao | pessoa_natural |
| data_validade | certidao_uniao_validade | pessoa_natural |
| codigo_controle | certidao_uniao_codigo_controle | pessoa_natural |

### 3.2 Pessoa Juridica

| Campo no Documento | Campo Util Mapeado | Categoria |
|--------------------|-------------------|-----------|
| nome_contribuinte | pj_denominacao | pessoa_juridica |
| cnpj | pj_cnpj | pessoa_juridica |
| situacao | pj_certidao_uniao_tipo | pessoa_juridica |
| data_emissao | pj_certidao_uniao_data_emissao | pessoa_juridica |
| hora_emissao | pj_certidao_uniao_hora_emissao | pessoa_juridica |
| data_validade | pj_certidao_uniao_validade | pessoa_juridica |
| codigo_controle | pj_certidao_uniao_codigo_controle | pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

### 4.1 Pessoa Fisica

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "certidao_uniao_tipo": "NEGATIVA",
    "certidao_uniao_data_emissao": "27/01/2026",
    "certidao_uniao_hora_emissao": "10:30:45",
    "certidao_uniao_validade": "26/07/2026",
    "certidao_uniao_codigo_controle": "ABCD.1234.EFGH.5678"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

### 4.2 Pessoa Juridica

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {
    "pj_denominacao": "EMPRESA EXEMPLO LTDA",
    "pj_cnpj": "12.345.678/0001-90",
    "pj_certidao_uniao_tipo": "POSITIVA COM EFEITOS DE NEGATIVA",
    "pj_certidao_uniao_data_emissao": "27/01/2026",
    "pj_certidao_uniao_hora_emissao": "14:22:10",
    "pj_certidao_uniao_validade": "26/07/2026",
    "pj_certidao_uniao_codigo_controle": "WXYZ.9876.ABCD.5432"
  },
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Comprovacao de Regularidade Fiscal Federal

A CND Federal e utilizada nas minutas para:

- **Referencia na escritura**: Mencionar que foi apresentada certidao negativa de debitos federais
- **Tipo da certidao**: Indicar se e CND (negativa) ou CPDEN (positiva com efeitos de negativa)
- **Validade**: Confirmar que a certidao estava vigente na data da lavratura
- **Codigo de controle**: Permitir verificacao posterior da autenticidade

### 5.2 Exemplo de Uso em Minuta

```
"...o(a) OUTORGANTE(S) VENDEDOR(ES) apresentou(aram) Certidao [NEGATIVA/POSITIVA COM EFEITOS DE NEGATIVA]
de Debitos relativos a Creditos Tributarios Federais e a Divida Ativa da Uniao, emitida em [DATA_EMISSAO],
valida ate [DATA_VALIDADE], codigo de controle [CODIGO_CONTROLE]..."
```

### 5.3 Situacoes Possiveis

| Tipo | Significado | Tratamento na Minuta |
|------|-------------|---------------------|
| NEGATIVA | Sem debitos fiscais federais | Transacao prossegue normalmente |
| POSITIVA COM EFEITOS DE NEGATIVA | Debitos com exigibilidade suspensa | Transacao prossegue; mencionar na minuta |
| POSITIVA | Debitos exigiveis pendentes | Transacao pode ser bloqueada |

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

### 6.1 Campos Compartilhados

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome/pj_denominacao | RG, CNH, CONTRATO_SOCIAL, CNDT | Identificar titular |
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, IPTU | Correlacionar pessoa fisica |
| cnpj | CONTRATO_SOCIAL, CND_ESTADUAL, CND_MUNICIPAL, CNDT | Correlacionar pessoa juridica |

### 6.2 Certidoes Correlatas (Conjunto Obrigatorio para Escrituras)

| Certidao | Orgao Emissor | O que Comprova | Vinculada a |
|----------|---------------|----------------|-------------|
| **CND Federal** | RFB / PGFN | Regularidade com tributos federais | Pessoa (CPF/CNPJ) |
| CND Estadual | SEFAZ | Regularidade com tributos estaduais | Pessoa (CPF/CNPJ) |
| CND Municipal | Prefeitura | Regularidade com tributos imobiliarios | Imovel (SQL) |
| CNDT | TST | Inexistencia de debitos trabalhistas | Pessoa (CPF/CNPJ) |

### 6.3 Hierarquia de Fontes para Identificacao

A CND Federal **NAO** e fonte primaria para identificacao pessoal:
1. **RG/CNH** - Fonte primaria de identificacao pessoal
2. **CONTRATO_SOCIAL** - Fonte primaria para identificacao de PJ
3. **CND Federal** - Fonte secundaria (apenas para validacao fiscal)

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

### 7.1 Para Pessoa Natural

Campos de pessoa_natural que NAO vem da CND Federal:
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg`: Obter de RG
- `data_nascimento`, `naturalidade`: Obter de RG, CERTIDAO_NASCIMENTO
- `profissao`, `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `cndt_*`: Obter de CNDT
- `certidao_estadual_*`: Obter de CND_ESTADUAL
- `certidao_municipal_*`: Obter de CND_MUNICIPAL

### 7.2 Para Pessoa Juridica

Campos de pessoa_juridica que NAO vem da CND Federal:
- `pj_tipo_societario`, `pj_capital_social`: Obter de CONTRATO_SOCIAL
- `pj_data_constituicao`, `pj_nire`: Obter de CONTRATO_SOCIAL
- `pj_endereco_*`: Obter de CONTRATO_SOCIAL
- `pj_socios[]`: Obter de CONTRATO_SOCIAL
- `pj_cndt_*`: Obter de CNDT

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia PF: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Guia PJ: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- Campos Completos: `campos-completos/CND_FEDERAL.md`
- Site RFB (emissao): https://solucoes.receita.fazenda.gov.br/servicos/certidaointernet/
- Portaria Conjunta RFB/PGFN 1.751/2014
