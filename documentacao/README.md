# Documentacao do Projeto

Esta pasta contem toda a documentacao do sistema de Minutas de Cartorio.

## Estrutura de Arquivos

```
documentacao/
├── README.md                           # Este arquivo (indice)
├── FONTE_DE_VERDADE.md                 # DOCUMENTO PRINCIPAL - Leia primeiro!
├── DOCUMENTACAO_SCHEMAS_PROMPTS.md     # Referencia tecnica de schemas e prompts
└── VALIDACAO_SETUP.md                  # Checklist de validacao do ambiente
```

## Como Usar Esta Documentacao

### Para Agentes de IA (Claude, GPT, etc.)

1. **Comece SEMPRE por**: `FONTE_DE_VERDADE.md`
   - Este e o documento central e autoritativo
   - Contem: arquitetura, pipeline, tipos de documentos, configuracoes
   - Em caso de conflito, este documento prevalece

2. **Para detalhes de schemas/prompts**: `DOCUMENTACAO_SCHEMAS_PROMPTS.md`
   - Especificacoes tecnicas de cada tipo de documento
   - Regras de extracao, validacoes, campos obrigatorios

3. **Para validar setup**: `VALIDACAO_SETUP.md`
   - Checklist de 10 etapas com comandos executaveis

### Para Humanos

1. **Entender o projeto**: `FONTE_DE_VERDADE.md`
2. **Configurar ambiente**: `VALIDACAO_SETUP.md`
3. **Detalhes tecnicos**: `DOCUMENTACAO_SCHEMAS_PROMPTS.md`

## Hierarquia de Documentos

```
Nivel 1 (Autoritativo):
└── FONTE_DE_VERDADE.md          # Referencia central

Nivel 2 (Detalhamento Tecnico):
├── DOCUMENTACAO_SCHEMAS_PROMPTS.md  # 14 tipos de documentos
└── VALIDACAO_SETUP.md               # Setup e validacao
```

## Manutencao

Ao fazer modificacoes no projeto:

1. **Atualize `FONTE_DE_VERDADE.md`** se a mudanca afetar:
   - Arquitetura do sistema
   - Pipeline de processamento
   - Tipos de documentos suportados
   - Configuracoes essenciais

2. **Atualize `DOCUMENTACAO_SCHEMAS_PROMPTS.md`** para:
   - Novos schemas ou prompts
   - Alteracoes em regras de extracao
   - Novos tipos de documentos

3. **Atualize `VALIDACAO_SETUP.md`** para:
   - Novas dependencias
   - Mudancas em variaveis de ambiente
   - Alteracoes no processo de setup

## Convencoes

- Todos os arquivos usam encoding UTF-8
- Markdown segue especificacao CommonMark
- Datas no formato: DD/MM/AAAA (documentos) ou YYYY-MM-DD (metadados)

---

**Ultima Atualizacao**: 2026-01-28
