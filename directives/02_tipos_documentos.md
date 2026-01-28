# Tipos de Documentos - Referência

Este documento serve como referência para os 26 tipos de documentos reconhecidos pelo sistema de catalogação.

---

## Resumo por Categoria

| Categoria | Quantidade | Documentos |
|-----------|------------|------------|
| Documentos Pessoais | 7 | RG, CNH, CPF, Certidões (3), Comprovante Residência |
| Certidões | 7 | CNDT, CND (4), Contrato Social |
| Documentos do Imóvel | 6 | Matrícula, ITBI, VVR, IPTU, Dados Cadastrais, Escritura |
| Documentos do Negócio | 3 | Compromisso, Procuração, Comprovante Pagamento |
| Documentos Administrativos | 3 | Protocolo ONR, Assinatura Digital, Outro |
| **Total** | **26** | |

---

## 1. Documentos Pessoais (7 tipos)

### 1.1 RG
**Código:** `RG`

**Descrição:** Carteira de Identidade (Registro Geral)

**Características Visuais:**
- Documento com foto 3x4
- Número RG com dígito verificador
- Órgão emissor (SSP, DETRAN, etc.)
- UF de emissão
- Data de expedição
- Filiação (nome dos pais)

**Dados Extraíveis:**
- Nome completo, Número RG, Órgão emissor, UF, Data expedição
- Filiação (pai e mãe), Data nascimento, Naturalidade

**Não Confundir Com:** CNH (formato diferente)

---

### 1.2 CNH
**Código:** `CNH`

**Descrição:** Carteira Nacional de Habilitação

**Características Visuais:**
- Formato cartão (nova) ou papel (antiga)
- Foto do condutor
- Categoria de habilitação (A, B, AB, etc.)
- CPF integrado
- Data de validade

**Dados Extraíveis:**
- Nome completo, Número registro, CPF, Data nascimento
- Categoria, Data 1ª habilitação, Validade

**Não Confundir Com:** RG

---

### 1.3 CPF
**Código:** `CPF`

**Descrição:** Cadastro de Pessoa Física - documento avulso

**Características Visuais:**
- Cartão pequeno verde/azul (modelo antigo)
- Comprovante de inscrição impresso
- Número com 11 dígitos (XXX.XXX.XXX-XX)

**Dados Extraíveis:**
- Número CPF, Nome completo, Data nascimento

**Não Confundir Com:** CPF impresso no RG ou CNH (usar o tipo do documento principal)

---

### 1.4 CERTIDAO_NASCIMENTO
**Código:** `CERTIDAO_NASCIMENTO`

**Descrição:** Certidão de Registro de Nascimento

**Características Visuais:**
- Papel timbrado de cartório de registro civil
- Matrícula (formato: XXXXXX.XX.XX.XXXX.X.XXXXX.XXX.XXXXXXX-XX)
- Nome completo do registrado
- Filiação completa

**Dados Extraíveis:**
- Nome completo, Data nascimento, Hora nascimento, Local nascimento
- Nome pai, Nome mãe, Matrícula, Cartório

**Não Confundir Com:** Certidão de Casamento, Certidão de Óbito

---

### 1.5 CERTIDAO_CASAMENTO
**Código:** `CERTIDAO_CASAMENTO`

**Descrição:** Certidão de Registro de Casamento

**Características Visuais:**
- Papel timbrado de cartório de registro civil
- Nomes dos dois cônjuges
- Data do casamento
- Regime de bens
- Pode ter averbações (separação, divórcio)

**Dados Extraíveis:**
- Nome cônjuge 1, Nome cônjuge 2, Data casamento
- Regime de bens, Matrícula, Cartório, Averbações

**Regimes de Bens Válidos:**
- COMUNHÃO PARCIAL DE BENS
- COMUNHÃO UNIVERSAL DE BENS
- SEPARAÇÃO TOTAL DE BENS
- SEPARAÇÃO OBRIGATÓRIA DE BENS
- PARTICIPAÇÃO FINAL NOS AQUESTOS

