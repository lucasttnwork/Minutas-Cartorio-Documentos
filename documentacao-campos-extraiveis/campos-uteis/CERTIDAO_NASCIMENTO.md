# CERTIDAO_NASCIMENTO - Certidao de Nascimento (Campos Uteis)

**Total de Campos Uteis**: 11 campos
**Categorias**: Pessoa Natural (11), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

A CERTIDAO_NASCIMENTO e o **documento primario de identificacao civil** de uma pessoa. E a fonte **autoritativa e fundante** para:
- Nome oficial completo (conforme registrado no assento de nascimento)
- Data de nascimento exata
- Naturalidade (local de nascimento)
- Filiacao completa (pai e mae)

**Diferenca vs. Campos Completos:**
- Campos Uteis: 11 campos (este arquivo)
- Campos Completos: ~19 campos (ver `campos-completos/CERTIDAO_NASCIMENTO.md`)

**Por que sao 11 e nao 19?**
Campos como `avos` (4 campos), `hora_nascimento`, `data_registro`, `municipio_cartorio` sao extraidos mas NAO usados diretamente em minutas cartoriais. Sao uteis apenas para correlacao genealogica, validacao de identidade em processos sucessorios e metadados de referencia.

---

## 2. IMPORTANCIA DO DOCUMENTO

A Certidao de Nascimento e o **primeiro documento oficial** de qualquer pessoa natural brasileira. Todos os demais documentos de identificacao (RG, CPF, CNH) derivam dela.

### 2.1 Quando a Certidao de Nascimento e Necessaria em Minutas

| Situacao | Por que e necessaria |
|----------|---------------------|
| RG incompleto/ilegivel | Fonte primaria para nome, filiacao, naturalidade |
| Qualificacao de menor | Confirma data de nascimento e filiacao |
| Processo de heranca | Comprova filiacao para fins sucessorios |
| Divergencia de dados | Fonte autoritativa para resolver conflitos |
| Pessoa sem RG atualizado | Documento de identificacao alternativo |

### 2.2 Diferenca Entre Certidoes Antigas e Novas

A CERTIDAO_NASCIMENTO tem dois modelos que afetam os campos de referencia do registro:

#### Modelo Antigo (antes de 01/01/2010)
Identificacao por **Livro/Folha/Termo** (sistema local ao cartorio):
- `certidao_nascimento_livro`: "A-133"
- `certidao_nascimento_folha`: "270" ou "45v" (v = verso)
- `certidao_nascimento_termo`: "80631"
- `certidao_nascimento_cartorio`: Nome do cartorio

**IMPORTANTE:** O mesmo numero de termo pode existir em cartorios diferentes. A identificacao completa requer cartorio + livro + folha + termo.

#### Modelo Novo (apos 01/01/2010)
Identificacao por **Matricula Nacional** de 32 digitos:
- `certidao_nascimento_matricula`: "122044 01 55 2022 1 00133 270 0080631-44"

A matricula e **unica em todo o territorio brasileiro**, eliminando ambiguidades.

**Na pratica:** Extrair os campos disponiveis. Certidoes novas terao matricula; certidoes antigas terao livro/folha/termo.

---

## 3. CAMPOS POR CATEGORIA

### 3.1 Pessoa Natural (11 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| NOME | Nome completo do registrado | "MARINA AYUB" | SIM |
| DATA DE NASCIMENTO | Data de nascimento | "06/09/1991" | SIM |
| NATURALIDADE | Local de nascimento (cidade/estado) | "Sao Paulo - SP" | SIM |
| SEXO | Sexo do registrado | "FEMININO" | Condicional |
| FILIACAO PAI | Nome completo do pai | "MUNIR AKAR AYUB" | Condicional |
| FILIACAO MAE | Nome completo da mae | "ELOISA BASILE SIQUEIRA AYUB" | SIM |
| LIVRO | Livro do registro (modelo antigo) | "A-133" | Condicional |
| FOLHA | Folha do registro (modelo antigo) | "270" | Condicional |
| TERMO | Termo do registro (modelo antigo) | "80631" | Condicional |
| CARTORIO | Cartorio emissor | "28o Subdistrito - Jardim Paulista" | Condicional |
| MATRICULA | Matricula nacional (modelo novo) | "122044 01 55 2022 1 00133 270 0080631-44" | Condicional |

