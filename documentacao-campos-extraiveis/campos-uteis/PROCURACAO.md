# PROCURACAO - Procuracao Publica e Particular (Campos Uteis)

**Total de Campos Uteis**: 35 campos
**Categorias**: Pessoa Natural (14), Pessoa Juridica (21), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 35 campos (este arquivo)
- Campos Completos: ~50+ campos (ver `campos-completos/PROCURACAO.md`)

A Procuracao e um dos documentos mais complexos do sistema, fornecendo qualificacao completa tanto do **outorgante** (pessoa_natural) quanto do **procurador** (pessoa_juridica). Os campos de pessoa_natural referem-se ao outorgante, enquanto os campos de pessoa_juridica incluem dados da empresa (se PJ outorgante), do procurador e do instrumento de procuracao.

**Importante - Distincao de Papeis:**
- **Outorgante/Mandante**: Quem confere os poderes (campos pessoa_natural)
- **Procurador/Mandatario**: Quem recebe os poderes (campos pj_procurador_*)
- **PJ Outorgante**: Empresa que confere poderes (pj_denominacao, pj_cnpj)

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (14 campos) - Dados do Outorgante

Dados do outorgante (pessoa que confere os poderes).

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome completo do outorgante | "JOAO CARLOS MENDES" | SIM |
| cpf | CPF do outorgante | "987.654.321-00" | SIM |
| rg | Numero do RG | "45.678.901-2" | NAO |
| orgao_emissor_rg | Orgao emissor do RG | "SSP" | NAO |
| estado_emissor_rg | Estado emissor do RG | "SP" | NAO |
| nacionalidade | Nacionalidade | "BRASILEIRO" | NAO |
| profissao | Profissao ou ocupacao | "EMPRESARIO" | NAO |
| estado_civil | Estado civil | "CASADO" | NAO |
| domicilio_logradouro | Logradouro do domicilio | "RUA DAS ACACIAS" | NAO |
| domicilio_numero | Numero do domicilio | "250" | NAO |
| domicilio_bairro | Bairro do domicilio | "VILA MARIANA" | NAO |
| domicilio_cidade | Cidade do domicilio | "SAO PAULO" | NAO |
| domicilio_estado | Estado do domicilio | "SP" | NAO |
| domicilio_cep | CEP do domicilio | "04101-050" | NAO |

**Notas:**
- Estes campos qualificam o outorgante (quem da os poderes)
- Se o outorgante for PF e comparecer pessoalmente em escritura, seus dados vem da procuracao
- Se o outorgante for PJ, estes campos podem se referir ao administrador que assina a procuracao

---

### 2.2 Pessoa Juridica (21 campos) - Empresa, Procurador e Dados da Procuracao

#### 2.2.1 Dados da Empresa Outorgante (2 campos)

Quando a outorgante e Pessoa Juridica.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social da PJ outorgante | "CONSTRUTORA ALPHA LTDA" | PJ: SIM |
| pj_cnpj | CNPJ da PJ outorgante | "12.345.678/0001-90" | PJ: SIM |

---

#### 2.2.2 Dados do Procurador (15 campos)

Qualificacao completa de quem recebe os poderes (o mandatario).

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_procurador_nome | Nome completo do procurador | "MARIA DA SILVA SANTOS" | SIM |
| pj_procurador_cpf | CPF do procurador | "123.456.789-00" | SIM |
| pj_procurador_rg | RG do procurador | "12.345.678-9" | NAO |
| pj_procurador_orgao_emissor_rg | Orgao emissor RG | "SSP" | NAO |
| pj_procurador_estado_emissor_rg | Estado emissor RG | "SP" | NAO |
| pj_procurador_data_nascimento | Data de nascimento | "20/03/1980" | NAO |
| pj_procurador_estado_civil | Estado civil | "SOLTEIRA" | NAO |
| pj_procurador_profissao | Profissao | "ADVOGADA" | NAO |
| pj_procurador_nacionalidade | Nacionalidade | "BRASILEIRA" | NAO |
| pj_procurador_domicilio_logradouro | Logradouro | "AVENIDA PAULISTA" | NAO |
| pj_procurador_domicilio_numero | Numero | "1000" | NAO |
| pj_procurador_domicilio_bairro | Bairro | "BELA VISTA" | NAO |
| pj_procurador_domicilio_cidade | Cidade | "SAO PAULO" | NAO |
| pj_procurador_domicilio_estado | Estado | "SP" | NAO |
| pj_procurador_domicilio_cep | CEP | "01310-100" | NAO |

