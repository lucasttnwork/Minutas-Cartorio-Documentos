# OUTRO / DESCONHECIDO - Categoria Fallback para Documentos Nao Reconhecidos

**Complexidade de Extracao**: N/A (Nao Aplicavel)
**Schema Fonte**: `execution/schemas/desconhecido.json`
**Ultima Atualizacao**: 2026-01-30

---

## 1. VISAO GERAL

### 1.1 Descricao

A categoria **OUTRO** (ou **DESCONHECIDO**) e uma categoria residual do sistema, usada quando nenhum outro tipo de documento consegue ser identificado automaticamente. Este schema serve como:

- **Fallback**: Captura documentos que nao se encaixam em nenhuma categoria conhecida
- **Mecanismo de Aprendizado**: Coleta informacoes para criacao de novos tipos de documento
- **Sinalizador de Revisao**: Indica que o documento precisa de analise manual

**Este tipo de documento NAO contribui com campos uteis para minutas.**

Quando um documento e classificado como DESCONHECIDO, o sistema tenta:
1. Extrair o maximo de informacoes possiveis
2. Sugerir um tipo de documento apropriado
3. Propor um schema para futura implementacao
4. Identificar caracteristicas que permitam reconhecimento automatico

### 1.2 Quando um Documento vai para OUTRO

Um documento e classificado como DESCONHECIDO quando:
- Nao corresponde a nenhum dos padroes de identificacao dos tipos conhecidos
- O texto extraido nao contem palavras-chave suficientes para classificacao
- A qualidade da imagem/digitalizacao impede reconhecimento
- E um tipo de documento novo ainda nao implementado no sistema

### 1.3 Padroes de Identificacao

Nao ha padroes especificos - esta categoria e usada por exclusao.

O sistema usa as seguintes palavras-chave para marcar explicitamente como desconhecido:
- `DESCONHECIDO`
- `NAO IDENTIFICADO`
- `DOCUMENTO NAO RECONHECIDO`

---

## 2. CAMPOS DO SCHEMA DESCONHECIDO

O schema `desconhecido.json` e estruturado para coletar informacoes que permitam criar novos tipos de documento.

### 2.1 analise_documento (object) - Obrigatorio

Objeto contendo a analise detalhada do documento.

| SUBCAMPO | TIPO | OBRIGATORIO | DESCRICAO | EXEMPLO |
|----------|------|-------------|-----------|---------|
| DOCUMENTO_RECONHECIDO | BOOLEAN | Sim | Indica se corresponde a tipo existente | false |
| TIPO_IDENTIFICADO | STRING | Nao | Tipo identificado se conhecido | "CERTIDAO_NASCIMENTO" |
| TIPO_SUGERIDO | STRING | Sim | Nome sugerido em SNAKE_CASE | "LAUDO_AVALIACAO_IMOVEL" |
| CATEGORIA_RECOMENDADA | STRING | Sim | Uma das 5 categorias do sistema | "DOCUMENTOS_IMOVEL" |
| CONFIANCA_ANALISE | STRING | Sim | Nivel de confianca (alta/media/baixa) | "media" |
| JUSTIFICATIVA | STRING | Sim | Explicacao da analise e recomendacao | "..." |
| ORGAO_EMISSOR | STRING | Nao | Nome do orgao emissor identificado | "Prefeitura Municipal" |
| DATA_DOCUMENTO | DATE | Nao | Data do documento (DD/MM/AAAA) | "15/03/2024" |
| QUALIDADE_IMAGEM | STRING | Nao | Qualidade da digitalizacao | "media" |

**Categorias validas:**
- DOCUMENTOS_PESSOAIS
- CERTIDOES
- DOCUMENTOS_IMOVEL
- DOCUMENTOS_NEGOCIO
- DOCUMENTOS_ADMINISTRATIVOS

### 2.2 caracteristicas_identificadoras (object) - Obrigatorio

Caracteristicas que ajudam a identificar o tipo de documento.

| SUBCAMPO | TIPO | OBRIGATORIO | DESCRICAO | EXEMPLO |
|----------|------|-------------|-----------|---------|
| PALAVRAS_CHAVE | ARRAY | Sim | Palavras distintivas encontradas | ["CERTIDAO", "REGISTRO", "IMOVEIS"] |
| ELEMENTOS_LAYOUT | ARRAY | Nao | Elementos de layout caracteristicos | ["cabecalho_brasao", "tabela_valores"] |
| ELEMENTOS_VISUAIS | ARRAY | Nao | Elementos visuais distintivos | ["brasao_republica", "qr_code"] |
| PADROES_NUMERACAO | ARRAY | Nao | Padroes de numeracao encontrados | ["numero_matricula_6_digitos"] |

### 2.3 campos_recomendados (array) - Obrigatorio

Lista de campos que devem ser extraidos deste tipo de documento.

Cada item do array contem:

| CAMPO | TIPO | OBRIGATORIO | DESCRICAO |
|-------|------|-------------|-----------|
| NOME | STRING | Sim | Nome do campo em snake_case |
| TIPO | STRING | Sim | Tipo de dado (string, date, number, boolean, array, object) |
| OBRIGATORIO | BOOLEAN | Sim | Se o campo e obrigatorio |
| REGEX | STRING | Nao | Expressao regular para validacao |
| DESCRICAO | STRING | Sim | Descricao do campo |
| EXEMPLO | STRING | Nao | Exemplo de valor |

### 2.4 padroes_identificacao (object) - Obrigatorio

Padroes para identificacao automatica futura.

| SUBCAMPO | TIPO | OBRIGATORIO | DESCRICAO |
|----------|------|-------------|-----------|
| PALAVRAS_OBRIGATORIAS | ARRAY | Nao | Palavras que DEVEM estar presentes |
| PALAVRAS_OPCIONAIS | ARRAY | Nao | Palavras que ajudam na identificacao |
| LAYOUT_ESPERADO | STRING | Nao | Descricao do layout esperado |
| REGEX_IDENTIFICACAO | ARRAY | Nao | Expressoes regulares para identificacao |

### 2.5 schema_sugerido (object) - Obrigatorio

Schema JSON completo proposto para este tipo de documento. Formato livre, exemplo:

```json
{
  "tipo_documento": "NOVO_TIPO",
  "versao": "1.0",
  "descricao": "Descricao do documento",
  "complexidade": "MEDIA",
  "campos": [
    {
      "nome": "campo_exemplo",
      "tipo": "string",
      "obrigatorio": true
    }
  ],
  "padroes_identificacao": ["PALAVRA_CHAVE"],
  "validacoes": ["validacao_exemplo"]
}
```

### 2.6 dados_extraidos (object) - Obrigatorio

Dados que foram possiveis extrair do documento.

| SUBCAMPO | TIPO | OBRIGATORIO | DESCRICAO |
|----------|------|-------------|-----------|
| EXPLICACAO_CONTEXTUAL | STRING | Sim | Explicacao detalhada (3-5 paragrafos) |
| PARTES | ARRAY | Nao | Partes/pessoas envolvidas |
| VALORES | OBJECT | Nao | Valores monetarios encontrados |
| DATAS_IMPORTANTES | ARRAY | Nao | Datas relevantes |
| NUMEROS_IDENTIFICADORES | ARRAY | Nao | Numeros e codigos identificadores |
| IMOVEL | OBJECT | Nao | Dados de imovel se presente |
| OBSERVACOES | STRING | Nao | Observacoes adicionais |

---

## 3. MAPEAMENTO PARA MINUTAS

### 3.1 Campos Uteis Mapeados: ZERO

Este tipo de documento **NAO CONTRIBUI** com campos para geracao de minutas.

Documentos classificados como DESCONHECIDO:
- Nao alimentam dados de Pessoa Natural
- Nao alimentam dados de Pessoa Juridica
- Nao alimentam dados de Imovel
- Nao alimentam dados de Negocio Juridico

### 3.2 Motivo

Os campos extraidos de documentos desconhecidos sao:
- Genericos demais para uso direto
- Nao validados quanto a estrutura esperada
- Destinados exclusivamente a analise e proposta de novo tipo

---

## 4. ACOES NECESSARIAS

Quando um documento e classificado como DESCONHECIDO:

### 4.1 Revisao Manual Obrigatoria

1. **Verificar classificacao**: Conferir se realmente nao e um tipo conhecido
2. **Avaliar sugestao**: Analisar `tipo_sugerido` e `categoria_recomendada`
3. **Decidir acao**:
   - Se e documento irrelevante: descartar
   - Se e documento conhecido mal identificado: reclassificar
   - Se e documento novo necessario: criar novo tipo

