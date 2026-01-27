# Tipos de Documentos - Referencia Completa

**Versao:** 1.0
**Data:** 2026-01-27
**Total de Tipos:** 26
**Ultima Atualizacao:** Criado com base na validacao da Fase 1

---

## Visao Geral

Este documento serve como referencia rapida para os 26 tipos de documentos reconhecidos pelo sistema de catalogacao. Use-o para:
- Entender quando usar cada classificacao
- Resolver ambiguidades entre tipos similares
- Conhecer os dados extraiveis de cada documento

---

## Categorias

| Categoria | Quantidade | Documentos |
|-----------|------------|------------|
| Documentos Pessoais | 7 | RG, CNH, CPF, Certidoes (3), Comprovante Residencia |
| Certidoes | 7 | CNDT, CND (4), Contrato Social |
| Documentos do Imovel | 6 | Matricula, ITBI, VVR, IPTU, Dados Cadastrais, Escritura |
| Documentos do Negocio | 3 | Compromisso, Procuracao, Comprovante Pagamento |
| Documentos Administrativos | 3 | Protocolo ONR, Assinatura Digital, Outro |

---

## 1. Documentos Pessoais (7 tipos)

### 1.1 RG
**Codigo:** `RG`
**Descricao:** Carteira de Identidade (Registro Geral)

**Caracteristicas Visuais:**
- Documento com foto 3x4
- Numero RG com digito verificador
- Orgao emissor (SSP, DETRAN, etc.)
- UF de emissao
- Data de expedicao
- Filiacao (nome dos pais)
- Assinatura do titular

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome completo | MARIA DA SILVA SANTOS |
| Numero RG | 12.345.678-9 |
| Orgao emissor | SSP |
| UF | SP |
| Data expedicao | 15/03/2020 |
| Filiacao pai | JOSE DA SILVA |
| Filiacao mae | ANA MARIA SANTOS |
| Data nascimento | 10/05/1985 |
| Naturalidade | SAO PAULO/SP |

**Exemplos Reais:**
- RG fisico (papel ou plastico)
- RG digital (app GOV.BR)
- Frente e verso em imagens separadas
- Foto de WhatsApp do RG

**Nao Confundir Com:**
- CNH (que tambem tem foto, mas formato diferente)
- RNE/RNM (documento de estrangeiro)

**Frequencia na Validacao:** 5 ocorrencias (13%)

---

### 1.2 CNH
**Codigo:** `CNH`
**Descricao:** Carteira Nacional de Habilitacao

**Caracteristicas Visuais:**
- Formato cartao de credito (nova) ou papel (antiga)
- Foto do condutor
- Categoria de habilitacao (A, B, AB, etc.)
- Numero do registro
- CPF integrado
- Data de validade

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome completo | JOAO PEDRO SOUZA |
| Numero registro | 01234567890 |
| CPF | 123.456.789-00 |
| Data nascimento | 15/08/1990 |
| Categoria | AB |
| Data 1a habilitacao | 10/12/2010 |
| Validade | 20/08/2030 |

**Exemplos Reais:**
- CNH fisica (nova ou modelo antigo)
- CNH digital (app)
- Foto frontal da CNH

**Nao Confundir Com:**
- RG (CNH pode substituir RG, mas tem categorias de habilitacao)

**Frequencia na Validacao:** 0 ocorrencias (nao presente no lote de teste)

---

### 1.3 CPF
**Codigo:** `CPF`
**Descricao:** Cadastro de Pessoa Fisica - documento avulso

**Caracteristicas Visuais:**
- Cartao pequeno verde/azul (modelo antigo)
- Comprovante de inscricao impresso
- Numero com 11 digitos (XXX.XXX.XXX-XX)

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Numero CPF | 123.456.789-00 |
| Nome completo | MARIA SILVA |
| Data nascimento | 10/05/1985 |

**Exemplos Reais:**
- Cartao CPF fisico
- Comprovante de situacao cadastral
- Print do site da Receita Federal

**Nao Confundir Com:**
- CPF impresso no RG ou CNH (nao classificar como CPF, usar RG ou CNH)

**Frequencia na Validacao:** 0 ocorrencias

---

### 1.4 CERTIDAO_NASCIMENTO
**Codigo:** `CERTIDAO_NASCIMENTO`
**Descricao:** Certidao de Registro de Nascimento

