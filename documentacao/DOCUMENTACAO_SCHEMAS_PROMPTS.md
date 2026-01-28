# Documentação Completa de Schemas e Prompts
## Sistema de Extração OCR e Processamento de Documentos Cartoriais

Data: 2026-01-27
Versão: 1.0

---

## Sumário Executivo

O projeto contém **14 tipos de documentos** com seus respectivos schemas JSON e prompts de extração. O sistema foi desenvolvido para capturar dados estruturados de documentos imobiliários, identificadores pessoais e documentos legais brasileiros, utilizando OCR e processamento por IA.

**Localização dos arquivos:**
- Schemas: `execution/schemas/`
- Prompts: `execution/prompts/`

---

## 1. TIPOS DE DOCUMENTOS E SCHEMAS

### 1.1. RG (Registro Geral / Carteira de Identidade)

**Arquivo:** `rg.json`

**Complexidade:** ALTA

**Descrição:** Schema para extração de dados de Carteira de Identidade (RG)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Nível Extracao |
|-------|------|---------|-----------------|
| numero_rg | string | 12.345.678-9 | 1 |
| nome_completo | string | MARINA AYUB | 2 |
| data_nascimento | date | 10/05/1985 | 1 |
| orgao_expedidor | string | SSP | 1 |
| uf_expedidor | string | SP | 1 |

**Campos Opcionais:**
- naturalidade (cidade/estado)
- data_expedicao
- nome_pai, nome_mae
- cpf
- doc_origem
- numero_via
- titulo_eleitor
- cns (Cartão Nacional de Saúde)

**Padrões de Identificação:**
- REGISTRO GERAL, CARTEIRA DE IDENTIDADE, SECRETARIA DE SEGURANCA, SSP, IDENTIDADE

**Validações:**
- cpf_digito_verificador
- data_nascimento_valida
- data_expedicao_posterior_nascimento
- uf_valida

---

### 1.2. CNDT (Certidão Negativa de Débitos Trabalhistas)

**Arquivo:** `cndt.json`

**Complexidade:** BAIXA

**Descrição:** Schema para Certidão Negativa de Débitos Trabalhistas emitida pelo TST

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Validação |
|-------|------|---------|-----------|
| numero_certidao | string | 12345678901234567890 | 20+ dígitos |
| nome_pessoa | string | JOAO DA SILVA | - |
| cpf | string | 123.456.789-00 | Dígito verificador |
| data_expedicao | date | 27/01/2026 | - |
| data_validade | date | 26/07/2026 | 180 dias após emissão |
| status_certidao | string | NADA CONSTA | NADA CONSTA, POSITIVA, NEGATIVA |

**Campos Opcionais:**
- cnpj (se pessoa jurídica)
- hora_expedicao
- orgao_emissor (geralmente TST)

**Padrões de Identificação:**
- CNDT, CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS, TRIBUNAL SUPERIOR DO TRABALHO, TST, NADA CONSTA

**Validações:**
- cpf_digito_verificador
- cnpj_digito_verificador
- data_validade_futura
- validade_180_dias

---

### 1.3. VVR (Valor Venal de Referência)

**Arquivo:** `vvr.json`

**Complexidade:** MUITO_BAIXA

**Descrição:** Schema para consulta de Valor Venal de Referência do imóvel

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| cadastro_imovel (SQL) | string | 000.000.0000-0 |
| valor_venal_referencia | number | 450000.00 |

**Campos Opcionais:**
- endereco_completo
- data_consulta
- ano_referencia

**Padrões de Identificação:**
- VALOR VENAL DE REFERENCIA, VVR, CONSULTA DE VALOR VENAL, PREFEITURA, VALOR DE REFERENCIA

**Validações:**
- sql_formato_valido
- valor_positivo

---

### 1.4. CND_MUNICIPAL (Certidão Negativa de Débitos Municipais)

**Arquivo:** `cnd_municipal.json`

**Complexidade:** BAIXA

**Descrição:** Schema para Certidão Negativa de Débitos Municipais (Tributos Imobiliários)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Nota |
|-------|------|---------|------|
| numero_certidao | string | 2026.123.456.789 | - |
| cadastro_imovel | string | 000.000.0000-0 | SQL |
| nome_contribuinte | string | JOAO DA SILVA | - |
| situacao_fiscal | string | SEM DEBITOS | REGULAR, SEM DEBITOS, NEGATIVA, POSITIVA |
| data_validade | date | 26/04/2026 | - |
| data_emissao | date | 27/01/2026 | - |

**Campos Opcionais:**
- cpf_contribuinte
- endereco_imovel
- tributos_abrangidos (array)
- data_liberacao
- codigo_autenticidade

**Padrões de Identificação:**
- CERTIDAO NEGATIVA DE TRIBUTOS, TRIBUTOS IMOBILIARIOS, PREFEITURA, CND MUNICIPAL, SEM DEBITOS, IPTU

**Validações:**
- sql_formato_valido
- cpf_digito_verificador
- data_validade_futura

---

### 1.5. CERTIDAO_NASCIMENTO (Certidão de Registro de Nascimento)

**Arquivo:** `certidao_nascimento.json`

**Complexidade:** MEDIA

**Descrição:** Schema para Certidão de Registro de Nascimento

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| nome_registrado | string | PEDRO HENRIQUE SILVA |
| data_nascimento | date | 15/03/1995 |
| nome_mae | string | MARIA APARECIDA SILVA |

**Campos Opcionais:**
- matricula (novo formato)
- livro, folha, termo (antigo formato)
- hora_nascimento
- sexo
- local_nascimento
- nome_pai
- avó paterno, avó paterna, avó materno, avó materna
- cartorio, municipio_cartorio
- data_registro

**Estrutura de Matrícula (decodificação):**
```
AAAAAA BB CC DDDD E FFFF GGG HHHHHHH II

AAAAAA: Código Nacional da Serventia (6 dígitos)
BB: Identificador do acervo (2 dígitos)
CC: Tipo de serviço (55 = Registro Civil Pessoas Naturais)
DDDD: Ano do registro
E: Tipo de livro (1=Nascimento, 2=Casamento, 3=Óbito)
FFFF: Número do livro
GGG: Número da folha
HHHHHHH: Número do termo
II: Dígito verificador
```

**Padrões de Identificação:**
- CERTIDAO DE NASCIMENTO, REGISTRO DE NASCIMENTO, REGISTRO CIVIL, NASCEU, FILIACAO

**Validações:**
- data_nascimento_valida
- data_registro_posterior_nascimento
- matricula_formato_valido

---

### 1.6. CERTIDAO_CASAMENTO (Certidão de Registro de Casamento)

**Arquivo:** `certidao_casamento.json`

**Complexidade:** ALTA

**Descrição:** Schema para Certidão de Registro de Casamento

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| nome_conjuge_1 | string | JOAO DA SILVA |
| nome_conjuge_2 | string | MARIA SANTOS |
| data_casamento | date | 20/11/2010 |
| regime_bens | string | COMUNHAO PARCIAL |

