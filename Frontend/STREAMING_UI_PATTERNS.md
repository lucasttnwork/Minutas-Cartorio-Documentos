# Padrões UI/UX para Streaming de Texto em Aplicações de IA

Guia completo sobre como implementar animações de streaming de texto, indicadores de thinking/reasoning, e melhores práticas de UX para chat com IA, baseado em análise de padrões usados por ChatGPT, Gemini, Claude e outras plataformas.

---

## 1. Animação de Typing Effect com Cursor Piscando

### 1.1 CSS Puro - Blinking Cursor

A forma mais simples e performática de criar um cursor piscando é usar CSS keyframes:

```css
/* Container do texto com cursor */
.text-with-cursor {
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Cursor piscante */
.cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  margin-left: 2px;
  background-color: currentColor;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

/* Versão com caractere "|" */
.cursor-char::after {
  content: '|';
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}
```

### 1.2 React + TypeScript - Typing Animation com Cursor

```tsx
// StreamingText.tsx
import React, { useState, useEffect } from 'react';
import './StreamingText.css';

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  isComplete?: boolean;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 20,
  isComplete = false,
  onComplete,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [typing, setTyping] = useState(!isComplete);

  useEffect(() => {
    if (isComplete) {
      setDisplayedText(text);
      setTyping(false);
      onComplete?.();
      return;
    }

    if (displayedText.length === text.length) {
      setTyping(false);
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed, isComplete, onComplete]);

  return (
    <div className="streaming-text">
      <span>{displayedText}</span>
      {typing && showCursor && <span className="cursor" />}
    </div>
  );
};

export default StreamingText;
```

### 1.3 CSS para StreamingText

```css
/* StreamingText.css */
.streaming-text {
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

.streaming-text .cursor {
  display: inline-block;
  width: 2px;
  height: 1.2em;
  margin-left: 2px;
  background-color: currentColor;
  animation: blink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}
```

---

## 2. Streaming de Markdown em Tempo Real

### 2.1 Usando Streamdown (Recomendado)

Streamdown é otimizado para renderizar Markdown incompleto durante streaming:

```tsx
// ChatMessage.tsx
import React from 'react';
import { Streamdown } from 'streamdown';
import { code, mermaid, math, cjk } from '@streamdown/plugin-*';
import 'streamdown/dist/styles.css';

interface ChatMessageProps {
  content: string;
  isStreaming: boolean;
  role: 'user' | 'assistant';
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isStreaming,
  role,
}) => {
  return (
    <div className={`message message-${role}`}>
      {role === 'assistant' ? (
        <Streamdown
          plugins={{ code, mermaid, math, cjk }}
          isAnimating={isStreaming}
          className="message-content"
        >
          {content}
        </Streamdown>
      ) : (
        <p className="message-content">{content}</p>
      )}
      {isStreaming && <StreamingIndicator />}
    </div>
  );
};

// Instalação: npm install streamdown @streamdown/plugin-code @streamdown/plugin-mermaid
```

### 2.2 Com React Markdown + Custom Animation

```tsx
// AnimatedMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AnimatedMarkdownProps {
  content: string;
  isStreaming: boolean;
}

export const AnimatedMarkdown: React.FC<AnimatedMarkdownProps> = ({
  content,
  isStreaming,
}) => {
  return (
    <ReactMarkdown
      className={`markdown-content ${isStreaming ? 'streaming' : 'complete'}`}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={nord}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
```

### 2.3 CSS para Markdown Streaming

```css
/* markdown-streaming.css */
.markdown-content {
  line-height: 1.6;
  color: inherit;
}

.markdown-content.streaming {
  /* Soft glow effect durante streaming */
  animation: streaming-glow 2s ease-in-out infinite;
}

@keyframes streaming-glow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.95;
  }
}

/* Código com highlighting */
.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
}

/* Links com hover suave */
.markdown-content a {
  color: #0066cc;
  text-decoration: none;
  transition: color 0.2s ease;
}

.markdown-content a:hover {
  color: #0052a3;
  text-decoration: underline;
}
```

---