**Caracteristicas Visuais:**
- Papel timbrado de cartorio de registro civil
- Numero da matricula (formato: XXXXXX.XX.XX.XXXX.X.XXXXX.XXX.XXXXXXX-XX)
- Nome completo do registrado
- Data e local de nascimento
- Filiacao completa

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome completo | PEDRO HENRIQUE SILVA |
| Data nascimento | 15/03/1995 |
| Hora nascimento | 14:30 |
| Local nascimento | SAO PAULO/SP |
| Nome pai | JOSE CARLOS SILVA |
| Nome mae | MARIA APARECIDA SILVA |
| Matricula | 123456.01.55.2020.1.12345.123.1234567-89 |
| Cartorio | 1o Cartorio de Registro Civil de Sao Paulo |

**Exemplos Reais:**
- Certidao original (papel timbrado)
- Certidao digitalizada (PDF)
- Foto de WhatsApp da certidao
- Via atualizada (emitida recentemente)

**Nao Confundir Com:**
- Certidao de Casamento (menciona matrimonio, nao nascimento)
- Certidao de Obito (menciona falecimento)

**Frequencia na Validacao:** 2 ocorrencias (5%)

---

### 1.5 CERTIDAO_CASAMENTO
**Codigo:** `CERTIDAO_CASAMENTO`
**Descricao:** Certidao de Registro de Casamento

**Caracteristicas Visuais:**
- Papel timbrado de cartorio de registro civil
- Nomes dos dois conjuges
- Data do casamento
- Regime de bens
- Pode ter averbacoes (separacao, divorcio)

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome conjuge 1 | JOAO DA SILVA |
| Nome conjuge 2 | MARIA SANTOS |
| Data casamento | 20/11/2010 |
| Regime de bens | COMUNHAO PARCIAL |
| Matricula | 123456.01.55.2020.2.12345.123.1234567-89 |
| Cartorio | 2o Cartorio de Registro Civil de Sao Paulo |
| Averbacao | DIVORCIO em 15/03/2020 |

**Exemplos Reais:**
- Certidao original
- Certidao com averbacao de divorcio
- Via atualizada
- Foto de WhatsApp

**Nao Confundir Com:**
- Certidao de Nascimento (mesmo formato, mas conteudo diferente)
- Pacto Antenupcial (documento separado sobre regime de bens)

**Frequencia na Validacao:** 3 ocorrencias (8%)

---

### 1.6 CERTIDAO_OBITO
**Codigo:** `CERTIDAO_OBITO`
**Descricao:** Certidao de Registro de Obito

**Caracteristicas Visuais:**
- Papel timbrado de cartorio de registro civil
- Nome do falecido
- Data e local do obito
- Causa mortis
- Dados dos familiares

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome falecido | JOSE DA SILVA |
| Data obito | 10/05/2023 |
| Local obito | SAO PAULO/SP |
| Causa mortis | INFARTO AGUDO DO MIOCARDIO |
| Estado civil | CASADO |
| Conjuge | MARIA DA SILVA |

**Exemplos Reais:**
- Certidao original
- Via atualizada
- Necessaria em casos de sucessao

**Nao Confundir Com:**
- Certidao de Nascimento ou Casamento
- Declaracao de obito (documento medico, nao registral)

**Frequencia na Validacao:** 0 ocorrencias

---

### 1.7 COMPROVANTE_RESIDENCIA
**Codigo:** `COMPROVANTE_RESIDENCIA`
**Descricao:** Documento que comprova endereco do titular

**Caracteristicas Visuais:**
- Conta de servicos (agua, luz, gas, telefone)
- Nome do titular
- Endereco completo
- Data recente (geralmente aceito ate 90 dias)

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome titular | MARIA DA SILVA |
| Endereco | RUA DAS FLORES, 123 |
| Bairro | CENTRO |
| Cidade | SAO PAULO |
| UF | SP |
| CEP | 01234-567 |
| Data emissao | 01/2026 |

**Exemplos Reais:**
- Conta de luz (ENEL, CPFL)
- Conta de agua (SABESP)
- Conta de gas (COMGAS)
- Fatura de cartao de credito
- Declaracao de residencia

