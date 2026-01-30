# CERTIDAO_CASAMENTO - Certidao de Registro de Casamento

**Complexidade de Extracao**: ALTA
**Schema Fonte**: `execution/schemas/certidao_casamento.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Certidao de Casamento e um documento oficial emitido pelo Cartorio de Registro Civil das Pessoas Naturais que comprova a existencia do vinculo matrimonial entre duas pessoas. E um dos documentos mais importantes em transacoes imobiliarias, pois:

- Define o **regime de bens** do casamento (comunhao parcial, universal, separacao, etc.)
- Identifica o **conjuge** que devera comparecer na escritura de venda de imoveis
- Registra **averbacoes** de separacao, divorcio ou obito que alteram o estado civil
- Comprova a **filiacao** completa de ambos os conjuges
- Pode conter alteracoes de nome apos o casamento

O documento e essencial para:
- Qualificacao das partes casadas em escrituras publicas
- Verificacao da necessidade de anuencia do conjuge em alienacoes
- Confirmacao do estado civil e regime de bens
- Identificacao de impedimentos ou restricoes patrimoniais

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos de Certidao de Casamento atraves dos seguintes padroes textuais:

- `CERTIDAO DE CASAMENTO`
- `REGISTRO DE CASAMENTO`
- `REGISTRO CIVIL`
- `CONTRAENTES`
- `NUBENTES`
- `REGIME DE BENS`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Inteiro Teor** | Transcricao completa do termo de casamento | Todos os campos, incluindo filiacao completa, naturalidade, profissao |
| **Breve Relato** | Versao resumida com dados essenciais | Nome dos conjuges, data, regime de bens, averbacoes |
| **Certidao Digital** | Emitida eletronicamente com selo digital | Matricula nacional, QR Code de validacao |
| **Certidao Fisica (Modelo Antigo)** | Formato papel, usa livro/folha/termo | Sem matricula nacional, dados manuscritos ou datilografados |
| **Certidao com Matricula Nacional** | Modelo padronizado pos-2010 | Matricula de 32 digitos, selo digital |
| **2a Via / Certidao Atualizada** | Emitida posteriormente ao casamento | Pode conter averbacoes de separacao/divorcio |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| nome_conjuge_1 | string | Nome completo do primeiro conjuge (antes do casamento) | "JOAO DA SILVA" | `[A-Z...][A-Z...a-z...\s]+` | Alta |
| nome_conjuge_2 | string | Nome completo do segundo conjuge (antes do casamento) | "MARIA SANTOS" | `[A-Z...][A-Z...a-z...\s]+` | Alta |
| data_casamento | date | Data da celebracao do casamento | "20/11/2010" | `\d{2}/\d{2}/\d{4}` | Alta |
| regime_bens | string | Regime de bens do casamento | "COMUNHAO PARCIAL DE BENS" | `(COMUNHAO PARCIAL\|COMUNHAO UNIVERSAL\|SEPARACAO TOTAL\|SEPARACAO OBRIGATORIA\|PARTICIPACAO FINAL NOS AQUESTOS)` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| matricula | string | Matricula nacional (32 digitos) | "122044 01 55 2022 2 00081 014 0014106-44" | Certidoes pos-2010 | Alta |
| livro | string | Numero do livro de registro | "B-0081" | Certidoes antigas e como complemento | Alta |
| folha | string | Numero da folha no livro | "014" | Certidoes antigas e como complemento | Alta |
| termo | string | Numero do termo de casamento | "14106" | Sempre presente | Alta |
| cpf_conjuge_1 | string | CPF do primeiro conjuge | "585.096.668-49" | Certidoes recentes (maioria) | Alta |
| cpf_conjuge_2 | string | CPF do segundo conjuge | "949.735.638-20" | Certidoes recentes (maioria) | Alta |
| data_nascimento_conjuge_1 | date | Data de nascimento do conjuge 1 | "23/03/1953" | Inteiro teor | Media |
| data_nascimento_conjuge_2 | date | Data de nascimento do conjuge 2 | "22/07/1957" | Inteiro teor | Media |
| naturalidade_conjuge_1 | string | Naturalidade do conjuge 1 (cidade/UF) | "Sao Paulo - SP" | Inteiro teor | Media |
| naturalidade_conjuge_2 | string | Naturalidade do conjuge 2 (cidade/UF) | "Xique-Xique - BA" | Inteiro teor | Media |
| pai_conjuge_1 | string | Nome do pai do conjuge 1 | "WASSILI ORTRIWANO" | Inteiro teor | Baixa |
| mae_conjuge_1 | string | Nome da mae do conjuge 1 | "MARIA ORTRIWANO" | Inteiro teor | Baixa |
| pai_conjuge_2 | string | Nome do pai do conjuge 2 | "ANTENOR ROMAO DA SILVA" | Inteiro teor | Baixa |
| mae_conjuge_2 | string | Nome da mae do conjuge 2 | "ELZA MAGALHAES SILVA" | Inteiro teor | Baixa |
| pacto_antenupcial | boolean | Indica se houve pacto antenupcial | false | Quando aplicavel (regimes especiais) | Media |
| nome_pos_casamento_conjuge_1 | string | Nome do conjuge 1 apos casamento | "JOAO DA SILVA" | Quando houve alteracao de nome | Media |
| nome_pos_casamento_conjuge_2 | string | Nome do conjuge 2 apos casamento | "MARIA CRISTINA FAEDO DA SILVA" | Quando houve alteracao de nome (comum para conjuge 2) | Media |
| cartorio | string | Nome completo do cartorio de registro | "Oficial de Registro Civil das Pessoas Naturais do 9o Subdistrito - Vila Mariana" | Sempre presente | Media |
| selo_digital | string | Codigo do selo digital de autenticacao | "1220442PV0000000295250221" | Certidoes digitais | Alta |

### 2.3 Arrays

#### 2.3.1 averbacoes (array)

As averbacoes sao registros de alteracoes no estado civil ou situacao do casamento, inseridos posteriormente no termo original.

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| averbacoes[].tipo | string | Tipo de averbacao | "DIVORCIO CONSENSUAL" |
| averbacoes[].data | date | Data da averbacao no cartorio | "10/03/1986" |
| averbacoes[].data_transito_julgado | date | Data do transito em julgado (judicial) | "13/02/1986" |
| averbacoes[].processo | string | Numero do processo judicial | "0009/86" |
| averbacoes[].vara | string | Vara judicial responsavel | "2a Vara da Familia e das Sucessoes desta Capital" |
| averbacoes[].juiz | string | Nome do juiz que proferiu a sentenca | "Dr. Guilherme Goncalves Strenger" |
| averbacoes[].descricao | string | Texto descritivo da averbacao | "Conversao da Separacao Consensual em Divorcio por sentenca de 20/01/1986" |

**Tipos de averbacao comuns:**

| Tipo | Descricao | Efeito no Estado Civil |
|------|-----------|----------------------|
| SEPARACAO CONSENSUAL | Separacao por acordo entre as partes | Separado judicialmente |
| SEPARACAO LITIGIOSA | Separacao com disputa judicial | Separado judicialmente |
| DIVORCIO CONSENSUAL | Divorcio por acordo | Divorciado |
| DIVORCIO LITIGIOSO | Divorcio com disputa | Divorciado |
| CONVERSAO UNIAO ESTAVEL | Conversao de uniao estavel em casamento | Casado (origem especial) |
| OBITO | Falecimento de um dos conjuges | Viuvo/Viuva |
| ALTERACAO_NOME | Alteracao judicial de nome | Mantem estado civil |
| ALTERACAO_REGIME_BENS | Mudanca de regime de bens (judicial) | Mantem estado civil |
| RECONCILIACAO | Restabelecimento do casamento | Casado |

#### 2.3.2 conversao_uniao_estavel (object)

Objeto especifico para casamentos originados de conversao de uniao estavel:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| conversao_uniao_estavel.ocorreu | boolean | Se houve conversao | true |
| conversao_uniao_estavel.base_legal | string | Fundamentacao legal | "Art. 8o da Lei Federal no 9278 de 10.05.1996" |
| conversao_uniao_estavel.data_inicio_uniao | date | Data de inicio da uniao estavel | null (geralmente nao informada) |

#### 2.3.3 pacto_antenupcial (object)

Detalhes do pacto antenupcial quando existente:

| Subcampo | Tipo | Descricao | Exemplo |
|----------|------|-----------|---------|
| pacto_antenupcial.existe | boolean | Se existe pacto | true |
| pacto_antenupcial.cartorio | string | Cartorio onde foi lavrado | "1o Tabelionato de Notas de Sao Paulo" |
| pacto_antenupcial.livro | string | Livro do pacto | "0120" |
| pacto_antenupcial.folhas | string | Folhas do pacto | "45-48" |
| pacto_antenupcial.data | date | Data da lavratura | "15/10/2010" |

---

## 3. MAPEAMENTO SCHEMA -> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural" (12 campos por conjuge)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_conjuge_1 / nome_conjuge_2 | nome | SIM | Alta |
| cpf_conjuge_1 / cpf_conjuge_2 | cpf | SIM | Alta |
| (rg se presente) | rg | SIM | Media |
| (orgao se presente) | orgao_emissor_rg | SIM | Media |
| (uf se presente) | estado_emissor_rg | SIM | Media |
| data_nascimento_conjuge_1/2 | data_nascimento | SIM | Media |
| Inferido das averbacoes | estado_civil | SIM | Alta |
| regime_bens | regime_bens | SIM | Alta |
| data_casamento | data_casamento | SIM | Alta |
| pai_conjuge_1/2 | filiacao_pai | SIM | Media |
| mae_conjuge_1/2 | filiacao_mae | SIM | Media |
| Inferido da naturalidade | nacionalidade | SIM | Media |

**Nota importante**: Cada certidao de casamento alimenta dados de **duas pessoas** (conjuge 1 e conjuge 2), que serao correlacionadas com outros documentos pelo CPF ou nome.

### 3.2 Campos que Alimentam "Pessoa Juridica"

A Certidao de Casamento **nao alimenta** diretamente campos de Pessoa Juridica.

### 3.3 Campos que Alimentam "Dados do Imovel"

A Certidao de Casamento **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Observacao |
|-----------------|---------------|-------------------|------------|
| nome_conjuge_1 ou nome_conjuge_2 | alienante_conjuge | SIM | Usado quando o alienante e casado |

**Nota critica**: O nome do conjuge do alienante e extraido para que o conjuge compareca na escritura quando necessario. Nos regimes de **comunhao parcial** ou **comunhao universal de bens**, o conjuge DEVE anuir na venda de imovel adquirido na constancia do casamento.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| matricula | Referencia de registro | Identificador do cartorio, nao usado em minutas |
| livro | Referencia de registro | Localizacao no acervo do cartorio |
| folha | Referencia de registro | Localizacao no acervo do cartorio |
| termo | Referencia de registro | Numero do termo de casamento |
| pacto_antenupcial | Dado informativo | Apenas indica existencia, dados do pacto vem de outro documento |
| nome_pos_casamento_* | Processado internamente | Usa-se o nome atual na minuta |
| cartorio | Referencia | Identificacao da origem |
| selo_digital | Metadado de autenticacao | Validacao do documento |
| averbacoes (array completo) | Processado para determinar estado_civil | Os dados sao transformados em campos simples |

---

## 4. EXEMPLO DE EXTRACAO REAL

### Exemplo 1: Casamento Vigente com Conversao de Uniao Estavel

```json
{
  "tipo_documento": "CERTIDAO_CASAMENTO",
  "dados_catalogados": {
    "tipo_certidao": "CASAMENTO",
    "cartorio": "Oficial de Registro Civil das Pessoas Naturais do 9o Subdistrito - Vila Mariana",
    "livro": "B-0081",
    "folha": "014",
    "termo": "14106",
    "matricula": "122044 01 55 2022 2 00081 014 0014106-44",
    "data_casamento": "21/02/2022",
    "local_casamento": "Sao Paulo - SP",
    "regime_bens": "COMUNHAO PARCIAL DE BENS",
    "pacto_antenupcial": {
      "existe": false,
      "cartorio": null,
      "livro": null,
      "folhas": null,
      "data": null
    },
    "conjuge1": {
      "nome_completo": "RODOLFO WOLFGANG ORTRIWANO",
      "nome_solteiro": null,
      "nome_casado": null,
      "houve_alteracao_nome": false,
      "cpf": "585.096.668-49",
      "data_nascimento": "23/03/1953",
      "naturalidade": "Sao Paulo - SP",
      "filiacao": {
        "pai": "WASSILI ORTRIWANO",
        "mae": "MARIA ORTRIWANO"
      }
    },
    "conjuge2": {
      "nome_completo": "ELIZETE APARECIDA SILVA",
      "nome_solteiro": null,
      "nome_casado": null,
      "houve_alteracao_nome": false,
      "cpf": "949.735.638-20",
      "data_nascimento": "22/07/1957",
      "naturalidade": "Sao Paulo - SP",
      "filiacao": {
        "pai": "ANTENOR ROMAO DA SILVA",
        "mae": "ELZA MAGALHAES SILVA"
      }
    },
    "averbacoes": [
      {
        "tipo": "CONVERSAO UNIAO ESTAVEL",
        "data": "21/02/2022",
        "data_transito_julgado": null,
        "processo": null,
        "vara": null,
        "juiz": null,
        "descricao": "Conversao de Uniao estavel em casamento Art. 8o da Lei Federal no 9278 de 10.05.1996"
      }
    ],
    "conversao_uniao_estavel": {
      "ocorreu": true,
      "base_legal": "Art. 8o da Lei Federal no 9278 de 10.05.1996",
      "data_inicio_uniao": null
    },
    "situacao_atual_vinculo": "CASADOS",
    "data_emissao_certidao": "21/02/2022",
    "responsaveis": {
      "oficial": "Joao Baptista Martelletto",
      "escrevente": "Naima Oliveira Santos"
    },
    "selo_digital": "1220442PV0000000295250221"
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/029_CERTIDAO_CASAMENTO.json`

### Exemplo 2: Casamento com Averbacao de Separacao e Divorcio

```json
{
  "tipo_documento": "CERTIDAO_CASAMENTO",
  "dados_catalogados": {
    "tipo_certidao": "CASAMENTO",
    "cartorio": "Oficial de Registro Civil das Pessoas Naturais do 13o Subdistrito - Santa Cecilia",
    "livro": "0003",
    "folha": "050",
    "termo": "0000533",
    "matricula": "11555301551987100003050000053331",
    "data_casamento": null,
    "local_casamento": "Sao Paulo - SP",
    "regime_bens": null,
    "conjuge1": {
      "nome_completo": "RODOLFO WOLFGANG ORTRIWANO",
      "nome_solteiro": null,
      "nome_casado": null,
      "houve_alteracao_nome": false,
      "cpf": null,
      "data_nascimento": null,
      "naturalidade": null,
      "filiacao": {
        "pai": null,
        "mae": null
      }
    },
    "conjuge2": {
      "nome_completo": "RAQUEL TINEL STEIN",
      "nome_solteiro": "RAQUEL TINEL STEIN",
      "nome_casado": "RAQUEL STEIN ORTRIWANO",
      "houve_alteracao_nome": true,
      "cpf": null,
      "data_nascimento": null,
      "naturalidade": null,
      "filiacao": {
        "pai": null,
        "mae": null
      }
    },
    "averbacoes": [
      {
        "tipo": "SEPARACAO CONSENSUAL",
        "data": "14/10/1982",
        "data_transito_julgado": "23/09/1982",
        "processo": "1844/82",
        "vara": "2a Vara da Familia e das Sucessoes desta Capital",
        "juiz": "Dr. Francisco Roberto Alves Bevilacqua",
        "descricao": "Homologada a Separacao Consensual dos conjuges requerentes por sentenca de 08/09/1982. A mulher volta a assinar o nome de solteira: RAQUEL TINEL STEIN."
      },
      {
        "tipo": "DIVORCIO CONSENSUAL",
        "data": "10/03/1986",
        "data_transito_julgado": "13/02/1986",
        "processo": "0009/86",
        "vara": "2a Vara da Familia e das Sucessoes desta Capital",
        "juiz": "Dr. Guilherme Goncalves Strenger",
        "descricao": "Conversao da Separacao Consensual em Divorcio por sentenca de 20/01/1986. A mulher mantem o nome de solteira: RAQUEL TINEL STEIN."
      }
    ],
    "situacao_atual_vinculo": "DIVORCIADOS",
    "data_emissao_certidao": "29/06/2018",
    "responsaveis": {
      "oficial": null,
      "escrevente": "ELDA GOUVEIA DA SILVA"
    },
    "selo_digital": null
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/037_CERTIDAO_CASAMENTO.json`

### Exemplo 3: Casamento Antigo com Alteracao de Nome

```json
{
  "tipo_documento": "CERTIDAO_CASAMENTO",
  "dados_catalogados": {
    "tipo_certidao": "CASAMENTO",
    "cartorio": "14.o SUBDISTRITO - LAPA - MUNICIPIO E COMARCA DA CAPITAL - SAO PAULO",
    "livro": "B-117",
    "folha": "216",
    "termo": "37661",
    "matricula": null,
    "data_casamento": "13/03/1975",
    "local_casamento": "Sao Paulo - SP",
    "regime_bens": "COMUNHAO UNIVERSAL DE BENS",
    "conjuge1": {
      "nome_completo": "MILTON PEREIRA DA SILVA",
      "nome_solteiro": null,
      "nome_casado": null,
      "houve_alteracao_nome": false,
      "cpf": null,
      "data_nascimento": "10/11/1947",
      "naturalidade": "Xique-Xique - BA",
      "filiacao": {
        "pai": "BARTHOLOMEU PEREIRA DA SILVA",
        "mae": "JOVENTINA NEVES DE MIRANDA"
      }
    },
    "conjuge2": {
      "nome_completo": "MARIA CRISTINA FAEDO DA SILVA",
      "nome_solteiro": "MARIA CRISTINA FAEDO",
      "nome_casado": "MARIA CRISTINA FAEDO DA SILVA",
      "houve_alteracao_nome": true,
      "cpf": null,
      "data_nascimento": "06/01/1957",
      "naturalidade": "Sao Paulo - SP",
      "filiacao": {
        "pai": "CARLOS FAEDO",
        "mae": "MARIA LEITE FAEDO"
      }
    },
    "averbacoes": [],
    "situacao_atual_vinculo": "CASADOS",
    "data_emissao_certidao": "13/03/1989",
    "responsaveis": {
      "oficial": "MANUEL CARLOS ALVES DE SIQUEIRA",
      "escrevente": "WALDECIR SARUINHA"
    },
    "selo_digital": null
  }
}
```

**Fonte**: `.tmp/contextual/GS_357_11_p281773/016_CERTIDAO_CASAMENTO.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf_conjuge_1/2 | RG, CNH, CNDT, CND_FEDERAL, MATRICULA_IMOVEL | Identificador unico - correlacao principal |
| nome_conjuge_1/2 | Todos os documentos de pessoa | Match por nome (fuzzy matching) |
| data_nascimento_conjuge_1/2 | RG, CNH, CERTIDAO_NASCIMENTO | Validar identidade da pessoa |
| filiacao (pai/mae) | RG, CERTIDAO_NASCIMENTO | Confirmar identidade |
| naturalidade | RG, CERTIDAO_NASCIMENTO | Validacao cruzada |
| estado_civil | MATRICULA_IMOVEL, ESCRITURA | Consistencia do estado civil |
| regime_bens | ESCRITURA, MATRICULA_IMOVEL | Verificar compatibilidade |

### 5.2 Redundancia Intencional

A Certidao de Casamento e a **UNICA fonte confiavel** e autoritativa para:

| Dado | Por que e autoritativo | Outras fontes (secundarias) |
|------|----------------------|---------------------------|
| Estado civil atualizado | Inclui averbacoes oficiais | RG (pode estar desatualizado) |
| Regime de bens | Registro oficial no termo | Matricula (pode estar incompleta) |
| Data do casamento | Fonte primaria | Matricula de imovel |
| Nome do conjuge | Com possivel alteracao | RG do conjuge |
| Situacao do vinculo | Averbacoes de separacao/divorcio | Nenhuma outra fonte |

### 5.3 Hierarquia de Fontes para Dados de Estado Civil

1. **CERTIDAO_CASAMENTO** - Fonte primaria e autoritativa
2. **CERTIDAO_OBITO** - Para verificar viuvez
3. **MATRICULA_IMOVEL** - Dados historicos na aquisicao
4. **RG** - Estado civil declarado (pode estar desatualizado)

### 5.4 Implicacoes para Minutas

| Regime de Bens | Imovel na Constancia do Casamento | Acao Necessaria |
|---------------|-----------------------------------|-----------------|
| COMUNHAO PARCIAL DE BENS | SIM | Conjuge DEVE comparecer e anuir |
| COMUNHAO UNIVERSAL DE BENS | SIM ou NAO | Conjuge DEVE comparecer e anuir |
| SEPARACAO TOTAL DE BENS | NAO (imovel particular) | Conjuge NAO precisa comparecer |
| SEPARACAO OBRIGATORIA DE BENS | NAO (imovel particular) | Conjuge NAO precisa comparecer |
| PARTICIPACAO FINAL NOS AQUESTOS | Depende da analise | Avaliacao caso a caso |

**Regra pratica**: Se o alienante e casado sob regime de comunhao (parcial ou universal), o conjuge DEVE comparecer na escritura de venda de imovel, independentemente de o imovel estar ou nao em nome de ambos.

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| data_casamento_valida | Data no passado e razoavel | Logica |
| regime_bens_valido | Regime e um dos 5 tipos validos | Enumeracao |
| matricula_formato_valido | Matricula segue padrao de 32 digitos | Estrutural |
| data_nascimento_anterior_casamento | Conjuges nasceram antes do casamento | Logica |
| averbacao_posterior_casamento | Averbacoes sao apos data do casamento | Logica |

### 6.2 Validacoes de Negocio

| Validacao | Regra | Acao se Violada |
|-----------|-------|-----------------|
| Se ha averbacao de DIVORCIO | estado_civil deve ser "divorciado" | Corrigir estado_civil |
| Se ha averbacao de SEPARACAO (sem divorcio) | estado_civil deve ser "separado judicialmente" | Corrigir estado_civil |
| Se ha averbacao de OBITO | estado_civil do sobrevivente e "viuvo/a" | Marcar data_falecimento_conjuge |
| Se regime e SEPARACAO OBRIGATORIA | Verificar idade dos conjuges ou outras causas | Alertar para verificacao |
| Se pacto_antenupcial = true | Regime deve ser diferente do legal | Validar consistencia |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao muito antiga (> 30 anos) sem atualizacao recente
- CPF ausente em certidao pos-2010
- Averbacao de divorcio mas alienante qualificado como "casado"
- Regime de bens incompativel com epoca do casamento (ex: comunhao parcial antes de 1977)
- Filiacao incompleta (apenas mae ou apenas pai)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Origem | Logica |
|-----------------|--------|--------|
| estado_civil | averbacoes[] | Sem averbacao = "casado"; DIVORCIO = "divorciado"; SEPARACAO = "separado"; OBITO = "viuvo" |
| nome_atual | nome_pos_casamento ou nome_original | Se houve alteracao, usa nome_pos_casamento |
| situacao_vinculo | averbacoes[] | CASADOS, SEPARADOS, DIVORCIADOS, VIUVO(A) |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| nacionalidade | Inferida como "brasileiro/a" se naturalidade e brasileira | Assume nacionalidade brasileira para nascidos no Brasil |
| sexo_conjuge | Inferido do nome e posicao | Usado para flexao de genero (viuvo/viuva) |
| idade_casamento | Calculada de data_nascimento e data_casamento | Para validacao de menoridade |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| pacto_antenupcial | ~5% | Apenas em regimes especiais ou separacao de bens |
| alteracao_regime_bens | < 1% | Requer autorizacao judicial (art. 1.639 CC) |
| conversao_uniao_estavel | ~10% | Casamentos por conversao (Lei 9.278/96) |
| nome_pos_casamento_conjuge_1 | ~5% | Homens raramente alteram nome |
| nome_pos_casamento_conjuge_2 | ~60% | Mulheres frequentemente adotam sobrenome do conjuge |

### 7.4 Regimes de Bens Validos

| Regime | Descricao | Padrao Legal |
|--------|-----------|--------------|
| COMUNHAO PARCIAL DE BENS | Bens adquiridos na constancia se comunicam | Padrao apos 26/12/1977 (Lei 6.515/77) |
| COMUNHAO UNIVERSAL DE BENS | Todos os bens se comunicam | Padrao antes de 1977 |
| SEPARACAO TOTAL DE BENS | Bens nao se comunicam (por pacto) | Requer pacto antenupcial |
| SEPARACAO OBRIGATORIA DE BENS | Bens nao se comunicam (por lei) | Maiores de 70 anos, causas do art. 1.641 CC |
| PARTICIPACAO FINAL NOS AQUESTOS | Regime misto | Pouco comum, requer pacto |

### 7.5 Evolucao Historica dos Regimes

| Periodo | Regime Padrao (sem pacto) | Observacao |
|---------|--------------------------|------------|
| Ate 26/12/1977 | COMUNHAO UNIVERSAL | Codigo Civil de 1916 |
| Apos 26/12/1977 | COMUNHAO PARCIAL | Lei do Divorcio (6.515/77) |
| Apos 11/01/2003 | COMUNHAO PARCIAL | Codigo Civil de 2002 (manteve) |

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/certidao_casamento.json`
- **Prompt de Extracao**: `execution/prompts/certidao_casamento.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Guia de Campos Negocio Juridico**: `Guia-de-campos-e-variaveis/campos-negocio-juridico.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
