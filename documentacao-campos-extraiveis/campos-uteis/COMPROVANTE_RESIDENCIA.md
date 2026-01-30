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
| nome | Nome do titular da conta | "JOAO DA SILVA" | SIM |
| cpf | CPF do titular | "123.456.789-00" | Condicional |
| domicilio_logradouro | Rua, Avenida, etc. | "RUA DAS FLORES" | SIM |
| domicilio_numero | Numero do imovel | "123" | SIM |
| domicilio_complemento | Apartamento, bloco, sala | "APTO 42 BLOCO B" | Condicional |
| domicilio_bairro | Nome do bairro | "JARDIM PAULISTA" | Condicional |
| domicilio_cidade | Nome da cidade | "SAO PAULO" | SIM |
| domicilio_estado | UF do estado | "SP" | SIM |
| domicilio_cep | CEP do endereco | "01234-567" | Condicional |

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
| nome_titular | nome | pessoa_natural |
| cpf_titular | cpf | pessoa_natural |
| logradouro | domicilio_logradouro | pessoa_natural |
| numero | domicilio_numero | pessoa_natural |
| complemento | domicilio_complemento | pessoa_natural |
| bairro | domicilio_bairro | pessoa_natural |
| cidade | domicilio_cidade | pessoa_natural |
| estado | domicilio_estado | pessoa_natural |
| cep | domicilio_cep | pessoa_natural |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA",
    "cpf": "123.456.789-00",
    "domicilio_logradouro": "RUA DAS FLORES",
    "domicilio_numero": "123",
    "domicilio_complemento": "APTO 42 BLOCO B",
    "domicilio_bairro": "JARDIM PAULISTA",
    "domicilio_cidade": "SAO PAULO",
    "domicilio_estado": "SP",
    "domicilio_cep": "01234-567"
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
"..., residente e domiciliado(a) na [domicilio_logradouro], numero [domicilio_numero],
[domicilio_complemento], [domicilio_bairro], [domicilio_cidade]/[domicilio_estado],
CEP [domicilio_cep]..."
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
| nome | RG, CNH, CPF, CERTIDAO_CASAMENTO, etc. | Identificar pessoa e vincular ao endereco |
| cpf | RG, CNH, CPF, CNDT, CND_FEDERAL, etc. | Identificador unico para correlacao |
| domicilio_* | ESCRITURA, COMPROMISSO_COMPRA_VENDA, PROCURACAO | Validar domicilio declarado |

### 6.1 Hierarquia de Fontes para Endereco de Domicilio

Para dados de domicilio pessoal, a prioridade de extracao e:

1. **COMPROVANTE_RESIDENCIA** - Fonte primaria (este documento)
2. **ESCRITURA** (anterior) - Endereco declarado em escritura publica
3. **COMPROMISSO_COMPRA_VENDA** - Endereco declarado no contrato
4. **PROCURACAO** - Endereco do outorgante

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem do Comprovante de Residencia:

- `rg`, `orgao_emissor_rg`, `estado_emissor_rg`: Obter de RG
- `cnh`, `orgao_emissor_cnh`, `estado_emissor_cnh`: Obter de CNH
- `data_nascimento`, `naturalidade`: Obter de RG, CNH, CERTIDAO_NASCIMENTO
- `filiacao_pai`, `filiacao_mae`: Obter de RG, CERTIDAO_NASCIMENTO
- `profissao`: Obter de CERTIDAO_CASAMENTO, ESCRITURA
- `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- Campos de certidoes (cndt_*, certidao_uniao_*): Obter de CNDT, CND_FEDERAL

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/COMPROVANTE_RESIDENCIA.md`
