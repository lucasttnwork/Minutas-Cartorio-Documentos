# COMPROMISSO_COMPRA_VENDA - Contrato Particular de Compromisso de Compra e Venda

**Complexidade de Extracao**: MUITO_ALTA
**Schema Fonte**: `execution/schemas/compromisso_compra_venda.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Contrato Particular de Compromisso de Compra e Venda (CCV) e um instrumento juridico que formaliza a intencao de venda de um imovel entre as partes antes da lavratura da escritura publica definitiva. Este documento estabelece:

- **Identificacao das Partes**: Promitentes vendedores e promitentes compradores com qualificacao completa
- **Objeto da Venda**: Descricao detalhada do imovel, incluindo matricula, areas e localizacao
- **Valores e Pagamento**: Preco total, sinal, saldo e formas de pagamento
- **Prazos**: Prazo para escritura, pagamento do saldo, diligencias
- **Clausulas Especiais**: Condicoes particulares do negocio
- **Penalidades**: Multas por inadimplemento

Este e o SEGUNDO documento mais complexo do sistema (53 campos uteis mapeados), atras apenas da Matricula do Imovel. A complexidade deve-se a:
- Multiplos arrays de partes (vendedores, compradores, conjuges)
- Objetos nested para imovel, pagamentos e comissao
- Dados bancarios completos para transacoes
- Clausulas especiais variando por contrato

### 1.2 Padroes de Identificacao Visual

Os seguintes termos indicam que o documento e um Compromisso de Compra e Venda:

- COMPROMISSO
- COMPRA E VENDA
- PROMITENTE VENDEDOR
- PROMITENTE COMPRADOR
- INSTRUMENTO PARTICULAR
- PROMESSA DE COMPRA
- CONTRATO PARTICULAR
- PROMESSA DE VENDA
- CCV

### 1.3 Formatos Comuns

| Formato | Descricao | Caracteristicas |
|---------|-----------|-----------------|
| Contrato em Papel | Assinado fisicamente | Requer digitalizacao, pode ter rubricas em todas as paginas |
| PDF Digital | Documento eletronico | Pode conter assinaturas digitais ou escaneadas |
| Assinatura Digital DocuSign | Via plataforma DocuSign | Contem envelope_id, certificados digitais, trilha de auditoria |
| Assinatura Digital ClickSign | Via plataforma ClickSign | Contem codigo de verificacao, logs de assinatura |
| Contrato Plataforma | Via QuintoAndar, Loft, etc. | Formato padronizado da plataforma, clausulas pre-definidas |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Nivel Extracao | Confianca |
|-------|------|-----------|---------|-------|----------------|-----------|
| data_contrato | date | Data de assinatura do contrato | "2023-10-10" | `\d{2}/\d{2}/\d{4}` | 1 | Alta |
| preco_total | number | Valor total da venda | 615000.00 | `R\$\s*[\d.,]+` | 1 | Alta |
| vendedores | array | Lista de promitentes vendedores | [...] | - | 3 | Alta |
| compradores | array | Lista de promitentes compradores | [...] | - | 3 | Alta |
| imovel | object | Dados do imovel objeto da venda | {...} | - | 3 | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Nivel Extracao | Confianca |
|-------|------|-----------|---------|-----------------|----------------|-----------|
| envelope_id | string | ID do envelope de assinatura digital | "1BBD17A3-2448-414E-8D29-269736F25BD7" | Assinatura digital DocuSign | 1 | Alta |
| valor_sinal | number | Valor do sinal/entrada | 36900.00 | Quando ha entrada | 1 | Alta |
| valor_saldo | number | Valor do saldo remanescente | 578100.00 | Quando ha saldo a pagar | 1 | Alta |
| dados_pagamento_sinal | object | Dados bancarios do sinal | {...} | Quando ha sinal | 2 | Media |
| dados_pagamento_saldo | object | Dados do pagamento do saldo | {...} | Quando ha saldo | 2 | Media |
| comissao_corretagem | object | Dados da comissao de corretagem | {...} | Quando ha intermediario | 2 | Media |
| condicoes_especificas | array | Condicoes especiais do contrato | [...] | Contratos personalizados | 3 | Baixa |
| prazo_escritura | number | Prazo em dias para lavratura da escritura | 60 | Maioria dos contratos | 2 | Media |
| multa_inadimplemento | object | Clausula penal por descumprimento | {...} | Maioria dos contratos | 2 | Media |
| testemunhas | array | Lista de testemunhas do contrato | [...] | Contratos com testemunhas | 2 | Media |
| foro | string | Foro eleito para disputas | "SAO PAULO/SP" | Sempre | 2 | Media |
| numero_clausulas | number | Quantidade total de clausulas | 15 | Contratos estruturados | 1 | Alta |
| plataforma_assinatura | string | Plataforma de assinatura eletronica | "DOCUSIGN" | Assinatura digital | 2 | Alta |
| vagas_garagem | array | Vagas de garagem incluidas | [...] | Quando imovel tem vaga | 3 | Media |

### 2.3 Objetos Nested

#### 2.3.1 imovel (object)

Dados completos do imovel objeto da venda. Confianca esperada: ALTA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| imovel.tipo | string | Tipo do imovel | "APARTAMENTO" | Sim |
| imovel.endereco_completo | string | Endereco completo | "Rua Francisco Cruz, 515 - Apto 124 - Bloco B - Vila Mariana - Sao Paulo - SP - CEP 04117-091" | Sim |
| imovel.logradouro | string | Logradouro | "Rua Francisco Cruz" | Nao |
| imovel.numero | string | Numero | "515" | Nao |
| imovel.numero_unidade | string | Numero da unidade | "124" | Nao |
| imovel.andar | string | Andar | "12" | Nao |
| imovel.bloco | string | Bloco | "B" | Nao |
| imovel.edificio | string | Nome do edificio | "Edificio Serra do Mar" | Nao |
| imovel.bairro | string | Bairro | "Vila Mariana" | Nao |
| imovel.cidade | string | Cidade | "Sao Paulo" | Sim |
| imovel.estado | string | Estado (UF) | "SP" | Sim |
| imovel.cep | string | CEP | "04117-091" | Nao |
| imovel.matricula | string | Numero da matricula | "46.511" | Sim |
| imovel.cartorio_ri | string | Cartorio de Registro de Imoveis | "1o Oficial de Registro de Imoveis de Sao Paulo" | Sim |
| imovel.inscricao_iptu | string | SQL (cadastro municipal) | "039.080.0244-3" | Nao |
| imovel.area_privativa | number | Area privativa em m2 | 70.83 | Nao |
| imovel.area_comum | number | Area comum em m2 | 12.66 | Nao |
| imovel.area_total | number | Area total em m2 | 83.49 | Sim |
| imovel.fracao_ideal | number | Fracao ideal do terreno | 0.0065228 | Nao |

**Valores aceitos para tipo:**
- APARTAMENTO
- CASA
- TERRENO
- LOJA
- SALA
- VAGA
- SOBRADO
- GALPAO
- COBERTURA

#### 2.3.2 dados_pagamento_sinal (object)

Dados bancarios para pagamento do sinal. Confianca esperada: MEDIA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| dados_pagamento_sinal.valor | number | Valor do sinal | 36900.00 | Sim |
| dados_pagamento_sinal.data_pagamento | date | Data do pagamento | "2023-10-14" | Nao |
| dados_pagamento_sinal.forma_pagamento | string | Forma de pagamento | "BOLETO" | Sim |
| dados_pagamento_sinal.banco_destino | string | Banco de destino | "STARK BANK" | Nao |
| dados_pagamento_sinal.agencia | string | Agencia | "0001" | Nao |
| dados_pagamento_sinal.conta | string | Conta | "12345678-9" | Nao |
| dados_pagamento_sinal.pix | string | Chave PIX | "pagamentos@quintoandar.com.br" | Nao |
| dados_pagamento_sinal.beneficiario | string | Nome do beneficiario | "GRPOA LTDA" | Nao |

**Valores aceitos para forma_pagamento:**
- TED
- PIX
- BOLETO
- DOC
- CHEQUE
- DEPOSITO

#### 2.3.3 dados_pagamento_saldo (object)

Dados do pagamento do saldo remanescente. Confianca esperada: MEDIA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| dados_pagamento_saldo.valor | number | Valor do saldo | 578100.00 | Sim |
| dados_pagamento_saldo.tipo | string | Tipo de pagamento | "A VISTA" | Sim |
| dados_pagamento_saldo.banco_financiador | string | Banco financiador (se financiado) | "CAIXA ECONOMICA FEDERAL" | Nao |
| dados_pagamento_saldo.prazo_dias | number | Prazo em dias para pagamento | 60 | Nao |
| dados_pagamento_saldo.data_prevista | date | Data prevista para pagamento | "2023-12-10" | Nao |
| dados_pagamento_saldo.condicoes | string | Condicoes especiais | "Sujeito a aprovacao de credito" | Nao |
| dados_pagamento_saldo.banco_destino | string | Banco de destino | "SANTANDER" | Nao |
| dados_pagamento_saldo.agencia | string | Agencia | "0167" | Nao |
| dados_pagamento_saldo.conta | string | Conta | "01029638-7" | Nao |
| dados_pagamento_saldo.beneficiario | string | Nome do beneficiario | "RODOLFO WOLFGANG ORTRIVANO" | Nao |

**Valores aceitos para tipo:**
- A VISTA
- FINANCIAMENTO
- PARCELADO
- FGTS
- CONSORCIO
- PERMUTA

#### 2.3.4 comissao_corretagem (object)

Dados da comissao de corretagem imobiliaria. Confianca esperada: MEDIA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| comissao_corretagem.percentual | number | Percentual da comissao | 6.0 | Sim |
| comissao_corretagem.valor | number | Valor da comissao | 36900.00 | Nao |
| comissao_corretagem.responsavel | string | Quem paga a comissao | "VENDEDOR" | Sim |
| comissao_corretagem.imobiliaria | string | Nome da imobiliaria | "QUINTOANDAR" | Nao |
| comissao_corretagem.cnpj_imobiliaria | string | CNPJ da imobiliaria | "16.788.643/0001-81" | Nao |
| comissao_corretagem.corretor | string | Nome do corretor | "FULANO DE TAL" | Nao |
| comissao_corretagem.creci | string | CRECI do corretor | "12345-F" | Nao |

**Valores aceitos para responsavel:**
- VENDEDOR
- COMPRADOR
- AMBOS

#### 2.3.5 multa_inadimplemento (object)

Clausula penal por inadimplemento contratual. Confianca esperada: MEDIA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| multa_inadimplemento.percentual | number | Percentual da multa | 10.0 | Sim |
| multa_inadimplemento.sobre | string | Base de calculo | "VALOR_TOTAL" | Sim |
| multa_inadimplemento.valor_calculado | number | Valor calculado da multa | 61500.00 | Nao |

**Valores aceitos para sobre:**
- VALOR_TOTAL
- VALOR_PAGO
- SINAL

### 2.4 Arrays

#### 2.4.1 vendedores (array)

Lista de promitentes vendedores. Confianca esperada: ALTA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| vendedores[].nome | string | Nome completo | "RODOLFO WOLFGANG ORTRIVANO" | Sim |
| vendedores[].cpf | string | CPF | "585.096.668-49" | Sim |
| vendedores[].rg | string | Numero do RG | "6.075.352" | Nao |
| vendedores[].orgao_rg | string | Orgao emissor do RG | "SSP-SP" | Nao |
| vendedores[].nacionalidade | string | Nacionalidade | "brasileiro" | Nao |
| vendedores[].profissao | string | Profissao | "jornalista" | Nao |
| vendedores[].estado_civil | string | Estado civil | "CASADO" | Nao |
| vendedores[].regime_bens | string | Regime de bens | "comunhao parcial de bens" | Nao |
| vendedores[].email | string | E-mail | "rodolfo@email.com" | Nao |
| vendedores[].telefone | string | Telefone | "(11) 99999-9999" | Nao |
| vendedores[].endereco | object | Endereco completo | {...} | Nao |
| vendedores[].percentual | number | Percentual de propriedade vendido | 50.0 | Nao |
| vendedores[].conjuge | object | Dados do conjuge | {...} | Nao |
| vendedores[].dados_bancarios | object | Dados bancarios para recebimento | {...} | Nao |

**Estrutura do endereco (dentro de vendedores[]):**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| vendedores[].endereco.logradouro | string | Logradouro | "Rua Francisco Cruz" |
| vendedores[].endereco.numero | string | Numero | "515" |
| vendedores[].endereco.complemento | string | Complemento | "Apto 102" |
| vendedores[].endereco.bairro | string | Bairro | "Vila Mariana" |
| vendedores[].endereco.cidade | string | Cidade | "Sao Paulo" |
| vendedores[].endereco.uf | string | Estado | "SP" |
| vendedores[].endereco.cep | string | CEP | "03156-000" |

**Estrutura do conjuge (dentro de vendedores[]):**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| vendedores[].conjuge.nome | string | Nome do conjuge | "ELIZETE APARECIDA SILVA" |
| vendedores[].conjuge.cpf | string | CPF do conjuge | "949.735.638-20" |
| vendedores[].conjuge.rg | string | RG do conjuge | "7.878.936" |
| vendedores[].conjuge.profissao | string | Profissao do conjuge | "jornalista" |

**Estrutura dos dados_bancarios (dentro de vendedores[]):**

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| vendedores[].dados_bancarios.banco | string | Nome do banco | "Santander" |
| vendedores[].dados_bancarios.agencia | string | Agencia | "0167" |
| vendedores[].dados_bancarios.conta_corrente | string | Conta corrente | "01029638-7" |
| vendedores[].dados_bancarios.tipo_conta | string | Tipo da conta | "corrente" |
| vendedores[].dados_bancarios.titular | string | Titular da conta | "RODOLFO WOLFGANG ORTRIVANO" |

#### 2.4.2 compradores (array)

Lista de promitentes compradores. Mesma estrutura dos vendedores.

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| compradores[].nome | string | Nome completo | "MARINA AYUB" | Sim |
| compradores[].cpf | string | CPF | "368.366.718-43" | Sim |
| compradores[].rg | string | Numero do RG | "12.345.678-9" | Nao |
| compradores[].orgao_rg | string | Orgao emissor do RG | "SSP-SP" | Nao |
| compradores[].nacionalidade | string | Nacionalidade | "brasileira" | Nao |
| compradores[].profissao | string | Profissao | "dentista" | Nao |
| compradores[].estado_civil | string | Estado civil | "SOLTEIRA" | Nao |
| compradores[].regime_bens | string | Regime de bens | null | Nao |
| compradores[].email | string | E-mail | "marina@email.com" | Nao |
| compradores[].telefone | string | Telefone | "(11) 98888-8888" | Nao |
| compradores[].endereco | object | Endereco completo | {...} | Nao |
| compradores[].percentual | number | Percentual de aquisicao | 100.0 | Nao |
| compradores[].conjuge | object | Dados do conjuge | {...} | Nao |

#### 2.4.3 vagas_garagem (array)

Vagas de garagem incluidas na venda. Confianca esperada: MEDIA (nivel de extracao 3).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| vagas_garagem[].matricula | string | Matricula da vaga (se autonoma) | "46.512" | Nao |
| vagas_garagem[].numero | string | Numero da vaga | "24" | Nao |
| vagas_garagem[].tipo | string | Tipo da vaga | "INDETERMINADA" | Sim |
| vagas_garagem[].area | number | Area em m2 | 12.50 | Nao |

**Valores aceitos para tipo:**
- DETERMINADA
- INDETERMINADA
- AUTONOMA
- VINCULADA

#### 2.4.4 condicoes_especificas (array)

Lista de condicoes especiais do contrato (array de objetos ou strings).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| condicoes_especificas[].numero | string | Numero da clausula | "12.1" | Nao |
| condicoes_especificas[].titulo | string | Titulo da condicao | "Atualizacao de Matricula" | Nao |
| condicoes_especificas[].descricao | string | Descricao completa | "Vendedores comprometem-se a atualizar a matricula..." | Sim |
| condicoes_especificas[].responsavel | string | Responsavel pela condicao | "vendedor" | Nao |
| condicoes_especificas[].prazo_dias | number | Prazo em dias | 15 | Nao |

#### 2.4.5 testemunhas (array)

Lista de testemunhas do contrato. Confianca esperada: MEDIA (nivel de extracao 2).

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| testemunhas[].nome | string | Nome completo | "LUCIANA OLIVEIRA SILVA BITTENCOURT" | Sim |
| testemunhas[].cpf | string | CPF | "120.064.396-85" | Nao |
| testemunhas[].rg | string | RG | "12.345.678-9" | Nao |

---

## 3. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural" (19 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| vendedores[].nome / compradores[].nome | nome | SIM | Nome completo da parte |
| vendedores[].cpf / compradores[].cpf | cpf | SIM | CPF da parte |
| vendedores[].rg / compradores[].rg | rg | SIM | Numero do RG |
| vendedores[].orgao_rg | orgao_emissor_rg | SIM | SSP, DETRAN, etc. |
| (extraido do orgao_rg) | estado_emissor_rg | SIM | UF do RG |
| vendedores[].nacionalidade | nacionalidade | SIM | Nacionalidade declarada |
| vendedores[].profissao | profissao | SIM | Profissao ou ocupacao |
| vendedores[].estado_civil | estado_civil | SIM | Solteiro, casado, etc. |
| vendedores[].regime_bens | regime_bens | SIM | Se casado |
| (se presente no documento) | data_nascimento | SIM | Data de nascimento |
| vendedores[].endereco.logradouro | domicilio_logradouro | SIM | Rua, Avenida, etc. |
| vendedores[].endereco.numero | domicilio_numero | SIM | Numero do endereco |
| vendedores[].endereco.complemento | domicilio_complemento | SIM | Apto, Bloco, etc. |
| vendedores[].endereco.bairro | domicilio_bairro | SIM | Bairro |
| vendedores[].endereco.cidade | domicilio_cidade | SIM | Cidade |
| vendedores[].endereco.uf | domicilio_estado | SIM | Estado (UF) |
| vendedores[].endereco.cep | domicilio_cep | SIM | CEP |
| vendedores[].email | email | SIM | E-mail de contato |
| vendedores[].telefone | telefone | SIM | Telefone de contato |

### 3.2 Campos que Alimentam "Pessoa Juridica" (9 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| vendedores[].nome (se PJ) | pj_denominacao | SIM | Razao social |
| vendedores[].cpf (se CNPJ) | pj_cnpj | SIM | CNPJ da empresa |
| vendedores[].endereco.logradouro (se PJ) | pj_sede_logradouro | SIM | Logradouro da sede |
| vendedores[].endereco.numero (se PJ) | pj_sede_numero | SIM | Numero da sede |
| vendedores[].endereco.complemento (se PJ) | pj_sede_complemento | SIM | Complemento da sede |
| vendedores[].endereco.bairro (se PJ) | pj_sede_bairro | SIM | Bairro da sede |
| vendedores[].endereco.cidade (se PJ) | pj_sede_cidade | SIM | Cidade da sede |
| vendedores[].endereco.uf (se PJ) | pj_sede_estado | SIM | Estado da sede |
| vendedores[].endereco.cep (se PJ) | pj_sede_cep | SIM | CEP da sede |

### 3.3 Campos que Alimentam "Dados do Imovel" (12 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| imovel.matricula | matricula_numero | SIM | Numero da matricula |
| imovel.cartorio_ri | matricula_cartorio_numero | SIM | Identificacao do cartorio |
| (cidade do cartorio) | matricula_cartorio_cidade | SIM | Cidade do cartorio de RI |
| imovel.tipo | imovel_denominacao | SIM | Apartamento, Casa, etc. |
| imovel.logradouro / endereco_completo | imovel_logradouro | SIM | Logradouro do imovel |
| imovel.numero | imovel_numero | SIM | Numero do imovel |
| imovel.bloco + andar + unidade | imovel_complemento | SIM | Complemento completo |
| imovel.bairro | imovel_bairro | SIM | Bairro do imovel |
| imovel.cidade | imovel_cidade | SIM | Cidade do imovel |
| imovel.estado | imovel_estado | SIM | Estado do imovel |
| imovel.area_total | imovel_area_total | SIM | Area total em m2 |
| imovel.area_privativa | imovel_area_privativa | SIM | Area privativa em m2 |

### 3.4 Campos que Alimentam "Negocio Juridico" (13 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| preco_total | negocio_valor_total | SIM | Valor total da transacao |
| (fracao vendida) | negocio_fracao_alienada | SIM | Fracao ideal alienada (se parcial) |
| vendedores[].nome | alienante_nome | SIM | Nome do vendedor |
| vendedores[].percentual | alienante_fracao_ideal | SIM | Percentual do vendedor |
| (valor por vendedor) | alienante_valor_alienacao | SIM | Valor recebido por cada vendedor |
| vendedores[].conjuge.nome | alienante_conjuge | SIM | Conjuge do vendedor (se casado) |
| compradores[].nome | adquirente_nome | SIM | Nome do comprador |
| compradores[].percentual | adquirente_fracao_ideal | SIM | Percentual do comprador |
| (valor por comprador) | adquirente_valor_aquisicao | SIM | Valor pago por cada comprador |
| dados_pagamento_saldo.tipo | pagamento_tipo | SIM | A vista, financiado, etc. |
| dados_pagamento_sinal.forma_pagamento | pagamento_modo | SIM | TED, PIX, boleto, etc. |
| dados_pagamento_sinal.data_pagamento | pagamento_data | SIM | Data do pagamento |
| condicoes_especificas | termos_promessa | SIM | Condicoes especiais do contrato |

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| envelope_id | Metadado de assinatura digital, nao usado em minutas |
| comissao_corretagem | Dados da corretagem nao sao relevantes para minuta de escritura |
| prazo_escritura | Dado operacional do contrato, nao da escritura |
| multa_inadimplemento | Clausula penal do contrato, nao usado na minuta |
| testemunhas | Dados de referencia, nao qualificacao para minuta |
| foro | Clausula de eleicao de foro, especifica do contrato |
| numero_clausulas | Metadado estrutural do contrato |
| plataforma_assinatura | Metadado tecnico de assinatura |
| vagas_garagem (se matricula autonoma) | Tratadas como imovel separado quando tem matricula propria |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "COMPROMISSO_COMPRA_VENDA",
  "arquivo_origem": "894066473_COMPROMISSO_DE_COMPRA_E_VENDA.pdf",
  "data_processamento": "2026-01-28T19:06:11.059903",
  "dados_catalogados": {
    "tipo_documento": "COMPROMISSO_COMPRA_VENDA",
    "eh_aditivo": false,
    "data_contrato": "2023-10-10",
    "local_assinatura": "Sao Paulo",
    "vendedores": [
      {
        "nome": "Rodolfo Wolfgang Ortrivano",
        "cpf": "585.096.668-49",
        "nacionalidade": "brasileiro",
        "profissao": "jornalista",
        "estado_civil": "CASADO",
        "regime_casamento": "comunhao parcial de bens",
        "conjuge": "Elizete Aparecida Silva",
        "endereco": "Rua Francisco Cruz, 515 - Apto 102 - Vila Mariana - CEP 03156-000 - Sao Paulo - SP",
        "proporcao_venda_percentual": 50.0,
        "dados_bancarios": {
          "banco": "Santander",
          "agencia": "0167",
          "conta_corrente": "010296387",
          "tipo_conta": "corrente",
          "titular": "Rodolfo Wolfgang Ortrivano"
        }
      },
      {
        "nome": "Elizete Aparecida Silva",
        "cpf": "949.735.638-20",
        "nacionalidade": "brasileira",
        "profissao": "jornalista",
        "estado_civil": "CASADA",
        "regime_casamento": "comunhao parcial de bens",
        "conjuge": "Rodolfo Wolfgang Ortrivano",
        "endereco": "Rua Francisco Cruz, 515 - Apto 102 - Vila Mariana - CEP 03156-000 - Sao Paulo - SP",
        "proporcao_venda_percentual": 50.0,
        "dados_bancarios": null
      }
    ],
    "compradores": [
      {
        "nome": "Marina Ayub",
        "cpf": "368.366.718-43",
        "nacionalidade": "brasileira",
        "profissao": "dentista",
        "estado_civil": "SOLTEIRA",
        "endereco": "Rua Doutor Neto de Araujo - 264 - Apto 210 - Vila Mariana - CEP 04111-000 - Sao Paulo - SP"
      }
    ],
    "intermediador": {
      "nome": "QuintoAndar",
      "razao_social": "GRPOA Ltda",
      "cnpj": "16.788.643/0001-81",
      "tipo": "plataforma_digital"
    },
    "imovel": {
      "tipo": "APARTAMENTO",
      "endereco_completo": "Rua Francisco Cruz, 515 - Apto 124 - Bloco B - Vila Mariana - Sao Paulo - SP - CEP 04117-091",
      "logradouro": "Rua Francisco Cruz",
      "numero": "515",
      "complemento": "Apto 124",
      "bloco": "B",
      "bairro": "Vila Mariana",
      "cidade": "Sao Paulo",
      "estado": "SP",
      "cep": "04117-091",
      "matriculas": [
        {
          "numero": "46.511",
          "tipo_unidade": "apartamento",
          "cartorio": "1o Oficial de Registro de Imoveis",
          "cidade_cartorio": "Sao Paulo",
          "status": "principal"
        }
      ],
      "inscricao_iptu": "039.080.0244-3",
      "area_privativa_m2": 70.83,
      "area_comum_m2": 12.66,
      "area_total_m2": 83.49,
      "fracao_ideal_terreno": "0,65228%"
    },
    "valores_financeiros": {
      "preco_total": 615000.0,
      "sinal_entrada": 36900.0,
      "saldo": 578100.0,
      "sinal_percentual_calculado": 6.0,
      "validacao_valores_ok": true
    },
    "forma_pagamento_sinal": "Boleto ou PIX via Banco Stark",
    "forma_pagamento_saldo": "TED para conta Santander do vendedor",
    "prazos": {
      "prazo_pagamento_sinal_dias": 4,
      "prazo_pagamento_saldo_dias": 60,
      "prazo_escritura": "60 dias corridos",
      "prazo_diligencia_dias": 10,
      "transferencia_posse": "No dia da lavratura da escritura e quitacao integral"
    },
    "penalidades": {
      "multa_rescisoria_percentual": 10.0,
      "multa_rescisoria_valor_calculado": 61500.0,
      "multa_moratoria_percentual_dia": 0.1,
      "juros_mora_percentual_mes": 1.0
    },
    "responsabilidades": {
      "itbi": "comprador",
      "registro_imovel": "comprador",
      "custas_cartorio": "comprador",
      "debitos_anteriores": "vendedor",
      "comissao_corretagem": {
        "percentual": 6.0,
        "valor": 36900.0,
        "responsavel": "vendedor",
        "beneficiario": "QuintoAndar"
      }
    },
    "clausulas_especiais": [
      {
        "numero": "12.1",
        "titulo": "Atualizacao de Matricula",
        "descricao": "Vendedores comprometem-se a atualizar a matricula (averbacao de casamento) em 15 dias.",
        "responsavel": "vendedor",
        "prazo_dias": 15,
        "condicionalidade": "Antes da lavratura da Escritura Publica"
      },
      {
        "numero": "12.2",
        "titulo": "Dilacao de Prazo de Pagamento",
        "descricao": "Pagamento do saldo em 60 dias corridos devido a necessidade de regularizacao documental.",
        "responsavel": "comprador",
        "prazo_dias": 60,
        "condicionalidade": "Contados da assinatura do CCV"
      }
    ],
    "assinatura_digital": {
      "plataforma": "DocuSign",
      "envelope_id": "1BBD17A3-2448-414E-8D29-269736F25BD7",
      "status": "completo",
      "data_assinatura": "2023-10-10"
    },
    "testemunhas": [
      {
        "nome": "Luciana Oliveira Silva Bittencourt",
        "cpf": "120.064.396-85"
      }
    ],
    "foro_eleito": "Comarca do Imovel (Sao Paulo)"
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/007_COMPROMISSO_COMPRA_VENDA.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| imovel.matricula | MATRICULA_IMOVEL, ITBI, VVR, ESCRITURA, DADOS_CADASTRAIS | Identificar mesmo imovel |
| imovel.inscricao_iptu (SQL) | MATRICULA_IMOVEL, ITBI, VVR, IPTU, CND_MUNICIPAL | Identificar mesmo imovel |
| vendedores[].cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, MATRICULA_IMOVEL | Identificar vendedor |
| compradores[].cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Identificar comprador |
| preco_total | ITBI, ESCRITURA | Validar valor da transacao |
| imovel.area_total | MATRICULA_IMOVEL, IPTU, DADOS_CADASTRAIS | Validar area do imovel |
| vendedores[].conjuge | CERTIDAO_CASAMENTO | Validar dados do conjuge |

### 5.2 Redundancia Intencional

O COMPROMISSO_COMPRA_VENDA e a **fonte primaria para dados do negocio** antes da lavratura da escritura. A redundancia com outros documentos permite:

1. **Validacao cruzada**: Verificar se CPFs, nomes e valores estao consistentes
2. **Completude de dados**: Preencher campos ausentes usando outras fontes
3. **Preparacao da escritura**: Antecipar dados que serao usados na escritura

**Fluxo de validacao:**

```
COMPROMISSO_COMPRA_VENDA (valor, partes)
         |
         +---> MATRICULA_IMOVEL (imovel, proprietarios) --> Valida propriedade
         |
         +---> ITBI (valor, SQL) --> Valida base de calculo
         |
         +---> CERTIDAO_CASAMENTO (conjuge, regime) --> Valida estado civil
         |
         +---> RG/CNH (CPF, nome) --> Valida identidade
         |
         v
      ESCRITURA (documento final)
