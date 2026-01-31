# CND_MUNICIPAL - Certidao Negativa de Debitos de Tributos Imobiliarios (Campos Uteis)

**Total de Campos Uteis**: 13 campos
**Categorias**: Pessoa Natural (2), Pessoa Juridica (2), Imovel (9), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CND Municipal e uma certidao **obrigatoria** para escrituras de compra e venda de imoveis, comprovando a regularidade fiscal do imovel perante o municipio. A importancia deste documento decorre da **obrigacao propter rem**: debitos de IPTU e taxas municipais acompanham o imovel, nao o proprietario. Isso significa que o adquirente pode ser responsabilizado por dividas anteriores a sua aquisicao.

**Pontos criticos**:
- A **validade** da certidao deve ser verificada na data da escritura (geralmente 30-90 dias)
- O **status** deve ser "REGULAR", "NEGATIVA" ou "SEM DEBITOS" para a transacao prosseguir
- O **SQL** (Setor Quadra Lote) deve corresponder exatamente ao imovel da transacao

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do contribuinte | "JOAO DA SILVA" | SIM |
| CPF | CPF do contribuinte | "123.456.789-00" | NAO (nem sempre disponivel) |

**Observacao**: Os dados do contribuinte servem para **validacao** e correlacao com o alienante, nao sao fonte primaria de dados pessoais.

### 2.2 Pessoa Juridica (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social (se PJ) | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| CNPJ | CNPJ (se PJ) | "12.345.678/0001-90" | SIM (se PJ) |

**Observacao**: A identificacao entre PF e PJ e feita pelo formato do documento (CPF = 11 digitos, CNPJ = 14 digitos).

### 2.3 Dados do Imovel (9 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| SQL | Cadastro Municipal (SQL) | "039.080.0244-3" | SIM |
| LOGRADOURO | Logradouro do imovel | "RUA FRANCISCO CRUZ" | SIM |
| NUMERO | Numero do imovel | "515" | SIM |
| COMPLEMENTO | Complemento (apto, bloco) | "APTO 124 BL-B" | NAO |
| BAIRRO | Bairro do imovel | "VILA MARIANA" | SIM |
| CIDADE | Cidade do imovel | "SAO PAULO" | SIM |
| ESTADO | Estado do imovel | "SP" | SIM |
| NUMERO DA CERTIDAO | Numero da certidao | "0001046713-2023" | SIM |
| DATA DE EMISSAO | Data de emissao | "26/10/2023" | SIM |

**Observacao**: O endereco na CND Municipal e frequentemente um campo unico que precisa ser parseado para extrair os componentes individuais.

### 2.4 Negocio Juridico (0 campos)

A CND Municipal nao alimenta campos diretos de negocio juridico. No entanto, a **referencia da certidao** (numero e data) e mencionada na escritura como comprovacao de diligencia fiscal.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_contribuinte | NOME / DENOMINACAO | pessoa_natural / pessoa_juridica |
| cpf_contribuinte | CPF | pessoa_natural |
| cpf_contribuinte (CNPJ) | CNPJ | pessoa_juridica |
| cadastro_imovel (SQL) | SQL | imovel |
| endereco_imovel | LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO | imovel |
| cep_imovel | imovel_cep | imovel |
| numero_certidao | NUMERO DA CERTIDAO | imovel |
| data_emissao | DATA DE EMISSAO | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "NOME": "JOAO DA SILVA",
    "CPF": "123.456.789-00"
  },
  "pessoa_juridica": {},
  "imovel": {
    "SQL": "039.080.0244-3",
    "LOGRADOURO": "RUA FRANCISCO CRUZ",
    "NUMERO": "515",
    "COMPLEMENTO": "APTO 124 BL-B",
    "BAIRRO": "VILA MARIANA",
    "CIDADE": "SAO PAULO",
    "ESTADO": "SP",
    "NUMERO DA CERTIDAO": "0001046713-2023",
    "DATA DE EMISSAO": "26/10/2023"
  },
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Referencia na Escritura

- `NUMERO DA CERTIDAO` -> Citado na escritura como certidao de tributos imobiliarios apresentada
- `DATA DE EMISSAO` -> Data de emissao para verificar validade

**Exemplo de texto na minuta**:
> "...foi apresentada Certidao Negativa de Tributos Imobiliarios n. 0001046713-2023, emitida em 26/10/2023 pela Prefeitura Municipal de Sao Paulo..."

### 5.2 Validacao Obrigatoria

| Validacao | Regra | Consequencia |
|-----------|-------|--------------|
| Validade | Certidao vigente na data da escritura | Sem validade = nova certidao necessaria |
| Status | "REGULAR", "NEGATIVA" ou "SEM DEBITOS" | Status "POSITIVA" = quitacao previa |
| SQL | Deve coincidir com IPTU, VVR e ITBI | SQL divergente = erro critico |
| Contribuinte | Deve corresponder ao alienante | Divergencia = verificar titularidade |

### 5.3 Diligencia Notarial

