# RG - Carteira de Identidade (Registro Geral)

**Complexidade de Extracao**: ALTA
**Schema Fonte**: `execution/schemas/rg.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O RG (Registro Geral) e o principal documento de identificacao civil brasileiro, emitido pelas Secretarias de Seguranca Publica (SSP) de cada estado ou por orgaos autorizados como DETRAN, IFP (Instituto Felix Pacheco), entre outros. Contem dados biometricos e biograficos essenciais do cidadao, sendo exigido em praticamente todas as transacoes imobiliarias e atos notariais.

O documento e fundamental para:
- Identificacao das partes em escrituras publicas
- Qualificacao completa em contratos de compra e venda
- Comprovacao de filiacao e naturalidade
- Validacao de identidade em atos cartoriais

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos RG atraves dos seguintes padroes textuais:

- `REGISTRO GERAL`
- `CARTEIRA DE IDENTIDADE`
- `SECRETARIA DE SEGURANCA`
- `SSP`
- `IDENTIDADE`
- `RG`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Modelo Antigo (Papel Verde)** | Documento em papel verde claro, formato retangular, foto P&B ou colorida colada | Campos basicos, sem CPF integrado |
| **Modelo Novo (Com Chip)** | Policarbonato, foto laser, chip opcional | CPF integrado, titulo eleitor, CNS |
| **RG Digital** | Versao eletronica disponivel em apps estaduais | Todos os campos, QR Code de validacao |
| **CIN (Carteira de Identidade Nacional)** | Novo modelo nacional padronizado | CPF como numero unico, biometria facial |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_rg | string | Numero do RG com digito verificador | "35.540.462-X" | `\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]` | Alta |
| nome_completo | string | Nome completo do titular | "MARINA AYUB" | `[A-Z...][A-Z...a-z...\s]+` | Alta |
| data_nascimento | date | Data de nascimento no formato DD/MM/AAAA | "06/09/1991" | `\d{2}/\d{2}/\d{4}` | Alta |
| orgao_expedidor | string | Orgao emissor (SSP, DETRAN, IFP, etc) | "SSP" | `[A-Z]{2,10}` | Alta |
| uf_expedidor | string | UF do orgao expedidor | "SP" | `[A-Z]{2}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| naturalidade | string | Cidade e estado de nascimento | "S.PAULO - SP" | Sempre nos modelos completos | Media |
| data_expedicao | date | Data de emissao do documento | "12/06/2017" | Sempre nos modelos completos | Alta |
| nome_pai | string | Nome completo do pai | "MUNIR AKAR AYUB" | Quando informado no registro | Media |
| nome_mae | string | Nome completo da mae | "ELOISA BASILE SIQUEIRA AYUB" | Sempre presente | Media |
| cpf | string | CPF impresso no RG | "368.366.718-43" | Modelos novos (pos-2010) | Alta |
| doc_origem | string | Documento de origem com detalhes | "SAO PAULO-SP JARDIM PAULISTA CN:LV.A133/FLSo270/No80631" | Quando consta no documento | Media |
| numero_via | string | Numero da via do documento | "2 via" | Quando nao e 1a via | Alta |
| titulo_eleitor | string | Titulo de eleitor | "123456789012" | RGs novos com integracao | Media |
| cns | string | Cartao Nacional de Saude | "123456789012345" | RGs novos com integracao | Media |

### 2.3 Objetos Nested

#### 2.3.1 filiacao (object - extraido como campos separados)

A filiacao e representada no schema como campos individuais, mas pode ser agrupada logicamente:

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| nome_pai | string | Nome completo do pai | "MUNIR AKAR AYUB" | Nao |
| nome_mae | string | Nome completo da mae | "ELOISA BASILE SIQUEIRA AYUB" | Nao |

**Nota**: O campo `nome_mae` e quase sempre presente, enquanto `nome_pai` pode estar ausente em casos de paternidade nao reconhecida.