**Não Confundir Com:** Certidão de Nascimento

---

### 1.6 CERTIDAO_OBITO
**Código:** `CERTIDAO_OBITO`

**Descrição:** Certidão de Registro de Óbito

**Características Visuais:**
- Papel timbrado de cartório de registro civil
- Nome do falecido
- Data e local do óbito
- Causa mortis

**Dados Extraíveis:**
- Nome falecido, Data óbito, Local óbito, Causa mortis
- Estado civil, Cônjuge

---

### 1.7 COMPROVANTE_RESIDENCIA
**Código:** `COMPROVANTE_RESIDENCIA`

**Descrição:** Documento que comprova endereço do titular

**Características Visuais:**
- Conta de serviços (água, luz, gás, telefone)
- Nome do titular
- Endereço completo

**Dados Extraíveis:**
- Nome titular, Endereço completo, Bairro, Cidade, UF, CEP

**Não Confundir Com:** Comprovante de Pagamento (transações financeiras)

---

## 2. Certidões (7 tipos)

### 2.1 CNDT
**Código:** `CNDT`

**Descrição:** Certidão Negativa de Débitos Trabalhistas

**Características Visuais:**
- Emitida pelo TST (Tribunal Superior do Trabalho)
- Logo da Justiça do Trabalho
- Código de autenticidade
- Validade de 180 dias
- QR Code para validação

**Dados Extraíveis:**
- Nome/Razão Social, CPF/CNPJ, Número certidão
- Data expedição, Hora expedição, Validade, Resultado

**Não Confundir Com:** CND Federal, CND Estadual

---

### 2.2 CND_FEDERAL
**Código:** `CND_FEDERAL`

**Descrição:** Certidão de Regularidade Fiscal junto à União (Receita Federal/PGFN)

**Características Visuais:**
- Logo da Receita Federal ou PGFN
- Código de autenticidade
- Menção a "tributos federais" ou "dívida ativa da União"

**Dados Extraíveis:**
- Nome/Razão Social, CPF/CNPJ, Número certidão
- Data emissão, Validade, Tipo (NEGATIVA ou POSITIVA COM EFEITOS DE NEGATIVA)

---

### 2.3 CND_ESTADUAL
**Código:** `CND_ESTADUAL`

**Descrição:** Certidão Negativa de Débitos Estaduais

**Características Visuais:**
- Logo do estado ou Secretaria da Fazenda Estadual
- Referência a ICMS ou tributos estaduais

**Dados Extraíveis:**
- Nome/Razão Social, CPF/CNPJ, Inscrição Estadual
- Data emissão, Validade

---

### 2.4 CND_MUNICIPAL
**Código:** `CND_MUNICIPAL`

**Descrição:** Certidão Negativa de Débitos Municipais (Tributos Imobiliários)

**Características Visuais:**
- Logo da prefeitura
- Referência a SQL (número do contribuinte)
- Menção a IPTU, ISS, ou tributos municipais

**Dados Extraíveis:**
- Contribuinte, CPF/CNPJ, SQL, Endereço imóvel
- Data emissão, Validade

**Não Confundir Com:** IPTU (carnê de pagamento, não certidão)

---

### 2.5 CND_IMOVEL
**Código:** `CND_IMOVEL`

**Descrição:** Certidão Negativa de Débitos relativa a um imóvel específico

**Características Visuais:**
- Similar a CND Municipal, mas específica para um imóvel
- Menção ao SQL ou matrícula do imóvel

**Dados Extraíveis:**
- SQL, Matrícula, Endereço, Situação, Data emissão, Validade

**Não Confundir Com:** CND Municipal (pode ser do proprietário, não do imóvel)

---

### 2.6 CND_CONDOMINIO
**Código:** `CND_CONDOMINIO`