**Nao Confundir Com:**
- Comprovante de pagamento (COMPROVANTE_PAGAMENTO e sobre transacoes financeiras)

**Frequencia na Validacao:** 0 ocorrencias

---

## 2. Certidoes (7 tipos)

### 2.1 CNDT
**Codigo:** `CNDT`
**Descricao:** Certidao Negativa de Debitos Trabalhistas

**Caracteristicas Visuais:**
- Emitida pelo TST (Tribunal Superior do Trabalho)
- Logo da Justica do Trabalho
- Codigo de autenticidade
- Validade de 180 dias
- QR Code para validacao

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome/Razao Social | JOAO DA SILVA |
| CPF/CNPJ | 123.456.789-00 |
| Numero certidao | 12345678901234567890 |
| Data expedicao | 27/01/2026 |
| Hora expedicao | 10:30:45 |
| Validade | 26/07/2026 |
| Resultado | NADA CONSTA |

**Exemplos Reais:**
- Certidao impressa do site do TST
- PDF baixado do portal
- Captura de tela

**Nao Confundir Com:**
- CND Federal (Receita Federal, nao Justica do Trabalho)
- CND Estadual ou Municipal

**Frequencia na Validacao:** 2 ocorrencias (5%)

---

### 2.2 CND_FEDERAL
**Codigo:** `CND_FEDERAL`
**Descricao:** Certidao de Regularidade Fiscal junto a Uniao (Receita Federal/PGFN)

**Caracteristicas Visuais:**
- Logo da Receita Federal
- Ou logo da PGFN
- Codigo de autenticidade
- Mencao a "tributos federais" ou "divida ativa da Uniao"

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome/Razao Social | MARIA SILVA |
| CPF/CNPJ | 123.456.789-00 |
| Numero certidao | 0000.0000.0000.0000 |
| Data emissao | 27/01/2026 |
| Validade | 26/07/2026 |
| Tipo | NEGATIVA ou POSITIVA COM EFEITOS DE NEGATIVA |

**Exemplos Reais:**
- Certidao conjunta PGFN/RFB
- Certidao de debitos relativos a tributos federais
- PDF do portal e-CAC

**Nao Confundir Com:**
- CNDT (trabalhista, nao federal)
- CND Estadual ou Municipal

**Frequencia na Validacao:** 0 ocorrencias

---

### 2.3 CND_ESTADUAL
**Codigo:** `CND_ESTADUAL`
**Descricao:** Certidao Negativa de Debitos Estaduais

**Caracteristicas Visuais:**
- Logo do estado ou Secretaria da Fazenda Estadual
- SEFAZ ou similar
- Referencia a ICMS ou tributos estaduais

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Nome/Razao Social | EMPRESA LTDA |
| CPF/CNPJ | 12.345.678/0001-90 |
| Inscricao Estadual | 123.456.789.000 |
| Data emissao | 27/01/2026 |
| Validade | 26/04/2026 |

**Exemplos Reais:**
- Certidao da SEFAZ-SP
- Certidao negativa de ICMS
- Certidao de regularidade fiscal estadual

**Nao Confundir Com:**
- CND Federal (Receita Federal)
- CND Municipal (prefeitura)

**Frequencia na Validacao:** 0 ocorrencias

---

### 2.4 CND_MUNICIPAL
**Codigo:** `CND_MUNICIPAL`
**Descricao:** Certidao Negativa de Debitos Municipais (Tributos Imobiliarios)

**Caracteristicas Visuais:**
- Logo da prefeitura
- Referencia a SQL (numero do contribuinte)
- Mencao a IPTU, ISS, ou tributos municipais
- Pode ser "Negativa de Tributos Imobiliarios"

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Contribuinte | JOAO DA SILVA |
| CPF/CNPJ | 123.456.789-00 |
| SQL | 000.000.0000-0 |
| Endereco imovel | RUA DAS FLORES, 123 |
| Data emissao | 27/01/2026 |
| Validade | 26/04/2026 |

**Exemplos Reais:**
- Certidao de tributos imobiliarios (Prefeitura SP)
- Certidao negativa de IPTU
- PDF do portal da prefeitura

**Nao Confundir Com:**
- IPTU (carne ou guia de pagamento, nao certidao)
- CND Estadual ou Federal

