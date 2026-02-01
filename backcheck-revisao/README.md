# Backcheck de Documentacao - Relatorio de Revisao

**Data**: 2026-01-30
**Total de Documentos Revisados**: 52 (26 campos-completos + 26 campos-uteis)

---

## Resumo Executivo

| Categoria | Total | OK/Aprovado | Atencao | Erros |
|-----------|-------|-------------|---------|-------|
| campos-completos | 26 | 18 | 6 | 2 |
| campos-uteis | 26 | 20 | 4 | 2 |
| **TOTAL** | **52** | **38 (73%)** | **10 (19%)** | **4 (8%)** |

---

## Status por Documento

### campos-completos/ (26 documentos)

#### Aprovados (18)
| Documento | Status | Observacao |
|-----------|--------|------------|
| CERTIDAO_CASAMENTO | APROVADO | Alta qualidade |
| CND_CONDOMINIO | APROVADO | Observacoes menores |
| CND_ESTADUAL | APROVADO | Ressalvas minimas |
| CND_FEDERAL | APROVADO | Observacoes menores |
| CNH | APROVADO | Observacoes menores |
| COMPROVANTE_PAGAMENTO | APROVADO | Ressalvas menores |
| COMPROVANTE_RESIDENCIA | APROVADO | Ressalvas menores |
| CONTRATO_SOCIAL | APROVADO | Observacoes |
| CPF | APROVADO | Observacoes menores |
| DADOS_CADASTRAIS | APROVADO | Observacoes menores |
| ESCRITURA | APROVADO | Observacoes |
| IPTU | APROVADO | Observacoes |
| ITBI | APROVADO | Ressalvas |
| OUTRO | APROVADO | Ressalvas |
| PROCURACAO | APROVADO | Ressalvas |
| PROTOCOLO_ONR | APROVADO | Alta qualidade |
| VVR | APROVADO | Observacoes |
| COMPROMISSO_COMPRA_VENDA | APROVADO | Ressalvas |

#### Requer Atencao (6)
| Documento | Status | Problema Principal |
|-----------|--------|-------------------|
| RG | DISCREPANCIAS | Schema incompleto vs extracao real |
| CND_IMOVEL | RESSALVAS | Divergencia de campos critica |
| CND_MUNICIPAL | PROBLEMAS | Tipo de dado incorreto |
| ASSINATURA_DIGITAL | PROBLEMAS | Divergencias schema vs documentacao |
| MATRICULA_IMOVEL | PROBLEMAS | Divergencia schema vs documentacao |
| CNDT | PROBLEMAS | 7 problemas encontrados |

#### Erros Criticos (2)
| Documento | Status | Acao Necessaria |
|-----------|--------|-----------------|
| CERTIDAO_NASCIMENTO | DIVERGENCIAS | Estrutura nested nao documentada, 7 divergencias |
| CERTIDAO_OBITO | PROBLEMAS CRITICOS | Mapeamento de campos incorreto |

---

### campos-uteis/ (26 documentos)

#### Aprovados (20)
| Documento | Status |
|-----------|--------|
| ASSINATURA_DIGITAL | OK |
| CERTIDAO_CASAMENTO | APROVADO |
| CND_CONDOMINIO | APROVADO |
| CND_ESTADUAL | APROVADO |
| CND_FEDERAL | APROVADO |
| CND_IMOVEL | APROVADO |
| CNDT | APROVADO |
| CNH | APROVADO |
| COMPROMISSO_COMPRA_VENDA | APROVADO |
| COMPROVANTE_RESIDENCIA | APROVADO |
| CONTRATO_SOCIAL | APROVADO |
| CPF | APROVADO |
| DADOS_CADASTRAIS | OK |
| ESCRITURA | OK |
| ITBI | OK |
| MATRICULA_IMOVEL | APROVADO |
| OUTRO | APROVADO |
| PROCURACAO | APROVADO |
| RG | APROVADO |
| VVR | OK |

#### Requer Atencao (4)
| Documento | Status | Problema Principal |
|-----------|--------|-------------------|
| CERTIDAO_NASCIMENTO | RESSALVA | CPF nao presente em certidao |
| CND_MUNICIPAL | RESSALVA | Divergencia menor |
| COMPROVANTE_PAGAMENTO | PROBLEMAS | Divergencia no total de campos |
| IPTU | PROBLEMA | Discrepancia no complemento |

#### Erros Criticos (2)
| Documento | Status | Acao Necessaria |
|-----------|--------|-----------------|
| CERTIDAO_OBITO | DISCREPANCIA | Divergencia na contagem de campos |
| PROTOCOLO_ONR | ERRO CRITICO | Erro critico detectado |

---

## Padroes de Problemas Identificados

### 1. Divergencia Schema vs Extracao Real (ALTA FREQUENCIA)
- Muitos documentos apresentam campos na extracao real que nao existem no schema
- Exemplo: RG extrai `via_documento`, `modelo_documento`, `tipo_rg` que nao estao no schema

### 2. Estrutura Flat vs Nested (MEDIA FREQUENCIA)
- Schemas definem campos planos (flat), mas extrarcoes usam estrutura nested
- Exemplo: ESCRITURA usa `partes.outorgantes` vs schema define `outorgantes` na raiz

