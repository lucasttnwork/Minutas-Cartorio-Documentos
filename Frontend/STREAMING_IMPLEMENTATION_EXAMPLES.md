# Exemplos de Implementação - Componentes de Streaming

Guia prático para usar os componentes de streaming criados.

## Estrutura de Pastas

```
src/components/streaming/
├── StreamingText.tsx              # Componente base de typing animation
├── StreamingText.css              # Estilos do typing
├── ThinkingIndicator.tsx          # Indicador de pensamento/reasoning
├── ThinkingIndicator.css          # Estilos do thinking
├── TypingIndicator.tsx            # Indicador de carregamento (dots)
├── TypingIndicator.css            # Estilos do typing dots
├── StreamingChatMessage.tsx        # Componente completo de mensagem
├── StreamingChatMessage.css        # Estilos da mensagem
└── index.ts                        # Exports convenientes
```

---

## 1. Usando StreamingText (Básico)

```tsx
import React, { useState } from 'react';
import { StreamingText } from '@/components/streaming';

export function BasicStreamingExample() {
  const [isComplete, setIsComplete] = useState(false);

  return (
    <div>
      <StreamingText
        text="Este texto aparecerá caractere por caractere, como em um chat de IA..."
        speed={20}
        showCursor={true}
        isComplete={isComplete}
        onComplete={() => setIsComplete(true)}
      />
    </div>
  );
}
```

### Props do StreamingText

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `text` | string | - | Texto a ser exibido |
| `speed` | number | 20 | Velocidade em ms por caractere |
| `isComplete` | boolean | false | Se deve exibir texto completo imediatamente |
| `onComplete` | function | - | Callback quando texto termina |
| `showCursor` | boolean | true | Se mostra cursor piscante |
| `batchSize` | number | 1 | Caracteres por update (1 = char-by-char, 2+ = mais rápido) |

---

## 2. Usando ThinkingIndicator (Reasoning)

### Exemplo Simples

```tsx
import React, { useState } from 'react';
import { ThinkingIndicator } from '@/components/streaming';

export function ThinkingExample() {
  const [isThinking, setIsThinking] = useState(true);

  return (
    <ThinkingIndicator
      content="Analisando a pergunta... Planejando abordagem... Considerando diferentes perspectivas..."
      isStreaming={isThinking}
      isVisible={true}
      duration={3.5}
      onComplete={() => setIsThinking(false)}
    />
  );
}
```

### Exemplo Realista com Streaming

```tsx
import React, { useState, useEffect } from 'react';
import { ThinkingIndicator, StreamingText } from '@/components/streaming';

export function ThinkingWithStreamingResponse() {
  const [thinkingContent, setThinkingContent] = useState('');
  const [responseContent, setResponseContent] = useState('');
  const [phase, setPhase] = useState<'thinking' | 'responding' | 'complete'>('thinking');

  useEffect(() => {
    // Simular streaming de thinking (3 segundos)
    if (phase === 'thinking') {
      const thinkingText = 'Analisando requisição...\nConsiderando contexto...\nPlanejando resposta...';
      let idx = 0;

      const interval = setInterval(() => {
        if (idx < thinkingText.length) {
          setThinkingContent(thinkingText.slice(0, ++idx));
        } else {
          clearInterval(interval);
          setPhase('responding');
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [phase]);

  return (
    <div>
      {phase !== 'complete' && (
        <ThinkingIndicator
          content={thinkingContent}
          isStreaming={phase === 'thinking'}
          isVisible={true}
          duration={3}
          autoCollapse={true}
        />
      )}

      {phase !== 'thinking' && (
        <div style={{ marginTop: '1rem', paddingLeft: '1rem' }}>
          <h3>Resposta:</h3>
          <StreamingText
            text="Esta é a resposta gerada após o processo de reasoning. O modelo considerou vários aspectos antes de chegar a esta conclusão."
            speed={15}
            isComplete={phase === 'complete'}
            onComplete={() => setPhase('complete')}
          />
        </div>
      )}
    </div>
  );
}
```

