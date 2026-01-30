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
| nome | Nome do contribuinte/proprietario | "RODOLFO WOLFGANG ORTRIWANO" | SIM |
| cpf | CPF do contribuinte | "585.096.668-49" | Condicional |

**Notas**:
- O CPF pode nao estar presente em carnes antigos
- Se pessoa juridica, o CNPJ aparece em vez do CPF (mapeado em pessoa_juridica)

### 2.2 Dados do Imovel (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula (se disponivel) | "46.511" | NAO |
| imovel_sql | Cadastro Municipal (SQL) | "039.080.0244-3" | SIM - CRITICO |
| imovel_logradouro | Logradouro do imovel | "R FRANCISCO CRUZ" | SIM |
| imovel_numero | Numero do imovel | "515" | SIM |
| imovel_complemento | Complemento (apto, bloco) | "APTO 124 BL-B" | Condicional |
| imovel_bairro | Bairro do imovel | "VILA MARIANA" | Condicional |
| imovel_cidade | Cidade do imovel | "Sao Paulo" | SIM (inferido) |
| imovel_estado | Estado do imovel | "SP" | SIM (inferido) |
| imovel_cep | CEP do imovel | "04117-902" | SIM |
| imovel_area_total | Area total do terreno em m2 | "1666.00" | Condicional |
| imovel_area_construida | Area construida em m2 | "112.00" | Condicional |
| imovel_valor_venal_iptu | Valor venal para IPTU | "234191.00" | SIM - CRITICO |

**Notas**:
- O SQL e o identificador unico do imovel no cadastro municipal
- Cidade e estado sao inferidos do orgao emissor ("Prefeitura de Sao Paulo" = Sao Paulo/SP)
- O bairro frequentemente nao aparece de forma explicita no IPTU de Sao Paulo
- Areas vem em certidoes detalhadas, nem sempre presentes no carne simples

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| contribuintes[].nome | nome | pessoa_natural |
| contribuintes[].cpf | cpf | pessoa_natural |
| cadastro_imovel | imovel_sql | imovel |
| endereco_imovel.logradouro | imovel_logradouro | imovel |
| endereco_imovel.numero | imovel_numero | imovel |
| endereco_imovel.complemento | imovel_complemento | imovel |
| endereco_imovel.bairro | imovel_bairro | imovel |
| (inferido do emissor) | imovel_cidade | imovel |
| (inferido do emissor) | imovel_estado | imovel |
| endereco_imovel.cep | imovel_cep | imovel |
| dados_terreno.area | imovel_area_total | imovel |
| dados_construcao.area | imovel_area_construida | imovel |
| valor_venal_total | imovel_valor_venal_iptu | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "RODOLFO WOLFGANG ORTRIWANO",
    "cpf": "585.096.668-49"
  },
  "imovel": {
    "imovel_sql": "039.080.0244-3",
    "imovel_logradouro": "R FRANCISCO CRUZ",
    "imovel_numero": "515",
    "imovel_complemento": "APTO 124 BL-B",
    "imovel_bairro": "VILA MARIANA",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP",
    "imovel_cep": "04117-902",
    "imovel_area_total": "1666.00",
    "imovel_area_construida": "112.00",
    "imovel_valor_venal_iptu": "234191.00"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda
- `imovel_sql` -> Identificacao do imovel no cadastro municipal
- `imovel_valor_venal_iptu` -> Referencia de valor (diferente do VVR usado no ITBI)
- `imovel_logradouro/numero/complemento/bairro/cidade/estado/cep` -> Endereco completo do imovel

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
| imovel_sql | VVR, CND_MUNICIPAL, CND_IMOVEL, ITBI, DADOS_CADASTRAIS, MATRICULA_IMOVEL | Identificador PRIMARIO do imovel |
| imovel_logradouro | MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| imovel_numero | MATRICULA_IMOVEL, ITBI, ESCRITURA, COMPROMISSO, VVR | Validar endereco |
| imovel_bairro | MATRICULA_IMOVEL, ITBI, ESCRITURA, CND_MUNICIPAL | Validar endereco |
| imovel_area_construida | MATRICULA_IMOVEL, VVR, DADOS_CADASTRAIS | Validar caracteristicas |
| nome | RG, CNH, MATRICULA_IMOVEL, ESCRITURA, COMPROMISSO | Validar proprietario |
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL | Validar identidade |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis para minutas que NAO vem do IPTU:

**Pessoa Natural (precisa de outros documentos)**:
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg` -> RG ou CNH
- `estado_civil`, `regime_bens` -> CERTIDAO_CASAMENTO
- `profissao`, `nacionalidade` -> RG, CNH ou declaracao
- `data_nascimento` -> RG, CNH ou CERTIDAO_NASCIMENTO
- `domicilio_*` (endereco residencial) -> COMPROVANTE_RESIDENCIA
- `filiacao_pai`, `filiacao_mae` -> RG ou CERTIDAO_NASCIMENTO

**Imovel (precisa de outros documentos)**:
- `matricula_numero`, `matricula_cartorio_*` -> MATRICULA_IMOVEL
- `imovel_descricao_conforme_matricula` -> MATRICULA_IMOVEL
- `imovel_valor_venal_referencia` (VVR para ITBI) -> VVR
- `proprietario_*` (dados de registro) -> MATRICULA_IMOVEL

**Negocio**:
- `negocio_valor_total`, `alienante_nome`, `adquirente_nome` -> ITBI, COMPROMISSO, ESCRITURA
- `itbi_*` (dados do imposto de transmissao) -> ITBI

---

## 8. VALIDACOES CRUZADAS RECOMENDADAS

| Validacao | Documento Comparado | Regra |
|-----------|-------------------|-------|
| SQL consistente | VVR, CND_MUNICIPAL, ITBI | IPTU.sql == outro.sql |
| Endereco consistente | MATRICULA_IMOVEL, ITBI | Logradouro + numero devem coincidir |
| Contribuinte = Proprietario | MATRICULA_IMOVEL | Contribuinte IPTU deve ser proprietario atual |
| Area consistente | MATRICULA_IMOVEL | Areas devem ser compativeis (tolerancia de arredondamento) |
| Valor venal IPTU < VVR | VVR | Normalmente IPTU < VVR (VVR mais proximo do mercado) |

---

## 9. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/iptu.json`
- Campos Completos: `campos-completos/IPTU.md`
- Guia de Campos Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Guia de Campos Pessoa Natural: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