**Notas:**
- Estes campos sao prefixados com `pj_procurador_` para distinguir do outorgante
- Usados quando o procurador representa uma PJ em escrituras ou outros atos

---

#### 2.2.3 Dados do Instrumento de Procuracao (4 campos)

Dados especificos do documento de procuracao (quando publica).

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_tabelionato_procuracao | Tabelionato onde foi lavrada | "2o TABELIAO DE NOTAS DE SAO PAULO" | Publica: SIM |
| pj_data_procuracao | Data de lavratura | "15/01/2026" | SIM |
| pj_livro_procuracao | Numero do livro | "1234" | Publica: SIM |
| pj_paginas_procuracao | Paginas/Folhas | "456/458" | Publica: SIM |

**Notas:**
- Campos obrigatorios apenas para procuracoes publicas (lavradas em tabelionato)
- Procuracoes particulares nao possuem livro/folhas

---

### 2.3-2.4 Imovel e Negocio

A Procuracao **NAO** alimenta campos de Imovel ou Negocio Juridico.

**Observacao:** Embora procuracoes especificas possam mencionar imoveis (matricula, endereco, valor minimo), estes dados sao extraidos da MATRICULA_IMOVEL ou ESCRITURA, nao da procuracao.

---

## 3. MAPEAMENTO REVERSO

### 3.1 Campos Pessoa Natural (Outorgante)

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| outorgante.nome | nome | pessoa_natural |
| outorgante.cpf | cpf | pessoa_natural |
| outorgante.rg | rg | pessoa_natural |
| outorgante.orgao_rg | orgao_emissor_rg | pessoa_natural |
| outorgante.estado_rg | estado_emissor_rg | pessoa_natural |
| outorgante.nacionalidade | nacionalidade | pessoa_natural |
| outorgante.profissao | profissao | pessoa_natural |
| outorgante.estado_civil | estado_civil | pessoa_natural |
| outorgante.endereco.logradouro | domicilio_logradouro | pessoa_natural |
| outorgante.endereco.numero | domicilio_numero | pessoa_natural |
| outorgante.endereco.bairro | domicilio_bairro | pessoa_natural |
| outorgante.endereco.cidade | domicilio_cidade | pessoa_natural |
| outorgante.endereco.estado | domicilio_estado | pessoa_natural |
| outorgante.endereco.cep | domicilio_cep | pessoa_natural |