### Props do ThinkingIndicator

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `content` | string | '' | Conteúdo do pensamento |
| `isVisible` | boolean | true | Se o componente é visível |
| `isStreaming` | boolean | false | Se ainda está pensando |
| `duration` | number | - | Duração total em segundos |
| `onComplete` | function | - | Callback ao completar |
| `autoCollapse` | boolean | true | Auto-fechar quando completo |

---

## 3. Usando StreamingChatMessage (Componente Completo)

### Exemplo Básico

```tsx
import React from 'react';
import { StreamingChatMessage } from '@/components/streaming';

export function ChatMessageExample() {
  return (
    <>
      {/* Mensagem do usuário */}
      <StreamingChatMessage
        id="user-1"
        role="user"
        content="Qual é a capital da França?"
      />

      {/* Resposta do assistente com streaming */}
      <StreamingChatMessage
        id="assistant-1"
        role="assistant"
        content="A capital da França é Paris, a maior cidade do país localizada no norte da região de Île-de-France."
        isStreaming={true}
      />
    </>
  );
}
```

### Exemplo com Thinking

```tsx
import React from 'react';
import { StreamingChatMessage } from '@/components/streaming';

export function ChatWithThinkingExample() {
  return (
    <StreamingChatMessage
      id="assistant-2"
      role="assistant"
      content="A questão requer análise de múltiplas variáveis. Considerando o contexto histórico, econômico e social..."
      thinking="Analisando a pergunta complexa...\nConsiderando diferentes perspectivas...\nOrganizando resposta estruturada..."
      isStreaming={true}
      thinkingDuration={2.5}
    />
  );
}
```

### Props do StreamingChatMessage

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `id` | string | - | ID único da mensagem |
| `role` | 'user' \| 'assistant' | - | Quem enviou a mensagem |
| `content` | string | - | Conteúdo da mensagem |
| `thinking` | string | - | Conteúdo do pensamento (opcional) |
| `isStreaming` | boolean | false | Se está fazendo streaming |
| `isComplete` | boolean | false | Se completou |
| `thinkingDuration` | number | - | Duração do thinking em segundos |
| `onComplete` | function | - | Callback ao completar |

---

## 4. Container Completo de Chat

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { StreamingChatMessage, TypingIndicator } from '@/components/streaming';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  thinkingDuration?: number;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Como posso ajudá-lo?',
      isComplete: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para o final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      isComplete: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simula resposta do servidor
    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      thinking: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simula thinking
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Atualiza thinking como completo
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === assistantId
          ? { ...msg, thinkingDuration: 2.0 }
          : msg
      )
    );

    // Simula streaming de resposta
    const responseText = 'Esta é uma resposta simulada que aparece como um stream de texto em tempo real.';
    let idx = 0;

    const streamInterval = setInterval(() => {
      if (idx < responseText.length) {
        idx++;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: responseText.slice(0, idx) }
              : msg
          )
        );
      } else {
        clearInterval(streamInterval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, isStreaming: false, isComplete: true }
              : msg
          )
        );
        setIsLoading(false);
      }
    }, 20);
  };

  return (
    <div className="chat-container-wrapper">
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((message) => (
          <StreamingChatMessage
            key={message.id}
            id={message.id}
            role={message.role}
            content={message.content}
            thinking={message.thinking}
            isStreaming={message.isStreaming || false}
            isComplete={message.isComplete || false}
            thinkingDuration={message.thinkingDuration}
          />
        ))}

        {isLoading && <TypingIndicator label="Processando..." />}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="chat-text-input"
        />
        <button type="submit" disabled={isLoading} className="chat-submit-btn">
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
```

### Estilos para ChatContainer

```css
.chat-container-wrapper {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fafafa;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-input-form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
  background-color: white;
}

.chat-text-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
}

