# CND_ESTADUAL - Certidao Negativa de Debitos Estaduais (Campos Uteis)

**Total de Campos Uteis**: 4 campos
**Categorias**: Pessoa Natural (2), Pessoa Juridica (2), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 4 campos (este arquivo)
- Campos Completos: ~15 campos (ver `campos-completos/CND_ESTADUAL.md`)

A CND Estadual e usada principalmente para **validacao de regularidade fiscal estadual** das partes. Os campos de identificacao (nome/CPF/CNPJ) servem para correlacionar a certidao com o alienante da transacao.

**Importante**: A CND Estadual possui muitos campos extraiveis (numero, validade, situacao, codigo verificacao, etc.), mas para efeito de mapeamento em minutas, apenas os dados de identificacao do contribuinte sao utilizados.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome do contribuinte | "JOAO DA SILVA" | SIM |
| cpf | CPF do contribuinte | "123.456.789-00" | SIM |

**Notas:**
- Estes campos sao usados para validacao, nao para composicao da minuta
- O CPF permite correlacionar a certidao com o vendedor/alienante
- O nome confirma a identidade do contribuinte

---

### 2.2 Pessoa Juridica (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social da empresa | "EMPRESA EXEMPLO LTDA" | SIM |
| pj_cnpj | CNPJ da empresa | "12.345.678/0001-90" | SIM |

**Notas:**
- Usados quando a CND e de pessoa juridica (vendedor empresa)
- O CNPJ permite correlacionar a certidao com a empresa vendedora
- A identificacao entre PF e PJ e feita pela presenca de CPF ou CNPJ

---

### 2.3-2.4 Outras Categorias

A CND Estadual **nao alimenta** campos de Imovel ou Negocio Juridico.

A certidao e vinculada a **pessoa** (fisica ou juridica), nao ao imovel objeto da transacao. Para certidoes vinculadas ao imovel, utiliza-se a CND_MUNICIPAL (tributos imobiliarios como IPTU).

---

## 3. MAPEAMENTO REVERSO

| Campo no Documento | Campo Util Mapeado | Categoria |
|--------------------|-------------------|-----------|
| nome_contribuinte | nome | pessoa_natural |
| cpf | cpf | pessoa_natural |
| nome_contribuinte (se PJ) | pj_denominacao | pessoa_juridica |
| cnpj | pj_cnpj | pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

### 4.1 Pessoa Fisica

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00"
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
    "pj_cnpj": "12.345.678/0001-90"
  },
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Comprovacao de Regularidade Fiscal Estadual

A CND Estadual e utilizada para:
- **Validar regularidade** do alienante perante tributos estaduais (ICMS, IPVA, ITCD)
- **Correlacionar** a certidao com o vendedor da transacao (via CPF/CNPJ)
- **Documentar diligencia fiscal** na escritura

### 5.2 Verificacao Cruzada

Os campos `nome` e `cpf`/`cnpj` sao usados para:
- Confirmar que a certidao pertence ao alienante correto
- Comparar com dados de outros documentos da mesma pessoa
- Alertar inconsistencias se certidao for de pessoa diferente

### 5.3 Mencao em Escritura

Embora os campos de identificacao sejam os unicos mapeados, a minuta pode referenciar:
- Numero da certidao
- Data de emissao
- Situacao (NEGATIVA ou CPDEN)

Esses dados sao extraidos do documento completo mas nao fazem parte do schema de campos uteis.

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_CASAMENTO, CND_FEDERAL, CND_MUNICIPAL, CNDT | Identificar pessoa |
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CND_FEDERAL, CND_MUNICIPAL, CNDT | Identificar pessoa |
| pj_denominacao | CONTRATO_SOCIAL, CND_FEDERAL, CND_MUNICIPAL, CNDT | Identificar empresa |
| pj_cnpj | CONTRATO_SOCIAL, CND_FEDERAL, CND_MUNICIPAL, CNDT | Identificar empresa |

### 6.1 Conjunto de Certidoes Fiscais

A CND Estadual faz parte do conjunto de comprovacao de regularidade fiscal:

| Certidao | Esfera | Tributos Principais | Vinculacao |
|----------|--------|--------------------| -----------|
| CND Federal | Federal | IR, CSLL, PIS, COFINS, INSS | Pessoa (CPF/CNPJ) |
| **CND Estadual** | Estadual | ICMS, IPVA, ITCD | Pessoa (CPF/CNPJ) |
| CND Municipal | Municipal | IPTU, ISS, taxas | Imovel (SQL) |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

A CND Estadual possui muitos campos extraiveis que **nao sao mapeados** para o schema de minutas:

### 7.1 Campos Extraiveis Nao Mapeados

| Campo no Documento | Motivo da Exclusao |
|--------------------|-------------------|
| numero_certidao | Informativo (mencionado na escritura, mas nao no schema) |
| situacao | Informativo (usado para validacao, nao para minuta) |
| data_emissao | Informativo (mencionado na escritura, mas nao no schema) |
| data_validade | Usado para validacao de vigencia |
| codigo_verificacao | Usado para validacao online |
| url_verificacao | Informativo |
| orgao_emissor | Variavel por estado |
| estado_emissor | Informativo |
| inscricao_estadual | Apenas para empresas com IE |
| tributos_abrangidos | Informativo |

### 7.2 Campos de Pessoa Natural Nao Obtidos da CND Estadual

Para completar o cadastro de pessoa natural, obter de outros documentos:
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg`: Obter de RG ou CNH
- `data_nascimento`, `naturalidade`: Obter de RG ou CERTIDAO_NASCIMENTO
- `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `profissao`: Obter de CERTIDAO_CASAMENTO ou ESCRITURA
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `filiacao_*`: Obter de RG ou CERTIDAO_NASCIMENTO

### 7.3 Campos de Pessoa Juridica Nao Obtidos da CND Estadual

Para completar o cadastro de pessoa juridica, obter de outros documentos:
- `pj_endereco_*`: Obter de CONTRATO_SOCIAL
- `pj_representante_*`: Obter de CONTRATO_SOCIAL ou PROCURACAO
- `pj_inscricao_estadual`: Obter de CONTRATO_SOCIAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia PF: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Guia PJ: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- Campos Completos: `campos-completos/CND_ESTADUAL.md`
