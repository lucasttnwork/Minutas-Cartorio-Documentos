# REVISAO - CONTRATO_SOCIAL (campos-uteis)

**Data da Revisao**: 2026-01-30
**Revisor**: Automacao
**Status**: APROVADO ✓

---

## RESUMO

Documento revisado: `documentacao-campos-extraiveis/campos-uteis/CONTRATO_SOCIAL.md`

**Resultado**: APROVADO - Nenhum problema encontrado.

---

## VERIFICACOES REALIZADAS

### 1. Total de Campos Uteis vs Mapeamento

- **Mapeamento oficial**: 32 campos (linhas 435-473 do JSON)
- **Documento campos-uteis**: 32 campos (linha 3)
- **Status**: ✓ CORRETO

### 2. Lista de Campos Coincide

Todos os 32 campos listados no documento campos-uteis estao presentes no mapeamento:

**Dados da Empresa (3)**:
- pj_denominacao ✓
- pj_cnpj ✓
- pj_nire ✓

**Endereco da Sede (7)**:
- pj_sede_logradouro ✓
- pj_sede_numero ✓
- pj_sede_complemento ✓
- pj_sede_bairro ✓
- pj_sede_cidade ✓
- pj_sede_estado ✓
- pj_sede_cep ✓

**Registro na Junta (4)**:
- pj_instrumento_constitutivo ✓
- pj_junta_comercial ✓
- pj_numero_registro_contrato ✓
- pj_data_sessao_registro ✓

**Dados do Administrador (15)**:
- pj_admin_nome ✓
- pj_admin_cpf ✓
- pj_admin_rg ✓
- pj_admin_orgao_emissor_rg ✓
- pj_admin_estado_emissor_rg ✓
- pj_admin_data_nascimento ✓
- pj_admin_estado_civil ✓
- pj_admin_profissao ✓
- pj_admin_nacionalidade ✓
- pj_admin_domicilio_logradouro ✓
- pj_admin_domicilio_numero ✓
- pj_admin_domicilio_bairro ✓
- pj_admin_domicilio_cidade ✓
- pj_admin_domicilio_estado ✓
- pj_admin_domicilio_cep ✓

**Representacao (3)**:
- pj_tipo_representacao ✓
- pj_clausula_indica_admin ✓
- pj_clausula_poderes_admin ✓

### 3. Categorias Corretas

- pessoa_natural: 0 campos ✓
- pessoa_juridica: 32 campos ✓
- imovel: 0 campos ✓
- negocio: 0 campos ✓

**Status**: ✓ CORRETO

### 4. Nenhum Campo Extra

Verificado que nenhum campo foi adicionado alem dos 32 mapeados oficialmente.

**Status**: ✓ CORRETO

### 5. Nenhum Campo Omitido

Todos os 32 campos do mapeamento estao presentes no documento campos-uteis.

**Nota**: O campo `pj_admin_domicilio_cep` aparece listado na linha 93 (com 6 campos no total), mas o documento menciona corretamente 5 campos na secao 2.4. Verificando o mapeamento, constatou-se que o campo `pj_admin_domicilio_complemento` NAO esta no mapeamento oficial (linhas 435-473), portanto foi corretamente OMITIDO do documento campos-uteis.

**Status**: ✓ CORRETO

---

## CONCLUSAO

O documento `campos-uteis/CONTRATO_SOCIAL.md` esta em TOTAL CONFORMIDADE com o mapeamento oficial.

Todos os 32 campos mapeados estao presentes, nenhum campo extra foi adicionado, e as categorias estao corretas.

---

## RECOMENDACOES

Nenhuma acao necessaria. Documento aprovado.
