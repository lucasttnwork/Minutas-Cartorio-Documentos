# Guia Rápido: Começar com OpenAI Agents SDK em 15 Minutos

**Objetivo:** Você terá seu primeiro agent funcionando em 15 minutos
**Pré-requisitos:** Python 3.9+, uma API key OpenAI
**Tempo estimado:** 15 minutos

---

## Passo 1: Setup (3 minutos)

### 1.1 Criar Pasta do Projeto

```bash
mkdir meu-agent-ai
cd meu-agent-ai

# Criar ambiente virtual
python -m venv venv

# Ativar
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 1.2 Instalar Dependências

```bash
pip install openai-agents openai python-dotenv
```

### 1.3 Criar Arquivo .env

```bash
# Criar arquivo .env na raiz do projeto
cat > .env << EOF
OPENAI_API_KEY=sk-seu-api-key-aqui
OPENAI_MODEL=gpt-4o
EOF
```

**Obter API Key:**
1. Ir para https://platform.openai.com/api-keys
2. Clicar "Create new secret key"
3. Copiar a chave para .env

---

## Passo 2: Seu Primeiro Agent (5 minutos)

### Criar arquivo `hello_agent.py`

```python
import os
from dotenv import load_dotenv
from agents import Agent, Runner

# Carregar env
load_dotenv()

# Criar agent
hello_agent = Agent(
    name="HelloAgent",
    instructions="You are a helpful assistant. Answer questions clearly and concisely."
)

# Executar
if __name__ == "__main__":
    result = Runner.run_sync(
        hello_agent,
        "What is machine learning in one sentence?"
    )

    print("\n" + "="*60)
    print("RESPOSTA:")
    print(result.final_output)
    print("="*60)
    print(f"Tokens usados: {result.usage.total_tokens}")
```

### Executar

```bash
python hello_agent.py
```

**Output esperado:**
```
============================================================
RESPOSTA:
Machine learning is a subset of artificial intelligence that
enables systems to learn from data and improve their performance
without being explicitly programmed.
============================================================
Tokens usados: 32
```

---

## Passo 3: Agent com Tools (7 minutos)

### Criar arquivo `agent_with_tools.py`

```python
import os
from dotenv import load_dotenv
from agents import Agent, Runner, function_tool

load_dotenv()

# Passo 1: Definir as tools (funções que o agent pode chamar)

@function_tool
def get_weather(city: str) -> str:
    """Get the current weather for a city."""
    # Simular uma chamada real
    weather_data = {
        "São Paulo": "Sunny, 28°C",
        "Rio de Janeiro": "Cloudy, 32°C",
        "Salvador": "Rainy, 30°C"
    }
    return weather_data.get(city, f"No weather data for {city}")

@function_tool
def calculate(expression: str) -> float:
    """Calculate a mathematical expression."""
    try:
        return float(eval(expression))
    except:
        return 0.0

@function_tool
def current_time() -> str:
    """Get current date and time."""
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

# Passo 2: Criar agent com as tools
utility_agent = Agent(
    name="UtilityAgent",
    instructions="""You are a helpful utility assistant.
    You have access to tools for:
    - Getting weather information
    - Doing calculations
    - Checking the current time

    Use these tools to help answer user questions.""",
    tools=[get_weather, calculate, current_time]
)

# Passo 3: Executar
if __name__ == "__main__":
    # Teste 1
    result1 = Runner.run_sync(
        utility_agent,
        "What's the weather like in São Paulo?"
    )
    print("Pergunta 1: O que é o tempo em São Paulo?")
    print(f"Resposta: {result1.final_output}\n")

    # Teste 2
    result2 = Runner.run_sync(
        utility_agent,
        "Calculate 25 * 4 + 10"
    )
    print("Pergunta 2: Calcula 25 * 4 + 10")
    print(f"Resposta: {result2.final_output}\n")

    # Teste 3
    result3 = Runner.run_sync(
        utility_agent,
        "What time is it now?"
    )
    print("Pergunta 3: Que horas são agora?")
    print(f"Resposta: {result3.final_output}")
```

### Executar

```bash
python agent_with_tools.py
```

---

## Passo 4: Multi-Agent com Handoff (5 minutos)

### Criar arquivo `multi_agent.py`

```python
import os
from dotenv import load_dotenv
from agents import Agent, Runner, handoff

load_dotenv()

# Passo 1: Criar agents especializados

math_expert = Agent(
    name="MathExpert",
    instructions="""You are a math expert.
    Solve math problems step by step.
    Explain your reasoning clearly."""
)

science_expert = Agent(
    name="ScienceExpert",
    instructions="""You are a science expert.
    Answer science questions with scientific accuracy.
    Provide relevant examples."""
)

# Passo 2: Criar agent triage que roteia
triage_agent = Agent(
    name="TriageAgent",
    instructions="""You are a helpful tutor.
    Listen to the question and route to the right expert:
    - Math questions → MathExpert
    - Science questions → ScienceExpert

    Be encouraging and helpful.""",
    tools=[
        handoff(math_expert, description="Route to math expert"),
        handoff(science_expert, description="Route to science expert")
    ]
)

# Passo 3: Testar
if __name__ == "__main__":
    # Teste 1: Math
    result1 = Runner.run_sync(
        triage_agent,
        "What is 25% of 80?"
    )
    print("Pergunta: What is 25% of 80?")
    print(f"Resposta:\n{result1.final_output}\n")

    # Teste 2: Science
    result2 = Runner.run_sync(
        triage_agent,
        "Why is the sky blue?"
    )
    print("Pergunta: Why is the sky blue?")
    print(f"Resposta:\n{result2.final_output}")
