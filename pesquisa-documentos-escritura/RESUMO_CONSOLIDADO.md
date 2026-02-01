# Resumo Consolidado: Pesquisa de Documentos para Escritura de Imoveis

**Data:** 2026-01-30
**Versao:** 1.0
**Fonte:** Sintese de 20 arquivos de pesquisa + analise comparativa

---

## 1. Introducao

Este documento consolida toda a pesquisa realizada sobre documentos necessarios para lavratura de escrituras publicas de compra e venda de imoveis urbanos no Brasil. A pesquisa identificou mais de 80 tipos de documentos possiveis, dos quais **27 tipos** foram selecionados como essenciais para o sistema de minutas.

---

## 2. Estrutura Final de Documentos (27 tipos)

### 2.1 Documentos Pessoais (7 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `RG` | Carteira de Identidade | Nome, CPF, RG, Data Nascimento, Filiacao |
| `CNH` | Carteira Nacional de Habilitacao | Nome, CPF, RG integrado, CNH |
| `CPF` | Cadastro de Pessoa Fisica | Nome, CPF, Data Nascimento |
| `CERTIDAO_NASCIMENTO` | Certidao de Registro Civil | Nome, Data Nascimento, Filiacao, Matricula |
| `CERTIDAO_CASAMENTO` | Certidao de Casamento | Nome, Estado Civil, Regime Bens, Conjuge |
| `CERTIDAO_OBITO` | Certidao de Obito | Nome, Data Obito |
| `COMPROVANTE_RESIDENCIA` | Conta de Servicos | Nome, Endereco Completo |

### 2.2 Documentos do Imovel (6 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `MATRICULA_IMOVEL` | Certidao de Matricula do RI | Matricula, Descricao, Proprietarios, Onus |
| `IPTU` | Carne/Certidao de IPTU | SQL, Valor Venal, Areas, Contribuinte |
| `ITBI` | Guia de ITBI | Valor, Base Calculo, Transmitente, Adquirente |
| `VVR` | Valor Venal de Referencia | SQL, VVR, Endereco |
| `DADOS_CADASTRAIS` | Ficha Cadastral Municipal | SQL, Areas, Denominacao |
| `ESCRITURA` | Escritura Publica | Partes, Imovel, Valor, Clausulas |

### 2.3 Certidoes do Vendedor (5 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `CNDT` | Certidao Negativa de Debitos Trabalhistas | Nome, CPF/CNPJ, Numero, Data Expedicao |
| `CND_FEDERAL` | Certidao de Regularidade Federal | Nome, CPF/CNPJ, Tipo, Validade, Codigo |
| `CND_ESTADUAL` | Certidao Negativa Estadual | Nome, CPF/CNPJ |
| `CND_MUNICIPAL` | Certidao Negativa Municipal | Nome, CPF/CNPJ, SQL, Tributos |
| `CONTRATO_SOCIAL` | Contrato Social (PJ) | Razao Social, CNPJ, NIRE, Administrador |

### 2.4 Certidoes de Distribuidor (1 tipo - NOVO)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `CERTIDAO_DISTRIBUIDOR` | Certidoes Civeis, Criminais, Protesto, Falencia | Tipo, Orgao, Resultado, Validade |

**Subtipos cobertos:**
- Certidao Civel (Distribuidor Civel)
- Certidao Criminal
- Certidao de Protesto
- Certidao de Falencia/Recuperacao Judicial
- Certidao de Execucao Fiscal
- Certidao de Interdicao/Tutela

### 2.5 Certidoes do Imovel (2 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `CND_IMOVEL` | Certidao Negativa de Debitos do Imovel | SQL, Matricula, Status, Tributos |
| `CND_CONDOMINIO` | Declaracao de Quitacao Condominial | Unidade, Nome, Status |

### 2.6 Contratos e Negocio (3 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `COMPROMISSO_COMPRA_VENDA` | Contrato Particular de Promessa | Partes, Imovel, Valor, Condicoes |
| `PROCURACAO` | Procuracao Publica | Outorgante, Outorgado, Poderes |
| `COMPROVANTE_PAGAMENTO` | Comprovante de Transferencia | Valor, Pagador, Beneficiario, Dados Bancarios |

### 2.7 Documentos Administrativos (3 tipos)