.chat-text-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.chat-submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.chat-submit-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.chat-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

## 5. Integração com Vercel AI SDK

```tsx
import React, { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { StreamingChatMessage, TypingIndicator } from '@/components/streaming';

export function ChatWithVercelAI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      streamProtocol: 'text',
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="chat-container-wrapper">
      <div className="chat-messages" ref={scrollRef}>
        {messages.map((message) => (
          <StreamingChatMessage
            key={message.id}
            id={message.id}
            role={message.role as 'user' | 'assistant'}
            content={message.content}
            isStreaming={isLoading && message.role === 'assistant'}
            isComplete={!isLoading || message.role === 'user'}
          />
        ))}

        {isLoading && <TypingIndicator label="Gerando resposta..." />}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua pergunta..."
          disabled={isLoading}
          className="chat-text-input"
        />
        <button type="submit" disabled={isLoading} className="chat-submit-btn">
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
```

---

## 6. Exemplo de Markdown Streaming

```tsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StreamingText } from '@/components/streaming';

interface MarkdownStreamingProps {
  markdown: string;
  isStreaming: boolean;
}

export function MarkdownStreaming({ markdown, isStreaming }: MarkdownStreamingProps) {
  return (
    <div className="markdown-streaming">
      {isStreaming ? (
        // Mostrar como streaming
        <StreamingText
          text={markdown}
          speed={10}
          showCursor={true}
          batchSize={3}
        />
      ) : (
        // Renderizar como markdown completo
        <ReactMarkdown className="markdown-content">
          {markdown}
        </ReactMarkdown>
      )}
    </div>
  );
}
```

### CSS para Markdown Streaming

```css
.markdown-streaming {
  padding: 1rem;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.markdown-content {
  line-height: 1.6;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content code {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.08);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}
```

---

## 7. Performance Optimization

### Usar batchSize para Performance

```tsx
// Para velocidade normal
<StreamingText text={longText} speed={15} batchSize={1} />

// Para mais suave (menos updates)
<StreamingText text={longText} speed={30} batchSize={5} />

// Para muito rápido
<StreamingText text={longText} speed={5} batchSize={10} />
```

### Memoizar Componentes Streaming

```tsx
import { memo } from 'react';
import { StreamingChatMessage } from '@/components/streaming';

const MemoizedChatMessage = memo(StreamingChatMessage, (prevProps, nextProps) => {
  // Rerender apenas se role, id, ou isStreaming mudarem
  return (
    prevProps.role === nextProps.role &&
    prevProps.id === nextProps.id &&
    prevProps.isStreaming === nextProps.isStreaming
  );
});
```

---

## 8. Checklist de Implementação

- [ ] Importar componentes em seu projeto
- [ ] Criar pasta `/src/components/streaming/`
- [ ] Copiar arquivos `.tsx` e `.css`
- [ ] Testar `StreamingText` com texto simples
- [ ] Integrar `ThinkingIndicator` para reasoning
- [ ] Criar chat container completo
- [ ] Testar com dados reais do API
- [ ] Otimizar performance com memoization
- [ ] Verificar accessibility (a11y)
- [ ] Testar dark mode
- [ ] Testar responsividade mobile

---

## 9. Troubleshooting

### Texto não aparece piscando
- Verificar se `showCursor={true}`
- Verificar CSS do `.cursor`
- Verificar se browser suporta CSS animations

### Componente fica piscando
- Aumentar `speed` (ex: 30 em vez de 15)
- Usar `batchSize > 1` para menos updates
- Memoizar componente pai

### Thinking não expande/colapsa
- Verificar `isVisible={true}`
- Verificar se há `content`
- Verificar CSS da classe `.thinking-header`

### Performance ruim com mensagens longas
- Usar `batchSize={3}` ou maior
- Considerar virtualização com `react-window`
- Usar `memo()` em componentes

---

**Última atualização**: Janeiro 2026
**Versão de React**: 18+
