# RG - Carteira de Identidade (Campos Uteis)

**Total de Campos Uteis**: 10 campos
**Categorias**: Pessoa Natural (10), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 10 campos (este arquivo)
- Campos Completos: ~14 campos (ver `campos-completos/RG.md`)

O RG e fonte primaria para identificacao pessoal, alimentando 10 dos 47 campos de pessoa natural.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (10 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome completo | "MARINA AYUB" | SIM |
| CPF | CPF (modelos novos) | "368.366.718-43" | Condicional |
| RG | Numero do RG | "35.540.462-X" | SIM |
| ORGAO EMISSOR DO RG | Orgao emissor | "SSP" | SIM |
| ESTADO EMISSOR DO RG | UF do emissor | "SP" | SIM |
| DATA DE EMISSAO DO RG | Data de emissao | "12/06/2017" | Condicional |
| DATA DE NASCIMENTO | Data de nascimento | "06/09/1991" | SIM |
| NATURALIDADE | Local de nascimento | "S.PAULO - SP" | Condicional |
| FILIACAO PAI | Nome do pai | "MUNIR AKAR AYUB" | Condicional |
| FILIACAO MAE | Nome da mae | "ELOISA BASILE SIQUEIRA AYUB" | Condicional |

**Notas:**
- O CPF pode nao estar presente em RGs antigos
- A data de emissao pode nao ser extraivel em alguns formatos
- Filiacao pode estar incompleta em documentos danificados

---

### 2.2-2.4 Outras Categorias

O RG nao alimenta campos de Pessoa Juridica, Imovel ou Negocio Juridico.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_completo | nome | pessoa_natural |
| cpf | cpf | pessoa_natural |
| numero_rg | rg | pessoa_natural |
| orgao_expedidor | orgao_emissor_rg | pessoa_natural |
| uf_expedidor | estado_emissor_rg | pessoa_natural |
| data_expedicao | data_emissao_rg | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |
| naturalidade | naturalidade | pessoa_natural |
| nome_pai | filiacao_pai | pessoa_natural |
| nome_mae | filiacao_mae | pessoa_natural |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "NOME": "MARINA AYUB",
    "CPF": "368.366.718-43",
    "RG": "35.540.462-X",
    "ORGAO EMISSOR DO RG": "SSP",
    "ESTADO EMISSOR DO RG": "SP",
    "DATA DE EMISSAO DO RG": "12/06/2017",
    "DATA DE NASCIMENTO": "06/09/1991",
    "NATURALIDADE": "S.PAULO - SP",
    "FILIACAO PAI": "MUNIR AKAR AYUB",
    "FILIACAO MAE": "ELOISA BASILE SIQUEIRA AYUB"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao das Partes (Escritura)
- `NOME` -> Nome completo na qualificacao
- `CPF` -> CPF na qualificacao
- `RG`, `ORGAO EMISSOR DO RG`, `ESTADO EMISSOR DO RG` -> RG formatado (ex: "35.540.462-X SSP-SP")
- `DATA DE NASCIMENTO` -> Pode ser usada em qualificacoes completas

### 5.2 Verificacao de Identidade
- `FILIACAO PAI`, `FILIACAO MAE` -> Conferencia com certidao de nascimento
- `NATURALIDADE` -> Conferencia com outros documentos

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| NOME | CNH, CERTIDAO_CASAMENTO, CNDT, etc. (20 docs) | Identificar pessoa |
| CPF | CNH, CERTIDAO_CASAMENTO, CNDT, etc. (17 docs) | Identificar pessoa |
| RG | CNH, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL (8 docs) | Identificar pessoa |
| DATA DE NASCIMENTO | CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO (7 docs) | Validar idade |
| FILIACAO PAI / FILIACAO MAE | CNH, CERTIDAO_NASCIMENTO | Confirmar identidade |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem do RG:
- `profissao`: Obter de CERTIDAO_CASAMENTO, ESCRITURA, COMPROMISSO
- `estado_civil`: Obter de CERTIDAO_CASAMENTO
- `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- `cnh`, `orgao_emissor_cnh`: Obter de CNH
- Campos de certidoes (cndt_*, certidao_uniao_*): Obter de CNDT, CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/RG.md`
