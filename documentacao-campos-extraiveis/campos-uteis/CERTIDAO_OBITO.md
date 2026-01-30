# CERTIDAO_OBITO - Certidao de Registro de Obito (Campos Uteis)

**Total de Campos Uteis**: 7 campos
**Categorias**: Pessoa Natural (7), Pessoa Juridica (0), Imovel (0), Negocio (0)
**Ultima Atualizacao**: 2026-01-30

---

## 1. RESUMO

Este documento lista **APENAS os campos uteis** para o projeto de minutas cartoriais.

**Diferenca vs. Campos Completos:**
- Campos Uteis: 7 campos (este arquivo)
- Campos Completos: ~25 campos (ver `campos-completos/CERTIDAO_OBITO.md`)

A Certidao de Obito e fonte **UNICA e autoritativa** para comprovacao de falecimento e determinacao de viuvez. E documento indispensavel para:
- Abertura de inventario (judicial ou extrajudicial)
- Averbacao de obito na matricula de imovel
- Comprovacao de viuvez do conjuge sobrevivente
- Habilitacao de herdeiros em escrituras de transmissao

---

## 2. CAMPOS POR CATEGORIA

### 2.1 Pessoa Natural (7 campos)

| Campo Mapeado | Descricao | Exemplo | Obrigatorio? |
|---------------|-----------|---------|--------------|
| nome | Nome completo do falecido | "JOSE ANTONIO DA SILVA" | SIM |
| cpf | CPF do falecido | "123.456.789-00" | Condicional |
| rg | RG do falecido | "12.345.678-9" | Condicional |
| data_nascimento | Data de nascimento do falecido | "10/03/1950" | Condicional |
| data_obito | Data do obito/falecimento | "15/05/2020" | SIM |
| estado_civil | Estado civil ao falecer | "CASADO" | Condicional |
| data_falecimento_conjuge | Data de obito (para atualizar estado civil do conjuge) | "15/05/2020" | SIM |

**Notas Importantes:**
- O campo `data_obito` e **CRITICO** pois:
  1. Determina que a pessoa esta falecida
  2. Altera o estado civil do conjuge sobrevivente para "viuvo/a"
  3. Define marco temporal para abertura de inventario (60 dias para desconto ITCMD em SP)
  4. E obrigatorio em qualquer escritura de inventario

- O campo `data_falecimento_conjuge` e mapeado como alias de `data_obito` e serve para:
  1. Atualizar automaticamente o estado civil do conjuge sobrevivente
  2. Registrar nas minutas quando o estado civil "viuvo/a" foi adquirido
  3. Calcular prazos legais de viuvez para novo casamento ou uniao estavel

- CPF e RG podem nao estar presentes em certidoes antigas (pre-2010)
- Estado civil indica se havia conjuge no momento do obito

---

### 2.2-2.4 Outras Categorias

A Certidao de Obito nao alimenta campos de Pessoa Juridica, Imovel ou Negocio Juridico.

**Porem, e documento essencial para:**
- Averbacao de obito na matricula de imovel (atualizando titularidade)
- Abertura de inventario que culminara em transmissao de imoveis
- Identificacao de herdeiros que comparecerão em escrituras

---

## 3. MAPEAMENTO REVERSO

| Campo no Schema | Campo Util Mapeado | Categoria |
|-----------------|-------------------|-----------|
| nome_falecido | nome | pessoa_natural |
| cpf_falecido | cpf | pessoa_natural |
| rg_falecido | rg | pessoa_natural |
| data_nascimento | data_nascimento | pessoa_natural |
| data_obito | data_obito | pessoa_natural |
| estado_civil | estado_civil | pessoa_natural |
| data_obito (alias) | data_falecimento_conjuge | pessoa_natural |

---

## 4. EXEMPLO SIMPLIFICADO

```json
{
  "pessoa_natural": {
    "nome": "JOSE ANTONIO DA SILVA",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-9",
    "data_nascimento": "10/03/1950",
    "data_obito": "15/05/2020",
    "estado_civil": "CASADO",
    "data_falecimento_conjuge": "15/05/2020"
  },
  "pessoa_juridica": {},
  "imovel": {},
  "negocio": {}
}
```

---

## 5. USO EM MINUTAS

### 5.1 Escritura de Inventario

A Certidao de Obito e documento **obrigatorio** para qualquer inventario:

- `nome` -> Identificacao do de cujus (falecido)
- `cpf`, `rg` -> Qualificacao completa do de cujus
- `data_obito` -> Marco inicial da abertura da sucessao
- `estado_civil` -> Determina se ha conjuge com direito a meacao

