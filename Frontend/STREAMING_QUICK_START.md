# Guia Rápido - Streaming UI/UX para Chat com IA

Tudo que você precisa saber para implementar animações de streaming em seu projeto em 5 minutos.

---

## Visão Geral Rápida

| Componente | Uso | Arquivo |
|-----------|-----|---------|
| **StreamingText** | Typing animation básica | `StreamingText.tsx` |
| **ThinkingIndicator** | Mostrar "pensamento" do IA | `ThinkingIndicator.tsx` |
| **TypingIndicator** | Dots animados de carregamento | `TypingIndicator.tsx` |
| **StreamingChatMessage** | Mensagem completa com tudo | `StreamingChatMessage.tsx` |

---

## 1. Setup Rápido (30 segundos)

```bash
# 1. Criar pasta
mkdir -p src/components/streaming

# 2. Copiar arquivos
# Copie todos os .tsx e .css para src/components/streaming/

# 3. Importar
import { StreamingText, ThinkingIndicator, StreamingChatMessage } from '@/components/streaming';
```

---

## 2. Padrão Básico - Typing Animation

```tsx
import { StreamingText } from '@/components/streaming';

function MyComponent() {
  return (
    <StreamingText
      text="Olá, este texto aparece caractere por caractere..."
      speed={20}
      showCursor={true}
    />
  );
}
```

**Resultado Visual:**
```
Olá, este texto aparece|  <- cursor piscando
```

---

## 3. Padrão Intermediário - Com Thinking

```tsx
import { StreamingChatMessage } from '@/components/streaming';

function MyChat() {
  return (
    <StreamingChatMessage
      id="msg-1"
      role="assistant"
      content="Resposta gerada após análise profunda..."
      thinking="Analisando pergunta... Considerando opções..."
      isStreaming={true}
      thinkingDuration={2.5}
    />
  );
}
```

**Resultado Visual:**
```
▶ Pensando...

Resposta gerada após|  <- resposta em streaming
```

---

## 4. Padrão Avançado - Chat Completo

```tsx
import { useChat } from '@ai-sdk/react';
import { StreamingChatMessage } from '@/components/streaming';

function ChatApp() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="chat-wrapper">
      <div className="messages">
        {messages.map((msg) => (
          <StreamingChatMessage
            key={msg.id}
            id={msg.id}
            role={msg.role as 'user' | 'assistant'}
            content={msg.content}
            isStreaming={false}
            isComplete={true}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Digite..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
```

---

## 5. Velocidades e Configurações

### Typing Speed (ms por caractere)

```tsx
// Muito rápido (robótico)
<StreamingText text={text} speed={5} />

// Rápido (normal)
<StreamingText text={text} speed={15} />

// Lento (deliberado)
<StreamingText text={text} speed={30} />

// Muito lento (teatral)
<StreamingText text={text} speed={50} />
```

### Batch Size (caracteres por update)

```tsx
// Character-by-character (padrão)
<StreamingText text={text} batchSize={1} />

// Mais suave (3 caracteres por vez)
<StreamingText text={text} batchSize={3} speed={20} />

// Muito rápido (10 caracteres por vez)
<StreamingText text={text} batchSize={10} speed={15} />
```

---

## 6. Indicadores de Status

### Typing Dots (carregando)

```tsx
import { TypingIndicator } from '@/components/streaming';

// Simples
<TypingIndicator isVisible={isLoading} />

// Com label
<TypingIndicator
  isVisible={isLoading}
  size="medium"
  label="Pensando..."
/>

// Tamanhos
<TypingIndicator size="small" />   {/* Dots pequenos */}
<TypingIndicator size="medium" />  {/* Padrão */}
<TypingIndicator size="large" />   {/* Dots grandes */}
```

### Thinking/Reasoning

```tsx
import { ThinkingIndicator } from '@/components/streaming';

// Simples
<ThinkingIndicator
  content="Analisando..."
  isVisible={true}
/>

// Com duração
<ThinkingIndicator
  content="Pensamento aqui..."
  isStreaming={true}
  duration={3.5}
  autoCollapse={true}
/>
```

---

## 7. Fluxo Completo - Mensagem com Thinking

```tsx
// Fase 1: Mostra thinking enquanto processa
<ThinkingIndicator
  content={thinkingText}
  isStreaming={true}
  duration={2}
/>

// Fase 2: Depois mostra resposta em streaming
<StreamingText
  text={responseText}
  speed={15}
/>

// Resultado Visual:
//
// ▼ Pensou por 2.0s
//   [conteúdo do thinking aqui]
//
// Esta é a resposta que aparece em|
// streaming caractere por caractere...
```

---

## 8. CSS Customização Rápida

### Trocar cores

```css
/* Cursor color */
.cursor {
  background-color: #ff0000; /* vermelho */
}

/* Mensagem do assistente */
.chat-message-assistant .message-content {
  background-color: #e3f2fd; /* azul claro */
  border-radius: 12px 12px 12px 4px;
}

/* Mensagem do usuário */
.chat-message-user .message-content {
  background-color: #007bff; /* azul */
  color: white;
  border-radius: 12px 12px 4px 12px;
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  .chat-message-assistant .message-content {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .cursor {
    background-color: rgba(255, 255, 255, 0.8);
  }
}
```

---

## 9. Performance Tips

### 1. Use batchSize para grandes textos

