# Referencia de Documentos e Campos Extraiveis

**Versao:** 2.0
**Data:** 2026-01-28
**Fonte da Verdade:** `Guia-de-campos-e-variaveis/*.md`

Este documento descreve os **26 tipos de documentos** reconhecidos pelo sistema e os **campos de dados** que podem ser extraidos de cada um deles. O objetivo e permitir uma visualizacao clara de:

1. Quais tipos de documentos podem ser enviados
2. Quais campos uteis podem ser extraidos de cada documento
3. Como campos compartilhados permitem correlacionar informacoes entre documentos

---

## Sumario

1. [Visao Geral das Categorias de Campos](#1-visao-geral-das-categorias-de-campos)
2. [Tipos de Documentos por Categoria](#2-tipos-de-documentos-por-categoria)
3. [Detalhamento por Tipo de Documento](#3-detalhamento-por-tipo-de-documento)
4. [Campos Compartilhados e Correlacoes](#4-campos-compartilhados-e-correlacoes)
5. [Exemplos Praticos de Extracao](#5-exemplos-praticos-de-extracao)

---

## 1. Visao Geral das Categorias de Campos

Os campos de dados estao organizados em **4 categorias principais**:

| Categoria | Total de Campos | Descricao |
|-----------|-----------------|-----------|
| **Pessoa Natural** | 39 | Dados de pessoas fisicas (identificacao, estado civil, domicilio, certidoes) |
| **Pessoa Juridica** | 76 | Dados de empresas (qualificacao, sede, registro, representantes) |
| **Dados do Imovel** | 33+ | Dados do imovel (matricula, descricao, cadastro, onus) |
| **Negocio Juridico** | 33+ | Dados da transacao (valores, partes, pagamento, termos) |

> **Nota:** Os totais de Dados do Imovel e Negocio Juridico podem variar conforme a quantidade de proprietarios, onus, alienantes e adquirentes.

---

## 2. Tipos de Documentos por Categoria

### 2.1 Documentos Pessoais (7 tipos)

| Codigo | Nome | Campos Principais |
|--------|------|-------------------|
| `RG` | Carteira de Identidade | Nome, CPF, RG, Orgao Emissor, Data Nascimento |
| `CNH` | Carteira Nacional de Habilitacao | Nome, CPF, CNH, Data Nascimento |
| `CPF` | Cadastro de Pessoa Fisica | Nome, CPF, Data Nascimento |
| `CERTIDAO_NASCIMENTO` | Certidao de Nascimento | Nome, Data Nascimento |
| `CERTIDAO_CASAMENTO` | Certidao de Casamento | Nome, Estado Civil, Regime de Bens, Data Casamento |
| `CERTIDAO_OBITO` | Certidao de Obito | Nome, Data Obito, Estado Civil |
| `COMPROVANTE_RESIDENCIA` | Comprovante de Endereco | Nome, Endereco Completo |

### 2.2 Certidoes (7 tipos)

| Codigo | Nome | Campos Principais |
|--------|------|-------------------|
| `CNDT` | Certidao Negativa de Debitos Trabalhistas | Nome/Razao Social, CPF/CNPJ, Numero, Data/Hora Expedicao |
| `CND_FEDERAL` | Certidao de Regularidade Fiscal Federal | Nome/Razao Social, CPF/CNPJ, Tipo, Validade, Codigo Controle |
| `CND_ESTADUAL` | Certidao Negativa Estadual | Nome/Razao Social, CPF/CNPJ |
| `CND_MUNICIPAL` | Certidao Negativa Municipal | Nome/Razao Social, CPF/CNPJ, SQL, Endereco Imovel |
| `CND_IMOVEL` | Certidao Negativa do Imovel | SQL, Matricula, Endereco |
| `CND_CONDOMINIO` | Certidao de Quitacao Condominial | Nome, Unidade |
| `CONTRATO_SOCIAL` | Contrato Social da Empresa | Razao Social, CNPJ, NIRE, Sede, Administrador |

### 2.3 Documentos do Imovel (6 tipos)

| Codigo | Nome | Campos Principais |
|--------|------|-------------------|
| `MATRICULA_IMOVEL` | Matricula do Imovel | Numero Matricula, Cartorio, Descricao, Proprietarios, Onus |
| `ITBI` | Guia de ITBI | Transmitente, Adquirente, Valor, Base Calculo |
| `VVR` | Valor Venal de Referencia | SQL, Valor Venal, Endereco |
| `IPTU` | Carne/Certidao de IPTU | SQL, Valor Venal, Areas, Endereco |
| `DADOS_CADASTRAIS` | Ficha Cadastral da Prefeitura | SQL, Endereco, Areas, Denominacao |
| `ESCRITURA` | Escritura Publica | Partes, Imovel, Valor, Forma Pagamento |

### 2.4 Documentos do Negocio (3 tipos)

| Codigo | Nome | Campos Principais |
|--------|------|-------------------|
| `COMPROMISSO_COMPRA_VENDA` | Contrato de Promessa | Partes Completas, Imovel, Valor, Forma Pagamento, Termos |
| `PROCURACAO` | Procuracao | Outorgante, Outorgado, Poderes, Tabelionato |
| `COMPROVANTE_PAGAMENTO` | Comprovante Financeiro | Pagador, Beneficiario, Valor, Dados Bancarios |

### 2.5 Documentos Administrativos (3 tipos)

| Codigo | Nome | Campos Principais |
|--------|------|-------------------|
| `PROTOCOLO_ONR` | Protocolo do ONR | Numero Matricula, Cartorio |
| `ASSINATURA_DIGITAL` | Certificado de Assinatura | Nome do Signatario |
| `OUTRO` | Documento Nao Classificado | - |

---

## 3. Detalhamento por Tipo de Documento

### 3.1 RG - Carteira de Identidade

**Descricao:** Documento oficial de identificacao emitido pelos estados brasileiros.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME | Pessoa Natural | MARIA DA SILVA SANTOS |
| CPF | Pessoa Natural | 123.456.789-00 |
| RG | Pessoa Natural | 12.345.678-9 |
| ORGAO EMISSOR DO RG | Pessoa Natural | SSP |
| ESTADO EMISSOR DO RG | Pessoa Natural | SP |
| DATA DE EMISSAO DO RG | Pessoa Natural | 15/03/2010 |
| DATA DE NASCIMENTO | Pessoa Natural | 22/07/1985 |

---

### 3.2 CNH - Carteira Nacional de Habilitacao

**Descricao:** Documento que autoriza o condutor a dirigir veiculos automotores.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME | Pessoa Natural | JOAO CARLOS MENDES |
| CPF | Pessoa Natural | 987.654.321-00 |
| CNH | Pessoa Natural | 04567891234 |
| ORGAO EMISSOR DA CNH | Pessoa Natural | DETRAN-SP |
| DATA DE NASCIMENTO | Pessoa Natural | 12/08/1975 |

---

### 3.3 CERTIDAO_CASAMENTO - Certidao de Casamento

**Descricao:** Certidao de Registro Civil que comprova o casamento e o regime de bens.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME | Pessoa Natural | MARIA DA SILVA SANTOS |
| CPF | Pessoa Natural | 123.456.789-00 |
| DATA DE NASCIMENTO | Pessoa Natural | 22/07/1985 |
| ESTADO CIVIL | Pessoa Natural | CASADA |
| REGIME DE BENS | Pessoa Natural | COMUNHAO PARCIAL DE BENS |
| DATA DO CASAMENTO | Pessoa Natural | 20/11/2010 |
| NACIONALIDADE | Pessoa Natural | BRASILEIRA |
| CONJUGE (para negocio) | Negocio Juridico | CARLOS ALBERTO SANTOS |

**Regimes de Bens Validos:**
- COMUNHAO PARCIAL DE BENS
- COMUNHAO UNIVERSAL DE BENS
- SEPARACAO TOTAL DE BENS
- SEPARACAO OBRIGATORIA DE BENS
- PARTICIPACAO FINAL NOS AQUESTOS

---

### 3.4 COMPROVANTE_RESIDENCIA - Comprovante de Endereco

**Descricao:** Conta de servicos (agua, luz, gas, telefone) que comprova o endereco de residencia.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME | Pessoa Natural | PEDRO HENRIQUE OLIVEIRA |
| LOGRADOURO | Pessoa Natural | RUA DAS FLORES |
| NUMERO | Pessoa Natural | 1250 |
| COMPLEMENTO | Pessoa Natural | APTO 101 BLOCO B |
| BAIRRO | Pessoa Natural | JARDIM PAULISTA |
| CIDADE | Pessoa Natural | SAO PAULO |
| ESTADO | Pessoa Natural | SP |
| CEP | Pessoa Natural | 01310-100 |

---

### 3.5 CNDT - Certidao Negativa de Debitos Trabalhistas

**Descricao:** Certidao emitida pelo TST que comprova inexistencia de debitos trabalhistas.

**Campos Extraiveis (Pessoa Natural):**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME | Pessoa Natural | MARIA DA SILVA SANTOS |
| CPF | Pessoa Natural | 123.456.789-00 |
| NUMERO DA CNDT | Pessoa Natural | 12345678901234567890 |
| DATA DE EXPEDICAO DA CNDT | Pessoa Natural | 28/01/2026 |
| HORA DE EXPEDICAO DA CNDT | Pessoa Natural | 14:32 |

**Campos Extraiveis (Pessoa Juridica):**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| DENOMINACAO | Pessoa Juridica | CONSTRUTORA ALPHA LTDA |
| CNPJ | Pessoa Juridica | 12.345.678/0001-90 |
| NUMERO DA CNDT | Pessoa Juridica | 98765432109876543210 |
| DATA DE EXPEDICAO DA CNDT | Pessoa Juridica | 28/01/2026 |
| HORA DE EXPEDICAO DA CNDT | Pessoa Juridica | 09:45 |

---

### 3.6 CONTRATO_SOCIAL - Contrato Social da Empresa

**Descricao:** Documento constitutivo da pessoa juridica registrado na Junta Comercial.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| DENOMINACAO | Pessoa Juridica | CONSTRUTORA ALPHA LTDA |
| CNPJ | Pessoa Juridica | 12.345.678/0001-90 |
| NIRE | Pessoa Juridica | 35.215.678.901 |
| LOGRADOURO (Sede) | Pessoa Juridica | AVENIDA PAULISTA |
| NUMERO (Sede) | Pessoa Juridica | 1000 |
| COMPLEMENTO (Sede) | Pessoa Juridica | CONJUNTO 1501 |
| BAIRRO (Sede) | Pessoa Juridica | BELA VISTA |
| CIDADE (Sede) | Pessoa Juridica | SAO PAULO |
| ESTADO (Sede) | Pessoa Juridica | SP |
| CEP (Sede) | Pessoa Juridica | 01310-100 |
| INSTRUMENTO CONSTITUTIVO | Pessoa Juridica | CONTRATO SOCIAL E SUAS ALTERACOES |
| JUNTA COMERCIAL | Pessoa Juridica | JUCESP |
| NUMERO DO REGISTRO | Pessoa Juridica | 123.456.789.012 |
| DATA DA SESSAO | Pessoa Juridica | 15/03/2020 |
| NOME DO ADMINISTRADOR | Pessoa Juridica | JOAO CARLOS MENDES |
| CPF DO ADMINISTRADOR | Pessoa Juridica | 987.654.321-00 |
| TIPO DE REPRESENTACAO | Pessoa Juridica | ADMINISTRADOR INDICADO NO CONTRATO SOCIAL |
| CLAUSULA DO ADMINISTRADOR | Pessoa Juridica | CLAUSULA DECIMA SEGUNDA |
| CLAUSULA DOS PODERES | Pessoa Juridica | CLAUSULA DECIMA TERCEIRA |

---

### 3.7 MATRICULA_IMOVEL - Matricula do Registro de Imoveis

**Descricao:** Documento mais importante do imovel, emitido pelo Cartorio de Registro de Imoveis.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NUMERO DA MATRICULA | Dados do Imovel | 123.456 |
| NUMERO DO REGISTRO DE IMOVEIS | Dados do Imovel | 1o |
| CIDADE DO REGISTRO DE IMOVEIS | Dados do Imovel | SAO PAULO |
| ESTADO DO REGISTRO DE IMOVEIS | Dados do Imovel | SP |
| DENOMINACAO | Dados do Imovel | APARTAMENTO |
| AREA TOTAL EM M2 | Dados do Imovel | 85,50 |
| AREA PRIVATIVA EM M2 | Dados do Imovel | 62,30 |
| LOGRADOURO | Dados do Imovel | RUA AUGUSTA |
| NUMERO | Dados do Imovel | 2000 |
| COMPLEMENTO | Dados do Imovel | APARTAMENTO 101, BLOCO A |
| BAIRRO | Dados do Imovel | CERQUEIRA CESAR |
| CIDADE | Dados do Imovel | SAO PAULO |
| ESTADO | Dados do Imovel | SP |
| DESCRICAO CONFORME MATRICULA | Dados do Imovel | APARTAMENTO No 101, LOCALIZADO NO 1o ANDAR... |
| NOME DO PROPRIETARIO | Dados do Imovel | MARIA DA SILVA SANTOS |
| FRACAO IDEAL | Dados do Imovel | 50% |
| REGISTRO DE AQUISICAO | Dados do Imovel | R.4 |
| DATA DO REGISTRO | Dados do Imovel | 15/06/2018 |
| TITULO DE AQUISICAO | Dados do Imovel | COMPRA E VENDA |
| TITULO DO ONUS | Dados do Imovel | ALIENACAO FIDUCIARIA |
| REGISTRO DO ONUS | Dados do Imovel | R.5 |
| DESCRICAO DO ONUS | Dados do Imovel | ALIENACAO FIDUCIARIA EM GARANTIA... |
| EXISTENCIA DE RESSALVA | Dados do Imovel | NAO |

---

### 3.8 COMPROMISSO_COMPRA_VENDA - Contrato de Promessa

**Descricao:** Contrato particular que formaliza a intencao de compra e venda de imovel.

**Campos Extraiveis (Resumo):**

Este documento e o mais completo em termos de campos extraiveis, cobrindo:

- **Pessoa Natural (19 campos):** Dados completos de identificacao, estado civil, domicilio e contatos das partes
- **Pessoa Juridica (9 campos):** Dados de empresas envolvidas na transacao
- **Dados do Imovel (12 campos):** Identificacao completa do imovel objeto da transacao
- **Negocio Juridico (13 campos):** Valores, fracoes, forma de pagamento e termos especiais

**Exemplo de Extracao Completa:**

```
VENDEDOR (Alienante):
- Nome: MARIA DA SILVA SANTOS
- CPF: 123.456.789-00
- RG: 12.345.678-9 (SSP/SP)
- Nacionalidade: BRASILEIRA
- Profissao: ENGENHEIRA CIVIL
- Estado Civil: CASADA
- Regime de Bens: COMUNHAO PARCIAL DE BENS
- Endereco: RUA DAS FLORES, 1250, APTO 101, JARDIM PAULISTA, SAO PAULO/SP, CEP 01310-100
- E-mail: maria.santos@email.com
- Telefone: +55 (11) 99876-5432
- Fracao Ideal: 50%
- Valor da Alienacao: R$ 300.000,00
- Conjuge: CARLOS ALBERTO SANTOS

COMPRADOR (Adquirente):
- Nome: PEDRO HENRIQUE OLIVEIRA
- (demais dados...)
- Fracao Ideal: 100%
- Valor da Aquisicao: R$ 600.000,00

IMOVEL:
- Matricula: 123.456 - 1o RI de SAO PAULO/SP
- Denominacao: APARTAMENTO
- Endereco: RUA AUGUSTA, 2000, APTO 101 BLOCO A, CERQUEIRA CESAR, SAO PAULO/SP
- Area Total: 85,50 m2
- Area Privativa: 62,30 m2

NEGOCIO:
- Valor Total: R$ 600.000,00
- Forma de Pagamento: A VISTA
- Modo de Pagamento: TRANSFERENCIA BANCARIA
- Data do Pagamento: 28/01/2026
- Termos da Promessa: CONFORME CLAUSULA QUINTA...
```

---

### 3.9 ITBI - Guia de Imposto de Transmissao

**Descricao:** Guia de pagamento do imposto municipal sobre transmissao de bens imoveis.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME (Transmitente) | Pessoa Natural | MARIA DA SILVA SANTOS |
| CPF (Transmitente) | Pessoa Natural | 123.456.789-00 |
| SQL | Dados do Imovel | 031.045.0123-4 |
| LOGRADOURO | Dados do Imovel | RUA AUGUSTA |
| NUMERO | Dados do Imovel | 2000 |
| VALOR TOTAL | Negocio Juridico | R$ 600.000,00 |
| NOME (Adquirente) | Negocio Juridico | PEDRO HENRIQUE OLIVEIRA |
| NUMERO DA GUIA | Negocio Juridico | ITBI-2026-789012 |
| BASE DE CALCULO | Negocio Juridico | R$ 600.000,00 |
| VALOR DO ITBI | Negocio Juridico | R$ 18.000,00 |

---

### 3.10 COMPROVANTE_PAGAMENTO - Comprovante Financeiro

**Descricao:** Documento que comprova a realizacao de transferencia bancaria ou pagamento.

**Campos Extraiveis:**

| Campo | Categoria | Exemplo |
|-------|-----------|---------|
| NOME (Pagador) | Pessoa Natural | PEDRO HENRIQUE OLIVEIRA |
| DENOMINACAO (Pagador PJ) | Pessoa Juridica | INVESTIMENTOS BETA LTDA |
| TIPO DE PAGAMENTO | Negocio Juridico | A VISTA |
| MODO DE PAGAMENTO | Negocio Juridico | TRANSFERENCIA BANCARIA |
| DATA DO PAGAMENTO | Negocio Juridico | 28/01/2026 |
| BANCO (Origem) | Negocio Juridico | BANCO DO BRASIL |
| AGENCIA (Origem) | Negocio Juridico | 1234-5 |
| CONTA (Origem) | Negocio Juridico | 12345-6 |
| BANCO (Destino) | Negocio Juridico | ITAU |
| AGENCIA (Destino) | Negocio Juridico | 0987 |
| CONTA (Destino) | Negocio Juridico | 98765-4 |

---

## 4. Campos Compartilhados e Correlacoes

### 4.1 Por que Campos Compartilhados sao Importantes?

Muitos campos aparecem em **multiplos tipos de documentos**. Isso permite:

1. **Validacao cruzada:** Confirmar que os dados de uma pessoa sao consistentes entre documentos
2. **Correlacao de entidades:** Associar documentos diferentes a mesma pessoa/empresa/imovel
3. **Completude:** Preencher campos faltantes usando informacoes de outros documentos

### 4.2 Principais Campos de Correlacao

| Campo | Aparece em | Uso Principal |
|-------|------------|---------------|
| **NOME** | 20 documentos | Identificar a pessoa em todos os documentos da pasta |
| **CPF** | 14 documentos | Correlacao unica e inequivoca de pessoa fisica |
| **CNPJ** | 10 documentos | Correlacao unica de pessoa juridica |
| **SQL (Cadastro Municipal)** | 6 documentos | Correlacionar dados do mesmo imovel |
| **NUMERO DA MATRICULA** | 5 documentos | Identificacao unica do imovel no RI |
| **LOGRADOURO** | 9 documentos | Confirmar que se trata do mesmo imovel |

### 4.3 Exemplo de Correlacao na Pratica

Considere uma pasta de escritura com os seguintes documentos:

```
Pasta FC 515/
├── RG_Maria.pdf
├── Certidao_Casamento_Maria.pdf
├── CNDT_Maria.pdf
├── Comprovante_Residencia_Maria.pdf
├── Matricula_123456.pdf
├── IPTU_2026.pdf
├── VVR.pdf
└── Compromisso.pdf
```

**Correlacao por CPF (123.456.789-00):**

| Documento | Campo NOME | Campo CPF |
|-----------|------------|-----------|
| RG_Maria.pdf | MARIA DA SILVA SANTOS | 123.456.789-00 |
| Certidao_Casamento_Maria.pdf | MARIA DA SILVA SANTOS | 123.456.789-00 |
| CNDT_Maria.pdf | MARIA DA SILVA SANTOS | 123.456.789-00 |
| Comprovante_Residencia_Maria.pdf | MARIA DA SILVA SANTOS | - |
| Compromisso.pdf (Vendedora) | MARIA DA SILVA SANTOS | 123.456.789-00 |

> Sistema identifica que todos esses documentos pertencem a mesma pessoa!

**Correlacao por SQL (031.045.0123-4):**

| Documento | SQL | MATRICULA |
|-----------|-----|-----------|
| Matricula_123456.pdf | - | 123.456 |
| IPTU_2026.pdf | 031.045.0123-4 | - |
| VVR.pdf | 031.045.0123-4 | - |
| Compromisso.pdf | - | 123.456 |

> Sistema identifica que todos esses documentos referem-se ao mesmo imovel!

---

## 5. Exemplos Praticos de Extracao

### 5.1 Extracao de RG

**Input:** Imagem do RG de Maria da Silva Santos

**Output (JSON):**

```json
{
  "tipo_documento": "RG",
  "dados_extraidos": {
    "pn_nome": "MARIA DA SILVA SANTOS",
    "pn_cpf": "123.456.789-00",
    "pn_rg": "12.345.678-9",
    "pn_orgao_emissor_rg": "SSP",
    "pn_estado_emissor_rg": "SP",
    "pn_data_emissao_rg": "15/03/2010",
    "pn_data_nascimento": "22/07/1985"
  }
}
```

### 5.2 Extracao de Matricula de Imovel

**Input:** PDF da Matricula 123.456

**Output (JSON):**

```json
{
  "tipo_documento": "MATRICULA_IMOVEL",
  "dados_extraidos": {
    "im_matricula_numero": "123.456",
    "im_matricula_cartorio_numero": "1o",
    "im_matricula_cartorio_cidade": "SAO PAULO",
    "im_matricula_cartorio_estado": "SP",
    "im_denominacao": "APARTAMENTO",
    "im_area_total": "85,50",
    "im_area_privativa": "62,30",
    "im_logradouro": "RUA AUGUSTA",
    "im_numero": "2000",
    "im_complemento": "APARTAMENTO 101, BLOCO A",
    "im_bairro": "CERQUEIRA CESAR",
    "im_cidade": "SAO PAULO",
    "im_estado": "SP",
    "im_descricao_conforme_matricula": "APARTAMENTO No 101, LOCALIZADO NO 1o ANDAR DO BLOCO A DO CONDOMINIO RESIDENCIAL AUGUSTA PARK...",
    "proprietarios": [
      {
        "im_prop_nome": "MARIA DA SILVA SANTOS",
        "im_prop_fracao_ideal": "50%",
        "im_prop_registro_aquisicao": "R.4",
        "im_prop_data_registro": "15/06/2018",
        "im_prop_titulo_aquisicao": "COMPRA E VENDA"
      },
      {
        "im_prop_nome": "CARLOS ALBERTO SANTOS",
        "im_prop_fracao_ideal": "50%",
        "im_prop_registro_aquisicao": "R.4",
        "im_prop_data_registro": "15/06/2018",
        "im_prop_titulo_aquisicao": "COMPRA E VENDA"
      }
    ],
    "onus": [
      {
        "im_onus_titulo": "ALIENACAO FIDUCIARIA",
        "im_onus_registro": "R.5",
        "im_onus_data_registro": "15/06/2018",
        "im_onus_descricao": "ALIENACAO FIDUCIARIA EM GARANTIA DE FINANCIAMENTO IMOBILIARIO, EM FAVOR DA CAIXA ECONOMICA FEDERAL, NO VALOR DE R$ 300.000,00",
        "titulares": [
          {
            "im_onus_titular_nome": "CAIXA ECONOMICA FEDERAL",
            "im_onus_titular_fracao": "100%"
          }
        ]
      }
    ],
    "im_ressalva_existencia": "NAO"
  }
}
```

### 5.3 Extracao de CNDT (Pessoa Natural)

**Input:** PDF da CNDT de Maria

**Output (JSON):**

```json
{
  "tipo_documento": "CNDT",
  "tipo_titular": "PESSOA_NATURAL",
  "dados_extraidos": {
    "pn_nome": "MARIA DA SILVA SANTOS",
    "pn_cpf": "123.456.789-00",
    "pn_cndt_numero": "12345678901234567890",
    "pn_cndt_data_expedicao": "28/01/2026",
    "pn_cndt_hora_expedicao": "14:32"
  }
}
```

---

## Resumo

Este documento serve como referencia rapida para entender:

- **26 tipos de documentos** que o sistema reconhece
- **181 campos unicos** distribuidos em 4 categorias
- **7 campos principais** que permitem correlacao entre documentos
- **Exemplos praticos** de como os dados sao extraidos

Para informacoes mais detalhadas sobre cada campo, consulte:
- `execution/campos_e_documentos.json` - Estrutura completa em formato JSON
- `Guia-de-campos-e-variaveis/*.md` - Fonte da verdade dos campos

---

*Documento gerado automaticamente. Fonte da verdade: `Guia-de-campos-e-variaveis/*.md`*