**Campos Opcionais:**
- matricula, livro, folha, termo
- cpf_conjuge_1, cpf_conjuge_2
- data_nascimento_conjuge_1, data_nascimento_conjuge_2
- naturalidade_conjuge_1, naturalidade_conjuge_2
- pai_conjuge_1, mae_conjuge_1, pai_conjuge_2, mae_conjuge_2
- nome_pos_casamento_conjuge_1, nome_pos_casamento_conjuge_2
- pacto_antenupcial
- averbacoes (array de separações/divórcios)
- cartorio
- selo_digital

**Regime de Bens (valores válidos):**
- COMUNHAO PARCIAL DE BENS
- COMUNHAO UNIVERSAL DE BENS
- SEPARACAO TOTAL DE BENS
- SEPARACAO OBRIGATORIA DE BENS
- PARTICIPACAO FINAL NOS AQUESTOS

**Averbações:**
Detectar e estruturar: separação consensual, separação litigiosa, divórcio consensual, divórcio litigioso, conversão de união estável, óbito, alteração de nome

**Padrões de Identificação:**
- CERTIDAO DE CASAMENTO, REGISTRO DE CASAMENTO, CONTRAENTES, NUBENTES, REGIME DE BENS

**Validações:**
- cpf_digito_verificador
- data_casamento_valida
- regime_bens_valido
- matricula_formato_valido

---

### 1.7. IPTU (Carne ou Certidão de IPTU)

**Arquivo:** `iptu.json`

**Complexidade:** MEDIA

**Descrição:** Schema para Carne ou Certidão de Dados Cadastrais do Imóvel (IPTU)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| cadastro_imovel | string | 000.000.0000-0 |
| ano_exercicio | number | 2026 |
| endereco_imovel | object | {logradouro, numero, complemento} |
| contribuintes | array | [{nome, cpf}] |
| valor_venal_total | number | 450000.00 |

**Campos Importantes (estruturados):**
- endereco_notificacao: object
- dados_terreno: {area, fracao_ideal, testada}
- dados_construcao: {area, tipo, padrao, ano}
- valores_m2: {terreno, construcao}
- valores_iptu: {imposto, taxa_lixo, taxa_bombeiros, desconto, total}
- uso_imovel: RESIDENCIAL, COMERCIAL, INDUSTRIAL, MISTO, TERRENO

**Padrões de Identificação:**
- IPTU, IMPOSTO PREDIAL, IMPOSTO TERRITORIAL, PREFEITURA, EXERCICIO, VALOR VENAL

**Validações:**
- sql_formato_valido
- cpf_digito_verificador
- soma_valores_venais
- ano_exercicio_valido

---

### 1.8. ITBI (Guia ou Comprovante de ITBI)

**Arquivo:** `itbi.json`

**Complexidade:** MEDIA

**Descrição:** Schema para Guia ou Comprovante de ITBI (Imposto de Transmissão de Bens Imóveis)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Nota Crítica |
|-------|------|---------|-------------|
| numero_transacao | string | 2026.123.456.789 | - |
| dados_imovel | object | {sql, endereco, matricula} | MATRICULA é crítica! |
| compradores | array | [{nome, cpf, percentual}] | Adquirentes |
| vendedores | array | [{nome, cpf, percentual}] | Transmitentes |
| dados_transacao | object | {valor_total, data_escritura} | - |
| dados_calculo | object | {vvr, base_calculo, aliquota, imposto} | Calcular corretamente! |

**Cálculo Crítico - Base de Cálculo:**
```
base_calculo = MAX(valor_transacao, valor_venal_referencia)
aliquota = (imposto / base_calculo) × 100
```

**Campos Opcionais:**
- natureza_transacao: COMPRA E VENDA, PERMUTA, DOACAO, DACAO EM PAGAMENTO, ARREMATACAO, ADJUDICACAO
- cartorio_notas, cartorio_registro (CRÍTICOS)
- codigo_barras
- data_pagamento, status_pagamento

**Transmissão Parcial:**
- Se "TOTALIDADE DO IMOVEL" = "Não": extrair PROPORCAO (ex: 74,89%)
- VVR pode aparecer como "PROPORCIONAL"

**Padrões de Identificação:**
- ITBI, IMPOSTO DE TRANSMISSAO, TRANSMISSAO DE BENS IMOVEIS, INTER VIVOS, GUIA DE RECOLHIMENTO

**Validações:**
- sql_formato_valido
- cpf_digito_verificador
- calculo_imposto_correto
- base_calculo_maior_ou_igual_vvr
- soma_percentuais_100

---

### 1.9. COMPROVANTE_PAGAMENTO (Comprovante de Transação Financeira)

**Arquivo:** `comprovante_pagamento.json`

**Complexidade:** MEDIA

**Descrição:** Schema para Comprovante de Transação Financeira (PIX, TED, DOC, etc.)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| valor_pago | number | 15000.00 |
| data_pagamento | date | 27/01/2026 |

**Campos Opcionais:**
- banco_origem, banco_destino
- hora_transacao
- codigo_autenticacao
- tipo_transacao: PIX, TED, DOC, BOLETO, DEPOSITO, TRANSFERENCIA
- beneficiario: {nome, cpf_cnpj, banco, agencia, conta}
- pagador: {nome, cpf_cnpj, banco, agencia, conta}
- descricao
- codigo_barras (linha digitável para boletos)
- chave_pix

**Padrões de Identificação:**
- COMPROVANTE, PAGAMENTO, TRANSFERENCIA, PIX, TED, DOC, AUTENTICACAO, RECIBO

**Validações:**
- valor_positivo
- data_nao_futura
- cpf_cnpj_digito_verificador

---

### 1.10. MATRICULA_IMOVEL (Certidão de Matrícula do Registro de Imóveis)

**Arquivo:** `matricula_imovel.json`

**Complexidade:** MUITO_ALTA

**Descrição:** Schema para Certidão de Matrícula do Registro de Imóveis

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Nota |
|-------|------|---------|------|
| numero_matricula | string | 123456 | - |
| cartorio | string | 1o OFICIAL DE RI | - |
| descricao_imovel | object | {tipo, numero, edificio} | - |
| endereco | object | {logradouro, numero, bairro} | - |
| areas | object | {util, comum, total, terreno} | Todos em m² |
| proprietarios | array | [{nome, cpf, percentual}] | **CRÍTICO** |

**Estrutura de Cadeia Dominial:**

O documento organiza a história imobiliária em:

1. **Proprietário Original**: Dados da abertura da matrícula
2. **Registros (R.1, R.2, R.3...)**:
   - Transmissões de propriedade (vendas, doações, heranças)
   - Constituições de ônus (hipotecas, penhoras)
3. **Averbações (Av.1, Av.2...)**:
   - Cancelamentos de ônus
   - Alterações de estado civil
   - Mudanças de denominação social

**Campos Opcionais:**
- livro, numero_ficha
- contribuinte_municipal (SQL)
- fracao_ideal
- quota_parte
- registros: array de {numero, tipo_ato, data, valor, transmitentes, adquirentes}
- averbacoes: array de {numero, tipo, data}
- onus: array de {tipo, credor, valor, status}
- indisponibilidades (bloqueios judiciais CNIB)
- metadados_certidao: {data_emissao, validade_dias, selo_digital}
- situacao_imovel: LIVRE, COM ONUS, INDISPONIVEL

**Tipos de Ônus:**
- HIPOTECA: Garantia de empréstimo
- ALIENAÇÃO FIDUCIÁRIA: Credor é "dono" até quitação
- PENHORA: Bloqueio judicial
- USUFRUTO: Direito de uso por terceiro
- SALDO DEVEDOR: Parcelamento ao vendedor