## 3. Indicadores de "Thinking" / "Reasoning"

### 3.1 Componente Expandable Thinking (Como Claude)

```tsx
// ThinkingIndicator.tsx
import React, { useState } from 'react';
import './ThinkingIndicator.css';

interface ThinkingIndicatorProps {
  content: string;
  isVisible?: boolean;
  duration?: number; // em segundos
  onComplete?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  content,
  isVisible = true,
  duration,
  onComplete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isThinking, setIsThinking] = useState(isVisible);

  React.useEffect(() => {
    if (!isVisible && duration) {
      const timer = setTimeout(() => {
        setIsThinking(false);
        onComplete?.();
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`thinking-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="thinking-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="thinking-icon">
          {isThinking ? (
            <Shimmer />
          ) : (
            <CheckIcon />
          )}
        </span>
        <span className="thinking-label">
          {isThinking ? 'Pensando...' : `Pensou por ${duration}s`}
        </span>
        <span className="thinking-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="thinking-content">
          {content}
        </div>
      )}
    </div>
  );
};

// Shimmer Component para animação durante thinking
const Shimmer: React.FC = () => (
  <div className="shimmer">
    <div className="shimmer-bar" />
  </div>
);

const CheckIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
  </svg>
);
```

### 3.2 CSS para Thinking Indicator

```css
/* ThinkingIndicator.css */
.thinking-container {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 1rem 0;
  background-color: rgba(0, 0, 0, 0.02);
  overflow: hidden;
  transition: all 0.3s ease;
}

.thinking-header {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: inherit;
  transition: background-color 0.2s ease;
}

.thinking-header:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.thinking-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.thinking-label {
  flex: 1;
  text-align: left;
  font-weight: 500;
}

.thinking-toggle {
  color: rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease;
}

.thinking-container.expanded .thinking-toggle {
  transform: rotate(0deg);
}

.thinking-content {
  padding: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.01);
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.7);
}

/* Shimmer Animation */
.shimmer {
  width: 20px;
  height: 20px;
  position: relative;
  border-radius: 50%;
}

.shimmer-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.2) 25%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 3.3 Padrão com Streaming do Thinking

```tsx
// ThinkingStreamingMessage.tsx
import React, { useState, useEffect } from 'react';
import { ThinkingIndicator } from './ThinkingIndicator';
import { AnimatedMarkdown } from './AnimatedMarkdown';

interface MessagePart {
  type: 'thinking' | 'response';
  content: string;
  isStreaming?: boolean;
}

interface ThinkingStreamingMessageProps {
  parts: MessagePart[];
  isComplete: boolean;
}

export const ThinkingStreamingMessage: React.FC<ThinkingStreamingMessageProps> = ({
  parts,
  isComplete,
}) => {
  const thinkingPart = parts.find(p => p.type === 'thinking');
  const responsePart = parts.find(p => p.type === 'response');

  return (
    <div className="thinking-streaming-message">
      {thinkingPart && (
        <ThinkingIndicator
          content={thinkingPart.content}
          isVisible={!isComplete || (isComplete && thinkingPart.content)}
          onComplete={() => {}}
        />
      )}

      {responsePart && (
        <AnimatedMarkdown
          content={responsePart.content}
          isStreaming={responsePart.isStreaming || false}
        />
      )}
    </div>
  );
};
```

---

## 4. Padrões de Animação em Cascata

### 4.1 Word-by-Word vs Character-by-Character

```tsx
// StreamingTextAdvanced.tsx
import React, { useState, useEffect } from 'react';

type StreamingMode = 'char' | 'word';

interface StreamingTextAdvancedProps {
  text: string;
  mode?: StreamingMode;
  speed?: number;
  showCursor?: boolean;
}

export const StreamingTextAdvanced: React.FC<StreamingTextAdvancedProps> = ({
  text,
  mode = 'word',
  speed = 30,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (displayedText === text) {
      setIsTyping(false);
      return;
    }

    let currentIndex = displayedText.length;
    let nextIndex = currentIndex;

    if (mode === 'word') {
      // Encontrar próxima palavra
      const remaining = text.slice(currentIndex);
      const spaceIndex = remaining.indexOf(' ');
      nextIndex = spaceIndex === -1
        ? text.length
        : currentIndex + spaceIndex + 1;
    } else {
      // character-by-character
      nextIndex = currentIndex + 1;
    }

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, nextIndex));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, mode, speed]);

  return (
    <span className="streaming-text">
      {displayedText}
      {isTyping && showCursor && <span className="cursor" />}
    </span>
  );
};
```

