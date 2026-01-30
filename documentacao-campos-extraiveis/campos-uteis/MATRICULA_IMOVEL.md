# MATRICULA_IMOVEL - Certidao de Matricula (Campos Uteis)

**Total de Campos Uteis**: 43 campos
**Categorias**: Pessoa Natural (8), Pessoa Juridica (2), Imovel (33), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais, conforme definido em:
- `execution/mapeamento_documento_campos.json`
- `Guia-de-campos-e-variaveis/campos-dados-imovel.md`

**Diferenca vs. Campos Completos:**
- Campos Uteis: 43 campos (este arquivo)
- Campos Completos: ~50+ campos (ver `campos-completos/MATRICULA_IMOVEL.md`)

A matricula e o documento mais importante para dados do imovel, sendo fonte primaria para 33 dos 44 campos de imovel do sistema.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (8 campos)

Dados dos proprietarios extraidos da matricula.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome do proprietario | "ELIZETE APARECIDA SILVA" | SIM |
| cpf | CPF do proprietario | "949.735.638-20" | Condicional |
| rg | RG do proprietario | "7.878.936-SP" | Condicional |
| orgao_emissor_rg | Orgao emissor do RG | "SSP" | Condicional |
| estado_emissor_rg | UF do orgao emissor | "SP" | Condicional |
| estado_civil | Estado civil | "solteira" | Condicional |
| profissao | Profissao | "bancaria" | Condicional |
| nacionalidade | Nacionalidade | "brasileira" | Condicional |

**Notas:**
- Esses dados vem dos proprietarios atuais registrados na matricula
- Nem todas as matriculas possuem todos os dados (depende da epoca do registro)
- CPF em matriculas antigas pode nao estar presente

---

### 2.2 Pessoa Juridica (2 campos)

Dados de empresas proprietarias.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| pj_denominacao | Razao social | "XYZ EMPREENDIMENTOS LTDA" | SIM (se PJ) |
| pj_cnpj | CNPJ | "12.345.678/0001-90" | SIM (se PJ) |

---

### 2.3 Dados do Imovel (33 campos)

Esta e a categoria principal alimentada pela matricula.

#### Dados da Matricula

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula | "46.511" | SIM |
| matricula_cartorio_numero | Numero do cartorio | "1o OFICIAL DE RI" | SIM |
| matricula_cartorio_cidade | Cidade do cartorio | "Sao Paulo" | SIM |
| matricula_cartorio_estado | Estado do cartorio | "SP" | SIM |
| matricula_numero_nacional | Numero nacional | "0001234..." | Condicional |

#### Descricao do Imovel

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| imovel_denominacao | Tipo do imovel | "apartamento" | SIM |
| imovel_descricao_conforme_matricula | Descricao completa | "Unidade autonoma no 124..." | SIM |
| imovel_sql | Cadastro municipal (SQL) | "039.080.0244-3" | Condicional |
| imovel_area_total | Area total m2 | "83.49" | SIM |
| imovel_area_privativa | Area privativa m2 | "70.83" | Condicional |
| imovel_area_construida | Area construida m2 | "70.83" | Condicional |

#### Endereco do Imovel

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| imovel_logradouro | Logradouro | "Rua Francisco Cruz" | SIM |
| imovel_numero | Numero | "515" | SIM |
| imovel_complemento | Complemento | "Apto 124, Bloco B" | Condicional |
| imovel_bairro | Bairro | "Vila Mariana" | SIM |
| imovel_cidade | Cidade | "Sao Paulo" | SIM |
| imovel_estado | Estado | "SP" | SIM |
| imovel_cep | CEP | "04117-040" | Condicional |

#### Certidao da Matricula

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| imovel_certidao_matricula_numero | Numero/selo da certidao | "1114503C300..." | Condicional |
| imovel_certidao_matricula_data | Data de emissao | "14/11/2023" | SIM |

#### Dados do Proprietario

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| proprietario_nome | Nome do proprietario | "ELIZETE APARECIDA SILVA" | SIM |
| proprietario_fracao_ideal | Fracao ideal | "50%" | Condicional |
| proprietario_registro_aquisicao | Numero do registro (R.X) | "R-1/46.511" | SIM |
| proprietario_data_registro | Data do registro | "17/07/1984" | SIM |
| proprietario_titulo_aquisicao | Titulo de aquisicao | "COMPRA E VENDA" | SIM |

#### Onus e Gravames

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| onus_titulo | Tipo do onus | "HIPOTECA" | Se houver |
| onus_registro | Numero do registro do onus | "R-2/46.511" | Se houver |
| onus_data_registro | Data do registro do onus | "17/07/1984" | Se houver |
| onus_descricao | Descricao do onus | "Hipoteca em favor de..." | Se houver |
| onus_titular_nome | Nome do titular do onus | "BANCO ITAU S/A" | Se houver |
| onus_titular_fracao | Fracao do onus | "100%" | Se houver |

