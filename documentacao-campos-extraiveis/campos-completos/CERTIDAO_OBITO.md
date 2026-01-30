# CERTIDAO_OBITO - Certidao de Registro de Obito

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: Nao possui schema dedicado (extracao generica)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Certidao de Obito e um documento oficial emitido pelo Cartorio de Registro Civil das Pessoas Naturais que comprova o falecimento de uma pessoa. E um documento essencial em diversas situacoes juridicas, especialmente:

- **Inventarios e sucessoes**: Documento indispensavel para abertura de inventario e transmissao de bens
- **Regularizacao de imoveis**: Necessario para transferencia de propriedade por heranca
- **Alteracao de estado civil**: Comprova a viuvez do conjuge sobrevivente
- **Encerramento de obrigacoes**: Extincao de dividas, contratos e obrigacoes personalissimas
- **Beneficios previdenciarios**: Pensao por morte, seguro de vida, FGTS

O documento e essencial para:
- Abertura de inventario judicial ou extrajudicial
- Lavratura de escritura de inventario em cartorio
- Habilitacao de herdeiros para transmissao de imoveis
- Atualizacao de matricula de imovel com averbacao de obito
- Comprovacao de viuvez para novo casamento ou uniao estavel

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos de Certidao de Obito atraves dos seguintes padroes textuais:

- `CERTIDAO DE OBITO`
- `REGISTRO DE OBITO`
- `FALECIMENTO`
- `ATESTADO DE OBITO`
- `DECLARACAO DE OBITO`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Modelo Antigo (Livro/Folha/Termo)** | Certidoes anteriores a 2010 | Sem matricula nacional, dados manuscritos ou datilografados |
| **Modelo Novo (Matricula Nacional)** | Certidoes pos-2010, padronizadas | Matricula de 32 digitos, selo digital, QR Code |
| **Inteiro Teor** | Transcricao completa do assento de obito | Todos os campos incluindo causa mortis, declarante, testemunhas |
| **Breve Relato** | Versao resumida com dados essenciais | Nome, data obito, local, dados do registro |
| **Certidao Digital** | Emitida eletronicamente | Matricula, QR Code de validacao, assinatura digital |
| **2a Via / Atualizada** | Emitida posteriormente ao registro | Pode conter averbacoes de retificacao |

### 1.4 Diferenca Entre Modelos Antigo e Novo

#### Modelo Antigo (antes de 01/01/2010)

As certidoes emitidas antes de 2010 utilizam o sistema de **Livro/Folha/Termo** para identificacao:

- **Livro**: Volume fisico onde o registro foi lavrado (ex: "C-50", "D-12")
- **Folha**: Pagina do livro, podendo incluir verso (ex: "123", "45v")
- **Termo**: Numero sequencial do registro (ex: "5678")

Este sistema e local ao cartorio, nao sendo unico nacionalmente.

#### Modelo Novo (apos 01/01/2010)

As certidoes emitidas apos 2010 utilizam a **Matricula Nacional** de 32 digitos:

```
XXXXXX XX XX XXXX X XXXXX XXX XXXXXXX-XX
 |      |  |   |   |   |    |     |     |
 |      |  |   |   |   |    |     |     +-- Digitos verificadores
 |      |  |   |   |   |    |     +-------- Numero do termo
 |      |  |   |   |   |    +-------------- Numero da folha
 |      |  |   |   |   +------------------- Numero do livro
 |      |  |   |   +----------------------- Tipo de assento (3=obito)
 |      |  |   +--------------------------- Ano do registro
 |      |  +------------------------------- Codigo do servico (CRC-codigo)
 |      +---------------------------------- Codigo do municipio (IBGE)
 +----------------------------------------- Codigo da serventia (CNS)
```

A matricula nacional e **unica em todo o territorio brasileiro**.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos de Identificacao do Registro

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Regex | Confianca |
|-------|------|-------------|-----------|---------|-------|-----------|
| matricula | string | Nao | Matricula nacional (certidoes novas, 32 digitos) | "122044 01 55 2020 3 00050 123 0005678-90" | `\d{6}\s?\d{2}\s?\d{2}\s?\d{4}\s?\d\s?\d{5}\s?\d{3}\s?\d{7}-\d{2}` | Alta |
| livro | string | Nao | Numero do livro de registro | "C-50" | `[A-Z]?-?\d{1,5}` | Alta |
| folha | string | Nao | Numero da folha (v = verso) | "123", "45v" | `\d{1,4}v?` | Alta |
| termo | string | Nao | Numero do termo | "5678" | `\d{1,6}` | Alta |

