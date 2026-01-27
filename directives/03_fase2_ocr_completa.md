# Fase 2: OCR com Google Document AI - COMPLETA

**Versao:** 1.0
**Data:** 2026-01-27
**Status:** COMPLETA
**Resultado:** 39 documentos processados, 93.36% confianca media, 0 erros

---

## Changelog

### v1.0 (2026-01-27) - Fase 2 Concluida
- Implementacao completa do pipeline de OCR
- Processamento paralelo com ThreadPoolExecutor
- Conversao automatica DOCX -> PDF
- Rate limiting com semaforos
- Validacao com 39 documentos reais

---

## 1. VISAO GERAL

### 1.1 Objetivo
Extrair texto de todos os documentos catalogados na Fase 1 usando Google Document AI, preparando os dados para extracao estruturada na Fase 3.

### 1.2 Arquitetura

```
+------------------+     +-------------------+     +------------------+
|   Catalogo       | --> | Batch OCR         | --> | Texto Extraido   |
|   (Fase 1)       |     | (Document AI)     |     | (.txt files)     |
+------------------+     +-------------------+     +------------------+
        |                        |                        |
        v                        v                        v
   catalogos/              Rate Limiting            .tmp/ocr/
   *.json                  + Retry Logic           {escritura}/
                                                   *.txt
```

### 1.3 Pipeline de Processamento

1. **Leitura do Catalogo** - Carrega catalogo da Fase 1
2. **Preparacao de Arquivos** - Converte DOCX para PDF se necessario
3. **Envio para Document AI** - Processa cada documento
4. **Extracao de Texto** - Extrai texto com confianca
5. **Salvamento** - Grava arquivos .txt e atualiza catalogo
6. **Relatorio** - Gera relatorio de processamento

---

## 2. SCRIPTS IMPLEMENTADOS

### 2.1 `execution/ocr_document_ai.py`
**Responsabilidade:** Processar documento individual via Document AI

**Funcionalidades:**
- Conexao com Document AI
- Suporte a PDF, JPEG, PNG, TIFF, GIF, BMP, WEBP
- Conversao automatica DOCX -> PDF (via COM/Word)
- Calculo de confianca media
- Tratamento de erros

**Uso:**
```bash
python execution/ocr_document_ai.py "caminho/para/documento.pdf"
```

**Saida:** Texto extraido + metadados (confianca, paginas, etc.)

### 2.2 `execution/batch_ocr.py`
**Responsabilidade:** Processar todos documentos de uma escritura

**Funcionalidades:**
- Leitura do catalogo existente
- Processamento em lote (serial ou paralelo)
- Rate limiting configuravel
- Atualizacao do catalogo com status OCR
- Geracao de relatorio JSON
- Modo mock para testes

**Uso:**
```bash
# Modo serial (padrao)
python execution/batch_ocr.py FC_515_124_p280509

# Modo paralelo (recomendado)
python execution/batch_ocr.py FC_515_124_p280509 --parallel --workers 4

# Modo mock (teste)
python execution/batch_ocr.py FC_515_124_p280509 --mock

# Reprocessar tudo
python execution/batch_ocr.py FC_515_124_p280509 --force
```

**Flags:**
| Flag | Descricao | Padrao |
|------|-----------|--------|
| `--parallel` | Ativa processamento paralelo | Desativado |
| `--workers N` | Numero de workers | 4 |
| `--force` | Reprocessa documentos ja processados | Desativado |
| `--mock` | Simula OCR sem chamar API | Desativado |

### 2.3 `execution/clean_temp_files.py`
**Responsabilidade:** Limpar arquivos temporarios gerados

**Funcionalidades:**
- Remove PDFs temporarios de conversao DOCX
- Limpa cache de processamento
- Mantem arquivos de saida (.txt, .json)

---

## 3. ESTRUTURA DE OUTPUTS

### 3.1 Arquivos de Texto Extraido
```
.tmp/ocr/
└── FC_515_124_p280509/
    ├── 001_RG_COMPRADORA.txt
    ├── 002_CNDT_VENDEDOR.txt
    ├── 003_MATRICULA_IMOVEL.txt
    └── ...
```

