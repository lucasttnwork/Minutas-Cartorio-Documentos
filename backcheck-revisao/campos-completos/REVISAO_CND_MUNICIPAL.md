# REVISAO: CND_MUNICIPAL.md

**Data Revisao**: 2026-01-30
**Revisor**: Claude Agent
**Status**: PROBLEMAS ENCONTRADOS

---

## RESUMO EXECUTIVO

Documentacao possui **DESALINHAMENTO MODERADO** entre schema, documentacao e exemplos reais de extracao.

---

## PROBLEMAS IDENTIFICADOS

### 1. CAMPOS NO SCHEMA AUSENTES NA DOCUMENTACAO

- **orgao_emissor** (string, opcional): Presente no schema do JSON extraido, ausente no schema formal
- **secretaria_emissora** (string, opcional): Presente no schema do JSON extraido, ausente no schema formal
- **hora_emissao** (string, opcional): Presente no schema do JSON extraido, ausente no schema formal
- **cep_imovel** (string, opcional): Presente no schema do JSON extraido, ausente no schema formal

**Observacao**: Estes campos estao documentados na secao 2.2 (Campos Opcionais) da documentacao, mas NAO estao no schema JSON formal (`execution/schemas/cnd_municipal.json`).

### 2. NOMECLATURAS INCONSISTENTES

**Schema JSON formal** usa:
- `cadastro_imovel`
- `cpf_contribuinte`

**JSON extraido real** usa:
- `sql` (ao inves de `cadastro_imovel`)
- `cpf_cnpj_contribuinte` (ao inves de `cpf_contribuinte`)
- `contribuinte` (ao inves de `nome_contribuinte`)
- `status` (ao inves de `situacao_fiscal`)
- `tributos_cobertos` (ao inves de `tributos_abrangidos`)
- `codigo_verificacao` (ao inves de `codigo_autenticidade`)

**Impacto**: Pipeline de extracao usa nomeclaturas diferentes do schema formal.

### 3. CAMPOS EXTRAS NO JSON EXTRAIDO

O JSON extraido possui campos NAO documentados:
- `nome_certidao_completo`
- `cpf_cnpj_contribuinte` (null em ambos exemplos)
- `debitos_pendentes` (array vazio em ambos exemplos)
- `urls_verificacao` (array)
- `clausulas_legais` (objeto nested complexo)
- `base_legal` (array)
- `fuso_horario`

**Observacao**: A documentacao afirma que "A CND Municipal nao possui estrutura nested complexa" (secao 2.4), mas o JSON extraido real possui objetos nested `clausulas_legais`.

### 4. TIPO DE DADO INCORRETO

**Schema**: `cpf_contribuinte` definido como string com regex especifico para CPF
**Realidade**: Campo extraido como `cpf_cnpj_contribuinte` (null nos exemplos), indicando que pode ser CPF ou CNPJ

---

## CAMPOS VERIFICADOS E CORRETOS

- Todos os campos obrigatorios do schema formal estao documentados
- Tipos de dados (exceto `cpf_contribuinte`) estao corretos
- Exemplos de extracao sao reais e validos
- Estrutura do documento segue template adequadamente
- Regex patterns estao corretos

---

## RECOMENDACOES

1. **ALTA PRIORIDADE**: Alinhar nomeclatura entre schema formal JSON e extracao real
   - Escolher entre `cadastro_imovel` vs `sql`
   - Escolher entre `nome_contribuinte` vs `contribuinte`
   - Escolher entre `situacao_fiscal` vs `status`
   - Escolher entre `tributos_abrangidos` vs `tributos_cobertos`

2. **MEDIA PRIORIDADE**: Adicionar campos ao schema JSON formal:
   - `orgao_emissor`
   - `secretaria_emissora`
   - `hora_emissao`
   - `cep_imovel`

3. **BAIXA PRIORIDADE**: Documentar estrutura nested `clausulas_legais` se for campo util
   - Atualmente extraido mas nao documentado

4. **BAIXA PRIORIDADE**: Revisar secao 2.4 sobre "nao possui estrutura nested complexa"

---

## CONCLUSAO

Documentacao e extensa e bem estruturada, mas ha **desalinhamento critico de nomeclatura** entre schema formal e implementacao real de extracao. Recomenda-se unificacao imediata para evitar erros de pipeline.

---

**Arquivos revisados**:
- `documentacao-campos-extraiveis/campos-completos/CND_MUNICIPAL.md`
- `execution/schemas/cnd_municipal.json`
- `.tmp/contextual/FC_515_124_p280509/004_CND_MUNICIPAL.json`
- `.tmp/contextual/GS_357_11_p281773/002_CND_MUNICIPAL.json`
