# COMPROVANTE_RESIDENCIA - Comprovante de Residencia

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: Nao possui schema dedicado (estrutura generica)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Comprovante de Residencia e um documento que atesta o endereco de domicilio de uma pessoa fisica. E utilizado para comprovar onde a pessoa reside, sendo essencial na qualificacao das partes em escrituras publicas e outros atos cartoriais.

O documento e fundamental para:
- Qualificacao do domicilio nas minutas de escrituras
- Comprovacao de residencia para fins de jurisdicao
- Preenchimento de dados de endereco em contratos
- Validacao cruzada com endereco declarado em outros documentos

**Importante**: O comprovante de residencia possui **validade tipica de 3 meses** a partir da data de emissao. Documentos com data superior a 90 dias podem ser recusados pelos cartorios.

### 1.2 Tipos de Comprovantes Aceitos

Os seguintes documentos sao aceitos como comprovante de residencia:

| Tipo | Descricao | Exemplos de Empresas |
|------|-----------|---------------------|
| **Conta de Energia Eletrica** | Fatura mensal de energia | Enel, CPFL, Light, Cemig, Copel, Eletropaulo |
| **Conta de Agua** | Fatura mensal de agua e esgoto | Sabesp, Cedae, Copasa, Sanepar, Corsan |
| **Conta de Telefone Fixo** | Fatura de telefonia fixa | Vivo, Oi, Claro, TIM |
| **Conta de Internet** | Fatura de servicos de internet | Vivo Fibra, Claro NET, TIM Live, provedores locais |
| **Conta de Gas** | Fatura de gas encanado | Comgas, CEG, Bahiagas, Gasmig |
| **Fatura de TV por Assinatura** | Fatura de TV a cabo/satelite | SKY, Claro TV, Oi TV |
| **Extrato Bancario** | Extrato com endereco impresso | Bancos em geral (menos aceito) |
| **Declaracao de IR** | Recibo de entrega do IRPF | Receita Federal (aceito por alguns cartorios) |

### 1.3 Padroes de Identificacao Visual

O sistema identifica documentos de comprovante de residencia atraves dos seguintes padroes textuais:

- `CONTA DE LUZ`
- `CONTA DE ENERGIA`
- `CONTA DE AGUA`
- `FATURA DE ENERGIA`
- `FATURA DE AGUA`
- `CONTA DE TELEFONE`
- `FATURA DE TELEFONE`
- `FATURA DE INTERNET`
- `CONTA DE GAS`
- `FATURA`
- `CONSUMIDOR`
- `UNIDADE CONSUMIDORA`
- `CLIENTE`
- `TITULAR`
- `ENDERECO DE INSTALACAO`
- `LOCAL DE CONSUMO`
- `MES DE REFERENCIA`

