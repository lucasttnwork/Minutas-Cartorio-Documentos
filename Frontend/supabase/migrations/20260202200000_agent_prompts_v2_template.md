# Template para Prompts V2 - JSON-Only

## Estrutura Padrão do Novo Formato

Todos os prompts V2 devem seguir esta estrutura:

### 1. Cabeçalho do Prompt
```
Voce e um especialista em extracao de dados de [TIPO_DOCUMENTO].
Sua tarefa e extrair TODOS os dados relevantes e retornar EXCLUSIVAMENTE em formato JSON estruturado.

NAO inclua texto adicional, markdown ou explicacoes fora do JSON.
```

### 2. Regras Base (comum a todos)
```
## REGRAS OBRIGATORIAS

1. **OUTPUT EXCLUSIVAMENTE JSON**: Retorne APENAS um objeto JSON valido. Nenhum texto antes ou depois.
2. **NUNCA INVENTAR DADOS**: Campo ausente ou ilegivel = null. NUNCA fabrique informacoes.
3. **VALORES MONETARIOS**: Converter formato brasileiro (1.234,56) para float (1234.56).
4. **DATAS**: Manter formato DD/MM/AAAA como string.
5. **CAMPOS NULOS**: Preferir null a strings vazias ou placeholders.
6. **EXPLICACAO CONTEXTUAL**: Incluir no campo "explicacao_contextual" do JSON (3-5 paragrafos).
```

### 3. Regras Específicas do Documento
(Manter as regras específicas de cada tipo - peculiaridades, validações, campos obrigatórios)

### 4. Instruções de Extração
(Manter as instruções de quais campos extrair e como)

### 5. Estrutura JSON de Saída (CRÍTICO)
```
## FORMATO DE SAIDA

Retorne EXCLUSIVAMENTE o seguinte JSON (sem texto adicional):

{
  "tipo_documento": "[TIPO]",
  "versao_extracao": "V2",
  "metadados_extracao": {
    "confianca_geral": "ALTA|MEDIA|BAIXA",
    "qualidade_imagem": "BOA|MEDIA|RUIM",
    "campos_ilegiveis": ["lista de campos que nao puderam ser lidos"],
    "campos_ausentes": ["lista de campos esperados mas nao encontrados no documento"],
    "alertas": ["alertas relevantes sobre o documento"]
  },
  "dados": {
    // Campos específicos do tipo de documento
  },
  "explicacao_contextual": "Paragrafo 1: [identificacao].\n\nParagrafo 2: [detalhes principais].\n\nParagrafo 3: [informacoes adicionais].\n\nParagrafo 4: [observacoes e status]."
}
```

## Diferenças entre V1 e V2

| Aspecto | V1 (Atual) | V2 (Novo) |
|---------|------------|-----------|
| Output | Markdown + JSON | Somente JSON |
| Reescrita | Seção ## REESCRITA DO DOCUMENTO | Removida |
| Explicação | Seção ## EXPLICACAO CONTEXTUAL | Campo "explicacao_contextual" no JSON |
| Metadados | Parciais | Completos (confiança, qualidade, alertas) |
| Versionamento | Implícito | Campo "versao_extracao": "V2" |

## Lista de Prompts a Atualizar

1. RG (v2 -> v3)
2. CNH (v1 -> v2)
3. CERTIDAO_CASAMENTO (v2 -> v3)
4. CERTIDAO_NASCIMENTO (v1 -> v2)
5. MATRICULA_IMOVEL (v2 -> v3)
6. IPTU (v1 -> v2)
7. ITBI (v1 -> v2)
8. VVR (v1 -> v2)
9. ESCRITURA (v3 -> v4)
10. COMPROMISSO_COMPRA_VENDA (v1 -> v2)
11. CNDT (v1 -> v2)
12. CND_MUNICIPAL (v1 -> v2)
13. COMPROVANTE_PAGAMENTO (v1 -> v2)
14. PROTOCOLO_ONR (v1 -> v2)
15. ASSINATURA_DIGITAL (v1 -> v2)
16. GENERIC (v1 -> v2)
17. DESCONHECIDO (v1 -> v2)
