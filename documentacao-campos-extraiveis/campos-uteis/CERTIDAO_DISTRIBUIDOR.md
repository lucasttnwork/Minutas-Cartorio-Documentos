# CERTIDAO_DISTRIBUIDOR - Certidoes de Distribuidores (Campos Uteis)

**Total de Campos Uteis**: 11 campos
**Categorias**: Pessoa Natural (2), Pessoa Juridica (2), Imovel (0), Negocio (0), Certidao (7)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CERTIDAO_DISTRIBUIDOR agrupa varios tipos de certidoes emitidas por distribuidores judiciais e cartorios que atestam a situacao juridica do vendedor perante orgaos judiciais e extrajudiciais.

**Subtipos cobertos:**
- Certidao Civel (Distribuidor Civel)
- Certidao Criminal
- Certidao de Protesto
- Certidao de Falencia/Recuperacao Judicial
- Certidao de Execucao Fiscal
- Certidao de Interdicao/Tutela

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do pesquisado | "JOAO DA SILVA" | SIM |
| CPF | CPF do pesquisado | "123.456.789-00" | SIM |

### 2.2 Pessoa Juridica (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| DENOMINACAO | Razao social pesquisada | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| CNPJ | CNPJ pesquisado | "12.345.678/0001-90" | SIM (se PJ) |

### 2.3 Dados da Certidao (7 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| TIPO DE CERTIDAO | Subtipo da certidao | "CIVEL" | SIM |
| ORGAO EMISSOR | Tribunal/Cartorio | "TRIBUNAL DE JUSTICA DE SAO PAULO" | SIM |
| COMARCA | Comarca de emissao | "SAO PAULO" | SIM |
| RESULTADO | Status da certidao | "NADA CONSTA" | SIM |
| DATA DE EMISSAO | Data de expedicao | "30/01/2026" | SIM |
| DATA DE VALIDADE | Validade da certidao | "30/04/2026" | SIM |
| CODIGO DE VERIFICACAO | Codigo autenticidade | "ABC123-DEF456-GHI789" | SIM |

### 2.4 Imovel e Negocio

A CERTIDAO_DISTRIBUIDOR nao alimenta campos de imovel ou negocio juridico.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_pesquisado | nome / pj_denominacao | pessoa_natural / pessoa_juridica |
| cpf_cnpj | cpf / pj_cnpj | pessoa_natural / pessoa_juridica |
| tipo_certidao | cd_tipo | certidao |
| orgao_emissor | cd_orgao_emissor | certidao |
| comarca | cd_comarca | certidao |
| resultado | cd_resultado | certidao |
| data_emissao | cd_data_emissao | certidao |
| data_validade | cd_data_validade | certidao |
| codigo_verificacao | cd_codigo_verificacao | certidao |

---

## 4. EXEMPLO SIMPLIFICADO