**Formato do arquivo .txt:**
- Texto bruto extraido
- Encoding: UTF-8
- Uma linha por paragrafo detectado

### 3.2 Relatorio de Processamento
```
.tmp/ocr/FC_515_124_p280509_relatorio.json
```

**Estrutura:**
```json
{
  "escritura_id": "FC_515_124_p280509",
  "data_processamento": "2026-01-27T14:30:00",
  "tempo_total_segundos": 100,
  "estatisticas": {
    "total": 39,
    "sucesso": 39,
    "erro": 0,
    "confianca_media": 93.36
  },
  "documentos": [
    {
      "id": "001",
      "arquivo": "RG.jpg",
      "status": "sucesso",
      "confianca": 95.2,
      "paginas": 1,
      "caracteres": 450
    }
  ]
}
```

### 3.3 Catalogo Atualizado
Campos adicionados ao catalogo da Fase 1:
```json
{
  "arquivos": [
    {
      "id": "001",
      "nome": "RG.jpg",
      "tipo_documento": "RG",
      "status_ocr": "sucesso",
      "data_ocr": "2026-01-27T14:30:00",
      "confianca_ocr": 95.2,
      "arquivo_texto": ".tmp/ocr/FC_515_124_p280509/001_RG.txt"
    }
  ]
}
```

---

## 4. RESULTADOS DA VALIDACAO

### 4.1 Metricas Gerais
| Metrica | Valor |
|---------|-------|
| Total de documentos | 39 |
| Processados com sucesso | 39 (100%) |
| Erros | 0 |
| Confianca media | 93.36% |
| Tempo total (paralelo) | ~1m 40s |
| Workers utilizados | 4 |

### 4.2 Qualidade por Tipo de Documento

**Melhor qualidade (>95%):**
| Tipo | Confianca | Observacao |
|------|-----------|------------|
| COMPROVANTE_PAGAMENTO | 97.7% | Documentos digitais, texto claro |
| VVR | 97.1% | Formato padronizado prefeitura |
| ITBI | 96.6% | Guias oficiais, boa qualidade |
| CND_MUNICIPAL | 96.2% | Certidoes digitais |

**Qualidade media (90-95%):**
| Tipo | Confianca | Observacao |
|------|-----------|------------|
| MATRICULA_IMOVEL | 94.8% | Varies com qualidade da copia |
| RG | 93.5% | Fotos de celular frequentes |
| CNDT | 92.1% | Documentos online |

**Qualidade aceitavel (<90%):**
| Tipo | Confianca | Observacao |
|------|-----------|------------|
| CERTIDAO_NASCIMENTO | 84.1% | Documentos antigos, fontes cursivas |

### 4.3 Conversao DOCX
| Arquivo | Confianca | Observacao |
|---------|-----------|------------|
| Minuta.docx | 92.25% | Conversao automatica funcionou |
| Custas.docx | 97.22% | Tabelas preservadas |

---

## 5. DECISOES TECNICAS

### 5.1 Processamento Paralelo
**Decisao:** ThreadPoolExecutor com semaforos para rate limiting

**Justificativa:**
- Document AI tem limites de requisicoes por minuto
- Processamento de arquivos (leitura, conversao) e CPU-bound
- Solucao: paralelizar I/O, controlar taxa de requisicoes

**Implementacao:**
```python
from concurrent.futures import ThreadPoolExecutor
import threading

semaphore = threading.Semaphore(MAX_CONCURRENT_REQUESTS)

def process_with_rate_limit(doc):
    with semaphore:
        return process_document(doc)

with ThreadPoolExecutor(max_workers=4) as executor:
    results = executor.map(process_with_rate_limit, documents)
```

### 5.2 Conversao DOCX -> PDF
**Decisao:** Usar COM automation com Microsoft Word

**Justificativa:**
- Document AI nao suporta DOCX nativamente
- Word via COM preserva formatacao melhor que alternativas
- Disponivel em ambiente Windows com Office instalado

**Implementacao:**
```python
import win32com.client
import pythoncom

def convert_docx_to_pdf(docx_path, pdf_path):
    pythoncom.CoInitialize()  # Necessario para threading
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
        doc = word.Documents.Open(docx_path)
        doc.SaveAs(pdf_path, FileFormat=17)  # 17 = PDF
        doc.Close()
        word.Quit()
    finally:
        pythoncom.CoUninitialize()
```