**Frequencia na Validacao:** 1 ocorrencia (3%)

---

### 2.5 CND_IMOVEL
**Codigo:** `CND_IMOVEL`
**Descricao:** Certidao Negativa de Debitos relativa a um imovel especifico

**Caracteristicas Visuais:**
- Similar a CND Municipal, mas especifica para um imovel
- Mencao ao SQL ou matricula do imovel
- Pode ser "Certidao de Quitacao de IPTU"

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| SQL | 000.000.0000-0 |
| Matricula | 123.456 |
| Endereco | RUA DAS FLORES, 123 - AP 101 |
| Situacao | SEM DEBITOS |
| Data emissao | 27/01/2026 |
| Validade | 26/04/2026 |

**Exemplos Reais:**
- Certidao vinculada a matricula especifica
- Certidao de quitacao fiscal do imovel

**Nao Confundir Com:**
- CND Municipal (pode ser do proprietario, nao do imovel especificamente)
- Matricula do Imovel (documento do RI, nao da prefeitura)

**Frequencia na Validacao:** 0 ocorrencias

---

### 2.6 CND_CONDOMINIO
**Codigo:** `CND_CONDOMINIO`
**Descricao:** Declaracao de Quitacao Condominial

**Caracteristicas Visuais:**
- Papel timbrado do condominio ou administradora
- Nome do condominio
- Identificacao da unidade (apto, bloco)
- Declaracao de inexistencia de debitos
- Assinatura do sindico ou administrador

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Condominio | EDIFICIO SOLAR DAS FLORES |
| Unidade | APTO 101 - BLOCO A |
| Proprietario | MARIA DA SILVA |
| Data referencia | Janeiro/2026 |
| Situacao | QUITADO |
| Assinatura | Sindico ou Administradora |

**Exemplos Reais:**
- Declaracao de quitacao assinada pelo sindico
- Declaracao da administradora
- Certidao negativa de debitos condominiais

**Nao Confundir Com:**
- Convencao de condominio (regras do condominio)
- Ata de assembleia

**Frequencia na Validacao:** 0 ocorrencias

---

### 2.7 CONTRATO_SOCIAL
**Codigo:** `CONTRATO_SOCIAL`
**Descricao:** Contrato Social de Pessoa Juridica

**Caracteristicas Visuais:**
- Documento com clausulas numeradas
- Dados da empresa (CNPJ, razao social)
- Quadro societario (socios e participacoes)
- Capital social
- Registro na Junta Comercial

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Razao Social | EMPRESA COMERCIAL LTDA |
| Nome Fantasia | EMPRESA COMERCIAL |
| CNPJ | 12.345.678/0001-90 |
| Endereco sede | RUA COMERCIAL, 500 |
| Capital Social | R$ 100.000,00 |
| Socios | JOAO (50%), MARIA (50%) |
| Administrador | JOAO DA SILVA |
| Data constituicao | 15/03/2015 |

**Exemplos Reais:**
- Contrato social original
- Consolidacao de alteracoes
- Ultima alteracao contratual
- Certidao simplificada da Junta

**Nao Confundir Com:**
- Compromisso de Compra e Venda (contrato de imovel, nao de empresa)
- Procuracao (outorga de poderes)

**Frequencia na Validacao:** 0 ocorrencias

---

## 3. Documentos do Imovel (6 tipos)

### 3.1 MATRICULA_IMOVEL
**Codigo:** `MATRICULA_IMOVEL`
**Descricao:** Certidao de Matricula do Registro de Imoveis

**Caracteristicas Visuais:**
- Papel timbrado do Cartorio de Registro de Imoveis
- Numero da matricula em destaque
- Descricao detalhada do imovel
- Cadeia de proprietarios (averbacoes e registros)
- Onus e gravames (se houver)

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Numero matricula | 123.456 |
| Cartorio RI | 1o Cartorio de Registro de Imoveis de SP |
| Descricao imovel | APARTAMENTO 101, BLOCO A... |
| Area privativa | 65,00 m2 |
| Area comum | 25,00 m2 |
| Fracao ideal | 0,0125 |
| Proprietario atual | JOAO DA SILVA |
| CPF proprietario | 123.456.789-00 |
| Onus | HIPOTECA em favor de BANCO X |

