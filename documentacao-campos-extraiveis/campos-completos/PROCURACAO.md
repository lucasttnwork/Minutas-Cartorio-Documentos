# PROCURACAO - Procuracao Publica e Particular

**Complexidade de Extracao**: ALTA
**Schema Fonte**: Nao possui schema dedicado (campos mapeados em `mapeamento_documento_campos.json`)
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A Procuracao e um instrumento pelo qual uma pessoa (outorgante/mandante) confere poderes a outra (outorgado/procurador/mandatario) para agir em seu nome. Em transacoes imobiliarias, a procuracao e fundamental quando:

- **O proprietario nao pode comparecer pessoalmente**: Para assinar escrituras, promessas, ou outros atos
- **Pessoa Juridica e representada por procurador**: Administrador outorga procuracao a terceiro
- **Multiplos atos precisam ser praticados**: Um procurador centraliza a representacao
- **Partes residem em localidades distantes**: Evita deslocamentos para cada ato

Este documento tem **35 campos mapeados** (14 de pessoa_natural e 21 de pessoa_juridica), sendo um dos mais complexos do sistema devido a qualificacao completa do outorgante e procurador.

### 1.2 Tipos de Procuracao

| Tipo | Descricao | Requisitos | Uso Principal |
|------|-----------|------------|---------------|
| **Procuracao Publica** | Lavrada em Tabelionato de Notas | Fe publica, livro, folhas | Atos que exigem escritura publica |
| **Procuracao Particular** | Documento privado assinado pelas partes | Assinatura reconhecida (opcional) | Atos que nao exigem instrumento publico |
| **Procuracao por Instrumento Publico** | Sinonimo de procuracao publica | Mesmo que publica | Compra/venda de imoveis acima do limite |
| **Substabelecimento** | Transferencia de poderes a terceiro | Depende da procuracao original | Quando procurador precisa delegar |

### 1.3 Classificacao por Poderes

| Tipo | Descricao | Exemplo de Uso |
|------|-----------|----------------|
| **Ad Judicia** | Poderes para representar em juizo | Processos judiciais, audiencias |
| **Ad Negotia** | Poderes para negocios em geral | Transacoes comerciais, contratos |
| **Ad Judicia et Extra** | Poderes judiciais e extrajudiciais | Combinacao de ambos |
| **Poderes Especiais** | Poderes especificos para determinado ato | "Para vender o imovel X pelo valor Y" |
| **Poderes Gerais** | Poderes amplos para diversos atos | "Para praticar todos os atos necessarios" |
| **Clausula "Em Causa Propria"** | Procurador age como se dono fosse | Irrevogavel, equivale a pre-venda |

### 1.4 Padroes de Identificacao Visual

Os seguintes termos indicam que o documento e uma Procuracao:

- PROCURACAO / PROCURACAO PUBLICA / PROCURACAO PARTICULAR
- OUTORGANTE / MANDANTE / CONSTITUINTE
- OUTORGADO / PROCURADOR / MANDATARIO
- PODERES / PODERES ESPECIAIS / PODERES GERAIS
- TABELIONATO DE NOTAS / TABELIAO
- AD JUDICIA / AD NEGOTIA / AD JUDICIA ET EXTRA
- SUBSTABELECER / SUBSTABELECIMENTO
- "EM CAUSA PROPRIA"
- CLAUSULA DE IRREVOGABILIDADE

### 1.5 Formatos Comuns

| Formato | Descricao | Caracteristicas |
|---------|-----------|-----------------|
| Procuracao Publica Original | Traslado extraido do livro de notas | Livro, folhas, selo digital, data |
| Procuracao Particular Simples | Documento privado | Assinaturas das partes |
| Procuracao Particular com Firma Reconhecida | Documento privado autenticado | Selo de reconhecimento de firma |
| Substabelecimento | Transferencia de poderes | Referencia a procuracao original |
| Certidao de Procuracao | Certidao do teor | Emitida pelo tabelionato |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Dados do Outorgante/Mandante (14 campos - pessoa_natural)

O outorgante e quem confere os poderes. Sua qualificacao completa e essencial.

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| nome | string | Nome completo do outorgante | "JOAO CARLOS MENDES" | Sim |
| cpf | string | CPF do outorgante | "987.654.321-00" | Sim |
| rg | string | Numero do RG | "45.678.901-2" | Nao |
| orgao_emissor_rg | string | Orgao emissor do RG | "SSP" | Nao |
| estado_emissor_rg | string | Estado emissor do RG | "SP" | Nao |
| nacionalidade | string | Nacionalidade | "BRASILEIRO" | Nao |
| profissao | string | Profissao ou ocupacao | "EMPRESARIO" | Nao |
| estado_civil | string | Estado civil | "CASADO" | Nao |
| domicilio_logradouro | string | Logradouro do domicilio | "RUA DAS ACACIAS" | Nao |
| domicilio_numero | string | Numero do domicilio | "250" | Nao |
| domicilio_bairro | string | Bairro do domicilio | "VILA MARIANA" | Nao |
| domicilio_cidade | string | Cidade do domicilio | "SAO PAULO" | Nao |
| domicilio_estado | string | Estado do domicilio | "SP" | Nao |
| domicilio_cep | string | CEP do domicilio | "04101-050" | Nao |

