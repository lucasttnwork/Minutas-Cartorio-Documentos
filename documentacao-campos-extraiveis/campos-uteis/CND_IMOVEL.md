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
| imovel_sql | Cadastro Municipal (SQL/Contribuinte) | "039.080.0244-3" | Condicional |
| matricula_numero | Numero da matricula do imovel | "46.511" | SIM |
| imovel_logradouro | Logradouro do imovel | "Rua Francisco Cruz" | SIM |
| imovel_numero | Numero do imovel | "515" | SIM |
| imovel_complemento | Complemento (apto, bloco) | "Apto 124, Bloco B" | Condicional |
| imovel_bairro | Bairro do imovel | "Vila Mariana" | SIM |
| imovel_cidade | Cidade do imovel | "Sao Paulo" | SIM |
| imovel_estado | Estado do imovel | "SP" | SIM |
| imovel_cnd_iptu_numero | Numero/referencia da certidao | "2026/123456" | SIM |
| imovel_cnd_iptu_data | Data de emissao da certidao | "28/01/2026" | SIM |
| imovel_cnd_iptu_valida | Certidao valida (imovel livre) | true/false | SIM |

**Notas:**
- O endereco na CND pode vir como campo unico que precisa ser parseado
- O campo `imovel_cnd_iptu_valida` e derivado da situacao de onus (true se "LIVRE E DESEMBARACADO")
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
| contribuinte_municipal | imovel_sql | imovel |
| matricula_numero | matricula_numero | imovel |
| endereco_imovel (logradouro) | imovel_logradouro | imovel |
| endereco_imovel (numero) | imovel_numero | imovel |
| endereco_imovel (complemento) | imovel_complemento | imovel |
| endereco_imovel (bairro) | imovel_bairro | imovel |
| endereco_imovel (cidade) | imovel_cidade | imovel |
| endereco_imovel (estado) | imovel_estado | imovel |
| numero_certidao | imovel_cnd_iptu_numero | imovel |
| data_emissao | imovel_cnd_iptu_data | imovel |
| situacao_onus == "LIVRE" | imovel_cnd_iptu_valida | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {},
  "imovel": {
    "imovel_sql": "039.080.0244-3",
    "matricula_numero": "46.511",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_complemento": "Apto 124, Bloco B",
    "imovel_bairro": "Vila Mariana",
    "imovel_cidade": "Sao Paulo",
    "imovel_estado": "SP",
    "imovel_cnd_iptu_numero": "2026/123456",
    "imovel_cnd_iptu_data": "28/01/2026",
    "imovel_cnd_iptu_valida": true
  },
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Comprovacao de Regularidade do Imovel (Escritura)

A CND de Imovel e documento obrigatorio para lavratura de escrituras publicas. Os campos extraidos sao usados para:

- **Identificacao do imovel na minuta**: `matricula_numero`, endereco completo
- **Referencia a certidao**: `imovel_cnd_iptu_numero`, `imovel_cnd_iptu_data`
- **Validacao de regularidade**: `imovel_cnd_iptu_valida` confirma se imovel esta livre de onus

### 5.2 Correlacao com Matricula e SQL

- `matricula_numero` -> Correlacao univoca com MATRICULA_IMOVEL
- `imovel_sql` -> Correlacao com cadastro fiscal municipal (IPTU, VVR, CND_MUNICIPAL)

### 5.3 Mencao na Escritura

A certidao e mencionada na escritura publica da seguinte forma:
> "Apresentada Certidao de Onus Reais no [imovel_cnd_iptu_numero], expedida em [imovel_cnd_iptu_data], constando que o imovel encontra-se livre e desembaracado de quaisquer onus."

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

### 6.1 Campos Uteis Compartilhados

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| matricula_numero | MATRICULA_IMOVEL, ITBI, ESCRITURA, PROTOCOLO_ONR, COMPROMISSO | Identificar imovel univocamente |
| imovel_sql | IPTU, VVR, CND_MUNICIPAL, DADOS_CADASTRAIS, ITBI | Correlacao cadastro fiscal |
| imovel_logradouro | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| imovel_numero | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| imovel_bairro | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| imovel_cidade | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |
| imovel_estado | MATRICULA_IMOVEL, IPTU, VVR, DADOS_CADASTRAIS | Validar endereco |

### 6.2 Correlacao Especifica

| Documento | Campo de Correlacao | Observacao |
|-----------|---------------------|------------|
| **MATRICULA_IMOVEL** | matricula_numero | Deve ser identico; fonte primaria de dados do imovel |
| **IPTU** | imovel_sql | SQL vincula certidao ao cadastro fiscal |
| **VVR** | imovel_sql | SQL vincula ao valor venal de referencia |
| **CND_MUNICIPAL** | imovel_sql | SQL vincula a certidao de debitos municipais |
| **ITBI** | matricula_numero | Matricula identifica imovel na guia de ITBI |
| **PROTOCOLO_ONR** | matricula_numero | Referencia ao protocolo de registro |

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
