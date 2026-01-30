# REVISÃO: campos-uteis/RG.md

**Data**: 2026-01-30
**Status**: ✅ APROVADO COM RESSALVAS

---

## VERIFICAÇÕES OBRIGATÓRIAS

### ✅ 1. Total de campos úteis bate com mapeamento?
**SIM** - 10 campos declarados, 10 campos no mapeamento.

### ✅ 2. Campos listados são exatamente os do mapeamento?
**SIM** - Todos os 10 campos presentes e corretos.

### ✅ 3. Categorias corretas?
**SIM** - pessoa_natural (10), pessoa_juridica (0), imovel (0), negocio (0).

### ✅ 4. Nenhum campo extra foi adicionado?
**SIM** - Apenas campos do mapeamento oficial.

### ✅ 5. Nenhum campo foi omitido?
**SIM** - Todos os campos do mapeamento estão presentes.

---

## PROBLEMAS ENCONTRADOS

### ⚠️ PROBLEMA 1: Mapeamento Reverso
**Linha 53-64**: Seção "3. MAPEAMENTO REVERSO" apresenta inconsistência.

**Campo no Schema vs. Campo Util Mapeado:**
- O documento usa "data_emissao_rg" como campo útil mapeado
- No mapeamento oficial (linha 227 do JSON), o campo é apenas "data_emissao_rg"
- A tabela usa "data_expedicao" como campo no schema, mas deveria usar consistência

**Recomendação**: Verificar se a coluna "Campo no Schema" está alinhada com `campos-completos/RG.md` para garantir consistência entre versões.

### ⚠️ PROBLEMA 2: Exemplo JSON (linha 70-88)
O exemplo JSON usa estrutura flat, mas não reflete exatamente a estrutura do schema completo.

**Observado**:
```json
"pessoa_natural": {
  "nome": "MARINA AYUB",
  "cpf": "368.366.718-43",
  ...
}
```

**Sugestão**: Confirmar se essa estrutura simplificada é a esperada para campos úteis, ou se deveria refletir melhor a estrutura do schema `rg.json`.

---

## CHECKLIST FINAL

| Item | Status |
|------|--------|
| Total de campos correto | ✅ |
| Lista de campos correta | ✅ |
| Categorias corretas | ✅ |
| Sem campos extras | ✅ |
| Sem omissões | ✅ |
| Mapeamento reverso consistente | ⚠️ |
| Exemplos alinhados | ⚠️ |

---

## CONCLUSÃO

O arquivo está **CORRETO** em termos de conteúdo de campos úteis e alinhamento com o mapeamento oficial. Os problemas identificados são menores e relacionados a:
1. Nomenclatura de campos no mapeamento reverso
2. Estrutura de exemplo JSON

**Ação recomendada**: Revisar nomenclatura para garantir total consistência entre `campos-completos/RG.md` e `campos-uteis/RG.md`, especialmente na coluna "Campo no Schema" da seção 3.

**Impacto**: BAIXO - Não afeta a funcionalidade, apenas documentação auxiliar.
