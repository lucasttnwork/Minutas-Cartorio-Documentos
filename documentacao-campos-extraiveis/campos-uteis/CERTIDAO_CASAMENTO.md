# CERTIDAO_CASAMENTO - Certidao de Casamento (Campos Uteis)

**Total de Campos Uteis**: 13 campos
**Categorias**: Pessoa Natural (12), Pessoa Juridica (0), Imovel (0), Negocio (1)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CERTIDAO_CASAMENTO e a **UNICA fonte confiavel** para:
- Estado civil atualizado
- Regime de bens
- Data do casamento
- Nome do conjuge

Esses dados sao CRITICOS para escrituras de imoveis adquiridos na constancia do casamento.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (12 campos)

Dados de cada conjuge extraidos da certidao.

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do conjuge | "JOAO DA SILVA" | SIM |
| CPF | CPF do conjuge | "123.456.789-00" | Condicional |
| RG | RG do conjuge | "12.345.678-9" | Condicional |
| ORGAO EMISSOR DO RG | Orgao emissor RG | "SSP" | Condicional |
| ESTADO EMISSOR DO RG | UF do RG | "SP" | Condicional |
| DATA DE NASCIMENTO | Data de nascimento | "10/05/1980" | Condicional |
| ESTADO CIVIL | Estado civil | "casado" | SIM |
| REGIME DE BENS | Regime de bens | "comunhao parcial de bens" | SIM |
| DATA DO CASAMENTO | Data do casamento | "20/11/2010" | SIM |
| FILIACAO PAI | Nome do pai | "ANTONIO DA SILVA" | Condicional |
| FILIACAO MAE | Nome da mae | "ROSA DA SILVA" | Condicional |
| NACIONALIDADE | Nacionalidade | "brasileiro" | Condicional |

**Notas:**
- Os dados sao extraidos para AMBOS os conjuges
- O estado_civil pode ser "casado", "divorciado", "separado" ou "viuvo" dependendo das averbacoes
- O regime de bens e FUNDAMENTAL para determinar se o conjuge precisa comparecer na escritura

### 2.2 Pessoa Juridica (0 campos)

A certidao de casamento nao alimenta dados de PJ.

### 2.3 Dados do Imovel (0 campos)

A certidao de casamento nao alimenta dados de imovel.

### 2.4 Negocio Juridico (1 campo)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| CONJUGE | Nome do conjuge do vendedor | "MARIA DA SILVA" | Se alienante casado |

**IMPORTANTE:** O nome do conjuge e extraido para que este compareca na escritura quando o alienante for casado em regime de comunhao.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_conjuge_1 / nome_conjuge_2 | NOME | pessoa_natural |
| cpf_conjuge_1 / cpf_conjuge_2 | CPF | pessoa_natural |
| (rg se presente) | RG | pessoa_natural |
| data_nascimento_conjuge_1/2 | DATA DE NASCIMENTO | pessoa_natural |
| (inferido "casado") | ESTADO CIVIL | pessoa_natural |
| regime_bens | REGIME DE BENS | pessoa_natural |
| data_casamento | DATA DO CASAMENTO | pessoa_natural |
| pai_conjuge_1/2 | FILIACAO PAI | pessoa_natural |
| mae_conjuge_1/2 | FILIACAO MAE | pessoa_natural |
| (inferido "brasileiro") | NACIONALIDADE | pessoa_natural |
| nome_conjuge_1 ou nome_conjuge_2 | CONJUGE | negocio |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "orgao_emissor_rg": "SSP",
    "estado_emissor_rg": "SP",
    "data_nascimento": "10/05/1980",
    "estado_civil": "casado",
    "regime_bens": "comunhao parcial de bens",
    "data_casamento": "20/11/2010",
    "filiacao_pai": "ANTONIO DA SILVA",
    "filiacao_mae": "ROSA DA SILVA",
    "nacionalidade": "brasileiro"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {
    "alienante_conjuge": "MARIA SANTOS DA SILVA"
  }
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao das Partes
- `nome`, `cpf`, `rg` -> Identificacao
- `estado_civil`, `regime_bens` -> Qualificacao completa
- `nacionalidade`, `filiacao_*` -> Qualificacao detalhada

### 5.2 Comparecimento do Conjuge
Se `estado_civil` = "casado" E `regime_bens` = "comunhao parcial" ou "comunhao universal":
- O conjuge DEVE comparecer na escritura de venda
- `alienante_conjuge` identifica quem deve comparecer

### 5.3 Regimes de Bens e Implicacoes

| Regime | Conjuge Comparece? |
|--------|-------------------|
| Comunhao parcial de bens | SIM |
| Comunhao universal de bens | SIM |
| Separacao total de bens | NAO (exceto se imovel comum) |
| Separacao obrigatoria de bens | NAO |

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CNDT, etc. (20 docs) | Identificar pessoa |
| cpf | RG, CNH, CNDT, etc. (17 docs) | Identificar pessoa |
| rg | RG, CNH, MATRICULA_IMOVEL (8 docs) | Identificar pessoa |
| estado_civil | MATRICULA_IMOVEL | Validar qualificacao |
| regime_bens | MATRICULA_IMOVEL | Validar necessidade de conjuge |

### 6.1 Fonte Unica
A CERTIDAO_CASAMENTO e a UNICA fonte para:
- `estado_civil` atualizado (considerando averbacoes)
- `regime_bens`
- `data_casamento`

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem da CERTIDAO_CASAMENTO:
- `cnh`, `orgao_emissor_cnh`: Obter de CNH
- `data_emissao_rg`: Obter de RG
- `profissao`: Obter de ESCRITURA, COMPROMISSO (pode estar na certidao inteiro teor)
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- Campos de certidoes (cndt_*, certidao_uniao_*): Obter de CNDT, CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CERTIDAO_CASAMENTO.md`
