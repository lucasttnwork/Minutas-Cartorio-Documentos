# REVISÃO: CERTIDAO_NASCIMENTO.md

**Data**: 2026-01-30
**Status**: DIVERGÊNCIAS IDENTIFICADAS

---

## PROBLEMAS ENCONTRADOS

### 1. DIVERGÊNCIA: Estrutura de dados_catalogados

**Documentação**: Lista campos como strings simples
- `nome_registrado` (string)
- `local_nascimento` (string)

**Schema + Extração Real**: Usa objetos nested
- `nome_completo` (não `nome_registrado`)
- `local_nascimento.instituicao`, `local_nascimento.cidade`, `local_nascimento.estado`
- `filiacao.pai`, `filiacao.mae` (não `nome_pai`, `nome_mae`)
- `avos.paternos.avo`, `avos.paternos.avoa`, etc
- `cartorio.nome`, `cartorio.endereco`, etc
- `registro.livro`, `registro.folha`, `registro.termo`, `registro.data`
- `matricula.numero_completo`, `matricula.codigo_serventia`, etc

### 2. CAMPO AUSENTE: declarante

**Extração Real** inclui:
```json
"declarante": {
  "nome": "MUNIR AKAR AYUB",
  "relacao": "PAI"
}
```

**Documentação**: Não menciona este campo

### 3. CAMPO AUSENTE: instituicao_nascimento

**Extração Real** inclui `local_nascimento.instituicao` (Hospital e Maternidade)

**Documentação**: Menciona apenas como "Campos Raros" (seção 7.3), não na tabela principal

### 4. DIVERGÊNCIA: Regex de matricula

**Schema JSON** (linha 11):
```
\\d{6}\\.\\d{2}\\.\\d{2}\\.\\d{4}\\.\\d\\.\\d{5}\\.\\d{3}\\.\\d{7}-\\d{2}
```

**Documentação MD** (linha 89):
```
\d{6}\s?\d{2}\s?\d{2}\s?\d{4}\s?\d\s?\d{5}\s?\d{3}\s?\d{7}-\d{2}
```

Usa `\.` (ponto) vs `\s?` (espaço opcional)

### 5. ESTRUTURA: matricula como objeto

**Extração Real** desmembra matricula em 8 subcampos:
- numero_completo, codigo_serventia, ano, tipo_livro, livro, folha, termo, digito_verificador

**Documentação**: Trata matricula como string única

### 6. CAMPO PRESENTE: averbacoes (array)

**Extração Real** inclui `"averbacoes": []`

**Documentação**: Menciona em "Averbações Possíveis" (seção 7.4) mas não lista como campo extraível

### 7. CAMPOS DE METADADOS

**Extração Real** inclui mas não documentados:
- `campos_legiveis` (array)
- `campos_ilegiveis` (array)
- `qualidade_imagem` (string)
- `confianca_extracao` (string)

**Documentação**: Exemplo inclui `confianca_extracao.geral`, `campos_alta_confianca`, `campos_media_confianca` (estrutura diferente)

---

## RESUMO

- **7 divergências estruturais** entre documentação e implementação real
- Schema e extração real estão alinhados
- Documentação MD está desatualizada
- Nomes de campos inconsistentes (nome_registrado vs nome_completo)
- Estrutura nested não documentada corretamente
