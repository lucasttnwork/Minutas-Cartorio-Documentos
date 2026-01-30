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

| Subcampo | Tipo | Obrigatorio | Descricao | Exemplo |
|----------|------|-------------|-----------|---------|
| documento_reconhecido | boolean | Sim | Indica se corresponde a tipo existente | false |
| tipo_identificado | string | Nao | Tipo identificado se conhecido | "CERTIDAO_NASCIMENTO" |
| tipo_sugerido | string | Sim | Nome sugerido em SNAKE_CASE | "LAUDO_AVALIACAO_IMOVEL" |
| categoria_recomendada | string | Sim | Uma das 5 categorias do sistema | "DOCUMENTOS_IMOVEL" |
| confianca_analise | string | Sim | Nivel de confianca (alta/media/baixa) | "media" |
| justificativa | string | Sim | Explicacao da analise e recomendacao | "..." |
| orgao_emissor | string | Nao | Nome do orgao emissor identificado | "Prefeitura Municipal" |
| data_documento | date | Nao | Data do documento (DD/MM/AAAA) | "15/03/2024" |
| qualidade_imagem | string | Nao | Qualidade da digitalizacao | "media" |

**Categorias validas:**
- DOCUMENTOS_PESSOAIS
- CERTIDOES
- DOCUMENTOS_IMOVEL
- DOCUMENTOS_NEGOCIO
- DOCUMENTOS_ADMINISTRATIVOS

### 2.2 caracteristicas_identificadoras (object) - Obrigatorio

Caracteristicas que ajudam a identificar o tipo de documento.

| Subcampo | Tipo | Obrigatorio | Descricao | Exemplo |
|----------|------|-------------|-----------|---------|
| palavras_chave | array | Sim | Palavras distintivas encontradas | ["CERTIDAO", "REGISTRO", "IMOVEIS"] |
| elementos_layout | array | Nao | Elementos de layout caracteristicos | ["cabecalho_brasao", "tabela_valores"] |
| elementos_visuais | array | Nao | Elementos visuais distintivos | ["brasao_republica", "qr_code"] |
| padroes_numeracao | array | Nao | Padroes de numeracao encontrados | ["numero_matricula_6_digitos"] |

### 2.3 campos_recomendados (array) - Obrigatorio

Lista de campos que devem ser extraidos deste tipo de documento.

Cada item do array contem:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| nome | string | Sim | Nome do campo em snake_case |
| tipo | string | Sim | Tipo de dado (string, date, number, boolean, array, object) |
| obrigatorio | boolean | Sim | Se o campo e obrigatorio |
| regex | string | Nao | Expressao regular para validacao |
| descricao | string | Sim | Descricao do campo |
| exemplo | string | Nao | Exemplo de valor |

### 2.4 padroes_identificacao (object) - Obrigatorio

Padroes para identificacao automatica futura.

| Subcampo | Tipo | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| palavras_obrigatorias | array | Nao | Palavras que DEVEM estar presentes |
| palavras_opcionais | array | Nao | Palavras que ajudam na identificacao |
| layout_esperado | string | Nao | Descricao do layout esperado |
| regex_identificacao | array | Nao | Expressoes regulares para identificacao |

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

| Subcampo | Tipo | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| explicacao_contextual | string | Sim | Explicacao detalhada (3-5 paragrafos) |
| partes | array | Nao | Partes/pessoas envolvidas |
| valores | object | Nao | Valores monetarios encontrados |
| datas_importantes | array | Nao | Datas relevantes |
| numeros_identificadores | array | Nao | Numeros e codigos identificadores |
| imovel | object | Nao | Dados de imovel se presente |
| observacoes | string | Nao | Observacoes adicionais |

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

| Validacao | Descricao |
|-----------|-----------|
| tipo_sugerido_snake_case | Tipo sugerido deve estar em SNAKE_CASE |
| categoria_valida | Categoria deve ser uma das 5 aceitas |
| campos_recomendados_nao_vazio | Array de campos nao pode ser vazio |
| schema_sugerido_valido | Schema proposto deve ser JSON valido |

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

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial |
