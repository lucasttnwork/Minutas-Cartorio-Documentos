# IPTU - Carne/Certidao de IPTU (Campos Uteis)

**Total de Campos Uteis**: 13 campos
**Categorias**: Pessoa Natural (2), Imovel (11)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 13 campos (este arquivo)
- Campos Completos: ~30 campos (ver `campos-completos/IPTU.md`)

O IPTU e a fonte primaria para dados cadastrais do imovel no municipio, incluindo o SQL (Setor Quadra Lote) e o valor venal para fins de IPTU.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do contribuinte/proprietario | "RODOLFO WOLFGANG ORTRIWANO" | SIM |
| CPF | CPF do contribuinte | "585.096.668-49" | Condicional |

**Notas**:
- O CPF pode nao estar presente em carnes antigos
- Se pessoa juridica, o CNPJ aparece em vez do CPF (mapeado em pessoa_juridica)

### 2.2 Dados do Imovel (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NUMERO DA MATRICULA | Numero da matricula (se disponivel) | "46.511" | NAO |
| SQL | Cadastro Municipal (SQL) | "039.080.0244-3" | SIM - CRITICO |
| LOGRADOURO | Logradouro do imovel | "R FRANCISCO CRUZ" | SIM |
| NUMERO | Numero do imovel | "515" | SIM |
| COMPLEMENTO | Complemento (apto, bloco) | "APTO 124 BL-B" | Condicional |
| BAIRRO | Bairro do imovel | "VILA MARIANA" | Condicional |
| CIDADE | Cidade do imovel | "Sao Paulo" | SIM (inferido) |
| ESTADO | Estado do imovel | "SP" | SIM (inferido) |
| CEP | CEP do imovel | "04117-902" | SIM |
| AREA TOTAL EM M2 | Area total do terreno em m2 | "1666.00" | Condicional |
| AREA CONSTRUIDA EM M2 | Area construida em m2 | "112.00" | Condicional |
| VALOR VENAL DO IPTU | Valor venal para IPTU | "234191.00" | SIM - CRITICO |

