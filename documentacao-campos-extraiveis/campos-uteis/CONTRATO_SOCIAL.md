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
| DENOMINACAO | Razao social ou denominacao | "CONSTRUTORA ALPHA LTDA" | SIM |
| CNPJ | CNPJ da empresa | "12.345.678/0001-90" | SIM |
| NIRE | Numero de Inscricao no Registro de Empresas | "35.215.678.901" | SIM |

---

### 2.2 Pessoa Juridica - Endereco da Sede (7 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| LOGRADOURO DA SEDE | Logradouro da sede | "AVENIDA PAULISTA" | SIM |
| NUMERO DA SEDE | Numero da sede | "1000" | SIM |
| COMPLEMENTO DA SEDE | Complemento | "CONJUNTO 1501" | NAO |
| BAIRRO DA SEDE | Bairro da sede | "BELA VISTA" | NAO |
| CIDADE DA SEDE | Cidade da sede | "SAO PAULO" | SIM |
| ESTADO DA SEDE | Estado (UF) | "SP" | SIM |
| CEP DA SEDE | CEP da sede | "01310-100" | NAO |

---

### 2.3 Pessoa Juridica - Registro na Junta Comercial (4 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| INSTRUMENTO CONSTITUTIVO | Tipo do instrumento | "CONTRATO SOCIAL E SUAS ALTERACOES" | SIM |
| JUNTA COMERCIAL | Junta Comercial de registro | "JUCESP" | SIM |
| NUMERO DO REGISTRO DO CONTRATO SOCIAL | Numero do registro na JC | "123.456.789.012" | SIM |
| DATA DA SESSAO DO REGISTRO | Data da sessao de registro | "15/03/2020" | SIM |

---

### 2.4 Pessoa Juridica - Dados do Administrador (15 campos)

**IMPORTANTE**: Os dados do administrador sao fundamentais para a minuta, pois e a pessoa que representa a empresa no ato.

#### Identificacao do Administrador (6 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME DO ADMINISTRADOR | Nome completo do administrador | "JOAO CARLOS MENDES" | SIM |
| CPF DO ADMINISTRADOR | CPF do administrador | "987.654.321-00" | SIM |
| RG DO ADMINISTRADOR | RG do administrador | "45.678.901-2" | NAO |
| ORGAO EMISSOR DO RG DO ADMINISTRADOR | Orgao emissor do RG | "SSP" | NAO |
| ESTADO EMISSOR DO RG DO ADMINISTRADOR | Estado emissor do RG | "SP" | NAO |
| DATA DE NASCIMENTO DO ADMINISTRADOR | Data de nascimento | "15/08/1975" | NAO |

#### Qualificacao do Administrador (4 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| ESTADO CIVIL DO ADMINISTRADOR | Estado civil | "CASADO" | NAO |
| PROFISSAO DO ADMINISTRADOR | Profissao | "ENGENHEIRO CIVIL" | NAO |
| NACIONALIDADE DO ADMINISTRADOR | Nacionalidade | "BRASILEIRO" | NAO |

#### Domicilio do Administrador (5 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| LOGRADOURO DO ADMINISTRADOR | Logradouro do administrador | "RUA DAS ACACIAS" | NAO |
| NUMERO DO ADMINISTRADOR | Numero | "250" | NAO |
| BAIRRO DO ADMINISTRADOR | Bairro | "VILA MARIANA" | NAO |
| CIDADE DO ADMINISTRADOR | Cidade | "SAO PAULO" | NAO |
| ESTADO DO ADMINISTRADOR | Estado (UF) | "SP" | NAO |
| CEP DO ADMINISTRADOR | CEP | "04101-050" | NAO |

---

### 2.5 Pessoa Juridica - Representacao e Poderes (3 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| TIPO DE REPRESENTACAO | Tipo de representacao | "ADMINISTRADOR INDICADO NO CONTRATO SOCIAL" | SIM |
| CLAUSULA QUE INDICA O ADMINISTRADOR | Clausula que indica o administrador | "CLAUSULA DECIMA SEGUNDA" | NAO |
| CLAUSULA SOBRE PODERES DO ADMINISTRADOR | Clausula sobre poderes | "CLAUSULA DECIMA TERCEIRA" | NAO |

---

### 2.6 Outras Categorias

O CONTRATO_SOCIAL nao alimenta campos de Pessoa Natural, Imovel ou Negocio Juridico.

**Nota**: Embora os dados do administrador sejam de uma pessoa fisica, eles sao mapeados como campos de pessoa juridica (prefixo `pj_admin_*`) pois sao usados no contexto de representacao da empresa.

---

## 3. MAPEAMENTO REVERSO

### 3.1 Dados da Empresa

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| razao_social / denominacao | DENOMINACAO | pessoa_juridica |
| cnpj | CNPJ | pessoa_juridica |
| nire | NIRE | pessoa_juridica |