### 2.2 Dados do Procurador/Mandatario (21 campos - pessoa_juridica pj_procurador_*)

O procurador e quem recebe os poderes. Campos prefixados com `pj_procurador_` para uso em representacao de PJ.

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| pj_procurador_nome | string | Nome completo do procurador | "MARIA DA SILVA SANTOS" | Sim |
| pj_procurador_cpf | string | CPF do procurador | "123.456.789-00" | Sim |
| pj_procurador_rg | string | RG do procurador | "12.345.678-9" | Nao |
| pj_procurador_orgao_emissor_rg | string | Orgao emissor RG | "SSP" | Nao |
| pj_procurador_estado_emissor_rg | string | Estado emissor RG | "SP" | Nao |
| pj_procurador_data_emissao_rg | date | Data de emissao RG | "15/05/2015" | Nao |
| pj_procurador_cnh | string | CNH do procurador | "12345678901" | Nao |
| pj_procurador_orgao_emissor_cnh | string | Orgao emissor CNH | "DETRAN-SP" | Nao |
| pj_procurador_data_nascimento | date | Data de nascimento | "20/03/1980" | Nao |
| pj_procurador_estado_civil | string | Estado civil | "SOLTEIRA" | Nao |
| pj_procurador_profissao | string | Profissao | "ADVOGADA" | Nao |
| pj_procurador_nacionalidade | string | Nacionalidade | "BRASILEIRA" | Nao |
| pj_procurador_domicilio_logradouro | string | Logradouro | "AVENIDA PAULISTA" | Nao |
| pj_procurador_domicilio_numero | string | Numero | "1000" | Nao |
| pj_procurador_domicilio_complemento | string | Complemento | "SALA 1501" | Nao |
| pj_procurador_domicilio_bairro | string | Bairro | "BELA VISTA" | Nao |
| pj_procurador_domicilio_cidade | string | Cidade | "SAO PAULO" | Nao |
| pj_procurador_domicilio_estado | string | Estado | "SP" | Nao |
| pj_procurador_domicilio_cep | string | CEP | "01310-100" | Nao |
| pj_procurador_email | string | E-mail | "maria@advogados.com.br" | Nao |
| pj_procurador_telefone | string | Telefone | "(11) 98765-4321" | Nao |

### 2.3 Dados da Procuracao (6 campos - pessoa_juridica)

Campos especificos do instrumento de procuracao.

| Campo | Tipo | Descricao | Exemplo | Obrigatorio |
|-------|------|-----------|---------|-------------|
| pj_tabelionato_procuracao | string | Tabelionato onde foi lavrada | "2o TABELIAO DE NOTAS DE SAO PAULO" | Publica: Sim |
| pj_data_procuracao | date | Data de lavratura | "15/01/2026" | Sim |
| pj_livro_procuracao | string | Numero do livro | "1234" | Publica: Sim |
| pj_paginas_procuracao | string | Paginas/Folhas | "456/458" | Publica: Sim |
| pj_data_expedicao_certidao_procuracao | date | Data de expedicao da certidao | "16/01/2026" | Certidao: Sim |
| pj_denominacao | string | Denominacao da PJ outorgante (se aplicavel) | "CONSTRUTORA ALPHA LTDA" | PJ: Sim |
| pj_cnpj | string | CNPJ da PJ outorgante (se aplicavel) | "12.345.678/0001-90" | PJ: Sim |

### 2.4 Campos Adicionais Especificos de Procuracao (nao mapeados)

Estes campos sao importantes mas nao estao no mapeamento atual:

| Campo | Tipo | Descricao | Exemplo | Importancia |
|-------|------|-----------|---------|-------------|
| tipo_procuracao | string | Publica ou Particular | "PUBLICA" | Alta |
| poderes | array/string | Lista de poderes conferidos | ["vender", "alienar", "receber precos"] | Alta |
| finalidade | string | Finalidade especifica | "Para vender o imovel matricula 123456" | Alta |
| prazo_validade | string | Prazo de validade | "180 dias" / "INDETERMINADO" | Media |
| clausula_substabelecer | boolean | Pode substabelecer | true | Media |
| clausula_reserva_poderes | boolean | Com reserva de poderes | true | Media |
| clausula_em_causa_propria | boolean | Procuracao em causa propria | false | Alta |
| clausula_irrevogavel | boolean | Procuracao irrevogavel | false | Alta |
| selo_digital | string | Codigo do selo digital | "ABCD1234567890" | Publica: Sim |
| imovel_objeto | object | Dados do imovel (se especifica) | {"matricula": "123456", "endereco": "..."} | Especifica |

---

## 3. TIPOS DE PODERES

### 3.1 Poderes Gerais (Amplos)

Conferem autoridade para praticar diversos atos sem especificacao:

```
"Para representar o OUTORGANTE em quaisquer reparticoes publicas, federais,
estaduais ou municipais, autarquias, empresas publicas, sociedades de economia
mista, cartórios, bancos, instituicoes financeiras, podendo assinar documentos,
peticoes, requerimentos, e praticar todos os atos necessarios ao fiel
cumprimento deste mandato."
```

### 3.2 Poderes Especiais (Especificos)

Conferem autoridade para atos determinados:

```
"Para o fim especifico de VENDER o imovel constituido pelo apartamento n. 101,
no 10o andar do Edificio Solaris, situado na Rua das Flores, n. 500, Sao Paulo-SP,
matriculado sob n. 123.456 no 1o Oficial de Registro de Imoveis de Sao Paulo,
pelo preco minimo de R$ 500.000,00 (quinhentos mil reais), podendo assinar a
escritura publica de compra e venda, receber o preco e dar quitacao."
```

### 3.3 Poderes para Transacoes Imobiliarias

Lista tipica de poderes para venda de imovel:

| Poder | Descricao |
|-------|-----------|
| Alienar | Vender, doar, permutar o imovel |
| Assinar escritura | Comparecer ao cartorio e assinar |
| Receber precos | Receber valores em dinheiro, cheque, TED |
| Dar quitacao | Emitir recibos de pagamento |
| Aceitar condicoes | Negociar prazos, valores, formas de pagamento |
| Representar perante cartorio RI | Requerer registros, averbacoes |
| Representar perante Prefeitura | ITBI, certidoes, guias |
| Substabelecer | Transferir poderes a terceiros |

### 3.4 Poderes "Ad Judicia" (Judiciais)

Para representacao em processos judiciais:

```
"Poderes ad judicia para o foro em geral, com a clausula ad judicia et extra,
podendo propor acoes, contestar, recorrer, transigir, desistir, renunciar,
receber citacao, confessar, reconhecer a procedencia do pedido, firmar
compromisso, dar e receber quitacao."
```

### 3.5 Clausula "Em Causa Propria"

Procuracao irrevogavel que transfere todos os direitos:

```
"A presente procuracao e outorgada EM CAUSA PROPRIA, sendo irrevogavel e
irretratavel, nos termos do artigo 685 do Codigo Civil, conferindo ao
outorgado todos os direitos e acoes sobre o imovel descrito, podendo o
mesmo dispor deste como seu legitimo dono, independente de nova outorga."
```

**IMPORTANTE**: Procuracao "em causa propria" equivale funcionalmente a uma venda, pois:
- E irrevogavel
- Nao depende de nova autorizacao do outorgante
- Procurador pode alienar para si mesmo
- Nao se extingue com a morte do outorgante

---

## 4. SUBSTABELECIMENTO

### 4.1 Conceito

Substabelecimento e a transferencia, pelo procurador, dos poderes que recebeu para outra pessoa. Pode ser:

| Tipo | Descricao | Requisitos |
|------|-----------|------------|
| **Com Reserva de Poderes** | Procurador mantem os poderes originais | Procuracao deve permitir substabelecimento |
| **Sem Reserva de Poderes** | Procurador transfere todos os poderes | Procurador perde os poderes |

### 4.2 Clausulas Tipicas

**Permitindo substabelecimento:**
```
"Podendo substabelecer, no todo ou em parte, os poderes ora conferidos,
com ou sem reserva de poderes."
```

**Proibindo substabelecimento:**
```
"Vedado o substabelecimento."
```

### 4.3 Campos do Substabelecimento

| Campo | Tipo | Descricao | Exemplo |
|-------|------|-----------|---------|
| procuracao_original_tabelionato | string | Tabelionato da procuracao original | "2o TABELIAO DE NOTAS DE SP" |
| procuracao_original_data | date | Data da procuracao original | "15/01/2026" |
| procuracao_original_livro | string | Livro da procuracao original | "1234" |
| procuracao_original_folhas | string | Folhas da procuracao original | "456/458" |
| tipo_substabelecimento | string | Com ou sem reserva | "COM RESERVA DE PODERES" |
| substabelecente_nome | string | Nome de quem substabelece | "MARIA DA SILVA SANTOS" |
| substabelecente_cpf | string | CPF de quem substabelece | "123.456.789-00" |
| substabelecido_nome | string | Nome de quem recebe os poderes | "PEDRO JOSE ALMEIDA" |
| substabelecido_cpf | string | CPF de quem recebe os poderes | "456.789.012-34" |

