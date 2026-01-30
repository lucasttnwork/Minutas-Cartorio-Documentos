# REVISAO: PROTOCOLO_ONR.md (campos-uteis)

**Data**: 2026-01-30
**Revisor**: Claude Agent
**Status**: ERRO CRITICO DETECTADO

---

## 1. RESULTADO DA VERIFICACAO

**STATUS GERAL**: ❌ REPROVADO

**Problemas encontrados**: 1 erro critico

---

## 2. VERIFICACOES OBRIGATORIAS

### 2.1 Total de campos uteis bate com mapeamento?
❌ **ERRO CRITICO**

**Mapeamento oficial** (mapeamento_documento_campos.json):
- Pessoa Natural: 0 campos ✓
- Pessoa Juridica: 0 campos ✓
- Imovel: **2 campos** (matricula_numero, matricula_cartorio_numero)
- Negocio: 0 campos ✓

**Documento campos-uteis/PROTOCOLO_ONR.md**:
- Pessoa Natural: 0 campos ✓
- Pessoa Juridica: 0 campos ✓
- Imovel: **2 campos** (matricula_numero, matricula_cartorio)
- Negocio: 0 campos ✓

**PROBLEMA DETECTADO**:
- Linha 55: Campo mapeado como "**matricula_cartorio**"
- Mapeamento oficial: Campo deve ser "**matricula_cartorio_numero**"

### 2.2 Campos listados sao exatamente os do mapeamento?
❌ **ERRO**: Nome incorreto do campo

**No mapeamento oficial** (linha 797):
```json
"imovel": [
  "matricula_numero",
  "matricula_cartorio_numero"
]
```

**No documento campos-uteis** (linha 55):
```
| matricula_cartorio | Cartorio de destino da solicitacao | ...
```

**DEVE SER**: `matricula_cartorio_numero`

### 2.3 Categorias corretas?
✓ **OK** - Todas as categorias estao corretas (imovel)

### 2.4 Nenhum campo extra foi adicionado?
✓ **OK** - Nenhum campo extra

### 2.5 Nenhum campo foi omitido?
✓ **OK** - Todos os 2 campos estao presentes (apesar do nome incorreto)

---

## 3. MAPEAMENTO REVERSO

**Problema na linha 70**:
```
| cartorio_destino | matricula_cartorio | imovel |
```

**DEVE SER**:
```
| cartorio_destino | matricula_cartorio_numero | imovel |
```

---

## 4. CORRECAO NECESSARIA

### Arquivo: campos-uteis/PROTOCOLO_ONR.md

**Linha 55** - Alterar de:
```
| matricula_cartorio | Cartorio de destino da solicitacao | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | NAO |
```

Para:
```
| matricula_cartorio_numero | Cartorio de destino da solicitacao | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | NAO |
```

**Linha 70** - Alterar de:
```
| cartorio_destino | matricula_cartorio | imovel |
```

Para:
```
| cartorio_destino | matricula_cartorio_numero | imovel |
```

**Linha 81** - Alterar de:
```json
{
  "imovel": {
    "matricula_numero": "123456",
    "matricula_cartorio": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO"
  }
}
```

Para:
```json
{
  "imovel": {
    "matricula_numero": "123456",
    "matricula_cartorio_numero": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO"
  }
}
```

---

## 5. OBSERVACOES ADICIONAIS

✓ O documento tem excelente documentacao contextual sobre ONR e SAEC
✓ Cobertura explicada corretamente como "BAIXISSIMA"
✓ Secao de correlacao com outros documentos esta correta
✓ Campos nao mapeados estao bem documentados

**UNICA INCONSISTENCIA**: Nome do campo mapeado difere do mapeamento oficial

---

## 6. CONCLUSAO

Documento bem estruturado e completo, mas precisa correcao no nome do campo:
- `matricula_cartorio` → `matricula_cartorio_numero`

Esta inconsistencia pode causar erro no mapeamento automatico e na integracao com o schema de dados.