### 3.2 Endereco da Sede

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| sede.logradouro | LOGRADOURO DA SEDE | pessoa_juridica |
| sede.numero | NUMERO DA SEDE | pessoa_juridica |
| sede.complemento | COMPLEMENTO DA SEDE | pessoa_juridica |
| sede.bairro | BAIRRO DA SEDE | pessoa_juridica |
| sede.cidade | CIDADE DA SEDE | pessoa_juridica |
| sede.estado | ESTADO DA SEDE | pessoa_juridica |
| sede.cep | CEP DA SEDE | pessoa_juridica |

### 3.3 Registro na Junta

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| instrumento_constitutivo | INSTRUMENTO CONSTITUTIVO | pessoa_juridica |
| junta_comercial | JUNTA COMERCIAL | pessoa_juridica |
| numero_registro | NUMERO DO REGISTRO DO CONTRATO SOCIAL | pessoa_juridica |
| data_sessao | DATA DA SESSAO DO REGISTRO | pessoa_juridica |

### 3.4 Dados do Administrador

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| administrador.nome | NOME DO ADMINISTRADOR | pessoa_juridica |
| administrador.cpf | CPF DO ADMINISTRADOR | pessoa_juridica |
| administrador.rg | RG DO ADMINISTRADOR | pessoa_juridica |
| administrador.orgao_rg | ORGAO EMISSOR DO RG DO ADMINISTRADOR | pessoa_juridica |
| administrador.estado_rg | ESTADO EMISSOR DO RG DO ADMINISTRADOR | pessoa_juridica |
| administrador.data_nascimento | DATA DE NASCIMENTO DO ADMINISTRADOR | pessoa_juridica |
| administrador.estado_civil | ESTADO CIVIL DO ADMINISTRADOR | pessoa_juridica |
| administrador.profissao | PROFISSAO DO ADMINISTRADOR | pessoa_juridica |
| administrador.nacionalidade | NACIONALIDADE DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.logradouro | LOGRADOURO DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.numero | NUMERO DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.bairro | BAIRRO DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.cidade | CIDADE DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.estado | ESTADO DO ADMINISTRADOR | pessoa_juridica |
| administrador.endereco.cep | CEP DO ADMINISTRADOR | pessoa_juridica |

