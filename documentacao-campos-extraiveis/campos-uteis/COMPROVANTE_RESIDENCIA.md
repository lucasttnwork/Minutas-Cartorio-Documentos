# COMPROVANTE_RESIDENCIA - Comprovante de Residencia (Campos Uteis)

**Total de Campos Uteis**: 9 campos
**Categorias**: Pessoa Natural (9), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 9 campos (este arquivo)
- Campos Completos: ~16 campos (ver `campos-completos/COMPROVANTE_RESIDENCIA.md`)

O Comprovante de Residencia e a **fonte primaria** para dados de domicilio em minutas cartoriais, alimentando 9 dos 47 campos de pessoa natural. E o unico documento que fornece endereco completo de residencia validado para qualificacao das partes.

**Importante**: O documento possui validade tipica de **90 dias** a partir da data de emissao.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (9 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do titular da conta | "JOAO DA SILVA" | SIM |
| CPF | CPF do titular | "123.456.789-00" | Condicional |
| LOGRADOURO | Rua, Avenida, etc. | "RUA DAS FLORES" | SIM |
| NUMERO | Numero do imovel | "123" | SIM |
| COMPLEMENTO | Apartamento, bloco, sala | "APTO 42 BLOCO B" | Condicional |
| BAIRRO | Nome do bairro | "JARDIM PAULISTA" | Condicional |
| CIDADE | Nome da cidade | "SAO PAULO" | SIM |
| ESTADO | UF do estado | "SP" | SIM |
| CEP | CEP do endereco | "01234-567" | Condicional |

**Notas:**
- O CPF pode nao estar presente em ~40% das faturas
- O complemento aparece apenas quando aplicavel (imoveis com apartamento, sala, etc.)
- O bairro esta presente em ~90% das faturas
- O CEP esta presente em ~95% das faturas

---

### 2.2-2.4 Outras Categorias

O Comprovante de Residencia nao alimenta campos de Pessoa Juridica, Imovel ou Negocio Juridico.

**Nota**: Embora o documento contenha endereco, este comprova o domicilio da pessoa, nao as caracteristicas do imovel objeto da transacao. O endereco de sede de empresas vem de documentos como Contrato Social ou CNPJ.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_titular | NOME | pessoa_natural |
| cpf_titular | CPF | pessoa_natural |
| logradouro | LOGRADOURO | pessoa_natural |
| numero | NUMERO | pessoa_natural |
| complemento | COMPLEMENTO | pessoa_natural |
| bairro | BAIRRO | pessoa_natural |
| cidade | CIDADE | pessoa_natural |
| estado | ESTADO | pessoa_natural |
| cep | CEP | pessoa_natural |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "NOME": "JOAO DA SILVA",
    "CPF": "123.456.789-00",
    "LOGRADOURO": "RUA DAS FLORES",
    "NUMERO": "123",
    "COMPLEMENTO": "APTO 42 BLOCO B",
    "BAIRRO": "JARDIM PAULISTA",
    "CIDADE": "SAO PAULO",
    "ESTADO": "SP",
    "CEP": "01234-567"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao das Partes - Endereco de Domicilio

O endereco completo e usado na qualificacao das partes em escrituras publicas:

```
"..., residente e domiciliado(a) na [LOGRADOURO], numero [NUMERO],
[COMPLEMENTO], [BAIRRO], [CIDADE]/[ESTADO],
CEP [CEP]..."
```

**Exemplo Preenchido:**
```
"..., residente e domiciliado(a) na RUA DAS FLORES, numero 123, APTO 42 BLOCO B,
JARDIM PAULISTA, SAO PAULO/SP, CEP 01234-567..."
```

### 5.2 Correlacao de Identidade

- `nome` -> Conferencia com RG/CNH para vincular endereco a pessoa
- `cpf` -> Identificador unico para validacao cruzada (quando presente)

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| NOME | RG, CNH, CPF, CERTIDAO_CASAMENTO, etc. | Identificar pessoa e vincular ao endereco |
| CPF | RG, CNH, CPF, CNDT, CND_FEDERAL, etc. | Identificador unico para correlacao |
| LOGRADOURO, NUMERO, COMPLEMENTO, BAIRRO, CIDADE, ESTADO, CEP | ESCRITURA, COMPROMISSO_COMPRA_VENDA, PROCURACAO | Validar domicilio declarado |

### 6.1 Hierarquia de Fontes para Endereco de Domicilio

Para dados de domicilio pessoal, a prioridade de extracao e:

1. **COMPROVANTE_RESIDENCIA** - Fonte primaria (este documento)
2. **ESCRITURA** (anterior) - Endereco declarado em escritura publica
3. **COMPROMISSO_COMPRA_VENDA** - Endereco declarado no contrato
4. **PROCURACAO** - Endereco do outorgante

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem do Comprovante de Residencia:

- `RG`, `ORGAO EMISSOR RG`, `ESTADO EMISSOR RG`: Obter de RG
- `CNH`, `ORGAO EMISSOR CNH`, `ESTADO EMISSOR CNH`: Obter de CNH
- `DATA DE NASCIMENTO`, `NATURALIDADE`: Obter de RG, CNH, CERTIDAO_NASCIMENTO
- `FILIACAO PAI`, `FILIACAO MAE`: Obter de RG, CERTIDAO_NASCIMENTO
- `PROFISSAO`: Obter de CERTIDAO_CASAMENTO, ESCRITURA
- `ESTADO CIVIL`, `REGIME BENS`: Obter de CERTIDAO_CASAMENTO
- `EMAIL`, `TELEFONE`: Obter de COMPROMISSO_COMPRA_VENDA
- Campos de certidoes (cndt_*, certidao_uniao_*): Obter de CNDT, CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/COMPROVANTE_RESIDENCIA.md`
