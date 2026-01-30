# CONTRATO_SOCIAL - Contrato Social e Alteracoes Contratuais (Campos Uteis)

**Total de Campos Uteis**: 32 campos
**Categorias**: Pessoa Natural (0), Pessoa Juridica (32), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 32 campos (este arquivo)
- Campos Completos: ~45+ campos (ver `campos-completos/CONTRATO_SOCIAL.md`)

O Contrato Social e a **fonte primaria para qualificacao de pessoa juridica** em minutas, alimentando todos os 32 campos mapeados para PJ. E o segundo documento mais complexo para dados de pessoa juridica, atras apenas da PROCURACAO.

**Destaque - Dados do Administrador:**
O Contrato Social e o documento que identifica quem pode representar a empresa. Os dados do administrador (21 campos) sao fundamentais para a qualificacao completa na escritura.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Juridica - Dados da Empresa (3 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social ou denominacao | "CONSTRUTORA ALPHA LTDA" | SIM |
| pj_cnpj | CNPJ da empresa | "12.345.678/0001-90" | SIM |
| pj_nire | Numero de Inscricao no Registro de Empresas | "35.215.678.901" | SIM |

---

### 2.2 Pessoa Juridica - Endereco da Sede (7 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_sede_logradouro | Logradouro da sede | "AVENIDA PAULISTA" | SIM |
| pj_sede_numero | Numero da sede | "1000" | SIM |
| pj_sede_complemento | Complemento | "CONJUNTO 1501" | NAO |
| pj_sede_bairro | Bairro da sede | "BELA VISTA" | NAO |
| pj_sede_cidade | Cidade da sede | "SAO PAULO" | SIM |
| pj_sede_estado | Estado (UF) | "SP" | SIM |
| pj_sede_cep | CEP da sede | "01310-100" | NAO |

---

### 2.3 Pessoa Juridica - Registro na Junta Comercial (4 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_instrumento_constitutivo | Tipo do instrumento | "CONTRATO SOCIAL E SUAS ALTERACOES" | SIM |
| pj_junta_comercial | Junta Comercial de registro | "JUCESP" | SIM |
| pj_numero_registro_contrato | Numero do registro na JC | "123.456.789.012" | SIM |
| pj_data_sessao_registro | Data da sessao de registro | "15/03/2020" | SIM |

---

### 2.4 Pessoa Juridica - Dados do Administrador (15 campos)

**IMPORTANTE**: Os dados do administrador sao fundamentais para a minuta, pois e a pessoa que representa a empresa no ato.

#### Identificacao do Administrador (6 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_admin_nome | Nome completo do administrador | "JOAO CARLOS MENDES" | SIM |
| pj_admin_cpf | CPF do administrador | "987.654.321-00" | SIM |
| pj_admin_rg | RG do administrador | "45.678.901-2" | NAO |
| pj_admin_orgao_emissor_rg | Orgao emissor do RG | "SSP" | NAO |
| pj_admin_estado_emissor_rg | Estado emissor do RG | "SP" | NAO |
| pj_admin_data_nascimento | Data de nascimento | "15/08/1975" | NAO |

#### Qualificacao do Administrador (4 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_admin_estado_civil | Estado civil | "CASADO" | NAO |
| pj_admin_profissao | Profissao | "ENGENHEIRO CIVIL" | NAO |
| pj_admin_nacionalidade | Nacionalidade | "BRASILEIRO" | NAO |

#### Domicilio do Administrador (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_admin_domicilio_logradouro | Logradouro do administrador | "RUA DAS ACACIAS" | NAO |
| pj_admin_domicilio_numero | Numero | "250" | NAO |
| pj_admin_domicilio_bairro | Bairro | "VILA MARIANA" | NAO |
| pj_admin_domicilio_cidade | Cidade | "SAO PAULO" | NAO |
| pj_admin_domicilio_estado | Estado (UF) | "SP" | NAO |
| pj_admin_domicilio_cep | CEP | "04101-050" | NAO |

---

### 2.5 Pessoa Juridica - Representacao e Poderes (3 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_tipo_representacao | Tipo de representacao | "ADMINISTRADOR INDICADO NO CONTRATO SOCIAL" | SIM |
| pj_clausula_indica_admin | Clausula que indica o administrador | "CLAUSULA DECIMA SEGUNDA" | NAO |
| pj_clausula_poderes_admin | Clausula sobre poderes | "CLAUSULA DECIMA TERCEIRA" | NAO |

---

### 2.6 Outras Categorias

O CONTRATO_SOCIAL nao alimenta campos de Pessoa Natural, Imovel ou Negocio Juridico.

**Nota**: Embora os dados do administrador sejam de uma pessoa fisica, eles sao mapeados como campos de pessoa juridica (prefixo `pj_admin_*`) pois sao usados no contexto de representacao da empresa.

---

## 3. MAPEAMENTO REVERSO

### 3.1 Dados da Empresa

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| razao_social / denominacao | pj_denominacao | pessoa_juridica |
| cnpj | pj_cnpj | pessoa_juridica |
| nire | pj_nire | pessoa_juridica |

### 3.2 Endereco da Sede

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| sede.logradouro | pj_sede_logradouro | pessoa_juridica |
| sede.numero | pj_sede_numero | pessoa_juridica |
| sede.complemento | pj_sede_complemento | pessoa_juridica |
| sede.bairro | pj_sede_bairro | pessoa_juridica |
| sede.cidade | pj_sede_cidade | pessoa_juridica |
| sede.estado | pj_sede_estado | pessoa_juridica |
| sede.cep | pj_sede_cep | pessoa_juridica |

### 3.3 Registro na Junta

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| instrumento_constitutivo | pj_instrumento_constitutivo | pessoa_juridica |
| junta_comercial | pj_junta_comercial | pessoa_juridica |
| numero_registro | pj_numero_registro_contrato | pessoa_juridica |
| data_sessao | pj_data_sessao_registro | pessoa_juridica |

### 3.4 Dados do Administrador

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| administrador.nome | pj_admin_nome | pessoa_juridica |
| administrador.cpf | pj_admin_cpf | pessoa_juridica |
| administrador.rg | pj_admin_rg | pessoa_juridica |
| administrador.orgao_rg | pj_admin_orgao_emissor_rg | pessoa_juridica |
| administrador.estado_rg | pj_admin_estado_emissor_rg | pessoa_juridica |
| administrador.data_nascimento | pj_admin_data_nascimento | pessoa_juridica |
| administrador.estado_civil | pj_admin_estado_civil | pessoa_juridica |
| administrador.profissao | pj_admin_profissao | pessoa_juridica |
| administrador.nacionalidade | pj_admin_nacionalidade | pessoa_juridica |
| administrador.endereco.logradouro | pj_admin_domicilio_logradouro | pessoa_juridica |
| administrador.endereco.numero | pj_admin_domicilio_numero | pessoa_juridica |
| administrador.endereco.bairro | pj_admin_domicilio_bairro | pessoa_juridica |
| administrador.endereco.cidade | pj_admin_domicilio_cidade | pessoa_juridica |
| administrador.endereco.estado | pj_admin_domicilio_estado | pessoa_juridica |
| administrador.endereco.cep | pj_admin_domicilio_cep | pessoa_juridica |

### 3.5 Representacao

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| tipo_representacao | pj_tipo_representacao | pessoa_juridica |
| clausula_administrador | pj_clausula_indica_admin | pessoa_juridica |
| clausula_poderes | pj_clausula_poderes_admin | pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {
    "pj_denominacao": "CONSTRUTORA ALPHA LTDA",
    "pj_cnpj": "12.345.678/0001-90",
    "pj_nire": "35.215.678.901",
    "pj_sede_logradouro": "AVENIDA PAULISTA",
    "pj_sede_numero": "1000",
    "pj_sede_complemento": "CONJUNTO 1501",
    "pj_sede_bairro": "BELA VISTA",
    "pj_sede_cidade": "SAO PAULO",
    "pj_sede_estado": "SP",
    "pj_sede_cep": "01310-100",
    "pj_instrumento_constitutivo": "CONTRATO SOCIAL E SUAS ALTERACOES",
    "pj_junta_comercial": "JUCESP",
    "pj_numero_registro_contrato": "123.456.789.012",
    "pj_data_sessao_registro": "15/03/2020",
    "pj_admin_nome": "JOAO CARLOS MENDES",
    "pj_admin_cpf": "987.654.321-00",
    "pj_admin_rg": "45.678.901-2",
    "pj_admin_orgao_emissor_rg": "SSP",
    "pj_admin_estado_emissor_rg": "SP",
    "pj_admin_data_nascimento": "15/08/1975",
    "pj_admin_estado_civil": "CASADO",
    "pj_admin_profissao": "ENGENHEIRO CIVIL",
    "pj_admin_nacionalidade": "BRASILEIRO",
    "pj_admin_domicilio_logradouro": "RUA DAS ACACIAS",
    "pj_admin_domicilio_numero": "250",
    "pj_admin_domicilio_bairro": "VILA MARIANA",
    "pj_admin_domicilio_cidade": "SAO PAULO",
    "pj_admin_domicilio_estado": "SP",
    "pj_admin_domicilio_cep": "04101-050",
    "pj_tipo_representacao": "ADMINISTRADOR INDICADO NO CONTRATO SOCIAL",
    "pj_clausula_indica_admin": "CLAUSULA DECIMA SEGUNDA",
    "pj_clausula_poderes_admin": "CLAUSULA DECIMA TERCEIRA"
  },
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao de Pessoa Juridica (Escritura)

A qualificacao completa de uma pessoa juridica na escritura utiliza os seguintes campos:

```
"CONSTRUTORA ALPHA LTDA, pessoa juridica de direito privado,
inscrita no CNPJ sob no 12.345.678/0001-90, com sede na Avenida
Paulista, 1000, Conjunto 1501, Bela Vista, CEP 01310-100,
Sao Paulo-SP, neste ato representada por seu administrador,
JOAO CARLOS MENDES, brasileiro, casado pelo regime da comunhao
parcial de bens, engenheiro civil, portador do RG no 45.678.901-2
SSP/SP e inscrito no CPF sob no 987.654.321-00, residente e
domiciliado na Rua das Acacias, 250, Vila Mariana,
CEP 04101-050, Sao Paulo-SP, conforme Clausula Decima Segunda
do Contrato Social registrado na JUCESP sob no 123.456.789.012
em sessao de 15/03/2020."
```

### 5.2 Campos Utilizados por Secao da Minuta

| Secao | Campos Utilizados |
|-------|-------------------|
| **Identificacao da Empresa** | pj_denominacao, pj_cnpj |
| **Sede** | pj_sede_* (7 campos) |
| **Qualificacao do Administrador** | pj_admin_nome, pj_admin_cpf, pj_admin_rg, pj_admin_orgao_emissor_rg, pj_admin_estado_emissor_rg, pj_admin_nacionalidade, pj_admin_estado_civil, pj_admin_profissao |
| **Domicilio do Administrador** | pj_admin_domicilio_* (6 campos) |
| **Referencia ao Contrato** | pj_instrumento_constitutivo, pj_junta_comercial, pj_numero_registro_contrato, pj_data_sessao_registro, pj_clausula_indica_admin |

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| pj_cnpj | CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, PROCURACAO | Identificar mesma empresa |
| pj_denominacao | Todos os documentos de PJ | Correlacionar documentos |
| pj_admin_cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT | Identificar administrador |
| pj_admin_nome | Todos os documentos de pessoa natural | Correlacionar pessoa |
| pj_sede_* | ESCRITURA, COMPROMISSO_COMPRA_VENDA | Validar endereco da sede |

### 6.1 Correlacao com PROCURACAO

O CONTRATO_SOCIAL e a PROCURACAO sao complementares para representacao de PJ:

| Cenario | CONTRATO_SOCIAL | PROCURACAO |
|---------|-----------------|------------|
| Administrador comparece pessoalmente | Necessario | Nao necessaria |
| Procurador representa a empresa | Necessario | Necessaria |
| Administrador + Procurador conjunto | Necessario | Necessaria |

### 6.2 Correlacao com Certidoes Negativas

Para escrituras envolvendo PJ, as seguintes certidoes devem ter o mesmo CNPJ:

| Documento | Campo de Correlacao |
|-----------|---------------------|
| CNDT (PJ) | pj_cnpj |
| CND_FEDERAL (PJ) | pj_cnpj |
| CND_ESTADUAL (PJ) | pj_cnpj |
| CND_MUNICIPAL (PJ) | pj_cnpj |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_juridica que NAO vem do CONTRATO_SOCIAL:

| Campo | Onde Obter |
|-------|------------|
| pj_data_expedicao_ficha_cadastral | CERTIDAO_SIMPLIFICADA, FICHA_CADASTRAL |
| pj_data_expedicao_certidao_registro | CERTIDAO_SIMPLIFICADA |
| pj_admin_data_emissao_rg | RG do administrador |
| pj_admin_cnh | CNH do administrador |
| pj_admin_orgao_emissor_cnh | CNH do administrador |
| pj_admin_domicilio_complemento | COMPROVANTE_RESIDENCIA do administrador |
| pj_admin_email | COMPROMISSO_COMPRA_VENDA, cadastro da empresa |
| pj_admin_telefone | COMPROMISSO_COMPRA_VENDA, cadastro da empresa |
| pj_data_ata_admin | ATA_ASSEMBLEIA (quando administrador nomeado por ata) |
| pj_numero_registro_ata | ATA_ASSEMBLEIA |

**Nota sobre dados do administrador:**
Se os dados pessoais do administrador nao estiverem completos no Contrato Social, podem ser complementados com:
- RG do administrador -> pj_admin_rg, pj_admin_orgao_emissor_rg, pj_admin_estado_emissor_rg, pj_admin_data_nascimento
- CERTIDAO_CASAMENTO -> pj_admin_estado_civil
- COMPROVANTE_RESIDENCIA -> pj_admin_domicilio_*

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- Campos Completos: `campos-completos/CONTRATO_SOCIAL.md`
