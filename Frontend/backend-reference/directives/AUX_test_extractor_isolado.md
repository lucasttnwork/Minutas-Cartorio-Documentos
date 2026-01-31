# Test Extractor - Ferramenta de Testes Isolados

> **IMPORTANTE:** Esta ferramenta é para **TESTES FORA DO PIPELINE PRINCIPAL**.
> Use para validar prompts, testar extração de tipos específicos de documentos,
> ou comparar outputs antes de integrar mudanças ao fluxo de produção.

---

## Visão Geral

O `test_extractor.py` é um mini-agente agnóstico de tipo de documento que permite:

- Testar prompts de extração de forma isolada
- Processar documentos avulsos sem passar pelo pipeline completo
- Comparar outputs de diferentes versões de prompts
- Validar novos tipos de documentos antes de integrá-los

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST EXTRACTOR                           │
│              (Fora do Pipeline Principal)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ENTRADA                        SAÍDA                      │
│   ───────                        ─────                      │
│   • Arquivo PDF/imagem    →    • _resultado.json            │
│   • Tipo de documento     →    • _resposta_completa.txt     │
│   • --file ou --folder    →    • relatorio_processamento.json│
│                                                             │
│   PASTA DE OUTPUT:                                          │
│   .tmp/documentos-isolados-tipo-output/<tipo>/              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Quando Usar

| Cenário | Use Test Extractor? |
|---------|---------------------|
| Testar novo prompt antes de deploy | ✅ Sim |
| Validar extração de documento específico | ✅ Sim |
| Comparar V1 vs V2 vs V3 de um prompt | ✅ Sim |
| Processar escritura completa para produção | ❌ Não (use pipeline) |
| Gerar dados para minuta final | ❌ Não (use pipeline) |

---

## Localização

**Script:** `execution/test_extractor.py`

**Prompts:** `execution/prompts/*.txt`

**Output:** `.tmp/documentos-isolados-tipo-output/<tipo>/`

---

## Comandos

### Listar Tipos Disponíveis

```bash
python execution/test_extractor.py --list-types
```

**Saída exemplo:**
```
Tipos de documento disponiveis:
----------------------------------------
  - assinatura_digital
  - certidao_casamento
  - cnh
  - escritura
  - escritura_v2
  - escritura_v3
  - matricula_imovel
  - rg
  ... (15+ tipos)
----------------------------------------
```

### Processar Arquivo Único

```bash
# Sintaxe
python execution/test_extractor.py --type <tipo> --file "<caminho>"

# Exemplo
python execution/test_extractor.py --type escritura_v3 --file "Test-Docs/Documentos-isolados-tipo/Escrituras/280509-VersaoImpressao.pdf"
```

### Processar Pasta Inteira

```bash
# Sintaxe
python execution/test_extractor.py --type <tipo> --folder "<caminho_pasta>"

# Exemplo - Serial (padrão)
python execution/test_extractor.py --type escritura_v3 --folder "Test-Docs/Documentos-isolados-tipo/Escrituras"

# Exemplo - Paralelo (múltiplos workers)
python execution/test_extractor.py --type escritura_v3 --folder "Test-Docs/Documentos-isolados-tipo/Escrituras" --parallel --workers 3
```

### Modo Verbose

```bash
python execution/test_extractor.py --type escritura_v3 --folder "pasta" -v
```

---

## Argumentos

| Argumento | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `--type`, `-t` | Sim | Tipo de documento (nome do prompt sem .txt) |
| `--file`, `-f` | Sim* | Caminho para arquivo único |
| `--folder`, `-d` | Sim* | Caminho para pasta com arquivos |
| `--parallel`, `-p` | Não | Ativa processamento paralelo |
| `--workers`, `-w` | Não | Número de workers paralelos (padrão: 3) |
| `--verbose`, `-v` | Não | Modo verbose com mais logs |
| `--list-types` | Não | Lista tipos disponíveis e sai |

*Use `--file` OU `--folder`, não ambos.

---

## Estrutura de Output

Para cada documento processado, são gerados:

```
.tmp/documentos-isolados-tipo-output/
└── <tipo>/
    ├── <nome_arquivo>_resultado.json       # Dados estruturados extraídos
    ├── <nome_arquivo>_resposta_completa.txt # Resposta raw do Gemini
    └── relatorio_processamento.json         # Estatísticas (se pasta)
```

### Exemplo de Resultado JSON

```json
{
  "arquivo": "280509-VersaoImpressao.pdf",
  "tipo_documento": "escritura_v3",
  "status": "sucesso",
  "erro": null,
  "dados_catalogados": {
    "analise_preliminar": { ... },
    "documento": { ... },
    "partes": [ ... ],
    "imoveis": [ ... ],
    "transacao": { ... },
    "explicacao_contextual": "..."
  },
  "tempo_processamento_s": 35.2
}
```

