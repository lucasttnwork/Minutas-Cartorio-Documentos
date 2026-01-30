# PROTOCOLO_ONR - Protocolo do Operador Nacional do Registro de Imoveis Eletronico

**Complexidade de Extracao**: BAIXA
**Schema Fonte**: `execution/schemas/protocolo_onr.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Protocolo ONR e um comprovante emitido pelo Operador Nacional do Sistema de Registro Eletronico de Imoveis (ONR), que confirma a solicitacao de servicos registrais realizados de forma eletronica. O documento e gerado principalmente pelo sistema SAEC (Servico de Atendimento Eletronico Compartilhado).

**O que e o ONR?**

O ONR (Operador Nacional do Registro Eletronico de Imoveis) e a entidade responsavel por implementar e operar o Sistema de Registro Eletronico de Imoveis (SREI), conforme Lei 11.977/2009 e Provimento CNJ 89/2019. Suas principais funcoes sao:

- Viabilizar o **registro eletronico de imoveis** em todo o territorio nacional
- Operar a **Central de Servicos Eletronicos Compartilhados (SAEC)**
- Permitir a **solicitacao remota** de certidoes, pesquisas e outros servicos registrais
- Garantir a **interoperabilidade** entre cartorios de registro de imoveis
- Fornecer **autenticidade e rastreabilidade** as solicitacoes eletronicas

**O que e o SAEC?**

O SAEC (Servico de Atendimento Eletronico Compartilhado) e a plataforma operacional do ONR que permite:

- Solicitacao de certidoes digitais (inteiro teor, onus reais, etc.)
- Pesquisa de bens imoveis vinculados a CPF/CNPJ
- Protocolo de titulos para registro
- Acompanhamento de solicitacoes em andamento
- Emissao de guias de custas e emolumentos

O documento de protocolo serve para:
- **Comprovar** que uma solicitacao foi registrada no sistema
- **Rastrear** o andamento de pedidos de certidoes ou registros
- **Identificar** o servico solicitado e cartorio de destino
- **Validar** a autenticidade da solicitacao atraves de codigo de verificacao

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos de Protocolo ONR atraves dos seguintes padroes textuais:

- `ONR`
- `OPERADOR NACIONAL`
- `REGISTRO ELETRONICO`
- `PROTOCOLO`
- `SAEC`
- `SREI`
- `CENTRAL DE SERVICOS`
- `registradores.onr.org.br`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Comprovante de Solicitacao** | Emitido apos pedido de certidao digital | Numero protocolo, tipo solicitacao, status |
| **Protocolo de Titulo** | Para pedidos de registro/averbacao | Numero protocolo, titulo submetido, custas |
| **Comprovante de Pesquisa** | Para pesquisas de bens imoveis | CPF/CNPJ pesquisado, resultado |
| **Confirmacao de Pagamento** | Apos pagamento de emolumentos | Protocolo, valor pago, forma de pagamento |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_protocolo | string | Numero unico de identificacao da solicitacao | "P23110224786D" | `[A-Z]?\d{10,15}[A-Z]?` | Alta |
| data_protocolo | date | Data de registro da solicitacao | "14/11/2023" | `\d{2}/\d{2}/\d{4}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| hora_protocolo | string | Hora de registro da solicitacao | "13:16:59" | Maioria dos protocolos | Alta |
| tipo_solicitacao | string | Tipo de servico solicitado | "CERTIDAO DIGITAL" | Sempre presente | Alta |
| cartorio_destino | string | Nome do cartorio de destino | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | Quando ha cartorio especifico | Media |
| matricula_imovel | string | Numero da matricula do imovel (se aplicavel) | "123456" | Solicitacoes de certidao especifica | Alta |
| status_solicitacao | string | Status atual da solicitacao | "GERADO COM SUCESSO" | Sempre presente | Alta |
| codigo_verificacao | string | Codigo para validacao do protocolo | "ABC123DEF456" | Protocolos com autenticacao | Alta |
| url_sistema | string | URL do sistema para consulta | "https://registradores.onr.org.br/CertidaoDigital/Default.aspx" | Protocolos digitais | Alta |

### 2.3 Objetos Compostos

#### 2.3.1 solicitante (object)

Dados do solicitante do servico:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| solicitante.nome | string | Nome completo do solicitante | "JOAO DA SILVA" |
| solicitante.cpf_cnpj | string | CPF ou CNPJ do solicitante | "123.456.789-00" |
| solicitante.email | string | Email para contato | "joao@email.com" |

#### 2.3.2 sistema_origem (object)

Identificacao do sistema que gerou o protocolo:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| sistema_origem.sigla | string | Sigla do sistema | "SAEC" |
| sistema_origem.nome_completo | string | Nome completo do sistema | "Servico de Atendimento Eletronico Compartilhado" |
| sistema_origem.operador | string | Operador responsavel | "ONR" |

