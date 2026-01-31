# CNH - Carteira Nacional de Habilitacao

**Complexidade de Extracao**: MEDIA
**Schema Fonte**: Baseado em prompts de extracao
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A CNH (Carteira Nacional de Habilitacao) e o documento oficial que comprova a habilitacao do cidadao para conduzir veiculos automotores no territorio brasileiro. Emitida pelos DETRANs (Departamentos Estaduais de Transito) de cada estado, a CNH tambem funciona como documento de identificacao civil, sendo aceita em todo o territorio nacional.

O documento e fundamental para:
- Identificacao das partes em escrituras publicas (alternativa ao RG)
- Qualificacao completa em contratos de compra e venda
- Comprovacao de identidade em atos cartoriais
- Validacao de dados pessoais quando o RG nao esta disponivel

### 1.2 Padroes de Identificacao Visual

O sistema identifica documentos CNH atraves dos seguintes padroes textuais:

- `CNH`
- `CARTEIRA NACIONAL DE HABILITACAO`
- `DETRAN`
- `PERMISSAO PARA DIRIGIR`
- `CATEGORIA` (A, B, AB, C, D, E)
- `REGISTRO`
- `HABILITACAO`

### 1.3 Formatos Comuns

| Formato | Caracteristicas | Campos Especificos |
|---------|-----------------|-------------------|
| **Modelo Antigo (Papel)** | Documento em papel, formato retangular, cor predominante verde ou rosa | Campos basicos, pode nao ter CPF impresso |
| **Modelo Novo (Polimero)** | Policarbonato, cor branca/azul, foto laser | CPF obrigatorio, QR Code, numero do espelho |
| **CNH Digital** | Versao eletronica disponivel no app CDT | Todos os campos, QR Code de validacao, codigo de seguranca |
| **PPD (Permissao Para Dirigir)** | CNH provisoria para condutores iniciantes | Validade de 1 ano, restricoes especiais |

---

## 2. CAMPOS EXTRAIVEIS COMPLETOS

### 2.1 Campos Raiz (Obrigatorios)

| Campo | Tipo | Descricao | Exemplo | Regex | Confianca |
|-------|------|-----------|---------|-------|-----------|
| numero_registro | string | Numero da CNH (registro) | "12345678901" | `\d{9,11}` | Alta |
| nome_completo | string | Nome completo do titular | "MARIA DA SILVA" | `[A-Z][A-Z\s]+` | Alta |
| cpf | string | CPF do titular | "123.456.789-00" | `\d{3}\.\d{3}\.\d{3}-\d{2}` | Alta |
| data_nascimento | date | Data de nascimento | "10/05/1985" | `\d{2}/\d{2}/\d{4}` | Alta |
| categoria | string | Categoria de habilitacao | "AB" | `[A-E]{1,2}` | Alta |
| data_validade | date | Data de validade da CNH | "10/05/2031" | `\d{2}/\d{2}/\d{4}` | Alta |
| orgao_emissor | string | DETRAN emissor | "DETRAN" | `DETRAN` | Alta |
| uf_emissor | string | UF do DETRAN emissor | "SP" | `[A-Z]{2}` | Alta |

### 2.2 Campos Raiz (Opcionais)

| Campo | Tipo | Descricao | Exemplo | Quando Presente | Confianca |
|-------|------|-----------|---------|-----------------|-----------|
| rg | string | Numero do RG impresso na CNH | "12.345.678-9" | Sempre | Alta |
| orgao_rg | string | Orgao emissor do RG | "SSP" | Sempre | Alta |
| uf_rg | string | UF do orgao emissor do RG | "SP" | Sempre | Alta |
| filiacao_pai | string | Nome do pai | "JOSE DA SILVA" | Quase sempre (~90%) | Media |
| filiacao_mae | string | Nome da mae | "ANA DA SILVA" | Sempre | Alta |
| data_primeira_habilitacao | date | Data da primeira CNH | "15/03/2003" | Sempre | Alta |
| data_emissao | date | Data de emissao desta CNH | "10/05/2021" | Sempre | Alta |
| local_emissao | string | Local de emissao | "SAO PAULO/SP" | Sempre | Media |
| observacoes | string | Observacoes e restricoes | "OBRIGATORIO USO DE LENTES" | Quando aplicavel | Media |
| numero_espelho | string | Numero do espelho | "123456789" | Modelo novo | Alta |
| codigo_seguranca | string | Codigo de seguranca | "ABCD1234EFGH5678" | Modelo novo/digital | Alta |
| naturalidade | string | Local de nascimento | "SAO PAULO/SP" | Modelo novo | Media |

