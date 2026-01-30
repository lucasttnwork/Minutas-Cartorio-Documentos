# VVR - Valor Venal de Referencia

**Complexidade de Extracao**: MUITO_BAIXA
**Schema Fonte**: `execution/schemas/vvr.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

O VVR (Valor Venal de Referencia) e um documento emitido pela Prefeitura Municipal que informa o valor de referencia de um imovel para fins de calculo do ITBI (Imposto de Transmissao de Bens Imoveis). Este valor e utilizado como piso minimo para a base de calculo do imposto nas transacoes imobiliarias.

O VVR e distinto do Valor Venal do IPTU. Enquanto o Valor Venal do IPTU e utilizado para calculo do imposto predial anual e tende a ser mais conservador, o VVR e calculado com base em metodologia especifica que considera valores de mercado e e utilizado especificamente para transacoes de compra e venda.

**Importante**: A base de calculo do ITBI sera sempre o **maior valor** entre o valor declarado da transacao e o VVR. Portanto, mesmo que o valor de venda seja inferior ao VVR, o imposto sera calculado sobre o VVR.

### 1.2 Padroes de Identificacao Visual

Os seguintes padroes indicam que um documento e uma consulta de VVR:

- **VALOR VENAL DE REFERENCIA** ou **VVR**
- **CONSULTA DE VALOR VENAL**
- **VALOR DE REFERENCIA**
- **PREFEITURA** seguido do nome do municipio
- Presenca de campos como "SQL", "SETOR QUADRA LOTE", "VALOR DE REFERENCIA PARA ITBI"
- URL tipica: `itbi.prefeitura.sp.gov.br` (Sao Paulo)

### 1.3 Formatos Comuns

O VVR pode ser encontrado nos seguintes formatos:

1. **Consulta Online**: Tela de resultado da consulta no sistema da prefeitura (mais comum)
2. **PDF Impresso**: Versao impressa ou salva da consulta online
3. **Certidao de VVR**: Documento formal emitido pela Secretaria da Fazenda (menos comum)

**Caracteristicas do documento**:
- Documento extremamente simples com poucos campos
- Geralmente uma unica pagina
- Layout padronizado por municipio
- Nao possui assinatura digital ou autenticacao (e apenas informativo)

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca |
|-------|------|-----------|---------|----------------|-----------|
| cadastro_imovel | string | SQL - Setor Quadra Lote do imovel | "039.080.0244-3" | 1 | Alta |
| valor_venal_referencia | number | Valor venal de referencia em reais | 301147.00 | 1 | Alta |

**Notas**:
- O `cadastro_imovel` segue o formato padrao de SQL: `XXX.XXX.XXXX-X`
- O `valor_venal_referencia` e o campo mais importante do documento e deve ser extraido com precisao absoluta

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Nivel Extracao | Confianca | Quando Presente |
|-------|------|-----------|---------|----------------|-----------|-----------------|
| endereco_completo | string | Endereco completo do imovel | "R FRANCISCO CRUZ, 00515 APTO 124 BL-B 04117-902" | 2 | Media | Sempre |
| data_consulta | date | Data da consulta do VVR | "26/10/2023" | 1 | Alta | Sempre |
| ano_referencia | number | Ano de referencia do valor | 2026 | 1 | Alta | Nem sempre explicito |

### 2.3 Campos Adicionais (Encontrados em Extracoes Reais)

Alem dos campos do schema, extracoes reais podem conter:

| Campo | Tipo | Descricao | Exemplo | Fonte |
|-------|------|-----------|---------|-------|
| hora_consulta | string | Hora da consulta | "14:45" | Sistema da prefeitura |
| orgao_emissor | string | Orgao emissor do documento | "Secretaria Municipal da Fazenda (SF)" | Sistema da prefeitura |
| url_sistema_origem | string | URL do sistema de consulta | "https://itbi.prefeitura.sp.gov.br/..." | Navegador |

---

## 3. MAPEAMENTO SCHEMA -> MODELO DE DADOS

### 3.1 Campos que Alimentam "Dados do Imovel"

| Campo no Schema | Campo Mapeado | Descricao Mapeada | Usado em Minutas? |
|-----------------|---------------|-------------------|-------------------|
| cadastro_imovel | imovel_sql | Cadastro Municipal (SQL) | SIM |
| valor_venal_referencia | imovel_valor_venal_referencia | Valor venal de referencia para ITBI | SIM |
| endereco_completo | imovel_logradouro | Logradouro do imovel | SIM (parseado) |
| endereco_completo | imovel_numero | Numero do imovel | SIM (parseado) |
| endereco_completo | imovel_complemento | Complemento do imovel | SIM (parseado) |

**Observacao**: O campo `endereco_completo` e um texto unico que precisa ser parseado para extrair logradouro, numero e complemento separadamente.

### 3.2 Campos Mapeados Conforme mapeamento_documento_campos.json

O VVR mapeia para **6 campos** na categoria `imovel`:

| Campo Mapeado | Descricao |
|---------------|-----------|
| matricula_numero | Numero da matricula (se disponivel) |
| imovel_sql | Cadastro Municipal (SQL) |
| imovel_valor_venal_referencia | Valor venal de referencia para ITBI |
| imovel_logradouro | Logradouro do imovel |
| imovel_numero | Numero do imovel |
| imovel_area_construida | Area construida em m2 (se disponivel) |

### 3.3 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao |
|-----------------|-------------------|
| data_consulta | Metadado da consulta - nao usado em minutas |
| ano_referencia | Informativo - apenas para validacao temporal |
| hora_consulta | Metadado da consulta |
| orgao_emissor | Informativo |
| url_sistema_origem | Metadado tecnico |

---

## 4. EXEMPLO DE EXTRACAO REAL

**Fonte**: Extracao real do sistema de catalogacao

```json
{
  "tipo_documento": "VVR",
  "dados_catalogados": {
    "tipo_documento": "VVR",
    "sql": "039.080.0244-3",
    "endereco_completo": "R FRANCISCO CRUZ, 00515 APTO 124 BL-B 04117-902",
    "valor_venal_referencia": 301147.0,
    "data_consulta": "26/10/2023",
    "hora_consulta": "14:45",
    "orgao_emissor": "Secretaria Municipal da Fazenda (SF)",
    "url_sistema_origem": "https://itbi.prefeitura.sp.gov.br/valorreferencia/tvm/frm_tvm_consulta_valor.aspx"
  },
  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_ilegiveis": [],
    "validacoes_executadas": [
      "sql_formato_valido",
      "valor_positivo"
    ]
  }
}
```

**Exemplo Sintetico Completo**:

```json
{
  "tipo_documento": "VVR",
  "cadastro_imovel": "123.456.0789-0",
  "valor_venal_referencia": 450000.00,
  "endereco_completo": "RUA DAS FLORES, 123, APTO 45, JARDIM PAULISTA, SAO PAULO-SP, CEP 01401-000",
  "data_consulta": "27/01/2026",
  "ano_referencia": 2026,
  "metadados_extracao": {
    "confianca_geral": "alta",
    "campos_ilegiveis": [],
    "validacoes_executadas": [
      "sql_formato_valido",
      "valor_positivo"
    ]
  }
}
```

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cadastro_imovel (SQL) | IPTU, ITBI, CND_MUNICIPAL, CND_IMOVEL, DADOS_CADASTRAIS, MATRICULA_IMOVEL | Identificar unicamente o imovel no cadastro municipal |
| endereco_completo | IPTU, ITBI, MATRICULA_IMOVEL, ESCRITURA | Validar endereco do imovel |
| valor_venal_referencia | ITBI (dados_calculo.vvr) | Validar base de calculo do ITBI |

### 5.2 Diferenca entre Valor Venal IPTU e VVR

| Aspecto | Valor Venal IPTU | Valor Venal de Referencia (VVR) |
|---------|------------------|--------------------------------|
| **Finalidade** | Calculo do IPTU anual | Calculo do ITBI em transacoes |
| **Metodologia** | Base historica, atualizada anualmente | Base de mercado, especifica para transacoes |
| **Valor tipico** | Geralmente menor | Geralmente maior (mais proximo do mercado) |
| **Campo mapeado** | imovel_valor_venal_iptu | imovel_valor_venal_referencia |
| **Documento fonte** | IPTU, DADOS_CADASTRAIS | VVR, ITBI |

**Regra Pratica**: O VVR e sempre >= Valor Venal IPTU para o mesmo imovel.

### 5.3 Redundancia Intencional

O VVR e **fonte primaria** para:

1. **imovel_valor_venal_referencia**: O valor especifico para calculo do ITBI
2. **Validacao de SQL**: Confirma o cadastro municipal do imovel

**Validacoes Cruzadas Recomendadas**:

- **VVR x ITBI**: O VVR no documento de ITBI (`dados_calculo.vvr`) deve ser igual ou proximo ao VVR consultado
- **VVR x IPTU**: O SQL deve coincidir exatamente
- **VVR x MATRICULA**: O endereco deve ser consistente
- **VVR x CND_MUNICIPAL**: O SQL deve coincidir

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

As seguintes validacoes sao executadas automaticamente na extracao:

- [x] **sql_formato_valido**: Verifica se o SQL segue o padrao `XXX.XXX.XXXX-X`
- [x] **valor_positivo**: Verifica se o valor venal e maior que zero

### 6.2 Validacoes Adicionais Recomendadas

| Validacao | Formula | Resultado Esperado |
|-----------|---------|-------------------|
| SQL consistente com ITBI | VVR.sql == ITBI.dados_imovel.sql | Verdadeiro |
| VVR consistente com ITBI | VVR.valor == ITBI.dados_calculo.vvr | Verdadeiro (ou proximo) |
| Ano de referencia atual | VVR.ano_referencia >= ano_transacao | Verdadeiro |
| Valor realista | VVR.valor > 10000 | Verdadeiro (imoveis urbanos) |

### 6.3 Campos de Qualidade

| Campo | Descricao | Valores Possiveis |
|-------|-----------|-------------------|
| confianca_geral | Nivel de confianca da extracao | alta (sempre, dado simplicidade) |
| campos_ilegiveis | Lista de campos nao extraidos | [] (raro ter problemas) |

---

## 7. NOTAS TECNICAS

### 7.1 Expressoes Regulares

| Campo | Regex | Exemplo |
|-------|-------|---------|
| cadastro_imovel (SQL) | `\d{3}\.\d{3}\.\d{4}-\d` | "039.080.0244-3" |
| valor_venal_referencia | `R\$\s*[\d.,]+` | "R$ 301.147,00" |
| data_consulta | `\d{2}/\d{2}/\d{4}` | "26/10/2023" |
| ano_referencia | `\d{4}` | "2026" |

### 7.2 Parsing do Endereco

O campo `endereco_completo` precisa ser parseado para extrair componentes:

```
Entrada: "R FRANCISCO CRUZ, 00515 APTO 124 BL-B 04117-902"