---

## 5. PROCURACAO DE PESSOA JURIDICA

### 5.1 Quando PJ Outorga Procuracao

Quando uma Pessoa Juridica precisa ser representada por procurador:

1. **Administrador outorga a procuracao**: Conforme poderes do Contrato Social
2. **Procuracao deve mencionar**: CNPJ, sede, instrumento constitutivo
3. **Representante deve estar legitimado**: Verificar clausula de poderes

### 5.2 Forma de Representacao

```
"CONSTRUTORA ALPHA LTDA, pessoa juridica de direito privado, inscrita no
CNPJ sob no 12.345.678/0001-90, com sede na Avenida Paulista, 1000, Conjunto
1501, Bela Vista, CEP 01310-100, Sao Paulo-SP, neste ato representada por
seu administrador JOAO CARLOS MENDES, brasileiro, casado, empresario,
portador do RG no 45.678.901-2 SSP/SP e inscrito no CPF sob no 987.654.321-00,
conforme Clausula Decima Segunda do Contrato Social registrado na JUCESP
sob no 123.456.789.012 em sessao de 15/03/2020, OUTORGANTE, nomeia e
constitui sua bastante procuradora MARIA DA SILVA SANTOS..."
```

### 5.3 Correlacao com CONTRATO_SOCIAL

| Verificacao | Campo no CONTRATO_SOCIAL | Campo na PROCURACAO |
|-------------|-------------------------|---------------------|
| Administrador legitimado | pj_admin_nome, pj_admin_cpf | Comparar com quem assina |
| Poderes para outorgar | pj_clausula_poderes_admin | Verificar se permite procuracao |
| Empresa ativa | (verificacao externa) | CNPJ deve estar ativo |
| Objeto social | (verificacao interna) | Procuracao deve estar dentro do objeto |

---

## 6. MAPEAMENTO SCHEMA --> MODELO DE DADOS

### 6.1 Campos que Alimentam "Pessoa Natural" (14 campos)

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| outorgante.nome | NOME | Nome do outorgante | SIM |
| outorgante.cpf | CPF | CPF do outorgante | SIM |
| outorgante.rg | RG | RG do outorgante | SIM |
| outorgante.orgao_rg | ORGAO EMISSOR DO RG | Orgao emissor | SIM |
| outorgante.estado_rg | ESTADO EMISSOR DO RG | Estado do RG | SIM |
| outorgante.nacionalidade | NACIONALIDADE | Nacionalidade | SIM |
| outorgante.profissao | PROFISSAO | Profissao | SIM |
| outorgante.estado_civil | ESTADO CIVIL | Estado civil | SIM |
| outorgante.endereco.logradouro | LOGRADOURO | Logradouro | SIM |
| outorgante.endereco.numero | NUMERO | Numero | SIM |
| outorgante.endereco.bairro | BAIRRO | Bairro | SIM |
| outorgante.endereco.cidade | CIDADE | Cidade | SIM |
| outorgante.endereco.estado | ESTADO | Estado | SIM |
| outorgante.endereco.cep | CEP | CEP | SIM |

### 6.2 Campos que Alimentam "Pessoa Juridica" (21 campos)

| Campo no Schema | Campo Mapeado | Descricao | Usado em Minutas? |
|-----------------|---------------|-----------|-------------------|
| outorgante.denominacao | DENOMINACAO | Razao social (se PJ) | SIM |
| outorgante.cnpj | CNPJ | CNPJ (se PJ) | SIM |
| procurador.nome | NOME DO PROCURADOR | Nome do procurador | SIM |
| procurador.cpf | CPF DO PROCURADOR | CPF do procurador | SIM |
| procurador.rg | RG DO PROCURADOR | RG do procurador | SIM |
| procurador.orgao_rg | ORGAO EMISSOR DO RG DO PROCURADOR | Orgao emissor | SIM |
| procurador.estado_rg | ESTADO EMISSOR DO RG DO PROCURADOR | Estado do RG | SIM |
| procurador.data_emissao_rg | DATA DE EMISSAO DO RG DO PROCURADOR | Data emissao RG | NAO |
| procurador.cnh | CNH DO PROCURADOR | CNH | NAO |
| procurador.orgao_cnh | ORGAO EMISSOR DA CNH DO PROCURADOR | Orgao CNH | NAO |
| procurador.data_nascimento | DATA DE NASCIMENTO DO PROCURADOR | Data nascimento | SIM |
| procurador.estado_civil | ESTADO CIVIL DO PROCURADOR | Estado civil | SIM |
| procurador.profissao | PROFISSAO DO PROCURADOR | Profissao | SIM |
| procurador.nacionalidade | NACIONALIDADE DO PROCURADOR | Nacionalidade | SIM |
| procurador.endereco.* | LOGRADOURO DO PROCURADOR, NUMERO DO PROCURADOR, BAIRRO DO PROCURADOR, CIDADE DO PROCURADOR, ESTADO DO PROCURADOR, CEP DO PROCURADOR | Endereco (6 campos) | SIM |
| procurador.email | E-MAIL DO PROCURADOR | E-mail | NAO |
| procurador.telefone | TELEFONE DO PROCURADOR | Telefone | NAO |
| procuracao.tabelionato | TABELIONATO DA PROCURACAO | Tabelionato | SIM |
| procuracao.data | DATA DA PROCURACAO | Data lavratura | SIM |
| procuracao.livro | LIVRO DA PROCURACAO | Livro | SIM |
| procuracao.folhas | PAGINAS DA PROCURACAO | Paginas | SIM |

