# CND_CONDOMINIO - Declaracao de Quitacao Condominial (Campos Uteis)

**Total de Campos Uteis**: 2 campos
**Categorias**: Pessoa Natural (1), Pessoa Juridica (0), Imovel (1), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 2 campos (este arquivo)
- Campos Completos: ~12 campos (ver `campos-completos/CND_CONDOMINIO.md`)

A CND de Condominio possui uma das **menores coberturas de campos uteis** do sistema. Isso reflete sua natureza: o documento serve principalmente para **validacao de regularidade condominial**, nao como fonte primaria de dados para composicao de minutas.

**Uso Principal:** Comprovar quitacao de taxas condominiais antes da lavratura de escritura publica de compra e venda de unidade em condominio, conforme exigido pela Lei 4.591/64 e Codigo Civil Art. 1.345.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (1 campo)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome do proprietario | "JOAO DA SILVA" | NAO (validacao apenas) |

**Notas:**
- O nome do proprietario e extraido **apenas para validacao cruzada** com o alienante da transacao
- NAO e usado como fonte primaria de dados pessoais
- A fonte primaria para dados da pessoa deve ser RG, CNH ou outro documento de identificacao

---

### 2.2 Pessoa Juridica (0 campos)

A CND de Condominio **nao alimenta** campos de Pessoa Juridica.

O CNPJ do condominio ou administradora presente no documento nao e mapeado porque sao entidades terceiras, nao partes da transacao imobiliaria.

---

### 2.3 Imovel (1 campo)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| imovel_complemento | Identificacao da unidade (apto, bloco) | "APARTAMENTO 124, BLOCO B" | NAO (validacao apenas) |

**Notas:**
- A unidade e mapeada para o complemento do endereco do imovel
- Utilizada para validacao cruzada com IPTU e MATRICULA_IMOVEL
- O endereco completo do imovel deve vir de outras fontes (IPTU, MATRICULA)

---

### 2.4 Negocio Juridico (0 campos)

A CND de Condominio **nao alimenta** campos de Negocio Juridico.

O documento atesta regularidade, nao termos contratuais.

---

## 3. MAPEAMENTO REVERSO

| Campo no Documento | Campo Util Mapeado | Categoria |
|-------------------|-------------------|-----------|
| proprietario | nome | pessoa_natural |
| unidade | imovel_complemento | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA"
  },
  "pessoa_juridica": {},
  "imovel": {
    "imovel_complemento": "APARTAMENTO 124, BLOCO B"
  },
  "negocio": {}
}
```

**Nota:** Os demais campos do documento (nome_condominio, situacao, data_emissao, sindico, etc.) sao catalogados mas NAO alimentam o modelo de dados para minutas.

---

## 5. USO EM MINUTAS

### 5.1 Validacao Pre-Escritura

A CND de Condominio NAO contribui diretamente para o texto da minuta. Seu uso e para **validacao**:

- **Verificar quitacao**: Status deve ser "QUITADO", "EM DIA" ou "NADA CONSTA"
- **Validar proprietario**: Nome deve corresponder ao alienante/vendedor
- **Validar unidade**: Apto/bloco deve corresponder ao imovel da transacao

### 5.2 Campos de Referencia em Clausulas

Embora nao componha diretamente o texto, a CND pode ser mencionada:

> "...comprovada a quitacao das cotas condominiais ate a presente data, conforme declaracao expedida pelo condominio..."

### 5.3 Consequencias da Validacao

| Status Encontrado | Consequencia |
|-------------------|--------------|
| QUITADO / EM DIA / NADA CONSTA | Transacao pode prosseguir |
| COM DEBITOS | Transacao bloqueada ate quitacao |
| Proprietario divergente | Alertar usuario para verificacao |
| Unidade divergente | Alertar usuario para verificacao |

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_CASAMENTO, etc. (20+ docs) | Validar alienante |
| imovel_complemento | IPTU, MATRICULA_IMOVEL, ESCRITURA | Validar unidade |

### 6.1 Hierarquia de Fontes

Para os 2 campos mapeados, a CND de Condominio **nao e fonte primaria**:

| Campo | Fonte Primaria | CND Condominio |
|-------|----------------|----------------|
| nome | RG, CNH | Validacao apenas |
| imovel_complemento | MATRICULA_IMOVEL, IPTU | Validacao apenas |

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

A CND de Condominio NAO fornece os seguintes campos uteis (obter de outras fontes):

### Pessoa Natural (46 campos nao cobertos)
- `cpf`, `rg`, `orgao_emissor_rg`, `estado_emissor_rg`: Obter de RG, CNH
- `data_nascimento`, `naturalidade`: Obter de RG, CERTIDAO_NASCIMENTO
- `estado_civil`, `regime_bens`: Obter de CERTIDAO_CASAMENTO
- `profissao`: Obter de CERTIDAO_CASAMENTO, ESCRITURA
- `domicilio_*`: Obter de COMPROVANTE_RESIDENCIA
- `filiacao_*`: Obter de RG, CERTIDAO_NASCIMENTO
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA

### Pessoa Juridica (todos os campos)
- `razao_social`, `cnpj`, `endereco_sede`, etc.: Obter de CONTRATO_SOCIAL

### Imovel (maioria dos campos)
- `imovel_endereco`, `imovel_cidade`, `imovel_estado`: Obter de IPTU, MATRICULA
- `imovel_matricula`, `imovel_registro`: Obter de MATRICULA_IMOVEL
- `imovel_area_total`, `imovel_area_construida`: Obter de MATRICULA_IMOVEL
- `inscricao_imobiliaria`: Obter de IPTU

### Negocio (todos os campos)
- `valor_transacao`, `forma_pagamento`, etc.: Obter de COMPROMISSO_COMPRA_VENDA

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia Imovel: `Guia-de-campos-e-variaveis/campos-dados-imovel.md`
- Guia Pessoa Natural: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CND_CONDOMINIO.md`
- Base Legal: Lei 4.591/64, Codigo Civil Art. 1.345