**Exemplos Reais:**
- Certidao de inteiro teor
- Certidao de onus reais
- Certidao atualizada (20 ou 30 dias)
- Foto de WhatsApp da matricula

**Nao Confundir Com:**
- Dados Cadastrais (prefeitura, nao RI)
- Escritura (documento do tabelionato, nao do RI)

**Frequencia na Validacao:** 6 ocorrencias (15%) - MAIS FREQUENTE

---

### 3.2 ITBI
**Codigo:** `ITBI`
**Descricao:** Guia ou Comprovante de ITBI (Imposto de Transmissao de Bens Imoveis)

**Caracteristicas Visuais:**
- Logo da prefeitura
- Codigo de barras para pagamento
- Valor do imposto
- Base de calculo
- Dados do imovel e das partes

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Numero guia | 2026.123.456.789 |
| Transmitente | JOAO DA SILVA (vendedor) |
| Adquirente | MARIA SANTOS (comprador) |
| SQL | 000.000.0000-0 |
| Valor transmissao | R$ 500.000,00 |
| Base calculo | R$ 500.000,00 |
| Aliquota | 3% |
| Valor ITBI | R$ 15.000,00 |
| Data emissao | 27/01/2026 |
| Data vencimento | 27/02/2026 |

**Exemplos Reais:**
- Guia de ITBI (para pagamento)
- Comprovante de pagamento de ITBI
- Relatorio consolidado do ITBI
- Recibo de ITBI

**Nao Confundir Com:**
- VVR (apenas valor venal, sem ITBI)
- Comprovante de pagamento generico

**Frequencia na Validacao:** 3 ocorrencias (8%)

---

### 3.3 VVR
**Codigo:** `VVR`
**Descricao:** Valor Venal de Referencia

**Caracteristicas Visuais:**
- Consulta no site da prefeitura
- SQL do imovel
- Valor venal de referencia em destaque
- Geralmente usado para calculo de ITBI

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| SQL | 000.000.0000-0 |
| Valor Venal Referencia | R$ 450.000,00 |
| Ano referencia | 2026 |
| Endereco | RUA DAS FLORES, 123 |
| Area construida | 65,00 m2 |

**Exemplos Reais:**
- Consulta VVR da prefeitura
- PDF do site da prefeitura de SP
- Print da tela de consulta

**Nao Confundir Com:**
- IPTU (carne com valor venal, mas e guia de pagamento)
- ITBI (usa VVR como base, mas e o imposto)

**Frequencia na Validacao:** 1 ocorrencia (3%)

---

### 3.4 IPTU
**Codigo:** `IPTU`
**Descricao:** Carne ou Certidao de IPTU

**Caracteristicas Visuais:**
- Logo da prefeitura
- SQL do imovel
- Valor venal do terreno e construcao
- Area do terreno e construida
- Valor do imposto

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| SQL | 000.000.0000-0 |
| Exercicio | 2026 |
| Contribuinte | JOAO DA SILVA |
| Endereco | RUA DAS FLORES, 123 |
| Valor venal terreno | R$ 200.000,00 |
| Valor venal construcao | R$ 250.000,00 |
| Valor venal total | R$ 450.000,00 |
| Area terreno | 150,00 m2 |
| Area construida | 65,00 m2 |

**Exemplos Reais:**
- Carne de IPTU
- Certidao de dados cadastrais (com valores venais)
- PDF do portal da prefeitura

**Nao Confundir Com:**
- CND Municipal (certidao de quitacao, nao o carne)
- VVR (valor venal de referencia, conceito diferente)

**Frequencia na Validacao:** 1 ocorrencia (3%)

---

### 3.5 DADOS_CADASTRAIS
**Codigo:** `DADOS_CADASTRAIS`
**Descricao:** Ficha Cadastral do Imovel na Prefeitura

**Caracteristicas Visuais:**
- Dados tecnicos do imovel
- SQL
- Area, testada, frentes
- Uso do imovel (residencial, comercial)
- Padrao construtivo

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| SQL | 000.000.0000-0 |
| Endereco | RUA DAS FLORES, 123 |
| Bairro | CENTRO |
| CEP | 01234-567 |
| Area terreno | 150,00 m2 |
| Area construida | 65,00 m2 |
| Uso | RESIDENCIAL |
| Padrao | MEDIO |
| Frente | RUA DAS FLORES |