### 3.2 Campos Pessoa Juridica (Empresa + Procurador + Instrumento)

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| outorgante.denominacao | pj_denominacao | pessoa_juridica |
| outorgante.cnpj | pj_cnpj | pessoa_juridica |
| procurador.nome | pj_procurador_nome | pessoa_juridica |
| procurador.cpf | pj_procurador_cpf | pessoa_juridica |
| procurador.rg | pj_procurador_rg | pessoa_juridica |
| procurador.orgao_rg | pj_procurador_orgao_emissor_rg | pessoa_juridica |
| procurador.estado_rg | pj_procurador_estado_emissor_rg | pessoa_juridica |
| procurador.data_nascimento | pj_procurador_data_nascimento | pessoa_juridica |
| procurador.estado_civil | pj_procurador_estado_civil | pessoa_juridica |
| procurador.profissao | pj_procurador_profissao | pessoa_juridica |
| procurador.nacionalidade | pj_procurador_nacionalidade | pessoa_juridica |
| procurador.endereco.logradouro | pj_procurador_domicilio_logradouro | pessoa_juridica |
| procurador.endereco.numero | pj_procurador_domicilio_numero | pessoa_juridica |
| procurador.endereco.bairro | pj_procurador_domicilio_bairro | pessoa_juridica |
| procurador.endereco.cidade | pj_procurador_domicilio_cidade | pessoa_juridica |
| procurador.endereco.estado | pj_procurador_domicilio_estado | pessoa_juridica |
| procurador.endereco.cep | pj_procurador_domicilio_cep | pessoa_juridica |
| procuracao.tabelionato | pj_tabelionato_procuracao | pessoa_juridica |
| procuracao.data | pj_data_procuracao | pessoa_juridica |
| procuracao.livro | pj_livro_procuracao | pessoa_juridica |
| procuracao.folhas | pj_paginas_procuracao | pessoa_juridica |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO CARLOS MENDES",
    "cpf": "987.654.321-00",
    "rg": "45.678.901-2",
    "orgao_emissor_rg": "SSP",
    "estado_emissor_rg": "SP",
    "nacionalidade": "BRASILEIRO",
    "profissao": "EMPRESARIO",
    "estado_civil": "CASADO",
    "domicilio_logradouro": "RUA DAS ACACIAS",
    "domicilio_numero": "250",
    "domicilio_bairro": "VILA MARIANA",
    "domicilio_cidade": "SAO PAULO",
    "domicilio_estado": "SP",
    "domicilio_cep": "04101-050"
  },
  "pessoa_juridica": {
    "pj_denominacao": "CONSTRUTORA ALPHA LTDA",
    "pj_cnpj": "12.345.678/0001-90",
    "pj_procurador_nome": "MARIA DA SILVA SANTOS",
    "pj_procurador_cpf": "123.456.789-00",
    "pj_procurador_rg": "12.345.678-9",
    "pj_procurador_orgao_emissor_rg": "SSP",
    "pj_procurador_estado_emissor_rg": "SP",
    "pj_procurador_data_nascimento": "20/03/1980",
    "pj_procurador_estado_civil": "SOLTEIRA",
    "pj_procurador_profissao": "ADVOGADA",
    "pj_procurador_nacionalidade": "BRASILEIRA",
    "pj_procurador_domicilio_logradouro": "AVENIDA PAULISTA",
    "pj_procurador_domicilio_numero": "1000",
    "pj_procurador_domicilio_bairro": "BELA VISTA",
    "pj_procurador_domicilio_cidade": "SAO PAULO",
    "pj_procurador_domicilio_estado": "SP",
    "pj_procurador_domicilio_cep": "01310-100",
    "pj_tabelionato_procuracao": "2o TABELIAO DE NOTAS DE SAO PAULO",
    "pj_data_procuracao": "15/01/2026",
    "pj_livro_procuracao": "1234",
    "pj_paginas_procuracao": "456/458"
  },
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Representacao por Procuracao (Escritura)

Quando uma parte e representada por procurador, a minuta deve incluir:

**Qualificacao do Outorgante (ausente):**
```
"JOAO CARLOS MENDES, brasileiro, casado, empresario, portador do RG no 45.678.901-2
SSP/SP e inscrito no CPF sob no 987.654.321-00, residente e domiciliado na Rua das
Acacias, no 250, Vila Mariana, Sao Paulo-SP, CEP 04101-050, neste ato representado
por sua procuradora..."
```

**Qualificacao do Procurador (presente):**
```
"...MARIA DA SILVA SANTOS, brasileira, solteira, advogada, nascida em 20/03/1980,
portadora do RG no 12.345.678-9 SSP/SP e inscrita no CPF sob no 123.456.789-00,
residente e domiciliada na Avenida Paulista, no 1000, Bela Vista, Sao Paulo-SP,
CEP 01310-100, conforme procuracao publica lavrada no 2o Tabeliao de Notas de Sao
Paulo, em 15/01/2026, Livro 1234, Folhas 456/458."
```

### 5.2 Representacao de Pessoa Juridica

