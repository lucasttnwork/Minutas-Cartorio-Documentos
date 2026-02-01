# Campos Uteis - Guia de Uso

Esta pasta contem APENAS os campos uteis mapeados para o projeto de minutas cartoriais.

## Objetivo

Fornecer visao focada nos dados relevantes para geracao de minutas, conforme:
- `execution/mapeamento_documento_campos.json` (205 campos definidos)
- `Guia-de-campos-e-variaveis/campos-*.md` (4 categorias)

## Categorias de Campos

### 1. Pessoa Natural (47 campos)
Dados de pessoas fisicas para qualificacao em minutas:

| Subcategoria | Campos | Exemplos |
|--------------|--------|----------|
| Identificacao | 11 | nome, cpf, rg, cnh |
| Estado Civil | 10 | estado_civil, regime_bens, data_casamento |
| Filiacao | 3 | filiacao_pai, filiacao_mae, naturalidade |
| Domicilio | 8 | logradouro, numero, bairro, cidade, estado, cep |
| Contatos | 2 | email, telefone |
| Certidoes | 13 | cndt, certidao_uniao, certidao_nascimento |

### 2. Pessoa Juridica (76 campos)
Dados de empresas e representantes:

| Subcategoria | Campos | Exemplos |
|--------------|--------|----------|
| Qualificacao | 4 | pj_denominacao, pj_cnpj, pj_nire |
| Sede | 8 | pj_sede_logradouro, cidade, estado, cep |
| Registro | 6 | instrumento_constitutivo, junta_comercial |
| Administrador | 21 | pj_admin_nome, cpf, rg, domicilio |
| Procurador | 23 | pj_procurador_nome, cpf, rg, domicilio |
| Procuracao | 6 | tabelionato, data, livro, paginas |
| Certidoes | 8 | pj_cndt, pj_certidao_uniao |

### 3. Dados do Imovel (44 campos)
Dados de imoveis para descricao em minutas:

| Subcategoria | Campos | Exemplos |
|--------------|--------|----------|
| Matricula | 5 | numero, cartorio, cidade, estado, nacional |
| Descricao | 3 | denominacao, descricao_conforme_matricula |
| Areas | 3 | area_total, area_privativa, area_construida |
| Endereco | 7 | logradouro, numero, complemento, bairro |
| Cadastro | 4 | sql, valor_venal_iptu, valor_venal_referencia |
| Certidoes | 5 | cnd_iptu, certidao_matricula |
| Proprietarios | 5 | nome, fracao_ideal, registro_aquisicao |
| Onus | 6 | titulo, registro, descricao, titular |
| Ressalvas | 2 | existencia, descricao |

### 4. Negocio Juridico (37 campos)
Dados da transacao para minutas:

| Subcategoria | Campos | Exemplos |
|--------------|--------|----------|
| Valores | 3 | valor_matricula, fracao_alienada, valor_total |
| Alienantes PF | 6 | nome, fracao_ideal, valor, conjuge |
| Alienantes PJ | 3 | denominacao, fracao_ideal, valor |
| Adquirentes PF | 3 | nome, fracao_ideal, valor |
| Adquirentes PJ | 3 | denominacao, fracao_ideal, valor |
| Pagamento | 9 | tipo, modo, data, banco_origem, conta_destino |
| Termos | 3 | promessa, especiais, instrucoes_extras |
| ITBI | 6 | numero_guia, base_calculo, valor, aliquota |

## Como Ler os Arquivos

Cada arquivo mostra:

### 1. RESUMO
- Total de campos uteis do documento
- Categorias que alimenta
- Diferenca vs campos completos

### 2. CAMPOS POR CATEGORIA
- Tabelas com campo, descricao, exemplo
- Indicacao de obrigatoriedade

### 3. MAPEAMENTO REVERSO
- Do schema para campo util
- Categoria de destino

### 4. EXEMPLO SIMPLIFICADO
- JSON apenas com campos uteis
- Organizado por categoria

### 5. USO EM MINUTAS
- Onde cada campo aparece nas minutas
- Escritura, procuracao, etc.

### 6. CORRELACAO
- Campos que tambem sao uteis em outros documentos
- Finalidade da correlacao

### 7. CAMPOS NAO EXTRAIDOS
- Campos uteis de outras categorias
- Onde obter esses campos

## Quando Usar

Use esta pasta quando voce precisa:
- ✅ Saber quais dados sao extraidos para minutas
- ✅ Entender o mapeamento de negocio
- ✅ Gerar interfaces de usuario
- ✅ Validar dados para escrituras
- ✅ Correlacionar dados entre documentos

Para estrutura tecnica completa, consulte `../campos-completos/`.

## Campos Mais Importantes

### Identificacao de Pessoas
| Campo | Documentos | Finalidade |
|-------|-----------|------------|
| nome | 20 | Nome completo para qualificacao |
| cpf | 17 | Identificacao fiscal PF |
| rg | 8 | Documento de identidade |
| data_nascimento | 7 | Qualificacao completa |

### Identificacao de Empresas
| Campo | Documentos | Finalidade |
|-------|-----------|------------|
| pj_denominacao | 11 | Razao social |
| pj_cnpj | 11 | Identificacao fiscal PJ |

### Identificacao de Imovel
| Campo | Documentos | Finalidade |
|-------|-----------|------------|
| matricula_numero | 9 | Numero da matricula |
| imovel_sql | 7 | Cadastro municipal |
| imovel_logradouro | 9 | Endereco do imovel |

## Documentos por Cobertura

### Alta Cobertura (40+ campos uteis)
| Documento | Campos | Categorias |
|-----------|--------|------------|
| COMPROMISSO_COMPRA_VENDA | 53 | Todas |
| MATRICULA_IMOVEL | 43 | PN, PJ, Imovel |
| ESCRITURA | 41 | Todas |

### Media Cobertura (20-39 campos uteis)
| Documento | Campos | Categorias |
|-----------|--------|------------|
| PROCURACAO | 35 | PN, PJ |
| CONTRATO_SOCIAL | 32 | PJ |
| ITBI | 22 | PN, PJ, Imovel, Negocio |

### Baixa Cobertura (< 20 campos uteis)
| Documento | Campos | Categorias |
|-----------|--------|------------|
| CND_FEDERAL | 14 | PN, PJ |
| COMPROVANTE_PAGAMENTO | 14 | PN, PJ, Negocio |
| IPTU | 13 | PN, Imovel |
| ... | ... | ... |

## Referencias

- **Mapeamento Completo**: `execution/mapeamento_documento_campos.json`
- **Guias de Interface**: `Guia-de-campos-e-variaveis/campos-*.md`
- **Campos Completos**: `../campos-completos/[TIPO].md`
- **Documento Mestre**: `DOCUMENTOS_E_CAMPOS_REFERENCIA.md`

---

**Ultima atualizacao**: 2026-01-30
**Versao do mapeamento**: 1.1
