# Design: Fluxo Completo do Sistema de Minutas

**Data:** 2026-01-30
**Status:** Validado

## Visão Geral

Sistema de criação de minutas para cartórios com fluxo de 9 páginas, desde o upload de documentos até a geração da minuta final editável.

## Fluxo de Páginas

| # | Página | Descrição |
|---|--------|-----------|
| 1 | Dashboard | Lista de minutas do usuário + botão "Nova Minuta" |
| 2 | Upload de Documentos | 5 seções de upload separadas |
| 3 | Processamento | Tela de loading enquanto IA analisa documentos |
| 4 | Conferência Polo Outorgante | Cards colapsáveis de PF e PJ |
| 5 | Conferência Polo Outorgado | Mesma estrutura do Outorgante |
| 6 | Conferência de Imóveis | Cards colapsáveis por imóvel |
| 7 | Parecer Jurídico | Campos read-only gerados pela IA |
| 8 | Negócio Jurídico | Cards colapsáveis (1 por imóvel) |
| 9 | Minuta Final | Editor rich-text + download PDF/DOCX |

---

## 1. Dashboard

Página inicial do sistema.

**Elementos:**
- Título do sistema
- Botão "+ Nova Minuta" → inicia fluxo no Upload
- Lista de minutas existentes do usuário

**Card de cada minuta:**
- Título/identificador
- Data de criação
- Status: Rascunho (amarelo) ou Concluída (verde)

**Comportamento:**
- Clicar em "Rascunho" → retoma da última página visitada
- Clicar em "Concluída" → abre na página Minuta Final
- Ordenação: mais recentes primeiro

---

## 2. Upload de Documentos

**5 seções de upload separadas:**
1. Documentos dos Outorgantes
2. Documentos dos Outorgados
3. Documentos dos Imóveis
4. Documentos do Negócio Jurídico
5. Demais Documentos

**Cada seção:**
- Área de drag & drop
- Seleção múltipla de arquivos
- Lista de arquivos enviados com preview/nome

**Ação:**
- Botão "Processar Documentos" → envia para análise da IA

**Identificação automática:**
- IA identifica automaticamente quantas pessoas/imóveis existem
- Usuário não precisa informar previamente

---

## 3. Tela de Processamento

Exibida enquanto a IA analisa os documentos.

**Elementos:**
- Indicador de progresso (ex: "Analisando documentos... 3 de 5")
- Animação de loading

**Comportamento:**
- Bloqueia navegação até conclusão
- Ao concluir, libera acesso às próximas páginas

---

## 4. Conferência Polo Outorgante

**Estrutura:**
- Título: "Conferência e Complementação - Polo Outorgante"
- Seção de Pessoas Naturais (se houver)
- Seção de Pessoas Jurídicas (se houver)

**Cards colapsáveis por pessoa:**
- Header: tipo (PF/PJ), nome/razão social, indicador de completude
- Conteúdo: todos os campos do formulário da pessoa
- Campos pré-preenchidos pela IA

**Ações:**
- "+ Adicionar Pessoa Natural"
- "+ Adicionar Pessoa Jurídica"
- Botão remover em cada card (com confirmação)

---

## 5. Conferência Polo Outorgado

**Estrutura idêntica ao Polo Outorgante.**

Mesmos componentes e comportamentos, porém com dados dos outorgados.

---

## 6. Conferência de Imóveis

**Estrutura:**
- Título: "Conferência e Complementação - Imóveis"
- Lista de imóveis em cards colapsáveis

**Card de cada imóvel:**
- Header: número/identificador, endereço resumido, indicador de completude
- Conteúdo: campos do formulário de imóvel

**Campos típicos:**
- Número de matrícula
- Cartório de registro
- Endereço completo
- Área total
- Confrontações
- Dados do registro anterior

**Ações:**
- "+ Adicionar Imóvel"
- Botão remover em cada card (com confirmação)

---

## 7. Parecer Jurídico

Página com campos **somente leitura**, gerados pela IA.

**Elementos:**

### Relatório da Matrícula
- Campo de texto grande (read-only)
- Análise detalhada gerada pela IA