O tabeliao tem o **dever** de verificar a regularidade fiscal do imovel antes de lavrar a escritura:
- Art. 130 do CTN: obrigacao propter rem
- Provimento CNJ: exige apresentacao de certidoes negativas
- Protecao ao adquirente: evita transferencia de dividas ocultas

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

### 6.1 Correlacao do SQL

| Campo Util | Documento | Finalidade |
|------------|-----------|------------|
| imovel_sql | IPTU | SQL deve ser identico (identificador unico municipal) |
| imovel_sql | VVR | SQL deve coincidir para calculo correto do ITBI |
| imovel_sql | ITBI | SQL vincula a certidao ao imovel da transacao |
| imovel_sql | DADOS_CADASTRAIS | SQL e a chave de correlacao cadastral |
| imovel_sql | MATRICULA_IMOVEL | Pode constar na descricao do imovel |

### 6.2 Correlacao do Endereco

| Campo Util | Documento | Finalidade |
|------------|-----------|------------|
| imovel_logradouro + numero | MATRICULA_IMOVEL | Validar endereco registrado |
| imovel_logradouro + numero | ESCRITURA | Endereco para descricao |
| imovel_logradouro + numero | COMPROMISSO_COMPRA_VENDA | Endereco do imovel prometido |
| imovel_logradouro + numero | IPTU | Endereco fiscal |
| imovel_logradouro + numero | ITBI | Endereco da transacao |

### 6.3 Correlacao do Contribuinte

| Campo Util | Documento | Finalidade |
|------------|-----------|------------|
| nome | IPTU | Contribuinte deve ser o mesmo proprietario |
| nome | MATRICULA_IMOVEL | Proprietario atual deve corresponder |
| cpf | RG, CNH, CNDT, CND_FEDERAL | Identificar mesma pessoa |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

A CND Municipal e um documento de **validacao fiscal**, nao de qualificacao de partes. Para dados completos:

### 7.1 Pessoa Natural

| Campo | Onde Obter | Observacao |
|-------|-----------|------------|
| rg, orgao_emissor_rg, estado_emissor_rg | RG | Documento de identidade |
| data_nascimento | RG, CNH, CERTIDAO_NASCIMENTO | Data de nascimento |
| estado_civil, regime_bens | CERTIDAO_CASAMENTO | Estado civil atual |
| profissao, nacionalidade | ESCRITURA, COMPROMISSO | Qualificacao profissional |
| domicilio_* | COMPROVANTE_RESIDENCIA | Endereco de residencia |
| filiacao_pai, filiacao_mae | CERTIDAO_NASCIMENTO, RG | Filiacao |

### 7.2 Pessoa Juridica

| Campo | Onde Obter | Observacao |
|-------|-----------|------------|
| pj_sede_* | CONTRATO_SOCIAL | Endereco da sede |
| pj_admin_* | CONTRATO_SOCIAL | Dados do administrador |
| pj_nire | CONTRATO_SOCIAL | Numero de registro |

### 7.3 Dados do Imovel (detalhados)

| Campo | Onde Obter | Observacao |
|-------|-----------|------------|
| matricula_numero | MATRICULA_IMOVEL | Numero da matricula |
| imovel_area_total, area_privativa | MATRICULA_IMOVEL, IPTU | Areas do imovel |
| imovel_valor_venal_iptu | IPTU | Valor venal para IPTU |
| imovel_valor_venal_referencia | VVR | Valor venal de referencia para ITBI |
| imovel_descricao_conforme_matricula | MATRICULA_IMOVEL | Descricao completa |
| imovel_cep | IPTU, DADOS_CADASTRAIS | CEP do imovel |

---

## 8. VALIDACAO DE VALIDADE

A CND Municipal tem validade variavel conforme o municipio:

| Municipio | Validade Padrao | Observacao |
|-----------|-----------------|------------|
| Sao Paulo | 90 dias | Certidao gratuita, emissao online |
| Outros | 30-90 dias | Verificar legislacao municipal |

**Verificacao obrigatoria**: `data_emissao + validade >= data_escritura`

---

## 9. CONJUNTO DE CERTIDOES OBRIGATORIAS

A CND Municipal faz parte do conjunto de certidoes fiscais exigidas em escrituras:

| Certidao | Orgao | Vinculacao | Campos Mapeados |
|----------|-------|------------|-----------------|
| CND Municipal | Prefeitura | Imovel (SQL) | NUMERO DA CERTIDAO, DATA DE EMISSAO |
| CND Federal | RFB/PGFN | Pessoa (CPF/CNPJ) | certidao_uniao_* |
| CND Estadual | Sefaz | Pessoa (CPF/CNPJ) | (nao mapeados especificos) |
| CNDT | TST | Pessoa (CPF/CNPJ) | cndt_* |

**Diferenca importante**: A CND Municipal e vinculada ao **imovel** (SQL), enquanto as demais certidoes sao vinculadas a **pessoa** (CPF/CNPJ).

---

## 10. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Campos Completos: `campos-completos/CND_MUNICIPAL.md`
- Site Prefeitura SP: https://www.prefeitura.sp.gov.br/
- CTN Art. 130: Obrigacao propter rem

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial de campos uteis |