**Moedas Históricas:**
- Cr$ = Cruzeiros (até 1986)
- Cz$ = Cruzados (1986-1989)
- NCz$ = Cruzados Novos (1989-1990)
- CR$ = Cruzeiros Reais (1993-1994)
- R$ = Reais (1994-atual)

**Padrões de Identificação:**
- MATRICULA, REGISTRO DE IMOVEIS, OFICIAL DE REGISTRO, LIVRO 2, CERTIDAO, ONUS REAIS, INTEIRO TEOR

**Validações:**
- numero_matricula_valido
- sql_formato_valido
- cpf_digito_verificador
- areas_consistentes
- soma_percentuais_proprietarios_100

---

### 1.11. COMPROMISSO_COMPRA_VENDA (Contrato Particular de Compromisso de Compra e Venda)

**Arquivo:** `compromisso_compra_venda.json`

**Complexidade:** MUITO_ALTA

**Descrição:** Schema para Contrato Particular de Compromisso de Compra e Venda

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo | Validação Crítica |
|-------|------|---------|-------------------|
| data_contrato | date | 15/12/2025 | - |
| preco_total | number | 500000.00 | **IMPORTANTE:** Não confundir com SINAL |
| vendedores | array | [{nome, cpf}] | - |
| compradores | array | [{nome, cpf}] | - |
| imovel | object | {endereco, matricula} | - |

**Validação Crítica de Valores:**
```
REGRA DE OURO: Sinal ≠ Preço Total

preco_total = valor COMPLETO do imóvel
sinal_entrada = 5-10% do total (primeira parcela)
saldo = preco_total - sinal_entrada

Validar: sinal_entrada + saldo = preco_total
```

**Campos Importantes (estruturados):**

**Vendedores:**
- nome, cpf, nacionalidade, profissao, estado_civil, regime_bens
- conjuge: {nome, rg, profissao}
- endereco: {logradouro, numero, complemento, bairro, cidade, uf, cep}
- percentual (se múltiplos vendedores)
- dados_bancarios: {banco, agencia, conta_corrente, tipo_conta, pix}

**Compradores:**
- Mesma estrutura dos vendedores (sem dados_bancarios)

**Imovel:**
- tipo, endereco_completo, numero_unidade, andar, bloco, edificio
- matricula, cartorio_ri, inscricao_iptu
- area_privativa, area_comum, area_total
- fracao_ideal

**Vagas de Garagem:**
- Array de {matricula, numero, tipo, area}
- tipo: DETERMINADA, INDETERMINADA, AUTONOMA

**Prazos e Condições:**
- prazo_pagamento_sinal_dias
- prazo_pagamento_saldo_dias
- prazo_escritura (em dias ou data específica)
- transferencia_posse

**Penalidades:**
- multa_rescisoria_percentual (ex: 10%)
- multa_moratoria_percentual_dia (ex: 0,1%)
- juros_mora_percentual_mes (ex: 1%)

**Cálculo de Multa:**
```
multa_rescisoria_valor = (multa_rescisoria_percentual / 100) × preco_total
```

**Responsabilidades:**
```json
{
  "itbi": "comprador",
  "registro_imovel": "comprador",
  "custas_cartorio": "comprador",
  "debitos_anteriores": "vendedor",
  "comissao_corretagem": {
    "percentual": 6.0,
    "valor": 30000.00,
    "responsavel": "vendedor"
  }
}
```

**Intermediador (se houver):**
- Nome, CNPJ, tipo (plataforma_digital, imobiliaria)

**Assinatura Digital:**
- plataforma: DocuSign, ClickSign, D4Sign, Adobe Sign
- envelope_id
- status
- data_assinatura

**Aditivos:**
- Se contiver "ADITIVO", "TERMO ADITIVO", "ADDENDUM", marcar como:
  - eh_aditivo: true
  - numero_aditivo
  - documento_referenciado: {tipo, envelope_id, data}

**Padrões de Identificação:**
- COMPROMISSO, COMPRA E VENDA, PROMITENTE VENDEDOR, PROMITENTE COMPRADOR, INSTRUMENTO PARTICULAR, CONTRATO PARTICULAR

**Validações:**
- cpf_digito_verificador
- soma_sinal_saldo_igual_total
- soma_percentuais_vendedores_100
- soma_percentuais_compradores_100
- matricula_valida
- datas_coerentes

---

### 1.12. PROTOCOLO_ONR (Protocolo do Operador Nacional do Registro)

**Arquivo:** `protocolo_onr.json`

**Complexidade:** BAIXA

**Descrição:** Schema para Protocolo do ONR (Sistema de Atendimento Eletrônico Compartilhado - SAEC)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| numero_protocolo | string | ONR-2026-123456 |
| data_protocolo | date | 27/01/2026 |

**Campos Opcionais:**
- hora_protocolo
- tipo_solicitacao: CERTIDAO DE INTEIRO TEOR, CERTIDAO DE ONUS, CERTIDAO NEGATIVA
- cartorio_destino
- matricula_imovel
- status_solicitacao: PENDENTE, EM ANALISE, CONCLUIDO, CANCELADO, DEVOLVIDO
- solicitante: {nome, cpf_cnpj, email}
- codigo_verificacao

**Sistema ONR/SAEC:**
- ONR = Operador Nacional do Registro de Imóveis
- SAEC = Sistema de Atendimento Eletrônico Compartilhado
- Responsável pela integração dos cartórios de registro de imóveis do Brasil

**Timestamps:**
Procurar dois tipos:
1. Data/hora do cabeçalho (ex: "DD/MM/AAAA, HH:MM")
2. Timestamp em URLs/parâmetros (ex: "VOID=DD/MM/AAAA HH:MM:SS")
Priorizar o mais preciso (com segundos)

**Padrões de Identificação:**
- ONR, OPERADOR NACIONAL, REGISTRO ELETRONICO, PROTOCOLO, SAEC, SREI, CENTRAL DE SERVICOS

**Validações:**
- cpf_cnpj_digito_verificador
- data_protocolo_valida
- matricula_valida

---

### 1.13. ESCRITURA (Minuta de Escritura Pública)

**Arquivo:** `escritura.json`

**Complexidade:** ALTA

**Descrição:** Schema para Minuta de Escritura Pública (Compra e Venda, Doação, Permuta, etc.)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| tipo_escritura | string | COMPRA E VENDA |
| outorgantes | array | [{nome, cpf, qualificacao}] |
| outorgados | array | [{nome, cpf, qualificacao}] |
| imovel | object | {matricula, endereco, areas} |
| valor_transacao | number | 500000.00 |

**Qualificações (outorgantes/outorgados):**
- Outorgantes: VENDEDOR, DOADOR, PERMUTANTE
- Outorgados: COMPRADOR, DONATARIO, PERMUTANTE

**Dados de Qualificação Completa:**
Para cada parte, extrair:
- nome, nacionalidade, estado_civil, regime_bens, profissao
- rg, orgao_rg, cpf
- endereco: {logradouro, numero, complemento, bairro, cidade, uf}
- conjuge: {nome, qualificação}