### Matrícula Apta para Transmissão Imobiliária
- Duas opções: SIM / NÃO
- Highlight automático conforme parecer da IA
- Visual: SIM = verde, NÃO = vermelho/amarelo

### Pontos de Atenção e Diligências Necessárias
- Campo de texto grande (read-only)
- Lista de pontos identificados pela IA

---

## 8. Negócio Jurídico

**Regra:** Um negócio jurídico para cada imóvel do fluxo.

**Estrutura:**
- Título: "Conferência e Complementação - Negócio Jurídico"
- Lista de negócios em cards colapsáveis
- Quantidade de cards = quantidade de imóveis

**Card de cada negócio:**
- Header: identificador, imóvel vinculado (ex: "Imóvel 1 - Rua X, nº 123")
- Conteúdo: campos do formulário de negócio jurídico

**Campos típicos:**
- Tipo de ato (compra e venda, doação, permuta, etc.)
- Valor do negócio
- Forma de pagamento
- Condições especiais
- Cláusulas adicionais

---

## 9. Minuta Final

Última página do fluxo.

**Elementos:**

### Editor Rich-Text
- Texto completo da minuta gerado pela IA
- Totalmente editável pelo usuário
- Formatação básica: negrito, itálico, sublinhado, listas
- Auto-save durante edição

### Botões de Download
- "Baixar PDF" - exporta versão atual em PDF
- "Baixar DOCX" - exporta versão atual em Word

### Ação Final
- "Concluir Minuta" - muda status para "Concluída" e volta ao Dashboard

---

## Decisões de UX

### Campos Pré-preenchidos
- IA preenche campos automaticamente a partir dos documentos
- Todos os campos são editáveis pelo usuário

### Destaque Visual para Edições
- Campos preenchidos pela IA: estilo normal
- Campos editados pelo usuário: borda azul ou fundo diferenciado
- Permite auditoria e rastreabilidade

### Navegação
- Fluxo linear com possibilidade de skip
- Progress stepper no topo mostrando etapa atual
- Botões "Voltar" e "Próximo" no rodapé
- Pode pular páginas e voltar depois

### Auto-save
- Cada campo salva automaticamente ao perder foco
- Estilo Google Docs
- Evita perda de dados

### Status de Minuta
- Rascunho: em andamento
- Concluída: fluxo finalizado

### Usuário
- Cada minuta pertence a um único usuário
- Apenas o dono acessa sua minuta

---

## Componentes Necessários

### CollapsibleCard
- Header clicável com seta de expansão
- Indicador de completude
- Título dinâmico

### Campo com Destaque de Edição
- Estado normal: preenchido pela IA
- Estado editado: borda azul + indicador visual
- Tooltip: "Campo alterado pelo usuário"

### Progress Stepper
- Etapas: Upload → Outorgantes → Outorgados → Imóveis → Parecer → Negócio → Minuta
- Indica etapa atual e concluídas
- Clicável para navegação

### Editor Rich-Text
- Sugestão: TipTap ou React-Quill
- Toolbar: negrito, itálico, sublinhado, listas
- Auto-save integrado

### Upload com Seções
- Drag & drop por seção
- Preview/lista de arquivos
- Múltiplos arquivos por seção

---

## Arquitetura de Rotas (sugestão)

```
/                         → Dashboard
/minuta/nova              → Upload de Documentos
/minuta/:id/processando   → Tela de Processamento
/minuta/:id/outorgantes   → Conferência Polo Outorgante
/minuta/:id/outorgados    → Conferência Polo Outorgado
/minuta/:id/imoveis       → Conferência de Imóveis
/minuta/:id/parecer       → Parecer Jurídico
/minuta/:id/negocio       → Negócio Jurídico
/minuta/:id/minuta        → Minuta Final (Editor)
```

---

## Próximos Passos

1. Criar estrutura de rotas
2. Implementar Dashboard com lista de minutas
3. Refatorar página de Upload com 5 seções
4. Criar componente CollapsibleCard reutilizável
5. Unificar páginas PessoaNatural e PessoaJuridica em Conferência de Polo
6. Implementar página de Parecer Jurídico
7. Adaptar página de Negócio Jurídico para múltiplos negócios
8. Implementar Editor da Minuta Final
9. Integrar com backend/IA (futuro)