Resultado parseado:
- imovel_logradouro: "R FRANCISCO CRUZ"
- imovel_numero: "00515" ou "515"
- imovel_complemento: "APTO 124 BL-B"
- imovel_cep: "04117-902"
```

### 7.3 Conversao de Valores

O valor venal pode vir formatado de diferentes formas:

| Formato de Entrada | Valor Numerico |
|-------------------|----------------|
| "R$ 301.147,00" | 301147.00 |
| "301147.00" | 301147.00 |
| "301.147" | 301147.00 |

### 7.4 Validade do VVR

O VVR e atualizado anualmente pela Prefeitura. Ao usar um VVR para transacao:

1. Verificar se o ano de referencia corresponde ao ano da transacao
2. VVR de anos anteriores pode ser aceito dependendo da politica municipal
3. Em caso de duvida, realizar nova consulta no sistema da prefeitura

---

## 8. REFERENCIAS

### 8.1 Arquivos do Sistema

| Tipo | Caminho |
|------|---------|
| Schema JSON | `execution/schemas/vvr.json` |
| Prompt de Extracao | `execution/prompts/vvr.txt` (se existir) |
| Mapeamento Geral | `execution/mapeamento_documento_campos.json` |

### 8.2 Guias de Campos

| Categoria | Caminho |
|-----------|---------|
| Dados do Imovel | `Guia-de-campos-e-variaveis/campos-dados-imovel.md` |

### 8.3 Cobertura de Campos

Conforme `execution/mapeamento_documento_campos.json`:

| Categoria | Campos Mapeados |
|-----------|-----------------|
| pessoa_natural | 0 |
| pessoa_juridica | 0 |
| imovel | 6 campos |
| negocio | 0 |
| **Total** | **6 campos** |

### 8.4 Links Uteis

| Municipio | URL de Consulta |
|-----------|-----------------|
| Sao Paulo | https://itbi.prefeitura.sp.gov.br |

---

## APENDICE: CHECKLIST DE CAMPOS CRITICOS

Antes de considerar uma extracao completa, verifique:

**Obrigatorios**:
- [ ] cadastro_imovel (SQL) - CRITICO
- [ ] valor_venal_referencia - CRITICO

**Recomendados**:
- [ ] endereco_completo
- [ ] data_consulta

**Validacoes**:
- [ ] SQL no formato correto (XXX.XXX.XXXX-X)
- [ ] Valor maior que zero
- [ ] Data da consulta no ano corrente ou proximo

Se algum campo CRITICO nao foi encontrado:
1. Retornar null para o campo
2. Listar em metadados_extracao.campos_nao_encontrados
3. Mencionar na explicacao contextual

---

## APENDICE B: COMPARATIVO VVR vs IPTU

Para facilitar o entendimento da diferenca entre os dois valores venais:

```
Exemplo Pratico:
- Imovel: Apartamento de 80m2 em Sao Paulo
- Valor Venal IPTU (2026): R$ 280.000,00
- Valor Venal de Referencia (VVR 2026): R$ 450.000,00
- Valor de Venda Declarado: R$ 500.000,00

Calculo do ITBI:
- Base de Calculo = MAX(500.000, 450.000) = R$ 500.000,00
- Aliquota = 3%
- ITBI = R$ 15.000,00

Se o valor de venda fosse R$ 400.000,00:
- Base de Calculo = MAX(400.000, 450.000) = R$ 450.000,00 (VVR prevalece)
- ITBI = R$ 13.500,00
```

Este e o motivo pelo qual o VVR e um campo critico: ele define o piso minimo da tributacao.