**Exemplos Reais:**
- Certidao de dados cadastrais
- Ficha do imovel
- Consulta no CADIN/SITU

**Nao Confundir Com:**
- Matricula (dados do RI, nao da prefeitura)
- IPTU (tem alguns dados, mas foco no imposto)

**Frequencia na Validacao:** 0 ocorrencias

---

### 3.6 ESCRITURA
**Codigo:** `ESCRITURA`
**Descricao:** Escritura Publica de Compra e Venda (ou outras)

**Caracteristicas Visuais:**
- Papel timbrado de tabelionato de notas
- Titulo "ESCRITURA PUBLICA DE..."
- Dados completos das partes
- Descricao detalhada do imovel
- Valor e forma de pagamento
- Clausulas e declaracoes
- Assinaturas e selos

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Tipo escritura | COMPRA E VENDA |
| Livro/Folha | Livro 123, Folhas 456-470 |
| Tabelionato | 1o Tabeliao de Notas de SP |
| Data lavratura | 27/01/2026 |
| Vendedor | JOAO DA SILVA |
| Comprador | MARIA SANTOS |
| Imovel | APARTAMENTO 101... |
| Valor | R$ 500.000,00 |
| Forma pagamento | A VISTA |

**Exemplos Reais:**
- Minuta de escritura (rascunho)
- Escritura lavrada (documento final)
- Traslado ou certidao da escritura

**Nao Confundir Com:**
- Compromisso de Compra e Venda (contrato particular)
- Matricula (registro no RI apos escritura)

**Frequencia na Validacao:** 1 ocorrencia (3%)

---

## 4. Documentos do Negocio (3 tipos)

### 4.1 COMPROMISSO_COMPRA_VENDA
**Codigo:** `COMPROMISSO_COMPRA_VENDA`
**Descricao:** Contrato Particular de Compromisso de Compra e Venda

**Caracteristicas Visuais:**
- Titulo "COMPROMISSO", "CONTRATO", ou "INSTRUMENTO PARTICULAR"
- Clausulas numeradas
- Dados das partes (vendedor e comprador)
- Descricao do imovel
- Valor e forma de pagamento
- Assinaturas das partes e testemunhas

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Vendedor | JOAO DA SILVA |
| CPF vendedor | 123.456.789-00 |
| Comprador | MARIA SANTOS |
| CPF comprador | 987.654.321-00 |
| Imovel | APARTAMENTO 101... |
| Matricula | 123.456 |
| Valor total | R$ 500.000,00 |
| Entrada | R$ 100.000,00 |
| Saldo | R$ 400.000,00 (financiamento) |
| Data contrato | 15/12/2025 |

**Exemplos Reais:**
- Contrato do Quinto Andar
- Contrato de imobiliaria
- Aditivo ao compromisso
- Contrato particular manuscrito ou digitado

**Nao Confundir Com:**
- Escritura (documento publico, lavrado em cartorio)
- Proposta de compra (etapa anterior, sem efeito vinculante)

**Frequencia na Validacao:** 4 ocorrencias (10%)

---

### 4.2 PROCURACAO
**Codigo:** `PROCURACAO`
**Descricao:** Procuracao para representacao

**Caracteristicas Visuais:**
- Titulo "PROCURACAO"
- Outorgante (quem da poderes)
- Outorgado (quem recebe poderes)
- Poderes conferidos (clausula especifica)
- Pode ser publica (cartorio) ou particular

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Outorgante | JOAO DA SILVA |
| CPF outorgante | 123.456.789-00 |
| Outorgado | MARIA SANTOS |
| CPF outorgado | 987.654.321-00 |
| Poderes | VENDER O IMOVEL... |
| Validade | 1 ANO ou ATE REVOGACAO |
| Data | 27/01/2026 |
| Tipo | PUBLICA ou PARTICULAR |

**Exemplos Reais:**
- Procuracao publica (lavrada em cartorio)
- Procuracao particular (com firma reconhecida)
- Substabelecimento (transferencia de poderes)

**Nao Confundir Com:**
- Contrato Social (documento de empresa)
- Escritura (nao e outorga de poderes)

**Frequencia na Validacao:** 0 ocorrencias

---