#### 2.3.2 documentos_complementares (object - em RGs novos)

Campos adicionais presentes nos modelos mais recentes de RG:

| Subcampo | Tipo | Descricao | Exemplo | Frequencia |
|----------|------|-----------|---------|------------|
| titulo_eleitor | string | Titulo de eleitor | "123456789012" | Raro |
| cns | string | Cartao Nacional de Saude | "123456789012345" | Raro |
| nis_pis_pasep | string | NIS/PIS/PASEP | null | Muito raro |
| cnh | string | Numero da CNH | null | Muito raro |

#### 2.3.3 elementos_presentes (object - metadados de qualidade)

Campos booleanos que indicam a presenca de elementos visuais:

| Subcampo | Tipo | Descricao | Uso |
|----------|------|-----------|-----|
| foto | boolean | Foto do titular presente e legivel | Validacao de qualidade |
| assinatura_titular | boolean | Assinatura do titular presente | Validacao de qualidade |
| impressao_digital | boolean | Impressao digital presente | Validacao de qualidade |
| brasao_estado | boolean | Brasao do estado presente | Identificacao de modelo |
| codigo_barras | boolean | Codigo de barras presente | Modelos novos |
| qr_code | boolean | QR Code presente | RG digital/CIN |

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_completo | nome | SIM | Alta |
| cpf | cpf | SIM | Alta |
| numero_rg | rg | SIM | Alta |
| orgao_expedidor | orgao_emissor_rg | SIM | Alta |
| uf_expedidor | estado_emissor_rg | SIM | Alta |
| data_expedicao | data_emissao_rg | SIM | Media |
| data_nascimento | data_nascimento | SIM | Alta |
| naturalidade | naturalidade | SIM | Media |
| nome_pai | filiacao_pai | SIM | Media |
| nome_mae | filiacao_mae | SIM | Media |

### 3.2 Campos que Alimentam "Pessoa Juridica"

O RG **nao alimenta** diretamente campos de Pessoa Juridica.

No entanto, os dados do RG sao usados para qualificar:
- Socios de empresas
- Representantes legais
- Procuradores de pessoas juridicas

### 3.3 Campos que Alimentam "Dados do Imovel"

O RG **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

O RG **nao alimenta** diretamente campos de Negocio Juridico.

Os dados sao usados para qualificar as partes (outorgantes, outorgados) nos negocios.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| numero_via | Metadado do documento | Apenas controle interno |
| doc_origem | Referencia interna | Dados da certidao de origem |
| titulo_eleitor | Nao usado em minutas cartoriais | Dado eleitoral |
| cns | Nao usado em minutas cartoriais | Dado de saude |
| modelo_documento | Metadado interno | Classificacao do sistema |
| tipo_rg | Metadado interno | antigo_papel, novo_chip, digital |
| elementos_presentes | Metadados de qualidade | Uso interno do pipeline |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "RG",
  "dados_catalogados": {
    "nome_completo": "MARINA AYUB",
    "numero_rg": "35.540.462-X",
    "orgao_expedidor": "SSP",
    "uf_expedidor": "SP",
    "data_expedicao": "12/06/2017",
    "via_documento": "2 via",
    "cpf": "368.366.718-43",
    "data_nascimento": "06/09/1991",
    "naturalidade": "S.PAULO - SP",
    "filiacao": {
      "pai": "MUNIR AKAR AYUB",
      "mae": "ELOISA BASILE SIQUEIRA AYUB"
    },
    "documento_origem": "SAO PAULO-SP JARDIM PAULISTA CN:LV.A133/FLSo270/No80631"
  },
  "confianca_extracao": {
    "geral": 0.95,
    "campos_alta_confianca": ["numero_rg", "nome_completo", "cpf", "data_nascimento"],
    "campos_media_confianca": ["naturalidade", "filiacao"]
  },
  "elementos_presentes": {
    "foto": true,
    "assinatura_titular": true,
    "impressao_digital": true
  }
}
```

**Fonte**: `.tmp/contextual/FC_515_124_p280509/010_RG.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, CONTRATO_SOCIAL | Identificador unico da pessoa |
| numero_rg | CNH, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL, PROCURACAO | Identificacao secundaria |
| nome_completo | Todos os documentos de pessoa | Match por nome (fuzzy) |
| data_nascimento | CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO | Validar identidade |
| filiacao (pai/mae) | CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO | Confirmar identidade |
| naturalidade | CERTIDAO_NASCIMENTO | Validacao cruzada |

