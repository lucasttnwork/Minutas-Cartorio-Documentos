# BENCHMARK - Escrituras de Referencia

Esta pasta contem escrituras de compra e venda organizadas em diferentes formatos para servir como **benchmark** de comparacao com o output do pipeline de geracao de minutas.

## Estrutura de Subpastas

### `Escrituras-Finais-PDF/`
Arquivos **originais** das escrituras finalizadas em formato PDF. Sao os documentos de origem, exatamente como foram emitidos pelo cartorio.

### `Escrituras-Finais-Reescrita-Simplificada/`
**Transcricao simplificada** da escritura original. Utiliza um padrao de escrita menos rigido, priorizando a **facil compreensao** e organizacao intuitiva dos dados. Ideal para leitura rapida e entendimento geral.

### `Escrituras-Finais-Analise/`
**Versao analitica** da escritura com dados organizados de forma parametrizada. Inclui:
- Explicacao geral dos pontos principais
- Dados estruturados e categorizados
- Organizacao mais formal que a reescrita simplificada

### `Escrituras-Finais-Padrao-Minuta/`
**Versao no padrao de minuta**. Reescrita da escritura original seguindo exatamente o padrao definido nos arquivos da pasta `Minutas-Padrao/` na raiz do projeto. Esta e a versao que deve ser comparada diretamente com o output do pipeline.

---

## Proposito

Os arquivos desta pasta servem como **ground truth** (verdade de referencia) para:

1. **Validar o pipeline** - Comparar o output gerado automaticamente com as versoes de benchmark
2. **Medir acertividade** - Identificar discrepancias entre o resultado automatizado e o esperado
3. **Identificar melhorias** - Encontrar pontos que precisam de ajustes nos prompts, mapeamentos ou logica do pipeline
4. **Testes de regressao** - Garantir que mudancas no sistema nao degradem a qualidade do output

---

## Como Usar para Benchmark

1. Processar os documentos originais (`Escrituras-Finais-PDF/`) pelo pipeline completo
2. Comparar o output gerado em `output-final-minuta/` com a versao correspondente em `Escrituras-Finais-Padrao-Minuta/`
3. Documentar diferencas e ajustar o pipeline conforme necessario

---

## Nomenclatura de Arquivos

Para facilitar a correlacao, os arquivos nas diferentes subpastas devem seguir um padrao de nomenclatura consistente que permita identificar qual escritura original corresponde a cada versao processada.
