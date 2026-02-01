# REVISAO: CERTIDAO_OBITO.md

**Data da Revisao**: 2026-01-30
**Revisor**: Claude Agent
**Status**: PROBLEMAS IDENTIFICADOS

---

## PROBLEMAS CRITICOS

### 1. SCHEMA NAO EXISTE
- **Gravidade**: CRITICA
- **Linha**: 4
- **Problema**: Documento afirma "Nao possui schema dedicado (extracao generica)"
- **Impacto**: Sem schema JSON em `execution/schemas/certidao_obito.json`, o sistema nao pode extrair dados estruturados
- **Acao**: Criar schema JSON seguindo o padrao dos outros documentos (certidao_nascimento.json, certidao_casamento.json)

### 2. EXEMPLOS DE EXTRACAO NAO CORRESPONDEM A REALIDADE
- **Gravidade**: ALTA
- **Linhas**: 215-349
- **Problema**: Exemplos JSON mostram estruturas nested complexas (falecido.nome_completo, filiacao.pai, conjuge.nome, obito.data) que NAO correspondem ao formato flat usado nos schemas reais
- **Evidencia**: Schemas de certidao_nascimento.json e certidao_casamento.json usam campos flat (nome_pai, nome_mae, data_nascimento), nao objetos nested
- **Impacto**: Documentacao enganosa, desenvolvedor tentara extrair campos que nao existem
- **Acao**: Corrigir exemplos para formato flat

### 3. MAPEAMENTO DE CAMPOS INCORRETO
- **Gravidade**: ALTA
- **Linhas**: 158-169
- **Problema**: Secao 3.1 lista campos "nome_falecido", "cpf_falecido", etc. mas Exemplos JSON (linhas 215+) usam "falecido.nome_completo", "falecido.cpf"
- **Inconsistencia**: Documentacao contradiz a si mesma
- **Acao**: Unificar nomenclatura - usar formato flat consistente com outros schemas

---

## PROBLEMAS DE ESTRUTURA

### 4. REGEX INVALIDA PARA MATRICULA
- **Gravidade**: MEDIA
- **Linha**: 89
- **Problema**: Regex `\d{6}\s?\d{2}\s?\d{2}\s?\d{4}\s?\d\s?\d{5}\s?\d{3}\s?\d{7}-\d{2}` permite espacos, mas exemplo mostra espacos obrigatorios
- **Comparacao**: Schema certidao_nascimento.json usa pontos como separadores: `\d{6}\.\d{2}\.\d{2}\.\d{4}\.\d\.\d{5}\.\d{3}\.\d{7}-\d{2}`
- **Acao**: Corrigir regex para usar pontos ou explicar por que obito usa espacos

### 5. TIPOS DE DADOS INCONSISTENTES
- **Gravidade**: MEDIA
- **Problema**: Tabelas mostram "tipo: date" mas nao especificam formato (ISO 8601, DD/MM/YYYY, etc)
- **Comparacao**: Schema certidao_nascimento.json especifica formato com regex `\d{2}/\d{2}/\d{4}`
- **Acao**: Adicionar coluna "Formato" nas tabelas ou especificar na descricao

---

## PROBLEMAS DE CONTEUDO

### 6. CAMPOS OBRIGATORIOS CONFLITANTES
- **Gravidade**: MEDIA
- **Linhas**: 99-101
- **Problema**: Secao 2.2 afirma que apenas 2 campos sao obrigatorios (nome_falecido, data_obito)
- **Comparacao**: Schema certidao_nascimento.json marca 3 campos como obrigatorios, certidao_casamento.json marca 5
- **Questao**: Por que certidao de obito tem menos campos obrigatorios?
- **Acao**: Revisar com especialista juridico ou explicar no documento

### 7. FALTAM EXEMPLOS REAIS DE EXTRACAO
- **Gravidade**: MEDIA
- **Problema**: Nao foram encontrados arquivos *_CERTIDAO_OBITO.json em `.tmp/contextual/`
- **Impacto**: Impossivel validar se exemplos correspondem a extraçoes reais do sistema
- **Acao**: Processar certidoes de obito reais e adicionar JSONs de saida ao repositorio

---

## CAMPOS AUSENTES NO SCHEMA

### 8. CAMPOS DOCUMENTADOS MAS SEM SCHEMA
**Problema**: Os seguintes campos sao mencionados na documentacao mas nao existe schema JSON para valida-los:

- matricula, livro, folha, termo (Secao 2.1)
- nome_falecido, data_obito, cpf_falecido, rg_falecido (Secoes 2.2-2.3)
- filiacao_pai, filiacao_mae (Secao 2.4)
- conjuge, regime_bens (Secao 2.5)
- cartorio, municipio_cartorio, estado_cartorio, data_registro, data_emissao, selo_digital (Secao 2.6)
- declarante, medico_atestante, cemiterio, data_sepultamento (Secao 2.7)

**Total**: ~25 campos documentados, 0 campos em schema JSON

---

## RECOMENDACOES

1. **CRIAR SCHEMA JSON** (URGENTE): Usar certidao_nascimento.json e certidao_casamento.json como template
2. **CORRIGIR EXEMPLOS**: Remover estruturas nested, usar formato flat
3. **VALIDAR COM DADOS REAIS**: Processar certidoes de obito reais e validar campos extraiveis
4. **UNIFICAR NOMENCLATURA**: Decidir entre "nome_falecido" ou "nome_completo" e usar consistentemente
5. **DOCUMENTAR FORMATO DE DATAS**: Especificar ISO 8601 ou DD/MM/YYYY
6. **ADICIONAR NIVEL_EXTRACAO**: Campos devem ter nivel_extracao (1, 2, 3) como nos outros schemas

---

## PONTOS POSITIVOS

- Secao 1.4 (Modelo Antigo vs Novo) e EXCELENTE, muito didatica
- Secao 5 (Correlacao com Outros Documentos) e util e bem estruturada
- Secao 8 (Uso em Inventarios) e relevante para o contexto de cartorios
- Validacoes de negocio (Secao 6.2) mostram entendimento do dominio

---

## PRIORIDADE DE CORRECAO

1. CRITICA: Criar schema JSON
2. ALTA: Corrigir exemplos de extracao (formato flat)
3. ALTA: Unificar nomenclatura de campos
4. MEDIA: Validar com dados reais
5. BAIXA: Melhorias de formatacao e clareza
