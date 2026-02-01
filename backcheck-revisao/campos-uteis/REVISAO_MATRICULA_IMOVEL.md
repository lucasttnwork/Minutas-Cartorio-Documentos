# REVISAO: MATRICULA_IMOVEL - Campos Uteis

**Data da Revisao**: 2026-01-30
**Arquivo Revisado**: `documentacao-campos-extraiveis/campos-uteis/MATRICULA_IMOVEL.md`
**Status**: APROVADO COM OBSERVACAO

---

## RESULTADO DA REVISAO

### Total de Campos
- **Mapeamento Oficial**: 43 campos
- **Documento Campos Uteis**: 43 campos
- **Status**: ✓ CORRETO

### Distribuicao por Categoria
- **Pessoa Natural**: 8 campos (correto)
- **Pessoa Juridica**: 2 campos (correto)
- **Imovel**: 33 campos (correto)
- **Negocio**: 0 campos (correto)

---

## VERIFICACAO DETALHADA

### 1. Campos de Pessoa Natural (8 campos)
✓ Todos os 8 campos do mapeamento estao presentes:
- nome
- cpf
- rg
- orgao_emissor_rg
- estado_emissor_rg
- estado_civil
- profissao
- nacionalidade

### 2. Campos de Pessoa Juridica (2 campos)
✓ Todos os 2 campos do mapeamento estao presentes:
- pj_denominacao
- pj_cnpj

### 3. Campos de Imovel (33 campos)
✓ Todos os 33 campos do mapeamento estao presentes:
- matricula_numero
- matricula_cartorio_numero
- matricula_cartorio_cidade
- matricula_cartorio_estado
- matricula_numero_nacional
- imovel_denominacao
- imovel_sql
- imovel_area_total
- imovel_area_privativa
- imovel_area_construida
- imovel_logradouro
- imovel_numero
- imovel_complemento
- imovel_bairro
- imovel_cidade
- imovel_estado
- imovel_cep
- imovel_descricao_conforme_matricula
- imovel_certidao_matricula_numero
- imovel_certidao_matricula_data
- proprietario_nome
- proprietario_fracao_ideal
- proprietario_registro_aquisicao
- proprietario_data_registro
- proprietario_titulo_aquisicao
- onus_titulo
- onus_registro
- onus_data_registro
- onus_descricao
- onus_titular_nome
- onus_titular_fracao
- ressalva_existencia
- ressalva_descricao

### 4. Campos de Negocio (0 campos)
✓ Correto - nenhum campo de negocio mapeado

---

## OBSERVACAO

### Campo Omitido do Guia de Interface (mas correto no mapeamento)
O campo `imovel_certidao_matricula_valida` NAO esta no mapeamento oficial, mas ESTA presente no guia de interface `campos-dados-imovel.md` (item 6.3).

**Analise:**
- Mapeamento oficial: NAO inclui `imovel_certidao_matricula_valida`
- Guia de interface: INCLUI `imovel_certidao_matricula_valida`
- Campos uteis: NAO inclui `imovel_certidao_matricula_valida` ✓ CORRETO

**Conclusao**: O documento de campos uteis esta CORRETO ao seguir o mapeamento oficial. A inconsistencia esta entre o mapeamento oficial e o guia de interface, nao no documento de campos uteis.

---

## NENHUM PROBLEMA ENCONTRADO

O documento esta 100% alinhado com o mapeamento oficial `execution/mapeamento_documento_campos.json`.

Todos os campos listados sao exatamente os especificados no mapeamento.
Nenhum campo foi adicionado indevidamente.
Nenhum campo foi omitido.
As categorias estao corretas.

---

## RECOMENDACAO

**STATUS FINAL**: APROVADO

O arquivo `campos-uteis/MATRICULA_IMOVEL.md` esta correto e pode ser usado como referencia.
