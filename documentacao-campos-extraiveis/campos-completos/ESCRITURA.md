# ESCRITURA - Escritura Publica

**Complexidade de Extracao**: ALTA
**Schema Fonte**: `execution/schemas/escritura.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Escritura Publica e um documento publico lavrado por tabeliao de notas que formaliza atos juridicos como compra e venda, doacao, permuta, dacao em pagamento ou cessao de direitos sobre imoveis. E o instrumento legal obrigatorio para a transferencia de propriedade imobiliaria de valor superior ao limite legal, conferindo fe publica ao negocio juridico. Pode ser lavrada presencialmente no cartorio ou por videoconferencia (conforme Provimento CNJ 149/2023).

A escritura contem a qualificacao completa das partes (outorgantes e outorgados), descricao detalhada do imovel, valor da transacao, forma de pagamento, certidoes apresentadas e clausulas especiais do negocio. Apos lavrada, deve ser registrada no Cartorio de Registro de Imoveis competente para efetivar a transferencia de propriedade.

### 1.2 Padroes de Identificacao Visual

- "ESCRITURA PUBLICA"
- "TABELIAO DE NOTAS"
- "OUTORGANTE" / "OUTORGANTES"
- "OUTORGADO" / "OUTORGADOS"
- "COMPRA E VENDA" / "DOACAO" / "PERMUTA"
- "MINUTA" (quando ainda nao lavrada)
- "LAVRATURA" / "LAVRADA"
- Numero de livro e folhas (quando lavrada)
- Selo digital (quando lavrada)

### 1.3 Formatos Comuns

| Formato | Descricao | Caracteristicas |
|---------|-----------|-----------------|
| Minuta | Versao preliminar antes da lavratura | Sem livro, folhas, selo digital; possui "MINUTA" no cabecalho |
| Escritura Lavrada | Versao final apos assinatura das partes | Possui livro, folhas, selo digital, data de lavratura |
| Traslado | Copia autenticada da escritura lavrada | Extraida do livro de notas |
| Certidao | Certidao do teor da escritura | Emitida pelo tabelionato |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Regex | Descricao | Exemplo | Nivel Extracao | Confianca |
|-------|------|-------|-----------|---------|----------------|-----------|
| tipo_escritura | string | - | Tipo do ato juridico | "COMPRA E VENDA", "DOACAO", "PERMUTA" | 2 | Alta |
| outorgantes | array | - | Lista de outorgantes (vendedores/doadores) | [{"nome": "JOAO DA SILVA", "cpf": "123.456.789-00"}] | 3 | Alta |
| outorgados | array | - | Lista de outorgados (compradores/donatarios) | [{"nome": "MARIA SANTOS", "cpf": "987.654.321-00"}] | 3 | Alta |
| imovel | object | - | Dados do imovel objeto da escritura | {"matricula": "123456", "cartorio_ri": "1o OFICIAL DE RI"} | 3 | Alta |
| valor_transacao | number | R\$\s*[\d.,]+ | Valor total da transacao | 615000.00 | 1 | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Regex | Descricao | Exemplo | Nivel Extracao | Confianca | Quando Presente |
|-------|------|-------|-----------|---------|----------------|-----------|-----------------|
| tabelionato | string | - | Tabelionato de notas responsavel | "2o TABELIAO DE NOTAS DE SAO PAULO" | 2 | Alta | Lavrada |
| livro | string | \d+ | Numero do livro | "2345" | 1 | Alta | Lavrada |
| folhas | string | \d+(/\d+)? | Numero das folhas (inicio/fim) | "123/125" | 1 | Alta | Lavrada |
| forma_pagamento | object | - | Forma e condicoes de pagamento | {"a_vista": 100000, "financiado": 400000} | 2 | Media | Quando detalhado |
| certidoes_apresentadas | array | - | Lista de certidoes apresentadas | ["CNDT", "CND Municipal", "Matricula Atualizada"] | 3 | Media | Sempre |
| clausulas_especiais | array | - | Clausulas especiais da escritura | ["Clausula de inalienabilidade", "Reserva de usufruto"] | 3 | Baixa | Quando existentes |
| dados_itbi | object | - | Dados do ITBI pago | {"guia": "2026.123.456", "valor": 15000.00} | 2 | Alta | Quando pago |
| selo_digital | string | [A-Z0-9]+ | Codigo do selo digital | "ABCD1234567890" | 1 | Alta | Lavrada |
| data_lavratura | date | \d{2}/\d{2}/\d{4} | Data de lavratura da escritura | "16/11/2023" | 1 | Alta | Lavrada |
| status_minuta | string | (MINUTA\|LAVRADA\|REGISTRADA) | Status do documento | "MINUTA", "LAVRADA" | 2 | Alta | Sempre |

### 2.3 Objetos Nested

#### 2.3.1 imovel (object)

Objeto contendo todos os dados do imovel objeto da transacao.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| imovel.tipo | string | Tipo do imovel | "APARTAMENTO", "CASA", "TERRENO" | Sim |
| imovel.descricao | string | Descricao completa do imovel | "Unidade autonoma n. 124 no 12o andar do Edificio Serra do Mar" | Sim |
| imovel.endereco | string | Endereco completo | "Rua Francisco Cruz, n. 515, Vila Mariana, Sao Paulo - SP" | Sim |
| imovel.matricula | string | Numero da matricula | "46.511", "116.239" | Sim |
| imovel.cartorio_ri | string | Cartorio de Registro de Imoveis | "1o Oficial de Registro de Imoveis de Sao Paulo" | Sim |
| imovel.sql | string | SQL/Cadastro Municipal | "039.080.0244-3", "098.064.0103-4" | Nao |
| imovel.area_privativa | number | Area privativa em m2 | 70.83 | Nao |
| imovel.area_comum | number | Area comum em m2 | 12.66 | Nao |
| imovel.area_total | number | Area total em m2 | 111.49, 90.379 | Nao |
| imovel.fracao_ideal | number | Fracao ideal do terreno | 0.0065228 | Nao |

**Campos adicionais extraidos na pratica:**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| imovel.contribuinte | string | Numero do contribuinte (SQL) | "039.080.0244-3" |
| imovel.vagas_garagem | number | Quantidade de vagas | 1 |
| imovel.descricao_vagas | string | Descricao das vagas | "Uma vaga indeterminada na garagem" |
| imovel.unidade | string | Numero da unidade | "124", "11" |
| imovel.bloco_torre | string | Bloco ou torre | "B" |
| imovel.condominio | string | Nome do condominio | "Edificio Serra do Mar" |

#### 2.3.2 forma_pagamento (object)

Objeto contendo detalhes da forma de pagamento.

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| forma_pagamento.a_vista | number | Valor pago a vista | 615000.00 |
| forma_pagamento.financiado | number | Valor financiado | 400000.00 |
| forma_pagamento.banco_financiador | string | Nome do banco financiador | "CAIXA ECONOMICA FEDERAL" |
| forma_pagamento.tipo_financiamento | string | Tipo de financiamento | "SFH", "SFI", "DIRETO" |

**Campos adicionais extraidos na pratica:**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| forma_pagamento.forma_pagamento | string | Descricao resumida | "A VISTA" |
| forma_pagamento.descricao_detalhada | string | Descricao detalhada do pagamento | "R$ 36.900,00 pagos como sinal a Quinto Andar e R$ 578.100,00 via TED" |
| forma_pagamento.parcelas | number | Numero de parcelas | null |
| forma_pagamento.contrato_financiamento | string | Numero do contrato de financiamento | null |

#### 2.3.3 dados_itbi (object)

Objeto contendo dados do ITBI (Imposto de Transmissao de Bens Imoveis).

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| dados_itbi.numero_guia | string | Numero da guia de recolhimento | "55114447-5 e 55114454-8" |
| dados_itbi.valor | number | Valor recolhido | 18450.01 |
| dados_itbi.data_pagamento | date | Data do pagamento | "16/11/2023" |

**Campos adicionais extraidos na pratica:**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| dados_itbi.aliquota | number | Aliquota aplicada (%) | 3.0, 0.03 |

### 2.4 Arrays

#### 2.4.1 outorgantes (array)

Lista de outorgantes (vendedores, doadores, permutantes).

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| outorgantes[].qualificacao | string | Qualificacao da parte | "VENDEDOR", "DOADOR", "PERMUTANTE" |
| outorgantes[].nome | string | Nome completo | "RODOLFO WOLFGANG ORTRIWANO" |
| outorgantes[].nacionalidade | string | Nacionalidade | "BRASILEIRO", "BRASILEIRA" |
| outorgantes[].estado_civil | string | Estado civil | "CASADO", "SOLTEIRO", "DIVORCIADO" |
| outorgantes[].regime_bens | string | Regime de bens (se casado) | "COMUNHAO PARCIAL DE BENS", "COMUNHAO UNIVERSAL DE BENS" |
| outorgantes[].profissao | string | Profissao | "JORNALISTA", "APOSENTADO", "BANCARIO" |
| outorgantes[].rg | string | Numero do RG | "6.075.352-3 SSP/SP" |
| outorgantes[].orgao_rg | string | Orgao emissor do RG | "SSP/SP", "SSP-SP" |
| outorgantes[].cpf | string | Numero do CPF | "585.096.668-49" |
| outorgantes[].endereco | object/string | Endereco completo | "Avenida Vila Ema, n. 1006, apartamento n. 102, Vila Prudente, Sao Paulo - SP, CEP 03156-000" |
| outorgantes[].conjuge | object | Dados do conjuge (se casado) | {"nome": "ELIZETE APARECIDA SILVA", "cpf": "949.735.638-20"} |

**Subcampos do conjuge:**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| outorgantes[].conjuge.nome | string | Nome do conjuge | "ELIZETE APARECIDA SILVA" |
| outorgantes[].conjuge.cpf | string | CPF do conjuge | "949.735.638-20" |
| outorgantes[].conjuge.rg | string | RG do conjuge | "7.878.936-9 SSP/SP" |

#### 2.4.2 outorgados (array)

Lista de outorgados (compradores, donatarios, permutantes). Mesma estrutura dos outorgantes.

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| outorgados[].qualificacao | string | Qualificacao da parte | "COMPRADOR", "DONATARIO", "PERMUTANTE" |
| outorgados[].nome | string | Nome completo | "MARINA AYUB" |
| outorgados[].nacionalidade | string | Nacionalidade | "BRASILEIRA" |
| outorgados[].estado_civil | string | Estado civil | "SOLTEIRA" |
| outorgados[].regime_bens | string | Regime de bens (se casado) | null |
| outorgados[].profissao | string | Profissao | "DESENHISTA INDUSTRIAL", "ENFERMEIRA" |
| outorgados[].rg | string | Numero do RG | "35.540.462-X SSP/SP" |
| outorgados[].orgao_rg | string | Orgao emissor do RG | "SSP/SP" |
| outorgados[].cpf | string | Numero do CPF | "368.366.718-43" |
| outorgados[].endereco | object/string | Endereco completo | "Rua Doutor Neto de Araujo, n. 264, apartamento n. 210, Vila Mariana, Sao Paulo - SP" |
| outorgados[].conjuge | object | Dados do conjuge (se casado) | null |

#### 2.4.3 certidoes_apresentadas (array)

Lista de certidoes apresentadas para lavratura da escritura.

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| certidoes_apresentadas[].tipo | string | Tipo da certidao | "MATRICULA", "IPTU", "CNDT", "INDISPONIBILIDADE" |
| certidoes_apresentadas[].descricao | string | Descricao da certidao | "Certidoes de inteiro teor das matriculas" |
| certidoes_apresentadas[].data_emissao | date | Data de emissao | "14/11/2023" |
| certidoes_apresentadas[].validade | date | Data de validade | "07/04/2024" |

**Tipos comuns de certidoes:**

- MATRICULA - Certidao de inteiro teor da matricula
- IPTU - Certidao de debitos de tributos imobiliarios
- CNDT - Certidao Negativa de Debitos Trabalhistas
- INDISPONIBILIDADE - Consulta a Central de Indisponibilidade
- CND FEDERAL - Certidao da Receita Federal
- CND ESTADUAL - Certidao de tributos estaduais
- CONDOMINIO - Certidao de debitos condominiais

#### 2.4.4 clausulas_especiais (array)

Lista de clausulas especiais do negocio. Pode ser array de strings ou array de objetos.

**Formato string:**

```
["Videoconferencia conforme Provimento CNJ 149/2023", "Intermediacao por Quinto Andar"]
```

**Clausulas especiais comuns:**

| Clausula | Descricao |
|----------|-----------|
| Inalienabilidade | Proibicao de alienacao por periodo determinado |
| Impenhorabilidade | Proibicao de penhora por dividas |
| Incomunicabilidade | Bem nao se comunica com conjuge |
| Reserva de usufruto | Vendedor mantem usufruto vitalicio |
| Clausula resolutiva | Condicao de resolucao do negocio |
| Videoconferencia | Lavratura por videoconferencia (Provimento CNJ 149/2023) |

#### 2.4.5 intervenientes (array)

Lista de intervenientes no negocio (intermediadores, anuentes, etc.).

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| intervenientes[].nome | string | Nome/Denominacao | "QUINTO ANDAR SERVICOS IMOBILIARIOS LTDA" |
| intervenientes[].cnpj | string | CNPJ (se PJ) | "16.788.643/0001-81" |
| intervenientes[].papel | string | Papel no negocio | "INTERMEDIADORA" |

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| outorgantes[].nome | NOME | Nome completo | SIM |
| outorgantes[].cpf | CPF | Numero do CPF | SIM |
| outorgantes[].rg | RG | Numero do RG | SIM |
| outorgantes[].orgao_rg | ORGAO EMISSOR DO RG | Orgao emissor | SIM |
| (extraido do orgao_rg) | ESTADO EMISSOR DO RG | UF do orgao emissor | SIM |
| outorgantes[].nacionalidade | NACIONALIDADE | Nacionalidade | SIM |
| outorgantes[].profissao | PROFISSAO | Profissao | SIM |
| outorgantes[].estado_civil | ESTADO CIVIL | Estado civil | SIM |
| outorgantes[].regime_bens | REGIME DE BENS | Regime de bens | SIM |
| outorgantes[].endereco | LOGRADOURO | Logradouro | SIM |
| outorgantes[].endereco | NUMERO | Numero | SIM |
| outorgantes[].endereco | BAIRRO | Bairro | SIM |
| outorgantes[].endereco | CIDADE | Cidade | SIM |
| outorgantes[].endereco | ESTADO | Estado | SIM |
| outorgantes[].endereco | CEP | CEP | SIM |
| outorgados[].nome | NOME | Nome completo | SIM |
| outorgados[].cpf | CPF | Numero do CPF | SIM |
| outorgados[].rg | RG | Numero do RG | SIM |
| outorgados[].orgao_rg | ORGAO EMISSOR DO RG | Orgao emissor | SIM |
| outorgados[].nacionalidade | NACIONALIDADE | Nacionalidade | SIM |
| outorgados[].profissao | PROFISSAO | Profissao | SIM |
| outorgados[].estado_civil | ESTADO CIVIL | Estado civil | SIM |
| outorgados[].regime_bens | REGIME DE BENS | Regime de bens | SIM |
| outorgados[].endereco | LOGRADOURO, NUMERO, BAIRRO, CIDADE, ESTADO, CEP | Endereco completo | SIM |

### 3.2 Campos que Alimentam "Pessoa Juridica"

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| outorgantes[].nome (se PJ) | DENOMINACAO | Razao social | SIM |
| outorgantes[].cpf (se CNPJ) | CNPJ | CNPJ | SIM |
| outorgantes[].endereco (se PJ) | LOGRADOURO DA SEDE | Logradouro da sede | SIM |
| outorgantes[].endereco (se PJ) | NUMERO DA SEDE | Numero da sede | SIM |
| outorgantes[].endereco (se PJ) | BAIRRO DA SEDE | Bairro da sede | SIM |
| outorgantes[].endereco (se PJ) | CIDADE DA SEDE | Cidade da sede | SIM |
| outorgantes[].endereco (se PJ) | ESTADO DA SEDE | Estado da sede | SIM |
| outorgantes[].endereco (se PJ) | CEP DA SEDE | CEP da sede | SIM |
| intervenientes[].nome | DENOMINACAO | Denominacao | SIM |
| intervenientes[].cnpj | CNPJ | CNPJ | SIM |
| (representante PJ) | NOME DO ADMINISTRADOR | Nome do administrador | SIM |
| (representante PJ) | CPF DO ADMINISTRADOR | CPF do administrador | SIM |

### 3.3 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| imovel.matricula | NUMERO DA MATRICULA | Numero da matricula | SIM |
| imovel.cartorio_ri | NUMERO DO REGISTRO DE IMOVEIS | Numero do RI | SIM |
| (extraido de cartorio_ri) | CIDADE DO REGISTRO DE IMOVEIS | Cidade do RI | SIM |
| imovel.tipo | DENOMINACAO DO IMOVEL | Tipo do imovel | SIM |
| imovel.descricao | DESCRICAO CONFORME MATRICULA | Descricao completa | SIM |
| imovel.endereco | LOGRADOURO | Logradouro | SIM |
| imovel.endereco | NUMERO | Numero | SIM |
| imovel.endereco | COMPLEMENTO | Complemento | SIM |
| imovel.endereco | BAIRRO | Bairro | SIM |
| imovel.endereco | CIDADE | Cidade | SIM |
| imovel.endereco | ESTADO | Estado | SIM |
| imovel.sql | SQL | Cadastro municipal | Nao (CND IMOVEL) |
| imovel.area_total | AREA TOTAL EM M2 | Area total m2 | Nao (MATRICULA) |
| imovel.area_privativa | AREA CONSTRUIDA EM M2 | Area privativa m2 | Nao (MATRICULA) |

### 3.4 Campos que Alimentam "Negocio Juridico"

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| valor_transacao | VALOR TOTAL | Valor total da transacao | SIM |
| outorgantes[].nome | NOME DO ALIENANTE | Nome do alienante | SIM |
| outorgados[].nome | NOME DO ADQUIRENTE | Nome do adquirente | SIM |
| forma_pagamento.forma_pagamento | TIPO DE PAGAMENTO | Tipo de pagamento | SIM |
| forma_pagamento.descricao_detalhada | MODO DE PAGAMENTO | Modo de pagamento | SIM |
| dados_itbi.numero_guia | itbi_numero_guia | Numero da guia ITBI | Nao (ITBI) |
| dados_itbi.valor | itbi_valor | Valor do ITBI | Nao (ITBI) |
| dados_itbi.data_pagamento | itbi_data_pagamento | Data do pagamento | Nao (ITBI) |

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| tabelionato | Referencia interna do cartorio, nao usado na minuta final |
| livro | Metadado de registro, identificacao interna |
| folhas | Metadado de registro, identificacao interna |
| selo_digital | Metadado de autenticacao digital |
| status_minuta | Campo de controle interno do pipeline |
| certidoes_apresentadas | Lista de referencia, dados extraidos dos proprios documentos |
| clausulas_especiais | Texto juridico especifico de cada negocio, tratado manualmente |
| onus_gravames | Extraido da MATRICULA_IMOVEL |

---

## 4. EXEMPLO DE EXTRACAO REAL

### 4.1 Exemplo 1: Venda e Compra de Apartamento (FC 515 - 124)

**Fonte**: `.tmp/contextual/FC_515_124_p280509/017_ESCRITURA.json`

```json
{
  "tipo_documento": "ESCRITURA",
  "dados_catalogados": {
    "tipo_escritura": "VENDA E COMPRA",
    "cartorio": "2o Tabeliao de Notas de Sao Paulo",
    "tabeliao": "MARIA HELENA DA SILVA",
    "livro": null,
    "folhas": null,
    "data_lavratura": "16/11/2023",
    "partes": {
      "outorgantes_vendedores": [
        {
          "nome": "RODOLFO WOLFGANG ORTRIWANO",
          "cpf": "585.096.668-49",
          "rg": "6.075.352-3 SSP/SP",
          "estado_civil": "CASADO",
          "profissao": "JORNALISTA",
          "nacionalidade": "BRASILEIRO",
          "regime_bens": "COMUNHAO PARCIAL DE BENS",
          "conjuge": {
            "nome": "ELIZETE APARECIDA SILVA",
            "cpf": "949.735.638-20",
            "rg": "7.878.936-9 SSP/SP"
          },
          "endereco": "Avenida Vila Ema, n. 1006, apartamento n. 102, Vila Prudente, Sao Paulo - SP, CEP 03156-000"
        }
      ],
      "outorgados_compradores": [
        {
          "nome": "MARINA AYUB",
          "cpf": "368.366.718-43",
          "rg": "35.540.462-X SSP/SP",
          "estado_civil": "SOLTEIRA",
          "profissao": "DESENHISTA INDUSTRIAL",
          "nacionalidade": "BRASILEIRA",
          "endereco": "Rua Doutor Neto de Araujo, n. 264, apartamento n. 210, Vila Mariana, Sao Paulo - SP, CEP 04111-000"
        }
      ],
      "intervenientes": [
        {
          "nome": "QUINTO ANDAR SERVICOS IMOBILIARIOS LTDA",
          "cnpj": "16.788.643/0001-81",
          "papel": "INTERMEDIADORA"
        }
      ]
    },
    "imovel": {
      "tipo": "APARTAMENTO E VAGA",
      "descricao": "Unidade autonoma n. 124 no 12o andar do Edificio Serra do Mar (Bloco B) e uma vaga indeterminada na garagem",
      "endereco_completo": "Rua Francisco Cruz, n. 515, Vila Mariana, Sao Paulo - SP",
      "matricula": "46.511 e 46.512",
      "cartorio_ri": "1o Oficial de Registro de Imoveis de Sao Paulo - SP",
      "sql_inscricao_municipal": "039.080.0244-3",
      "area_total_m2": 111.49,
      "vagas_garagem": 1,
      "unidade": "124",
      "bloco_torre": "B",
      "condominio": "Edificio Serra do Mar"
    },
    "valores": {
      "valor_transacao": 615000.0,
      "valor_declarado_itbi": 615000.0,
      "valor_venal_referencia": 301147.0,
      "valor_recursos_proprios": 615000.0
    },
    "pagamento": {
      "forma_pagamento": "A VISTA",
      "descricao_detalhada": "R$ 36.900,00 pagos como sinal a Quinto Andar e R$ 578.100,00 pagos via TED ao vendedor Rodolfo Wolfgang Ortriwano"
    },
    "itbi": {
      "guia_numero": "55114447-5 e 55114454-8",
      "valor_recolhido": 18450.01,
      "data_recolhimento": "16/11/2023",
      "aliquota": 0.03
    },
    "certidoes_apresentadas": [
      {"tipo": "MATRICULA", "data_emissao": "14/11/2023"},
      {"tipo": "IPTU", "data_emissao": "26/10/2023", "validade": "07/04/2024"},
      {"tipo": "CNDT", "validade": "23/04/2024"},
      {"tipo": "INDISPONIBILIDADE", "data_emissao": "16/11/2023"}
    ],
    "clausulas_especiais": [
      "Videoconferencia conforme Provimento CNJ 149/2023",
      "Intermediacao por Quinto Andar com retencao de sinal"
    ],
    "onus_gravames": "Livre e desembaracado"
  }
}
```

### 4.2 Exemplo 2: Venda com Transmissao de Usufruto (GS 357 - 11)

**Fonte**: `.tmp/contextual/GS_357_11_p281773/014_ESCRITURA.json`

```json
{
  "tipo_documento": "ESCRITURA",
  "dados_catalogados": {
    "tipo_escritura": "COMPRA E VENDA",
    "cartorio": "2o Tabeliao de Notas de Sao Paulo",
    "data_lavratura": "17/11/2023",
    "partes": {
      "outorgantes_vendedores": [
        {
          "nome": "FERNANDO FAEDO DA SILVA",
          "cpf": "325.593.198-37",
          "estado_civil": "CASADO",
          "profissao": "BANCARIO",
          "regime_bens": "COMUNHAO PARCIAL DE BENS",
          "conjuge": {"nome": "CINTIA VIANA DE ARAUJO SILVA", "cpf": "351.890.328-41"}
        },
        {
          "nome": "MILTON PEREIRA DA SILVA",
          "cpf": "001.526.378-93",
          "estado_civil": "CASADO",
          "profissao": "APOSENTADO",
          "regime_bens": "COMUNHAO UNIVERSAL DE BENS",
          "conjuge": {"nome": "MARIA CRISTINA FAEDO DA SILVA", "cpf": "007.379.008-73"}
        }
      ],
      "outorgados_compradores": [
        {
          "nome": "GLAUCIA RODRIGUES",
          "cpf": "162.592.798-33",
          "estado_civil": "SOLTEIRA",
          "profissao": "ENFERMEIRA"
        }
      ]
    },
    "imovel": {
      "tipo": "APARTAMENTO",
      "descricao": "Apartamento n. 11, 1o andar, Edificio Oasis Blue, Condominio Oasis Residencial Club Lapa",
      "endereco_completo": "Rua George Schmidt, n. 357, Lapa, Sao Paulo - SP",
      "matricula": "116.239",
      "cartorio_ri": "10o Oficial de Registro de Imoveis de Sao Paulo - SP",
      "sql_inscricao_municipal": "098.064.0103-4",
      "area_total_m2": 90.379,
      "vagas_garagem": 1,
      "unidade": "11",
      "condominio": "OASIS RESIDENCIAL CLUB LAPA"
    },
    "valores": {
      "valor_transacao": 558000.0,
      "valor_recursos_proprios": 558000.0
    },
    "pagamento": {
      "forma_pagamento": "A VISTA",
      "descricao_detalhada": "R$ 33.480,00 como sinal via QR Code para Quinto Andar; R$ 524.520,00 via TED para o vendedor Fernando"
    },
    "itbi": {
      "guia_numero": "55115398-9",
      "valor_recolhido": 16740.0,
      "data_recolhimento": "17/11/2023",
      "aliquota": 3.0
    },
    "clausulas_especiais": [
      "Incomunicabilidade",
      "Impenhorabilidade"
    ],
    "onus_gravames": "Usufruto vitalicio (sendo transmitido/cancelado nesta escritura)",
    "observacoes": "Venda conjunta de nua propriedade e usufruto."
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| imovel.matricula | MATRICULA_IMOVEL, ITBI, COMPROMISSO_COMPRA_VENDA, VVR, IPTU, CND_IMOVEL | Identificar imovel unico |
| imovel.sql | ITBI, VVR, IPTU, DADOS_CADASTRAIS, CND_MUNICIPAL | Identificar imovel no cadastro municipal |
| outorgantes[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Identificar pessoa |
| outorgados[].cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Identificar pessoa |
| valor_transacao | ITBI, COMPROMISSO_COMPRA_VENDA | Validar valor declarado |
| forma_pagamento | COMPROVANTE_PAGAMENTO | Confirmar pagamento |

### 5.2 Matriz de Correlacao Detalhada

| Documento Correlato | Campos Correlacionados | Tipo de Validacao |
|--------------------|------------------------|-------------------|
| MATRICULA_IMOVEL | matricula, cartorio_ri, descricao, endereco, area | Validar descricao do imovel |
| ITBI | matricula, sql, valor_transacao, alienante, adquirente | Validar base de calculo e partes |
| COMPROMISSO_COMPRA_VENDA | partes, imovel, valor, pagamento | Verificar termos do compromisso |
| RG | nome, rg, orgao_rg, data_nascimento | Confirmar identidade |
| CERTIDAO_CASAMENTO | nome, estado_civil, regime_bens, conjuge | Validar estado civil |
| CNDT | nome/denominacao, cpf/cnpj | Comprovar regularidade trabalhista |
| CND_FEDERAL | nome/denominacao, cpf/cnpj | Comprovar regularidade fiscal |
| VVR | matricula, sql, valor_venal | Validar valor de referencia |
| IPTU | sql, endereco, valor_venal | Validar dados cadastrais |

### 5.3 Fluxo de Validacao

```
ESCRITURA
    |
    +-- MATRICULA_IMOVEL --> Validar descricao, propriedade, onus
    |
    +-- ITBI --> Validar valor declarado, partes, guia paga
    |
    +-- RG/CNH (outorgantes) --> Validar identidade dos vendedores
    |
    +-- RG/CNH (outorgados) --> Validar identidade dos compradores
    |
    +-- CERTIDAO_CASAMENTO --> Validar estado civil e regime de bens
    |
    +-- CNDT --> Comprovar inexistencia de debitos trabalhistas
    |
    +-- CND_FEDERAL --> Comprovar regularidade fiscal federal
    |
    +-- COMPROVANTE_PAGAMENTO --> Confirmar quitacao
```

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Status |
|-----------|-----------|--------|
| cpf_digito_verificador | Validar digitos verificadores do CPF | Implementada |
| matricula_valida | Validar formato da matricula | Implementada |
| sql_formato_valido | Validar formato do SQL municipal | Implementada |
| soma_valores_pagamento | Verificar se a_vista + financiado = valor_transacao | Implementada |
| datas_coerentes | Verificar sequencia logica de datas | Implementada |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Criticidade |
|-----------|-----------|-------------|
| Valor ITBI vs Valor Transacao | ITBI deve ser calculado sobre o maior valor (transacao ou venal referencia) | Alta |
| Estado Civil vs Regime Bens | Se casado, deve ter regime de bens informado | Alta |
| Outorgantes = Proprietarios | Outorgantes devem ser os proprietarios na matricula | Alta |
| Certidoes dentro da validade | Certidoes apresentadas devem estar vigentes | Media |
| Ausencia de onus impeditivos | Matricula nao deve ter penhoras, arrestos, etc. | Alta |

### 6.3 Conferencias Manuais Recomendadas

- [ ] Verificar se nomes conferem com documentos de identidade
- [ ] Confirmar estado civil com certidao de casamento
- [ ] Validar inexistencia de acoes judiciais contra vendedores
- [ ] Confirmar quitacao de IPTU e condominio
- [ ] Verificar assinatura de todos os outorgantes e conjuges

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Formula/Logica |
|-------|----------------|
| forma_pagamento.a_vista | valor_transacao - financiado (quando financiado > 0) |
| status_minuta | "LAVRADA" se selo_digital presente, senao "MINUTA" |
| aliquota_itbi | valor_itbi / base_calculo (geralmente 3% em SP) |

### 7.2 Campos Inferidos

| Campo | Inferencia |
|-------|------------|
| status_minuta | Inferido pela presenca/ausencia de selo_digital e numero de livro |
| qualificacao | Inferido pelo tipo de escritura (COMPRA E VENDA = VENDEDOR/COMPRADOR) |
| tipo_parte | Inferido pelo formato do documento (CPF = PF, CNPJ = PJ) |

### 7.3 Campos Raros ou Especiais

| Campo | Descricao | Frequencia |
|-------|-----------|------------|
| clausulas_especiais.inalienabilidade | Clausula de restricao de venda | Raro |
| clausulas_especiais.reserva_usufruto | Vendedor mantem usufruto | Raro |
| forma_pagamento.tipo_financiamento | Tipo de financiamento (SFH, SFI, SBPE) | Quando financiado |
| onus_gravames | Descricao de onus existentes | Quando existentes |
| dados_itbi | Pode nao estar presente em minutas preliminares | Escritura lavrada |

### 7.4 Particularidades de Extracao

1. **Conjuges**: Quando outorgante e casado, o conjuge deve ser extraido como campo separado dentro do objeto do outorgante
2. **Multiplos imoveis**: Algumas escrituras envolvem mais de um imovel (ex: apartamento + vaga). Cada matricula deve ser listada
3. **Multiplos vendedores**: Comum em casos de inventario ou copropriedade. Todos devem ser listados
4. **Pessoa Juridica**: Quando parte e PJ, extrair CNPJ em vez de CPF, e dados do representante legal
5. **Videoconferencia**: Escrituras lavradas por videoconferencia devem mencionar o Provimento CNJ 149/2023

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | `execution/schemas/escritura.json` |
| Prompt v1 | `execution/prompts/escritura.txt` |
| Prompt v2 | `execution/prompts/escritura_v2.txt` |
| Prompt v3 | `execution/prompts/escritura_v3.txt` |
| Mapeamento | `execution/mapeamento_documento_campos.json` |

### 8.2 Exemplos Reais

| Caso | Caminho | Caracteristicas |
|------|---------|-----------------|
| FC 515 - 124 | `.tmp/contextual/FC_515_124_p280509/017_ESCRITURA.json` | Venda e compra, videoconferencia, intermediadora |
| GS 357 - 11 | `.tmp/contextual/GS_357_11_p281773/014_ESCRITURA.json` | Venda com transmissao de usufruto, multiplos vendedores |

### 8.3 Documentacao Relacionada

- `DOCUMENTOS_E_CAMPOS_REFERENCIA.md` - Referencia geral de documentos e campos
- `documentacao-campos-extraiveis/campos-uteis/` - Campos utilizados nas minutas
- `Guia-de-campos-e-variaveis/` - Guia detalhado de campos

---

## 9. HISTORICO DE ALTERACOES

| Data | Versao | Descricao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Criacao inicial da documentacao completa |