```

### Executar

```bash
python multi_agent.py
```

---

## Próximos Passos

### Opção 1: Adicionar Banco de Dados (10 min adicionais)

```python
# agent_with_db.py
from agents import Agent, Runner, function_tool
import sqlite3

@function_tool
def get_customers() -> dict:
    """Get list of customers from database"""
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE customers (id INT, name TEXT)")
    conn.execute("INSERT INTO customers VALUES (1, 'Alice'), (2, 'Bob')")

    cursor = conn.execute("SELECT * FROM customers")
    customers = [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]

    return {"customers": customers, "total": len(customers)}

db_agent = Agent(
    name="DBAgent",
    instructions="Help users query customer data",
    tools=[get_customers]
)

result = Runner.run_sync(db_agent, "List all customers")
print(result.final_output)
```

### Opção 2: Adicionar Logging (5 min adicionais)

```python
# agent_with_logging.py
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

logger.info("Agent started")

result = Runner.run_sync(agent, "Your question")

logger.info(f"Agent finished. Tokens used: {result.usage.total_tokens}")
```

### Opção 3: Adicionar Session Memory (5 min adicionais)

```python
# agent_with_memory.py
from agents import Agent, Runner, SQLiteSession

# Criar session
session = SQLiteSession(db_path="conversations.db")

agent = Agent(
    name="MemoryAgent",
    instructions="Remember what the user told you"
)

# Primeira mensagem
result1 = Runner.run_sync(
    agent,
    "My name is Alice and I like Python",
    session=session
)

# Segunda mensagem (agent lembra!)
result2 = Runner.run_sync(
    agent,
    "What's my name and what do I like?",
    session=session  # Mesma sessão
)

print(result2.final_output)  # Vai incluir "Alice" e "Python"
```

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| `ModuleNotFoundError: No module named 'agents'` | Rode `pip install openai-agents` |
| `OpenAIAuthenticationError` | Verifique se a API key está correta em `.env` |
| `RateLimitError` | Aguarde alguns segundos e tente novamente |
| Agent não usa tools | Verifique se as funções têm decorator `@function_tool` |
| Output vazio | Aumente `max_tokens` na Agent config |

---

## Conceptos Importantes em 60 Segundos

### Agent
Um LLM equipado com instruções, tools e comportamento.

```python
agent = Agent(
    name="Name",
    instructions="What it should do",
    tools=[tool1, tool2]
)
```

### Tool
Uma função Python que o agent pode chamar.

```python
@function_tool
def my_function(param: str) -> str:
    """Description of what it does"""
    return "result"
```

### Runner
Executa o agent.

```python
result = Runner.run_sync(agent, "user input")
print(result.final_output)
```

### Handoff
Agent transfere para outro agent.

```python
tools=[handoff(other_agent, description="...")]
```

---

## Checklist: Você Tem Tudo?

- [ ] Python 3.9+ instalado
- [ ] Ambiente virtual criado
- [ ] `pip install openai-agents openai python-dotenv`
- [ ] Arquivo `.env` com API key
- [ ] Arquivo `hello_agent.py` criado e executado
- [ ] Entende como criar agents
- [ ] Entende como criar tools
- [ ] Sabe como usar handoffs

**Se marcou tudo, você está pronto!**

---

## Exemplos Completos de 1-Liners

```python
# O mais simples possível
from agents import Agent, Runner
from dotenv import load_dotenv

load_dotenv()

result = Runner.run_sync(
    Agent(name="A", instructions="Help me"),
    "Your question here"
)
print(result.final_output)
```

---

## Próximas Leituras

1. **[PESQUISA_OPENAI_AGENTS_SDK.md](./PESQUISA_OPENAI_AGENTS_SDK.md)** - Documentação completa e profunda
2. **[EXEMPLOS_PRATICOS_AGENTS_SDK.md](./EXEMPLOS_PRATICOS_AGENTS_SDK.md)** - Exemplos prontos para copiar
3. **[ARQUITETURA_PRODUCAO_AGENTS.md](./ARQUITETURA_PRODUCAO_AGENTS.md)** - Como estruturar para produção

---

## Roadmap Recomendado

**Semana 1:** Aprender conceitos básicos
- [ ] Ler este guia
- [ ] Criar 3 agents simples
- [ ] Experimente com diferentes tools

**Semana 2:** Construir primeiro projeto
- [ ] Defina um problema real
- [ ] Crie agent specializado
- [ ] Integre com banco de dados

**Semana 3:** Escalar para produção
- [ ] Adicione guardrails
- [ ] Implemente logging
- [ ] Configure monitoramento

**Semana 4+:** Otimizar e manter
- [ ] Performance tuning
- [ ] Cost optimization
- [ ] Melhorar observabilidade

---

## Comunidade e Recursos

- **GitHub:** https://github.com/openai/openai-agents-python
- **Docs:** https://openai.github.io/openai-agents-python/
- **Cookbook:** https://cookbook.openai.com/topic/agents
- **Discord:** Community OpenAI (procure por #agents)

---

## Próxima Ação

**Agora execute:**

```bash
python hello_agent.py
```

Se funcionou, parabéns! 🎉

Se não funcionou, copie a mensagem de erro e procure em:
- Stack Overflow
- GitHub Issues
- Docs OpenAI

---

**Tempo total: 15 minutos para seu primeiro agent funcionando!**

Última atualização: Fevereiro 2026
