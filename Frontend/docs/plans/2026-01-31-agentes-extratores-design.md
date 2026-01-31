# Design: Agentes Extratores de Documentos

**Data:** 2026-01-31
**Status:** Aprovado para implementação

## Visão Geral

Nova feature que adiciona um sistema de agentes especializados em extração de dados de documentos. Os usuários poderão escolher entre o fluxo tradicional de criação de minutas ou utilizar agentes de IA para extrair informações de documentos específicos.

## Estrutura de Navegação

### Hub com Sidebar

O Dashboard atual será transformado em um "Hub" com duas visões controladas por uma sidebar fixa:

```
┌──────────────┬────────────────────────────────────────────┐
│   SIDEBAR    │           ÁREA DE CONTEÚDO                 │
│              │                                            │
│  ┌────────┐  │  Muda conforme seleção na sidebar:         │
│  │Minutas │  │                                            │
│  └────────┘  │  • "Minutas" → Dashboard de minutas        │
│              │  • "Agentes" → Dashboard de agentes        │
│  ┌────────┐  │                                            │
│  │Agentes │  │                                            │
│  └────────┘  │                                            │
└──────────────┴────────────────────────────────────────────┘
```

**Comportamento:**
- Sidebar visível apenas na estrutura de hub
- Ao entrar no fluxo de minuta ou página de um agente, sidebar desaparece
- Navegação de volta via breadcrumb + botão voltar

**Rotas:**
- `/dashboard` → Redirect para `/dashboard/minutas`
- `/dashboard/minutas` → Dashboard de minutas (atual)
- `/dashboard/agentes` → Dashboard de agentes (novo)
- `/agentes/:tipo` → Página individual do agente

## Dashboard de Agentes

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Todos] [Pessoais] [Imobiliários] [Empresariais]    🔍 Buscar  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   [IMG]     │  │   [IMG]     │  │   [IMG]     │             │
│  │   Título    │  │   Título    │  │   Título    │             │
│  │  Descrição  │  │  Descrição  │  │  Descrição  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Categorias e Agentes

| Categoria | Agentes |
|-----------|---------|
| **Pessoais** | RG, CNH, Certidão de Casamento, Certidão de Nascimento |
| **Imobiliários** | Matrícula do Imóvel, ITBI, IPTU, Escritura, Compromisso de Compra e Venda |
| **Empresariais** | Contrato Social, CNDT |

### Card do Agente

- Imagem/ícone representativo
- Título do agente
- Descrição curta do que extrai
- Hover com efeito visual (elevação/destaque)
- Clique navega para página do agente

### Filtros

- Tabs para categoria (Todos, Pessoais, Imobiliários, Empresariais)
- Campo de busca filtra por nome em tempo real

## Página do Agente

### Layout em Duas Colunas

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Voltar    Agentes > Extrator de RG                               │
├───────────────────────┬─────────────────────────────────────────────┤
│                       │                                             │
│  EXTRATOR DE RG       │                                             │
│  Extrai dados de      │                                             │
│  documentos RG        │         RESULTADO DA ANÁLISE                │
│                       │                                             │
├───────────────────────┤    ┌─────┬─────┬─────┐                      │
│                       │    │Copiar│DOCX │ PDF │ ⛶ Expandir          │
│  📄 Arraste arquivos  │    └─────┴─────┴─────┘                      │
│     ou clique aqui    │                                             │
│  (múltiplos aceitos)  │    Documento renderizado                    │
│                       │    estilo Word/Docs                         │
├───────────────────────┤                                             │
│                       │    (streaming em tempo real)                │
│  Instruções extras    │                                             │
│  (opcional)           │                                             │
│                       │                                             │
├───────────────────────┤                                             │
│  [    ANALISAR    ]   │                                             │
└───────────────────────┴─────────────────────────────────────────────┘
```

### Estados do Fluxo

| Estado | Botão Principal | Upload | Área de Resultado |
|--------|----------------|--------|-------------------|
| **Inicial** | `ANALISAR` (desabilitado até ter arquivo) | Editável | Vazio ou placeholder |
| **Durante streaming** | `PARAR` + spinner | Travado | Texto aparecendo em tempo real |
| **Concluído** | `GERAR NOVAMENTE` + `Novo Documento` | Travado, exibe arquivos | Documento completo com ações |

### Ações no Resultado

- **Copiar** - Copia conteúdo para clipboard
- **Download DOCX** - Baixa documento Word
- **Download PDF** - Baixa documento PDF
- **Expandir** - Abre modal em tela cheia

## Componentes e Interações

### Upload de Documentos

- Zona de drag-and-drop com visual claro
- Aceita múltiplos arquivos simultaneamente
- Formatos: PDF, imagens (JPG, PNG), DOCX
- Lista de arquivos com opção de remover (antes de analisar)
- Após análise: lista travada, apenas visualização

### Campo de Instruções Extras

- Textarea expansível
- Placeholder: "Instruções adicionais para a extração (opcional)"
- Permanece editável após análise (para refinar e gerar novamente)

### Área de Resultado

- Estado vazio: ilustração ou texto placeholder
- Durante streaming: cursor piscando, texto progressivo
- Renderização estilo documento formal (fontes, espaçamento)
- Scroll interno quando exceder área

### Modal de Expansão

- Documento ocupa toda a tela
- Barra superior: título, botões de ação, fechar
- Fundo escurecido (overlay)

### Feedback Visual

- Toast de sucesso ao copiar
- Toast de sucesso ao baixar
- Loading spinner durante geração de arquivos

## Estrutura Técnica

### Novos Arquivos

```
src/
├── pages/
│   ├── DashboardHub.tsx          # Página hub com sidebar
│   ├── DashboardMinutas.tsx      # Dashboard atual refatorado
│   ├── DashboardAgentes.tsx      # Dashboard de agentes
│   └── AgenteExtrator.tsx        # Página individual do agente
├── components/
│   ├── layout/
│   │   └── HubSidebar.tsx        # Sidebar do hub
│   ├── agentes/
│   │   ├── AgenteCard.tsx        # Card do agente
│   │   ├── AgenteFilter.tsx      # Tabs + busca
│   │   ├── UploadZone.tsx        # Zona de upload
│   │   ├── ResultadoAnalise.tsx  # Área de resultado
│   │   └── ResultadoModal.tsx    # Modal tela cheia
├── data/
│   └── agentes.ts                # Definição dos 11 agentes
└── types/
    └── agente.ts                 # Tipos TypeScript
```

### Mock (Frontend sem Backend)

- Botão "Analisar" simula delay de 2-3 segundos
- Streaming simulado: texto aparece por chunks
- Texto mock pré-definido para cada tipo de agente
- Downloads geram arquivos reais (bibliotecas `docx` e `jspdf`)

## Fora do Escopo (Fase Futura)

- Backend/API real
- Integração com SDK de IA (streaming real)
- OCR real dos documentos
- Persistência de histórico de análises

## Dependências Sugeridas

- `docx` - Geração de arquivos Word
- `jspdf` ou `@react-pdf/renderer` - Geração de PDF
- Componentes Radix UI existentes