### 2.3 Objetos Nested

#### 2.3.1 filiacao (extraido como campos separados)

A filiacao e representada como campos individuais no schema:

| Subcampo | Tipo | Descricao | Exemplo | Obrigatorio |
|----------|------|-----------|---------|-------------|
| filiacao_pai | string | Nome completo do pai | "JOSE DA SILVA" | Nao |
| filiacao_mae | string | Nome completo da mae | "ANA DA SILVA" | Sim |

**Nota**: O campo `filiacao_pai` pode estar ausente em casos de paternidade nao reconhecida.

#### 2.3.2 habilitacao (object - dados da habilitacao)

Campos especificos da habilitacao agrupados logicamente:

| Subcampo | Tipo | Descricao | Exemplo | Frequencia |
|----------|------|-----------|---------|------------|
| categoria | string | Categoria da habilitacao | "AB" | Sempre |
| numero_registro | string | Numero de registro da CNH | "12345678901" | Sempre |
| primeira_habilitacao | date | Data da primeira habilitacao | "15/03/2003" | Sempre |
| data_emissao | date | Data de emissao | "10/05/2021" | Sempre |
| data_validade | date | Data de validade | "10/05/2031" | Sempre |
| local_emissao | string | Local de emissao | "SAO PAULO/SP" | Sempre |
| observacoes | string | Restricoes e observacoes | "LENTES" | Quando aplicavel |

#### 2.3.3 elementos_presentes (object - metadados de qualidade)

Campos booleanos que indicam a presenca de elementos visuais:

| Subcampo | Tipo | Descricao | Uso |
|----------|------|-----------|-----|
| foto | boolean | Foto do titular presente e legivel | Validacao de qualidade |
| assinatura_titular | boolean | Assinatura do titular presente | Validacao de qualidade |
| qr_code | boolean | QR Code presente | Modelos novos/digital |

---

## 3. MAPEAMENTO SCHEMA → MODELO DE DADOS

### 3.1 Campos que Alimentam "Pessoa Natural"

| Campo no Schema | Campo Mapeado | Usado em Minutas? | Prioridade |
|-----------------|---------------|-------------------|------------|
| nome_completo | NOME | SIM | Alta |
| cpf | CPF | SIM | Alta |
| rg | RG | SIM | Alta |
| orgao_rg | ORGAO EMISSOR DO RG | SIM | Alta |
| uf_rg | ESTADO EMISSOR DO RG | SIM | Alta |
| numero_registro | CNH | SIM | Alta |
| orgao_emissor + uf_emissor | ORGAO EMISSOR DA CNH | SIM | Alta |
| data_nascimento | DATA DE NASCIMENTO | SIM | Alta |
| filiacao_pai | FILIACAO PAI | SIM | Media |
| filiacao_mae | FILIACAO MAE | SIM | Media |

**Nota sobre orgao_emissor_cnh**: Este campo e computado concatenando "DETRAN-" + uf_emissor (ex: "DETRAN-SP").

### 3.2 Campos que Alimentam "Pessoa Juridica"

A CNH **nao alimenta** diretamente campos de Pessoa Juridica.

No entanto, os dados da CNH sao usados para qualificar:
- Socios de empresas
- Representantes legais (administradores)
- Procuradores de pessoas juridicas

### 3.3 Campos que Alimentam "Dados do Imovel"

A CNH **nao alimenta** campos de Imovel.

### 3.4 Campos que Alimentam "Negocio Juridico"