**Nota**: Certidoes antigas (pre-2010) terao livro/folha/termo. Certidoes novas (pos-2010) terao matricula (mas podem tambem manter livro/folha/termo como referencia complementar).

### 2.2 Campos do Falecido (Obrigatorios)

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Regex | Confianca |
|-------|------|-------------|-----------|---------|-------|-----------|
| nome_falecido | string | SIM | Nome completo do falecido | "JOSE ANTONIO DA SILVA" | `[A-Z][A-Za-z\s]+` | Alta |
| data_obito | date | SIM | Data do obito | "2020-05-15" | `\d{4}-\d{2}-\d{2}` | Alta |

### 2.3 Campos do Falecido (Opcionais)

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-------------|-----------|---------|-----------------|-----------|
| cpf_falecido | string | Nao | CPF do falecido | "123.456.789-00" | Certidoes recentes | Alta |
| rg_falecido | string | Nao | RG do falecido | "12.345.678-9" | Frequentemente presente | Media |
| data_nascimento | date | Nao | Data de nascimento do falecido | "1950-03-10" | Geralmente presente | Media |
| hora_obito | string | Nao | Hora do obito | "14:30" | Frequentemente presente | Media |
| local_obito | string | Nao | Local do falecimento | "Hospital das Clinicas - Sao Paulo/SP" | Sempre presente | Media |
| causa_mortis | string | Nao | Causa da morte (CID ou descritiva) | "INFARTO AGUDO DO MIOCARDIO" | Inteiro teor | Baixa |
| estado_civil | string | Nao | Estado civil do falecido | "CASADO" | Geralmente presente | Media |
| profissao | string | Nao | Profissao do falecido | "ENGENHEIRO" | Frequentemente presente | Media |
| nacionalidade | string | Nao | Nacionalidade | "BRASILEIRO" | Frequentemente presente | Media |
| naturalidade | string | Nao | Local de nascimento | "Sao Paulo - SP" | Frequentemente presente | Media |
| idade | string | Nao | Idade ao falecer | "70 anos" | Geralmente presente | Media |
| sexo | string | Nao | Sexo do falecido | "MASCULINO" | Geralmente presente | Media |

### 2.4 Campos de Filiacao

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| filiacao_pai | string | Nao | Nome do pai do falecido | "ANTONIO CARLOS DA SILVA" | Media |
| filiacao_mae | string | Nao | Nome da mae do falecido | "MARIA JOSE DA SILVA" | Media |

### 2.5 Campos do Conjuge

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| conjuge | string | Nao | Nome do conjuge (se casado/viuvo) | "ANA MARIA DA SILVA" | Media |
| regime_bens | string | Nao | Regime de bens do casamento | "COMUNHAO PARCIAL DE BENS" | Baixa |

### 2.6 Campos do Cartorio

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| cartorio | string | Nao | Nome do cartorio de registro | "Oficial de Registro Civil do 1o Subdistrito" | Media |
| municipio_cartorio | string | Nao | Municipio do cartorio | "Sao Paulo" | Media |
| estado_cartorio | string | Nao | Estado do cartorio | "SP" | Media |
| data_registro | date | Nao | Data do registro do obito | "2020-05-16" | Media |
| data_emissao | date | Nao | Data de emissao da certidao | "2020-05-20" | Media |
| selo_digital | string | Nao | Codigo do selo digital | "1220443OB0000012345" | Alta |

### 2.7 Campos Adicionais (Inteiro Teor)

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| declarante | string | Nao | Nome de quem declarou o obito | "PEDRO DA SILVA (filho)" | Baixa |
| medico_atestante | string | Nao | Nome do medico que atestou | "Dr. Carlos Ferreira - CRM 12345" | Baixa |
| cemiterio | string | Nao | Local de sepultamento | "Cemiterio da Consolacao" | Baixa |
| data_sepultamento | date | Nao | Data do sepultamento | "2020-05-16" | Baixa |