### 6.3 Campos que NAO Alimentam o Modelo de Dados

| Campo | Motivo da Exclusao |
|-------|-------------------|
| poderes | Texto livre, tratado manualmente |
| finalidade | Texto juridico especifico |
| prazo_validade | Metadado de verificacao |
| clausula_substabelecer | Metadado de verificacao |
| clausula_em_causa_propria | Metadado de verificacao |
| selo_digital | Identificacao interna do cartorio |
| imovel_objeto | Extraido da MATRICULA_IMOVEL |

---

## 7. CORRELACAO COM OUTROS DOCUMENTOS

### 7.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| nome (outorgante) | RG, CNH, CPF, CERTIDAO_CASAMENTO, ESCRITURA | Identificar outorgante |
| cpf (outorgante) | RG, CNH, CPF, CNDT, CND_FEDERAL | Validar identidade |
| pj_cnpj | CONTRATO_SOCIAL, CNDT, CND_FEDERAL, ESCRITURA | Identificar PJ outorgante |
| pj_procurador_cpf | RG, CNH, CPF, CERTIDAO_CASAMENTO | Validar procurador |
| pj_denominacao | CONTRATO_SOCIAL, ESCRITURA | Validar empresa |

### 7.2 Correlacao com CONTRATO_SOCIAL

O CONTRATO_SOCIAL e a PROCURACAO sao documentos complementares para representacao de PJ:

```
CONTRATO_SOCIAL (define quem pode representar a PJ)
         |
         +---> Administrador identificado (pj_admin_*)
         |              |
         |              +---> Pode assinar procuracao?
         |                          |
         |                          +---> SIM: pj_clausula_poderes_admin
         |
         +---> PROCURACAO (delega poderes a terceiro)
                   |
                   +---> Procurador identificado (pj_procurador_*)
                              |
                              +---> Pode representar a PJ
                                         |
                                         v
                                    ESCRITURA
```

### 7.3 Correlacao com ESCRITURA

Quando outorgante nao comparece pessoalmente:

| Cenario | Documentos Necessarios |
|---------|------------------------|
| PF representada por procurador | PROCURACAO + RG do procurador |
| PJ representada por administrador | CONTRATO_SOCIAL + RG do administrador |
| PJ representada por procurador | CONTRATO_SOCIAL + PROCURACAO + RG do procurador |
| Substabelecimento | PROCURACAO original + SUBSTABELECIMENTO + RG |

### 7.4 Fluxo de Validacao

```
PROCURACAO
    |
    +-- RG/CNH (outorgante) --> Validar identidade de quem deu os poderes
    |
    +-- CERTIDAO_CASAMENTO (outorgante) --> Validar estado civil
    |        |
    |        +-- Se casado: conjuge deve anuir (imoveis)
    |
    +-- RG/CNH (procurador) --> Validar identidade do procurador
    |
    +-- CONTRATO_SOCIAL (se PJ) --> Validar poderes do administrador
    |
    +-- MATRICULA_IMOVEL (se especifica) --> Confirmar imovel objeto
    |
    +-- ESCRITURA --> Procurador comparece representando outorgante
```

---

## 8. VALIDACOES E CONFERENCIAS

### 8.1 Validacoes Automaticas

| Validacao | Descricao | Implementada |
|-----------|-----------|--------------|
| cpf_outorgante_valido | CPF do outorgante com digitos corretos | Sim |
| cpf_procurador_valido | CPF do procurador com digitos corretos | Sim |
| cnpj_valido | CNPJ da PJ outorgante valido | Sim |
| data_procuracao_valida | Data no formato DD/MM/AAAA | Sim |

### 8.2 Validacoes de Negocio