**Descrição:** Declaração de Quitação Condominial

**Características Visuais:**
- Papel timbrado do condomínio ou administradora
- Nome do condomínio
- Identificação da unidade (apto, bloco)
- Assinatura do síndico ou administrador

**Dados Extraíveis:**
- Condomínio, Unidade, Proprietário, Data referência, Situação

---

### 2.7 CONTRATO_SOCIAL
**Código:** `CONTRATO_SOCIAL`

**Descrição:** Contrato Social de Pessoa Jurídica

**Características Visuais:**
- Documento com cláusulas numeradas
- Dados da empresa (CNPJ, razão social)
- Quadro societário (sócios e participações)
- Capital social
- Registro na Junta Comercial

**Dados Extraíveis:**
- Razão Social, Nome Fantasia, CNPJ, Endereço sede
- Capital Social, Sócios, Administrador, Data constituição

**Não Confundir Com:** Compromisso de Compra e Venda

---

## 3. Documentos do Imóvel (6 tipos)

### 3.1 MATRICULA_IMOVEL
**Código:** `MATRICULA_IMOVEL`

**Descrição:** Certidão de Matrícula do Registro de Imóveis

**Características Visuais:**
- Papel timbrado do Cartório de Registro de Imóveis
- Número da matrícula em destaque
- Descrição detalhada do imóvel
- Cadeia de proprietários (averbações e registros)
- Ônus e gravames (se houver)

**Dados Extraíveis:**
- Número matrícula, Cartório RI, Descrição imóvel
- Área privativa, Área comum, Fração ideal
- Proprietário atual, CPF proprietário
- Ônus (hipotecas, penhoras, alienações fiduciárias)

**Não Confundir Com:** Dados Cadastrais (prefeitura), Escritura (tabelionato)

---

### 3.2 ITBI
**Código:** `ITBI`

**Descrição:** Guia ou Comprovante de ITBI (Imposto de Transmissão de Bens Imóveis)

**Características Visuais:**
- Logo da prefeitura
- Código de barras para pagamento
- Valor do imposto
- Base de cálculo
- Dados do imóvel e das partes

**Dados Extraíveis:**
- Número guia, Transmitente (vendedor), Adquirente (comprador)
- SQL, Valor transmissão, Base cálculo, Alíquota, Valor ITBI
- Data emissão, Data vencimento

**Não Confundir Com:** VVR (apenas valor venal)

---

### 3.3 VVR
**Código:** `VVR`

**Descrição:** Valor Venal de Referência

**Características Visuais:**
- Consulta no site da prefeitura
- SQL do imóvel
- Valor venal de referência em destaque

**Dados Extraíveis:**
- SQL, Valor Venal Referência, Ano referência, Endereço, Área construída

**Não Confundir Com:** IPTU, ITBI

---

### 3.4 IPTU
**Código:** `IPTU`

**Descrição:** Carnê ou Certidão de IPTU

**Características Visuais:**
- Logo da prefeitura
- SQL do imóvel
- Valor venal do terreno e construção
- Área do terreno e construída

**Dados Extraíveis:**
- SQL, Exercício, Contribuinte, Endereço
- Valor venal terreno, Valor venal construção, Valor venal total
- Área terreno, Área construída

**Não Confundir Com:** CND Municipal (certidão de quitação)

---

### 3.5 DADOS_CADASTRAIS
**Código:** `DADOS_CADASTRAIS`

**Descrição:** Ficha Cadastral do Imóvel na Prefeitura

**Características Visuais:**
- Dados técnicos do imóvel
- SQL
- Área, testada, frentes
- Uso do imóvel (residencial, comercial)
- Padrão construtivo

**Dados Extraíveis:**
- SQL, Endereço, Bairro, CEP
- Área terreno, Área construída, Uso, Padrão, Frente

**Não Confundir Com:** Matrícula (dados do RI)

---