**Campos Opcionais:**
- tabelionato
- livro, folhas
- forma_pagamento: {a_vista, financiado, banco, tipo_financiamento}
- certidoes_apresentadas: array de strings
- clausulas_especiais: array de strings
- dados_itbi: {numero_guia, valor, data_pagamento}
- selo_digital
- data_lavratura
- status_minuta: MINUTA, LAVRADA, REGISTRADA

**Imovel (estrutura detalhada):**
- tipo, descricao, endereco
- matricula, cartorio_ri, sql
- area_privativa, area_comum, area_total
- fracao_ideal

**Certidões Apresentadas (exemplos):**
- CNDT, CND Federal, CND Municipal
- Matrícula Atualizada
- Comprovante de Pagamento de ITBI
- Procurações (se houver mandatários)

**Padrões de Identificação:**
- ESCRITURA PUBLICA, TABELIAO DE NOTAS, OUTORGANTE, OUTORGADO, COMPRA E VENDA, DOACAO, MINUTA, LAVRATURA

**Validações:**
- cpf_digito_verificador
- matricula_valida
- sql_formato_valido
- soma_valores_pagamento
- datas_coerentes

---

### 1.14. ASSINATURA_DIGITAL (Comprovante de Assinatura Digital)

**Arquivo:** `assinatura_digital.json`

**Complexidade:** MUITO_BAIXA

**Descrição:** Schema para Comprovante de Assinatura Digital (DocuSign, Adobe Sign, etc.)

**Campos Obrigatórios:**
| Campo | Tipo | Exemplo |
|-------|------|---------|
| plataforma | string | DOCUSIGN |
| envelope_id | string | ABC12345-DEF6-7890-GHIJ-KLMNOPQRSTUV |
| signatarios | array | [{nome, email, status, data_assinatura}] |

**Signatarios (estrutura):**
```json
{
  "nome": "JOAO DA SILVA",
  "email": "joao@email.com",
  "cpf": "000.000.000-00",
  "status": "ASSINADO",
  "data_assinatura": "27/01/2026 14:30",
  "ip_assinatura": "xxx.xxx.xxx.xxx",
  "certificado": "Identificador do certificado"
}
```

**Status de Signatários:**
- ASSINADO
- PENDENTE
- RECUSADO

**Campos Opcionais:**
- documento_nome
- data_envio
- data_conclusao
- status_envelope: CONCLUIDO, PENDENTE, CANCELADO, EXPIRADO
- hash_documento (SHA-256)

**Plataformas Suportadas:**
- DocuSign
- Adobe Sign
- ClickSign
- D4Sign

**Padrões de Identificação:**
- DOCUSIGN, ADOBE SIGN, ASSINATURA ELETRONICA, ASSINATURA DIGITAL, ENVELOPE ID, CERTIFICATE OF COMPLETION, CERTIFICADO DE CONCLUSAO

**Validações:**
- envelope_id_formato_valido
- todos_signatarios_assinaram
- hash_documento_valido

---

## 2. TEMPLATES DE PROMPTS

### 2.1. PROMPT GENERIC (Fallback para Documentos Não Identificados)

**Arquivo:** `generic.txt`

**Propósito:** Template padrão para processar qualquer documento que não se encaixa em categorias específicas

**Estrutura de Saída Obrigatória:**

1. **REESCRITA DO DOCUMENTO**
   - Transcrição completa e organizada de todos os dados visíveis

2. **EXPLICAÇÃO CONTEXTUAL** (3-5 parágrafos OBRIGATÓRIOS)
   - Paragrafo 1: Identifique o TIPO e ÓRGÃO EMISSOR
   - Paragrafo 2: Explique a FINALIDADE
   - Paragrafo 3: Resuma as PRINCIPAIS INFORMAÇÕES
   - Paragrafo 4: OBSERVAÇÕES RELEVANTES (opcional)
   - Paragrafo 5: INFORMAÇÕES ADICIONAIS (opcional)

3. **DADOS CATALOGADOS (JSON)**
   - tipo_documento_identificado
   - subtipo
   - orgao_emissor
   - partes (com CPF, RG, papel)
   - imovel (se aplicável)
   - valores
   - datas_importantes
   - numeros_identificadores
   - observacoes

**Regras Críticas:**
- NUNCA inventar dados - sempre null se ilegível
- EXPLICAÇÃO é OBRIGATÓRIA (nunca deixar vazia)
- Valores em BRL (converter formato 300.000,00 → 300000.00)
- Datas em DD/MM/AAAA

---

### 2.2. PROMPT RG

**Arquivo:** `rg.txt`

**Distinção Crítica: TITULAR vs AUTORIDADE**

- **TITULAR**: Nome no campo destacado = pessoa dona do RG
- **AUTORIDADE**: Delegado/Diretor que assina = quem EMITIU o documento
- NUNCA retornar autoridade como titular

**Extração Obrigatória:**
- Nome completo (do TITULAR, não da autoridade)
- Número RG com dígito verificador
- Data de nascimento (DD/MM/AAAA)
- Naturalidade (preserve exatamente como no documento)
- Filiação (pai e mãe separados)
- Órgão expedidor (SSP, DETRAN, etc.)
- UF expedidor (Sigla do estado)
- Data de expedição
- Via do documento ("1a via", "2a via", "2a via-R")
- Modelo do documento (número no canto superior direito)
- Instituto emissor (ex: "Ricardo Gumbleton Daunt" para SP)
- Tipo de RG: "antigo_papel" (verde), "novo_polimero" (branco/azul), "digital"

**Documentos Complementares (se presentes):**
- CPF (normalizar para XXX.XXX.XXX-XX)
- Documento de origem (Certidão de Nascimento)
- Título de Eleitor
- CNH
- CNS (Cartão Nacional de Saúde)

**Elementos Presentes:**
- Indicar presença de foto, assinatura, impressão digital

**Campos Vazios vs Ausentes:**
- Campo VAZIO: existe no layout mas sem valor
- Campo AUSENTE: não existe neste modelo de RG

**Casos Especiais:**

RG Antigo de São Paulo:
- Cor verde
- Modelo "8000-2"
- Instituto "Ricardo Gumbleton Daunt"
- Geralmente SEM data de expedição visível
- NÃO inclui CPF

RG Novo (Polímero):
- Cor branca/azul
- Inclui mais documentos complementares
- Tem data de expedição
- Pode ter chip

---

### 2.3. PROMPT CERTIDÃO NEGATIVA DE DÉBITOS TRABALHISTAS (CNDT)

**Arquivo:** `cndt.txt`

**Base Legal Obrigatória:**
- Artigos CLT: 642-A, 883-A
- Leis: 12.440/2011, 13.467/2017
- Atos Administrativos: ex: Ato 01/2022 da CGJT

**Campos Críticos:**
| Campo | Extração | Nota |
|-------|----------|------|
| Número da certidão | Obrigatório | 20+ dígitos |
| Nome/CPF/CNPJ | Obrigatório | Identifica titular |
| Data de emissão | Obrigatório | - |
| Data de validade | Obrigatório | 180 dias após emissão |
| Status | Obrigatório | EXATAMENTE como no documento |
| Resultado | Calculado | NEGATIVA (NAO CONSTA) ou POSITIVA (CONSTA) |
| URL de verificação | Obrigatório | Geralmente www.tst.jus.br |