### 1.4 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Fatura Impressa** | Documento em papel, formato A4 ou menor | Codigo de barras, QR Code para pagamento |
| **Fatura Digital (PDF)** | Versao digital da fatura | Geralmente identica a impressa |
| **Segunda Via Online** | Emitida pelo site da empresa | Pode conter marca d'agua "Segunda Via" |
| **Fatura por E-mail** | Enviada mensalmente por e-mail | Mesmo conteudo, formato PDF |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| nome_titular | string | Nome do titular da conta | "JOAO DA SILVA" | `[A-Z][A-Z\s]+` | Alta |
| logradouro | string | Rua, Avenida, Alameda, etc. | "RUA DAS FLORES" | `(RUA|AV\.|AVENIDA|AL\.|ALAMEDA|TRAV\.|TRAVESSA|ESTRADA|R\.).*` | Alta |
| numero | string | Numero do imovel | "123" | `\d+[A-Z]?` | Alta |
| cidade | string | Nome da cidade | "SAO PAULO" | `[A-Z][A-Z\s]+` | Alta |
| estado | string | UF do estado | "SP" | `[A-Z]{2}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| cpf_titular | string | CPF do titular | "123.456.789-00" | ~60% das faturas | Media |
| complemento | string | Apartamento, bloco, sala | "APTO 42 BLOCO B" | Quando aplicavel | Media |
| bairro | string | Nome do bairro | "CENTRO" | ~90% das faturas | Alta |
| cep | string | CEP do endereco | "01234-567" | ~95% das faturas | Alta |
| tipo_servico | string | Tipo de servico | "ENERGIA ELETRICA" | Sempre | Alta |
| mes_referencia | string | Mes de referencia da fatura | "JAN/2026" | Sempre | Alta |
| data_emissao | date | Data de emissao da fatura | "15/01/2026" | Sempre | Alta |
| data_vencimento | date | Data de vencimento | "25/01/2026" | Sempre | Alta |
| empresa_fornecedora | string | Nome da empresa | "ENEL SAO PAULO" | Sempre | Alta |
| numero_instalacao | string | Numero da unidade consumidora | "0012345678" | Sempre | Alta |
| numero_cliente | string | Codigo do cliente | "C-12345678" | Sempre | Media |

### 2.3 Objetos Nested

Este documento nao possui objetos nested complexos. Todos os campos sao extraidos diretamente do corpo da fatura.

#### 2.3.1 endereco_completo (representacao logica)

O endereco e reconstruido a partir dos campos individuais:

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| logradouro | string | Tipo e nome da via | "RUA DAS FLORES" | Sim |
| numero | string | Numero do imovel | "123" | Sim |
| complemento | string | Complemento | "APTO 42" | Nao |
| bairro | string | Bairro | "CENTRO" | Nao |
| cidade | string | Cidade | "SAO PAULO" | Sim |
| estado | string | UF | "SP" | Sim |
| cep | string | CEP | "01234-567" | Nao |

#### 2.3.2 elementos_presentes (object - metadados de qualidade)

Campos booleanos que indicam a presenca de elementos visuais:

| Subcampo | Tipo | Descricao | Uso |
|----------|------|-----------|-----|
| logo_empresa | boolean | Logo da empresa presente | Identificacao visual |
| codigo_barras | boolean | Codigo de barras para pagamento | Validacao de autenticidade |
| qr_code | boolean | QR Code PIX ou similar | Modelos mais recentes |

---

## 3. MAPEAMENTO SCHEMA  MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_titular | NOME | NAO (apenas correlacao) | Baixa |
| cpf_titular | CPF | NAO (apenas correlacao) | Baixa |
| logradouro | LOGRADOURO | SIM | Alta |
| numero | NUMERO | SIM | Alta |
| complemento | COMPLEMENTO | SIM | Media |
| bairro | BAIRRO | SIM | Media |
| cidade | CIDADE | SIM | Alta |
| estado | ESTADO | SIM | Alta |
| cep | CEP | SIM | Media |

**Nota**: O nome e CPF extraidos do comprovante sao usados principalmente para **correlacao** com outros documentos, nao para preencher diretamente a minuta (ja que vem de documentos de identificacao como RG/CNH).

### 3.2 Campos que Alimentam "Pessoa Juridica"

O Comprovante de Residencia **nao alimenta** diretamente campos de Pessoa Juridica.

O endereco de sede de empresas vem de documentos como Contrato Social ou CNPJ.

### 3.3 Campos que Alimentam "Dados do Imovel"

O Comprovante de Residencia **nao alimenta** campos de Imovel.

Embora contenha endereco, este documento comprova o domicilio da pessoa, nao as caracteristicas do imovel objeto da transacao.

### 3.4 Campos que Alimentam "Negocio Juridico"

O Comprovante de Residencia **nao alimenta** campos de Negocio Juridico.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| tipo_servico | Metadado do documento | Apenas para identificacao do tipo |
| mes_referencia | Metadado do documento | Usado para validar validade |
| data_emissao | Metadado do documento | Usado para validar validade (< 90 dias) |
| data_vencimento | Metadado do documento | Nao relevante para minutas |
| empresa_fornecedora | Metadado do documento | Identificacao da fonte |
| numero_instalacao | Metadado do documento | Identificador interno da empresa |
| numero_cliente | Metadado do documento | Identificador interno da empresa |
| elementos_presentes | Metadados de qualidade | Uso interno do pipeline |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "COMPROVANTE_RESIDENCIA",
  "dados_catalogados": {
    "nome_titular": "JOAO DA SILVA",
    "cpf_titular": "123.456.789-00",
    "endereco": {
      "logradouro": "RUA DAS FLORES",
      "numero": "123",
      "complemento": "APTO 42 BLOCO B",
      "bairro": "JARDIM PAULISTA",
      "cidade": "SAO PAULO",
      "estado": "SP",
      "cep": "01234-567"
    },
    "tipo_servico": "ENERGIA ELETRICA",
    "empresa_fornecedora": "ENEL SAO PAULO",
    "mes_referencia": "01/2026",
    "data_emissao": "10/01/2026",
    "data_vencimento": "25/01/2026",
    "numero_instalacao": "0012345678",
    "campos_vazios": [],
    "elementos_presentes": {
      "logo_empresa": true,
      "codigo_barras": true,
      "qr_code": true
    }
  },
  "pessoa_relacionada": "JOAO DA SILVA",
  "confianca_extracao": {
    "geral": 0.92,
    "campos_alta_confianca": ["nome_titular", "logradouro", "numero", "cidade", "estado"],
    "campos_media_confianca": ["cpf_titular", "complemento", "bairro"]
  }
}
```

**Fonte**: Exemplo baseado em padroes de faturas de concessionarias.

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| nome_titular | RG, CNH, CPF, CERTIDAO_CASAMENTO | Match por nome para vincular endereco a pessoa |
| cpf_titular | RG, CNH, CPF, CNDT, CND_FEDERAL | Identificador unico da pessoa |
| endereco | ESCRITURA, COMPROMISSO_COMPRA_VENDA, PROCURACAO | Validar domicilio declarado |

### 5.2 Uso na Qualificacao de Domicilio

