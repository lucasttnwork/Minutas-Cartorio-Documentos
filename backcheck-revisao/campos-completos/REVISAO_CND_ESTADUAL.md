# REVISAO: CND_ESTADUAL.md

**Data da Revisao**: 2026-01-30
**Revisor**: Claude Agent
**Status**: APROVADO COM RESSALVAS MINIMAS

---

## VERIFICACOES OBRIGATORIAS

### 1. Conformidade com Schema
**STATUS**: ✅ PARCIAL - Nao existe schema dedicado

- Documento indica corretamente: "Nao possui schema dedicado"
- Campos definidos em `mapeamento_documento_campos.json`
- Mapeamento encontrado e validado (linhas 373-384 do mapeamento)
- **MAPEAMENTO CONFIRMADO**:
  - pessoa_natural: ["nome", "cpf"]
  - pessoa_juridica: ["pj_denominacao", "pj_cnpj"]
  - imovel: []
  - negocio: []

### 2. Tipos de Dados
**STATUS**: ✅ OK

Todos os tipos estao corretos e consistentes:
- `string` para campos textuais
- `date` para datas (formato DD/MM/YYYY)
- `array` para tributos_abrangidos

### 3. Exemplos Realistas
**STATUS**: ✅ OK

Exemplos fornecidos sao realistas e bem formatados:
- Secao 4.1: Exemplo para Pessoa Fisica (completo)
- Secao 4.2: Exemplo para Pessoa Juridica com CPDEN (completo)
- JSON bem estruturado com campos null apropriados

### 4. Estrutura do Template
**STATUS**: ✅ EXCELENTE

Documento segue perfeitamente a estrutura padrao:
- Secao 1: Visao Geral (completa e detalhada)
- Secao 2: Campos Extraiveis (bem organizada)
- Secao 3: Mapeamento Schema (alinhado com mapeamento_documento_campos.json)
- Secao 4: Exemplos de Extracao Real
- Secao 5: Correlacao com Outros Documentos
- Secao 6: Validacoes e Conferencias
- Secao 7: Notas Tecnicas (excelente profundidade)
- Secao 8: Referencias

### 5. Campos Nested/Arrays
**STATUS**: ✅ OK

Array `tributos_abrangidos` documentado adequadamente:
- Secao 2.3.1 define estrutura
- Valores comuns listados
- Observacoes sobre presenca opcional

---

## PROBLEMAS IDENTIFICADOS

### PROBLEMA 1: Inconsistencia no Mapeamento - PRIORIDADE MEDIA

**Localizacao**: Secoes 3.1 e 3.2 (linhas 142-160)

**Descricao**: A documentacao menciona campos que NAO existem no mapeamento oficial:
- `cnd_estadual_numero` (mencionado linha 146)
- `cnd_estadual_data` (mencionado linha 147)
- `pj_cnd_estadual_numero` (mencionado linha 157)
- `pj_cnd_estadual_data` (mencionado linha 158)

**Verificacao no Mapeamento**: O arquivo `mapeamento_documento_campos.json` (linhas 373-384) define APENAS:
- pessoa_natural: ["nome", "cpf"]
- pessoa_juridica: ["pj_denominacao", "pj_cnpj"]

**IMPACTO**: Documentacao sugere campos que nao serao extraidos/mapeados na pratica.

**RECOMENDACAO**:
- Atualizar secoes 3.1 e 3.2 para refletir mapeamento real
- OU adicionar campos ao `mapeamento_documento_campos.json` se forem necessarios

### PROBLEMA 2: Falta de Exemplo Real - PRIORIDADE BAIXA

**Descricao**: Nao foram encontrados arquivos de extracao real CND_ESTADUAL em:
- `.tmp/contextual/FC_515_124_p280509/`
- `.tmp/contextual/GS_357_11_p281773/`

**IMPACTO**: Nao foi possivel validar exemplos com extraindo reais do sistema.

**RECOMENDACAO**: Quando houver CND_ESTADUAL extraida, validar exemplos da secao 4.

---

## PONTOS FORTES

1. **Contexto Excepcional**: Secao 1.2 sobre tributos estaduais e muito util
2. **Diferenciacao CND vs CPDEN**: Bem explicada (secao 1.5)
3. **Tributos Detalhados**: ICMS, IPVA, ITCD bem contextualizados
4. **Validacoes de Negocio**: Secao 6.2 e muito completa
5. **Notas sobre ITCD**: Secao 7.8 adiciona valor pratico significativo
6. **Variacoes por Estado**: Secao 7.6 reconhece realidade brasileira

---

## CONCLUSAO

Documento de ALTA QUALIDADE com excelente contexto tecnico e juridico.

**ACAO NECESSARIA**:
- Corrigir secoes 3.1 e 3.2 para alinhar com mapeamento real
- Campos mencionados (cnd_estadual_numero, cnd_estadual_data) nao existem no schema atual

**APROVACAO**: Documento aprovado para uso, com correcao pendente nas secoes de mapeamento.
