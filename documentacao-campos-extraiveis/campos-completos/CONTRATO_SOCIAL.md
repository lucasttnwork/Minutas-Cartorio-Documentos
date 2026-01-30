# CONTRATO_SOCIAL - Contrato Social e Alteracoes Contratuais

**Complexidade de Extracao**: ALTA
**Schema Fonte**: Nao possui schema dedicado (campos mapeados em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O Contrato Social e o documento constitutivo de uma pessoa juridica, registrado na Junta Comercial. Este documento e essencial para transacoes imobiliarias envolvendo empresas pois:

- **Prova a existencia juridica da empresa**: Razao social, CNPJ, NIRE
- **Define a sede e endereco oficial**: Logradouro, cidade, estado
- **Identifica os socios/quotistas**: Nomes, CPFs, participacao societaria
- **Designa os administradores**: Quem pode representar a empresa
- **Estabelece os poderes de representacao**: Limites e condicoes para agir em nome da empresa

Este documento tem **32 campos mapeados** (todos na categoria Pessoa Juridica), sendo o segundo mais complexo para dados de PJ atras apenas da PROCURACAO.

### 1.2 Tipos de Documentos Relacionados

| Tipo | Descricao | Uso |
|------|-----------|-----|
| **Contrato Social Original** | Documento de constituicao da empresa | Primeira versao, contem clausulas iniciais |
| **Alteracao Contratual** | Modificacao de clausulas do contrato | Altera capital, socios, objeto social, etc. |
| **Contrato Social Consolidado** | Contrato original + todas as alteracoes | Versao atualizada e unificada |
| **Certidao Simplificada** | Resumo emitido pela Junta Comercial | Confirma dados essenciais (CNPJ, sede, administradores) |
| **Ficha Cadastral** | Dados cadastrais da empresa na Junta | Historico de alteracoes e representantes |

**IMPORTANTE**: Para escrituras, e preferivel usar o **Contrato Social Consolidado** ou a **Certidao Simplificada** mais recente, pois contem os dados atualizados.

### 1.3 Padroes de Identificacao Visual

Os seguintes termos indicam que o documento e um Contrato Social ou documento relacionado:

- CONTRATO SOCIAL
- CONSTITUICAO DE SOCIEDADE
- LTDA / LIMITADA
- EIRELI
- SOCIEDADE EMPRESARIA
- JUNTA COMERCIAL
- JUCESP / JUCERJA / JUCEMG (Juntas Comerciais estaduais)
- NIRE
- ALTERACAO CONTRATUAL
- CLAUSULA PRIMEIRA / SEGUNDA / ETC.
- OBJETO SOCIAL
- CAPITAL SOCIAL
- QUOTAS

### 1.4 Formatos Comuns

| Formato | Descricao | Caracteristicas |
|---------|-----------|-----------------|
| Contrato Original | Primeiro documento registrado | Contem todas as clausulas fundacionais |
| Alteracao Contratual | Modificacao especifica | Altera clausulas especificas (capital, socios, etc.) |
| Consolidado | Original + alteracoes | Texto unificado e atualizado |
| Certidao Simplificada | Emitida pela Junta | Resumo oficial com dados essenciais |
| Ficha Cadastral Breve | Extrato da Junta | Dados resumidos do registro |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Dados da Empresa (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex |
|-------|------|-----------|---------|-------|
| pj_denominacao | string | Razao social ou denominacao | "CONSTRUTORA ALPHA LTDA" | - |
| pj_cnpj | string | CNPJ da empresa | "12.345.678/0001-90" | `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}` |

### 2.2 Dados da Empresa (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente |
|-------|------|-----------|---------|-----------------|
| pj_nire | string | Numero de Inscricao no Registro de Empresas | "35.215.678.901" | Sempre (empresas mercantis) |
| pj_instrumento_constitutivo | string | Tipo do instrumento | "CONTRATO SOCIAL E SUAS ALTERACOES" | Sempre |
| pj_junta_comercial | string | Junta Comercial de registro | "JUCESP" | Sempre |
| pj_numero_registro_contrato | string | Numero do registro na JC | "123.456.789.012" | Sempre |
| pj_data_sessao_registro | date | Data da sessao de registro | "15/03/2020" | Sempre |
| pj_data_expedicao_ficha_cadastral | date | Data de expedicao da ficha | "20/03/2020" | Certidoes/Fichas |
| pj_data_expedicao_certidao_registro | date | Data da certidao de registro | "20/03/2020" | Certidoes |

### 2.3 Endereco da Sede (8 campos)

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| pj_sede_logradouro | string | Logradouro da sede | "AVENIDA PAULISTA" | Sim |
| pj_sede_numero | string | Numero da sede | "1000" | Sim |
| pj_sede_complemento | string | Complemento | "CONJUNTO 1501" | Nao |
| pj_sede_bairro | string | Bairro da sede | "BELA VISTA" | Nao |
| pj_sede_cidade | string | Cidade da sede | "SAO PAULO" | Sim |
| pj_sede_estado | string | Estado (UF) | "SP" | Sim |
| pj_sede_cep | string | CEP da sede | "01310-100" | Nao |

### 2.4 Dados do Administrador (21 campos)

O administrador e a pessoa (socio ou nao) designada para representar a empresa. Seus dados sao fundamentais para a minuta de escritura.

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| pj_admin_nome | string | Nome completo do administrador | "JOAO CARLOS MENDES" | Sim |
| pj_admin_cpf | string | CPF do administrador | "987.654.321-00" | Sim |
| pj_admin_rg | string | RG do administrador | "45.678.901-2" | Nao |
| pj_admin_orgao_emissor_rg | string | Orgao emissor do RG | "SSP" | Nao |
| pj_admin_estado_emissor_rg | string | Estado emissor do RG | "SP" | Nao |
| pj_admin_data_emissao_rg | date | Data de emissao do RG | "10/05/2005" | Nao |
| pj_admin_cnh | string | CNH do administrador | "12345678901" | Nao |
| pj_admin_orgao_emissor_cnh | string | Orgao emissor da CNH | "DETRAN-SP" | Nao |
| pj_admin_data_nascimento | date | Data de nascimento | "15/08/1975" | Nao |
| pj_admin_estado_civil | string | Estado civil | "CASADO" | Nao |
| pj_admin_profissao | string | Profissao | "ENGENHEIRO CIVIL" | Nao |
| pj_admin_nacionalidade | string | Nacionalidade | "BRASILEIRO" | Nao |
| pj_admin_domicilio_logradouro | string | Logradouro do administrador | "RUA DAS ACACIAS" | Nao |
| pj_admin_domicilio_numero | string | Numero | "250" | Nao |
| pj_admin_domicilio_complemento | string | Complemento | "APTO 802" | Nao |
| pj_admin_domicilio_bairro | string | Bairro | "VILA MARIANA" | Nao |
| pj_admin_domicilio_cidade | string | Cidade | "SAO PAULO" | Nao |
| pj_admin_domicilio_estado | string | Estado (UF) | "SP" | Nao |
| pj_admin_domicilio_cep | string | CEP | "04101-050" | Nao |
| pj_admin_email | string | E-mail | "joao.mendes@construtoraalpha.com.br" | Nao |
| pj_admin_telefone | string | Telefone | "+55 (11) 98765-4321" | Nao |

### 2.5 Dados de Representacao (5 campos)

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| pj_tipo_representacao | string | Tipo de representacao | "ADMINISTRADOR INDICADO NO CONTRATO SOCIAL" | Sim |
| pj_clausula_indica_admin | string | Clausula que indica o administrador | "CLAUSULA DECIMA SEGUNDA" | Nao |
| pj_data_ata_admin | date | Data da ata de nomeacao (se aplicavel) | "10/06/2022" | Nao |
| pj_numero_registro_ata | string | Numero de registro da ata | "987.654.321.098" | Nao |
| pj_clausula_poderes_admin | string | Clausula sobre poderes | "CLAUSULA DECIMA TERCEIRA" | Nao |

---

## 3. ESTRUTURA DE SOCIOS (ARRAY)

### 3.1 Visao Geral

O Contrato Social contem um array de socios/quotistas. Cada socio possui os seguintes campos:

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| nome | string | Nome completo do socio | "MARIA DA SILVA SANTOS" | Sim |
| cpf | string | CPF do socio | "123.456.789-00" | Sim |
| rg | string | Numero do RG | "12.345.678-9" | Nao |
| orgao_emissor_rg | string | Orgao emissor | "SSP" | Nao |
| estado_emissor_rg | string | Estado do RG | "SP" | Nao |
| nacionalidade | string | Nacionalidade | "BRASILEIRA" | Nao |
| estado_civil | string | Estado civil | "CASADA" | Nao |
| regime_bens | string | Regime de bens (se casado) | "COMUNHAO PARCIAL DE BENS" | Nao |
| profissao | string | Profissao | "EMPRESARIA" | Nao |
| endereco | string | Endereco completo | "Rua das Flores, 100, Sao Paulo-SP" | Nao |
| quotas | number | Numero de quotas | 50000 | Sim |
| valor_quotas | number | Valor das quotas em R$ | 50000.00 | Nao |
| percentual | number | Percentual do capital | 50.0 | Sim |
| administrador | boolean | Se e administrador | true | Nao |

### 3.2 Exemplo de Array de Socios

```json
{
  "socios": [
    {
      "nome": "JOAO CARLOS MENDES",
      "cpf": "987.654.321-00",
      "rg": "45.678.901-2",
      "orgao_emissor_rg": "SSP",
      "estado_emissor_rg": "SP",
      "nacionalidade": "BRASILEIRO",
      "estado_civil": "CASADO",
      "regime_bens": "COMUNHAO PARCIAL DE BENS",
      "profissao": "ENGENHEIRO CIVIL",
      "quotas": 60000,
      "percentual": 60.0,
      "administrador": true
    },
    {
      "nome": "MARIA DA SILVA MENDES",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "orgao_emissor_rg": "SSP",
      "estado_emissor_rg": "SP",
      "nacionalidade": "BRASILEIRA",
      "estado_civil": "CASADA",
      "regime_bens": "COMUNHAO PARCIAL DE BENS",
      "profissao": "ADMINISTRADORA",
      "quotas": 40000,
      "percentual": 40.0,
      "administrador": false
    }
  ]
}
```

---

## 4. PODERES DO ADMINISTRADOR

### 4.1 Tipos de Representacao

| Tipo | Descricao | Requisitos para Escritura |
|------|-----------|--------------------------|
| **Administrador Unico** | Sozinho representa a empresa | Contrato social + docs pessoais |
| **Administradores Conjuntos** | Dois ou mais devem agir juntos | Ambos devem comparecer ou outorgar procuracao |
| **Administrador + Procurador** | Procuracao outorgada pelo administrador | Contrato social + procuracao + docs |
| **Administrador Nao-Socio** | Pessoa externa designada | Ata de nomeacao + contrato social |

### 4.2 Clausulas Importantes para Verificar

| Clausula | O que verificar | Impacto na Escritura |
|----------|-----------------|---------------------|
| **Objeto Social** | Se inclui "compra e venda de imoveis" | Se nao incluir, pode precisar de alteracao contratual |
| **Administracao** | Quem pode representar a empresa | Define quem deve comparecer |
| **Poderes** | Limites de valor ou tipo de ato | Verificar se ha restricao para imoveis |
| **Procuracao** | Se pode outorgar procuracao | Permite representacao por procurador |
| **Prazo de Duracao** | Determinado ou indeterminado | Empresa com prazo expirado pode ter problemas |

### 4.3 Forma de Representacao na Minuta

```
"CONSTRUTORA ALPHA LTDA, pessoa juridica de direito privado,
inscrita no CNPJ sob no 12.345.678/0001-90, com sede na Avenida
Paulista, 1000, Conjunto 1501, Bela Vista, CEP 01310-100,
Sao Paulo-SP, neste ato representada por seu administrador,
JOAO CARLOS MENDES, brasileiro, casado pelo regime da comunhao
parcial de bens, engenheiro civil, portador do RG no 45.678.901-2
SSP/SP e inscrito no CPF sob no 987.654.321-00, residente e
domiciliado na Rua das Acacias, 250, Apto 802, Vila Mariana,
CEP 04101-050, Sao Paulo-SP, conforme Clausula Decima Segunda
do Contrato Social registrado na JUCESP sob no 123.456.789.012
em sessao de 15/03/2020."
```

---

## 5. CONTRATO ORIGINAL vs ALTERACOES

### 5.1 Quando Usar Cada Tipo

| Situacao | Documento Necessario |
|----------|---------------------|
| Empresa recente, sem alteracoes | Contrato Social Original |
| Empresa com alteracoes | Contrato Social Consolidado OU Original + Todas Alteracoes |
| Validacao rapida | Certidao Simplificada (atualizada) |
| Historico completo | Ficha Cadastral + todos os documentos |

### 5.2 Informacoes que Podem Mudar em Alteracoes

| Campo | Tipo de Alteracao | Impacto |
|-------|-------------------|---------|
| Razao Social | Alteracao de denominacao | Atualizar nome da empresa |
| Endereco da Sede | Mudanca de endereco | Atualizar endereco |
| Capital Social | Aumento ou reducao | Verificar integralizacao |
| Socios | Entrada ou saida | Verificar legitimidade |
| Administrador | Nomeacao ou destituicao | Verificar quem representa |
| Objeto Social | Ampliacao ou restricao | Verificar se permite imoveis |

### 5.3 Hierarquia de Documentos

Para determinar os dados atuais da empresa:

1. **Certidao Simplificada (mais recente)** - Dados oficiais atualizados
2. **Contrato Social Consolidado** - Texto unificado
3. **Ultima Alteracao + Contrato Original** - Reconstruir o estado atual
4. **Ficha Cadastral** - Historico de alteracoes

---

## 6. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 6.1 Campos que Alimentam "Pessoa Juridica" (32 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| razao_social / denominacao | pj_denominacao | SIM | Nome oficial da empresa |
| cnpj | pj_cnpj | SIM | CNPJ formatado |
| nire | pj_nire | SIM | NIRE da Junta Comercial |
| sede.logradouro | pj_sede_logradouro | SIM | Logradouro da sede |
| sede.numero | pj_sede_numero | SIM | Numero da sede |
| sede.complemento | pj_sede_complemento | SIM | Complemento |
| sede.bairro | pj_sede_bairro | SIM | Bairro |
| sede.cidade | pj_sede_cidade | SIM | Cidade |
| sede.estado | pj_sede_estado | SIM | UF |
| sede.cep | pj_sede_cep | SIM | CEP |
| instrumento_constitutivo | pj_instrumento_constitutivo | SIM | Tipo de instrumento |
| junta_comercial | pj_junta_comercial | SIM | Sigla da JC |
| numero_registro | pj_numero_registro_contrato | SIM | Numero na JC |
| data_sessao | pj_data_sessao_registro | SIM | Data da sessao |
| administrador.nome | pj_admin_nome | SIM | Nome do administrador |
| administrador.cpf | pj_admin_cpf | SIM | CPF do administrador |
| administrador.rg | pj_admin_rg | SIM | RG do administrador |
| administrador.orgao_rg | pj_admin_orgao_emissor_rg | SIM | Orgao emissor |
| administrador.estado_rg | pj_admin_estado_emissor_rg | SIM | Estado do RG |
| administrador.data_nascimento | pj_admin_data_nascimento | SIM | Data de nascimento |
| administrador.estado_civil | pj_admin_estado_civil | SIM | Estado civil |
| administrador.profissao | pj_admin_profissao | SIM | Profissao |
| administrador.nacionalidade | pj_admin_nacionalidade | SIM | Nacionalidade |
| administrador.endereco.* | pj_admin_domicilio_* | SIM | Endereco completo (7 campos) |
| tipo_representacao | pj_tipo_representacao | SIM | Tipo de representacao |
| clausula_administrador | pj_clausula_indica_admin | SIM | Clausula que indica o admin |
| clausula_poderes | pj_clausula_poderes_admin | SIM | Clausula sobre poderes |

### 6.2 Campos que NAO Alimentam o Modelo de Dados

| Campo | Motivo da Exclusao |
|-------|-------------------|
| objeto_social | Nao usado diretamente na minuta (apenas verificacao) |
| capital_social | Nao usado na minuta de escritura |
| quotas (de cada socio) | Nao usado na minuta |
| data_constituicao | Metadado historico |
| prazo_duracao | Metadado de verificacao |
| socios nao-administradores | Nao comparecem na escritura |

---

## 7. CORRELACAO COM OUTROS DOCUMENTOS

### 7.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| pj_cnpj | CNDT, CND_FEDERAL, CND_ESTADUAL, CND_MUNICIPAL, MATRICULA_IMOVEL, ITBI, ESCRITURA, PROCURACAO | Identificar mesma empresa |
| pj_denominacao | Todos os documentos de PJ | Correlacionar documentos da mesma empresa |
| pj_admin_cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT | Identificar administrador |
| pj_admin_nome | Todos os documentos de pessoa natural | Correlacionar pessoa |
| pj_sede_* | ESCRITURA, COMPROMISSO_COMPRA_VENDA | Validar endereco da sede |

### 7.2 Correlacao com PROCURACAO

O CONTRATO_SOCIAL e a PROCURACAO sao documentos complementares para representacao de PJ:

| Cenario | CONTRATO_SOCIAL | PROCURACAO |
|---------|-----------------|------------|
| Administrador comparece pessoalmente | Necessario | Nao necessaria |
| Procurador representa a empresa | Necessario | Necessaria |
| Administrador + Procurador conjunto | Necessario | Necessaria |

**Fluxo de validacao:**

```
CONTRATO_SOCIAL (quem pode representar)
         |
         +---> Administrador identificado
         |
         +---> Se procuracao:
         |         |
         |         +---> PROCURACAO (poderes delegados)
         |                   |
         |                   +---> Procurador identificado
         |
         v
    ESCRITURA (representante comparece)
```

### 7.3 Correlacao com Certidoes Negativas de PJ

Para escrituras envolvendo PJ, as seguintes certidoes devem ter o mesmo CNPJ:

| Documento | Campo de Correlacao | Validacao |
|-----------|---------------------|-----------|
| CNDT (PJ) | pj_cnpj | CNPJ deve ser identico |
| CND_FEDERAL (PJ) | pj_cnpj | CNPJ deve ser identico |
| CND_ESTADUAL (PJ) | pj_cnpj | CNPJ deve ser identico |
| CND_MUNICIPAL (PJ) | pj_cnpj | CNPJ deve ser identico |

---

## 8. VALIDACOES E CONFERENCIAS

### 8.1 Validacoes Automaticas

| Validacao | Descricao | Implementada |
|-----------|-----------|--------------|
| cnpj_digito_verificador | CNPJ com digitos verificadores validos | Sim |
| cpf_admin_digito_verificador | CPF do administrador valido | Sim |
| soma_percentuais_socios_100 | Participacao dos socios soma 100% | Sim |
| nire_formato_valido | NIRE no formato da JC | Sim |
| cep_sede_valido | CEP da sede no formato correto | Sim |

### 8.2 Validacoes de Negocio

| Validacao | Descricao | Quando Aplicavel |
|-----------|-----------|------------------|
| empresa_ativa | Verificar se empresa esta ativa na Receita | Sempre |
| administrador_vigente | Verificar se o administrador ainda e vigente | Sempre |
| objeto_permite_imoveis | Objeto social permite transacoes imobiliarias | Sempre |
| prazo_duracao_valido | Prazo de duracao nao expirou | Prazo determinado |
| poderes_suficientes | Administrador tem poderes para o ato | Sempre |
| documentos_atualizados | Certidao/Consolidado recente (< 30 dias) | Sempre |

### 8.3 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| documento_atualizado | boolean | Documento tem menos de 30 dias |
| tipo_documento | string | Original, Alteracao, Consolidado, Certidao |
| versao_contrato | string | Numero da versao/alteracao |
| data_ultima_alteracao | date | Data da ultima alteracao |

---

## 9. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CONTRATO_SOCIAL",
  "subtipo": "CONSOLIDADO",
  "dados_extraidos": {
    "empresa": {
      "razao_social": "CONSTRUTORA ALPHA LTDA",
      "cnpj": "12.345.678/0001-90",
      "nire": "35.215.678.901",
      "data_constituicao": "10/01/2015",
      "prazo_duracao": "INDETERMINADO",
      "capital_social": 1000000.00,
      "capital_integralizado": true
    },
    "sede": {
      "logradouro": "AVENIDA PAULISTA",
      "numero": "1000",
      "complemento": "CONJUNTO 1501",
      "bairro": "BELA VISTA",
      "cidade": "SAO PAULO",
      "estado": "SP",
      "cep": "01310-100"
    },
    "objeto_social": "A sociedade tem por objeto: (a) construcao civil em geral; (b) incorporacao imobiliaria; (c) compra, venda e administracao de imoveis proprios; (d) prestacao de servicos de engenharia.",
    "socios": [
      {
        "nome": "JOAO CARLOS MENDES",
        "cpf": "987.654.321-00",
        "rg": "45.678.901-2",
        "orgao_emissor_rg": "SSP",
        "estado_emissor_rg": "SP",
        "nacionalidade": "BRASILEIRO",
        "estado_civil": "CASADO",
        "regime_bens": "COMUNHAO PARCIAL DE BENS",
        "profissao": "ENGENHEIRO CIVIL",
        "endereco": "Rua das Acacias, 250, Apto 802, Vila Mariana, CEP 04101-050, Sao Paulo-SP",
        "quotas": 600000,
        "valor_quotas": 600000.00,
        "percentual": 60.0,
        "administrador": true
      },
      {
        "nome": "MARIA DA SILVA MENDES",
        "cpf": "123.456.789-00",
        "rg": "12.345.678-9",
        "orgao_emissor_rg": "SSP",
        "estado_emissor_rg": "SP",
        "nacionalidade": "BRASILEIRA",
        "estado_civil": "CASADA",
        "regime_bens": "COMUNHAO PARCIAL DE BENS",
        "profissao": "ADMINISTRADORA",
        "endereco": "Rua das Acacias, 250, Apto 802, Vila Mariana, CEP 04101-050, Sao Paulo-SP",
        "quotas": 400000,
        "valor_quotas": 400000.00,
        "percentual": 40.0,
        "administrador": false
      }
    ],
    "administracao": {
      "administrador_nome": "JOAO CARLOS MENDES",
      "administrador_cpf": "987.654.321-00",
      "tipo_representacao": "ADMINISTRADOR UNICO",
      "clausula_indica_admin": "CLAUSULA DECIMA SEGUNDA",
      "clausula_poderes": "CLAUSULA DECIMA TERCEIRA",
      "poderes": "O administrador pode praticar todos os atos de gestao, incluindo compra e venda de imoveis, outorga de procuracoes, representacao em juizo e fora dele, abertura e movimentacao de contas bancarias, sem limite de valor.",
      "assinatura": "ISOLADAMENTE"
    },
    "registro": {
      "junta_comercial": "JUCESP",
      "numero_registro": "123.456.789.012",
      "data_sessao_registro": "15/03/2020",
      "numero_alteracoes": 3,
      "data_ultima_alteracao": "10/06/2022"
    },
    "metadados": {
      "tipo_extracao": "CERTIDAO_SIMPLIFICADA",
      "data_emissao_certidao": "25/01/2026",
      "validade_sugerida_dias": 30
    }
  }
}
```

---

## 10. NOTAS TECNICAS

### 10.1 Campos Computados

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| capital_social_por_socio | quotas * valor_quota | Valor em R$ por socio |
| percentual_socio | (quotas_socio / total_quotas) * 100 | Percentual de participacao |
| empresa_ativa | Consulta externa a Receita Federal | Verificacao de situacao cadastral |

### 10.2 Campos Inferidos

| Campo Inferido | Origem | Logica de Inferencia |
|----------------|--------|---------------------|
| tipo_sociedade | Razao social | "LTDA" = Limitada, "EIRELI" = EIRELI, "S.A." = Anonima |
| junta_comercial | Estado da sede | SP = JUCESP, RJ = JUCERJA, MG = JUCEMG, etc. |
| assinatura_conjunta | Clausula de administracao | "conjuntamente" indica necessidade de dois admin |

### 10.3 Campos Raros

| Campo | Frequencia | Quando Aparece |
|-------|------------|----------------|
| administrador_nao_socio | Raro | Quando terceiro e nomeado administrador |
| conselho_administracao | Raro | Apenas em S.A. e algumas LTDA maiores |
| procurador_geral | Medio | Quando ha procurador permanente |
| pacto_parassocial | Raro | Acordos entre socios |

### 10.4 Tipos de Sociedade e Particularidades

| Tipo | Caracteristicas | Documento Adicional |
|------|-----------------|---------------------|
| **LTDA** | Responsabilidade limitada, quotas | Contrato Social |
| **EIRELI** | Empresa individual, titular unico | Ato Constitutivo |
| **S.A. Fechada** | Acoes, diretoria | Estatuto Social + Ata |
| **S.A. Aberta** | Acoes em bolsa | Estatuto + Ata + CVM |
| **SLU** | Sociedade Limitada Unipessoal | Contrato Social |

---

## 11. ESTRUTURA HIERARQUICA

```
CONTRATO_SOCIAL
|
+-- Identificacao da Empresa
|   +-- pj_denominacao
|   +-- pj_cnpj
|   +-- pj_nire
|   +-- data_constituicao
|   +-- prazo_duracao
|
+-- Sede (object)
|   +-- pj_sede_logradouro
|   +-- pj_sede_numero
|   +-- pj_sede_complemento
|   +-- pj_sede_bairro
|   +-- pj_sede_cidade
|   +-- pj_sede_estado
|   +-- pj_sede_cep
|
+-- Objeto Social
|   +-- descricao_objeto
|   +-- atividades_principais
|   +-- cnae_principal
|   +-- cnaes_secundarios
|
+-- Capital Social
|   +-- valor_total
|   +-- integralizado
|   +-- forma_integralizacao
|
+-- Socios [N] (array)
|   +-- Socio 1
|   |   +-- nome
|   |   +-- cpf
|   |   +-- rg
|   |   +-- orgao_emissor_rg
|   |   +-- estado_emissor_rg
|   |   +-- nacionalidade
|   |   +-- estado_civil
|   |   +-- regime_bens
|   |   +-- profissao
|   |   +-- endereco
|   |   +-- quotas
|   |   +-- percentual
|   |   +-- administrador (boolean)
|   +-- Socio 2
|   +-- ...
|
+-- Administracao (object)
|   +-- pj_admin_nome
|   +-- pj_admin_cpf
|   +-- pj_admin_rg
|   +-- pj_admin_orgao_emissor_rg
|   +-- pj_admin_estado_emissor_rg
|   +-- pj_admin_data_nascimento
|   +-- pj_admin_estado_civil
|   +-- pj_admin_profissao
|   +-- pj_admin_nacionalidade
|   +-- pj_admin_domicilio_* (7 campos)
|   +-- pj_admin_email
|   +-- pj_admin_telefone
|   +-- pj_tipo_representacao
|   +-- pj_clausula_indica_admin
|   +-- pj_clausula_poderes_admin
|
+-- Registro na Junta Comercial
|   +-- pj_instrumento_constitutivo
|   +-- pj_junta_comercial
|   +-- pj_numero_registro_contrato
|   +-- pj_data_sessao_registro
|   +-- pj_data_expedicao_ficha_cadastral
|   +-- pj_data_expedicao_certidao_registro
|
+-- Alteracoes [N] (array, se aplicavel)
|   +-- Alteracao 1
|   |   +-- numero
|   |   +-- data
|   |   +-- objeto_alteracao
|   +-- ...
```

---

## 12. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos PJ**: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- **Documento Referencia**: `DOCUMENTOS_E_CAMPOS_REFERENCIA.md` (secao 3.6)
- **Correlacao com PROCURACAO**: `documentacao-campos-extraiveis/campos-completos/PROCURACAO.md` (se existir)

---

## 13. CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