#### Ressalvas

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| ressalva_existencia | Existe ressalva? | "sim" ou "nao" | SIM |
| ressalva_descricao | Descricao da ressalva | "..." | Se houver |

---

### 2.4 Negocio Juridico (0 campos)

A matricula nao alimenta diretamente campos de negocio juridico.

---

## 3. MAPEAMENTO REVERSO

### 3.1 Do Schema para Campo Util

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| numero_matricula | matricula_numero | imovel |
| cartorio | matricula_cartorio_numero | imovel |
| endereco.municipio | matricula_cartorio_cidade | imovel |
| endereco.uf | matricula_cartorio_estado | imovel |
| descricao_imovel.tipo | imovel_denominacao | imovel |
| contribuinte_municipal | imovel_sql | imovel |
| areas.total | imovel_area_total | imovel |
| areas.privativa | imovel_area_privativa | imovel |
| endereco.logradouro | imovel_logradouro | imovel |
| endereco.numero | imovel_numero | imovel |
| endereco.complemento | imovel_complemento | imovel |
| endereco.bairro | imovel_bairro | imovel |
| proprietarios[].nome | proprietario_nome | imovel |
| proprietarios[].cpf | cpf | pessoa_natural |
| proprietarios[].rg | rg | pessoa_natural |
| proprietarios[].estado_civil | estado_civil | pessoa_natural |
| proprietarios[].profissao | profissao | pessoa_natural |
| proprietarios[].nacionalidade | nacionalidade | pessoa_natural |
| onus[].tipo | onus_titulo | imovel |
| onus[].credor | onus_titular_nome | imovel |

---

## 4. EXEMPLO SIMPLIFICADO (Apenas Campos Uteis)

```json
{
  "pessoa_natural": {
    "nome": "ELIZETE APARECIDA SILVA",
    "cpf": "949.735.638-20",
    "rg": "7.878.936-SP",
    "orgao_emissor_rg": "SSP",
    "estado_emissor_rg": "SP",
    "estado_civil": "solteira",
    "profissao": "bancaria",
    "nacionalidade": "brasileira"
  },
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "46.511",
    "matricula_cartorio_numero": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO",
    "matricula_cartorio_cidade": "Sao Paulo",
    "matricula_cartorio_estado": "SP",
    "imovel_denominacao": "apartamento",
    "imovel_sql": "039.080.0244-3",
    "imovel_area_total": "83.49",
    "imovel_area_privativa": "70.83",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_complemento": "Apto 124, Bloco B",
    "imovel_bairro": "Vila Mariana",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP",
    "imovel_descricao_conforme_matricula": "Unidade autonoma no 124 no 12o andar do Edificio Serra do Mar, Bloco B",
    "imovel_certidao_matricula_data": "14/11/2023",
    "proprietario_nome": "ELIZETE APARECIDA SILVA",
    "proprietario_fracao_ideal": "50%",
    "proprietario_registro_aquisicao": "R-1/46.511",
    "proprietario_data_registro": "17/07/1984",
    "proprietario_titulo_aquisicao": "COMPRA E VENDA",
    "ressalva_existencia": "nao"
  },
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda
- `matricula_numero` -> Identificacao do imovel
- `matricula_cartorio_*` -> Referencia do cartorio de registro
- `imovel_descricao_conforme_matricula` -> Descricao do imovel na minuta
- `proprietario_*` -> Dados do alienante
- `onus_*` -> Verificacao de gravames
- `ressalva_*` -> Alertas para minuta

### 5.2 Qualificacao das Partes
- `nome`, `cpf`, `rg` -> Identificacao do proprietario
- `estado_civil`, `profissao`, `nacionalidade` -> Qualificacao completa

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| matricula_numero | ITBI, VVR, IPTU, ESCRITURA | Identificar imovel |
| imovel_sql | ITBI, VVR, IPTU, CND_MUNICIPAL | Cadastro municipal |
| nome | RG, CNH, CERTIDAO_CASAMENTO, etc. | Identificar pessoa |
| cpf | RG, CNH, CNDT, CND_FEDERAL, etc. | Identificar pessoa |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos uteis de outras categorias que NAO vem da MATRICULA:

### Pessoa Natural
- `data_nascimento`: Obter de RG, CNH, CERTIDAO_NASCIMENTO
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- Campos de certidoes (cndt_*, certidao_uniao_*): Obter de CNDT, CND_FEDERAL

### Imovel
- `imovel_valor_venal_iptu`: Obter de IPTU
- `imovel_valor_venal_referencia`: Obter de VVR
- `imovel_cnd_iptu_*`: Obter de CND_MUNICIPAL

### Negocio
- Todos os campos de negocio: Obter de COMPROMISSO, ITBI, ESCRITURA

---

## 8. REFERENCIAS

- Mapeamento Completo: `execution/mapeamento_documento_campos.json`
- Guias de Interface: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Campos Completos: `documentacao-campos-extraiveis/campos-completos/MATRICULA_IMOVEL.md`