**Notas:**
- `filiacao_pai` pode estar ausente em casos de paternidade nao reconhecida
- `filiacao_mae` e SEMPRE obrigatorio (consta em todas as certidoes)
- `sexo` geralmente nao e usado em minutas, mas pode ser necessario em qualificacoes especificas
- Campos de registro: ou tem matricula (modelo novo) ou tem livro/folha/termo (modelo antigo)

### 3.2-3.4 Outras Categorias

A CERTIDAO_NASCIMENTO nao alimenta campos de Pessoa Juridica, Imovel ou Negocio Juridico.

---

## 4. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_registrado | NOME | pessoa_natural |
| data_nascimento | DATA DE NASCIMENTO | pessoa_natural |
| local_nascimento (cidade/estado) | NATURALIDADE | pessoa_natural |
| sexo | SEXO | pessoa_natural |
| nome_pai | FILIACAO PAI | pessoa_natural |
| nome_mae | FILIACAO MAE | pessoa_natural |
| livro | LIVRO | pessoa_natural |
| folha | FOLHA | pessoa_natural |
| termo | TERMO | pessoa_natural |
| cartorio | CARTORIO | pessoa_natural |
| matricula | MATRICULA | pessoa_natural |

---

## 5. EXEMPLO SIMPLIFICADO

### 5.1 Certidao Modelo Antigo (Livro/Folha/Termo)