### 5.2 Redundancia Intencional

O CPF e RG sao extraidos de **multiplos documentos** intencionalmente para:

1. **Validacao cruzada**: Confirmar que os dados batem entre documentos
2. **Preenchimento por disponibilidade**: Se RG nao esta legivel, usar dados da CNH
3. **Deteccao de inconsistencias**: Alertar quando dados divergem
4. **Completude**: Garantir que campos criticos nunca fiquem vazios

### 5.3 Hierarquia de Fontes

Para dados de identificacao pessoal, a prioridade de extracao e:

1. **RG** - Fonte primaria de identificacao
2. **CNH** - Fonte secundaria, geralmente mais recente
3. **CERTIDAO_CASAMENTO** - Para dados de filiacao e naturalidade
4. **CERTIDAO_NASCIMENTO** - Para dados de nascimento originais

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| data_nascimento_valida | Data no passado e pessoa com idade razoavel (0-130 anos) | Logica |
| data_expedicao_posterior_nascimento | Expedicao deve ser apos nascimento | Logica |
| uf_valida | UF deve ser uma das 27 UFs brasileiras | Estrutural |
| rg_formato_valido | RG segue padrao do estado emissor | Estrutural |
| nome_completo_minimo | Nome tem pelo menos 2 palavras | Estrutural |

### 6.2 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| elementos_presentes.foto | boolean | Foto do titular visivel e legivel |
| elementos_presentes.assinatura_titular | boolean | Assinatura presente no documento |
| elementos_presentes.impressao_digital | boolean | Impressao digital visivel |
| confianca_extracao.geral | float | Score de confianca geral (0-1) |
| campos_ilegiveis | array | Lista de campos que nao puderam ser lidos |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- Documento muito antigo (> 10 anos)
- Foto ilegivel ou ausente
- CPF ausente em RG pos-2010
- Divergencia entre UF do orgao e formato do RG

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

Nenhum campo e computado automaticamente a partir de outros campos do RG.

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_rg | Inferido do layout visual | antigo_papel, novo_chip, digital, cin |
| estado_emissor | Inferido do formato do numero RG | Cada estado tem formato proprio |
| decada_emissao | Inferida do modelo e caracteristicas | Para RGs sem data legivel |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| titulo_eleitor | < 5% | Apenas RGs novos com integracao |
| cns | < 5% | Apenas RGs novos com integracao |
| nis_pis_pasep | < 1% | Muito raro mesmo em RGs novos |
| cnh | < 1% | Integracao experimental |
| nome_pai | ~90% | Ausente quando paternidade nao reconhecida |

### 7.4 Particularidades por Estado

| Estado | Orgao | Formato RG | Observacao |
|--------|-------|------------|------------|
| SP | SSP-SP | XX.XXX.XXX-X | Digito pode ser X |
| RJ | DETRAN-RJ, IFP | XX.XXX.XXX-X | Dois orgaos emissores |
| MG | SSP-MG | MG-XX.XXX.XXX | Prefixo MG |
| RS | SSP-RS | XXXXXXXXXX | Sem pontuacao |
| PR | SESP-PR | XX.XXX.XXX-X | Similar a SP |

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/rg.json`
- **Prompt de Extracao**: `execution/prompts/rg.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