**Tipo de Pessoa:**
- CPF → pessoa_fisica
- CNPJ → pessoa_juridica

**Status vs Resultado:**
```
Status Documento → Resultado
"NAO CONSTA"     → NEGATIVA (SEM DÉBITOS - BOM)
"CONSTA"         → POSITIVA (COM DÉBITOS - ALERTA)

situacao_regular = true se NAO CONSTA, false se CONSTA
```

**Explicação Contextual (Exemplo):**

Paragrafo 1:
> Este documento é uma Certidão Negativa de Débitos Trabalhistas (CNDT), emitida pelo Tribunal Superior do Trabalho (TST) para [NOME] (CPF [XXX]), portando o número de certidão [NUMERO].

Paragrafo 2:
> O status "NAO CONSTA" significa que [NOME] está REGULAR e não possui débitos trabalhistas registrados no Banco Nacional de Devedores Trabalhistas (BNDT), caracterizando uma certidão de resultado NEGATIVO (satisfatório).

Paragrafo 3:
> A certidão é válida por 180 dias contados da data de emissão ([DATA]), vencendo em [DATA_VALIDADE]. É recomendável verificar a autenticidade no portal oficial do TST em www.tst.jus.br.

Paragrafo 4:
> A certidão fundamenta-se nos Artigos 642-A e 883-A da Consolidação das Leis do Trabalho, regulamentados pelas Leis 12.440/2011 e 13.467/2017, sob responsabilidade do Tribunal Superior do Trabalho e dos Tribunais do Trabalho.

---

### 2.4. PROMPT CERTIDÃO DE NASCIMENTO

**Arquivo:** `certidao_nascimento.txt`

**Avaliação de Legibilidade (FAÇA PRIMEIRO):**
1. Qualidade geral: está legível? Há watermark, contraste baixo, desfoque?
2. Áreas legíveis: quais partes consegue ler claramente?
3. Áreas ilegíveis: quais partes estão comprometidas?
4. Para cada campo: decida se consegue extrair com confiança ou retorna null

**Técnicas para Documentos Difíceis:**
1. PRIORIZE etiquetas laterais/códigos de barras (melhor contraste)
2. PROCURE texto digitado/impresso em áreas sem watermark (margens, rodapés)
3. USE a matrícula para extrair estrutura (ano, livro, folha, termo)
4. NÃO FORCE leitura de texto claramente ilegível
5. Se identificar ESTRUTURA mas não CONTEÚDO, mencione

**Decodificação de Matrícula:**
```
AAAAAA BB CC DDDD E FFFF GGG HHHHHHH II

AAAAAA: Código Nacional da Serventia (6 dígitos)
BB: Identificador do acervo (2 dígitos)
CC: Tipo de serviço (55 = Registro Civil Pessoas Naturais)
DDDD: Ano do registro
E: Tipo de livro (1=Nascimento, 2=Casamento, 3=Óbito)
FFFF: Número do livro
GGG: Número da folha
HHHHHHH: Número do termo
II: Dígito verificador
```

**Campos de Saída Esperados:**
- Nome completo (ou ILEGÍVEL)
- Data de nascimento (ou ILEGÍVEL)
- Hora de nascimento (ou ILEGÍVEL)
- Local de nascimento: instituição de saúde completa + cidade/UF
- Sexo: masculino/feminino
- Filiação: pai e mãe
- Avós: paternos e maternos
- Dados do registro: cartório, livro, folha, termo
- Matrícula completa (se disponível)
- Averbações: casamento, divórcio, adoção, alteração de nome, óbito

**Qualidade de Imagem:**
- BOA: Legível, sem problemas
- MEDIA: Alguma dificuldade, mas extraível
- RUIM: Muito ilegível, retornar null para maioria

**Confiança de Extração:**
- ALTA: Dados extraídos com segurança
- MEDIA: Alguns dados com dúvida
- BAIXA: Maioria dos campos ilegível

---

### 2.5. PROMPT CERTIDÃO DE CASAMENTO

**Arquivo:** `certidao_casamento.txt`

**Regra Anti-Fabricação:**
- NUNCA use placeholders como "fff", "ggg", "hhh"
- Se houver dúvida sobre um valor, use null
- NUNCA invente datas, valores ou nomes

**Estrutura de Dados Obrigatória:**

```
Dados do Casamento:
- Data do casamento: DD/MM/AAAA
- Local: cartório completo, cidade, UF
- Regime de bens: comunhao parcial / universal / separacao total / etc
- Pacto antenupcial: sim/não + detalhes

Cônjuge 1:
- Nome completo ATUAL
- Nome de solteiro (se diferente)
- CPF, data de nascimento, naturalidade
- Filiação: pai e mãe

Cônjuge 2:
- Mesmos dados

Averbações:
- CAPTURAR TODAS: separação, divórcio, alteração de nome, conversão uniao estável, óbito
- Para cada: data, processo, vara judicial

Emissão:
- Data da certidão
- Escrevente, Oficial
- Matrícula
```

**Regimes de Bens (valores válidos):**
- COMUNHAO PARCIAL DE BENS
- COMUNHAO UNIVERSAL DE BENS
- SEPARACAO TOTAL DE BENS
- SEPARACAO OBRIGATORIA DE BENS
- PARTICIPACAO FINAL NOS AQUESTOS

**Averbações - O Que Procurar:**
- Separação judicial ou consensual
- Divórcio consensual ou litigioso
- Conversão de união estável
- Alteração de nome
- Óbito de um cônjuge
- Outras anotações relevantes

**Situação Atual do Vínculo:**
```
CASADOS: sem averbação de separação ou divórcio
SEPARADOS: averbação de separação mas não de divórcio
DIVORCIADOS: averbação de divórcio
VIUVO(A): averbação de óbito
```

---

### 2.6. PROMPT IPTU (Carne ou Certidão de Dados Cadastrais)

**Arquivo:** `iptu.txt`

**Campos Críticos (NUNCA OMITIR):**

1. **SQL** (cadastro municipal)
2. **Endereço completo** + componentes separados
3. **CEP**
4. **Contribuintes** com CPF/CNPJ e tipo (pessoa física/jurídica)
5. **Áreas do terreno**: incorporada, não incorporada, total
6. **TESTADA** em metros (campo explícito "Testada (m)")
7. **Fração ideal**: valor numérico E formatado
8. **Área construída** (DIFERENTE de área ocupada)
9. **ANO DA CONSTRUÇÃO CORRIGIDO** (DIFERENTE de ano de exercício)
10. **Padrão construtivo** e uso
11. **VALOR DO M² DO TERRENO** (campo em "Valores de m2 (R$)")
12. **VALOR DO M² DA CONSTRUÇÃO**
13. **Valores venais detalhados**: área incorporada, não incorporada, construção, total
14. **Ano do exercício fiscal**
15. **Data de emissão** do documento
16. **Número do documento** (identificador único)
17. **Solicitante** (nome e CPF)
18. **URL de autenticidade**
19. **Data limite para verificação**
20. **Subdivisão da zona urbana**

**Atenção Especial:**
- "Testada (m)" = metros de frente do terreno
- "Ano da construção corrigido" ≠ "Ano de exercício"
- "Área ocupada pela construção" ≠ "Área construída"
- Os "Valores de m2 (R$)" são campos explícitos - NÃO OMITIR

