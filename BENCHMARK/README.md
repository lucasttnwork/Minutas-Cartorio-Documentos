# BENCHMARK - Escrituras de Referencia

Esta pasta contem escrituras de compra e venda organizadas em diferentes formatos para servir como **benchmark** de comparacao com o output do pipeline de geracao de minutas.

## Estrutura de Subpastas

A numeracao indica o fluxo de progressao do processamento das escrituras:

### `01-Originais/`
Arquivos **originais** das escrituras finalizadas em formato PDF. Sao os documentos de origem, exatamente como foram emitidos pelo cartorio. **Fonte primaria** de todos os demais processamentos.

### `02-Narrativa/`
**Transcricao em texto fluido**. Utiliza um padrao de escrita narrativo, priorizando a **facil compreensao** e organizacao intuitiva dos dados. Ideal para leitura rapida e entendimento geral do conteudo da escritura.

### `03-Estruturada/`
**Versao analitica** da escritura com dados organizados de forma parametrizada. Inclui:
- Explicacao geral dos pontos principais
- Dados estruturados e categorizados
- Organizacao mais formal e sistematica

### `04-Minuta-Padrao/`
**Versao no padrao de minuta**. Reescrita da escritura original seguindo exatamente o padrao definido nos arquivos da pasta `Minutas-Padrao/` na raiz do projeto. Esta e a versao que deve ser comparada diretamente com o output do pipeline. **Ground truth principal**.

### `05-Guia-Explicativo/`
**Versao educacional e acessivel**. Traducao da escritura em linguagem simples, sem juridiques. Cada documento inclui:
- Resumo "Em Uma Frase" da transacao
- Explicacao detalhada de quem vendeu, quem comprou e o que foi vendido
- Valores e formas de pagamento em tabelas claras
- Glossario de termos tecnicos
- Orientacoes sobre proximos passos

Ideal para comunicacao com clientes e material educacional sobre escrituras.

### `06-Inventario-Campos/`
**Auditoria tecnica de completude**. Mapeamento estruturado de TODOS os campos possiveis em uma escritura, organizado por categorias:
- Pessoas Naturais: dados individuais, familiares, domicilio, contatos, certidoes (109 campos)
- Imoveis: matricula, descricao, cadastro, valores, certidoes, onus (76 campos)
- Negocio Juridico: valores, alienantes, adquirentes, pagamento, declaracoes, ITBI (52+ campos)

Cada campo e marcado com status:
- ✅ Presente - Campo foi preenchido na escritura
- ❌ Nao informado - Campo nao consta no documento
- ⚪ N/A - Campo nao se aplica ao caso especifico

Inclui estatisticas de completude por categoria. Serve como **ground truth** para validacao do pipeline de extracao e identificacao de gaps nos prompts.

---

## Proposito

Os arquivos desta pasta servem como **ground truth** (verdade de referencia) para:

1. **Validar o pipeline** - Comparar o output gerado automaticamente com as versoes de benchmark
2. **Medir acertividade** - Identificar discrepancias entre o resultado automatizado e o esperado
3. **Identificar melhorias** - Encontrar pontos que precisam de ajustes nos prompts, mapeamentos ou logica do pipeline
4. **Testes de regressao** - Garantir que mudancas no sistema nao degradem a qualidade do output

---

## Como Usar para Benchmark

1. Processar os documentos originais (`01-Originais/`) pelo pipeline completo
2. Comparar o output gerado em `output-final-minuta/` com a versao correspondente em `04-Minuta-Padrao/`
3. Para auditoria de completude, verificar se todos os campos presentes em `06-Inventario-Campos/` foram extraidos
4. Documentar diferencas e ajustar o pipeline conforme necessario

### Fluxo de Validacao Recomendado

```
01-Originais (PDF)
    ↓
[Pipeline de Extracao]
    ↓
output-final-minuta/
    ↓
Comparar com → 04-Minuta-Padrao/ (estrutura e conteudo)
Comparar com → 06-Inventario-Campos/ (completude de campos)
```

---

## Nomenclatura de Arquivos

Para facilitar a correlacao, os arquivos nas diferentes subpastas devem seguir um padrao de nomenclatura consistente que permita identificar qual escritura original corresponde a cada versao processada.
