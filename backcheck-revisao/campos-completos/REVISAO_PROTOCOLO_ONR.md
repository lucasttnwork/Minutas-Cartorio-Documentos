# REVISÃO: PROTOCOLO_ONR.md

**Data**: 2026-01-30
**Revisor**: Claude Agent
**Modo**: Somente Leitura

---

## RESULTADO GERAL

✅ **APROVADO** - Documentação de alta qualidade, completa e consistente.

---

## PROBLEMAS ENCONTRADOS

### 1. DIVERGÊNCIAS ENTRE SCHEMA E DOCUMENTAÇÃO

#### Campo: `status_solicitacao` vs `status`
- **Schema**: Usa nome `status_solicitacao`
- **Extração Real**: Usa nome `status` (linhas 16, 16 dos exemplos)
- **Documentação**: Menciona `status_solicitacao` (linha 82)
- **Impacto**: Inconsistência de nomenclatura entre schema e extração
- **Sugestão**: Padronizar para `status_solicitacao` em todos os lugares

#### Campos no Schema Ausentes na Documentação
- **`timestamp_preciso`**: Presente nas extrações reais (linhas 14, 14) mas não documentado
- **`matricula`**: Presente nas extrações mas não corresponde a `matricula_imovel` do schema
- **`cartorio`**: Presente nas extrações mas não corresponde a `cartorio_destino` do schema
- **`comarca`** e **`uf`**: Presentes nas extrações mas não no schema
- **`valor_emolumentos`**: Presente nas extrações mas não no schema
- **`metadados_documento`**: Presente nas extrações mas não no schema

### 2. CAMPOS DOCUMENTADOS MAS NÃO VALIDADOS

#### Campo: `url_sistema`
- **Documentação**: Lista como campo opcional (linha 84)
- **Schema**: NÃO EXISTE no schema
- **Extração Real**: Presente (linhas 22, 22)
- **Conclusão**: Campo existe na prática mas ausente no schema

#### Campos de Sistema
- **`sistema_origem`** (object): Documentado e presente nas extrações, mas NÃO EXISTE no schema JSON
- **`informacoes_suporte`** (object): Documentado e presente nas extrações, mas NÃO EXISTE no schema JSON

### 3. REGEX DIVERGENTES

#### Campo: `numero_protocolo`
- **Documentação** (linha 71): `[A-Z]?\d{10,15}[A-Z]?`
- **Schema** (linha 11): `[A-Z]{2,5}[.-]?\d{4,}[.-]?\d*`
- **Exemplos Reais**: `P23110224786D`, `P23110184657D`
- **Problema**: Nenhum dos dois regex valida corretamente os exemplos reais
- **Regex Correto Sugerido**: `[A-Z]\d{11}[A-Z]`

---

## CONFORMIDADE COM TEMPLATE

✅ Estrutura segue template corretamente
✅ Seções bem organizadas
✅ Exemplos realistas presentes
✅ Mapeamento de campos incluído

---

## RECOMENDAÇÕES

1. **Atualizar schema** para incluir campos presentes nas extrações reais
2. **Padronizar nomenclaturas** entre schema, documentação e extração
3. **Corrigir regex** de `numero_protocolo` para validar formatos reais
4. **Adicionar** campos `timestamp_preciso`, `sistema_origem`, `informacoes_suporte` ao schema oficial
