# OUTRO / DESCONHECIDO - Categoria Fallback (Campos Uteis)

**Total de Campos Uteis**: 0 campos
**Categorias**: Pessoa Natural (0), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este tipo de documento **NAO CONTRIBUI** com campos uteis para o projeto de minutas cartoriais.

**Por que ZERO campos?**
- A categoria OUTRO (DESCONHECIDO) e uma categoria residual/fallback
- Documentos classificados aqui nao tem estrutura reconhecida
- Os dados extraidos sao genericos e nao validados
- Serve exclusivamente para analise e proposta de novos tipos

**Proposito Real:**
Esta categoria existe para capturar documentos que nao se encaixam em nenhum tipo conhecido, permitindo:
1. Coleta de informacoes para criacao de novos tipos
2. Sinalizacao de documentos que precisam revisao manual
3. Aprendizado continuo do sistema

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (0 campos)

Nenhum campo mapeado.

### 2.2 Pessoa Juridica (0 campos)

Nenhum campo mapeado.

### 2.3 Imovel (0 campos)

Nenhum campo mapeado.

### 2.4 Negocio Juridico (0 campos)

Nenhum campo mapeado.

---

## 3. MAPEAMENTO REVERSO

**N/A** - Este tipo de documento nao possui mapeamento para campos uteis.

Os campos do schema `desconhecido.json` (como `analise_documento`, `caracteristicas_identificadoras`, `campos_recomendados`, etc.) servem exclusivamente para propor novos tipos de documento, nao para alimentar minutas.

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

**Nota:** Todas as categorias vazias. Documentos DESCONHECIDO nao alimentam nenhuma estrutura de minuta.

---

## 5. USO EM MINUTAS

### 5.1 Este Documento NAO e Usado em Minutas

Documentos classificados como OUTRO/DESCONHECIDO:
- NAO alimentam dados de Pessoa Natural
- NAO alimentam dados de Pessoa Juridica
- NAO alimentam dados de Imovel
- NAO alimentam dados de Negocio Juridico
- NAO participam da geracao automatica de minutas

### 5.2 Motivo

Os campos extraidos de documentos desconhecidos sao:
- Genericos demais para uso direto em minutas
- Nao validados quanto a estrutura esperada
- Destinados exclusivamente a analise e proposta de novo tipo

---

## 6. PROPOSITO REAL DA CATEGORIA

### 6.1 Fallback do Sistema

A categoria OUTRO serve como rede de seguranca para documentos que:
- Nao correspondem a nenhum dos padroes de identificacao conhecidos
- Tem texto extraido sem palavras-chave suficientes para classificacao
- Possuem qualidade de imagem que impede reconhecimento
- Sao tipos novos ainda nao implementados no sistema

### 6.2 Mecanismo de Aprendizado

Quando um documento e classificado como DESCONHECIDO, o sistema tenta:
1. **Extrair informacoes**: Coletar o maximo de dados possiveis
2. **Sugerir tipo**: Propor um nome para o tipo de documento
3. **Propor schema**: Criar estrutura JSON para implementacao futura
4. **Identificar padroes**: Encontrar caracteristicas para reconhecimento automatico

### 6.3 Sinalizador de Revisao

Todo documento DESCONHECIDO e um candidato a revisao manual, permitindo:
- Verificar se foi mal classificado
- Avaliar se e um tipo novo necessario
- Decidir se deve ser descartado

---

## 7. ACOES RECOMENDADAS

Quando um documento vai para a categoria OUTRO:

### 7.1 Revisao Manual

1. **Verificar classificacao**: Conferir se realmente nao e um tipo conhecido
2. **Avaliar sugestao do sistema**: Analisar `tipo_sugerido` e `categoria_recomendada`
3. **Decidir acao**:
   - Se irrelevante: descartar
   - Se mal identificado: reclassificar para tipo correto
   - Se tipo novo necessario: criar novo tipo de documento

### 7.2 Reclassificacao

Se o documento deveria ser de um tipo conhecido:
- Verificar qualidade da digitalizacao
- Checar se o texto foi extraido corretamente
- Reprocessar com o tipo correto

### 7.3 Criacao de Novo Tipo

Se o documento representa um tipo novo necessario:
1. Usar `schema_sugerido` como base
2. Refinar `campos_recomendados`
3. Validar `padroes_identificacao.palavras_obrigatorias`
4. Criar arquivo `execution/schemas/[novo_tipo].json`
5. Criar prompt `execution/prompts/[novo_tipo].txt`
6. Adicionar ao mapeamento `execution/mapeamento_documento_campos.json`
7. Documentar em `documentacao-campos-extraiveis/campos-completos/[NOVO_TIPO].md`
8. Documentar em `documentacao-campos-extraiveis/campos-uteis/[NOVO_TIPO].md`

---

## 8. CORRELACAO COM OUTROS DOCUMENTOS

**Esta categoria NAO possui correlacao com outros documentos.**

Documentos DESCONHECIDO sao isolados do fluxo principal ate que:
- Sejam descartados como irrelevantes
- Sejam reclassificados para um tipo conhecido
- Um novo tipo seja criado para acomoda-los

---

## 9. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/desconhecido.json`
- Campos Completos: `campos-completos/OUTRO.md`
