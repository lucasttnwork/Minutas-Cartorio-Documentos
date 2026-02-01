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
| NUMERO DA MATRICULA | Numero da matricula (se informado) | "46.511" | NAO |
| SQL | Cadastro Municipal (SQL) | "039.080.0244-3" | SIM - CRITICO |
| LOGRADOURO | Logradouro do imovel | "RUA FRANCISCO CRUZ" | SIM |
| NUMERO | Numero do imovel | "515" | SIM |
| COMPLEMENTO | Complemento (apto, bloco, sala) | "APTO 124 BL-B" | Condicional |
| BAIRRO | Bairro do imovel | "VILA MARIANA" | SIM |
| CIDADE | Cidade do imovel | "Sao Paulo" | SIM |
| ESTADO | Estado do imovel | "SP" | SIM |
| CEP | CEP do imovel | "04117-902" | Condicional |
| AREA TOTAL EM M2 | Area total do terreno em m2 | "1666.00" | Condicional |
| AREA CONSTRUIDA EM M2 | Area construida em m2 | "112.00" | Condicional |
| DENOMINACAO DO IMOVEL | Tipo do imovel | "Apartamento Residencial" | Condicional |
| DATA DA CERTIDAO DE CADASTRO | Data de expedicao da certidao | "2025-10-15" | SIM |

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
| Nome do contribuinte | NOME | Visivel no documento |
| CPF do contribuinte | CPF | Visivel no documento |

**Para Pessoa Juridica (PJ) - NAO MAPEADOS**:
| Dado no Documento | Campo Potencial | Status |
|-------------------|-----------------|--------|
| Razao social | DENOMINACAO | Visivel no documento |
| CNPJ | CNPJ | Visivel no documento |

**Importante**: Os dados de contribuintes devem ser obtidos de documentos especificos como:
- **RG/CNH**: Para identificacao completa de PF
- **CONTRATO_SOCIAL**: Para dados completos de PJ
- **MATRICULA_IMOVEL**: Para proprietarios registrados

---

## 4. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| cadastro_municipal.sql | SQL | imovel |
| cadastro_municipal.matricula | NUMERO DA MATRICULA | imovel |
| endereco_imovel.logradouro | LOGRADOURO | imovel |
| endereco_imovel.numero | NUMERO | imovel |
| endereco_imovel.complemento | COMPLEMENTO | imovel |
| endereco_imovel.bairro | BAIRRO | imovel |
| endereco_imovel.cidade | CIDADE | imovel |
| endereco_imovel.estado | ESTADO | imovel |
| endereco_imovel.cep | CEP | imovel |
| caracteristicas.area_terreno | AREA TOTAL EM M2 | imovel |
| caracteristicas.area_construida | AREA CONSTRUIDA EM M2 | imovel |
| caracteristicas.tipo_imovel | DENOMINACAO DO IMOVEL | imovel |
| certidao.data_expedicao | DATA DA CERTIDAO DE CADASTRO | imovel |

---

## 5. EXEMPLO SIMPLIFICADO

```json
{
  "imovel": {
    "NUMERO DA MATRICULA": "46.511",
    "SQL": "039.080.0244-3",
    "LOGRADOURO": "RUA FRANCISCO CRUZ",
    "NUMERO": "515",
    "COMPLEMENTO": "APTO 124 BL-B",
    "BAIRRO": "VILA MARIANA",
    "CIDADE": "Sao Paulo",
    "ESTADO": "SP",
    "CEP": "04117-902",
    "AREA TOTAL EM M2": "1666.00",
    "AREA CONSTRUIDA EM M2": "112.00",
    "DENOMINACAO DO IMOVEL": "Apartamento Residencial",
    "DATA DA CERTIDAO DE CADASTRO": "2025-10-15"
  }
}
```

---

## 6. USO EM MINUTAS

