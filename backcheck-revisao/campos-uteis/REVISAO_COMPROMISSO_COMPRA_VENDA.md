# REVISAO: COMPROMISSO_COMPRA_VENDA - Campos Uteis

**Data da Revisao**: 2026-01-30
**Status**: APROVADO

---

## RESULTADO DA VERIFICACAO

### Total de Campos
- **Esperado (mapeamento)**: 53 campos
- **Declarado (campos-uteis)**: 53 campos
- **Status**: OK

### Distribuicao por Categoria
| Categoria | Mapeamento | Campos-Uteis | Status |
|-----------|------------|--------------|--------|
| pessoa_natural | 19 | 19 | OK |
| pessoa_juridica | 9 | 9 | OK |
| imovel | 12 | 12 | OK |
| negocio | 13 | 13 | OK |

---

## VERIFICACAO DETALHADA

### Pessoa Natural (19 campos) - OK
Todos os campos mapeados estao presentes e corretos:
- nome, cpf, rg, orgao_emissor_rg, estado_emissor_rg
- nacionalidade, profissao, estado_civil, regime_bens, data_nascimento
- domicilio_logradouro, domicilio_numero, domicilio_complemento
- domicilio_bairro, domicilio_cidade, domicilio_estado, domicilio_cep
- email, telefone

### Pessoa Juridica (9 campos) - OK
Todos os campos mapeados estao presentes e corretos:
- pj_denominacao, pj_cnpj
- pj_sede_logradouro, pj_sede_numero, pj_sede_complemento
- pj_sede_bairro, pj_sede_cidade, pj_sede_estado, pj_sede_cep

### Imovel (12 campos) - OK
Todos os campos mapeados estao presentes e corretos:
- matricula_numero, matricula_cartorio_numero, matricula_cartorio_cidade
- imovel_denominacao, imovel_logradouro, imovel_numero, imovel_complemento
- imovel_bairro, imovel_cidade, imovel_estado
- imovel_area_total, imovel_area_privativa

### Negocio (13 campos) - OK
Todos os campos mapeados estao presentes e corretos:
- negocio_valor_total, negocio_fracao_alienada
- alienante_nome, alienante_fracao_ideal, alienante_valor_alienacao, alienante_conjuge
- adquirente_nome, adquirente_fracao_ideal, adquirente_valor_aquisicao
- pagamento_tipo, pagamento_modo, pagamento_data, termos_promessa

---

## CONCLUSAO

**Documento APROVADO**: Todos os 53 campos uteis mapeados no arquivo `mapeamento_documento_campos.json` estao corretamente listados e categorizados no documento `campos-uteis/COMPROMISSO_COMPRA_VENDA.md`.

Nenhuma discrepancia encontrada.