---

## 3. MAPEAMENTO SCHEMA -> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural" (7 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_falecido | nome | SIM | Alta |
| cpf_falecido | cpf | SIM | Alta |
| rg_falecido | rg | SIM | Media |
| data_nascimento | data_nascimento | SIM | Media |
| data_obito | data_obito | SIM | Alta |
| estado_civil | estado_civil | SIM | Media |
| filiacao_pai | filiacao_pai | SIM | Media |
| filiacao_mae | filiacao_mae | SIM | Media |

**Nota especial**: O campo `data_obito` e usado para:
1. Determinar que a pessoa esta falecida
2. Alterar estado civil do conjuge para "viuvo/a"
3. Definir marco temporal para abertura de inventario (ate 60 dias apos obito para inventario extrajudicial com desconto de ITCMD em SP)

### 3.2 Campos que Alimentam "Pessoa Juridica"

A Certidao de Obito **nao alimenta** diretamente campos de Pessoa Juridica.

### 3.3 Campos que Alimentam "Dados do Imovel"

A Certidao de Obito **nao alimenta** diretamente campos de Imovel, mas e essencial para:
- Averbacao de obito na matricula do imovel
- Abertura da sucessao para transmissao de propriedade

### 3.4 Campos que Alimentam "Negocio Juridico"

A Certidao de Obito **nao alimenta** diretamente campos de Negocio Juridico, mas:
- Determina a necessidade de inventario antes da venda de imovel
- Identifica herdeiros que deverao comparecer na escritura

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| matricula | Referencia de registro | Identificador do cartorio |
| livro | Referencia de registro | Localizacao no acervo |
| folha | Referencia de registro | Localizacao no acervo |
| termo | Referencia de registro | Numero sequencial |
| hora_obito | Dado complementar | Nao usado em minutas |
| causa_mortis | Dado medico | Informacao sensivel, nao usada em minutas |
| local_obito | Dado complementar | Informacao do falecimento |
| declarante | Dado administrativo | Quem fez a declaracao |
| medico_atestante | Dado medico | Informacao do atestado |
| cemiterio | Dado de sepultamento | Nao usado em minutas |
| data_sepultamento | Dado de sepultamento | Nao usado em minutas |
| cartorio | Referencia de origem | Identificacao da fonte |

---

## 4. EXEMPLO DE EXTRACAO REAL

### Exemplo 1: Certidao de Obito Padrao

```json
{
  "tipo_documento": "CERTIDAO_OBITO",
  "dados_catalogados": {
    "tipo_certidao": "OBITO",
    "matricula": "122044 01 55 2020 3 00050 123 0005678-90",
    "livro": "C-50",
    "folha": "123",
    "termo": "5678",
    "falecido": {
      "nome_completo": "JOSE ANTONIO DA SILVA",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "data_nascimento": "1950-03-10",
      "sexo": "MASCULINO",
      "estado_civil": "CASADO",
      "profissao": "ENGENHEIRO",
      "nacionalidade": "BRASILEIRO",
      "naturalidade": "Sao Paulo - SP"
    },
    "filiacao": {
      "pai": "ANTONIO CARLOS DA SILVA",
      "mae": "MARIA JOSE DA SILVA"
    },
    "conjuge": {
      "nome": "ANA MARIA DA SILVA",
      "regime_bens": "COMUNHAO PARCIAL DE BENS"
    },
    "obito": {
      "data": "2020-05-15",
      "hora": "14:30",
      "local": "Hospital das Clinicas - Sao Paulo/SP",
      "causa_mortis": "INFARTO AGUDO DO MIOCARDIO",
      "idade": "70 anos"
    },
    "cartorio": {
      "nome": "Oficial de Registro Civil das Pessoas Naturais do 1o Subdistrito",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "registro": {
      "data_registro": "2020-05-16",
      "data_emissao": "2020-05-20"
    },
    "selo_digital": "1220443OB0000012345"
  }
}
```

