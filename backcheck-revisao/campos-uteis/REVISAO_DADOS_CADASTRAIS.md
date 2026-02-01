# REVISAO: campos-uteis/DADOS_CADASTRAIS.md

**Data da Revisao**: 2026-01-30
**Status**: OK - SEM PROBLEMAS CRITICOS

---

## VERIFICACOES OBRIGATORIAS

### 1. Total de Campos Uteis
- **Declarado no documento**: 13 campos
- **No mapeamento oficial**: 13 campos
- **Status**: ✓ CORRETO

### 2. Lista de Campos - Comparacao

**Campos no Mapeamento (execution/mapeamento_documento_campos.json)**:
```
imovel: [
  "matricula_numero",
  "imovel_sql",
  "imovel_logradouro",
  "imovel_numero",
  "imovel_complemento",
  "imovel_bairro",
  "imovel_cidade",
  "imovel_estado",
  "imovel_cep",
  "imovel_area_total",
  "imovel_area_construida",
  "imovel_denominacao",
  "imovel_data_certidao_cadastro"
]
```

**Campos no Documento campos-uteis**:
```
imovel: [
  "matricula_numero",
  "imovel_sql",
  "imovel_logradouro",
  "imovel_numero",
  "imovel_complemento",
  "imovel_bairro",
  "imovel_cidade",
  "imovel_estado",
  "imovel_cep",
  "imovel_area_total",
  "imovel_area_construida",
  "imovel_denominacao",
  "imovel_data_certidao_cadastro"
]
```

**Status**: ✓ IDENTICOS

### 3. Categorias Verificadas

| Categoria | Mapeamento | Documento | Status |
|-----------|-----------|-----------|--------|
| pessoa_natural | 0 campos | 0 campos | ✓ CORRETO |
| pessoa_juridica | 0 campos | 0 campos | ✓ CORRETO |
| imovel | 13 campos | 13 campos | ✓ CORRETO |
| negocio | 0 campos | 0 campos | ✓ CORRETO |

### 4. Campos Extras
**Status**: ✓ NENHUM campo extra foi adicionado

### 5. Campos Omitidos
**Status**: ✓ NENHUM campo foi omitido

---

## QUALIDADE DA DOCUMENTACAO

### Pontos Fortes
1. Secao "Diferenca vs. IPTU" muito util e esclarecedora
2. Tabela comparativa entre DADOS_CADASTRAIS e IPTU bem detalhada
3. Secao sobre "Multiplos Contribuintes" explica que dados estao visiveis mas nao mapeados
4. Mapeamento reverso completo e preciso
5. Exemplos JSON corretos
6. Correlacao com outros documentos bem documentada

### Observacoes
- Documento esta completo e nao apresenta problemas
- A explicacao sobre dados de contribuintes (secao 3) deixa claro que nome/CPF/CNPJ aparecem no documento mas nao sao extraidos como campos uteis
- Esta decisao esta alinhada com a estrategia de obter dados de PF/PJ de documentos especificos (RG, CONTRATO_SOCIAL, etc.)

---

## CONCLUSAO

**DOCUMENTO APROVADO SEM RESSALVAS**

Todos os 13 campos mapeados estao corretos, categorias estao corretas, e nenhum campo foi adicionado ou omitido indevidamente.