| Validacao | Descricao | Criticidade |
|-----------|-----------|-------------|
| Procuracao vigente | Verificar se nao expirou o prazo | Alta |
| Poderes suficientes | Verificar se poderes cobrem o ato | Alta |
| Outorgante legitimado | Verificar se outorgante e proprietario | Alta |
| Procuracao publica para imoveis | Atos de imoveis exigem instrumento publico | Alta |
| Conjuge anuente | Se outorgante casado, conjuge deve anuir | Alta |
| Administrador com poderes | Se PJ, verificar clausula de poderes | Alta |
| Procuracao nao revogada | Verificar se nao foi revogada | Alta |

### 8.3 Conferencias Manuais Recomendadas

- [ ] Verificar se procuracao e PUBLICA (para atos imobiliarios)
- [ ] Confirmar que poderes incluem o ato especifico
- [ ] Verificar prazo de validade
- [ ] Confirmar identidade do procurador com documento
- [ ] Se PJ, verificar poderes do administrador no Contrato Social
- [ ] Se casado, verificar anuencia do conjuge
- [ ] Verificar se nao ha substabelecimento sem reserva

### 8.4 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| procuracao_vigente | boolean | Procuracao dentro do prazo de validade |
| tipo_instrumento | string | Publica ou Particular |
| poderes_especificos | boolean | Poderes especificos para o ato |
| clausula_substabelecimento | string | "COM RESERVA" / "SEM RESERVA" / "VEDADO" |
| clausula_em_causa_propria | boolean | Procuracao irrevogavel em causa propria |

---

## 9. EXEMPLO DE EXTRACAO REAL

### 9.1 Procuracao Publica para Venda de Imovel

```json
{
  "tipo_documento": "PROCURACAO",
  "subtipo": "PROCURACAO_PUBLICA",
  "dados_extraidos": {
    "procuracao": {
      "tipo": "PUBLICA",
      "tabelionato": "2o TABELIAO DE NOTAS DE SAO PAULO",
      "data_lavratura": "15/01/2026",
      "livro": "1234",
      "folhas": "456/458",
      "selo_digital": "ABCD1234567890"
    },
    "outorgante": {
      "tipo_pessoa": "PESSOA_FISICA",
      "nome": "JOAO CARLOS MENDES",
      "cpf": "987.654.321-00",
      "rg": "45.678.901-2",
      "orgao_emissor_rg": "SSP",
      "estado_emissor_rg": "SP",
      "nacionalidade": "BRASILEIRO",
      "estado_civil": "CASADO",
      "regime_bens": "COMUNHAO PARCIAL DE BENS",
      "profissao": "EMPRESARIO",
      "endereco": {
        "logradouro": "RUA DAS ACACIAS",
        "numero": "250",
        "complemento": "APTO 802",
        "bairro": "VILA MARIANA",
        "cidade": "SAO PAULO",
        "estado": "SP",
        "cep": "04101-050"
      },
      "conjuge": {
        "nome": "MARIA APARECIDA MENDES",
        "cpf": "123.456.789-00",
        "anuente": true
      }
    },
    "procurador": {
      "nome": "PEDRO JOSE ALMEIDA",
      "cpf": "456.789.012-34",
      "rg": "98.765.432-1",
      "orgao_emissor_rg": "SSP",
      "estado_emissor_rg": "SP",
      "nacionalidade": "BRASILEIRO",
      "estado_civil": "SOLTEIRO",
      "profissao": "ADVOGADO",
      "data_nascimento": "15/06/1985",
      "endereco": {
        "logradouro": "AVENIDA PAULISTA",
        "numero": "1000",
        "complemento": "SALA 1501",
        "bairro": "BELA VISTA",
        "cidade": "SAO PAULO",
        "estado": "SP",
        "cep": "01310-100"
      }
    },
    "poderes": {
      "tipo": "ESPECIAIS",
      "finalidade": "VENDA DE IMOVEL",
      "descricao": "Para o fim especifico de VENDER o imovel constituido pelo apartamento n. 101, situado na Rua das Flores, n. 500, Sao Paulo-SP, matriculado sob n. 123.456 no 1o Oficial de Registro de Imoveis de Sao Paulo, pelo preco minimo de R$ 500.000,00, podendo assinar a escritura publica, receber o preco, dar quitacao, representar perante cartorio de registro de imoveis e Prefeitura Municipal.",
      "lista_poderes": [
        "VENDER o imovel descrito",
        "ASSINAR escritura publica de compra e venda",
        "RECEBER precos e valores",
        "DAR QUITACAO",
        "REPRESENTAR perante Cartorio de Registro de Imoveis",
        "REPRESENTAR perante Prefeitura Municipal",
        "SUBSTABELECER com reserva de poderes"
      ]
    },
    "clausulas_especiais": {
      "substabelecimento": "COM RESERVA DE PODERES",
      "prazo_validade": "180 DIAS",
      "em_causa_propria": false,
      "irrevogavel": false
    },
    "imovel_objeto": {
      "tipo": "APARTAMENTO",
      "unidade": "101",
      "endereco": "Rua das Flores, n. 500, Sao Paulo-SP",
      "matricula": "123.456",
      "cartorio_ri": "1o Oficial de Registro de Imoveis de Sao Paulo",
      "valor_minimo": 500000.00
    },
    "metadados": {
      "data_extracao": "2026-01-30",
      "validade_procuracao": "15/07/2026",
      "procuracao_vigente": true
    }
  }
}
```