### 3.5 Representacao

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| tipo_representacao | TIPO DE REPRESENTACAO | pessoa_juridica |
| clausula_administrador | CLAUSULA QUE INDICA O ADMINISTRADOR | pessoa_juridica |
| clausula_poderes | CLAUSULA SOBRE PODERES DO ADMINISTRADOR | pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {
    "DENOMINACAO": "CONSTRUTORA ALPHA LTDA",
    "CNPJ": "12.345.678/0001-90",
    "NIRE": "35.215.678.901",
    "LOGRADOURO DA SEDE": "AVENIDA PAULISTA",
    "NUMERO DA SEDE": "1000",
    "COMPLEMENTO DA SEDE": "CONJUNTO 1501",
    "BAIRRO DA SEDE": "BELA VISTA",
    "CIDADE DA SEDE": "SAO PAULO",
    "ESTADO DA SEDE": "SP",
    "CEP DA SEDE": "01310-100",
    "INSTRUMENTO CONSTITUTIVO": "CONTRATO SOCIAL E SUAS ALTERACOES",
    "JUNTA COMERCIAL": "JUCESP",
    "NUMERO DO REGISTRO DO CONTRATO SOCIAL": "123.456.789.012",
    "DATA DA SESSAO DO REGISTRO": "15/03/2020",
    "NOME DO ADMINISTRADOR": "JOAO CARLOS MENDES",
    "CPF DO ADMINISTRADOR": "987.654.321-00",
    "RG DO ADMINISTRADOR": "45.678.901-2",
    "ORGAO EMISSOR DO RG DO ADMINISTRADOR": "SSP",
    "ESTADO EMISSOR DO RG DO ADMINISTRADOR": "SP",
    "DATA DE NASCIMENTO DO ADMINISTRADOR": "15/08/1975",
    "ESTADO CIVIL DO ADMINISTRADOR": "CASADO",
    "PROFISSAO DO ADMINISTRADOR": "ENGENHEIRO CIVIL",
    "NACIONALIDADE DO ADMINISTRADOR": "BRASILEIRO",
    "LOGRADOURO DO ADMINISTRADOR": "RUA DAS ACACIAS",
    "NUMERO DO ADMINISTRADOR": "250",
    "BAIRRO DO ADMINISTRADOR": "VILA MARIANA",
    "CIDADE DO ADMINISTRADOR": "SAO PAULO",
    "ESTADO DO ADMINISTRADOR": "SP",
    "CEP DO ADMINISTRADOR": "04101-050",
    "TIPO DE REPRESENTACAO": "ADMINISTRADOR INDICADO NO CONTRATO SOCIAL",
    "CLAUSULA QUE INDICA O ADMINISTRADOR": "CLAUSULA DECIMA SEGUNDA",
    "CLAUSULA SOBRE PODERES DO ADMINISTRADOR": "CLAUSULA DECIMA TERCEIRA"
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
| **Identificacao da Empresa** | DENOMINACAO, CNPJ |
| **Sede** | LOGRADOURO DA SEDE, NUMERO DA SEDE, COMPLEMENTO DA SEDE, BAIRRO DA SEDE, CIDADE DA SEDE, ESTADO DA SEDE, CEP DA SEDE |
| **Qualificacao do Administrador** | NOME DO ADMINISTRADOR, CPF DO ADMINISTRADOR, RG DO ADMINISTRADOR, ORGAO EMISSOR DO RG DO ADMINISTRADOR, ESTADO EMISSOR DO RG DO ADMINISTRADOR, NACIONALIDADE DO ADMINISTRADOR, ESTADO CIVIL DO ADMINISTRADOR, PROFISSAO DO ADMINISTRADOR |
| **Domicilio do Administrador** | LOGRADOURO DO ADMINISTRADOR, NUMERO DO ADMINISTRADOR, BAIRRO DO ADMINISTRADOR, CIDADE DO ADMINISTRADOR, ESTADO DO ADMINISTRADOR, CEP DO ADMINISTRADOR |
| **Referencia ao Contrato** | INSTRUMENTO CONSTITUTIVO, JUNTA COMERCIAL, NUMERO DO REGISTRO DO CONTRATO SOCIAL, DATA DA SESSAO DO REGISTRO, CLAUSULA QUE INDICA O ADMINISTRADOR |

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| CNPJ | CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, PROCURACAO | Identificar mesma empresa |
| DENOMINACAO | Todos os documentos de PJ | Correlacionar documentos |
| CPF DO ADMINISTRADOR | RG, CNH, CERTIDAO_CASAMENTO, CNDT | Identificar administrador |
| NOME DO ADMINISTRADOR | Todos os documentos de pessoa natural | Correlacionar pessoa |
| LOGRADOURO DA SEDE, NUMERO DA SEDE, COMPLEMENTO DA SEDE, BAIRRO DA SEDE, CIDADE DA SEDE, ESTADO DA SEDE, CEP DA SEDE | ESCRITURA, COMPROMISSO_COMPRA_VENDA | Validar endereco da sede |

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
| CNDT (PJ) | CNPJ |
| CND_FEDERAL (PJ) | CNPJ |
| CND_ESTADUAL (PJ) | CNPJ |
| CND_MUNICIPAL (PJ) | CNPJ |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_juridica que NAO vem do CONTRATO_SOCIAL:

| Campo | Onde Obter |
|-------|------------|
| DATA DE EXPEDICAO FICHA CADASTRAL | CERTIDAO_SIMPLIFICADA, FICHA_CADASTRAL |
| DATA DE EXPEDICAO CERTIDAO REGISTRO | CERTIDAO_SIMPLIFICADA |
| DATA DE EMISSAO RG DO ADMINISTRADOR | RG do administrador |
| CNH DO ADMINISTRADOR | CNH do administrador |
| ORGAO EMISSOR CNH DO ADMINISTRADOR | CNH do administrador |
| COMPLEMENTO DO ADMINISTRADOR | COMPROVANTE_RESIDENCIA do administrador |
| EMAIL DO ADMINISTRADOR | COMPROMISSO_COMPRA_VENDA, cadastro da empresa |
| TELEFONE DO ADMINISTRADOR | COMPROMISSO_COMPRA_VENDA, cadastro da empresa |
| DATA ATA ADMIN | ATA_ASSEMBLEIA (quando administrador nomeado por ata) |
| NUMERO REGISTRO ATA | ATA_ASSEMBLEIA |

**Nota sobre dados do administrador:**
Se os dados pessoais do administrador nao estiverem completos no Contrato Social, podem ser complementados com:
- RG do administrador -> RG DO ADMINISTRADOR, ORGAO EMISSOR DO RG DO ADMINISTRADOR, ESTADO EMISSOR DO RG DO ADMINISTRADOR, DATA DE NASCIMENTO DO ADMINISTRADOR
- CERTIDAO_CASAMENTO -> ESTADO CIVIL DO ADMINISTRADOR
- COMPROVANTE_RESIDENCIA -> LOGRADOURO DO ADMINISTRADOR, NUMERO DO ADMINISTRADOR, BAIRRO DO ADMINISTRADOR, CIDADE DO ADMINISTRADOR, ESTADO DO ADMINISTRADOR, CEP DO ADMINISTRADOR

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- Campos Completos: `campos-completos/CONTRATO_SOCIAL.md`