### 4.3 COMPROVANTE_PAGAMENTO
**Codigo:** `COMPROVANTE_PAGAMENTO`
**Descricao:** Comprovante de transacao financeira

**Caracteristicas Visuais:**
- Logo de banco ou instituicao
- Dados da transacao (valor, data)
- Dados do pagador e beneficiario
- Numero de autenticacao

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Banco | SANTANDER |
| Pagador | MARIA SANTOS |
| Beneficiario | PREFEITURA DE SAO PAULO |
| Valor | R$ 15.000,00 |
| Data pagamento | 27/01/2026 |
| Codigo autenticacao | 1234.5678.9012 |
| Descricao | ITBI - GUIA 2026.123 |

**Exemplos Reais:**
- Comprovante de TED/PIX
- Comprovante de pagamento de boleto
- Recibo de custas de cartorio
- Comprovante de deposito

**Nao Confundir Com:**
- Comprovante de residencia (conta de servicos)
- ITBI (guia, nao comprovante de pagamento)
- Recibo particular (assinado pela parte)

**Frequencia na Validacao:** 6 ocorrencias (15%) - MAIS FREQUENTE

---

## 5. Documentos Administrativos (3 tipos)

### 5.1 PROTOCOLO_ONR
**Codigo:** `PROTOCOLO_ONR`
**Descricao:** Comprovante de protocolo no Operador Nacional do Registro (SAEC)

**Caracteristicas Visuais:**
- Logo do ONR ou SAEC
- Numero de protocolo
- Data e hora da solicitacao
- Status do pedido
- Tipo de certidao solicitada

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Numero protocolo | SAEC-2026-123456 |
| Data solicitacao | 27/01/2026 |
| Hora solicitacao | 10:30:45 |
| Tipo certidao | MATRICULA |
| Cartorio destino | 1o RI de SP |
| Matricula solicitada | 123.456 |
| Status | PROTOCOLO GERADO |

**Exemplos Reais:**
- Comprovante de protocolo SAEC
- Confirmacao de pedido no site ONR
- Email de confirmacao de solicitacao
- Recibo de certidao digital

**Nao Confundir Com:**
- Matricula do imovel (a certidao em si, nao o protocolo)
- Comprovante de pagamento

**IMPORTANTE:**
- Usar apenas para comprovantes de SOLICITACAO
- Se o documento for a certidao pronta, classificar pelo tipo da certidao

**Frequencia na Validacao:** 0 ocorrencias oficiais (2 classificados como OUTRO na validacao, que motivaram a criacao deste tipo)

---

### 5.2 ASSINATURA_DIGITAL
**Codigo:** `ASSINATURA_DIGITAL`
**Descricao:** Certificado ou comprovante de assinatura eletronica

**Caracteristicas Visuais:**
- Logo de plataforma de assinatura (DocuSign, Adobe Sign, GOV.BR)
- Lista de signatarios
- Data e hora de cada assinatura
- Status de conclusao
- Codigo de verificacao

**Dados Extraiveis:**
| Campo | Exemplo |
|-------|---------|
| Plataforma | DOCUSIGN |
| Documento assinado | COMPROMISSO DE COMPRA E VENDA |
| Signatarios | JOAO DA SILVA, MARIA SANTOS |
| Data conclusao | 27/01/2026 |
| Status | CONCLUIDO |
| Codigo verificacao | 1234-5678-9012-ABCD |

**Exemplos Reais:**
- Certificate of Completion (DocuSign)
- Summary de assinaturas
- Comprovante de assinatura GOV.BR
- Relatorio de assinaturas

**Nao Confundir Com:**
- O documento assinado em si (classificar pelo tipo do documento)
- Procuracao digital (classificar como PROCURACAO)

**IMPORTANTE:**
- Usar apenas para documentos SOBRE assinaturas
- NAO usar para documentos que apenas possuem assinatura digital

**Frequencia na Validacao:** 0 ocorrencias oficiais (1 classificado como OUTRO na validacao - Summary.pdf - que motivou a criacao deste tipo)

---

### 5.3 OUTRO
**Codigo:** `OUTRO`
**Descricao:** Documento que nao se encaixa nas categorias acima

**Quando Usar:**
- Documento nao reconhecido automaticamente
- Documento administrativo especifico (planilha de custas, etc.)
- Documento claramente fora do escopo (propaganda, spam, etc.)