| Tipo | Descricao | Campos Principais |
|------|-----------|-------------------|
| `PROTOCOLO_ONR` | Protocolo SAEC/ONR | Numero, Matricula, Servico |
| `ASSINATURA_DIGITAL` | Certificado de Assinatura Eletronica | Plataforma, Partes, Envelope ID |
| `OUTRO` | Documento Nao Classificado | Variavel |

---

## 3. Nova Categoria: CERTIDAO_DISTRIBUIDOR

### 3.1 Justificativa

A pesquisa revelou que existem **6 tipos de certidoes de distribuidores** essenciais para seguranca juridica nas transacoes imobiliarias. Estas certidoes protegem o comprador contra:

1. **Penhora posterior** - Processos civeis podem resultar em penhora do imovel
2. **Fraude contra credores** - Vendedor insolvente pode ter a venda anulada
3. **Incapacidade civil** - Vendedor interdito nao pode vender sem autorizacao
4. **Due diligence** - Compradores de boa fe devem demonstrar diligencia minima

### 3.2 Subtipos Cobertos

| Subtipo | O que Revela | Importancia |
|---------|--------------|-------------|
| **Civel** | Processos civeis em tramitacao | ALTA - Pode resultar em penhora |
| **Criminal** | Processos criminais | MEDIA - Idoneidade do vendedor |
| **Protesto** | Titulos protestados (cheques, notas) | ALTA - Indica insolvencia |
| **Falencia** | Recuperacao judicial ou falencia | MEDIA (PJ) - Bens podem ser indisponiveis |
| **Execucao Fiscal** | Dividas fiscais em execucao | ALTA - Fisco tem preferencia |
| **Interdicao/Tutela** | Capacidade civil do vendedor | BAIXA - Valida capacidade |

### 3.3 Campos Mapeados

```
cd_tipo              # civel, criminal, protesto, falencia, execucao_fiscal, interdicao
cd_orgao_emissor     # Tribunal/Cartorio emissor
cd_comarca           # Comarca de emissao
cd_estado            # UF
cd_resultado         # nada_consta | constam_registros
cd_data_emissao      # Data de emissao da certidao
cd_data_validade     # Data de validade (geralmente 90 dias)
cd_codigo_verificacao # Codigo de autenticidade para validacao online
cd_processos         # Lista de processos (se houver registros)
cd_nome_pesquisado   # Nome da pessoa pesquisada
cd_cpf_cnpj          # CPF ou CNPJ pesquisado
```

### 3.4 Uso em Minutas

As certidoes de distribuidor sao referenciadas na escritura como:

> "Apresentou o(a) alienante certidao negativa do(a) [tipo] do [orgao] de [comarca], expedida em [data], sob numero [numero], com validade ate [validade], comprovando [resultado]."

---

## 4. Decisoes Tomadas

### 4.1 Documentos Excluidos

**Imoveis Rurais** - Decidido que o sistema focara apenas em imoveis urbanos, portanto os seguintes documentos foram **descartados**:

| Documento | Motivo da Exclusao |
|-----------|-------------------|
| CCIR | Apenas para imoveis rurais (INCRA) |
| ITR | Imposto Territorial Rural - imovel rural |
| CAR | Cadastro Ambiental Rural |
| DITR | Declaracao do ITR |

### 4.2 Consolidacao de Certidoes

Decidido criar uma **unica categoria** `CERTIDAO_DISTRIBUIDOR` ao inves de 6 tipos separados porque:

1. Estrutura de campos e similar entre os subtipos
2. Frequentemente apresentadas em conjunto
3. Simplifica a taxonomia (27 tipos vs 32 tipos)
4. Campo `cd_tipo` permite diferenciar os subtipos

### 4.3 Categorizacao Correta

**CND_MUNICIPAL vs CND_IMOVEL** - Confirmado que a distincao esta correta:
- `CND_MUNICIPAL` - Debitos da **pessoa** (contribuinte)
- `CND_IMOVEL` - Debitos do **imovel** (SQL/inscricao)

**CND_CONDOMINIO** - Funciona corretamente tanto para "CND" formal quanto "Declaracao" do sindico (Art. 1.345 CC).

---

## 5. Sintese da Pesquisa

### 5.1 Arquivos de Pesquisa

