# CERTIDAO_NASCIMENTO - Certidao de Registro de Nascimento

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: `execution/schemas/certidao_nascimento.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Certidao de Nascimento e o primeiro documento oficial de identificacao civil de uma pessoa, emitido pelo Cartorio de Registro Civil das Pessoas Naturais. E o documento fundante de toda a cadeia documental de um individuo, sendo a fonte primaria e autoritativa para:

- **Nome completo oficial** da pessoa (conforme registrado no assento de nascimento)
- **Data e local de nascimento** exatos e oficiais
- **Filiacao completa** (pai, mae e avos)
- **Nacionalidade** (brasileira nata, naturalizada ou estrangeira)
- **Identificacao do cartorio** onde o registro foi lavrado

O documento e essencial para:
- Obtencao de RG, CPF e demais documentos de identificacao
- Comprovacao de filiacao para fins de heranca e sucessao
- Verificacao de maioridade civil
- Qualificacao de partes em escrituras publicas quando outros documentos estao incompletos
- Correlacao de dados de filiacao com outros documentos

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos de Certidao de Nascimento atraves dos seguintes padroes textuais:

- `CERTIDAO DE NASCIMENTO`
- `REGISTRO DE NASCIMENTO`
- `REGISTRO CIVIL`
- `NASCEU`
- `FILIACAO`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Modelo Antigo (Livro/Folha/Termo)** | Certidoes anteriores a 2010, identificacao por livro/folha/termo | Sem matricula nacional, dados manuscritos ou datilografados |
| **Modelo Novo (Matricula Nacional)** | Certidoes pos-2010, padronizadas nacionalmente | Matricula de 32 digitos, selo digital, QR Code |
| **Inteiro Teor** | Transcricao completa do assento de nascimento | Todos os campos incluindo avos, anotacoes e averbacoes |
| **Breve Relato** | Versao resumida com dados essenciais | Nome, data, local, filiacao direta (sem avos) |
| **Certidao Digital** | Emitida eletronicamente com selo digital | Matricula, QR Code de validacao, assinatura digital |
| **2a Via / Atualizada** | Emitida posteriormente ao registro | Pode conter averbacoes de retificacao, reconhecimento de paternidade |

### 1.4 Diferenca Entre Modelos Antigo e Novo

#### Modelo Antigo (antes de 01/01/2010)

As certidoes emitidas antes de 2010 utilizam o sistema de **Livro/Folha/Termo** para identificacao:

- **Livro**: Volume fisico onde o registro foi lavrado (ex: "A-133", "B-50")
- **Folha**: Pagina do livro, podendo incluir verso (ex: "270", "45v")
- **Termo**: Numero sequencial do registro (ex: "80631")

Este sistema e local ao cartorio, ou seja, o mesmo numero de termo pode existir em cartorios diferentes.

#### Modelo Novo (apos 01/01/2010)

As certidoes emitidas apos 2010 utilizam a **Matricula Nacional** de 32 digitos:

```
XXXXXX XX XX XXXX X XXXXX XXX XXXXXXX-XX
 |      |  |   |   |   |    |     |     |
 |      |  |   |   |   |    |     |     +-- Digitos verificadores
 |      |  |   |   |   |    |     +-------- Numero do termo
 |      |  |   |   |   |    +-------------- Numero da folha
 |      |  |   |   |   +------------------- Numero do livro
 |      |  |   |   +----------------------- Tipo de assento (1=nasc, 2=cas, 3=obit)
 |      |  |   +--------------------------- Ano do registro
 |      |  +------------------------------- Codigo do servico (CRC-codigo)
 |      +---------------------------------- Codigo do municipio (IBGE)
 +----------------------------------------- Codigo da serventia (CNS)
```

A matricula nacional e **unica em todo o territorio brasileiro**, permitindo identificar qualquer certidao sem ambiguidade.

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos de Identificacao do Registro

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Regex | Confianca |
|-------|------|-------------|-----------|---------|-------|-----------|
| matricula | string | Nao | Matricula nacional (certidoes novas, 32 digitos) | "122044 01 55 2022 1 00133 270 0080631-44" | `\d{6}\s?\d{2}\s?\d{2}\s?\d{4}\s?\d\s?\d{5}\s?\d{3}\s?\d{7}-\d{2}` | Alta |
| livro | string | Nao | Numero do livro de registro | "A-133" | `[A-Z]?-?\d{1,5}` | Alta |
| folha | string | Nao | Numero da folha (v = verso) | "270", "45v" | `\d{1,4}v?` | Alta |
| termo | string | Nao | Numero do termo | "80631" | `\d{1,6}` | Alta |

**Nota**: Certidoes antigas (pre-2010) terao livro/folha/termo. Certidoes novas (pos-2010) terao matricula (mas podem tambem manter livro/folha/termo como referencia complementar).

### 2.2 Campos do Registrado (Obrigatorios)

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Regex | Confianca |
|-------|------|-------------|-----------|---------|-------|-----------|
| nome_registrado | string | SIM | Nome completo do registrado | "MARINA AYUB" | `[A-Z][A-Za-z\s]+` | Alta |
| data_nascimento | date | SIM | Data de nascimento | "1991-09-06" | `\d{4}-\d{2}-\d{2}` | Alta |
| nome_mae | string | SIM | Nome completo da mae | "ELOISA BASILE SIQUEIRA AYUB" | `[A-Z][A-Za-z\s]+` | Alta |

### 2.3 Campos do Registrado (Opcionais)

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-------------|-----------|---------|-----------------|-----------|
| hora_nascimento | string | Nao | Hora do nascimento | "08:43" | Geralmente presente em certidoes detalhadas | Media |
| sexo | string | Nao | Sexo do registrado | "FEMININO" | Sempre presente em certidoes completas | Alta |
| local_nascimento | string | Nao | Cidade e estado de nascimento | "Sao Paulo - SP" | Sempre presente | Media |

**Regex para sexo**: `(MASCULINO|FEMININO|M|F)`

### 2.4 Campos de Filiacao

#### 2.4.1 Filiacao Direta

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| nome_pai | string | Nao | Nome completo do pai | "MUNIR AKAR AYUB" | Media |
| nome_mae | string | SIM | Nome completo da mae | "ELOISA BASILE SIQUEIRA AYUB" | Alta |

**Nota importante**: O campo `nome_pai` pode estar ausente em casos de paternidade nao reconhecida ou nao declarada. O campo `nome_mae` e sempre obrigatorio.

#### 2.4.2 Avos (Campos Opcionais)

Os campos de avos estao presentes principalmente em certidoes de **inteiro teor**:

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Frequencia |
|-------|------|-------------|-----------|---------|------------|
| avo_paterno | string | Nao | Nome do avo paterno | "AKAR ELIAS AYUB" | ~70% em inteiro teor |
| avo_paterna | string | Nao | Nome da avo paterna | "WAGIA ABID AYUB" | ~70% em inteiro teor |
| avo_materno | string | Nao | Nome do avo materno | "ARIOVALDO SIQUEIRA" | ~70% em inteiro teor |
| avo_materna | string | Nao | Nome da avo materna | "DIVA BASILE SIQUEIRA" | ~70% em inteiro teor |

**Observacao**: Os campos de avos sao particularmente uteis para:
- Confirmacao de identidade em processos de heranca
- Correlacao com certidoes de nascimento/casamento de geracoes anteriores
- Pesquisa genealogica

### 2.5 Campos do Cartorio

| Campo | Tipo | Obrigatorio | Descricao | Exemplo | Confianca |
|-------|------|-------------|-----------|---------|-----------|
| cartorio | string | Nao | Nome do cartorio de registro | "28o Subdistrito de Registro Civil - Jardim Paulista" | Media |
| municipio_cartorio | string | Nao | Municipio do cartorio | "Sao Paulo" | Media |
| data_registro | date | Nao | Data do registro | "1991-09-06" | Media |

---

## 3. MAPEAMENTO SCHEMA -> MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural" (11 campos)

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_registrado | NOME | SIM | Alta |
| data_nascimento | DATA DE NASCIMENTO | SIM | Alta |
| local_nascimento | NATURALIDADE | SIM | Media |
| sexo | SEXO | NAO (apenas referencia) | Baixa |
| nome_pai | FILIACAO PAI | SIM | Media |
| nome_mae | FILIACAO MAE | SIM | Media |
| avo_paterno | avo_paterno | NAO (dados genealogicos) | Baixa |
| avo_paterna | avo_paterna | NAO (dados genealogicos) | Baixa |
| avo_materno | avo_materno | NAO (dados genealogicos) | Baixa |
| avo_materna | avo_materna | NAO (dados genealogicos) | Baixa |
| Inferido do local | NACIONALIDADE | SIM | Media |

**Nota**: Os campos de avos, embora extraidos, nao sao tipicamente usados em minutas cartoriais, mas sao importantes para correlacao genealogica e validacao de identidade em processos sucessorios.

### 3.2 Campos que Alimentam "Pessoa Juridica"

A Certidao de Nascimento **nao alimenta** diretamente campos de Pessoa Juridica.

### 3.3 Campos que Alimentam "Dados do Imovel"

A Certidao de Nascimento **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

A Certidao de Nascimento **nao alimenta** diretamente campos de Negocio Juridico.

Os dados sao usados para:
- Qualificacao das partes quando RG esta incompleto
- Confirmacao de filiacao para fins de heranca
- Verificacao de maioridade

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| matricula | Referencia de registro | Identificador do cartorio |
| livro | Referencia de registro | Localizacao no acervo |
| folha | Referencia de registro | Localizacao no acervo |
| termo | Referencia de registro | Numero sequencial |
| hora_nascimento | Dado complementar | Nao usado em minutas |
| cartorio | Referencia de origem | Identificacao da fonte |
| municipio_cartorio | Referencia de origem | Localizacao do cartorio |
| data_registro | Metadado | Data administrativa |
| avos (todos) | Dados genealogicos | Usados apenas em correlacao e heranca |

---

## 4. EXEMPLO DE EXTRACAO REAL

### Exemplo 1: Certidao Completa com Avos

```json
{
  "tipo_documento": "CERTIDAO_NASCIMENTO",
  "dados_catalogados": {
    "tipo_certidao": "NASCIMENTO",
    "nome_completo": "MARINA AYUB",
    "data_nascimento": "1991-09-06",
    "hora_nascimento": "08:43",
    "local_nascimento": {
      "instituicao": "Hospital e Maternidade Sao Luiz",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "sexo": "FEMININO",
    "filiacao": {
      "pai": "MUNIR AKAR AYUB",
      "mae": "ELOISA BASILE SIQUEIRA AYUB"
    },
    "avos": {
      "paternos": {
        "avo": "AKAR ELIAS AYUB",
        "avoa": "WAGIA ABID AYUB"
      },
      "maternos": {
        "avo": "ARIOVALDO SIQUEIRA",
        "avoa": "DIVA BASILE SIQUEIRA"
      }
    },
    "cartorio": {
      "nome": "28o Subdistrito de Registro Civil - Jardim Paulista",
      "endereco": "Rua Comendador Miguel Calfat, 70",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "registro": {
      "livro": "133",
      "folha": "270",
      "termo": "80631",
      "data": "1991-09-06"
    }
  },
  "confianca_extracao": {
    "geral": 0.95,
    "campos_alta_confianca": ["nome_completo", "data_nascimento", "filiacao"],
    "campos_media_confianca": ["avos", "local_nascimento"]
  }
}
```

**Fonte**: Exemplo baseado em documento real processado pelo pipeline.

### Exemplo 2: Certidao Modelo Novo com Matricula Nacional

```json
{
  "tipo_documento": "CERTIDAO_NASCIMENTO",
  "dados_catalogados": {
    "tipo_certidao": "NASCIMENTO",
    "matricula": "122044 01 55 2015 1 00250 045 0012345-67",
    "nome_completo": "PEDRO HENRIQUE SANTOS OLIVEIRA",
    "data_nascimento": "2015-03-22",
    "hora_nascimento": "14:30",
    "local_nascimento": {
      "instituicao": "Hospital Albert Einstein",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "sexo": "MASCULINO",
    "filiacao": {
      "pai": "CARLOS EDUARDO OLIVEIRA",
      "mae": "ANA PAULA SANTOS OLIVEIRA"
    },
    "cartorio": {
      "nome": "Oficial de Registro Civil das Pessoas Naturais do 1o Subdistrito",
      "cidade": "Sao Paulo",
      "estado": "SP"
    },
    "registro": {
      "matricula": "122044 01 55 2015 1 00250 045 0012345-67",
      "livro": "250",
      "folha": "045",
      "termo": "12345",
      "data": "2015-03-25"
    },
    "selo_digital": "1220441SN0000012345678"
  }
}
```

### Exemplo 3: Certidao Antiga (Modelo Livro/Folha/Termo)

```json
{
  "tipo_documento": "CERTIDAO_NASCIMENTO",
  "dados_catalogados": {
    "tipo_certidao": "NASCIMENTO",
    "nome_completo": "JOSE ANTONIO FERREIRA",
    "data_nascimento": "1965-08-15",
    "local_nascimento": {
      "cidade": "Belo Horizonte",
      "estado": "MG"
    },
    "sexo": "MASCULINO",
    "filiacao": {
      "pai": "ANTONIO CARLOS FERREIRA",
      "mae": "MARIA APARECIDA FERREIRA"
    },
    "cartorio": {
      "nome": "Cartorio do Registro Civil do 2o Oficio",
      "cidade": "Belo Horizonte",
      "estado": "MG"
    },
    "registro": {
      "livro": "B-45",
      "folha": "123v",
      "termo": "4567",
      "data": "1965-08-20"
    }
  },
  "observacoes": [
    "Certidao modelo antigo (pre-2010)",
    "Sem matricula nacional",
    "Folha verso (123v)"
  ]
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| nome_registrado | RG, CNH, CERTIDAO_CASAMENTO, todos | Match por nome (fuzzy matching) |
| data_nascimento | RG, CNH, CERTIDAO_CASAMENTO | Validar identidade da pessoa |
| local_nascimento | RG (naturalidade) | Validacao cruzada |
| nome_pai | RG, CERTIDAO_CASAMENTO | Confirmar identidade |
| nome_mae | RG, CERTIDAO_CASAMENTO | Confirmar identidade (campo mais confiavel) |
| livro/folha/termo | RG (doc_origem) | Correlacionar com referencia no RG |

### 5.2 Redundancia Intencional

A Certidao de Nascimento e a **fonte primaria e autoritativa** para:

| Dado | Por que e autoritativo | Outras fontes (secundarias) |
|------|----------------------|---------------------------|
| Nome de nascimento | Registro oficial original | RG (pode ter alteracao), Certidao Casamento (pode ter alteracao de nome) |
| Data de nascimento | Fonte primaria oficial | RG, CNH (derivados) |
| Filiacao (pai/mae) | Registro oficial | RG (resumido), Certidao Casamento |
| Local de nascimento | Registro oficial | RG (naturalidade resumida) |
| Avos | Unica fonte oficial | Nenhuma outra fonte |

### 5.3 Hierarquia de Fontes para Dados de Nascimento

1. **CERTIDAO_NASCIMENTO** - Fonte primaria e autoritativa
2. **RG** - Dados derivados, geralmente resumidos
3. **CNH** - Dados derivados, apenas data e cidade
4. **CERTIDAO_CASAMENTO** - Dados de nascimento do conjuge

### 5.4 Correlacao com RG

O RG frequentemente contem uma referencia a Certidao de Nascimento no campo `doc_origem`:

```
Exemplo no RG: "SAO PAULO-SP JARDIM PAULISTA CN:LV.A133/FLSo270/No80631"
                                              |     |       |     |
                                              |     |       |     +-- Termo
                                              |     |       +-------- Folha
                                              |     +---------------- Livro
                                              +---------------------- CN = Certidao Nascimento
```

Esta referencia permite correlacionar diretamente o RG com a Certidao de Nascimento original.

### 5.5 Correlacao com Certidao de Casamento

A Certidao de Casamento contem dados de nascimento de ambos os conjuges:

| Dado na Certidao Casamento | Correlacao com Certidao Nascimento |
|---------------------------|-----------------------------------|
| data_nascimento_conjuge_1/2 | Deve ser identica a data_nascimento |
| naturalidade_conjuge_1/2 | Deve corresponder a local_nascimento |
| pai_conjuge_1/2 | Deve corresponder a nome_pai |
| mae_conjuge_1/2 | Deve corresponder a nome_mae |

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| data_nascimento_valida | Data no passado e pessoa com idade razoavel (0-130 anos) | Logica |
| data_registro_posterior_nascimento | Data do registro deve ser igual ou posterior ao nascimento | Logica |
| matricula_formato_valido | Matricula segue padrao de 32 digitos com verificadores | Estrutural |
| nome_completo_minimo | Nome tem pelo menos 2 palavras | Estrutural |
| sexo_valido | Sexo e MASCULINO, FEMININO, M ou F | Enumeracao |
| livro_folha_termo_completos | Se um esta presente, todos devem estar | Consistencia |

### 6.2 Validacoes de Negocio

| Validacao | Regra | Acao se Violada |
|-----------|-------|-----------------|
| Paternidade | Se nome_pai ausente, verificar se ha averbacao de reconhecimento | Alertar para verificacao |
| Alteracao de nome | Verificar se ha averbacao de retificacao de nome | Usar nome atualizado |
| Gemeos | Se hora_nascimento identica em mesmo cartorio | Verificar se sao registros distintos |
| Modelo antigo sem matricula | Certidoes pre-2010 sem matricula | Normal, usar livro/folha/termo |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Certidao muito antiga (> 50 anos) sem atualizacao
- Nome_mae ausente (situacao anormal)
- Data de registro muito posterior ao nascimento (> 30 dias, verificar registro tardio)
- Campos de avos incompletos (apenas alguns preenchidos)
- Divergencia entre dados da certidao e dados do RG

### 6.4 Validacoes Cruzadas

| Validacao | Documentos Envolvidos | Regra |
|-----------|----------------------|-------|
| Nome consistente | CERTIDAO_NASCIMENTO x RG | Nome no RG deve conter nome de nascimento |
| Data nascimento | CERTIDAO_NASCIMENTO x RG x CNH | Datas devem ser identicas |
| Filiacao | CERTIDAO_NASCIMENTO x RG | Mae deve ser identica, pai se presente |
| Naturalidade | CERTIDAO_NASCIMENTO x RG | Local deve corresponder |

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo Computado | Origem | Logica |
|-----------------|--------|--------|
| idade_atual | data_nascimento | Calculada a partir da data de nascimento |
| maior_idade | data_nascimento | true se idade >= 18 anos |
| nacionalidade | local_nascimento | Inferida como "brasileiro(a)" se nascido no Brasil |
| modelo_certidao | matricula ou livro | "novo" se tem matricula, "antigo" se so tem livro/folha/termo |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| nacionalidade | Inferida como "brasileiro/a nata/o" se nascido no Brasil | Pode ser alterada por averbacao |
| uf_nascimento | Extraida de local_nascimento | Sigla do estado |
| decada_nascimento | Derivada de data_nascimento | Para agrupamentos estatisticos |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| hora_nascimento | ~80% | Presente na maioria, mas nem sempre legivel |
| avo_paterno | ~60% | Apenas em certidoes inteiro teor |
| avo_paterna | ~60% | Apenas em certidoes inteiro teor |
| avo_materno | ~60% | Apenas em certidoes inteiro teor |
| avo_materna | ~60% | Apenas em certidoes inteiro teor |
| nome_pai | ~95% | Ausente quando paternidade nao reconhecida |
| instituicao_nascimento | ~70% | Hospital/maternidade onde nasceu |

### 7.4 Averbacoes Possiveis

Averbacoes sao anotacoes marginais que modificam ou complementam o registro original:

| Tipo de Averbacao | Descricao | Efeito no Registro |
|-------------------|-----------|-------------------|
| Reconhecimento de paternidade | Pai reconhece filho posteriormente | Adiciona nome_pai |
| Retificacao de nome | Correcao ou alteracao de nome | Atualiza nome_registrado |
| Adocao | Sentenca de adocao | Pode alterar nome e filiacao |
| Emancipacao | Declaracao de emancipacao | Anota data de emancipacao |
| Alteracao de sexo | Decisao judicial ou administrativa | Atualiza sexo |
| Casamento | Referencia ao casamento | Anota numero do registro de casamento |
| Obito | Referencia ao obito | Anota numero do registro de obito |

### 7.5 Particularidades de Registro

| Situacao | Tratamento | Observacao |
|----------|------------|------------|
| Registro tardio | Data_registro muito apos nascimento | Comum em areas rurais ou remotas |
| Gemelares | Multiplos registros mesmo dia/hora | Verificar distintos termos |
| Nascimento no exterior | Registrado em consulado | Formato pode diferir |
| Indigena | Pode ter nome indigena | Grafias especiais |
| Refugiado | Registro especial | Documentacao diferenciada |

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/certidao_nascimento.json`
- **Prompt de Extracao**: `execution/prompts/certidao_nascimento.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`
- **Provimento CNJ 63/2017**: Regulamenta a matricula nacional das certidoes de nascimento
- **Lei 6.015/1973**: Lei de Registros Publicos

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