```json
{
  "pessoa_natural": {
    "nome": "MARINA AYUB",
    "data_nascimento": "06/09/1991",
    "naturalidade": "Sao Paulo - SP",
    "sexo": "FEMININO",
    "filiacao_pai": "MUNIR AKAR AYUB",
    "filiacao_mae": "ELOISA BASILE SIQUEIRA AYUB",
    "certidao_nascimento_livro": "A-133",
    "certidao_nascimento_folha": "270",
    "certidao_nascimento_termo": "80631",
    "certidao_nascimento_cartorio": "28o Subdistrito - Jardim Paulista"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

### 5.2 Certidao Modelo Novo (Matricula Nacional)

```json
{
  "pessoa_natural": {
    "nome": "PEDRO HENRIQUE SANTOS OLIVEIRA",
    "data_nascimento": "22/03/2015",
    "naturalidade": "Sao Paulo - SP",
    "sexo": "MASCULINO",
    "filiacao_pai": "CARLOS EDUARDO OLIVEIRA",
    "filiacao_mae": "ANA PAULA SANTOS OLIVEIRA",
    "certidao_nascimento_matricula": "122044 01 55 2015 1 00250 045 0012345-67",
    "certidao_nascimento_cartorio": "1o Subdistrito de Registro Civil"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 6. USO EM MINUTAS

### 6.1 Qualificacao das Partes (Escritura/Procuracao)

Quando o RG esta incompleto ou ilegivel, a Certidao de Nascimento fornece:

- `nome` -> Nome completo oficial
- `data_nascimento` -> Para calculo de maioridade
- `naturalidade` -> Local de nascimento (qualificacao completa)
- `filiacao_pai`, `filiacao_mae` -> Conferencia de identidade

### 6.2 Referencia do Documento

Para citar a certidao na minuta:

**Modelo Antigo:**
```
"...conforme Certidao de Nascimento registrada no Livro A-133,
Folha 270, Termo 80631, do 28o Subdistrito - Jardim Paulista, Sao Paulo-SP..."
```

**Modelo Novo:**
```
"...conforme Certidao de Nascimento de matricula no 122044 01 55 2015 1 00250 045 0012345-67..."
```

### 6.3 Verificacao de Maioridade

A `data_nascimento` permite calcular se a pessoa e maior de idade na data do ato:
- Se idade < 18: Necessario representante legal
- Se idade >= 18: Pode assinar por si proprio

---

## 7. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_CASAMENTO, CNDT (20 docs) | Identificar pessoa |
| data_nascimento | RG, CNH, CERTIDAO_CASAMENTO (7 docs) | Validar identidade/idade |
| naturalidade | RG (campo derivado) | Conferencia cruzada |
| filiacao_pai | RG, CERTIDAO_CASAMENTO | Confirmar identidade |
| filiacao_mae | RG, CERTIDAO_CASAMENTO | Confirmar identidade (mais confiavel) |

### 7.1 Correlacao com RG

O RG frequentemente referencia a Certidao de Nascimento no campo `doc_origem`:

```
RG: "SAO PAULO-SP JARDIM PAULISTA CN:LV.A133/FLSo270/No80631"
                                  |     |       |     |
                                  |     |       |     +-- Termo (80631)
                                  |     |       +-------- Folha (270)
                                  |     +---------------- Livro (A133)
                                  +---------------------- CN = Certidao Nascimento
```

Esta referencia permite correlacionar diretamente o RG com a Certidao de Nascimento original.

### 7.2 Correlacao com CERTIDAO_CASAMENTO

A Certidao de Casamento contem dados de nascimento de ambos os conjuges:

| Dado na Certidao Casamento | Correlacao com Certidao Nascimento |
|---------------------------|-----------------------------------|
| data_nascimento_conjuge | Deve ser identica a `data_nascimento` |
| naturalidade_conjuge | Deve corresponder a `naturalidade` |
| pai_conjuge / mae_conjuge | Deve corresponder a `filiacao_pai` / `filiacao_mae` |

### 7.3 Hierarquia de Fontes

A CERTIDAO_NASCIMENTO e a **fonte primaria e autoritativa** para:

| Dado | Por que e autoritativo | Fontes secundarias |
|------|----------------------|-------------------|
| Nome de nascimento | Registro oficial original | RG, CNH (derivados) |
| Data de nascimento | Fonte primaria oficial | RG, CNH (copias) |
| Filiacao (pai/mae) | Registro oficial | RG (resumido) |
| Local de nascimento | Registro oficial | RG (naturalidade resumida) |

**Em caso de divergencia entre documentos, prevalece a CERTIDAO_NASCIMENTO.**

---

## 8. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de `pessoa_natural` que **NAO** vem da CERTIDAO_NASCIMENTO:

| Campo | Onde Obter | Observacao |
|-------|-----------|------------|
| cpf | RG (moderno), CNH, CNDT | Certidao de nascimento nao tem CPF |
| rg | RG | Numero do documento de identidade |
| orgao_emissor_rg | RG | Orgao expedidor |
| estado_emissor_rg | RG | UF do RG |
| data_emissao_rg | RG | Data de expedicao |
| estado_civil | CERTIDAO_CASAMENTO | Certidao de nascimento nao indica estado civil atual |
| regime_bens | CERTIDAO_CASAMENTO | Dado do casamento |
| data_casamento | CERTIDAO_CASAMENTO | Dado do casamento |
| profissao | CERTIDAO_CASAMENTO, ESCRITURA | Nao consta em certidao de nascimento |
| domicilio_* (8 campos) | COMPROVANTE_RESIDENCIA | Endereco atual |
| email, telefone | COMPROMISSO_COMPRA_VENDA | Dados de contato |
| nacionalidade | Inferido do local de nascimento | "brasileiro(a)" se nascido no Brasil |
| cnh, orgao_emissor_cnh | CNH | Documento de habilitacao |
| certidoes (cndt_*, certidao_uniao_*) | CNDT, CND_FEDERAL | Certidoes negativas |

**IMPORTANTE:** A Certidao de Nascimento registra o nascimento, NAO a situacao atual da pessoa. Por isso nao contem:
- Estado civil atual (a pessoa pode ter casado depois)
- Endereco atual (a pessoa pode ter mudado)
- Profissao atual (a pessoa era recem-nascida)
- CPF (emitido posteriormente)

---

## 9. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CERTIDAO_NASCIMENTO.md`
- Provimento CNJ 63/2017: Regulamenta a matricula nacional
- Lei 6.015/1973: Lei de Registros Publicos