### 3.6 ESCRITURA
**Código:** `ESCRITURA`

**Descrição:** Escritura Pública de Compra e Venda (ou outras)

**Características Visuais:**
- Papel timbrado de tabelionato de notas
- Título "ESCRITURA PÚBLICA DE..."
- Dados completos das partes
- Descrição detalhada do imóvel
- Valor e forma de pagamento
- Assinaturas e selos

**Dados Extraíveis:**
- Tipo escritura, Livro/Folha, Tabelionato, Data lavratura
- Vendedor, Comprador, Imóvel, Valor, Forma pagamento

**Não Confundir Com:** Compromisso de Compra e Venda (contrato particular)

---

## 4. Documentos do Negócio (3 tipos)

### 4.1 COMPROMISSO_COMPRA_VENDA
**Código:** `COMPROMISSO_COMPRA_VENDA`

**Descrição:** Contrato Particular de Compromisso de Compra e Venda

**Características Visuais:**
- Título "COMPROMISSO", "CONTRATO", ou "INSTRUMENTO PARTICULAR"
- Cláusulas numeradas
- Dados das partes (vendedor e comprador)
- Descrição do imóvel
- Valor e forma de pagamento
- Assinaturas das partes e testemunhas

**Dados Extraíveis:**
- Vendedor(es), CPF vendedor, Comprador(es), CPF comprador
- Imóvel, Matrícula, Valor total, Entrada (sinal), Saldo
- Data contrato, Forma pagamento

**Validação Crítica:** `sinal + saldo = preco_total`

**Não Confundir Com:** Escritura (documento público)

---

### 4.2 PROCURACAO
**Código:** `PROCURACAO`

**Descrição:** Procuração para representação

**Características Visuais:**
- Título "PROCURAÇÃO"
- Outorgante (quem dá poderes)
- Outorgado (quem recebe poderes)
- Poderes conferidos
- Pode ser pública (cartório) ou particular

**Dados Extraíveis:**
- Outorgante, CPF outorgante, Outorgado, CPF outorgado
- Poderes, Validade, Data, Tipo (PÚBLICA ou PARTICULAR)

---

### 4.3 COMPROVANTE_PAGAMENTO
**Código:** `COMPROVANTE_PAGAMENTO`

**Descrição:** Comprovante de transação financeira

**Características Visuais:**
- Logo de banco ou instituição
- Dados da transação (valor, data)
- Dados do pagador e beneficiário
- Número de autenticação

**Dados Extraíveis:**
- Banco, Pagador, Beneficiário, Valor, Data pagamento
- Código autenticação, Descrição

**Não Confundir Com:** Comprovante de Residência

---

## 5. Documentos Administrativos (3 tipos)

### 5.1 PROTOCOLO_ONR
**Código:** `PROTOCOLO_ONR`

**Descrição:** Comprovante de protocolo no Operador Nacional do Registro (SAEC)

**Características Visuais:**
- Logo do ONR ou SAEC
- Número de protocolo
- Data e hora da solicitação
- Status do pedido

**Dados Extraíveis:**
- Número protocolo, Data solicitação, Hora solicitação
- Tipo certidão, Cartório destino, Matrícula solicitada, Status

**IMPORTANTE:** Usar apenas para comprovantes de SOLICITAÇÃO, não para certidões prontas.

---

### 5.2 ASSINATURA_DIGITAL
**Código:** `ASSINATURA_DIGITAL`

**Descrição:** Certificado ou comprovante de assinatura eletrônica

**Características Visuais:**
- Logo de plataforma (DocuSign, Adobe Sign, GOV.BR)
- Lista de signatários
- Data e hora de cada assinatura
- Status de conclusão
- Código de verificação

**Dados Extraíveis:**
- Plataforma, Documento assinado, Signatários
- Data conclusão, Status, Código verificação

**IMPORTANTE:** Usar para documentos SOBRE assinaturas, NÃO para documentos apenas assinados digitalmente.