**Exemplo de uso na minuta:**
> "...do espolio de JOSE ANTONIO DA SILVA, brasileiro, CPF 123.456.789-00, RG 12.345.678-9, falecido em 15 de maio de 2020, na constancia do casamento com..."

### 5.2 Qualificacao do Conjuge Sobrevivente

O campo `data_falecimento_conjuge` e usado para atualizar a qualificacao do viuvo/viuva:

**Exemplo de uso na minuta:**
> "...ANA MARIA DA SILVA, brasileira, viuva desde 15 de maio de 2020, CPF..."

### 5.3 Averbacao em Matricula de Imovel

Para averbacao de obito na matricula:
- `nome` -> Correspondencia com nome do proprietario na matricula
- `data_obito` -> Data a ser averbada
- `estado_civil` -> Determina regime de bens e meacao

### 5.4 Prazos Importantes

| Prazo | Descricao | Uso do Campo |
|-------|-----------|--------------|
| 60 dias | Inventario extrajudicial com desconto ITCMD (SP) | Calculado a partir de `data_obito` |
| 2 meses | Prazo sem multa para abertura de inventario | Calculado a partir de `data_obito` |
| 180 dias | Prazo para averbacao de inventario no RI | Calculado a partir do formal de partilha |

---

## 6. CORRELACAO COM CAMPOS UTEIS DE OUTROS DOCUMENTOS

| Campo Util | Tambem Util Em | Finalidade |
|------------|---------------|------------|
| nome | RG, CNH, CERTIDAO_NASCIMENTO, CERTIDAO_CASAMENTO, MATRICULA_IMOVEL | Identificar o falecido |
| cpf | RG, CNH, CND_FEDERAL, CNDT | Identificar pessoa unicamente |
| rg | RG, CNH, CERTIDAO_CASAMENTO | Confirmar identidade |
| data_nascimento | RG, CNH, CERTIDAO_NASCIMENTO | Validar identidade |
| estado_civil | CERTIDAO_CASAMENTO | Determinar existencia de conjuge e meacao |

### 6.1 Correlacao Especial com CERTIDAO_CASAMENTO

A Certidao de Obito complementa diretamente a Certidao de Casamento:

| Dado na Certidao Obito | Implicacao para Certidao Casamento |
|------------------------|-----------------------------------|
| data_obito | Averbacao de obito na certidao de casamento |
| estado_civil "CASADO" | Confirma que casamento estava vigente |
| nome do conjuge | Deve corresponder ao nome na certidao de casamento |

### 6.2 Hierarquia de Fontes para Estado Civil

1. **CERTIDAO_OBITO** - Fonte autoritativa para falecimento e viuvez
2. **CERTIDAO_CASAMENTO** - Com averbacao de obito, confirma viuvez
3. **RG** - Estado civil pode estar desatualizado

---

## 7. CAMPOS UTEIS NAO EXTRAIDOS DESTE DOCUMENTO

Campos de pessoa_natural que NAO vem da CERTIDAO_OBITO:

- `profissao`: Obter de CERTIDAO_CASAMENTO, RG (modelo antigo)
- `nacionalidade`: Obter de RG, CERTIDAO_NASCIMENTO
- `domicilio_*` (endereco completo): Obter de COMPROVANTE_RESIDENCIA
- `email`, `telefone`: Obter de COMPROMISSO_COMPRA_VENDA
- `orgao_emissor_rg`, `estado_emissor_rg`: Obter de RG
- `regime_bens`: Obter de CERTIDAO_CASAMENTO (embora possa constar na certidao de obito se casado)
- `filiacao_pai`, `filiacao_mae`: Embora presentes na certidao, o mapeamento atual nao os inclui como campos uteis

**Campos presentes na certidao mas NAO mapeados como uteis:**
- matricula, livro, folha, termo (referencia de registro)
- hora_obito (dado complementar)
- causa_mortis (informacao sensivel, nao usada em minutas)
- local_obito, cemiterio, data_sepultamento (dados de sepultamento)
- declarante, medico_atestante (dados administrativos)
- cartorio, municipio_cartorio, estado_cartorio (origem do documento)

---

## 8. REFERENCIAS

- Mapeamento: `execution/mapeamento_documento_campos.json`
- Guia: `Guia-de-campos-e-variaveis/campos-pessoa-natural.md`
- Campos Completos: `campos-completos/CERTIDAO_OBITO.md`
- Lei 6.015/1973: Lei de Registros Publicos
- Codigo Civil: Arts. 6 a 10 (morte), arts. 1.784 a 1.856 (sucessoes)
- Resolucao CNJ 35/2007: Inventario extrajudicial
