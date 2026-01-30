# CPF - Cadastro de Pessoa Fisica (Campos Uteis)

**Total de Campos Uteis**: 3 campos
**Categorias**: Pessoa Natural (3), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 3 campos (este arquivo)
- Campos Completos: ~7 campos principais + metadados (ver `campos-completos/CPF.md`)

O CPF e um documento de **baixa complexidade** de extracao, porem de **alta importancia** como identificador unico. Dos 47 campos de pessoa natural no sistema, o CPF alimenta apenas 3, mas o campo `cpf` e o **identificador primario** para correlacao entre todos os documentos de pessoa fisica.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (3 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome completo do titular | "JOSE DA SILVA" | SIM |
| cpf | Numero do CPF | "123.456.789-00" | SIM |
| data_nascimento | Data de nascimento | "15/03/1980" | Condicional |

**Notas:**
- O campo `nome` e extraido como `nome_completo` no schema original
- O campo `cpf` e extraido como `numero_cpf` no schema original
- A `data_nascimento` pode nao estar presente em Comprovantes de Situacao Cadastral

---

### 2.2-2.4 Outras Categorias

O CPF **nao alimenta** campos de:
- **Pessoa Juridica**: Nenhum campo
- **Imovel**: Nenhum campo
- **Negocio Juridico**: Nenhum campo

**Observacao**: Embora o CPF nao alimente diretamente campos de PJ, o numero CPF de uma pessoa fisica pode ser usado para identificar socios, administradores e procuradores em documentos empresariais.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_completo | nome | pessoa_natural |
| numero_cpf | cpf | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |

**Campos do schema NAO mapeados:**
- `situacao_cadastral` - Usado apenas para alertas de verificacao
- `data_inscricao` - Dado historico, nao relevante para minutas
- `digito_verificador` - Ja incluso no numero_cpf
- `data_consulta`, `hora_consulta` - Metadados do comprovante
- `codigo_controle` - Usado para validacao de autenticidade

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOSE DA SILVA",
    "cpf": "123.456.789-00",
    "data_nascimento": "15/03/1980"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Qualificacao das Partes (Escritura)

Os campos do CPF sao usados para compor a qualificacao basica das partes:

- `nome` -> Nome completo na qualificacao
- `cpf` -> CPF na qualificacao (formato: "inscrito no CPF sob o n. XXX.XXX.XXX-XX")
- `data_nascimento` -> Pode ser usada em qualificacoes completas

### 5.2 Exemplo de Uso em Minuta

```
JOSE DA SILVA, brasileiro, inscrito no CPF sob o n. 123.456.789-00,
nascido em 15 de marco de 1980...
```

### 5.3 Correlacao como Chave Primaria

O CPF e usado como **identificador unico** para:
- Agrupar documentos de uma mesma pessoa
- Validar consistencia entre documentos
- Correlacionar informacoes de diferentes fontes

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, MATRICULA_IMOVEL, ESCRITURA, etc. (20 docs) | Identificar pessoa |
| cpf | RG, CNH, CERTIDAO_CASAMENTO, CNDT, CND_FEDERAL, MATRICULA_IMOVEL, ITBI, IPTU, etc. (17 docs) | Identificador unico |
| data_nascimento | RG, CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, CERTIDAO_OBITO, COMPROMISSO, CONTRATO_SOCIAL (7 docs) | Validar identidade |

### 6.1 Hierarquia de Fontes para os Campos

Para obter os campos `nome`, `cpf` e `data_nascimento`, a prioridade de extracao e:

1. **RG (modelo novo)** - CPF integrado, todos os campos presentes
2. **CNH** - Todos os 3 campos presentes
3. **CPF (documento dedicado)** - Fonte primaria quando disponivel
4. **CERTIDAO_NASCIMENTO** - Nome, CPF e data de nascimento
5. **CERTIDAO_CASAMENTO** - Nome, CPF e data de nascimento

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que **NAO vem do CPF**:

### Identificacao Documental
- `rg`, `orgao_emissor_rg`, `estado_emissor_rg`, `data_emissao_rg`: Obter de RG, CNH
- `cnh`, `orgao_emissor_cnh`: Obter de CNH

### Estado Civil e Familia
- `estado_civil`, `regime_bens`, `data_casamento`: Obter de CERTIDAO_CASAMENTO
- `filiacao_pai`, `filiacao_mae`: Obter de RG, CNH, CERTIDAO_NASCIMENTO
- `naturalidade`: Obter de RG, CERTIDAO_NASCIMENTO

### Domicilio
- `domicilio_logradouro`, `domicilio_numero`, `domicilio_complemento`
- `domicilio_bairro`, `domicilio_cidade`, `domicilio_estado`, `domicilio_cep`
- **Fonte**: COMPROVANTE_RESIDENCIA, ESCRITURA, PROCURACAO

### Profissao e Contato
- `nacionalidade`, `profissao`: Obter de MATRICULA_IMOVEL, ESCRITURA, PROCURACAO
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA

### Certidoes
- `cndt_*`: Obter de CNDT
- `certidao_uniao_*`: Obter de CND_FEDERAL
- `certidao_nascimento_*`: Obter de CERTIDAO_NASCIMENTO

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CPF.md`