**Exemplos Reais:**
- Planilha de custas do cartorio
- E-mails de comunicacao
- Documentos em idiomas estrangeiros
- Documentos ilegíveis ou corrompidos

**Acao Necessaria:**
- Marcar para revisao manual
- Avaliar se merece novo tipo no sistema
- Documentar para futuras melhorias

**Frequencia na Validacao:** 4 ocorrencias (10%)
- Certidao Digital - SAEC ap.pdf (deveria ser PROTOCOLO_ONR)
- Certidao Digital - SAEC.pdf (deveria ser PROTOCOLO_ONR)
- Summary.pdf (deveria ser ASSINATURA_DIGITAL)
- Custas - FC 515 - 124.docx (correto como OUTRO)

---

## Edge Cases e Ambiguidades

### Documento com Multiplas Paginas
**Regra:** Classificar pelo conteudo da PRIMEIRA pagina.
- Se a primeira pagina e um RG, classificar como RG
- Se a primeira pagina e um indice, verificar segunda pagina

### Documento Escaneado Junto
**Regra:** Se um PDF contem multiplos documentos diferentes, classificar pelo PRIMEIRO.
- Exemplo: RG + CPF + Comprovante em um unico PDF = classificar como RG
- Ideal: separar os documentos antes do processamento

### Frente e Verso em Arquivos Separados
**Regra:** Cada arquivo recebe sua propria classificacao.
- RG_frente.jpg = RG
- RG_verso.jpg = RG
- Nao ha tipo "RG_VERSO" ou similar

### Documento em Nome de Terceiro
**Regra:** Classificar pelo tipo, ignorando o titular.
- RG do procurador = RG
- Nao importa se nao e parte principal

### Documento Antigo ou Invalido
**Regra:** Classificar pelo tipo, nao pela validade.
- Matricula de 2015 = MATRICULA_IMOVEL
- A validade sera tratada na fase de extracao

### Foto de Baixa Qualidade
**Regra:** Se identificavel, classificar normalmente. Se ilegivel:
- ILEGIVEL: para documentos completamente impossiveis de ler
- Confianca "Baixa" + tipo provavel: para documentos dificeis mas identificaveis

---

## Checklist de Classificacao

Ao classificar um documento, verifique:

1. **Identificacao Visual**
   - [ ] Consegue ver logo ou titulo que identifica o documento?
   - [ ] Consegue identificar a fonte emissora (cartorio, prefeitura, banco)?

2. **Dados Visiveis**
   - [ ] Consegue ver nome de pessoa/empresa?
   - [ ] Consegue ver numeros identificadores (CPF, CNPJ, matricula, SQL)?
   - [ ] Consegue ver datas relevantes?

3. **Contexto**
   - [ ] A subpasta ajuda a identificar? (COMPRADORA, VENDEDORES, recibos)
   - [ ] Ha outros documentos similares no lote?

4. **Desambiguacao**
   - [ ] O documento poderia ser de outro tipo?
   - [ ] Verifique as regras de "Nao Confundir Com"

5. **Confianca**
   - [ ] Alta: identificacao clara e inequivoca
   - [ ] Media: identificacao provavel mas com alguma duvida
   - [ ] Baixa: chute educado, precisa revisao manual

---

## Estatisticas da Validacao (FC 515 - 124)

| Tipo | Qtd | % |
|------|-----|---|
| MATRICULA_IMOVEL | 6 | 15% |
| COMPROVANTE_PAGAMENTO | 6 | 15% |
| RG | 5 | 13% |
| COMPROMISSO_COMPRA_VENDA | 4 | 10% |
| OUTRO | 4 | 10% |
| CERTIDAO_CASAMENTO | 3 | 8% |
| ITBI | 3 | 8% |
| CERTIDAO_NASCIMENTO | 2 | 5% |
| CNDT | 2 | 5% |
| CND_MUNICIPAL | 1 | 3% |
| VVR | 1 | 3% |
| IPTU | 1 | 3% |
| ESCRITURA | 1 | 3% |
| **TOTAL** | **39** | **100%** |

---

*Este documento sera atualizado conforme novos tipos de documentos forem identificados.*
*Versao 1.0 - 2026-01-27*
