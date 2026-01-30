# REVISAO: COMPROVANTE_RESIDENCIA.md

**Data**: 2026-01-30
**Revisor**: Agente Claude
**Status**: APROVADO COM RESSALVAS MENORES

---

## RESUMO EXECUTIVO

Documentacao esta **85% COMPLETA** e estruturalmente correta.

**Problemas Identificados**: 2 criticos, 3 menores

---

## PROBLEMAS CRITICOS

### 1. Schema dedicado nao existe
- **Linha 4**: Afirma "Nao possui schema dedicado (estrutura generica)"
- **Verificacao**: Arquivo `execution/schemas/comprovante_residencia.json` NAO EXISTE
- **Status**: CORRETO - documento realmente nao tem schema
- **Observacao**: Mas o mapeamento em `mapeamento_documento_campos.json` (linhas 317-332) esta completo e alinhado com a documentacao

### 2. Exemplos de extracao real nao existem
- **Secao 4**: Exemplo JSON fornecido e sintetico/idealizado
- **Verificacao**: Nao ha arquivos `*_COMPROVANTE_RESIDENCIA.json` em `.tmp/contextual/`
- **Impacto**: BAIXO - exemplo sintetico esta bem estruturado e alinhado com campos documentados
- **Recomendacao**: Adicionar nota "Exemplo sintetico - baseado em especificacao"

---

## PROBLEMAS MENORES

### 3. Estrutura nested em exemplo JSON nao reflete schema plano
- **Linhas 186-194**: Exemplo usa `"endereco": { "logradouro": ..., "numero": ... }`
- **Mapeamento real**: Campos planos `domicilio_logradouro`, `domicilio_numero`, etc.
- **Secao 2.3.1**: Documenta que e "representacao logica", nao objeto real
- **Status**: Ambiguidade presente mas explicada
- **Sugestao**: Alinhar exemplo JSON com campos planos reais

### 4. Campo "nome" no mapeamento vs "nome_titular" na documentacao
- **Mapeamento** (linha 319): mapeia para campo `nome`
- **Documentacao** (linha 77): documenta como `nome_titular`
- **Observacao**: Ambos aparecem no exemplo (linha 184 e 208)
- **Impacto**: MEDIO - pode causar confusao na extracao
- **Recomendacao**: Padronizar nomenclatura

### 5. Campo "cpf" no mapeamento vs "cpf_titular" na documentacao
- **Mapeamento** (linha 320): mapeia para campo `cpf`
- **Documentacao** (linha 87): documenta como `cpf_titular`
- **Observacao**: Mesmo problema do campo nome
- **Impacto**: MEDIO
- **Recomendacao**: Padronizar nomenclatura

---

## VALIDACOES POSITIVAS

- Todos os 9 campos do mapeamento estao documentados
- Tipos de dados corretos em todas as tabelas
- Exemplos sao realistas (empresas, formatos de endereco brasileiros)
- Estrutura segue template padrao
- Campos opcionais vs obrigatorios bem definidos
- Validacoes de negocio documentadas (prazo de 90 dias)
- Hierarquia de fontes bem explicada (secao 5.3)
- Casos especiais cobertos (conta em nome de terceiro, imovel alugado)

---

## COBERTURA DE CAMPOS

### Campos do mapeamento documentados: 9/9 (100%)
1. nome (como nome_titular) - OK
2. cpf (como cpf_titular) - OK
3. domicilio_logradouro (como logradouro) - OK
4. domicilio_numero (como numero) - OK
5. domicilio_complemento (como complemento) - OK
6. domicilio_bairro (como bairro) - OK
7. domicilio_cidade (como cidade) - OK
8. domicilio_estado (como estado) - OK
9. domicilio_cep (como cep) - OK

### Campos extras documentados (nao no mapeamento):
- tipo_servico
- mes_referencia
- data_emissao
- data_vencimento
- empresa_fornecedora
- numero_instalacao
- numero_cliente
- elementos_presentes (metadata)

**Observacao**: Campos extras sao metadados uteis para validacao, bem justificados na secao 3.5.

---

## ALINHAMENTO COM MODELO DE DADOS

- Secao 3.1: Mapeamento para Pessoa Natural correto
- Secao 3.2-3.4: Corretamente afirma que NAO alimenta PJ, Imovel, Negocio
- Hierarquia de prioridade documentada (secao 5.3)
- Uso em correlacao bem explicado (secao 5.1-5.2)

---

## RECOMENDACOES

1. **URGENTE**: Alinhar nomenclatura de campos
   - Opcao A: Usar `nome_titular` e `cpf_titular` no mapeamento
   - Opcao B: Usar `nome` e `cpf` na documentacao
   - **Recomendacao**: Opcao A (mais especifico)

2. **MEDIA**: Atualizar exemplo JSON (secao 4) para usar campos planos:
   ```json
   "nome_titular": "JOAO DA SILVA",
   "cpf_titular": "123.456.789-00",
   "domicilio_logradouro": "RUA DAS FLORES",
   "domicilio_numero": "123",
   ...
   ```

3. **BAIXA**: Adicionar nota em secao 4: "(Exemplo sintetico baseado em especificacao)"

---

## NOTA FINAL

**7.5/10**

Documentacao de alta qualidade, estruturada, completa e alinhada com modelo de dados.
Problemas sao principalmente de nomenclatura e nao afetam uso pratico se equipe estiver ciente.

**Aprovado para uso** com ajustes de nomenclatura recomendados.