### 4.2 Fade-in por Palavra (Estilo Gemini)

```tsx
// FadeInWord.tsx
import React from 'react';
import './FadeInWord.css';

interface FadeInWordProps {
  words: string[];
  delay?: number; // delay entre palavras em ms
}

export const FadeInWord: React.FC<FadeInWordProps> = ({ words, delay = 50 }) => {
  return (
    <div className="fade-in-words">
      {words.map((word, index) => (
        <span
          key={index}
          className="fade-in-word"
          style={{
            animationDelay: `${index * delay}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
};
```

### 3.3 CSS para Fade-in Words

```css
/* FadeInWord.css */
.fade-in-words {
  display: inline;
}

.fade-in-word {
  display: inline-block;
  animation: fadeInWord 0.4s ease-out forwards;
  margin-right: 0.25em;
}

@keyframes fadeInWord {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 5. Componente Completo de Chat com Streaming

```tsx
// StreamingChatMessage.tsx
import React from 'react';
import { StreamingText } from './StreamingText';
import { ThinkingIndicator } from './ThinkingIndicator';
import { AnimatedMarkdown } from './AnimatedMarkdown';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  isStreaming?: boolean;
  isComplete?: boolean;
  thinkingDuration?: number;
}

export const StreamingChatMessage: React.FC<ChatMessageProps> = ({
  id,
  role,
  content,
  thinking,
  isStreaming = false,
  isComplete = false,
  thinkingDuration,
}) => {
  return (
    <div
      className={`chat-message chat-message-${role}`}
      data-message-id={id}
    >
      {/* Thinking Block */}
      {thinking && (
        <ThinkingIndicator
          content={thinking}
          isVisible={isStreaming || isComplete}
          duration={thinkingDuration}
        />
      )}

      {/* Main Content */}
      <div className="chat-message-content">
        {role === 'user' ? (
          <p>{content}</p>
        ) : (
          <>
            {isStreaming ? (
              <StreamingText
                text={content}
                speed={15}
                showCursor={true}
              />
            ) : (
              <AnimatedMarkdown
                content={content}
                isStreaming={false}
              />
            )}
          </>
        )}
      </div>

      {/* Status Indicator */}
      {isStreaming && (
        <div className="message-status">
          <TypingIndicator />
        </div>
      )}
    </div>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC = () => (
  <div className="typing-indicator">
    <span></span>
    <span></span>
    <span></span>
  </div>
);
```

### 5.2 CSS para Chat Message

```css
/* StreamingChatMessage.css */
.chat-message {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  animation: slideInMessage 0.3s ease-out;
}

.chat-message-user {
  align-items: flex-end;
}

.chat-message-assistant {
  align-items: flex-start;
}

.chat-message-user .chat-message-content {
  background-color: #007bff;
  color: white;
  border-radius: 12px 12px 4px 12px;
  padding: 0.75rem 1rem;
  max-width: 70%;
}

.chat-message-assistant .chat-message-content {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 12px 12px 12px 4px;
  padding: 1rem;
  max-width: 90%;
  line-height: 1.6;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: 0.5rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.5;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-6px);
  }
}

/* Slide in Animation */
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

.message-status {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.5);
}
```

---

## 6. Melhores Práticas de UX

### 6.1 Performance e Fluidez

```tsx
// StreamingTextOptimized.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface StreamingTextOptimizedProps {
  text: string;
  speed?: number;
  batchSize?: number; // múltiplos caracteres por update
  showCursor?: boolean;
}

export const StreamingTextOptimized: React.FC<StreamingTextOptimizedProps> = ({
  text,
  speed = 15,
  batchSize = 3,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (displayedText.length >= text.length) {
      setIsTyping(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      const nextLength = Math.min(
        displayedText.length + batchSize,
        text.length
      );
      setDisplayedText(text.slice(0, nextLength));
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, text, speed, batchSize]);

  return (
    <span className="streaming-text">
      {displayedText}
      {isTyping && showCursor && <span className="cursor" />}
    </span>
  );
};
```

### 6.2 Reduzir Perceived Latency

- **Mostrar imediatamente o indicador de typing** quando a resposta começa
- **Usar shimmer ou skeleton** para seções que ainda estão carregando
- **Permitir cancelamento** com botão "Stop" visível
- **Scroll automático** para o fim da mensagem durante streaming

```tsx
// TypingIndicatorWithCancel.tsx
import React from 'react';

interface TypingIndicatorWithCancelProps {
  isStreaming: boolean;
  onCancel: () => void;
}

export const TypingIndicatorWithCancel: React.FC<
  TypingIndicatorWithCancelProps
> = ({ isStreaming, onCancel }) => {
  if (!isStreaming) return null;

  return (
    <div className="typing-with-cancel">
      <span className="typing-dots">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
      <button onClick={onCancel} className="cancel-button">
        Parar
      </button>
    </div>
  );
};
```

### 6.3 Accessibility (A11y)

```tsx
// AccessibleStreamingMessage.tsx
import React, { useEffect } from 'react';

interface AccessibleStreamingMessageProps {
  content: string;
  role: 'user' | 'assistant';
  isStreaming: boolean;
  ariaLabel?: string;
}

export const AccessibleStreamingMessage: React.FC<
  AccessibleStreamingMessageProps
> = ({ content, role, isStreaming, ariaLabel }) => {
  // Announce streaming status to screen readers
  useEffect(() => {
    if (isStreaming) {
      const announcement = `${role === 'assistant' ? 'Assistente está digitando' : 'Mensagem enviada'}`;
      const ariaLive = document.createElement('div');
      ariaLive.setAttribute('aria-live', 'polite');
      ariaLive.setAttribute('aria-atomic', 'true');
      ariaLive.textContent = announcement;
      document.body.appendChild(ariaLive);

      return () => document.body.removeChild(ariaLive);
    }
  }, [isStreaming, role]);

  return (
    <div
      className={`message message-${role}`}
      role="article"
      aria-label={ariaLabel || `Mensagem do ${role}`}
    >
      <p>{content}</p>
      {isStreaming && (
        <span aria-label="Em digitação" className="sr-only">
          Digitando...
        </span>
      )}
    </div>
  );
};
```

---

## 7. Integração com Vercel AI SDK

### 7.1 Usando useChat com Streaming

```tsx
// ChatWithVercelAI.tsx
import React from 'react';
import { useChat } from '@ai-sdk/react';
import { StreamingChatMessage } from './StreamingChatMessage';

export const ChatWithVercelAI: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      streamProtocol: 'text',
    });

  React.useEffect(() => {
    // Auto-scroll to latest message
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        {messages.map((message) => (
          <StreamingChatMessage
            key={message.id}
            id={message.id}
            role={message.role as 'user' | 'assistant'}
            content={message.content}
            isStreaming={isLoading && message.role === 'assistant'}
            isComplete={!isLoading}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
          className="chat-input"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};
```

### 7.2 Com Streaming Markdown

```tsx
// ChatWithMarkdownStreaming.tsx
import React from 'react';
import { useChat } from '@ai-sdk/react';
import { Streamdown } from 'streamdown';
import { code, mermaid, math } from '@streamdown/plugin-*';

export const ChatWithMarkdownStreaming: React.FC = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      streamProtocol: 'text',
    });

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        {messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            {message.role === 'assistant' ? (
              <Streamdown
                plugins={{ code, mermaid, math }}
                isAnimating={isLoading && messages[messages.length - 1].id === message.id}
              >
                {message.content}
              </Streamdown>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite sua mensagem..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Enviar
        </button>
      </form>
    </div>
  );
};
```

---

## 8. Bibliotecas Recomendadas

| Biblioteca | Caso de Uso | Link |
|-----------|-----------|------|
| **Streamdown** | Renderizar Markdown streaming | [streamdown.ai](https://streamdown.ai/) |
| **Flowtoken** | Animações variadas para streaming | [github.com/Ephibbs/flowtoken](https://github.com/Ephibbs/flowtoken) |
| **TypeIt** | Typing animations customizáveis | [typeitjs.com](https://typeitjs.com/) |
| **react-type-animation** | Componente typing simples | [npm.com/package/react-type-animation](https://www.npmjs.com/package/react-type-animation) |
| **Framer Motion** | Animações fluidas e complexas | [framer.com/motion](https://www.framer.com/motion/) |
| **Vercel AI SDK** | Integração com LLMs | [ai-sdk.dev](https://ai-sdk.dev/) |
| **react-markdown** | Renderizar Markdown básico | [npm.com/package/react-markdown](https://www.npmjs.com/package/react-markdown) |

---

## 9. Checklist de Implementação

### Para Chat com Streaming de Texto:
- [ ] Implementar typing effect com cursor piscando
- [ ] Adicionar indicador de status (digitando...)
- [ ] Suportar cancelamento da resposta
- [ ] Auto-scroll para nova mensagem
- [ ] Otimizar performance (não re-renderizar todo texto a cada char)

### Para Rendering de Markdown:
- [ ] Usar Streamdown para markdown streaming
- [ ] Syntax highlighting para código
- [ ] Suporte a tabelas e listas
- [ ] Memoization para evitar re-parse

### Para Thinking/Reasoning:
- [ ] Componente expandable/collapsible
- [ ] Shimmer effect durante processing
- [ ] Mostrar duração total
- [ ] Ocultar por padrão (opcional)

### Para UX:
- [ ] Animações suaves (60fps)
- [ ] Reduzir perceived latency
- [ ] Botão Stop/Cancel visível
- [ ] Acessibilidade (aria-live, labels)
- [ ] Dark mode support
- [ ] Responsive design

---

## 10. Referências e Fontes

### Artigos e Documentação
- [DEV Community - ChatGPT Typing Animation](https://dev.to/stiaanwol/how-to-build-the-chatgpt-typing-animation-in-react-2cca)
- [LogRocket - 5 Ways to Implement Typing Animation](https://blog.logrocket.com/5-ways-implement-typing-animation-react/)
- [Medium - Typewriter Effect + Blinking Cursor](https://medium.com/@anuragjcchaturvedi/typewriter-effect-blinking-cursor-in-react-7031e079b0bc)
- [Digestible UX - How AI Models Show Their Reasoning](https://www.digestibleux.com/p/how-ai-models-show-their-reasoning)

### Repositórios GitHub
- [Vercel Streamdown](https://github.com/vercel/streamdown)
- [FlowToken - LLM Animation Library](https://github.com/Ephibbs/flowtoken)
- [Vercel AI SDK](https://github.com/vercel/ai)
- [react-markdown](https://github.com/remarkjs/react-markdown)

### Documentação Oficial
- [Vercel AI SDK - Foundations: Streaming](https://ai-sdk.dev/docs/foundations/streaming)
- [Streamdown Documentation](https://streamdown.ai/docs)
- [Vercel AI Elements](https://ai-sdk.dev/elements/components/reasoning)
- [shadcn/ui - AI Components](https://www.shadcn.io/ai)

---

## 11. Exemplo Prático Completo

Veja um exemplo completo em: `/src/components/streaming/` (a ser criado no seu projeto)

```
src/components/streaming/
├── StreamingText.tsx
├── StreamingText.css
├── ThinkingIndicator.tsx
├── ThinkingIndicator.css
├── AnimatedMarkdown.tsx
├── StreamingChatMessage.tsx
├── StreamingChatMessage.css
└── ChatContainer.tsx
```

---

**Última atualização**: Janeiro 2026
**Baseado em**: ChatGPT, Claude 3.7, Gemini 2.0, Vercel AI SDK