```

### 5.3 Prioridade de Fontes para Dados do Negocio

Para dados do negocio juridico, a prioridade de fontes e:

1. **COMPROMISSO_COMPRA_VENDA** (fonte primaria para valores e partes)
2. **ESCRITURA** (fonte primaria apos lavratura)
3. **ITBI** (fonte de validacao de valores)
4. **COMPROVANTE_PAGAMENTO** (fonte de validacao de pagamentos)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Implementada |
|-----------|-----------|--------------|
| cpf_digito_verificador | Digitos verificadores dos CPFs validos | Sim |
| soma_sinal_saldo_igual_total | Sinal + Saldo = Preco Total | Sim |
| soma_percentuais_vendedores_100 | Percentuais dos vendedores somam 100% | Sim |
| soma_percentuais_compradores_100 | Percentuais dos compradores somam 100% | Sim |
| matricula_valida | Formato da matricula valido | Sim |
| datas_coerentes | Datas fazem sentido cronologico | Sim |
| cnpj_digito_verificador | CNPJ do intermediador valido | Sim |

### 6.2 Validacoes de Negocio

| Validacao | Descricao | Quando Aplicavel |
|-----------|-----------|------------------|
| vendedor_proprietario | Vendedor consta como proprietario na matricula | Quando matricula disponivel |
| valor_compativel_itbi | Valor do contrato >= base de calculo ITBI | Quando ITBI disponivel |
| estado_civil_compativel | Estado civil compativel com certidao de casamento | Quando certidao disponivel |
| regime_bens_compativel | Regime de bens compativel com documentos | Quando casado |

### 6.3 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| validacao_valores_ok | boolean | Sinal + Saldo = Total |
| sinal_percentual_calculado | number | Percentual real do sinal sobre o total |
| campos_completos | array | Campos extraidos com sucesso |
| campos_ausentes | array | Campos esperados mas nao encontrados |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| valor_saldo | preco_total - valor_sinal | Se nao informado explicitamente |
| sinal_percentual | (valor_sinal / preco_total) * 100 | Percentual calculado |
| multa_rescisoria_valor | preco_total * (multa_percentual / 100) | Valor monetario da multa |
| prazo_escritura_data | data_contrato + prazo_escritura_dias | Data limite para escritura |

### 7.2 Campos Inferidos

| Campo Inferido | Origem | Logica de Inferencia |
|----------------|--------|---------------------|
| plataforma_assinatura | envelope_id | Formato do ID identifica DocuSign, ClickSign, etc. |
| tipo_pagamento_saldo | banco_financiador | Se tem banco financiador, e financiamento |
| conjuge_vendedor | estado_civil + regime | Se casado em comunhao, conjuge deve assinar |

### 7.3 Campos Raros

| Campo | Frequencia | Quando Aparece |
|-------|------------|----------------|
| vagas_garagem com matricula autonoma | Raro | Vagas com registro proprio |
| pacto_antenupcial | Raro | Quando ha pacto antes de 1977 ou regime atipico |
| intermediador PJ | Medio | Quando ha imobiliaria/plataforma |
| aditivo | Raro | Alteracoes ao contrato original |

### 7.4 Plataformas de Assinatura Digital

| Plataforma | Padrao de Envelope ID | Caracteristicas |
|------------|----------------------|-----------------|
| DocuSign | UUID padrao (8-4-4-4-12) | Mais comum em contratos imobiliarios |
| ClickSign | Alfanumerico com prefixo | Comum em Brasil |
| D4Sign | Numerico longo | Menos comum |
| ZapSign | Alfanumerico curto | Emergente |

---

## 8. ESTRUTURA HIERARQUICA

```
COMPROMISSO_COMPRA_VENDA
|
+-- Identificacao
|   +-- data_contrato
|   +-- local_assinatura
|   +-- numero_clausulas
|   +-- foro
|
+-- vendedores [N] (array)
|   +-- Vendedor 1
|   |   +-- nome
|   |   +-- cpf
|   |   +-- rg
|   |   +-- orgao_rg
|   |   +-- nacionalidade
|   |   +-- profissao
|   |   +-- estado_civil
|   |   +-- regime_bens
|   |   +-- email
|   |   +-- telefone
|   |   +-- endereco (object)
|   |   |   +-- logradouro
|   |   |   +-- numero
|   |   |   +-- complemento
|   |   |   +-- bairro
|   |   |   +-- cidade
|   |   |   +-- uf
|   |   |   +-- cep
|   |   +-- percentual
|   |   +-- conjuge (object)
|   |   +-- dados_bancarios (object)
|   +-- Vendedor 2
|   +-- ...
|
+-- compradores [N] (array)
|   +-- (mesma estrutura dos vendedores)
|
+-- imovel (object)
|   +-- tipo
|   +-- endereco_completo
|   +-- logradouro
|   +-- numero
|   +-- numero_unidade
|   +-- andar
|   +-- bloco
|   +-- edificio
|   +-- bairro
|   +-- cidade
|   +-- estado
|   +-- cep
|   +-- matricula
|   +-- cartorio_ri
|   +-- inscricao_iptu
|   +-- area_privativa
|   +-- area_comum
|   +-- area_total
|   +-- fracao_ideal
|
+-- vagas_garagem [N] (array)
|   +-- Vaga 1
|   |   +-- matricula
|   |   +-- numero
|   |   +-- tipo
|   |   +-- area
|   +-- ...
|
+-- Valores
|   +-- preco_total
|   +-- valor_sinal
|   +-- valor_saldo
|
+-- dados_pagamento_sinal (object)
|   +-- valor
|   +-- data_pagamento
|   +-- forma_pagamento
|   +-- banco_destino
|   +-- agencia
|   +-- conta
|   +-- pix
|   +-- beneficiario
|
+-- dados_pagamento_saldo (object)
|   +-- valor
|   +-- tipo
|   +-- banco_financiador
|   +-- prazo_dias
|   +-- data_prevista
|   +-- condicoes
|
+-- comissao_corretagem (object)
|   +-- percentual
|   +-- valor
|   +-- responsavel
|   +-- imobiliaria
|   +-- cnpj_imobiliaria
|   +-- corretor
|   +-- creci
|
+-- multa_inadimplemento (object)
|   +-- percentual
|   +-- sobre
|
+-- condicoes_especificas [N] (array)
|   +-- Condicao 1
|   |   +-- numero
|   |   +-- titulo
|   |   +-- descricao
|   |   +-- responsavel
|   |   +-- prazo_dias
|   +-- ...
|
+-- testemunhas [N] (array)
|   +-- Testemunha 1
|   |   +-- nome
|   |   +-- cpf
|   |   +-- rg
|   +-- ...
|
+-- Assinatura Digital
|   +-- envelope_id
|   +-- plataforma_assinatura
|
+-- prazo_escritura
```

---

## 9. REFERENCIAS

- **Schema JSON**: `execution/schemas/compromisso_compra_venda.json`
- **Prompt de Extracao**: `execution/prompts/compromisso_compra_venda.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Guia de Campos Imovel**: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- **Guia de Campos Negocio**: `Guia-de-campos-e-variaveis/campos-negocio-juridico.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`

---

## 10. CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