#### 2.3.3 informacoes_suporte (object)

Dados de suporte tecnico:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| informacoes_suporte.telefone | string | Telefone de suporte | "(11) 3195-2290" |
| informacoes_suporte.email | string | Email de suporte | "servicedesk@onr.org.br" |
| informacoes_suporte.horario | string | Horario de atendimento | "2a a 6a feira - das 9h as 16h30" |

---

## 3. MAPEAMENTO SCHEMA -> MODELO DE DADOS

### 3.1 Campos que Alimentam "Dados do Imovel" (2 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| matricula_imovel | matricula_numero | NAO (apenas referencia) | Baixa |
| cartorio_destino | cartorio_registro | NAO (apenas referencia) | Baixa |

**Nota importante**: O Protocolo ONR e um documento de **rastreamento e comprovacao**, nao sendo usado diretamente para alimentar dados de minutas. Sua principal utilidade e correlacionar solicitacoes com documentos finais (certidoes) que serao recebidos posteriormente.

### 3.2 Campos que Alimentam "Pessoa Natural"

O Protocolo ONR **nao alimenta** diretamente campos de Pessoa Natural utilizados em minutas. Os dados do solicitante sao apenas para rastreamento interno.

### 3.3 Campos que Alimentam "Pessoa Juridica"

O Protocolo ONR **nao alimenta** campos de Pessoa Juridica.

### 3.4 Campos que Alimentam "Negocio Juridico"

O Protocolo ONR **nao alimenta** campos de Negocio Juridico.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| numero_protocolo | Referencia de rastreamento | Usado apenas para acompanhamento |
| data_protocolo | Metadado da solicitacao | Nao e data de documento final |
| hora_protocolo | Metadado da solicitacao | Precisao temporal do pedido |
| tipo_solicitacao | Informativo | Indica servico solicitado |
| status_solicitacao | Temporario | Muda durante processamento |
| codigo_verificacao | Autenticacao | Validacao do protocolo |
| solicitante.* | Dados do solicitante | Nao e dado da transacao imobiliaria |
| sistema_origem.* | Metadado tecnico | Referencia do sistema |
| informacoes_suporte.* | Contato | Suporte tecnico |

---

## 4. EXEMPLO DE EXTRACAO REAL

### Exemplo 1: Protocolo de Certidao Digital

```json
{
  "tipo_documento": "PROTOCOLO_ONR",
  "dados_catalogados": {
    "tipo_documento": "PROTOCOLO_ONR",
    "numero_protocolo": "P23110224786D",
    "data_protocolo": "14/11/2023",
    "hora_protocolo": "13:16:59",
    "tipo_solicitacao": "CERTIDAO DIGITAL",
    "status": "GERADO COM SUCESSO",
    "sistema_origem": {
      "sigla": "SAEC",
      "nome_completo": "Servico de Atendimento Eletronico Compartilhado",
      "operador": "ONR"
    },
    "url_sistema": "https://registradores.onr.org.br/CertidaoDigital/Default.aspx",
    "informacoes_suporte": {
      "telefone": "(11) 3195-2290",
      "email": "servicedesk@onr.org.br",
      "horario": "2a a 6a feira - das 9h as 16h30"
    }
  }
}
```

**Fonte**: Documento de protocolo SAEC

### Exemplo 2: Protocolo com Matricula Especifica

```json
{
  "tipo_documento": "PROTOCOLO_ONR",
  "dados_catalogados": {
    "numero_protocolo": "ONR-2026-123456",
    "data_protocolo": "27/01/2026",
    "hora_protocolo": "14:30:45",
    "tipo_solicitacao": "CERTIDAO DE INTEIRO TEOR",
    "cartorio_destino": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO",
    "matricula_imovel": "123456",
    "status_solicitacao": "EM ANALISE",
    "solicitante": {
      "nome": "MARIA SILVA",
      "cpf_cnpj": "123.456.789-00",
      "email": "maria@email.com"
    },
    "codigo_verificacao": "ABC123DEF456"
  }
}
```

**Fonte**: Exemplo de schema

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| matricula_imovel | MATRICULA_IMOVEL, ESCRITURA, ITBI | Identificar imovel objeto da solicitacao |
| cartorio_destino | MATRICULA_IMOVEL | Confirmar cartorio de registro |
| solicitante.cpf_cnpj | RG, CNH, documentos de pessoa | Identificar quem fez o pedido |

### 5.2 Redundancia Intencional

O Protocolo ONR **nao e fonte primaria** de nenhum dado. Sua funcao e:

| Dado | Funcao do Protocolo | Fonte Primaria |
|------|---------------------|----------------|
| Matricula do imovel | Referencia a solicitacao | MATRICULA_IMOVEL |
| Dados do solicitante | Rastreamento | RG, CNH |
| Cartorio de destino | Roteamento | MATRICULA_IMOVEL |