### 4.2 Criacao de Novo Tipo

Se o documento deve ser incorporado ao sistema:

1. Usar `schema_sugerido` como base
2. Refinar `campos_recomendados`
3. Validar `padroes_identificacao.palavras_obrigatorias`
4. Criar arquivo `execution/schemas/[novo_tipo].json`
5. Criar prompt `execution/prompts/[novo_tipo].txt`
6. Adicionar ao mapeamento `execution/mapeamento_documento_campos.json`

---

## 5. VALIDACOES

### 5.1 Validacoes do Schema

| VALIDACAO | DESCRICAO |
|-----------|-----------|
| TIPO_SUGERIDO_SNAKE_CASE | Tipo sugerido deve estar em SNAKE_CASE |
| CATEGORIA_VALIDA | Categoria deve ser uma das 5 aceitas |
| CAMPOS_RECOMENDADOS_NAO_VAZIO | Array de campos nao pode ser vazio |
| SCHEMA_SUGERIDO_VALIDO | Schema proposto deve ser JSON valido |

---

## 6. EXEMPLO DE EXTRACAO

```json
{
  "tipo_documento": "DESCONHECIDO",
  "analise_documento": {
    "documento_reconhecido": false,
    "tipo_sugerido": "LAUDO_AVALIACAO_IMOVEL",
    "categoria_recomendada": "DOCUMENTOS_IMOVEL",
    "confianca_analise": "media",
    "justificativa": "Documento apresenta caracteristicas de laudo tecnico com avaliacao de imovel, contendo valor venal e de mercado, porem nao corresponde a nenhum tipo cadastrado no sistema.",
    "orgao_emissor": "Engenheiro Autonomo",
    "data_documento": "15/01/2024",
    "qualidade_imagem": "boa"
  },
  "caracteristicas_identificadoras": {
    "palavras_chave": ["LAUDO", "AVALIACAO", "VALOR VENAL", "VALOR DE MERCADO", "ART", "CREA"],
    "elementos_layout": ["cabecalho_profissional", "tabela_valores", "fotos_imovel"],
    "elementos_visuais": ["logo_crea", "carimbo_art"],
    "padroes_numeracao": ["numero_art_10_digitos"]
  },
  "campos_recomendados": [
    {
      "nome": "numero_art",
      "tipo": "string",
      "obrigatorio": true,
      "descricao": "Numero da ART do profissional"
    },
    {
      "nome": "valor_avaliacao",
      "tipo": "number",
      "obrigatorio": true,
      "descricao": "Valor de avaliacao do imovel"
    }
  ],
  "padroes_identificacao": {
    "palavras_obrigatorias": ["LAUDO", "AVALIACAO"],
    "palavras_opcionais": ["ART", "CREA", "ENGENHEIRO"],
    "layout_esperado": "Documento tecnico com cabecalho profissional, descricao do imovel e tabela de valores"
  },
  "schema_sugerido": {
    "tipo_documento": "LAUDO_AVALIACAO_IMOVEL",
    "versao": "1.0",
    "descricao": "Laudo de avaliacao tecnica de imovel",
    "complexidade": "MEDIA",
    "campos": []
  },
  "dados_extraidos": {
    "explicacao_contextual": "Este documento e um laudo de avaliacao imobiliaria emitido por engenheiro civil...",
    "valores": {
      "valor_avaliacao": 450000.00
    },
    "imovel": {
      "endereco": "Rua das Flores, 123"
    }
  }
}
```

---

## 7. CORRELACAO COM OUTROS DOCUMENTOS

**Esta categoria NAO possui correlacao com outros documentos.**

Documentos DESCONHECIDO sao isolados do fluxo principal ate que:
- Sejam descartados como irrelevantes
- Sejam reclassificados para um tipo conhecido
- Um novo tipo seja criado para acomoda-los

---

## 8. REFERENCIAS

- **Schema JSON**: `execution/schemas/desconhecido.json`
- **Mapeamento Geral**: `execution/mapeamento_documento_campos.json`

---

## CHANGELOG

| DATA | VERSAO | ALTERACAO |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial |
