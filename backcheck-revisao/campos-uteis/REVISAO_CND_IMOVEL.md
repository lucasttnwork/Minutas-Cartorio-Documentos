# REVISAO: CND_IMOVEL (campos-uteis)

**Data da Revisao**: 2026-01-30
**Revisor**: Agent (backcheck)
**Status**: APROVADO COM OBSERVACOES

---

## VERIFICACAO 1: Total de Campos Uteis

**Esperado (mapeamento)**: 11 campos
**Encontrado (documento)**: 11 campos

**Status**: ✓ OK

---

## VERIFICACAO 2: Lista de Campos

### Campos no Mapeamento:
1. imovel_sql
2. matricula_numero
3. imovel_logradouro
4. imovel_numero
5. imovel_complemento
6. imovel_bairro
7. imovel_cidade
8. imovel_estado
9. imovel_cnd_iptu_numero
10. imovel_cnd_iptu_data
11. imovel_cnd_iptu_valida

### Campos no Documento (Secao 2.3 Imovel):
1. imovel_sql
2. matricula_numero
3. imovel_logradouro
4. imovel_numero
5. imovel_complemento
6. imovel_bairro
7. imovel_cidade
8. imovel_estado
9. imovel_cnd_iptu_numero
10. imovel_cnd_iptu_data
11. imovel_cnd_iptu_valida

**Status**: ✓ OK - Todos os campos presentes e identicos

---

## VERIFICACAO 3: Categorias

**Esperado**:
- pessoa_natural: 0
- pessoa_juridica: 0
- imovel: 11
- negocio: 0

**Encontrado**:
- pessoa_natural: 0
- pessoa_juridica: 0
- imovel: 11
- negocio: 0

**Status**: ✓ OK

---

## VERIFICACAO 4: Campos Extras (nao deveriam estar)

**Status**: ✓ OK - Nenhum campo extra encontrado

---

## VERIFICACAO 5: Campos Omitidos (deveriam estar)

**Status**: ✓ OK - Nenhum campo omitido

---

## VERIFICACAO 6: Mapeamento Reverso (Secao 3)

Verificando se mapeamento reverso esta correto:

| Campo no Documento | Campo Util Mapeado | Status |
|--------------------|-------------------|--------|
| contribuinte_municipal | imovel_sql | ✓ OK |
| matricula_numero | matricula_numero | ✓ OK |
| endereco_imovel (logradouro) | imovel_logradouro | ✓ OK |
| endereco_imovel (numero) | imovel_numero | ✓ OK |
| endereco_imovel (complemento) | imovel_complemento | ✓ OK |
| endereco_imovel (bairro) | imovel_bairro | ✓ OK |
| endereco_imovel (cidade) | imovel_cidade | ✓ OK |
| endereco_imovel (estado) | imovel_estado | ✓ OK |
| numero_certidao | imovel_cnd_iptu_numero | ✓ OK |
| data_emissao | imovel_cnd_iptu_data | ✓ OK |
| situacao_onus == "LIVRE" | imovel_cnd_iptu_valida | ✓ OK |

**Status**: ✓ OK - Mapeamento reverso correto

---

## VERIFICACAO 7: Conformidade com Guia de Campos

Verificando se campos estao definidos no guia `campos-dados-imovel.md`:

| Campo Util | Presente no Guia? | Secao |
|-----------|------------------|-------|
| imovel_sql | ✓ SIM | 3. Cadastro Imobiliario |
| matricula_numero | ✓ SIM | 1. Matricula Imobiliaria |
| imovel_logradouro | ✓ SIM | 2. Descricao do Imovel |
| imovel_numero | ✓ SIM | 2. Descricao do Imovel |
| imovel_complemento | ✓ SIM | 2. Descricao do Imovel |
| imovel_bairro | ✓ SIM | 2. Descricao do Imovel |
| imovel_cidade | ✓ SIM | 2. Descricao do Imovel |
| imovel_estado | ✓ SIM | 2. Descricao do Imovel |
| imovel_cnd_iptu_numero | ✓ SIM | 5. Negativa de IPTU |
| imovel_cnd_iptu_data | ✓ SIM | 5. Negativa de IPTU |
| imovel_cnd_iptu_valida | ✓ SIM | 5. Negativa de IPTU |

**Status**: ✓ OK - Todos os campos estao definidos no guia

---

## OBSERVACOES

1. **Nomenclatura da Certidao**: O documento usa "imovel_cnd_iptu_*" como prefixo, mas se refere a "CND_IMOVEL" (Certidao de Onus), nao a "CND_IPTU" (Certidao de debitos de IPTU). Estes sao documentos diferentes:
   - CND_IMOVEL = Certidao de Onus Reais (Cartorio de RI)
   - CND_MUNICIPAL = Certidao de debitos de IPTU (Prefeitura)

   **Acao sugerida**: Considerar renomear os campos de "imovel_cnd_iptu_*" para "imovel_cnd_onus_*" para evitar confusao. Porem, esta mudanca afetaria o mapeamento e seria uma alteracao de schema.

2. **Validacao do campo imovel_cnd_iptu_valida**: O documento explica corretamente que este campo e derivado (true se "LIVRE E DESEMBARACADO", false se "COM ONUS"). Esta logica esta bem documentada.

3. **Endereco como campo unico**: O documento corretamente observa que o endereco pode vir como campo unico que precisa ser parseado. Esta observacao esta presente na Secao 2.3 e e importante para a implementacao.

---

## CONCLUSAO

**STATUS FINAL**: ✓ APROVADO

O documento `campos-uteis/CND_IMOVEL.md` esta CORRETO e COMPLETO:
- Total de campos bate com mapeamento
- Todos os campos listados sao exatamente os do mapeamento
- Categorias corretas
- Nenhum campo extra ou omitido
- Mapeamento reverso correto
- Todos os campos estao definidos no guia

**Observacao nao-bloqueante**: Existe uma inconsistencia semantica na nomenclatura dos campos (uso de "iptu" quando deveria ser "onus"), mas esta inconsistencia vem do schema original e nao e um erro do documento de campos-uteis.