| Arquivo | Conteudo Principal |
|---------|-------------------|
| `01-tipos-cnd.md` | Visao geral das CNDs (Federal, Estadual, Municipal) |
| `02-cndt-trabalhista.md` | Detalhamento da CNDT e BNDT |
| `03-matricula-imovel.md` | Estrutura e campos da matricula |
| `04-documentos-pessoais.md` | RG, CNH, certidoes civis |
| `05-iptu.md` | Estrutura do IPTU municipal |
| `06-itbi.md` | Guia de ITBI e base de calculo |
| `07-compromisso-compra-venda.md` | Estrutura do contrato de promessa |
| `08-procuracao.md` | Tipos de procuracao e poderes |
| `09-pessoa-juridica.md` | Contrato social e representacao |
| `10-certidoes-distribuidores.md` | **NOVO** - 6 tipos de certidoes |
| `11-vvr.md` | Valor Venal de Referencia |
| `12-cnd-condominio.md` | Declaracao condominial (Art. 1.345) |
| `13-assinatura-digital.md` | Certificados digitais e ICP-Brasil |
| `14-requisitos-legais-checklist.md` | Checklist completo de documentos |
| `15-onr-srei.md` | Sistema SAEC e ONR |
| `16-cnd-imovel.md` | Distincao CND imovel vs pessoa |
| `17-certidoes-vendedor-vs-imovel.md` | Classificacao das certidoes |
| `18-cnh-identificacao.md` | CNH como documento de identificacao |
| `19-comprovante-pagamento.md` | Tipos de comprovantes financeiros |
| `20-estrutura-escritura.md` | Elementos da escritura publica |

### 5.2 Lacunas Identificadas e Resolvidas

| Lacuna | Solucao |
|--------|---------|
| Certidoes de distribuidores nao mapeadas | Criar `CERTIDAO_DISTRIBUIDOR` |
| Falta exemplos em algumas categorias | Recomendado coletar exemplos |
| Campos para certidoes distribuidores | Mapeados 11 campos |

### 5.3 Acertos da Estrutura Atual

A taxonomia original de 26 tipos esta bem estruturada para:

- Documentos pessoais (cobertura completa)
- Documentos do imovel (cobertura completa)
- Certidoes fiscais (CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL)
- Certidoes do imovel (CND_IMOVEL, CND_CONDOMINIO)
- Contratos (COMPROMISSO, PROCURACAO)
- Administrativos (PROTOCOLO_ONR, ASSINATURA_DIGITAL)

---

## 6. Proximos Passos

### 6.1 Implementados Neste Ciclo

- [x] Criar resumo consolidado (este arquivo)
- [x] Criar pasta `CERTIDAO_DISTRIBUIDOR` em Test-Docs
- [x] Documentar campos em `campos-uteis/CERTIDAO_DISTRIBUIDOR.md`
- [x] Documentar campos em `campos-completos/CERTIDAO_DISTRIBUIDOR.md`
- [x] Atualizar `campos_e_documentos.json`
- [x] Atualizar `DOCUMENTOS_E_CAMPOS_REFERENCIA.md`

### 6.2 Recomendacoes Futuras

1. **Coletar Exemplos** - Obter PDFs reais de certidoes de distribuidores para testar extracao
2. **Criar Schema JSON** - Desenvolver `execution/schemas/certidao_distribuidor.json`
3. **Prompt de Extracao** - Criar prompt especifico para extracao dos campos
4. **Validacao Online** - Implementar verificacao de codigo de autenticidade

---

## 7. Referencias

### 7.1 Fontes Legais

- Lei 8.935/1994 - Funcionamento dos cartorios
- Lei 11.101/2005 - Falencia e Recuperacao Judicial
- Lei 10.406/2002 - Codigo Civil (capacidade civil)
- Lei 14.825/2024 - Protecao ao adquirente de boa fe
- Art. 1.345 CC - Declaracao de quitacao condominial

### 7.2 Fontes de Pesquisa

- Tribunais de Justica estaduais (TJ-SP, TJ-RJ, TJ-MG, etc.)
- Central das Certidoes
- Cartorios de Protesto
- ONR - Operador Nacional do Registro
- ANOREG/BR - Associacao dos Notarios e Registradores

---

*Documento gerado em 2026-01-30. Fonte: pesquisa-documentos-escritura/*.md*