---

### 2.7. PROMPT ITBI (Guia de ITBI)

**Arquivo:** `itbi.txt`

**ERRO MAIS COMUM: Base de Cálculo**

```
ERRADO: base_calculo = valor_itbi
CORRETO: base_calculo = MAX(valor_transacao, valor_venal_referencia)

SEMPRE CALCULE E VALIDE!
```

**Conceitos Fundamentais:**

| Conceito | Definição | Exemplo |
|----------|-----------|---------|
| Valor da Transação | Preço pelo qual o imóvel foi negociado | R$ 500.000,00 |
| VVR | Valor Venal de Referência (valor cadastral) | R$ 450.000,00 |
| Base de Cálculo | MAX dos dois valores acima | R$ 500.000,00 |
| Alíquota | Percentual aplicado (2-3% em SP) | 3% |
| Valor do ITBI | Base × Alíquota | R$ 15.000,00 |

**Transmissão Parcial (CRÍTICO):**
```
Se "TOTALIDADE DO IMOVEL" = "Não":
- Indica co-propriedade ou fração ideal
- Campo PROPORCAO é OBRIGATÓRIO (ex: 74,89%)
- VVR pode aparecer como "PROPORCIONAL"
- Muito comum em apartamentos e heranças
```

**Campos Críticos - FREQUENTEMENTE IGNORADOS:**

1. **MATRICULA DO IMOVEL** (5-6 dígitos)
2. **PROPORCAO TRANSMITIDA** (se transmissão parcial)
3. **CARTORIO DE REGISTRO**
4. **MATRICULA DE REGISTRO**
5. **LINHA DIGITAVEL / CODIGO DE BARRAS** (47-48 dígitos)

**Validações Obrigatórias:**

1. Base de Cálculo:
   ```
   esperado = MAX(valor_transacao, valor_venal_referencia)
   Comparar com documento e usar o CALCULADO
   ```

2. Alíquota:
   ```
   aliquota = (valor_itbi / base_calculo) × 100
   Esperado: entre 2% e 3% (SP típico)
   ```

3. Total a Pagar:
   ```
   total = valor_itbi + multa + juros + atualizacao_monetaria
   ```

4. Datas Consistentes:
   ```
   data_emissao ≤ data_transacao ≤ data_vencimento
   ```

5. Partes da Transação:
   ```
   Se COMPRA E VENDA: deve haver transmitente E adquirente
   ```

---

### 2.8. PROMPT MATRÍCULA DE IMÓVEL

**Arquivo:** `matricula_imovel.txt`

**REGRAS CRÍTICAS (LEIA PRIMEIRO!):**

1. **CADEIA DOMINIAL COMPLETA**: Listar TODOS os proprietários desde a abertura
2. **ÔNUS COMPLETOS**: Capturar TANTO ativos QUANTO históricos (cancelados)
3. **VERIFICAR CANCELAMENTOS**: Procurar por "CANCELADA", "QUITADA", "BAIXADA"
4. **NUNCA CONFUNDIR**: OFICIAL DO CARTÓRIO ≠ PARTE DO NEGÓCIO

**O Que é R-X vs AV-X:**

- **R-1, R-2, R-3** = REGISTROS (atos principais)
  - Transmissão de propriedade (venda, doação, herança)
  - Constituição de ônus (hipoteca, alienação fiduciária)

- **AV-1, AV-2** = AVERBAÇÕES (atos acessórios)
  - Cancelamento de ônus
  - Mudança de estado civil
  - Alteração de denominação social
  - Retificação de dados

**Análise da Cadeia Dominial (PASSO A PASSO):**

a) **Identifique PROPRIETÁRIO ORIGINAL**:
   - Está no início da matrícula, após descrição do imóvel
   - Começa com "Proprietário:" ou logo após
   - Inclui TÍTULO AQUISITIVO (ex: "conforme Transcrição nº 00.000")

b) **Siga CADA registro R-X**:
   - R-1: Quem transmitiu? Para quem? Que tipo de ato?
   - Continue cronologicamente até o último

c) **Verifique averbações de cancelamento**:
   - Se encontrar "CANCELADA", o ônus está EXTINTO
   - Classifique em onus_historicos

d) **Determine PROPRIETÁRIOS ATUAIS**:
   - São os ÚLTIMOS ADQUIRENTES de transmissão de propriedade
   - Se nenhuma transmissão após abertura, é o proprietário original

**Classificação de Ônus:**

```json
{
  "onus_ativos": [
    {
      "tipo": "HIPOTECA",
      "registro": "R-2/00.000",
      "status": "ATIVO",
      "observacoes": "Sem averbação de cancelamento"
    }
  ],
  "onus_historicos": [
    {
      "tipo": "HIPOTECA",
      "registro": "R-2/00.000",
      "data_constituicao": "DD/MM/AAAA",
      "status": "CANCELADO",
      "averbacao_cancelamento": "AV-5/00.000",
      "data_cancelamento": "DD/MM/AAAA"
    }
  ]
}
```

**Diferenciação Crítica: OFICIAL vs PARTE**

- **OFICIAIS/ESCREVENTES** (IGNORAR como pessoa_relacionada):
  - Aparecem no FIM do documento (assinatura/certificação)
  - Exemplos: "NOME DO OFICIAL - Oficial", "Escrevente: NOME"

- **PARTES DO NEGÓCIO** (INCLUIR):
  - Aparecem NOS REGISTROS (R-X) e AVERBAÇÕES (AV-X)
  - São: vendedores, compradores, doadores, credores, devedores

---

### 2.9. PROMPT COMPROMISSO DE COMPRA E VENDA

**Arquivo:** `compromisso_compra_venda.txt`

**REGRA DE OURO: Sinal ≠ Preço Total**

Este é o erro mais comum. Diferenças críticas:

| Conceito | Definição | Exemplo |
|----------|-----------|---------|
| **PRECO TOTAL** | Valor COMPLETO do imóvel | R$ 500.000,00 |
| **SINAL/ENTRADA** | PRIMEIRA parcela (5-10%) | R$ 50.000,00 |
| **SALDO** | Valor RESTANTE | R$ 450.000,00 |

**VALIDAÇÃO OBRIGATÓRIA:**
```
sinal_entrada + saldo = valor_total
```

**Identificação do Tipo:**
1. Leia o TÍTULO completo
2. Se contiver "ADITIVO", "TERMO ADITIVO", "ADDENDUM" → tipo: "ADITIVO_COMPROMISSO_COMPRA_VENDA"
3. Se contiver "INSTRUMENTO PARTICULAR", "COMPROMISSO", "CONTRATO" → tipo principal

**Para Aditivos:**
```json
{
  "eh_aditivo": true,
  "numero_aditivo": 1,
  "documento_referenciado": {
    "tipo": "COMPROMISSO_COMPRA_VENDA",
    "envelope_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "data": "DD/MM/AAAA"
  },
  "motivo_aditivo": "Descrição do motivo"
}
```

**Fases de Extração:**

**FASE 1: Identificação**
- Data do contrato (antes das assinaturas)
- Tipo de documento (principal ou aditivo)

**FASE 2: Valores**
- Procure "Quadro Resumo" ou "Preço e Condições de Pagamento"
- Confirme: sinal + saldo = total
- Calcule percentual: (sinal / total) × 100