```tsx
// Ruim: 1000 caracteres = 1000 updates
<StreamingText text={longText} speed={20} batchSize={1} />

// Bom: 1000 caracteres = 100-200 updates
<StreamingText text={longText} speed={20} batchSize={5} />
```

### 2. Memoize o componente

```tsx
import { memo } from 'react';
import { StreamingChatMessage } from '@/components/streaming';

const MemoChat = memo(StreamingChatMessage);
```

### 3. Lazy load longas conversa

```tsx
const [visibleMessages, setVisibleMessages] = useState(messages.slice(-10));

// Carregar mais conforme scroll
```

---

## 10. Checklist de Implementação

### Instalação
- [ ] Pasta `/src/components/streaming/` criada
- [ ] Todos os `.tsx` copiados
- [ ] Todos os `.css` copiados
- [ ] `index.ts` com exports

### Funcionalidade
- [ ] StreamingText funciona
- [ ] Cursor pisca corretamente
- [ ] ThinkingIndicator expande/colapsa
- [ ] TypingIndicator anima
- [ ] StreamingChatMessage completo

### Integração
- [ ] Importar em seu componente
- [ ] Conectar com API real
- [ ] Testar com dados verdadeiros
- [ ] Verificar performance

### Polish
- [ ] Dark mode funciona
- [ ] Responsive (mobile)
- [ ] Accessibility (a11y)
- [ ] Animações suaves (60fps)

---

## 11. Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Texto não aparece piscando | Verificar `showCursor={true}` |
| Performance ruim | Aumentar `batchSize` para 3-5 |
| Thinking não funciona | Verificar `isVisible={true}` e `content` |
| Mensagem muito grande | Usar virtualização com react-window |
| CSS não aplicado | Verificar caminho de import dos `.css` |
| Sem animações | Verificar `prefers-reduced-motion` |

---

## 12. Exemplos de Uso Real

### Exemplo 1: QA Bot

```tsx
function QABot() {
  const [messages, setMessages] = useState([]);

  const askQuestion = async (q: string) => {
    // Adicionar pergunta
    setMessages(m => [...m, { role: 'user', content: q, id: Date.now() }]);

    // Adicionar resposta vazia
    const respId = Date.now() + 1;
    setMessages(m => [...m, { role: 'assistant', content: '', id: respId, isStreaming: true }]);

    // Chamar API
    const response = await fetch('/api/ask', { method: 'POST', body: JSON.stringify({ q }) });
    const reader = response.body.getReader();

    // Stream resposta
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      setMessages(m => m.map(msg =>
        msg.id === respId
          ? { ...msg, content: msg.content + text }
          : msg
      ));
    }

    // Marcar como completo
    setMessages(m => m.map(msg =>
      msg.id === respId
        ? { ...msg, isStreaming: false }
        : msg
    ));
  };

  return (
    <div>
      {messages.map(m => (
        <StreamingChatMessage key={m.id} {...m} />
      ))}
      <input onKeyPress={(e) => e.key === 'Enter' && askQuestion(e.target.value)} />
    </div>
  );
}
```

### Exemplo 2: Document Writer

```tsx
function DocumentWriter() {
  const [doc, setDoc] = useState('');
  const [isWriting, setIsWriting] = useState(false);

  const generateDocument = async (prompt: string) => {
    setIsWriting(true);
    setDoc('');

    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = new TextDecoder().decode(value);
      setDoc(prev => prev + text);
    }

    setIsWriting(false);
  };

  return (
    <div>
      <textarea value={doc} readOnly />
      <StreamingText text={doc} speed={isWriting ? 10 : 0} isComplete={!isWriting} />
    </div>
  );
}
```

---

## 13. Recursos Adicionais

### Documentação Completa
- Veja `STREAMING_UI_PATTERNS.md` para documentação detalhada
- Veja `STREAMING_IMPLEMENTATION_EXAMPLES.md` para mais exemplos

### Bibliotecas Recomendadas
- **Streamdown**: Markdown streaming `npm install streamdown`
- **Vercel AI SDK**: Chat com LLMs `npm install @ai-sdk/react`
- **Framer Motion**: Animações avançadas `npm install framer-motion`

---

## 14. Resumo Visual

```
┌─────────────────────────────────────┐
│  StreamingText Component            │
├─────────────────────────────────────┤
│  Olá, este texto aparece|           │
│  ↑ cursor piscando                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ThinkingIndicator Component        │
├─────────────────────────────────────┤
│  ▶ Pensando... (clique para expandir)│
│  ▼ Pensou por 2.5s                  │
│    └─ Analisando... Considerando... │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TypingIndicator Component          │
├─────────────────────────────────────┤
│  ● ● ● (dots animados)              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  StreamingChatMessage Complete      │
├─────────────────────────────────────┤
│  👤 Usuário: Como está?             │
│                                     │
│  🤖 ▼ Pensou por 1.5s              │
│     └─ Analisar pergunta...        │
│                                     │
│  Estou bem, obrigado por pergun|    │
│  ↑ resposta em streaming            │
└─────────────────────────────────────┘
```

---

**Pronto para começar?**

1. Copie os arquivos para `src/components/streaming/`
2. Importe: `import { StreamingText } from '@/components/streaming'`
3. Use em seu componente
4. Customize CSS conforme necessário

**Tempo estimado de setup: 5 minutos**
**Tempo de integração: 15-30 minutos**

---

*Última atualização: Janeiro 2026*
*Para suporte detalhado, veja os outros documentos neste diretório.*
