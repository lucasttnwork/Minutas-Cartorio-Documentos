# Padrões de Design Visual - Streaming UI/UX

Análise dos padrões usados por ChatGPT, Gemini, Claude e melhores práticas.

---

## 1. Comparação de Padrões por Plataforma

### ChatGPT (OpenAI)

**Características:**
- Typing animation rápida (~15ms por caractere)
- Cursor não muito visível
- Thinking colapsado por padrão
- Transições suaves entre mensagens
- Dark mode elegante
- Sem indicadores visuais durante thinking

**CSS Pattern:**
```css
.streaming-text {
  speed: 15ms;
  cursor: thin-line;
  opacity: 0.95;
  line-height: 1.6;
}
```

**Exemplo Visual:**
```
┌─────────────────────────────────┐
│ User: What is AI?               │
│                                 │
│ AI is artificial intelligence...|
│ ↑ typing fast                   │
└─────────────────────────────────┘
```

---

### Gemini (Google)

**Características:**
- Fade-in por palavra (não caractere)
- Thinking expandível sempre visível
- Estrutura clara com bullet points
- Scroll do thinking enquanto digita
- Suporte a rich formatting
- Color-coded sections

**CSS Pattern:**
```css
.fade-in-word {
  animation: fadeIn 0.3s ease-out;
  animation-delay: calc(var(--word-index) * 50ms);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Exemplo Visual:**
```
┌─────────────────────────────────┐
│ ▼ Thinking for 3 seconds        │
│   • Analyzing question          │
│   • Considering options         │
│   • Formulating response        │
│                                 │
│ Artificial Intelligence is a   │
│ field of computer science that  │
│ [continues...]                  │
└─────────────────────────────────┘
```

---

### Claude (Anthropic)

**Características:**
- Thinking escondido por padrão
- Componente expandable/collapsible
- Shimmer effect durante streaming
- Mostra "Thought for Xs"
- Mais conservador visualmente
- Foco no conteúdo, não na animação

**CSS Pattern:**
```css
.thinking-indicator {
  display: collapsible;
  state: closed-by-default;
  animation: shimmer 1.5s infinite;
  auto-collapse-on-complete: true;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Exemplo Visual:**
```
┌─────────────────────────────────┐
│ ▶ Thought for 2.5s              │
│                                 │
│ Artificial Intelligence refers  │
│ to the simulation of human      │
│ intelligence processes...       │
└─────────────────────────────────┘
```

---

## 2. Padrões de Animação Recomendados

### Padrão 1: Character-by-Character (ChatGPT Style)

**Quando usar:** Textos curtos, chat casual, máxima sensação de "digitação"

```tsx
<StreamingText
  text={content}
  speed={15}
  batchSize={1}
  showCursor={true}
/>
```

**Velocidades:**
- Muito rápido (robótico): 5-10ms
- Rápido (natural): 15-25ms
- Lento (pensativo): 30-50ms

**Vantagens:**
- Sensação realista de digitação
- Mantém usuário engajado
- Mostra atividade em tempo real

**Desvantagens:**
- Mais CPU/re-renders
- Pode parecer lento para textos longos
- Requer cursor visível

---

### Padrão 2: Word-by-Word (Gemini Style)

**Quando usar:** Textos longos, documentos, melhor performance

```tsx
function WordByWord({ text }: { text: string }) {
  const words = text.split(' ');
  const [displayedWords, setDisplayedWords] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplayedWords(prev => Math.min(prev + 1, words.length));
    }, 100);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span>
      {words.slice(0, displayedWords).join(' ')}
      {displayedWords < words.length && <span className="cursor" />}
    </span>
  );
}
```

**Velocidades:**
- Rápido: 50-75ms por palavra
- Normal: 100-150ms por palavra
- Lento: 200-300ms por palavra

**Vantagens:**
- Melhor performance
- Mais natural para leitura
- Menos re-renders

**Desvantagens:**
- Menos sensação de "digitação"
- Pula palavras inteiras

---

### Padrão 3: Batch Characters (Hybrid)

**Quando usar:** Equilíbrio entre performance e animação

```tsx
<StreamingText
  text={content}
  speed={20}
  batchSize={3}
  showCursor={true}
/>
```

**Configurações:**
- Leve: batchSize={1-2}, speed={15-20}
- Normal: batchSize={3-5}, speed={20-30}
- Pesado: batchSize={8-10}, speed={10-20}

**Vantagens:**
- Bom balanço performance/animação
- Requer menos re-renders
- Ainda parece natural

---

## 3. Padrões de Thinking/Reasoning

### Padrão 1: Hidden by Default (Claude)

```tsx
<ThinkingIndicator
  content={thinking}
  isVisible={true}
  isStreaming={isThinking}
  autoCollapse={true}
/>
```

**UX:**
```
Usuário vê: ▶ Thought for 2.3s
Clica:      ▼ Pensamento expandido
```

**Quando usar:**
- Não quer distrair usuário
- Thinking é longo/complexo
- Foco deve ser na resposta

---

### Padrão 2: Always Visible (Gemini)

```tsx
<ThinkingIndicator
  content={thinking}
  isVisible={true}
  isStreaming={isThinking}
  autoCollapse={false}
/>
```

**UX:**
```
Usuário vê: ▼ Thinking (sempre expandido)
Scrolls:    Vê thinking enquanto digita
```

**Quando usar:**
- Quer transparência máxima
- Thinking é interessante
- Usuários gostam de ver processo

---

### Padrão 3: Minimal (ChatGPT o3)

```tsx
// Não mostra thinking, apenas resultado
<StreamingText text={response} />
```

**UX:**
```
Usuário vê: Resposta diretamente
Sem thinking
```

**Quando usar:**
- Thinking é rápido
- Quer interface limpa
- Foco em resultado

---

## 4. Padrões de Status Visual

### Typing Indicator (Esperando Resposta)

```tsx
<TypingIndicator
  isVisible={isLoading}
  size="medium"
  label="Pensando..."
/>
```

**Visual:**
```
● ● ●  (dots pulsando)
```

**Configurações:**
```css
.typing-indicator {
  gap: 0.4rem;          /* small: 0.25rem */
  animation-duration: 1.4s;
  bounce-height: 6px;
}
```

---

### Shimmer Effect (Durante Streaming)

```css
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(0,0,0,0.2) 0%,
    rgba(0,0,0,0.5) 50%,
    rgba(0,0,0,0.2) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 5. Padrões de Transição

### Mensagem Entra

```css
@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message {
  animation: slideInMessage 0.3s ease-out;
}
```

---

### Thinking Expande

```css
@keyframes expandContent {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.thinking-content {
  animation: expandContent 0.3s ease-out;
}
```

---

### Cursor Pisca

```css
@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

.cursor {
  animation: blink 1s step-end infinite;
}
```

---

## 6. Color Schemes Recomendados

### Light Mode (Padrão)

```css
/* Mensagem do Usuário */
.message-user {
  background-color: #007bff;
  color: white;
  border-radius: 12px 12px 4px 12px;
}

/* Mensagem do Assistente */
.message-assistant {
  background-color: rgba(0, 0, 0, 0.05);
  color: inherit;
  border-radius: 12px 12px 12px 4px;
}

/* Thinking */
.thinking-indicator {
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Status */
.cursor {
  background-color: currentColor;
}

.complete-indicator {
  color: #10b981;
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  .message-user {
    background-color: #0056b3;
    color: white;
  }

  .message-assistant {
    background-color: rgba(255, 255, 255, 0.1);
    color: inherit;
  }

  .thinking-indicator {
    background-color: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .cursor {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
```

---

## 7. Layout Patterns

### Chat Layout (Coluna)

```
┌──────────────────────────────────┐
│         Chat Header              │
├──────────────────────────────────┤
│                                  │
│  👤 User: Como usar?             │
│                                  │
│  🤖 ▼ Thinking...               │
│  🤖 Use da seguinte forma:|      │
│                                  │
│  👤 Obrigado!                    │
│                                  │
├──────────────────────────────────┤
│  Input: [            ] [Enviar] │
└──────────────────────────────────┘
```

### Split Layout (Lado a Lado)

```
┌──────────────┬──────────────────┐
│   Thinking   │    Response      │
├──────────────┼──────────────────┤
│ • Analyzing  │ The answer is    │
│ • Planning   │ complex because  │
│ • Consider.. │ of several...    │
└──────────────┴──────────────────┘
```

---

## 8. Mobile Responsiveness

### Adjustments for Small Screens

```css
@media (max-width: 640px) {
  /* Reduzir padding */
  .message-content {
    padding: 0.6rem 0.75rem;
    font-size: 0.95rem;
  }

  /* Cursor menor */
  .cursor {
    width: 1.5px;
  }

  /* Thinking simplificado */
  .thinking-header {
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
  }

  /* Fullwidth messages */
  .message-body {
    max-width: 95%;
  }
}
```

---

## 9. Accessibility Patterns

### Screen Reader Support

```tsx
<ThinkingIndicator
  role="region"
  aria-label="AI thinking process"
  aria-live="polite"
  aria-expanded={isExpanded}
/>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .cursor,
  .typing-indicator,
  .shimmer {
    animation: none;
  }

  .chat-message {
    animation: none;
  }
}
```

### Focus Management

```css
.thinking-header:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

---

## 10. Performance Patterns

### Memoization

```tsx
import { memo } from 'react';

const MemoMessage = memo(
  StreamingChatMessage,
  (prev, next) =>
    prev.id === next.id &&
    prev.role === next.role &&
    prev.isStreaming === next.isStreaming
);
```

### Virtualization

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <StreamingChatMessage {...messages[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 11. Checklist de Design

### Visual Polish
- [ ] Typing speed soa natural (15-25ms)
- [ ] Cursor é visível e pisca suavemente
- [ ] Transições são suaves (300ms)
- [ ] Cores têm contraste adequado
- [ ] Dark mode implementado

### UX
- [ ] Thinking é expandable/collapsible
- [ ] Auto-scroll para mensagens novas
- [ ] Botão Stop/Cancel visível
- [ ] Status é claro (digitando, pronto)
- [ ] Sem "flashs" ou "jumps"

### Performance
- [ ] Smooth 60fps
- [ ] Batch size adequado (3-5)
- [ ] Componentes memoizados
- [ ] Sem re-renders desnecessários
- [ ] Funciona em mobile

### Accessibility
- [ ] Screen reader support
- [ ] Respects prefers-reduced-motion
- [ ] Keyboard navigation
- [ ] Contrast ratio 4.5:1 para texto
- [ ] Focus indicators visíveis

---

## Resumo Rápido

| Aspecto | ChatGPT | Gemini | Claude |
|---------|---------|--------|--------|
| Typing | Char (15ms) | Word (100ms) | Char (20ms) |
| Thinking | Colapsado | Expandido | Colapsado |
| Animação | Subtil | Vibrante | Mínimal |
| Foco | Resposta | Processo | Eficiência |

---

**Última atualização**: Janeiro 2026
**Baseado em**: Análise de ChatGPT, Gemini 2.0, Claude 3.7
