# Campos de Dados - Dados do Imovel

**Tela:** Conferencia e Complementacao dos Imoveis
**Instrucao:** Confira todos os dados e preencha os campos faltantes.

---

## 1. MATRICULA IMOBILIARIA

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | NUMERO DA MATRICULA | 0000-000 |
| 2 | NUMERO DO REGISTRO DE IMOVEIS | 0000-000 |
| 3 | CIDADE DO REGISTRO DE IMOVEIS | 0000-000 |
| 4 | ESTADO DO REGISTRO DE IMOVEIS | 0000-000 |
| 5 | NUMERO NACIONAL DE MATRICULA | 0000-000 |

**Total de campos:** 5

---

## 2. DESCRICAO DO IMOVEL

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | DENOMINACAO | APARTAMENTO |
| 2 | AREA TOTAL EM M2 | 100M² |
| 3 | AREA PRIVATIVA EM M2 | 80M² |
| 4 | AREA CONSTRUIDA | 100M² |
| 5 | LOGRADOURO | RUAL TAL |
| 6 | NUMERO | 000 |
| 7 | COMPLEMENTO | 000 |
| 8 | BAIRRO | 000 |
| 9 | CIDADE | 000 |
| 10 | ESTADO | 000 |
| 11 | CEP | 00/00/0000 |
| 12 | DESCRICAO CONFORME A MATRICULA | APARTAMENTO RESIDENCIAL No 101, LOCALIZADO NO 10o ANDAR DO EDIFICIO PAULISTA TOWER, CONTENDO SALA, 3 DORMITORIOS (SENDO 1 SUITE), COZINHA, AREA DE SERVICO, BANHEIRO SOCIAL E 2 VAGAS DE GARAGEM COBERTAS. |

**Total de campos:** 12

---

## 3. CADASTRO IMOBILIARIO

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | CADASTRO MUNICIPAL (SQL) | 0000-000 |
| 2 | DATA DE EXPEDICAO DA CERTIDAO DE CADASTRO MUNICIPAL | 00/00/0000 |

**Total de campos:** 2

---

## 4. VALORES VENAIS

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | VALOR VENAL (IPTU) | 0000-000 |
| 2 | VALOR VENAL DE REFERENCIA (ITBI) | 0000-000 |

**Total de campos:** 2

### Acoes

| Acao | Descricao |
|------|-----------|
| ATUALIZAR VALORES VENAIS | Botao para atualizar os valores venais |

---

## 5. NEGATIVA DE IPTU

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | NUMERO DA CERTIDAO | 0000-000 |
| 2 | DATA DE EXPEDICAO | 00/00/0000 |
| 3 | CERTIDAO VALIDA? | SIM / NAO |

**Total de campos:** 3

### Acoes

| Acao | Descricao |
|------|-----------|
| ATUALIZAR CERTIDAO NEGATIVA DE IPTU | Botao para atualizar a certidao negativa de IPTU |

---

## 6. CERTIDAO DA MATRICULA

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | CERTIDAO DA MATRICULA | 0000-000 |
| 2 | DATA DE EXPEDICAO DA CERTIDAO DA MATRICULA | 00/00/0000 |
| 3 | CERTIDAO VALIDA? | SIM / NAO |

**Total de campos:** 3

---

## 7. PROPRIETARIOS

> **Nota:** Esta secao pode conter multiplos proprietarios (Proprietario 1, Proprietario 2, etc.). Cada proprietario possui os mesmos campos.

### Proprietario N

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | NOME | FULANO DE TAL |
| 2 | FRACAO IDEAL | 50% |
| 3 | REGISTRO DE AQUISICAO | R.4 |
| 4 | DATA DO REGISTRO DE AQUISICAO | 00/00/0000 |
| 5 | TITULO DE AQUISICAO | COMPRA E VENDA |

**Total de campos por proprietario:** 5

### Acoes

| Acao | Descricao |
|------|-----------|
| VER DADOS COMPLETOS | Botao que abre um modal com os dados completos do proprietario |

---

## 8. ONUS REGISTRADO(S)

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | TITULO DO ONUS | PENHORA, HIPOTECA... |
| 2 | REGISTRO DO ONUS | R.5 |
| 3 | DATA DO REGISTRO DO ONUS | 00/00/0000 |
| 4 | DESCRICAO DO ONUS CONFORME A MATRICULA | PENHORA, HIPOTECA... |

**Total de campos:** 4

### 8.1 Titular(es) do Onus

> **Nota:** Cada onus pode ter multiplos titulares.

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | NOME | FULANO DE TAL |
| 2 | FRACAO IDEAL | 50% |

**Total de campos por titular:** 2

### Acoes

| Acao | Descricao |
|------|-----------|
| VER DADOS COMPLETOS | Botao que abre um modal com os dados completos do titular do onus |

---

## 9. RESSALVAS NA CERTIFICACAO DA MATRICULA

| # | Campo | Exemplo/Formato |
|---|-------|-----------------|
| 1 | EXISTENCIA DE RESSALVA | SIM / NAO |
| 2 | DESCRICAO DA RESSALVA | R.5 |

**Total de campos:** 2

---

## ACOES DA TELA

| Acao | Descricao |
|------|-----------|
| VOLTAR | Retorna a tela anterior |
| AVANCAR | Avanca para a proxima tela |

---

## RESUMO

| Grupo | Quantidade de Campos |
|-------|---------------------|
| Matricula Imobiliaria | 5 |
| Descricao do Imovel | 12 |
| Cadastro Imobiliario | 2 |
| Valores Venais | 2 |
| Negativa de IPTU | 3 |
| Certidao da Matricula | 3 |
| Proprietarios (por proprietario) | 5 |
| Onus Registrado(s) | 4 |
| - Titular(es) do Onus (por titular) | (2) |
| Ressalvas na Certificacao da Matricula | 2 |
| **TOTAL (campos fixos)** | **33** |

> **Observacao:** O total pode variar dependendo da quantidade de proprietarios e titulares de onus cadastrados.

---

## ESTRUTURA HIERARQUICA

```
DADOS DO IMOVEL
|
+-- Matricula Imobiliaria
+-- Descricao do Imovel
+-- Cadastro Imobiliario
+-- Valores Venais
+-- Negativa de IPTU
+-- Certidao da Matricula
+-- Proprietarios [N]
|   +-- Proprietario 1
|   +-- Proprietario 2
|   +-- ...
+-- Onus Registrado(s)
|   +-- Titular(es) do Onus [N]
|       +-- Titular 1
|       +-- Titular 2
|       +-- ...
+-- Ressalvas na Certificacao da Matricula
```
