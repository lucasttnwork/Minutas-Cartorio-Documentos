# REVISAO: CND_IMOVEL.md

**Data da Revisao**: 2026-01-30
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-completos/CND_IMOVEL.md`
**Schema de Referencia**: `execution/mapeamento_documento_campos.json`
**Exemplos Reais**: Nao encontrados em `.tmp/contextual/`

---

## STATUS GERAL

**APROVADO COM RESSALVAS**

Documentacao bem estruturada e completa, mas com **problemas criticos de alinhamento com o schema**.

---

## PROBLEMAS IDENTIFICADOS

### 1. SCHEMA NAO EXISTE (CRITICO)
- Documento afirma na linha 4: "Nao possui schema dedicado"
- Mas existe mapeamento em `mapeamento_documento_campos.json`
- **Problema**: Documentacao deveria referenciar o schema JSON corretamente

### 2. DIVERGENCIA DE CAMPOS (CRITICO)
O schema define **11 campos** para CND_IMOVEL:
```json
"imovel_sql"
"matricula_numero"
"imovel_logradouro"
"imovel_numero"
"imovel_complemento"
"imovel_bairro"
"imovel_cidade"
"imovel_estado"
"imovel_cnd_iptu_numero"
"imovel_cnd_iptu_data"
"imovel_cnd_iptu_valida"
```

Mas a documentacao lista **18 campos raiz** (secoes 2.1 e 2.2):
- numero_certidao
- matricula_numero ✓
- cartorio
- situacao_onus
- data_emissao
- data_validade
- tipo_certidao
- periodo_abrangido
- contribuinte_municipal
- endereco_imovel
- proprietarios_atuais
- onus_ativos
- onus_cancelados
- indisponibilidades
- selo_digital
- codigo_verificacao
- escrevente
- oficial

**Faltam no schema mas presentes na doc**:
- numero_certidao
- cartorio
- situacao_onus
- data_emissao
- data_validade
- tipo_certidao
- etc (12 campos adicionais)

### 3. MAPEAMENTO INCORRETO (CRITICO)
Linhas 216-218 mapeiam incorretamente:
```
| numero_certidao | imovel_cnd_iptu_numero |
| data_emissao | imovel_cnd_iptu_data |
| (situacao_onus == "LIVRE") | imovel_cnd_iptu_valida |
```

**Problema**: Os campos `imovel_cnd_iptu_*` se referem a CND de IPTU (CND_MUNICIPAL), NAO a CND_IMOVEL.

CND_IMOVEL e CND_MUNICIPAL sao documentos diferentes:
- CND_IMOVEL = Certidao de Onus (Cartorio de RI)
- CND_MUNICIPAL = Certidao Negativa de IPTU (Prefeitura)

### 4. ERRO CONCEITUAL (ALTO)
A documentacao confunde CND_IMOVEL com multiplas certidoes:
- Linha 95-100: Campos sobre "numero_certidao", "data_emissao" e "data_validade" sao da CND_IMOVEL
- Linha 216-218: Mas sao mapeados para campos de IPTU

**Correcao necessaria**:
- CND_IMOVEL deveria ter campos proprios no schema
- Ou a documentacao deveria explicar porque nao tem campos proprios

### 5. ARRAYS NAO MAPEADOS
Secao 2.3 documenta 4 arrays:
- proprietarios_atuais[]
- onus_ativos[]
- onus_cancelados[]
- acoes_judiciais[]

**Schema nao inclui arrays**. Nao esta claro se:
- Arrays sao extraidos mas nao mapeados?
- Arrays sao apenas informativos?

---

## CAMPOS FALTANDO

**Do schema para a doc**: Nenhum (todos os 11 campos do schema estao presentes)

**Da doc para o schema**: 12+ campos documentados nao estao no schema

---

## VALIDACOES

### Estrutura
- ✓ Template seguido corretamente
- ✓ Secoes completas
- ✓ Exemplos presentes (linhas 246-386)

### Tipos de Dados
- ✓ Tipos corretos (string, date, number, array)

### Exemplos
- ✓ Exemplos realistas e bem documentados
- ⚠ Mas sem exemplos reais de extracao para validar

---

## RECOMENDACOES

### URGENTE
1. **Corrigir mapeamento secao 3.3**:
   - Remover referencias a `imovel_cnd_iptu_*`
   - CND_IMOVEL nao alimenta campos de IPTU
   - Schema atual mapeia apenas endereco e matricula

2. **Atualizar secao 1.1 linha 4**:
   - Substituir "Nao possui schema dedicado"
   - Por "Schema: `mapeamento_documento_campos.json > CND_IMOVEL`"

3. **Decidir destino dos campos extras**:
   - Adicionar campos ao schema? (recomendado)
   - Ou marcar como "nao mapeados" na secao 3.5?

### DESEJAVEL
4. Adicionar exemplos reais de extracao quando disponiveis
5. Esclarecer se arrays sao extraidos ou apenas informativos
6. Verificar correlacao com MATRICULA_IMOVEL (ja bem documentada)

---

## CONCLUSAO

Documentacao de **ALTA QUALIDADE** em estrutura e conteudo, mas com **PROBLEMAS CRITICOS** de alinhamento entre schema e campos documentados.

**Nao pode ir para producao** sem corrigir o mapeamento incorreto da secao 3.3.

---

## PROXIMOS PASSOS

1. Corrigir secao 3.3 (mapeamento)
2. Atualizar secao 1.1 (referencia ao schema)
3. Decidir se adiciona campos ao schema ou marca como nao-mapeados
