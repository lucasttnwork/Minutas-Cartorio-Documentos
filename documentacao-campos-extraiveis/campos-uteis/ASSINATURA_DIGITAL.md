# ASSINATURA_DIGITAL - Comprovante de Assinatura Digital (Campos Uteis)

**Total de Campos Uteis**: 1 campo
**Categorias**: Pessoa Natural (1), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Cobertura**: MINIMA
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** extraidos da ASSINATURA_DIGITAL para o projeto de minutas cartoriais.

**COBERTURA MINIMA**: A Assinatura Digital possui o menor numero de campos uteis de todo o sistema - apenas 1 campo (nome). Este documento **NAO alimenta diretamente campos de minutas**, servindo exclusivamente para **VALIDACAO**.

**Finalidade principal**: Confirmar que o COMPROMISSO_COMPRA_VENDA foi assinado pelas partes envolvidas.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (1 campo)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome do signatario | "JOAO DA SILVA" | SIM |

### 2.2-2.4 Demais Categorias (0 campos)

A ASSINATURA_DIGITAL **NAO** fornece campos de:
- Pessoa Juridica
- Imovel
- Negocio

---

## 3. USO PRATICO

### 3.1 Funcao: Validacao (NAO alimentacao de minutas)

A Assinatura Digital serve para:
1. **Confirmar identidade**: Nome do signatario (pode incluir email)
2. **Validar assinatura do COMPROMISSO**: Comprovar que as partes assinaram o contrato
3. **Garantir integridade**: Documento foi assinado digitalmente

### 3.2 Informacoes Disponiveis (NAO mapeadas como campos uteis)

O documento de assinatura digital tipicamente contem:
- Nome do signatario
- Email do signatario
- Data/hora da assinatura
- IP de origem
- Hash do documento assinado
- Certificado digital utilizado

**Nota**: Apenas `nome` e mapeado como campo util, pois os demais dados servem apenas para auditoria/validacao.

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOAO DA SILVA"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. CORRELACAO COM COMPROMISSO_COMPRA_VENDA

A ASSINATURA_DIGITAL esta diretamente correlacionada ao COMPROMISSO_COMPRA_VENDA:

| Aspecto | COMPROMISSO_COMPRA_VENDA | ASSINATURA_DIGITAL |
|---------|-------------------------|-------------------|
| Campos uteis | 53 | 1 |
| Funcao | Alimentar minutas | Validar assinaturas |
| Dados das partes | SIM (completos) | NAO (apenas nome) |
| Dados do imovel | SIM | NAO |
| Dados do negocio | SIM | NAO |

**Fluxo tipico**:
1. COMPROMISSO_COMPRA_VENDA e elaborado com todos os dados
2. Partes assinam digitalmente
3. ASSINATURA_DIGITAL comprova que assinaram
4. Pipeline usa COMPROMISSO para extrair dados, ASSINATURA para validar

---

## 6. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Praticamente **TODOS** os campos uteis do sistema devem vir de outros documentos:

### 6.1 Qualificacao de Pessoas (TODOS os campos)
- `cpf`, `rg`, `orgao_emissor_rg`, `estado_emissor_rg`
- `nacionalidade`, `profissao`, `estado_civil`, `regime_bens`
- `data_nascimento`, `filiacao_pai`, `filiacao_mae`
- `domicilio_*` (logradouro, numero, bairro, cidade, estado, cep)
- **Fonte**: RG, CNH, CERTIDAO_CASAMENTO, COMPROVANTE_RESIDENCIA, COMPROMISSO

### 6.2 Dados de Pessoa Juridica (TODOS os campos)
- `pj_denominacao`, `pj_cnpj`, `pj_nire`
- `pj_sede_*`, `pj_admin_*`, `pj_procurador_*`
- **Fonte**: CONTRATO_SOCIAL, PROCURACAO

### 6.3 Dados do Imovel (TODOS os campos)
- `matricula_numero`, `matricula_cartorio_*`
- `imovel_*` (denominacao, area, logradouro, numero, bairro, cidade, estado)
- `proprietario_*`, `onus_*`
- **Fonte**: MATRICULA_IMOVEL, ITBI, IPTU, COMPROMISSO

### 6.4 Dados do Negocio (TODOS os campos)
- `negocio_valor_total`, `negocio_fracao_alienada`
- `alienante_*`, `adquirente_*`
- `pagamento_*`, `itbi_*`
- **Fonte**: COMPROMISSO, ITBI, ESCRITURA, COMPROVANTE_PAGAMENTO

---

## 7. COMPARATIVO DE COBERTURA

| Documento | Campos Uteis | Ranking |
|-----------|-------------|---------|
| COMPROMISSO_COMPRA_VENDA | 53 | 1o (maior) |
| MATRICULA_IMOVEL | 43 | 2o |
| ESCRITURA | 41 | 3o |
| ... | ... | ... |
| CND_CONDOMINIO | 2 | Penultimo |
| **ASSINATURA_DIGITAL** | **1** | **Ultimo (menor)** |

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Documento correlacionado: `campos-uteis/COMPROMISSO_COMPRA_VENDA.md`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