**FASE 3: Qualificação das Partes**
- Vendedores: nome, CPF, nacionalidade, profissão, estado civil, regime casamento, endereço
- Compradores: mesmos dados
- Dados bancários: banco, agência, conta, titular
- Se múltiplos: extrair percentual de participação

**FASE 4: Descrição do Imóvel**
- Tipo, endereço completo, matriculas (TODAS)
- Areas: privativa, comum, total
- Fracao ideal
- Vagas de garagem: número, tipo, matrícula

**FASE 5: Prazos**
- Pagamento do sinal: X dias úteis
- Pagamento do saldo: X dias corridos
- Escritura: X dias corridos ou data específica
- Condicoes associadas aos prazos

**FASE 6: Penalidades**
- Multa rescisória: percentual (ex: 10%)
- Cálculo: (percentual/100) × valor_total
- Multa moratória: percentual por dia
- Juros: percentual ao mês

**FASE 7: Cláusulas Especiais**
- Busque seções intituladas "Condições Específicas", "Cláusulas Especiais"
- ESTAS SE SOBREPÕEM aos termos gerais!
- Estruturar com: número, título, descrição, responsável, prazo, condicionalidade

**FASE 8: Responsabilidades**
```json
{
  "itbi": "comprador",
  "registro_imovel": "comprador",
  "custas_cartorio": "comprador",
  "debitos_anteriores": "vendedor",
  "comissao_corretagem": {
    "percentual": 6.0,
    "responsavel": "vendedor"
  }
}
```

**FASE 9: Assinatura Digital**
- Plataforma: DocuSign, ClickSign, D4Sign, Adobe Sign
- envelope_id
- status, data_assinatura

**FASE 10: Para Aditivos**
- Tipo deve ser ADITIVO_COMPROMISSO_COMPRA_VENDA
- Número do aditivo
- Documento que refencia (tipo, envelope_id, data)
- Motivo do aditivo

---

### 2.10. PROMPT ESCRITURA PÚBLICA

**Arquivo:** `escritura.txt`

**Dados Obrigatórios:**

```
Tipo: Compra e Venda, Doação, Permuta, etc.
Livro: [número]
Folhas: [números]
Data: [data]
Cartório: [nome completo]
Tabelião: [nome]
```

**Qualificação Completa das Partes:**

Para CADA outorgante/outorgado:
- Nome completo, nacionalidade, estado civil
- Regime de bens (se casado)
- Profissão, CPF, RG (com órgão expedidor)
- Endereço completo
- Cônjuge: nome e CPF (se casado)

**Qualificações:**
- Outorgantes (vendedores): VENDEDOR, DOADOR, PERMUTANTE
- Outorgados (compradores): COMPRADOR, DONATARIO, PERMUTANTE

**Descricão do Imóvel (completa):**
- Tipo (apartamento, casa, terreno, sala comercial)
- Endereco com CEP
- Matricula + cartório de RI
- SQL/Inscrição municipal
- Areas: privativa, comum, total, terreno (se condomínio)
- Fracao ideal (se condomínio)
- Vagas de garagem: quantidade e descrição

**Valores:**
- Valor da transação
- Valor declarado para ITBI
- ITBI recolhido (Sim/Não + guia + valor)
- Forma de pagamento (detalhada)
- Financiamento (se houver): banco, valor, prazo

**Certidões Apresentadas:**
- CNDT, CND Federal, CND Municipal
- Matrícula atualizada
- Comprovante de ITBI
- Procurações (se aplicável)
- Qualquer outra mencionada

**Observações Importantes:**
- O campo "explicacao_contextual" é OBRIGATÓRIO (3-5 parágrafos)
- Se houver procurador, identificar também o outorgante da procuração
- Converter valores: 300.000,00 → 300000.00
- Manter datas em DD/MM/AAAA

---

### 2.11. PROMPT PROTOCOLO ONR

**Arquivo:** `protocolo_onr.txt`

**O Que é SAEC/ONR:**
- ONR = Operador Nacional do Registro de Imóveis
- SAEC = Sistema de Atendimento Eletrônico Compartilhado
- Permite solicitar certidões, acompanhar pedidos, realizar serviços registrais online

**Campos Críticos a Extrair:**

| Campo | Tipo | Nota |
|-------|------|------|
| Número do Protocolo | String | Formato: "P00000000000X" |
| Data | Date | DD/MM/AAAA |
| Hora | Time | HH:MM:SS |
| Tipo de Solicitação | String | Inferir do título da página |
| Status | String | "GERADO COM SUCESSO", "AGUARDANDO PAGAMENTO", etc |

**Timestamps:**
Há frequentemente dois tipos:
1. Data/hora do cabeçalho: "DD/MM/AAAA, HH:MM"
2. Timestamp em URLs: "VOID=DD/MM/AAAA HH:MM:SS"
PRIORIZE o mais preciso (com segundos)

**Campos Opcionais:**
- URL do sistema
- Informações de suporte (telefone, email, horário)
- Matrícula, cartório, comarca (se mencionados)

**Estrutura de Explicação Contextual:**

Paragrafo 1:
> Este documento é um comprovante de protocolo do Sistema de Atendimento Eletrônico Compartilhado (SAEC) do Operador Nacional do Registro (ONR), gerado com número [NUMERO_PROTOCOLO] em [DATA] às [HORA].

Paragrafo 2:
> O ONR é o Operador Nacional do Registro de Imóveis, responsável pela integração dos cartórios de registro de imóveis do Brasil. O SAEC é seu sistema que permite solicitar certidões, acompanhar pedidos e realizar serviços registrais online.

Paragrafo 3:
> Este protocolo refere-se a uma solicitação de [TIPO_SOLICITACAO], com status [STATUS]. O solicitante pode acompanhar o andamento através do número de protocolo.

---

### 2.12. PROMPT COMPROVANTE DE PAGAMENTO

**Arquivo:** `comprovante_pagamento.txt`

**Campos Obrigatórios:**
- Valor pago (número)
- Data do pagamento (DD/MM/AAAA)

**Campos Frequentes:**
- Banco de origem, banco de destino
- Hora da transação
- Código de autenticação
- Tipo de transação: PIX, TED, DOC, BOLETO, DEPOSITO

**Partes Envolvidas:**
- Beneficiário: nome, CPF/CNPJ, banco, agência, conta
- Pagador: nome, CPF/CNPJ, banco, agência, conta

**Identificadores:**
- Código de barras (para boletos)
- Chave PIX (para PIX)
- Linha digitável

---

### 2.13. PROMPT COMPROVANTE DE ASSINATURA DIGITAL

**Arquivo:** `assinatura_digital.txt`

**Plataformas Reconhecidas:**
- DocuSign
- Adobe Sign
- ClickSign
- D4Sign

**Campos Obrigatórios:**
- Plataforma
- Envelope ID (UUID)
- Signatários com status

**Status de Signatários:**
- ASSINADO
- PENDENTE
- RECUSADO

**Informações de Signatário:**
- Nome, email, CPF
- Status, data de assinatura, hora
- IP de assinatura (para auditoria)
- Certificado utilizado

**Datas:**
- Data de envio
- Data de conclusão (quando todos assinaram)