### Exemplo 2: Certidao de Obito Modelo Antigo

```json
{
  "tipo_documento": "CERTIDAO_OBITO",
  "dados_catalogados": {
    "tipo_certidao": "OBITO",
    "livro": "D-25",
    "folha": "089v",
    "termo": "2345",
    "falecido": {
      "nome_completo": "MARIA APARECIDA FERREIRA",
      "data_nascimento": "1935-08-20",
      "sexo": "FEMININO",
      "estado_civil": "VIUVA",
      "profissao": "DO LAR",
      "nacionalidade": "BRASILEIRA",
      "naturalidade": "Belo Horizonte - MG"
    },
    "filiacao": {
      "pai": "JOAQUIM FERREIRA",
      "mae": "ROSA FERREIRA"
    },
    "obito": {
      "data": "1998-11-10",
      "local": "Residencia - Rua das Flores, 100 - Sao Paulo/SP",
      "idade": "63 anos"
    },
    "cartorio": {
      "nome": "Cartorio do Registro Civil do 5o Subdistrito - Lapa",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "registro": {
      "data_registro": "1998-11-11"
    }
  },
  "observacoes": [
    "Certidao modelo antigo (pre-2010)",
    "Sem matricula nacional",
    "Folha verso (089v)"
  ]
}
```

### Exemplo 3: Certidao de Obito para Inventario