### 3. Campos Ausentes no Schema (MEDIA FREQUENCIA)
- Pipeline extrai mais campos do que o schema define
- Documentacao esta correta quanto ao comportamento real

### 4. Nomenclatura Inconsistente (BAIXA FREQUENCIA)
- Alguns campos tem nomes diferentes entre schema, documentacao e extracao
- Exemplo: `nome_registrado` vs `nome_completo`

---

## Acoes Recomendadas

### Alta Prioridade
1. **CERTIDAO_NASCIMENTO (campos-completos)**: Atualizar documentacao para refletir estrutura nested real
2. **CERTIDAO_OBITO**: Corrigir mapeamento de campos
3. **PROTOCOLO_ONR (campos-uteis)**: Resolver erro critico detectado

### Media Prioridade
4. **RG**: Atualizar schema para incluir campos extras extraidos
5. **CNDT**: Resolver 7 problemas identificados
6. **MATRICULA_IMOVEL**: Alinhar schema com documentacao
7. **CND_MUNICIPAL (campos-completos)**: Corrigir tipo de dado

### Baixa Prioridade
8. Revisar nomenclatura de campos para consistencia
9. Documentar campos extras nas extraces
10. Adicionar nota sobre diferenca flat vs nested onde aplicavel

---

## Metricas de Qualidade

- **Taxa de Aprovacao**: 73% (38/52 documentos)
- **Documentos sem problemas criticos**: 96% (50/52)
- **campos-completos OK**: 69% (18/26)
- **campos-uteis OK**: 77% (20/26)

---

## Estrutura de Arquivos

```
backcheck-revisao/
├── README.md (este arquivo)
├── campos-completos/
│   ├── REVISAO_ASSINATURA_DIGITAL.md
│   ├── REVISAO_CERTIDAO_CASAMENTO.md
│   ├── REVISAO_CERTIDAO_NASCIMENTO.md
│   ├── REVISAO_CERTIDAO_OBITO.md
│   ├── REVISAO_CND_CONDOMINIO.md
│   ├── REVISAO_CND_ESTADUAL.md
│   ├── REVISAO_CND_FEDERAL.md
│   ├── REVISAO_CND_IMOVEL.md
│   ├── REVISAO_CND_MUNICIPAL.md
│   ├── REVISAO_CNDT.md
│   ├── REVISAO_CNH.md
│   ├── REVISAO_COMPROMISSO_COMPRA_VENDA.md
│   ├── REVISAO_COMPROVANTE_PAGAMENTO.md
│   ├── REVISAO_COMPROVANTE_RESIDENCIA.md
│   ├── REVISAO_CONTRATO_SOCIAL.md
│   ├── REVISAO_CPF.md
│   ├── REVISAO_DADOS_CADASTRAIS.md
│   ├── REVISAO_ESCRITURA.md
│   ├── REVISAO_IPTU.md
│   ├── REVISAO_ITBI.md
│   ├── REVISAO_MATRICULA_IMOVEL.md
│   ├── REVISAO_OUTRO.md
│   ├── REVISAO_PROCURACAO.md
│   ├── REVISAO_PROTOCOLO_ONR.md
│   ├── REVISAO_RG.md
│   └── REVISAO_VVR.md
└── campos-uteis/
    ├── REVISAO_ASSINATURA_DIGITAL.md
    ├── REVISAO_CERTIDAO_CASAMENTO.md
    ├── REVISAO_CERTIDAO_NASCIMENTO.md
    ├── REVISAO_CERTIDAO_OBITO.md
    ├── REVISAO_CND_CONDOMINIO.md
    ├── REVISAO_CND_ESTADUAL.md
    ├── REVISAO_CND_FEDERAL.md
    ├── REVISAO_CND_IMOVEL.md
    ├── REVISAO_CND_MUNICIPAL.md
    ├── REVISAO_CNDT.md
    ├── REVISAO_CNH.md
    ├── REVISAO_COMPROMISSO_COMPRA_VENDA.md
    ├── REVISAO_COMPROVANTE_PAGAMENTO.md
    ├── REVISAO_COMPROVANTE_RESIDENCIA.md
    ├── REVISAO_CONTRATO_SOCIAL.md
    ├── REVISAO_CPF.md
    ├── REVISAO_DADOS_CADASTRAIS.md
    ├── REVISAO_ESCRITURA.md
    ├── REVISAO_IPTU.md
    ├── REVISAO_ITBI.md
    ├── REVISAO_MATRICULA_IMOVEL.md
    ├── REVISAO_OUTRO.md
    ├── REVISAO_PROCURACAO.md
    ├── REVISAO_PROTOCOLO_ONR.md
    ├── REVISAO_RG.md
    └── REVISAO_VVR.md
```

---

## Proximos Passos

1. [ ] Corrigir documentos com erros criticos (4 documentos)
2. [ ] Atualizar schemas para refletir campos extras extraidos
3. [ ] Revisar documentos com status "Atencao" (10 documentos)
4. [ ] Alinhar nomenclatura entre schema, documentacao e extracao
5. [ ] Documentar padroes flat vs nested

---

*Relatorio gerado automaticamente por 52 sub-agentes Sonnet em 2026-01-30*
