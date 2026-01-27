# Campos de Dados - Negocio Juridico

**Tela:** Negocio Juridico
**Descricao:** Configuracao dos dados do negocio juridico de compra e venda.

---

## 1. VALOR

| #   | Campo                    | Exemplo/Formato |
| --- | ------------------------ | --------------- |
| 1   | VALOR DA MATRICULA       | 0000-000        |
| 2   | FRACAO IDEAL ALIENADA    | 100%            |
| 3   | VALOR TOTAL DA ALIENACAO | R$ 10.000,00    |

**Total de campos:** 3

---

## 2. ALIENANTES

> **Nota:** Esta secao pode conter multiplos alienantes. Cada alienante pode ser Pessoa Natural ou Pessoa Juridica.

### 2.1 Alienante - Pessoa Natural

| #   | Campo                       | Exemplo/Formato                |
| --- | --------------------------- | ------------------------------ |
| 1   | NOME                        | FULANO DE TAL                  |
| 2   | FRACAO IDEAL                | 50%                            |
| 3   | VALOR DA ALIENACAO          | R$ 10.000,00                   |
| 4   | CONJUGE                     | -                              |
| 5   | COMPARECE NA ESCRITURA      | SIM / NAO                      |
| 6   | QUALIDADE DO COMPARECIMENTO | AUTOCONTRATANTE / SO ALIENANTE |

**Total de campos (Pessoa Natural):** 6

### 2.2 Alienante - Pessoa Juridica

| #   | Campo              | Exemplo/Formato |
| --- | ------------------ | --------------- |
| 1   | DENOMINACAO        | EMPRESA LTDA    |
| 2   | FRACAO IDEAL       | 50%             |
| 3   | VALOR DA ALIENACAO | R$ 10.000,00    |

**Total de campos (Pessoa Juridica):** 3

### Acoes

| Acao                | Descricao                                                   |
| ------------------- | ----------------------------------------------------------- |
| VER DADOS COMPLETOS | Botao que abre um modal com os dados completos do alienante |

---

## 3. ADQUIRENTES

> **Nota:** Esta secao pode conter multiplos adquirentes. Cada adquirente pode ser Pessoa Natural ou Pessoa Juridica.

### 3.1 Adquirente - Pessoa Natural

| #   | Campo              | Exemplo/Formato |
| --- | ------------------ | --------------- |
| 1   | NOME               | FULANO DE TAL   |
| 2   | FRACAO IDEAL       | 50%             |
| 3   | VALOR DA AQUISICAO | R$ 10.000,00    |

**Total de campos (Pessoa Natural):** 3

### 3.2 Adquirente - Pessoa Juridica

| #   | Campo              | Exemplo/Formato |
| --- | ------------------ | --------------- |
| 1   | DENOMINACAO        | EMPRESA LTDA    |
| 2   | FRACAO IDEAL       | 50%             |
| 3   | VALOR DA AQUISICAO | R$ 10.000,00    |

**Total de campos (Pessoa Juridica):** 3

### Acoes

| Acao                | Descricao                                                    |
| ------------------- | ------------------------------------------------------------ |
| VER DADOS COMPLETOS | Botao que abre um modal com os dados completos do adquirente |

---

## 4. FORMA DE PAGAMENTO

| #   | Campo             | Exemplo/Formato        |
| --- | ----------------- | ---------------------- |
| 1   | TIPO DE PAGAMENTO | A VISTA                |
| 2   | MODO DE PAGAMENTO | TRANSFERENCIA BANCARIA |
| 3   | DATA DO PAGAMENTO | 00/00/0000             |

**Total de campos:** 3

### 4.1 Conta Bancaria de Origem do Pagamento

| #   | Campo                | Exemplo/Formato |
| --- | -------------------- | --------------- |
| 1   | BANCO DO PAGAMENTO   | BANCO           |
| 2   | AGENCIA DO PAGAMENTO | AGENCIA         |
| 3   | CONTA DO PAGAMENTO   | CONTA           |

**Total de campos:** 3

### 4.2 Conta Bancaria de Destino do Pagamento

| #   | Campo              | Exemplo/Formato |
| --- | ------------------ | --------------- |
| 1   | BANCO DE DESTINO   | BANCO           |
| 2   | AGENCIA DE DESTINO | AGENCIA         |
| 3   | CONTA DE DESTINO   | CONTA           |

**Total de campos:** 3

**Subtotal Forma de Pagamento:** 9 campos

---

## 5. TERMOS ESPECIAIS DA ESCRITURA

| #   | Campo                                                                 | Tipo                 | Exemplo/Formato                                                                                                                                         |
| --- | --------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TERMOS CONSTANTES NA PROMESSA DE COMPRA E VENDA                       | Campo de texto       | TERMO 1                                                                                                                                                 |
| 2   | INSIRA TERMOS ESPECIAIS (CONSTARAO NA MINUTA CONFORME DIGITADO)       | Campo de texto longo | CONDICAO RESOLUTIVA...                                                                                                                                  |
| 3   | EXPLIQUE O QUE VOCE QUER QUE CONSTE NA MINUTA OU DE INSTRUCOES EXTRAS | Campo de texto longo | (Sugestoes a seguinte forma: coloque as sugestoes claras / as constatarmos atraves se houver de variedades e notas buscando direitos da instrumentacao) |

**Total de campos:** 3

---

## 6. DECLARACOES

### 6.1 Declaracoes do(s) Alienante(s)

