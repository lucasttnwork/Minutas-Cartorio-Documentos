# VVR - Valor Venal de Referencia (Campos Uteis)

**Total de Campos Uteis**: 6 campos
**Categorias**: Pessoa Natural (0), Pessoa Juridica (0), Imovel (6), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** extraidos do VVR para o projeto de minutas cartoriais.

O VVR (Valor Venal de Referencia) e um documento simples mas **critico** para a lavratura de escrituras. Ele fornece o valor minimo de base de calculo para o ITBI, estabelecido pela prefeitura.

**Diferenca fundamental:**
- `imovel_valor_venal_iptu` (do IPTU): Valor para calculo do IPTU anual
- `imovel_valor_venal_referencia` (do VVR): Valor minimo para base de calculo do ITBI

O valor do VVR e tipicamente MAIOR que o valor venal do IPTU e serve como piso para tributacao em transmissoes imobiliarias.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (0 campos)

O VVR **NAO** contem dados de pessoas. Identificacao das partes vem de outros documentos.

### 2.2 Pessoa Juridica (0 campos)

O VVR **NAO** contem dados de pessoas juridicas.

### 2.3 Dados do Imovel (6 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NUMERO DA MATRICULA | Numero da matricula do imovel | "46.511" | Condicional |
| SQL | Cadastro municipal (SQL) | "039.080.0244-3" | SIM |
| VALOR VENAL DE REFERENCIA | Valor venal de referencia para ITBI | "485000.00" | SIM |
| LOGRADOURO | Logradouro do imovel | "Rua Francisco Cruz" | SIM |
| NUMERO | Numero do imovel | "515" | SIM |
| AREA CONSTRUIDA EM M2 | Area construida em m2 | "75.00" | Condicional |

### 2.4 Negocio Juridico (0 campos)

O VVR **NAO** contem dados de negocio juridico (valores de transacao, partes, etc.).

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema VVR | Campo Util Mapeado | Categoria |
|---------------------|-------------------|-----------|
| matricula | matricula_numero | imovel |
| sql / inscricao_imobiliaria | imovel_sql | imovel |
| valor_venal_referencia | imovel_valor_venal_referencia | imovel |
| endereco.logradouro | imovel_logradouro | imovel |
| endereco.numero | imovel_numero | imovel |
| area_construida | imovel_area_construida | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "46.511",
    "imovel_sql": "039.080.0244-3",
    "imovel_valor_venal_referencia": "485000.00",
    "imovel_logradouro": "Rua Francisco Cruz",
    "imovel_numero": "515",
    "imovel_area_construida": "75.00"
  },
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Compra e Venda

O VVR e utilizado para:
- **Validacao da base de calculo do ITBI**: A base de calculo nao pode ser inferior ao VVR
- **Conferencia de endereco**: Validar que o endereco confere com matricula
- **Identificacao do imovel**: Via SQL (cadastro municipal)

### 5.2 Validacao Critica

```
SE negocio_valor_total < imovel_valor_venal_referencia:
    ALERTA: Valor da transacao inferior ao VVR
    -> Base de calculo do ITBI sera o VVR, nao o valor da transacao
```

### 5.3 Regra de Ouro

A base de calculo do ITBI sera sempre o **MAIOR** valor entre:
1. Valor declarado da transacao (`negocio_valor_total`)
2. Valor Venal de Referencia (`imovel_valor_venal_referencia`)

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| matricula_numero | MATRICULA_IMOVEL, ITBI, IPTU, DADOS_CADASTRAIS | Identificar imovel |
| imovel_sql | MATRICULA_IMOVEL, ITBI, IPTU, CND_MUNICIPAL, CND_IMOVEL, DADOS_CADASTRAIS | Cadastro municipal |
| imovel_logradouro | MATRICULA_IMOVEL, ITBI, IPTU, ESCRITURA, COMPROMISSO | Endereco |
| imovel_numero | MATRICULA_IMOVEL, ITBI, IPTU, ESCRITURA, COMPROMISSO | Endereco |
| imovel_area_construida | MATRICULA_IMOVEL, IPTU, DADOS_CADASTRAIS | Conferir areas |

### 6.1 Comparacao VVR vs IPTU

| Aspecto | VVR | IPTU |
|---------|-----|------|
| Finalidade | Base de calculo ITBI | Calculo imposto anual |
| Campo de valor | imovel_valor_venal_referencia | imovel_valor_venal_iptu |
| Tipicamente | Valor MAIOR | Valor MENOR |
| Atualizacao | Por transacao | Anual |

---

## 7. CAMPOS NAO EXTRAIDOS DESTE DOCUMENTO

O VVR e um documento **estritamente limitado** a dados do imovel. Os seguintes campos uteis **NAO** vem do VVR:

### 7.1 Dados de Pessoas (todos os campos)
- `nome`, `cpf`, `rg`, `estado_civil`, `profissao`, etc.
- **Fonte alternativa**: RG, CNH, CERTIDAO_CASAMENTO

### 7.2 Dados de Pessoa Juridica (todos os campos)
- `pj_denominacao`, `pj_cnpj`, etc.
- **Fonte alternativa**: CONTRATO_SOCIAL

### 7.3 Dados do Negocio (todos os campos)
- `negocio_valor_total`, `alienante_nome`, `adquirente_nome`, etc.
- **Fonte alternativa**: ITBI, COMPROMISSO, ESCRITURA

### 7.4 Dados do Imovel NAO presentes no VVR
- `imovel_descricao_conforme_matricula` -> MATRICULA_IMOVEL
- `imovel_area_privativa` -> MATRICULA_IMOVEL
- `imovel_denominacao` -> MATRICULA_IMOVEL
- `imovel_bairro`, `imovel_cidade`, `imovel_estado` -> IPTU, MATRICULA_IMOVEL
- `imovel_cep` -> IPTU, DADOS_CADASTRAIS

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-imovel.md`
- Documento relacionado: `campos-uteis/ITBI.md` (usa VVR como referencia)
- Documento relacionado: `campos-uteis/IPTU.md` (valor venal diferente)