### 5.3 Hierarquia de Fontes

O Protocolo ONR ocupa a **ultima posicao** na hierarquia de fontes, pois:

1. **Documentos finais** (MATRICULA_IMOVEL, CERTIDAO_CASAMENTO) - Fontes primarias
2. **Protocolo ONR** - Apenas comprovante de solicitacao

### 5.4 Tipos de Solicitacao Possiveis

| Tipo de Solicitacao | Descricao | Documento Resultante |
|---------------------|-----------|---------------------|
| CERTIDAO DIGITAL | Certidao de matricula em formato digital | MATRICULA_IMOVEL (digital) |
| CERTIDAO DE INTEIRO TEOR | Transcricao completa da matricula | MATRICULA_IMOVEL (inteiro teor) |
| CERTIDAO DE ONUS REAIS | Certidao especifica de onus e gravames | MATRICULA_IMOVEL (resumida) |
| CERTIDAO NEGATIVA DE PROPRIEDADE | Pesquisa por CPF/CNPJ | Certidao negativa/positiva |
| PESQUISA DE BENS | Busca de imoveis por titular | Lista de matriculas |
| PROTOCOLO DE TITULO | Submissao de titulo para registro | Registro na matricula |
| AVERBACAO | Solicitacao de averbacao | Averbacao na matricula |

### 5.5 Fluxo de Correlacao

```
PROTOCOLO_ONR (solicitacao)
    |
    v
[Processamento pelo cartorio]
    |
    v
MATRICULA_IMOVEL (documento final)
```

O protocolo permite rastrear a origem de documentos recebidos, correlacionando a solicitacao com o resultado final.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_cnpj_digito_verificador | CPF/CNPJ do solicitante valido | Estrutural |
| data_protocolo_valida | Data no passado ou presente | Logica |
| matricula_valida | Formato de matricula valido (se presente) | Estrutural |
| numero_protocolo_formato | Protocolo segue padrao esperado | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Regra | Acao se Violada |
|-----------|-------|-----------------|
| Status coerente | Status deve ser um valor conhecido | Alertar para revisao |
| Tipo de solicitacao valido | Deve ser tipo reconhecido pelo sistema | Classificar como "OUTRO" |
| Cartorio existente | Cartorio deve existir no cadastro ONR | Alertar para verificacao |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Protocolo muito antigo (> 90 dias) com status "PENDENTE" ou "EM ANALISE"
- Ausencia de numero de protocolo
- Status "DEVOLVIDO" ou "CANCELADO" (indicam problemas na solicitacao)
- Matricula informada mas cartorio ausente

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Origem | Logica |
|-----------------|--------|--------|
| tempo_processamento | data_protocolo + status | Calculado quando status = CONCLUIDO |
| cartorio_normalizado | cartorio_destino | Padronizacao do nome do cartorio |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| uf_cartorio | Inferido do nome do cartorio | Extraido do endereco ou nome |
| tipo_servico_categoria | Inferido do tipo_solicitacao | Agrupamento em categorias |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| solicitante.email | ~70% | Quando solicitante e pessoa fisica |
| codigo_verificacao | ~50% | Protocolos com autenticacao adicional |
| informacoes_suporte | ~80% | Maioria dos comprovantes SAEC |

### 7.4 Status de Solicitacao Validos

| Status | Descricao | Acao Sugerida |
|--------|-----------|---------------|
| PENDENTE | Aguardando processamento | Aguardar |
| EM ANALISE | Em processamento pelo cartorio | Aguardar |
| GERADO COM SUCESSO | Documento gerado/disponivel | Baixar certidao |
| CONCLUIDO | Solicitacao finalizada | Verificar resultado |
| CANCELADO | Solicitacao cancelada | Verificar motivo |
| DEVOLVIDO | Solicitacao devolvida com pendencia | Corrigir e reenviar |

### 7.5 Evolucao do Sistema ONR

| Ano | Marco | Observacao |
|-----|-------|------------|
| 2009 | Lei 11.977/2009 | Criacao do SREI |
| 2019 | Provimento CNJ 89/2019 | Regulamentacao do ONR |
| 2020 | Inicio das operacoes | Lancamento do SAEC |
| 2022 | Integracao nacional | Maior cobertura de cartorios |
| 2024 | Obrigatoriedade ampliada | Todos os cartorios integrados |

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/protocolo_onr.json`
- **Portal ONR**: https://www.onr.org.br
- **Sistema SAEC**: https://registradores.onr.org.br
- **Provimento CNJ 89/2019**: Regulamentacao do ONR
- **Lei 11.977/2009**: Criacao do Sistema de Registro Eletronico de Imoveis
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