---

### 5.3 OUTRO
**Código:** `OUTRO`

**Descrição:** Documento que não se encaixa nas categorias acima

**Quando Usar:**
- Documento não reconhecido automaticamente
- Documento administrativo específico (planilha de custas, etc.)
- Documento claramente fora do escopo

**Ação Necessária:** Marcar para revisão manual

---

## Edge Cases e Regras de Classificação

### Documento com Múltiplas Páginas
**Regra:** Classificar pelo conteúdo da PRIMEIRA página.

### Documento Escaneado Junto
**Regra:** Se um PDF contém múltiplos documentos diferentes, classificar pelo PRIMEIRO.

### Frente e Verso em Arquivos Separados
**Regra:** Cada arquivo recebe sua própria classificação (ambos como mesmo tipo).

### Documento em Nome de Terceiro
**Regra:** Classificar pelo tipo, ignorando o titular.

### Documento Antigo ou Inválido
**Regra:** Classificar pelo tipo, não pela validade.

### Foto de Baixa Qualidade
**Regra:** Se identificável, classificar normalmente. Se ilegível, marcar como `ILEGIVEL`.

---

## Checklist de Classificação

Ao classificar um documento, verifique:

1. **Identificação Visual**
   - Consegue ver logo ou título que identifica o documento?
   - Consegue identificar a fonte emissora (cartório, prefeitura, banco)?

2. **Dados Visíveis**
   - Consegue ver nome de pessoa/empresa?
   - Consegue ver números identificadores (CPF, CNPJ, matrícula, SQL)?

3. **Contexto**
   - A subpasta ajuda a identificar? (COMPRADORA, VENDEDORES, recibos)

4. **Desambiguação**
   - O documento poderia ser de outro tipo?
   - Verifique as regras de "Não Confundir Com"

5. **Confiança**
   - Alta: identificação clara e inequívoca
   - Média: identificação provável mas com alguma dúvida
   - Baixa: precisa revisão manual

---

## Descoberta de Novos Tipos de Documentos

### Procedimento para Documentos Não Catalogados

Quando o Gemini encontra um documento que não se encaixa nos 26 tipos conhecidos, ele deve:

1. **Classificar como `DESCONHECIDO`** (não forçar uma classificação incorreta)
2. **Sugerir um tipo novo** com base nas características observadas
3. **Fornecer informações detalhadas** para facilitar a catalogação futura

### Formato de Output para Documentos Não Reconhecidos

O Gemini deve retornar o seguinte JSON quando não reconhecer um documento:

```json
{
  "tipo": "DESCONHECIDO",
  "confianca": 0.0,
  "tipo_sugerido": "NOME_SUGERIDO_EM_MAIUSCULAS",
  "descricao_documento": "Descrição clara do que o documento parece ser",
  "categoria_recomendada": "Uma das 5 categorias: Documentos Pessoais, Certidões, Documentos do Imóvel, Documentos do Negócio, Documentos Administrativos",
  "caracteristicas_identificadoras": [
    "Característica visual 1 (ex: logo específico)",
    "Característica visual 2 (ex: campos típicos)",
    "Característica visual 3 (ex: formato do documento)"
  ],
  "dados_visiveis": {
    "campos_identificados": ["nome", "cpf", "data", "..."],
    "exemplo_valores": {
      "campo1": "valor observado",
      "campo2": "outro valor"
    }
  },
  "observacao": "Contexto adicional ou razão pela qual não foi possível classificar",
  "pessoa_relacionada": "Nome da pessoa no documento, se identificável",
  "subpasta_origem": "pasta onde o documento foi encontrado"
}
```

### Campos Obrigatórios para Definir um Novo Tipo