### Pessoa Fisica - Certidao Civel

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {},
  "certidao": {
    "cd_tipo": "CIVEL",
    "cd_orgao_emissor": "TRIBUNAL DE JUSTICA DE SAO PAULO",
    "cd_comarca": "SAO PAULO",
    "cd_estado": "SP",
    "cd_resultado": "NADA CONSTA",
    "cd_data_emissao": "30/01/2026",
    "cd_data_validade": "30/04/2026",
    "cd_codigo_verificacao": "TJ-SP-2026-123456"
  }
}
```

### Pessoa Juridica - Certidao de Falencia

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {
    "pj_denominacao": "XYZ EMPREENDIMENTOS LTDA",
    "pj_cnpj": "12.345.678/0001-90"
  },
  "imovel": {},
  "negocio": {},
  "certidao": {
    "cd_tipo": "FALENCIA",
    "cd_orgao_emissor": "TRIBUNAL DE JUSTICA DE SAO PAULO",
    "cd_comarca": "SAO PAULO",
    "cd_estado": "SP",
    "cd_resultado": "NADA CONSTA",
    "cd_data_emissao": "30/01/2026",
    "cd_data_validade": "30/04/2026",
    "cd_codigo_verificacao": "TJ-SP-FAL-2026-789012"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Referencia na Escritura

Na escritura publica, as certidoes de distribuidor sao referenciadas como:

> "Apresentou o(a) alienante certidao negativa de distribuicao de acoes **[tipo]** do **[orgao]** da comarca de **[comarca]**, expedida em **[data_emissao]**, com validade ate **[data_validade]**, codigo de verificacao **[codigo]**, comprovando que **[resultado]**."

### 5.2 Validacao

- CPF/CNPJ deve corresponder ao alienante
- Certidao deve estar dentro da validade (geralmente 90 dias)
- Resultado deve ser "NADA CONSTA" para prosseguir sem ressalvas
- Codigo de verificacao permite validacao online no site do orgao emissor

### 5.3 Tipos de Resultado

| Resultado | Significado | Impacto na Escritura |
|-----------|-------------|---------------------|
| **NADA CONSTA** | Sem registros | Transacao pode prosseguir |
| **CONSTAM REGISTROS** | Ha processos/registros | Analise de risco necessaria |

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CNDT, CND_FEDERAL, etc. (20 docs) | Correlacionar com alienante |
| cpf | RG, CNH, CNDT, CND_FEDERAL, etc. (17 docs) | Identificar pessoa |
| pj_denominacao | CONTRATO_SOCIAL, CNDT, CND_FEDERAL (11 docs) | Identificar empresa |
| pj_cnpj | CONTRATO_SOCIAL, CNDT, CND_FEDERAL (11 docs) | Identificar empresa |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

A CERTIDAO_DISTRIBUIDOR fornece apenas dados de identificacao e do resultado da pesquisa. Para qualificacao completa:

### Pessoa Natural
- `rg`, `data_nascimento`, `filiacao_*`: Obter de RG
- `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `profissao`, `domicilio_*`: Obter de ESCRITURA, COMPROVANTE_RESIDENCIA

### Pessoa Juridica
- `pj_sede_*`: Obter de CONTRATO_SOCIAL
- `pj_admin_*`: Obter de CONTRATO_SOCIAL

---

## 8. SUBTIPOS DE CERTIDAO

### 8.1 Certidao Civel

- **Fonte:** Distribuidor Civel (2o Oficio)
- **O que revela:** Processos civeis em tramitacao
- **Validade:** 90 dias
- **Importancia:** ALTA - Processos podem resultar em penhora

### 8.2 Certidao Criminal

- **Fonte:** Distribuidor Criminal
- **O que revela:** Processos criminais
- **Validade:** 90 dias
- **Importancia:** MEDIA - Idoneidade do vendedor

### 8.3 Certidao de Protesto

- **Fonte:** Cartorio de Protesto
- **O que revela:** Titulos protestados (cheques, notas promissorias)
- **Validade:** 90 dias
- **Importancia:** ALTA - Indica problemas financeiros

### 8.4 Certidao de Falencia/Recuperacao Judicial

- **Fonte:** Distribuidor de Falencias (Foro Central)
- **O que revela:** Processo de falencia ou recuperacao judicial
- **Validade:** 90 dias
- **Importancia:** ALTA para PJ - Bens podem estar indisponiveis

### 8.5 Certidao de Execucao Fiscal

- **Fonte:** Distribuidor Civel/Fiscal
- **O que revela:** Dividas fiscais em execucao
- **Validade:** 90 dias
- **Importancia:** ALTA - Fisco tem preferencia sobre outros credores

### 8.6 Certidao de Interdicao/Tutela

- **Fonte:** Registro Civil (1o Oficio)
- **O que revela:** Capacidade civil do vendedor
- **Validade:** 6 meses
- **Importancia:** BAIXA mas obrigatoria - Valida capacidade

---

## 9. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Campos Completos: `campos-completos/CERTIDAO_DISTRIBUIDOR.md`
- Pesquisa: `pesquisa-documentos-escritura/10-certidoes-distribuidores.md`
- Legislacao: Lei 8.935/1994, Lei 11.101/2005, Art. 1.345 CC

---

## CHANGELOG

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2026-01-30 | 1.0 | Documentacao inicial - novo tipo de documento |