O Comprovante de Residencia e a **fonte primaria** para dados de domicilio em minutas cartoriais.

A qualificacao tipica em uma escritura inclui:
```
"..., residente e domiciliado(a) na [LOGRADOURO], numero [NUMERO], [COMPLEMENTO],
[BAIRRO], [CIDADE]/[ESTADO], CEP [CEP]..."
```

### 5.3 Hierarquia de Fontes para Endereco de Domicilio

Para dados de domicilio pessoal, a prioridade de extracao e:

1. **COMPROVANTE_RESIDENCIA** - Fonte primaria para domicilio
2. **ESCRITURA** (anterior) - Endereco declarado em escritura publica
3. **COMPROMISSO_COMPRA_VENDA** - Endereco declarado no contrato
4. **PROCURACAO** - Endereco do outorgante

**Quando usar COMPROVANTE_RESIDENCIA como fonte:**
- Sempre que disponivel e valido (< 90 dias)
- Quando outros documentos nao contem endereco completo
- Para validar endereco declarado em outros documentos

### 5.4 Validacao Cruzada

O endereco do comprovante pode ser comparado com:
- Endereco declarado em Escrituras anteriores
- Endereco do imovel em CND Municipal (se residir no imovel objeto)
- Endereco no IPTU (se for proprietario do imovel onde reside)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| data_emissao_valida | Data deve ser dos ultimos 90 dias | Logica |
| uf_valida | UF deve ser uma das 27 UFs brasileiras | Estrutural |
| cep_formato | CEP deve ter formato XXXXX-XXX | Estrutural |
| cpf_digito_verificador | Se CPF presente, verificar digitos | Estrutural |
| nome_preenchido | Nome do titular deve estar presente | Obrigatoria |
| endereco_completo | Logradouro + numero + cidade + estado | Obrigatoria |

### 6.2 Alertas de Validade

| Situacao | Alerta | Acao Recomendada |
|----------|--------|------------------|
| Data > 60 dias | Aviso amarelo | Verificar se cartorio aceita |
| Data > 90 dias | Alerta vermelho | Solicitar documento mais recente |
| Data > 120 dias | Bloqueio | Documento invalido, solicitar novo |
| CPF divergente | Alerta amarelo | Verificar se titular e o mesmo |
| Nome divergente | Alerta amarelo | Pode ser conta em nome de familiar |

### 6.3 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| elementos_presentes.logo_empresa | boolean | Logo da empresa visivel |
| elementos_presentes.codigo_barras | boolean | Codigo de barras presente |
| confianca_extracao.geral | float | Score de confianca geral (0-1) |
| campos_vazios | array | Lista de campos ausentes |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Computacao | Exemplo |
|-------|------------|---------|
| endereco_completo | Concatenacao de logradouro + numero + complemento + bairro + cidade/estado + cep | "RUA DAS FLORES, 123, APTO 42, JARDIM PAULISTA, SAO PAULO/SP, CEP 01234-567" |
| validade_documento | Calculo baseado em data_emissao + 90 dias | Data limite de aceitacao |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_concessionaria | Inferido do nome da empresa | Energia, agua, gas, telefone |
| uf_empresa | Inferido do nome da empresa ou endereco | Alguns documentos nao tem UF explicita |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| cpf_titular | ~60% | Nem todas as faturas incluem CPF |
| complemento | ~40% | Apenas quando aplicavel |
| bairro | ~90% | Algumas faturas omitem |

### 7.4 Particularidades por Tipo de Comprovante

| Tipo | Caracteristicas | Campos Especificos |
|------|-----------------|-------------------|
| **Conta de Luz** | Mais comum, geralmente aceita sem ressalvas | Consumo kWh, tarifa, bandeira tarifaria |
| **Conta de Agua** | Aceita na maioria dos cartorios | Consumo m3, categoria (residencial/comercial) |
| **Conta de Telefone** | Aceitacao variavel, preferir fixo | Numero da linha, plano |
| **Conta de Internet** | Alguns cartorios nao aceitam | Velocidade contratada |
| **Conta de Gas** | Aceita quando disponivel | Consumo m3 |
| **Extrato Bancario** | Menos aceito, verificar com cartorio | Dados bancarios sensiveis |

### 7.5 Casos Especiais

#### Conta em Nome de Terceiro
Quando a conta esta em nome de familiar (conjuge, pai, mae), pode ser necessario:
- Declaracao de residencia assinada pelo titular
- Comprovacao de vinculo familiar

#### Imovel Alugado
Se a pessoa reside em imovel alugado:
- Conta pode estar em nome do proprietario ou imobiliaria
- Contrato de aluguel pode complementar como comprovante

#### Moradia em Condominio
Para condominios, a fatura pode conter:
- Nome do condominio
- Bloco/torre e numero do apartamento
- Vaga de garagem associada

---

## 8. REFERENCIAS

- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`
- **Classificacao de Documentos**: `directives/02_tipos_documentos.md`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