### 9.2 Procuracao de PJ para Representacao em Escritura

```json
{
  "tipo_documento": "PROCURACAO",
  "subtipo": "PROCURACAO_PUBLICA_PJ",
  "dados_extraidos": {
    "procuracao": {
      "tipo": "PUBLICA",
      "tabelionato": "3o TABELIAO DE NOTAS DE SAO PAULO",
      "data_lavratura": "10/01/2026",
      "livro": "2000",
      "folhas": "100/102"
    },
    "outorgante": {
      "tipo_pessoa": "PESSOA_JURIDICA",
      "denominacao": "CONSTRUTORA ALPHA LTDA",
      "cnpj": "12.345.678/0001-90",
      "sede": {
        "logradouro": "AVENIDA PAULISTA",
        "numero": "1000",
        "complemento": "CONJUNTO 1501",
        "bairro": "BELA VISTA",
        "cidade": "SAO PAULO",
        "estado": "SP",
        "cep": "01310-100"
      },
      "representada_por": {
        "cargo": "ADMINISTRADOR",
        "nome": "JOAO CARLOS MENDES",
        "cpf": "987.654.321-00",
        "conforme_clausula": "CLAUSULA DECIMA SEGUNDA DO CONTRATO SOCIAL",
        "registro_junta": "123.456.789.012",
        "data_sessao": "15/03/2020"
      }
    },
    "procurador": {
      "nome": "MARIA DA SILVA SANTOS",
      "cpf": "123.456.789-00",
      "rg": "12.345.678-9",
      "orgao_emissor_rg": "SSP",
      "estado_emissor_rg": "SP",
      "nacionalidade": "BRASILEIRA",
      "estado_civil": "CASADA",
      "profissao": "ADVOGADA",
      "endereco": {
        "logradouro": "RUA AUGUSTA",
        "numero": "500",
        "complemento": "SALA 301",
        "bairro": "CONSOLACAO",
        "cidade": "SAO PAULO",
        "estado": "SP",
        "cep": "01304-000"
      }
    },
    "poderes": {
      "tipo": "AMPLOS PARA TRANSACOES IMOBILIARIAS",
      "descricao": "Para representar a OUTORGANTE em todos os atos relativos a compra, venda, permuta e doacao de imoveis, podendo assinar escrituras publicas, compromissos de compra e venda, distratos, receber valores, dar quitacao, representar perante cartorios, prefeituras, bancos e quaisquer orgaos publicos ou privados."
    },
    "clausulas_especiais": {
      "substabelecimento": "COM RESERVA DE PODERES",
      "prazo_validade": "INDETERMINADO",
      "em_causa_propria": false
    }
  }
}
```

---

## 10. NOTAS TECNICAS

### 10.1 Campos Computados

| Campo Computado | Formula/Logica | Observacao |
|-----------------|----------------|------------|
| procuracao_vigente | data_atual < data_procuracao + prazo_validade | Se prazo indeterminado, sempre vigente |
| tipo_pessoa_outorgante | CPF = PF, CNPJ = PJ | Inferido do documento |
| poderes_suficientes | Analise semantica dos poderes vs ato pretendido | Verificacao manual |

### 10.2 Campos Inferidos

| Campo Inferido | Origem | Logica de Inferencia |
|----------------|--------|---------------------|
| tipo_instrumento | Presenca de tabelionato/livro/folhas | Se presente = Publica |
| anuencia_conjuge | Estado civil do outorgante | Se casado + imovel = necessaria |
| poderes_judiciais | Texto dos poderes | Presenca de "ad judicia" |
| poderes_extrajudiciais | Texto dos poderes | Presenca de "ad negotia" |

### 10.3 Campos Raros

| Campo | Frequencia | Quando Aparece |
|-------|------------|----------------|
| clausula_em_causa_propria | Raro | Pre-venda, transferencia definitiva |
| substabelecido | Medio | Quando procurador delega poderes |
| prazo_determinado | Medio | Procuracoes com prazo especifico |
| multiplos_procuradores | Raro | Mais de um procurador nomeado |
| poderes_condicionais | Raro | Poderes dependentes de evento |