Ao criar um novo tipo de documento, os seguintes campos são **obrigatórios**:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `codigo` | Identificador único em MAIÚSCULAS com underscores | `INVENTARIO_EXTRAJUDICIAL` |
| `descricao` | O que é o documento (1-2 frases) | "Documento de partilha de bens..." |
| `categoria` | Uma das 5 categorias existentes | "Documentos do Negócio" |
| `caracteristicas_visuais` | Lista de 3-5 características para identificação | Título, logo, campos típicos |
| `dados_extraiveis` | Lista de campos que podem ser extraídos | nome, cpf, valor, data |
| `nao_confundir_com` | Tipos similares para desambiguação | "COMPROMISSO_COMPRA_VENDA" |

### Template para Adicionar Novos Tipos

Use este template ao adicionar um novo tipo em `02_tipos_documentos.md`:

```markdown
### X.Y NOME_DO_TIPO
**Código:** `NOME_DO_TIPO`

**Descrição:** [Descrição clara do documento em 1-2 frases]

**Características Visuais:**
- [Característica 1 - ex: logo ou título típico]
- [Característica 2 - ex: formato ou layout]
- [Característica 3 - ex: campos específicos]
- [Característica 4 - ex: assinaturas ou carimbos]

**Dados Extraíveis:**
- [Lista de campos que podem ser extraídos]

**Validação Crítica:** [Se aplicável, regras de validação]

**Não Confundir Com:** [Tipos similares]

---
```

### Template para Criar Novo Prompt

Ao criar um novo prompt em `execution/prompts/{tipo}.txt`:

```text
Você é um especialista em análise de documentos cartoriais brasileiros.

## DOCUMENTO A ANALISAR
Este é um documento do tipo: {NOME_DO_TIPO}

## DESCRIÇÃO
{Descrição do que é o documento e seu propósito}

## O QUE EXTRAIR
Extraia os seguintes dados deste documento:
1. **{campo1}**: {descrição do campo}
2. **{campo2}**: {descrição do campo}
[...]

## REGRAS CRÍTICAS
1. NUNCA fabricar dados - se não conseguir ler, retorne null
2. Extrair EXATAMENTE como aparece no documento
3. {Regra específica do tipo}

## FORMATO DE SAÍDA
Retorne um JSON com a seguinte estrutura:
```json
{
  "tipo_documento": "{NOME_DO_TIPO}",
  "dados_catalogados": {
    "{campo1}": "valor ou null",
    "{campo2}": "valor ou null"
  },
  "explicacao_contextual": "Explicação de 3-5 parágrafos sobre o documento"
}
```
```

### Checklist: Adicionando Novo Tipo ao Sistema

- [ ] **1. Documentação**
  - [ ] Adicionar seção em `directives/02_tipos_documentos.md`
  - [ ] Definir código, descrição, características visuais
  - [ ] Listar dados extraíveis
  - [ ] Documentar regras de "não confundir com"

- [ ] **2. Prompt de Extração**
  - [ ] Criar `execution/prompts/{tipo}.txt`
  - [ ] Incluir descrição do documento
  - [ ] Listar campos a extrair
  - [ ] Definir regras críticas específicas
  - [ ] Definir formato de saída JSON

- [ ] **3. Schema (Opcional)**
  - [ ] Criar `execution/schemas/{tipo}.json` se precisar validação
  - [ ] Definir campos obrigatórios vs opcionais
  - [ ] Definir tipos de dados e formatos

- [ ] **4. Atualização do Classificador**
  - [ ] Adicionar tipo na lista de tipos válidos em `classify_with_gemini.py`
  - [ ] Atualizar prompt de classificação se necessário

- [ ] **5. Validação**
  - [ ] Testar classificação com documento real
  - [ ] Testar extração com documento real
  - [ ] Verificar mapeamento de campos (se aplicável)
  - [ ] Confirmar que não quebra documentos existentes

- [ ] **6. Atualização de Referências**
  - [ ] Atualizar contagem total de tipos (era 26, agora é 27, etc.)
  - [ ] Atualizar tabela de resumo por categoria
