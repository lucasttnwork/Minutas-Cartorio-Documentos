# Campos Completos - Guia de Uso

Esta pasta contem a documentacao completa de TODOS os campos extraiveis de cada tipo de documento.

## Objetivo

Fornecer visao tecnica completa da estrutura de dados extraidos, incluindo:
- Todos os campos do schema JSON
- Campos nested (objetos)
- Campos em arrays
- Campos opcionais
- Campos raros

## Como Ler os Arquivos

Cada arquivo segue a estrutura padrao:

### 1. VISAO GERAL
- Descricao do documento
- Padroes de identificacao visual
- Formatos comuns

### 2. CAMPOS EXTRAIVEIS COMPLETOS
- Campos raiz (obrigatorios e opcionais)
- Objetos nested com subcampos
- Arrays com estrutura de elementos
- Tabelas com tipo, descricao e exemplo

### 3. MAPEAMENTO SCHEMA → MODELO DE DADOS
- Como campos alimentam cada categoria:
  - Pessoa Natural
  - Pessoa Juridica
  - Dados do Imovel
  - Negocio Juridico
- Campos nao mapeados e motivos

### 4. EXEMPLO DE EXTRACAO REAL
- JSON completo de documento real extraido
- Fonte do exemplo

### 5. CORRELACAO COM OUTROS DOCUMENTOS
- Campos compartilhados entre documentos
- Uso na correlacao de dados
- Redundancia intencional

### 6. VALIDACOES E CONFERENCIAS
- Validacoes automaticas
- Campos de qualidade (legiveis, ilegiveis, confianca)

### 7. NOTAS TECNICAS
- Campos computados
- Campos inferidos
- Campos raros

### 8. REFERENCIAS
- Links para schema, prompt, guias e mapeamento

## Importante

Nem todos os campos listados sao usados em minutas. Para ver apenas campos uteis, consulte `../campos-uteis/`.

## Documentos por Complexidade

### Muito Alta (50+ campos no schema)
1. **MATRICULA_IMOVEL** - Documento mais complexo do sistema
2. **COMPROMISSO_COMPRA_VENDA** - Segundo mais complexo
3. **ESCRITURA** - Alta complexidade

### Alta (30-49 campos)
4. **ITBI** - Guia de recolhimento com muitos dados
5. **CONTRATO_SOCIAL** - Dados completos da PJ
6. **PROCURACAO** - Dados de outorgante e procurador

### Media (15-29 campos)
7. **CERTIDAO_CASAMENTO** - Dados dos conjuges
8. **CND_MUNICIPAL** - Dados do imovel e contribuinte
9. **IPTU** - Dados cadastrais do imovel
10. **COMPROVANTE_PAGAMENTO** - Dados da transacao

### Baixa (< 15 campos)
11-26. Demais documentos (RG, CNH, CPF, certidoes simples, etc.)

## Schemas Disponiveis

Os seguintes documentos possuem schema JSON definido:

| Schema | Arquivo |
|--------|---------|
| RG | `execution/schemas/rg.json` |
| CNDT | `execution/schemas/cndt.json` |
| VVR | `execution/schemas/vvr.json` |
| CND_MUNICIPAL | `execution/schemas/cnd_municipal.json` |
| CERTIDAO_NASCIMENTO | `execution/schemas/certidao_nascimento.json` |
| CERTIDAO_CASAMENTO | `execution/schemas/certidao_casamento.json` |
| IPTU | `execution/schemas/iptu.json` |
| ITBI | `execution/schemas/itbi.json` |
| COMPROVANTE_PAGAMENTO | `execution/schemas/comprovante_pagamento.json` |
| MATRICULA_IMOVEL | `execution/schemas/matricula_imovel.json` |
| COMPROMISSO_COMPRA_VENDA | `execution/schemas/compromisso_compra_venda.json` |
| PROTOCOLO_ONR | `execution/schemas/protocolo_onr.json` |
| ESCRITURA | `execution/schemas/escritura.json` |
| ASSINATURA_DIGITAL | `execution/schemas/assinatura_digital.json` |
| DESCONHECIDO/OUTRO | `execution/schemas/desconhecido.json` |

**Nota**: Documentos sem schema dedicado usam estrutura generica ou sao extraidos via prompts especificos.

## Convencoes

### Tipos de Campos
- `string` - Texto livre
- `date` - Data no formato DD/MM/AAAA
- `number` - Valor numerico
- `boolean` - Sim/Nao (true/false)
- `array` - Lista de elementos
- `object` - Objeto com subcampos

### Indicadores
- ✅ Obrigatorio - Campo sempre presente
- ⚠️ Condicional - Depende do contexto
- ❓ Opcional - Pode estar ausente
- ❌ Nao mapeado - Nao usado em minutas

---

**Ultima atualizacao**: 2026-01-30