Quando PJ e representada por procurador:
```
"CONSTRUTORA ALPHA LTDA, inscrita no CNPJ sob no 12.345.678/0001-90, neste ato
representada por sua procuradora MARIA DA SILVA SANTOS, [qualificacao completa],
conforme procuracao publica lavrada no 2o Tabeliao de Notas de Sao Paulo, em
15/01/2026, Livro 1234, Folhas 456/458."
```

### 5.3 Campos Usados na Qualificacao do Procurador

| Elemento da Minuta | Campos Utilizados |
|--------------------|-------------------|
| Nome do procurador | pj_procurador_nome |
| Documentos | pj_procurador_cpf, pj_procurador_rg, pj_procurador_orgao_emissor_rg, pj_procurador_estado_emissor_rg |
| Qualificacao pessoal | pj_procurador_nacionalidade, pj_procurador_estado_civil, pj_procurador_profissao, pj_procurador_data_nascimento |
| Endereco | pj_procurador_domicilio_* (6 campos) |
| Dados da procuracao | pj_tabelionato_procuracao, pj_data_procuracao, pj_livro_procuracao, pj_paginas_procuracao |

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome (outorgante) | RG, CNH, CPF, CERTIDAO_CASAMENTO, ESCRITURA | Identificar outorgante |
| cpf (outorgante) | RG, CNH, CPF, CNDT, CND_FEDERAL | Validar identidade |
| pj_cnpj | CONTRATO_SOCIAL, CNDT, CND_FEDERAL, ESCRITURA | Identificar PJ |
| pj_denominacao | CONTRATO_SOCIAL, ESCRITURA | Validar empresa |
| pj_procurador_cpf | RG, CNH, CPF | Validar procurador |
| pj_procurador_nome | RG, CNH, CERTIDAO_CASAMENTO | Identificar procurador |

### 6.1 Correlacao Especial com CONTRATO_SOCIAL

Quando PJ outorga procuracao, deve-se verificar:

| Verificacao | Campo no CONTRATO_SOCIAL | Campo na PROCURACAO |
|-------------|-------------------------|---------------------|
| Administrador legitimado | pj_admin_nome, pj_admin_cpf | nome, cpf (quem assina) |
| Poderes para outorgar | pj_clausula_poderes_admin | Verificar se permite |
| CNPJ confere | pj_cnpj | pj_cnpj |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

### 7.1 Campos de Pessoa Natural que NAO vem da Procuracao

- `data_nascimento` (do outorgante): Obter de RG, CNH, CERTIDAO_NASCIMENTO
- `data_emissao_rg` (do outorgante): Obter de RG
- `naturalidade`: Obter de RG, CERTIDAO_NASCIMENTO
- `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `filiacao_pai`, `filiacao_mae`: Obter de RG, CERTIDAO_NASCIMENTO
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- `cnh`, `orgao_emissor_cnh`: Obter de CNH

### 7.2 Campos de Pessoa Juridica que NAO vem da Procuracao

- `pj_sede_*` (endereco da empresa): Obter de CONTRATO_SOCIAL
- `pj_admin_nome`, `pj_admin_cpf`: Obter de CONTRATO_SOCIAL
- `pj_nire`, `pj_data_registro`: Obter de CONTRATO_SOCIAL
- `pj_objeto_social`: Obter de CONTRATO_SOCIAL
- `pj_capital_social`: Obter de CONTRATO_SOCIAL

### 7.3 Campos da Procuracao NAO Mapeados para Minutas

Os seguintes campos sao extraiveis mas nao estao no mapeamento de campos uteis:

| Campo | Motivo da Exclusao |
|-------|-------------------|
| poderes | Texto livre, tratado manualmente |
| finalidade | Texto juridico especifico |
| prazo_validade | Metadado de verificacao |
| clausula_substabelecer | Metadado de verificacao |
| clausula_em_causa_propria | Metadado de verificacao |
| selo_digital | Identificacao interna do cartorio |
| imovel_objeto | Extraido da MATRICULA_IMOVEL |

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia PJ: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- Guia PN: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/PROCURACAO.md`
- Correlacao: `campos-completos/CONTRATO_SOCIAL.md`