**Status do Envelope:**
- CONCLUIDO
- PENDENTE
- CANCELADO
- EXPIRADO

---

## 3. MAPEAMENTO DE CAMPOS GLOBAIS

### 3.1. Formato de Dados Padrão

**Datas:** Sempre `DD/MM/AAAA`

**Valores Monetários:** Float sem símbolos ou separadores
```
ERRADO: "R$ 500.000,00"
CORRETO: 500000.00
```

**CPF/CNPJ:** Manter formatação com pontos e hífens
```
CPF: "000.000.000-00"
CNPJ: "00.000.000/0001-00"
```

**Endereços:** Estruturado com componentes
```json
{
  "logradouro": "Rua Exemplo",
  "numero": "123",
  "complemento": "Apto 101, Bloco A",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "00000-000"
}
```

**Endereço Completo (string):**
```
"Rua Exemplo, 123, Apto 101, Bloco A, Centro, São Paulo - SP, 00000-000"
```

---

### 3.2. Níveis de Extração

| Nível | Descrição | Prioridade |
|-------|-----------|-----------|
| 1 | Campos críticos identificáveis | MÁXIMA |
| 2 | Campos importantes estruturados | ALTA |
| 3 | Campos complexos ou opcionais | MÉDIA |

---

### 3.3. Confiança Esperada

| Nível | Descrição | Ação |
|-------|-----------|------|
| ALTA | Campo legível e extraível com segurança | Extrair |
| MEDIA | Alguma dificuldade, mas extraível | Extrair com null se inseguro |
| BAIXA | Muito ilegível ou ambíguo | Retornar null |

---

## 4. REGRAS ANTI-FABRICAÇÃO

**NUNCA:**
- ❌ Inventar CPF, CNPJ, datas, valores
- ❌ Usar placeholders ("EXEMPLO", "fff", "ggg")
- ❌ Assumir valores que não constam explicitamente
- ❌ Expandir abreviaturas além do necessário
- ❌ Fabricar nomes ou endereços

**SEMPRE:**
- ✅ Usar `null` para campos ilegíveis
- ✅ Preservar formatação exata do documento
- ✅ Mencionar em `explicacao_contextual` campos ilegíveis
- ✅ Validar consistência de dados antes de finalizar
- ✅ Documentar campos vazios vs ausentes

---

## 5. CHECKLIST DE QUALIDADE POR TIPO

### RG
- [ ] Titular ≠ Autoridade emissora
- [ ] CPF normalizado (XXX.XXX.XXX-XX)
- [ ] Data nascimento anterior a data expedição
- [ ] Tipo de RG classificado corretamente
- [ ] Campos vazios documentados

### CNDT
- [ ] Status exatamente como no documento
- [ ] Resultado classificado corretamente
- [ ] Data validade = 180 dias após emissão
- [ ] Base legal extraída (CLT, Leis, Atos)
- [ ] URL de verificação incluída

### Certidão de Nascimento
- [ ] Data nascimento anterior a data registro
- [ ] Matrícula decodificada (se novo formato)
- [ ] Qualidade de imagem documentada
- [ ] Campos legíveis vs ilegíveis listados
- [ ] Averbações capturadas (casamento, adoção, etc)

### Certidão de Casamento
- [ ] Regime de bens validado
- [ ] Averbações TODAS capturadas
- [ ] Situação atual do vínculo inferida
- [ ] CPF normalizado
- [ ] Datas coerentes

### IPTU
- [ ] SQL extraído
- [ ] Testada em metros extraída
- [ ] Valor m² terreno E construção
- [ ] Ano construção corrigido ≠ ano exercício
- [ ] Contribuintes com tipo (PF/PJ)

### ITBI
- [ ] Base de cálculo = MAX(valor, VVR)
- [ ] Alíquota calculada (2-3%)
- [ ] Matricula extraída
- [ ] Proporcao extraída (se parcial)
- [ ] Cartorio de registro extraído
- [ ] Linha digitável extraída

### Matrícula
- [ ] Proprietário original incluído
- [ ] Cadeia dominial COMPLETA
- [ ] Ônus ativos E históricos separados
- [ ] Cancelamentos de ônus detectados
- [ ] Oficial do cartório ≠ partes
- [ ] Explicação contextual: 3-5 parágrafos

### Compromisso de Compra e Venda
- [ ] Sinal + saldo = preco total
- [ ] Multa rescisória calculada
- [ ] Prazos especificados
- [ ] Todas as matrículas extraídas
- [ ] Dados bancários estruturados
- [ ] Aditivos marcados corretamente

### Escritura
- [ ] Qualificação completa das partes
- [ ] Tipo de escritura identificado
- [ ] Imovel descrito completamente
- [ ] Certidões apresentadas listadas
- [ ] Valores coerentes
- [ ] Explicação contextual obrigatória

---

## 6. ESTRUTURA JSON PADRÃO GLOBAL

Todos os documentos seguem esta estrutura raiz:

```json
{
  "tipo_documento": "STRING",
  "versao_schema": "1.0",
  "complexidade": "MUITO_BAIXA|BAIXA|MEDIA|ALTA|MUITO_ALTA",
  "explicacao_contextual": "OBRIGATORIO: 3-5 paragrafos",
  "campos_extraidos": {
    "obrigatorios": ["lista de campos extraidos"],
    "opcionais": ["lista de campos extraidos"],
    "vazios": ["lista de campos que existem mas sem valor"],
    "ilegiveis": ["lista de campos nao legiveis"]
  },
  "dados_catalogados": {
    "...": "Estrutura específica do tipo"
  },
  "alertas": [
    {
      "gravidade": "INFO|AVISO|CRITICO",
      "tipo": "STRING",
      "mensagem": "STRING"
    }
  ],
  "data_extracao": "DD/MM/AAAA HH:MM:SS",
  "confianca_global": "ALTA|MEDIA|BAIXA"
}
```

---

## 7. FLUXO DE PROCESSAMENTO

```
1. RECEBIMENTO DO DOCUMENTO
   ↓
2. AVALIAÇÃO DE QUALIDADE/LEGIBILIDADE
   ↓
3. IDENTIFICAÇÃO DO TIPO
   ↓
4. SELEÇÃO DE SCHEMA + PROMPT
   ↓
5. EXTRAÇÃO DE CAMPOS OBRIGATÓRIOS
   ↓
6. EXTRAÇÃO DE CAMPOS OPCIONAIS
   ↓
7. VALIDAÇÃO DE CONSISTÊNCIA
   ↓
8. GERAÇÃO DE EXPLICAÇÃO CONTEXTUAL
   ↓
9. ESTRUTURAÇÃO EM JSON
   ↓
10. CHECKLIST FINAL
   ↓
11. RETORNO DE RESULTADO
```

---

## 8. CONCLUSÃO

Este sistema foi desenvolvido para máxima precisão na extração de dados cartoriais e imobiliários. Os schemas definem a ESTRUTURA esperada, enquanto os prompts definem as REGRAS de extração e validação.

**Pontos-chave:**
- NUNCA fabricar dados
- USAR null para campos ilegíveis
- VALIDAR consistência
- DOCUMENTAR explicação contextual
- SEGUIR checklists por tipo

**Versão:** 1.0
**Data:** 2026-01-27
**Criado para:** Minutas-Cartório-Documentos