| #   | Declaracao                                                                                           | Tipo     |
| --- | ---------------------------------------------------------------------------------------------------- | -------- |
| 1   | INEXISTENCIA DE ACOES REAIS E PESSOAIS REIPERSECUTORIAS E DE OUTROS ONUS REAIS SOBRE O(S) IMOVEL(IS) | Checkbox |
| 2   | INEXISTENCIA DE DEBITOS CONDOMINIAIS                                                                 | Checkbox |
| 3   | INEXISTENCIA DE DEBITOS DE IPTU                                                                      | Checkbox |
| 4   | INEXISTENCIA DE DEBITOS AMBIENTAIS                                                                   | Checkbox |
| 5   | NAO VINCULACAO AO INSS NA QUALIDADE DE EMPREGADOR OU PRODUTOR RURAL                                  | Checkbox |
| 6   | NAO E PESSOA EXPOSTA POLITICAMENTE - PEP                                                             | Checkbox |

**Total de declaracoes:** 6

### 6.2 Dispensas

| #   | Dispensa                                                     | Tipo     |
| --- | ------------------------------------------------------------ | -------- |
| 1   | DISPENSA DE CERTIDOES DE ACOES DE FEITOS AJUIZADOS           | Checkbox |
| 2   | DISPENSA DE CERTIDOES NEGATIVAS DE IPTU                      | Checkbox |
| 3   | DISPENSA DE CERTIDAO DA UNIAO                                | Checkbox |
| 4   | DISPENSA DE DECLARACAO DE QUITACAO CONDOMINIAL PELO SINDICO  | Checkbox |
| 5   | DISPENSA DE CERTIDAO NEGATIVA DE DEBITOS TRABALHISTAS (CNDT) | Checkbox |
| 6   | NAO E PESSOA EXPOSTA POLITICAMENTE - PEP                     | Checkbox |

**Total de dispensas:** 6

**Subtotal Declaracoes:** 12 checkboxes

---

## 7. INDISPONIBILIDADE DE BENS

### Acoes

| Acao              | Descricao                                                   |
| ----------------- | ----------------------------------------------------------- |
| REALIZAR CONSULTA | Botao para executar a consulta de indisponibilidade de bens |

### Resultado

| #   | Campo  | Exemplo/Formato     |
| --- | ------ | ------------------- |
| 1   | STATUS | NEGATIVO / POSITIVO |
| 2   | NOME   | NOME                |
| 3   | HASH   | HASH                |

**Total de campos por resultado:** 3

> **Nota:** A lista de resultados pode conter multiplos registros. O status e indicado por cor:
>
> - Verde = NEGATIVO (sem indisponibilidade)
> - Vermelho = POSITIVO (com indisponibilidade)

---

## 8. IMPOSTO DE TRANSMISSAO

| #   | Campo                  | Exemplo/Formato |
| --- | ---------------------- | --------------- |
| 1   | NUMERO DA GUIA DE ITBI | BANCO           |
| 2   | BASE DE CALCULO        | BANCO           |
| 3   | VALOR DA GUIA          | BANCO           |

**Total de campos:** 3

---

## ACOES DA TELA

| Acao         | Descricao                                              |
| ------------ | ------------------------------------------------------ |
| GERAR MINUTA | Botao principal para gerar o documento final da minuta |
| VOLTAR       | Retorna a tela anterior                                |
| AVANCAR      | Avanca para a proxima tela                             |

---

## RESUMO

| Grupo                            | Quantidade de Campos |
| -------------------------------- | -------------------- |
| Valor                            | 3                    |
| Alienantes (Pessoa Natural)      | 6 por alienante      |
| Alienantes (Pessoa Juridica)     | 3 por alienante      |
| Adquirentes (Pessoa Natural)     | 3 por adquirente     |
| Adquirentes (Pessoa Juridica)    | 3 por adquirente     |
| Forma de Pagamento               | 9                    |
| - Dados Gerais                   | (3)                  |
| - Conta de Origem                | (3)                  |
| - Conta de Destino               | (3)                  |
| Termos Especiais da Escritura    | 3                    |
| Declaracoes                      | 12 checkboxes        |
| - Declaracoes do(s) Alienante(s) | (6)                  |
| - Dispensas                      | (6)                  |
| Indisponibilidade de Bens        | 3 por resultado      |
| Imposto de Transmissao           | 3                    |
| **TOTAL (campos fixos)**         | **33**               |

> **Observacao:** O total pode variar dependendo da quantidade de alienantes, adquirentes e resultados de consulta.

---

## ESTRUTURA HIERARQUICA

```
NEGOCIO JURIDICO
|
+-- Valor
+-- Alienantes [N]
|   +-- Alienante 1 (Pessoa Natural ou Juridica)
|   +-- Alienante 2 (Pessoa Natural ou Juridica)
|   +-- ...
+-- Adquirentes [N]
|   +-- Adquirente 1 (Pessoa Natural ou Juridica)
|   +-- Adquirente 2 (Pessoa Natural ou Juridica)
|   +-- ...
+-- Forma de Pagamento
|   +-- Dados Gerais
|   +-- Conta Bancaria de Origem
|   +-- Conta Bancaria de Destino
+-- Termos Especiais da Escritura
+-- Declaracoes
|   +-- Declaracoes do(s) Alienante(s)
|   +-- Dispensas
+-- Indisponibilidade de Bens
|   +-- Resultado [N]
+-- Imposto de Transmissao
```