**Nota:** `pythoncom.CoInitialize()` e obrigatorio quando usando COM em threads.

### 5.3 Encoding de Arquivos
**Decisao:** UTF-8 com BOM para compatibilidade Windows

**Problema encontrado:** Arquivos .txt sem BOM exibiam caracteres corrompidos em editores Windows.

**Solucao:**
```python
with open(output_path, 'w', encoding='utf-8-sig') as f:
    f.write(texto)
```

### 5.4 Tratamento de Erros
**Estrategia:** Continuar processamento em caso de erro individual

```python
for doc in documentos:
    try:
        resultado = processar_ocr(doc)
        sucessos.append(resultado)
    except Exception as e:
        erros.append({
            'documento': doc,
            'erro': str(e)
        })
        # Continua para proximo documento
```

**Tipos de erro tratados:**
- Arquivo nao encontrado
- Formato nao suportado
- Timeout de API
- Erro de conversao DOCX
- Documento corrompido

---

## 6. LICOES APRENDIDAS

### 6.1 COM Threading
**Problema:** `pywintypes.com_error` ao usar Word em threads paralelas

**Causa:** COM objects precisam ser inicializados por thread

**Solucao:** Chamar `pythoncom.CoInitialize()` no inicio de cada thread

### 6.2 Encoding UTF-16
**Problema:** Alguns documentos PDF tinham texto em UTF-16, causando erros de decode

**Solucao:** Normalizar para UTF-8 durante extracao

### 6.3 Rate Limiting
**Problema:** Muitas requisicoes simultaneas causavam erros 429

**Solucao:** Semaforo limitando requisicoes concorrentes + delay entre batches

### 6.4 Arquivos Temporarios
**Problema:** PDFs temporarios de conversao DOCX acumulando

**Solucao:** Script de limpeza `clean_temp_files.py` + limpeza automatica apos processamento

---

## 7. PROXIMOS PASSOS (Fase 3)

### 7.1 Extracao Estruturada
Com os textos extraidos, a Fase 3 ira:
1. Analisar padroes de texto por tipo de documento
2. Criar extratores especificos (regex + heuristicas)
3. Usar Gemini para extracao inteligente de campos
4. Gerar JSONs estruturados por documento

### 7.2 Documentos Prioritarios
| Tipo | Campos a Extrair | Complexidade |
|------|-----------------|--------------|
| RG | Nome, RG, Orgao, UF, Data | Media |
| CNDT | Numero, Data, Nome, CPF | Baixa |
| MATRICULA_IMOVEL | N. Matricula, RI, Descricao | Alta |
| ITBI | N. Guia, Valor, Base Calculo | Baixa |

### 7.3 Melhorias Futuras para OCR
1. **Cache de resultados** - Evitar reprocessamento desnecessario
2. **OCR seletivo** - Processar apenas paginas relevantes de PDFs grandes
3. **Fallback Gemini** - Usar Gemini Vision para documentos com OCR ruim
4. **Validacao cruzada** - Comparar OCR com classificacao visual

---

## 8. REFERENCIAS

### 8.1 APIs e Servicos
- [Google Document AI](https://cloud.google.com/document-ai)
- Processador: `9bc0134de4126073`
- Projeto GCP: `ia-cartorio-fluxo-minutas`
- Regiao: `us`

### 8.2 Dependencias
```
google-cloud-documentai>=2.0.0
pywin32>=300  # Para conversao DOCX
```

### 8.3 Arquivos Relacionados
| Arquivo | Descricao |
|---------|-----------|
| `execution/ocr_document_ai.py` | OCR documento individual |
| `execution/batch_ocr.py` | Processamento em lote |
| `execution/clean_temp_files.py` | Limpeza de temporarios |
| `.tmp/ocr/` | Outputs de texto extraido |
| `.tmp/catalogos/` | Catalogos atualizados |

---

*Este documento registra a conclusao bem-sucedida da Fase 2.*
*Proxima fase: Extracao Estruturada de Dados*
*Ultima atualizacao: 2026-01-27*
