# DADOS_CADASTRAIS - Certidao de Dados Cadastrais do Imovel (Campos Uteis)

**Total de Campos Uteis**: 13 campos
**Categorias**: Imovel (13)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 13 campos (este arquivo)
- Campos Completos: ~25 campos (ver `campos-completos/DADOS_CADASTRAIS.md`)

A Certidao de Dados Cadastrais e um documento emitido pela Prefeitura que contem informacoes detalhadas do cadastro municipal do imovel.

### Diferenca entre DADOS_CADASTRAIS e IPTU (Carne)

| Aspecto | DADOS_CADASTRAIS | IPTU (Carne) |
|---------|------------------|--------------|
| **Natureza** | Certidao oficial com dados cadastrais | Boleto/carne de cobranca anual |
| **Emissao** | Solicitada individualmente | Enviada automaticamente anualmente |
| **Detalhamento** | Completo (tipo imovel, areas, cadastro) | Resumido (foco no pagamento) |
| **Validade** | Data de expedicao da certidao | Exercicio fiscal (ano corrente) |
| **Dados de Contribuinte** | Pode ter PF e/ou PJ | Normalmente apenas contribuinte principal |
| **Uso Principal** | Documentacao para escrituras | Comprovante de situacao fiscal |

**Quando usar cada um:**
- **DADOS_CADASTRAIS**: Para escrituras e minutas que exigem certidao oficial
- **IPTU**: Para consulta rapida de SQL, endereco e valor venal

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Dados do Imovel (13 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula (se informado) | "46.511" | NAO |
| imovel_sql | Cadastro Municipal (SQL) | "039.080.0244-3" | SIM - CRITICO |
| imovel_logradouro | Logradouro do imovel | "RUA FRANCISCO CRUZ" | SIM |
| imovel_numero | Numero do imovel | "515" | SIM |
| imovel_complemento | Complemento (apto, bloco, sala) | "APTO 124 BL-B" | Condicional |
| imovel_bairro | Bairro do imovel | "VILA MARIANA" | SIM |
| imovel_cidade | Cidade do imovel | "Sao Paulo" | SIM |
| imovel_estado | Estado do imovel | "SP" | SIM |
| imovel_cep | CEP do imovel | "04117-902" | Condicional |
| imovel_area_total | Area total do terreno em m2 | "1666.00" | Condicional |
| imovel_area_construida | Area construida em m2 | "112.00" | Condicional |
| imovel_denominacao | Tipo do imovel | "Apartamento Residencial" | Condicional |
| imovel_data_certidao_cadastro | Data de expedicao da certidao | "2025-10-15" | SIM |

**Notas**:
- O SQL e o identificador unico do imovel no cadastro municipal
- A certidao pode conter mais detalhes que o carne de IPTU
- A `imovel_denominacao` descreve o tipo/uso do imovel (residencial, comercial, terreno, etc.)
- A data de expedicao e importante para validar a atualidade das informacoes

---

## 3. SOBRE DADOS DE CONTRIBUINTES

### 3.1 Multiplos Contribuintes

A Certidao de Dados Cadastrais pode apresentar **multiplos contribuintes**, que podem ser:
- **Apenas Pessoa Fisica (PF)**: Proprietario individual
- **Apenas Pessoa Juridica (PJ)**: Empresa proprietaria
- **PF + PJ combinados**: Quando ha coproprietarios de diferentes naturezas
- **Multiplas PFs**: Quando ha varios proprietarios pessoas fisicas
- **Multiplas PJs**: Quando ha varios proprietarios pessoas juridicas

### 3.2 Dados de Contribuinte Disponiveis no Documento

Embora o documento contenha dados de contribuintes, o mapeamento atual **nao extrai** esses campos diretamente para as categorias `pessoa_natural` ou `pessoa_juridica`. Os dados visiveis no documento sao:

**Para Pessoa Fisica (PF) - NAO MAPEADOS**:
| Dado no Documento | Campo Potencial | Status |
|-------------------|-----------------|--------|
| Nome do contribuinte | nome | Visivel no documento |
| CPF do contribuinte | cpf | Visivel no documento |

**Para Pessoa Juridica (PJ) - NAO MAPEADOS**:
| Dado no Documento | Campo Potencial | Status |
|-------------------|-----------------|--------|
| Razao social | pj_denominacao | Visivel no documento |
| CNPJ | pj_cnpj | Visivel no documento |

**Importante**: Os dados de contribuintes devem ser obtidos de documentos especificos como:
- **RG/CNH**: Para identificacao completa de PF
- **CONTRATO_SOCIAL**: Para dados completos de PJ
- **MATRICULA_IMOVEL**: Para proprietarios registrados

---

## 4. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| cadastro_municipal.sql | imovel_sql | imovel |
| cadastro_municipal.matricula | matricula_numero | imovel |
| endereco_imovel.logradouro | imovel_logradouro | imovel |
| endereco_imovel.numero | imovel_numero | imovel |
| endereco_imovel.complemento | imovel_complemento | imovel |
| endereco_imovel.bairro | imovel_bairro | imovel |
| endereco_imovel.cidade | imovel_cidade | imovel |
| endereco_imovel.estado | imovel_estado | imovel |
| endereco_imovel.cep | imovel_cep | imovel |
| caracteristicas.area_terreno | imovel_area_total | imovel |
| caracteristicas.area_construida | imovel_area_construida | imovel |
| caracteristicas.tipo_imovel | imovel_denominacao | imovel |
| certidao.data_expedicao | imovel_data_certidao_cadastro | imovel |

---

## 5. EXEMPLO SIMPLIFICADO

```json
{
  "imovel": {
    "matricula_numero": "46.511",
    "imovel_sql": "039.080.0244-3",
    "imovel_logradouro": "RUA FRANCISCO CRUZ",
    "imovel_numero": "515",
    "imovel_complemento": "APTO 124 BL-B",
    "imovel_bairro": "VILA MARIANA",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP",
    "imovel_cep": "04117-902",
    "imovel_area_total": "1666.00",
    "imovel_area_construida": "112.00",
    "imovel_denominacao": "Apartamento Residencial",
    "imovel_data_certidao_cadastro": "2025-10-15"
  }
}
```

---

## 6. USO EM MINUTAS

### 6.1 Escritura de Compra e Venda
- `imovel_sql` -> Identificacao do imovel no cadastro municipal
- `imovel_denominacao` -> Tipo do imovel na descricao
- `imovel_logradouro/numero/complemento/bairro/cidade/estado` -> Endereco completo
- `imovel_area_construida` -> Referencia de area

### 6.2 Validacoes em Minutas
- O SQL dos DADOS_CADASTRAIS deve coincidir com SQL do IPTU e MATRICULA
- O endereco deve ser consistente entre todos os documentos
- A denominacao deve ser compativel com o registro na matricula
- A certidao deve estar dentro da validade (geralmente 30 dias)

### 6.3 Quando Preferir DADOS_CADASTRAIS ao IPTU

| Situacao | Documento Recomendado |
|----------|----------------------|
| Minuta exige certidao oficial | DADOS_CADASTRAIS |
| Confirmacao de tipo/uso do imovel | DADOS_CADASTRAIS |
| Consulta rapida de SQL | IPTU (mais comum) |
| Valor venal para IPTU | IPTU |
| Detalhes de areas | DADOS_CADASTRAIS |

---

## 7. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| imovel_sql | IPTU, VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel |
| imovel_logradouro | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| imovel_numero | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| imovel_complemento | IPTU, MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar unidade |
| imovel_bairro | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, CND_MUNICIPAL | Validar endereco |
| imovel_area_construida | IPTU, MATRICULA_IMOVEL, VVR | Validar caracteristicas |
| imovel_area_total | IPTU, MATRICULA_IMOVEL, COMPROMISSO | Validar caracteristicas |
| imovel_denominacao | MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar tipo de imovel |
| matricula_numero | IPTU, VVR, ITBI, MATRICULA_IMOVEL | Identificar matricula |

### Correlacao Especifica

| Documento | Campos em Comum | Uso da Correlacao |
|-----------|-----------------|-------------------|
| IPTU | sql, endereco, areas | Validar dados cadastrais |
| VVR | sql, endereco, area_construida | Validar para ITBI |
| CND_MUNICIPAL | sql, endereco | Validar situacao fiscal |
| MATRICULA_IMOVEL | matricula, endereco, areas, denominacao | Validar registro oficial |

---

## 8. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis para minutas que NAO vem dos DADOS_CADASTRAIS:

**Pessoa Natural (precisa de outros documentos)**:
- `nome`, `cpf` -> Visivel no documento mas obter de RG, CNH ou declaracao
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg` -> RG ou CNH
- `estado_civil`, `regime_bens` -> CERTIDAO_CASAMENTO
- `profissao`, `nacionalidade` -> RG, CNH ou declaracao
- `data_nascimento` -> RG, CNH ou CERTIDAO_NASCIMENTO
- `domicilio_*` (endereco residencial) -> COMPROVANTE_RESIDENCIA
- `filiacao_pai`, `filiacao_mae` -> RG ou CERTIDAO_NASCIMENTO

**Pessoa Juridica (precisa de outros documentos)**:
- `pj_denominacao`, `pj_cnpj` -> Visivel no documento mas obter de CONTRATO_SOCIAL
- `pj_nire`, `pj_sede_*` -> CONTRATO_SOCIAL
- `pj_admin_*` -> CONTRATO_SOCIAL

**Imovel (precisa de outros documentos)**:
- `imovel_valor_venal_iptu` -> IPTU
- `imovel_valor_venal_referencia` (VVR para ITBI) -> VVR
- `imovel_descricao_conforme_matricula` -> MATRICULA_IMOVEL
- `imovel_area_privativa` -> MATRICULA_IMOVEL
- `matricula_cartorio_*` -> MATRICULA_IMOVEL
- `proprietario_*` (dados de registro) -> MATRICULA_IMOVEL

**Negocio**:
- `negocio_valor_total`, `alienante_nome`, `adquirente_nome` -> ITBI, COMPROMISSO, ESCRITURA
- `itbi_*` (dados do imposto de transmissao) -> ITBI

---

## 9. VALIDACOES CRUZADAS RECOMENDADAS

| Validacao | Documento Comparado | Regra |
|-----------|-------------------|-------|
| SQL consistente | IPTU, VVR, CND_MUNICIPAL, ITBI | DADOS_CADASTRAIS.sql == outro.sql |
| Endereco consistente | MATRICULA_IMOVEL, IPTU, ITBI | Logradouro + numero devem coincidir |
| Area consistente | MATRICULA_IMOVEL, IPTU | Areas devem ser compativeis (tolerancia) |
| Denominacao compativel | MATRICULA_IMOVEL | Tipo de imovel deve ser consistente |
| Certidao atualizada | - | Data de expedicao < 30 dias |
| Contribuinte = Proprietario | MATRICULA_IMOVEL | Contribuinte deve ser proprietario atual |

---

## 10. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/dados_cadastrais.json`
- Campos Completos: `campos-completos/DADOS_CADASTRAIS.md`
- Guia de Campos Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Documento Similar: `campos-uteis/IPTU.md`
