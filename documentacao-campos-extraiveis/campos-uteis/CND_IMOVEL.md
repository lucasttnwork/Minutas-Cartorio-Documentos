# CND_IMOVEL - Certidao Negativa de Debitos do Imovel (Campos Uteis)

**Total de Campos Uteis**: 11 campos
**Categorias**: Pessoa Natural (0), Pessoa Juridica (0), Imovel (11), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 11 campos (este arquivo)
- Campos Completos: ~25+ campos (ver `campos-completos/CND_IMOVEL.md`)

A CND de Imovel (Certidao Negativa de Onus Reais) e fonte exclusiva para dados relacionados ao imovel, especialmente para verificacao de regularidade e situacao de gravames. Este documento foca **exclusivamente em dados do imovel**, nao alimentando campos de pessoas ou negocios.

**Funcao Principal:** Comprovar a regularidade do imovel quanto a onus e gravames, sendo documento obrigatorio para lavratura de escrituras publicas.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (0 campos)

A CND de Imovel **nao alimenta** campos de Pessoa Natural.

Os dados de proprietarios que eventualmente constam na certidao servem apenas para validacao e correlacao, nao sendo fonte primaria de dados pessoais.

---

### 2.2 Pessoa Juridica (0 campos)

A CND de Imovel **nao alimenta** campos de Pessoa Juridica.

---

### 2.3 Imovel (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| SQL | Cadastro Municipal (SQL/Contribuinte) | "039.080.0244-3" | Condicional |
| NUMERO DA MATRICULA | Numero da matricula do imovel | "46.511" | SIM |
| LOGRADOURO | Logradouro do imovel | "Rua Francisco Cruz" | SIM |
| NUMERO | Numero do imovel | "515" | SIM |
| COMPLEMENTO | Complemento (apto, bloco) | "Apto 124, Bloco B" | Condicional |
| BAIRRO | Bairro do imovel | "Vila Mariana" | SIM |
| CIDADE | Cidade do imovel | "Sao Paulo" | SIM |
| ESTADO | Estado do imovel | "SP" | SIM |
| NUMERO DA CERTIDAO | Numero/referencia da certidao | "2026/123456" | SIM |
| DATA DE EMISSAO | Data de emissao da certidao | "28/01/2026" | SIM |
| VALIDADE | Certidao valida (imovel livre) | true/false | SIM |

**Notas:**
- O endereco na CND pode vir como campo unico que precisa ser parseado
- O campo `VALIDADE` e derivado da situacao de onus (true se "LIVRE E DESEMBARACADO")
- O SQL (contribuinte_municipal) pode nao estar presente em todas as certidoes
- A matricula e o identificador principal e unico do imovel

---

### 2.4 Negocio Juridico (0 campos)

A CND de Imovel **nao alimenta** campos de Negocio Juridico.

A certidao e usada para validacao da situacao do imovel, sendo mencionada na escritura como parte das diligencias realizadas, mas nao compoe os termos do negocio.

---

## 3. MAPEAMENTO REVERSO

| Campo no Documento | Campo Util Mapeado | Categoria |
|--------------------|-------------------|-----------|
| contribuinte_municipal | SQL | imovel |
| matricula_numero | NUMERO DA MATRICULA | imovel |
| endereco_imovel (logradouro) | LOGRADOURO | imovel |
| endereco_imovel (numero) | NUMERO | imovel |
| endereco_imovel (complemento) | COMPLEMENTO | imovel |
| endereco_imovel (bairro) | BAIRRO | imovel |
| endereco_imovel (cidade) | CIDADE | imovel |
| endereco_imovel (estado) | ESTADO | imovel |
| numero_certidao | NUMERO DA CERTIDAO | imovel |
| data_emissao | DATA DE EMISSAO | imovel |
| situacao_onus == "LIVRE" | VALIDADE | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {},
  "imovel": {
    "SQL": "039.080.0244-3",
    "NUMERO DA MATRICULA": "46.511",
    "LOGRADOURO": "Rua Francisco Cruz",
    "NUMERO": "515",
    "COMPLEMENTO": "Apto 124, Bloco B",
    "BAIRRO": "Vila Mariana",
    "CIDADE": "Sao Paulo",
    "ESTADO": "SP",
    "NUMERO DA CERTIDAO": "2026/123456",
    "DATA DE EMISSAO": "28/01/2026",
    "VALIDADE": true
  },
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Comprovacao de Regularidade do Imovel (Escritura)