### 10.4 Diferenca entre Procuracao Publica e Particular

| Aspecto | Procuracao Publica | Procuracao Particular |
|---------|-------------------|----------------------|
| Onde e feita | Tabelionato de Notas | Qualquer lugar |
| Fe publica | Sim | Nao |
| Livro/Folhas | Sim | Nao |
| Selo digital | Sim | Nao |
| Custo | Emolumentos | Gratuito ou baixo |
| Uso para imoveis | Obrigatoria (valor > limite) | Permitida (valor < limite) |
| Arquivamento | Permanente no cartorio | Depende das partes |
| Copia autenticada | Traslado/Certidao | Copia simples |

### 10.5 Requisitos para Atos Imobiliarios

| Tipo de Ato | Procuracao Exigida | Fundamento Legal |
|-------------|-------------------|------------------|
| Compra/Venda > 30 salarios minimos | Publica | Art. 108 CC |
| Compra/Venda < 30 salarios minimos | Particular (aceita) | Art. 108 CC |
| Doacao de imovel | Publica | Art. 541 CC |
| Hipoteca | Publica | Art. 1.421 CC |
| Usucapiao extrajudicial | Publica | Lei 6.015/73 |
| Inventario extrajudicial | Publica | Lei 11.441/2007 |

---

## 11. ESTRUTURA HIERARQUICA

```
PROCURACAO
|
+-- Dados do Instrumento
|   +-- tipo_procuracao (PUBLICA/PARTICULAR)
|   +-- pj_tabelionato_procuracao
|   +-- pj_data_procuracao
|   +-- pj_livro_procuracao
|   +-- pj_paginas_procuracao
|   +-- selo_digital
|
+-- Outorgante/Mandante (object)
|   +-- Pessoa Fisica
|   |   +-- nome
|   |   +-- cpf
|   |   +-- rg
|   |   +-- orgao_emissor_rg
|   |   +-- estado_emissor_rg
|   |   +-- nacionalidade
|   |   +-- profissao
|   |   +-- estado_civil
|   |   +-- regime_bens (se casado)
|   |   +-- domicilio_* (6 campos)
|   |   +-- conjuge (object, se casado)
|   |       +-- nome
|   |       +-- cpf
|   |       +-- anuente
|   |
|   +-- Pessoa Juridica
|       +-- pj_denominacao
|       +-- pj_cnpj
|       +-- pj_sede_* (endereco)
|       +-- representante (object)
|           +-- cargo
|           +-- nome
|           +-- cpf
|           +-- conforme_clausula
|
+-- Procurador/Mandatario (object)
|   +-- pj_procurador_nome
|   +-- pj_procurador_cpf
|   +-- pj_procurador_rg
|   +-- pj_procurador_orgao_emissor_rg
|   +-- pj_procurador_estado_emissor_rg
|   +-- pj_procurador_data_nascimento
|   +-- pj_procurador_estado_civil
|   +-- pj_procurador_profissao
|   +-- pj_procurador_nacionalidade
|   +-- pj_procurador_domicilio_* (7 campos)
|
+-- Poderes (object)
|   +-- tipo (GERAIS/ESPECIAIS)
|   +-- classificacao (AD_JUDICIA/AD_NEGOTIA/AD_JUDICIA_ET_EXTRA)
|   +-- finalidade
|   +-- descricao
|   +-- lista_poderes (array)
|
+-- Clausulas Especiais (object)
|   +-- substabelecimento (COM_RESERVA/SEM_RESERVA/VEDADO)
|   +-- prazo_validade
|   +-- em_causa_propria (boolean)
|   +-- irrevogavel (boolean)
|
+-- Imovel Objeto (object, se procuracao especifica)
|   +-- matricula
|   +-- cartorio_ri
|   +-- endereco
|   +-- valor_minimo (se especificado)
|
+-- Substabelecimento (object, se aplicavel)
    +-- tipo (COM_RESERVA/SEM_RESERVA)
    +-- substabelecente_nome
    +-- substabelecente_cpf
    +-- substabelecido_nome
    +-- substabelecido_cpf
    +-- procuracao_original (referencia)
```

---

## 12. REFERENCIAS

- **Mapeamento de Campos**: `execution/mapeamento_documento_campos.json`
- **Guia de Campos PJ**: `Guia-de-campos-e-variaveis/campos-pessoa-juridica.md`
- **Documento Referencia**: `DOCUMENTOS_E_CAMPOS_REFERENCIA.md` (secao 3.14)
- **Correlacao com CONTRATO_SOCIAL**: `documentacao-campos-extraiveis/campos-completos/CONTRATO_SOCIAL.md`
- **Codigo Civil**: Arts. 653 a 692 (Mandato)

---

## 13. CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
