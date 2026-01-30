# PROTOCOLO_ONR - Protocolo ONR/SAEC (Campos Uteis)

**Total de Campos Uteis**: 2 campos
**Categorias**: Pessoa Natural (0), Pessoa Juridica (0), Imovel (2), Negocio (0)
**Cobertura**: BAIXISSIMA - documento de rastreamento, nao de dados
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** extraidos do PROTOCOLO_ONR para o projeto de minutas cartoriais.

**IMPORTANTE**: O Protocolo ONR tem **baixissima cobertura** de campos uteis. De todos os campos extraiveis, apenas **2 campos** alimentam o modelo de dados de minutas.

### O que e o ONR?

O **ONR** (Operador Nacional do Registro Eletronico de Imoveis) e a entidade responsavel por implementar o Sistema de Registro Eletronico de Imoveis (SREI), conforme Lei 11.977/2009 e Provimento CNJ 89/2019.

### O que e o SAEC?

O **SAEC** (Servico de Atendimento Eletronico Compartilhado) e a plataforma operacional do ONR que permite:
- Solicitacao de certidoes digitais (inteiro teor, onus reais)
- Pesquisa de bens imoveis por CPF/CNPJ
- Protocolo de titulos para registro

### Finalidade do Protocolo

O documento de protocolo e um **comprovante de solicitacao**, usado para:
- **Rastrear** pedidos de certidoes ou registros
- **Comprovar** que uma solicitacao foi registrada
- **Identificar** o servico solicitado e cartorio de destino

**NAO e usado para alimentar dados de minutas** - apenas para rastreamento operacional.

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (0 campos)

O PROTOCOLO_ONR **NAO** fornece dados de pessoas para minutas.

Os dados do solicitante (nome, CPF) presentes no protocolo sao apenas para rastreamento interno, **nao** para qualificacao em minutas.

### 2.2 Pessoa Juridica (0 campos)

O PROTOCOLO_ONR **NAO** fornece dados de pessoas juridicas.

### 2.3 Dados do Imovel (2 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| matricula_numero | Numero da matricula (quando presente) | "123456" | NAO |
| matricula_cartorio | Cartorio de destino da solicitacao | "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO" | NAO |

**Nota**: Estes campos sao apenas referencias, nao dados autoritativos. A fonte primaria e sempre a MATRICULA_IMOVEL.

### 2.4 Negocio Juridico (0 campos)

O PROTOCOLO_ONR **NAO** fornece dados de negocio juridico.

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| matricula_imovel | matricula_numero | imovel |
| cartorio_destino | matricula_cartorio | imovel |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {},
  "pessoa_juridica": {},
  "imovel": {
    "matricula_numero": "123456",
    "matricula_cartorio": "1o OFICIAL DE REGISTRO DE IMOVEIS DE SAO PAULO"
  },
  "negocio": {}
}
```

**Observacao**: Na maioria dos casos, os dados extraidos serao ainda mais limitados ou vazios, pois muitos protocolos nao incluem matricula especifica.

---

## 5. USO EM MINUTAS

### 5.1 Uso Principal: NENHUM

O Protocolo ONR **NAO e usado diretamente** em minutas cartoriais.

Sua funcao e operacional:
- Rastrear solicitacoes de certidoes
- Correlacionar pedidos com documentos recebidos
- Comprovar a origem de certidoes digitais

### 5.2 Uso Indireto

O protocolo pode ser usado para:
- **Identificar** qual matricula foi solicitada (para buscar o documento correto)
- **Confirmar** o cartorio de registro do imovel

---

## 6. CORRELACAO COM OUTROS DOCUMENTOS

### 6.1 Correlacao Principal: MATRICULA_IMOVEL

| Campo do Protocolo | Correlaciona com | Finalidade |
|--------------------|------------------|------------|
| matricula_numero | MATRICULA_IMOVEL.matricula_numero | Identificar qual certidao foi solicitada |
| cartorio_destino | MATRICULA_IMOVEL.matricula_cartorio | Confirmar cartorio |

### 6.2 Fluxo de Correlacao

```
PROTOCOLO_ONR (solicitacao)
    |
    v
[Processamento pelo cartorio]
    |
    v
MATRICULA_IMOVEL (documento final) <- ESTE e a fonte de dados
```

O protocolo rastreia a solicitacao; a MATRICULA_IMOVEL e a fonte autoritativa.

---

## 7. CAMPOS NAO EXTRAIDOS DESTE DOCUMENTO

O Protocolo ONR e **praticamente inutil** para alimentar minutas. A lista abaixo mostra o que **NAO vem** do protocolo:

### 7.1 TODOS os Dados de Pessoa Natural (47 campos)
- `nome`, `cpf`, `rg`, `data_nascimento`, `estado_civil`, `profissao`, etc.
- **Fonte alternativa**: RG, CNH, CERTIDAO_CASAMENTO

### 7.2 TODOS os Dados de Pessoa Juridica (76 campos)
- `pj_denominacao`, `pj_cnpj`, `pj_nire`, `pj_admin_*`, etc.
- **Fonte alternativa**: CONTRATO_SOCIAL

### 7.3 TODOS os Dados do Negocio Juridico (37 campos)
- `negocio_valor_total`, `alienante_*`, `adquirente_*`, `itbi_*`, etc.
- **Fonte alternativa**: ITBI, COMPROMISSO, ESCRITURA

### 7.4 QUASE TODOS os Dados do Imovel (42 de 44 campos)
- `imovel_sql`, `imovel_logradouro`, `imovel_descricao_conforme_matricula`, etc.
- `imovel_valor_venal_iptu`, `imovel_valor_venal_referencia`, etc.
- **Fonte alternativa**: MATRICULA_IMOVEL, IPTU, VVR

---

## 8. CAMPOS DO PROTOCOLO NAO MAPEADOS

Estes campos sao extraidos do protocolo mas **NAO alimentam minutas**:

| Campo Extraido | Tipo | Motivo da Exclusao |
|----------------|------|-------------------|
| numero_protocolo | string | Apenas rastreamento |
| data_protocolo | date | Metadado da solicitacao |
| hora_protocolo | string | Metadado da solicitacao |
| tipo_solicitacao | string | Informativo |
| status_solicitacao | string | Temporario (muda durante processamento) |
| codigo_verificacao | string | Autenticacao do protocolo |
| solicitante.nome | string | Dados do solicitante, nao da transacao |
| solicitante.cpf_cnpj | string | Dados do solicitante, nao da transacao |
| solicitante.email | string | Contato do solicitante |
| sistema_origem.* | object | Metadado tecnico |
| informacoes_suporte.* | object | Dados de suporte |

---

## 9. QUANDO USAR O PROTOCOLO ONR

### 9.1 Usar para:
- Rastrear solicitacoes de certidoes
- Correlacionar certidoes recebidas com pedidos
- Comprovar a origem de documentos digitais
- Identificar qual imovel/matricula foi solicitado

### 9.2 NAO usar para:
- Extrair dados de pessoas
- Extrair dados de imoveis (usar MATRICULA_IMOVEL)
- Alimentar qualquer campo de minuta

---

## 10. REFERENCIAS

- Documentacao completa: `campos-completos/PROTOCOLO_ONR.md`
- Documento correlacionado: `campos-uteis/MATRICULA_IMOVEL.md` (fonte primaria)
- Mapeamento: `execution/mapeamento_documento_campos.json`
- Schema: `execution/schemas/protocolo_onr.json`