A CND de Imovel e documento obrigatorio para lavratura de escrituras publicas. Os campos extraidos sao usados para:

- **Identificacao do imovel na minuta**: `NUMERO DA MATRICULA`, endereco completo
- **Referencia a certidao**: `NUMERO DA CERTIDAO`, `DATA DE EMISSAO`
- **Validacao de regularidade**: `VALIDADE` confirma se imovel esta livre de onus

### 5.2 Correlacao com Matricula e SQL

- `NUMERO DA MATRICULA` -> Correlacao univoca com MATRICULA_IMOVEL
- `SQL` -> Correlacao com cadastro fiscal municipal (IPTU, VVR, CND_MUNICIPAL)

### 5.3 Mencao na Escritura

A certidao e mencionada na escritura publica da seguinte forma:
> "Apresentada Certidao de Onus Reais no [NUMERO DA CERTIDAO], expedida em [DATA DE EMISSAO], constando que o imovel encontra-se livre e desembaracado de quaisquer onus."

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

### 6.1 Campos Uteis Compartilhados

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| NUMERO DA MATRICULA | MATRICULA_IMOVEL, ITBI, ESCRITURA, PROTOCOLO_ONR, COMPROMISSO | Identificar imovel univocamente |
| SQL | IPTU, VVR, CND_MUNICIPAL, DADOS_CADASTRAIS, ITBI | Correlacao cadastro fiscal |
| LOGRADOURO | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| NUMERO | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| BAIRRO | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| CIDADE | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| ESTADO | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |

### 6.2 Correlacao Especifica

| Documento | Campo de Correlacao | Observacao |
|-----------|---------------------|------------|
| **MATRICULA_IMOVEL** | NUMERO DA MATRICULA | Deve ser identico; fonte primaria de dados do imovel |
| **IPTU** | SQL | SQL vincula certidao ao cadastro fiscal |
| **VVR** | SQL | SQL vincula ao valor venal de referencia |
| **CND_MUNICIPAL** | SQL | SQL vincula a certidao de debitos municipais |
| **ITBI** | NUMERO DA MATRICULA | Matricula identifica imovel na guia de ITBI |
| **PROTOCOLO_ONR** | NUMERO DA MATRICULA | Referencia ao protocolo de registro |

### 6.3 Hierarquia de Fontes para Dados do Imovel

1. **MATRICULA_IMOVEL** - Fonte primaria (inteiro teor)
2. **CND_IMOVEL** - Fonte de validacao de onus (este documento)
3. **DADOS_CADASTRAIS** - Fonte secundaria para endereco fiscal
4. **IPTU** - Fonte complementar
5. **VVR** - Fonte de valor venal

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de imovel que NAO vem da CND_IMOVEL:

### 7.1 Dados de Identificacao
- `imovel_cep`: Obter de MATRICULA_IMOVEL, IPTU, DADOS_CADASTRAIS

### 7.2 Dados de Caracterizacao
- `area_total`, `area_privativa`, `area_comum`: Obter de MATRICULA_IMOVEL
- `vagas_garagem`, `box_garagem`: Obter de MATRICULA_IMOVEL
- `fracao_ideal`: Obter de MATRICULA_IMOVEL

### 7.3 Dados Fiscais
- `valor_venal`: Obter de VVR
- `imovel_iptu_numero`, `imovel_iptu_ano`: Obter de IPTU

### 7.4 Dados de Registro
- `comarca`, `cartorio_registro`: Obter de MATRICULA_IMOVEL
- `livro`, `folha`: Obter de MATRICULA_IMOVEL

### 7.5 Outras Certidoes
- `imovel_cnd_municipal_*`: Obter de CND_MUNICIPAL
- `imovel_cnd_condominio_*`: Obter de CND_CONDOMINIO
- `imovel_vvr_*`: Obter de VVR

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Campos Completos: `campos-completos/CND_IMOVEL.md`
- Documentacao MATRICULA_IMOVEL: `campos-completos/MATRICULA_IMOVEL.md`