### 6.1 Escritura de Compra e Venda
- `SQL` -> Identificacao do imovel no cadastro municipal
- `DENOMINACAO DO IMOVEL` -> Tipo do imovel na descricao
- `LOGRADOURO/NUMERO/COMPLEMENTO/BAIRRO/CIDADE/ESTADO` -> Endereco completo
- `AREA CONSTRUIDA EM M2` -> Referencia de area

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
| SQL | IPTU, VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel |
| LOGRADOURO | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| NUMERO | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| COMPLEMENTO | IPTU, MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar unidade |
| BAIRRO | IPTU, MATRICULA_IMOVEL, ITBI, ESCRITURA, CND_MUNICIPAL | Validar endereco |
| AREA CONSTRUIDA EM M2 | IPTU, MATRICULA_IMOVEL, VVR | Validar caracteristicas |
| AREA TOTAL EM M2 | IPTU, MATRICULA_IMOVEL, COMPROMISSO | Validar caracteristicas |
| DENOMINACAO DO IMOVEL | MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar tipo de imovel |
| NUMERO DA MATRICULA | IPTU, VVR, ITBI, MATRICULA_IMOVEL | Identificar matricula |

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
- `NOME`, `CPF` -> Visivel no documento mas obter de RG, CNH ou declaracao
- `RG`, `ORGAO EMISSOR DO RG`, `ESTADO EMISSOR DO RG` -> RG ou CNH
- `ESTADO CIVIL`, `REGIME DE BENS` -> CERTIDAO_CASAMENTO
- `PROFISSAO`, `NACIONALIDADE` -> RG, CNH ou declaracao
- `data_nascimento` -> RG, CNH ou CERTIDAO_NASCIMENTO
- `LOGRADOURO`, `NUMERO`, `COMPLEMENTO`, `BAIRRO`, `CIDADE`, `ESTADO`, `CEP` (endereco residencial) -> COMPROVANTE_RESIDENCIA
- `filiacao_pai`, `filiacao_mae` -> RG ou CERTIDAO_NASCIMENTO

**Pessoa Juridica (precisa de outros documentos)**:
- `DENOMINACAO`, `CNPJ` -> Visivel no documento mas obter de CONTRATO_SOCIAL
- `pj_nire`, `LOGRADOURO DA SEDE`, `NUMERO DA SEDE`, `BAIRRO DA SEDE`, `CIDADE DA SEDE`, `ESTADO DA SEDE`, `CEP DA SEDE` -> CONTRATO_SOCIAL
- `NOME DO ADMINISTRADOR`, `CPF DO ADMINISTRADOR` -> CONTRATO_SOCIAL

**Imovel (precisa de outros documentos)**:
- `VALOR VENAL DO IPTU` -> IPTU
- `imovel_valor_venal_referencia` (VVR para ITBI) -> VVR
- `DESCRICAO CONFORME MATRICULA` -> MATRICULA_IMOVEL
- `imovel_area_privativa` -> MATRICULA_IMOVEL
- `NUMERO DO REGISTRO DE IMOVEIS`, `CIDADE DO REGISTRO DE IMOVEIS` -> MATRICULA_IMOVEL
- `proprietario_*` (dados de registro) -> MATRICULA_IMOVEL

**Negocio**:
- `VALOR TOTAL`, `NOME DO ALIENANTE`, `NOME DO ADQUIRENTE` -> ITBI, COMPROMISSO, ESCRITURA
- `itbi_*` (dados do imposto de transmissao) -> ITBI

---

## 9. VALIDACOES CRUZADAS RECOMENDADAS

| Validacao | Documento Comparado | Regra |
|-----------|-------------------|-------|
| SQL consistente | IPTU, VVR, CND_MUNICIPAL, ITBI | SQL == SQL de outro documento |
| Endereco consistente | MATRICULA_IMOVEL, IPTU, ITBI | LOGRADOURO + NUMERO devem coincidir |
| Area consistente | MATRICULA_IMOVEL, IPTU | AREA TOTAL EM M2 e AREA CONSTRUIDA EM M2 devem ser compativeis (tolerancia) |
| Denominacao compativel | MATRICULA_IMOVEL | DENOMINACAO DO IMOVEL deve ser consistente |
| Certidao atualizada | - | DATA DA CERTIDAO DE CADASTRO < 30 dias |
| Contribuinte = Proprietario | MATRICULA_IMOVEL | Contribuinte deve ser proprietario atual |

---

## 10. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/dados_cadastrais.json`
- Campos Completos: `campos-completos/DADOS_CADASTRAIS.md`
- Guia de Campos Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Documento Similar: `campos-uteis/IPTU.md`