**Notas**:
- O SQL e o identificador unico do imovel no cadastro municipal
- Cidade e estado sao inferidos do orgao emissor ("Prefeitura de Sao Paulo" = Sao Paulo/SP)
- O bairro frequentemente nao aparece de forma explicita no IPTU de Sao Paulo
- Areas vem em certidoes detalhadas, nem sempre presentes no carne simples

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| contribuintes[].nome | NOME | pessoa_natural |
| contribuintes[].cpf | CPF | pessoa_natural |
| cadastro_imovel | SQL | imovel |
| endereco_imovel.logradouro | LOGRADOURO | imovel |
| endereco_imovel.numero | NUMERO | imovel |
| endereco_imovel.complemento | COMPLEMENTO | imovel |
| endereco_imovel.bairro | BAIRRO | imovel |
| (inferido do emissor) | CIDADE | imovel |
| (inferido do emissor) | ESTADO | imovel |
| endereco_imovel.cep | CEP | imovel |
| dados_terreno.area | AREA TOTAL EM M2 | imovel |
| dados_construcao.area | AREA CONSTRUIDA EM M2 | imovel |
| valor_venal_total | VALOR VENAL DO IPTU | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "NOME": "RODOLFO WOLFGANG ORTRIWANO",
    "CPF": "585.096.668-49"
  },
  "imovel": {
    "SQL": "039.080.0244-3",
    "LOGRADOURO": "R FRANCISCO CRUZ",
    "NUMERO": "515",
    "COMPLEMENTO": "APTO 124 BL-B",
    "BAIRRO": "VILA MARIANA",
    "CIDADE": "Sao Paulo",
    "ESTADO": "SP",
    "CEP": "04117-902",
    "AREA TOTAL EM M2": "1666.00",
    "AREA CONSTRUIDA EM M2": "112.00",
    "VALOR VENAL DO IPTU": "234191.00"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda
- `SQL` -> Identificacao do imovel no cadastro municipal
- `VALOR VENAL DO IPTU` -> Referencia de valor (diferente do VVR usado no ITBI)
- `LOGRADOURO/NUMERO/COMPLEMENTO/BAIRRO/CIDADE/ESTADO/CEP` -> Endereco completo do imovel

### 5.2 Validacoes em Minutas
- O SQL do IPTU deve coincidir com o SQL da Matricula (quando presente)
- O endereco deve ser consistente com Matricula e ITBI
- O contribuinte (nome/cpf) deve ser o proprietario atual

### 5.3 Diferenca entre Valor Venal IPTU e VVR

| Aspecto | Valor Venal IPTU | Valor Venal de Referencia (VVR) |
|---------|------------------|--------------------------------|
| **Finalidade** | Base de calculo do IPTU anual | Base de calculo do ITBI |
| **Documento** | IPTU, DADOS_CADASTRAIS | VVR |
| **Valor tipico** | Geralmente MENOR | Geralmente MAIOR |
| **Campo mapeado** | imovel_valor_venal_iptu | imovel_valor_venal_referencia |

**Exemplo Real (mesmo imovel)**:
- Valor Venal IPTU (2023): R$ 234.191,00
- VVR (26/10/2023): R$ 301.147,00

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| SQL | VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, DADOS_CADASTRAIS, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel |
| LOGRADOURO | MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| NUMERO | MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| BAIRRO | MATRICULA_IMOVEL, ITBI, ESCRITURA, CND_MUNICIPAL | Validar endereco |
| AREA CONSTRUIDA EM M2 | MATRICULA_IMOVEL, VVR, DADOS_CADASTRAIS | Validar caracteristicas |
| NOME | RG, CNH, MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar proprietario |
| CPF | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Validar identidade |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis para minutas que NAO vem do IPTU:

**Pessoa Natural (precisa de outros documentos)**:
- `RG`, `ORGAO EMISSOR DO RG`, `ESTADO EMISSOR DO RG` -> RG ou CNH
- `ESTADO CIVIL`, `REGIME DE BENS` -> CERTIDAO_CASAMENTO
- `PROFISSAO`, `NACIONALIDADE` -> RG, CNH ou declaracao
- `data_nascimento` -> RG, CNH ou CERTIDAO_NASCIMENTO
- `LOGRADOURO`, `NUMERO`, `COMPLEMENTO`, `BAIRRO`, `CIDADE`, `ESTADO`, `CEP` (endereco residencial) -> COMPROVANTE_RESIDENCIA
- `filiacao_pai`, `filiacao_mae` -> RG ou CERTIDAO_NASCIMENTO

**Imovel (precisa de outros documentos)**:
- `NUMERO DA MATRICULA`, `NUMERO DO REGISTRO DE IMOVEIS`, `CIDADE DO REGISTRO DE IMOVEIS` -> MATRICULA_IMOVEL
- `DESCRICAO CONFORME MATRICULA` -> MATRICULA_IMOVEL
- `imovel_valor_venal_referencia` (VVR para ITBI) -> VVR
- `proprietario_*` (dados de registro) -> MATRICULA_IMOVEL

**Negocio**:
- `VALOR TOTAL`, `NOME DO ALIENANTE`, `NOME DO ADQUIRENTE` -> ITBI, COMPROMISSO, ESCRITURA
- `itbi_*` (dados do imposto de transmissao) -> ITBI

---

## 8. VALIDACOES CRUZADAS RECOMENDADAS

| Validacao | Documento Comparado | Regra |
|-----------|-------------------|-------|
| SQL consistente | VVR, CND_MUNICIPAL, ITBI | SQL == SQL de outro documento |
| Endereco consistente | MATRICULA_IMOVEL, ITBI | LOGRADOURO + NUMERO devem coincidir |
| Contribuinte = Proprietario | MATRICULA_IMOVEL | Contribuinte IPTU deve ser proprietario atual |
| Area consistente | MATRICULA_IMOVEL | AREA TOTAL EM M2 e AREA CONSTRUIDA EM M2 devem ser compativeis (tolerancia) |
| Valor venal IPTU < VVR | VVR | VALOR VENAL DO IPTU < VVR (VVR mais proximo do mercado) |

---

## 9. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/iptu.json`
- Campos Completos: `campos-completos/IPTU.md`
- Guia de Campos Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Guia de Campos Pessoa Natural: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