---

## Versões de Prompts de Escritura

O projeto possui múltiplas versões do prompt de escritura para diferentes casos:

| Prompt | Arquivo | Uso Recomendado |
|--------|---------|-----------------|
| V1 (Original) | `escritura.txt` | Estrutura rígida, inclui transcrição |
| V2 | `escritura_v2.txt` | Mais campos, sem transcrição, ainda rígido |
| **V3 (Recomendado)** | `escritura_v3.txt` | Flexível, agnóstico, lida com casos complexos |

### Quando usar cada versão:

- **V1**: Manter para compatibilidade. Não recomendado para novos usos.
- **V2**: Casos simples com estrutura previsível.
- **V3**: **Recomendado para todos os casos** - lida com:
  - Múltiplos vendedores (nua propriedade + usufruto)
  - Múltiplos casamentos com regimes diferentes
  - Relações familiares entre partes
  - Gravames e cláusulas especiais
  - Estruturas de pagamento complexas

---

## Casos de Uso Práticos

### 1. Testar Novo Prompt

```bash
# Crie o novo prompt
# execution/prompts/novo_tipo.txt

# Teste com documento
python execution/test_extractor.py --type novo_tipo --file "caminho/documento.pdf" -v

# Verifique output
cat .tmp/documentos-isolados-tipo-output/novo_tipo/documento_resultado.json
```

### 2. Comparar Versões de Prompt

```bash
# Processa com V2
python execution/test_extractor.py --type escritura_v2 --file "doc.pdf"

# Processa com V3
python execution/test_extractor.py --type escritura_v3 --file "doc.pdf"

# Compare os outputs
# .tmp/documentos-isolados-tipo-output/escritura_v2/doc_resultado.json
# .tmp/documentos-isolados-tipo-output/escritura_v3/doc_resultado.json
```

### 3. Validar Lote de Documentos

```bash
# Processa pasta inteira
python execution/test_extractor.py --type cnh --folder "Test-Docs/CNHs" --parallel

# Verifica relatório
cat .tmp/documentos-isolados-tipo-output/cnh/relatorio_processamento.json
```

---

## Pasta de Documentos de Teste

O projeto mantém documentos de teste isolados por tipo em:

```
Test-Docs/
└── Documentos-isolados-tipo/
    ├── Escrituras/
    │   ├── 280509-VersaoImpressao.pdf
    │   └── 281773-VersaoImpressao.pdf
    ├── CNHs/
    ├── Matriculas/
    └── ...
```

Use esta estrutura para organizar documentos de teste por tipo.

---

## Diferença do Pipeline Principal

| Aspecto | Test Extractor | Pipeline Principal |
|---------|----------------|-------------------|
| **Propósito** | Testes e validação | Produção |
| **Entrada** | Arquivo(s) avulso(s) | Pasta de escritura completa |
| **Catálogo** | Não usa | Gera catálogo classificado |
| **Fases** | Apenas extração | Classificação → Extração → Mapeamento |
| **Output** | `.tmp/documentos-isolados-tipo-output/` | `.tmp/contextual/` e `.tmp/mapped/` |
| **Uso** | Desenvolvimento/QA | Processamento real |

---

## Rate Limiting

O script respeita o rate limit do Gemini:

- **Delay padrão:** ~4 segundos entre requests (15 RPM free tier)
- **Modo paralelo:** Distribui requests entre workers
- **Fallback automático:** Se `gemini-3-flash-preview` falhar, usa `gemini-2.5-flash`

---

## Troubleshooting

### Erro: "Prompt não encontrado"

```bash
# Verifique se o prompt existe
ls execution/prompts/ | grep <tipo>

# Liste tipos disponíveis
python execution/test_extractor.py --list-types
```

### JSON de dados_catalogados vazio

Possíveis causas:
1. **Prompt muito rígido** - Use versão V3 para escrituras complexas
2. **Documento ilegível** - Verifique qualidade do PDF/imagem
3. **Rate limit** - Aguarde e tente novamente

### Modelo indisponível (503)

O script automaticamente faz fallback para modelos alternativos:
```
gemini-3-flash-preview → gemini-2.5-flash → gemini-2.0-flash
```

---

## Notas de Desenvolvimento

- **Criado para:** Validar prompts e comparar outputs
- **Não substitui:** O pipeline principal de produção
- **Mantenha:** Documentos de teste organizados em `Test-Docs/Documentos-isolados-tipo/`
- **Versione:** Prompts com sufixo `_v2`, `_v3` ao iterar