A CNH **nao alimenta** diretamente campos de Negocio Juridico.

Os dados sao usados para qualificar as partes (outorgantes, outorgados) nos negocios.

### 3.5 Campos Nao Mapeados

| Campo no Schema | Motivo da Exclusao | Observacao |
|-----------------|-------------------|------------|
| categoria | Nao relevante para minutas cartoriais | Dado de habilitacao veicular |
| data_validade | Metadado do documento | Apenas controle de validade |
| data_primeira_habilitacao | Nao relevante para minutas | Dado historico de habilitacao |
| data_emissao | Metadado do documento | Controle interno |
| local_emissao | Metadado do documento | Controle interno |
| observacoes | Restricoes de conducao | Nao relevante para atos cartoriais |
| numero_espelho | Metadado do documento | Identificador interno DETRAN |
| codigo_seguranca | Metadado do documento | Validacao de autenticidade |
| elementos_presentes | Metadados de qualidade | Uso interno do pipeline |

---

## 4. EXEMPLO DE EXTRACAO REAL

```json
{
  "tipo_documento": "CNH",
  "dados_catalogados": {
    "nome_completo": "MARIA DA SILVA",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "orgao_emissor_rg": "SSP",
    "uf_rg": "SP",
    "data_nascimento": "10/05/1985",
    "filiacao": {
      "pai": "JOSE DA SILVA",
      "mae": "ANA DA SILVA"
    },
    "habilitacao": {
      "categoria": "AB",
      "numero_registro": "12345678901",
      "primeira_habilitacao": "15/03/2003",
      "data_emissao": "10/05/2021",
      "data_validade": "10/05/2031",
      "local_emissao": "SAO PAULO/SP",
      "observacoes": null
    },
    "campos_vazios": [],
    "elementos_presentes": {
      "foto": true,
      "assinatura_titular": true
    }
  },
  "pessoa_relacionada": "MARIA DA SILVA",
  "confianca_extracao": {
    "geral": 0.95,
    "campos_alta_confianca": ["nome_completo", "cpf", "rg", "data_nascimento", "categoria"],
    "campos_media_confianca": ["filiacao", "local_emissao"]
  }
}
```

**Fonte**: `.tmp/contextual/GS_357_11_p281773/018_CNH.json`

---

## 5. CORRELACAO COM OUTROS DOCUMENTOS

### 5.1 Campos Compartilhados

| Campo | Tambem Presente Em | Uso na Correlacao |
|-------|-------------------|-------------------|
| cpf | RG, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, CONTRATO_SOCIAL | Identificador unico da pessoa |
| rg | RG, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL, PROCURACAO | Identificacao secundaria |
| nome_completo | Todos os documentos de pessoa | Match por nome (fuzzy) |
| data_nascimento | RG, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO | Validar identidade |
| filiacao (pai/mae) | RG, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO | Confirmar identidade |

### 5.2 Redundancia Intencional

A CNH pode ser usada como **alternativa ao RG** para identificacao pessoal. Ambos os documentos extraem:
- CPF
- RG (numero, orgao e UF)
- Dados de filiacao (pai e mae)
- Data de nascimento

Esta redundancia e intencional para:

1. **Validacao cruzada**: Confirmar que os dados batem entre documentos
2. **Preenchimento por disponibilidade**: Se RG nao esta legivel, usar dados da CNH
3. **Deteccao de inconsistencias**: Alertar quando dados divergem
4. **Completude**: Garantir que campos criticos nunca fiquem vazios

### 5.3 Hierarquia de Fontes para Identificacao

Para dados de identificacao pessoal, a prioridade de extracao e:

1. **RG** - Fonte primaria para dados de RG
2. **CNH** - Fonte primaria para CNH, fonte secundaria para RG
3. **CERTIDAO_CASAMENTO** - Dados complementares de filiacao e estado civil
4. **CERTIDAO_NASCIMENTO** - Dados de nascimento originais

**Quando usar CNH como fonte principal:**
- RG ausente ou ilegivel no dossi
- CNH mais recente que RG disponivel
- Necessidade de dados especificos da habilitacao (raro em minutas)

---

## 6. VALIDACOES E CONFERENCIAS

### 6.1 Validacoes Automaticas

| Validacao | Descricao | Tipo |
|-----------|-----------|------|
| cpf_digito_verificador | Verifica se CPF tem digitos validos | Estrutural |
| data_nascimento_valida | Data no passado e pessoa com idade razoavel (18-100 anos para CNH) | Logica |
| data_validade_futura | Data de validade deve ser futura ou recente | Logica |
| categoria_valida | Categoria deve ser A, B, AB, C, D, E ou combinacoes validas | Estrutural |
| uf_valida | UF deve ser uma das 27 UFs brasileiras | Estrutural |
| numero_registro_formato | Numero de registro deve ter 9-11 digitos | Estrutural |

### 6.2 Campos de Qualidade

| Campo | Tipo | Descricao |
|-------|------|-----------|
| elementos_presentes.foto | boolean | Foto do titular visivel e legivel |
| elementos_presentes.assinatura_titular | boolean | Assinatura presente no documento |
| confianca_extracao.geral | float | Score de confianca geral (0-1) |
| campos_vazios | array | Lista de campos que existem mas estao sem valor |

### 6.3 Alertas de Qualidade

O sistema gera alertas quando:
- CNH vencida (data_validade no passado)
- Foto ilegivel ou ausente
- CPF ausente (deveria estar sempre presente)
- Divergencia entre dados da CNH e RG do mesmo titular
- Categoria inconsistente (ex: menor de 18 anos com categoria B)

---

## 7. NOTAS TECNICAS

### 7.1 Campos Computados

| Campo | Computacao | Exemplo |
|-------|------------|---------|
| orgao_emissor_cnh | Concatenacao de "DETRAN-" + uf_emissor | "DETRAN-SP" |

### 7.2 Campos Inferidos

| Campo | Inferencia | Observacao |
|-------|------------|------------|
| tipo_cnh | Inferido do layout visual | antiga_papel, nova_polimero, digital |
| modelo_cnh | Inferido das caracteristicas | Presenca de QR Code, chip, etc |

### 7.3 Campos Raros

| Campo | Frequencia | Contexto |
|-------|------------|----------|
| observacoes | ~15% | Presente quando ha restricoes medicas |
| numero_espelho | ~60% | Apenas em CNHs novas (pos-2017) |
| codigo_seguranca | ~40% | Apenas em CNHs novas e digitais |
| naturalidade | ~50% | Nem sempre presente em modelos antigos |
| filiacao_pai | ~90% | Ausente quando paternidade nao reconhecida |

### 7.4 Particularidades por Modelo

| Modelo | Caracteristicas | Campos Especificos |
|--------|-----------------|-------------------|
| **CNH Antiga (Papel)** | Cor verde/rosa, documento em papel | Pode nao ter CPF, campos basicos |
| **CNH Nova (Polimero)** | Cor branca/azul, policarbonato | CPF obrigatorio, numero espelho, QR Code |
| **CNH Digital** | App CDT, versao eletronica | Codigo seguranca, validacao online |
| **PPD** | Permissao Provisoria | Validade 1 ano, restricoes especiais |

### 7.5 Categorias de Habilitacao

| Categoria | Veiculos Permitidos |
|-----------|---------------------|
| A | Motocicletas |
| B | Veiculos ate 3.500kg |
| AB | Motocicletas + Veiculos ate 3.500kg |
| C | Veiculos de carga > 3.500kg |
| D | Veiculos de passageiros > 8 lugares |
| E | Combinacao de veiculos com reboque > 6.000kg |

---

## 8. REFERENCIAS

- **Prompt de Extracao**: `execution/prompts/cnh.txt`
- **Guia de Campos Pessoa Natural**: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`
- **Documentacao de Campos Uteis**: `documentacao-campos-extraiveis/campos-uteis/`
- **Documentacao RG (similar)**: `documentacao-campos-extraiveis/campos-completos/RG.md`

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial completa |