```json
{
  "tipo_documento": "CERTIDAO_OBITO",
  "dados_catalogados": {
    "tipo_certidao": "OBITO",
    "matricula": "122044 01 55 2023 3 00080 045 0012345-67",
    "falecido": {
      "nome_completo": "CARLOS EDUARDO SANTOS",
      "cpf": "987.654.321-00",
      "rg": "23.456.789-X",
      "data_nascimento": "1955-12-05",
      "sexo": "MASCULINO",
      "estado_civil": "CASADO",
      "regime_bens": "COMUNHAO UNIVERSAL DE BENS",
      "profissao": "COMERCIANTE"
    },
    "conjuge": {
      "nome": "HELENA SANTOS",
      "cpf": "111.222.333-44"
    },
    "obito": {
      "data": "2023-09-20",
      "hora": "08:15",
      "local": "Hospital Sirio Libanes - Sao Paulo/SP"
    },
    "cartorio": {
      "nome": "Oficial de Registro Civil do 15o Subdistrito - Perdizes",
      "cidade": "Sao Paulo",
      "estado": "SP"
    }
  },
  "uso_em_inventario": {
    "prazo_inventario_extrajudicial": "60 dias para desconto ITCMD",
    "data_limite_desconto": "2023-11-19",
    "conjuge_sobrevivente": "HELENA SANTOS - agora viuva",
    "regime_bens_implicacao": "Meacao automatica - 50% do patrimonio"
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| nome_falecido | RG, CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL | Match por nome (fuzzy matching) |
| cpf_falecido | RG, CNH, CNDT, CND_FEDERAL | Identificador unico - correlacao principal |
| data_nascimento | RG, CNH, CERTIDAO_NASCIMENTO | Validar identidade da pessoa |
| filiacao (pai/mae) | RG, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO | Confirmar identidade |
| estado_civil | CERTIDAO_CASAMENTO, MATRICULA_IMOVEL | Verificar consistencia |

### 5.2 Correlacao com CERTIDAO_NASCIMENTO

A Certidao de Obito contem dados que devem corresponder a Certidao de Nascimento do falecido:

| Dado na Certidao Obito | Correlacao com Certidao Nascimento |
|------------------------|-----------------------------------|
| nome_falecido | Deve corresponder a nome_registrado |
| data_nascimento | Deve ser identica |
| filiacao_pai | Deve corresponder a nome_pai |
| filiacao_mae | Deve corresponder a nome_mae |
| naturalidade | Deve corresponder a local_nascimento |

### 5.3 Correlacao com CERTIDAO_CASAMENTO

A Certidao de Obito complementa a Certidao de Casamento:

| Dado na Certidao Obito | Implicacao para Certidao Casamento |
|------------------------|-----------------------------------|
| data_obito | Averbacao de obito na certidao de casamento |
| conjuge | Deve corresponder a nome_conjuge_1 ou nome_conjuge_2 |
| estado_civil "CASADO" | Confirma vinculo matrimonial vigente |
| estado_civil "VIUVO" | Indica casamento anterior encerrado por obito |

### 5.4 Implicacao para o Conjuge Sobrevivente

Quando o falecido era casado, a Certidao de Obito afeta diretamente o conjuge:

| Regime de Bens | Implicacao para Conjuge | Heranca |
|---------------|------------------------|---------|
| COMUNHAO PARCIAL | Meacao dos bens comuns + heranca | Herda com descendentes ou ascendentes |
| COMUNHAO UNIVERSAL | Meacao de todo patrimonio + heranca | Herda com descendentes ou ascendentes |
| SEPARACAO TOTAL | Sem meacao, apenas heranca | Herda concorrendo com herdeiros |
| SEPARACAO OBRIGATORIA | Sem meacao, apenas heranca | Herda concorrendo (Sumula 377 STF) |

### 5.5 Hierarquia de Fontes para Estado Civil

1. **CERTIDAO_OBITO** - Fonte autoritativa para falecimento e viuvez
2. **CERTIDAO_CASAMENTO** - Com averbacao de obito atualiza estado civil
3. **MATRICULA_IMOVEL** - Pode conter averbacao de obito do proprietario
4. **RG** - Estado civil declarado (pode estar desatualizado)

### 5.6 Redundancia Intencional

A Certidao de Obito e a **UNICA fonte autoritativa** para:

| Dado | Por que e autoritativo | Outras fontes (secundarias) |
|------|----------------------|---------------------------|
| Data do obito | Registro oficial | Nenhuma |
| Causa mortis | Atestado medico oficial | Nenhuma |
| Estado civil ao falecer | Registro oficial | Certidao casamento (complementar) |
| Viuvez do conjuge | Comprova viuvez | Certidao casamento (com averbacao) |

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| data_obito_valida | Data no passado e posterior ao nascimento | Logica |
| data_nascimento_anterior_obito | Pessoa nasceu antes de falecer | Logica |
| idade_coerente | Idade informada confere com datas | Logica |
| matricula_formato_valido | Matricula segue padrao de 32 digitos | Estrutural |
| nome_completo_minimo | Nome tem pelo menos 2 palavras | Estrutural |

### 6.2 Validacoes de Negocio

| Validacao | Regra | Acao se Violada |
|-----------|-------|-----------------|
| Prazo inventario | Se obito < 60 dias, alertar sobre desconto ITCMD (SP) | Informar urgencia |
| Conjuge identificado | Se casado, conjuge deve estar identificado | Alertar para verificacao |
| Estado civil consistente | Se "casado" mas sem conjuge | Alertar inconsistencia |
| CPF obrigatorio | Certidoes recentes devem ter CPF | Alertar para complementacao |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao muito antiga (> 30 anos) sem atualizacao
- CPF ausente em certidao pos-2010
- Filiacao incompleta (apenas mae ou apenas pai)
- Estado civil "casado" sem nome do conjuge
- Divergencia entre dados da certidao e dados de outros documentos
- Prazo de inventario proximo do vencimento

### 6.4 Validacoes Cruzadas

| Validacao | Documentos Envolvidos | Regra |
|-----------|----------------------|-------|
| Nome consistente | CERTIDAO_OBITO x RG x CERTIDAO_NASCIMENTO | Nome deve corresponder |
| Data nascimento | CERTIDAO_OBITO x RG x CERTIDAO_NASCIMENTO | Datas devem ser identicas |
| Filiacao | CERTIDAO_OBITO x CERTIDAO_NASCIMENTO | Pai e mae devem corresponder |
| Conjuge | CERTIDAO_OBITO x CERTIDAO_CASAMENTO | Nomes dos conjuges devem corresponder |
| Proprietario falecido | CERTIDAO_OBITO x MATRICULA_IMOVEL | Nome do proprietario = nome do falecido |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Origem | Logica |
|-----------------|--------|--------|
| idade_obito | data_nascimento, data_obito | Calculada a partir das duas datas |
| tempo_desde_obito | data_obito | Dias desde o falecimento |
| prazo_inventario_ok | data_obito | true se ainda dentro do prazo legal |
| viuvez_conjuge | estado_civil, conjuge | Determina que conjuge e viuvo/a |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| sexo_conjuge | Inferido do nome e posicao | Usado para flexao de genero (viuvo/viuva) |
| nacionalidade | Inferida se naturalidade brasileira | Assume brasileiro se nascido no Brasil |
| uf_obito | Extraida de local_obito | Sigla do estado |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| causa_mortis | ~90% | Presente em inteiro teor, sensivel |
| hora_obito | ~80% | Geralmente presente |
| cemiterio | ~60% | Apenas em certidoes detalhadas |
| medico_atestante | ~50% | Apenas em inteiro teor |
| regime_bens | ~40% | Quando casado e regime relevante |

### 7.4 Prazos Importantes

| Prazo | Descricao | Base Legal |
|-------|-----------|------------|
| 60 dias | Prazo para inventario extrajudicial com desconto ITCMD (SP) | Lei Estadual SP |
| 2 meses | Prazo para abertura de inventario sem multa (regra geral) | CPC e leis estaduais |
| 24 horas | Prazo para registro do obito | Lei 6.015/73, art. 78 |
| 15 dias | Prazo ampliado para registro em locais distantes | Lei 6.015/73, art. 78 |

### 7.5 Implicacoes para Imoveis

| Situacao | Implicacao | Acao Necessaria |
|----------|-----------|-----------------|
| Falecido era unico proprietario | Imovel integra espólio | Inventario obrigatorio |
| Falecido era co-proprietario | Fracao ideal integra espólio | Inventario da fracao |
| Imovel em comunhao de bens | 50% e meacao do conjuge | Inventario de 50% |
| Imovel com clausula de inalienabilidade | Verifica se extingue com obito | Analise juridica |

### 7.6 Tipos de Obito

| Tipo | Descricao | Particularidades |
|------|-----------|------------------|
| Natural | Morte por causas naturais | Registro normal |
| Acidental | Morte por acidente | Pode requerer documentacao adicional |
| Violenta | Homicidio, suicidio | Requer laudo do IML |
| Presumida | Ausencia prolongada | Declaracao judicial, sem corpo |
| Morte cerebral | Para doacao de orgaos | Atestado especifico |

---

## 8. USO EM INVENTARIOS E REGULARIZACAO DE IMOVEIS

### 8.1 Inventario Extrajudicial

Para lavratura de escritura de inventario em cartorio, a Certidao de Obito e:

| Requisito | Descricao |
|-----------|-----------|
| **Documento obrigatorio** | Sem excecao, sempre exigida |
| **Prazo de emissao** | Preferencialmente atualizada (< 90 dias) |
| **Formato** | Original ou certidao digital com QR Code |
| **Informacoes essenciais** | Nome completo, data obito, estado civil |

### 8.2 Averbacao na Matricula do Imovel

Para averbar o obito na matricula do imovel:

1. **Certidao de Obito** - Original ou copia autenticada
2. **Requerimento** - Solicitacao de averbacao
3. **Documentos de identificacao** - Do requerente
4. **Pagamento de emolumentos** - Custas do cartorio

### 8.3 Transmissao de Propriedade por Heranca

Documentos necessarios alem da Certidao de Obito:

| Documento | Finalidade |
|-----------|-----------|
| Formal de partilha ou escritura de inventario | Titulo de transmissao |
| Certidao de casamento atualizada | Comprovar estado civil e regime de bens |
| Documentos dos herdeiros | Qualificacao completa |
| Guia de ITCMD paga | Imposto de transmissao causa mortis |

---

## 9. REFERENCIAS

- **Schema JSON**: Nao possui schema dedicado
- **Prompt de Extracao**: Extracao generica
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`
- **Lei 6.015/1973**: Lei de Registros Publicos
- **Provimento CNJ 63/2017**: Regulamenta a matricula nacional das certidoes
- **Codigo Civil**: Arts. 6 a 10 (morte), arts. 1.784 a 1.856 (sucessoes)
- **Resolucao CNJ 35/2007**: Inventario extrajudicial

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
