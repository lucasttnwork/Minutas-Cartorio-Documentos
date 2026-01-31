# REVISAO: PROCURACAO.md (Campos Uteis)

**Data da Revisao**: 2026-01-30
**Revisor**: Automacao
**Status**: APROVADO COM OBSERVACOES

---

## 1. VERIFICACAO DE CONTAGEM

| Item | Esperado (Mapeamento) | Encontrado (Doc) | Status |
|------|----------------------|------------------|--------|
| Total Geral | 35 campos | 35 campos | OK |
| pessoa_natural | 14 campos | 14 campos | OK |
| pessoa_juridica | 21 campos | 21 campos | OK |
| imovel | 0 campos | 0 campos | OK |
| negocio | 0 campos | 0 campos | OK |

---

## 2. VERIFICACAO DE CAMPOS PESSOA_NATURAL

Todos os 14 campos do mapeamento estao presentes e corretos:
- nome
- cpf
- rg
- orgao_emissor_rg
- estado_emissor_rg
- nacionalidade
- profissao
- estado_civil
- domicilio_logradouro
- domicilio_numero
- domicilio_bairro
- domicilio_cidade
- domicilio_estado
- domicilio_cep

---

## 3. VERIFICACAO DE CAMPOS PESSOA_JURIDICA

Todos os 21 campos do mapeamento estao presentes e corretos:
- pj_denominacao
- pj_cnpj
- pj_procurador_nome
- pj_procurador_cpf
- pj_procurador_rg
- pj_procurador_orgao_emissor_rg
- pj_procurador_estado_emissor_rg
- pj_procurador_data_nascimento
- pj_procurador_estado_civil
- pj_procurador_profissao
- pj_procurador_nacionalidade
- pj_procurador_domicilio_logradouro
- pj_procurador_domicilio_numero
- pj_procurador_domicilio_bairro
- pj_procurador_domicilio_cidade
- pj_procurador_domicilio_estado
- pj_procurador_domicilio_cep
- pj_tabelionato_procuracao
- pj_data_procuracao
- pj_livro_procuracao
- pj_paginas_procuracao

---

## 4. PROBLEMAS ENCONTRADOS

**Nenhum problema critico encontrado.**

O documento esta 100% alinhado com o mapeamento oficial.

---

## 5. OBSERVACOES MENORES

1. **Organizacao Didatica**: O documento divide os 21 campos de pessoa_juridica em 3 subgrupos (Empresa Outorgante, Procurador, Instrumento). Isso e pedagogico e nao altera a conformidade.

2. **Campos Nao Mapeados**: A secao 7.3 lista campos que existem em procuracoes mas nao estao no mapeamento (poderes, finalidade, prazo_validade, etc.). Isso esta correto e alinhado com a diretriz.

---

## 6. COMPARACAO COM CAMPOS-COMPLETOS

O arquivo campos-completos/PROCURACAO.md lista ~50+ campos extraiveis (incluindo campos nao mapeados como poderes, finalidade, selo_digital, etc.).

O arquivo campos-uteis corretamente filtra para os 35 campos mapeados.

---

## 7. RESULTADO FINAL

**STATUS**: APROVADO

O documento campos-uteis/PROCURACAO.md esta totalmente conforme o mapeamento oficial. Nenhuma acao corretiva necessaria.
