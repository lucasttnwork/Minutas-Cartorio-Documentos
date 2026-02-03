# Pesquisa Profunda: OpenAI Agents SDK e Orquestração de Agentes IA

**Data da Pesquisa:** Fevereiro 2026
**Escopo:** OpenAI Agents SDK, Assistants API, Orquestração Multi-Agentes, Integração com Databases
**Fontes:** Documentação Oficial OpenAI, GitHub, OpenAI Cookbook, Artigos Técnicos 2024-2026

---

## Índice

1. [Arquitetura do OpenAI Agents SDK](#arquitetura-do-openai-agents-sdk)
2. [Assistants API vs Agents SDK](#assistants-api-vs-agents-sdk)
3. [Sistema de Tools e Functions](#sistema-de-tools-e-functions)
4. [Criando Agentes Especializados](#criando-agentes-especializados)
5. [Orquestração Multi-Agentes](#orquestração-multi-agentes)
6. [Integração com Banco de Dados](#integração-com-banco-de-dados)
7. [Guardrails e Segurança](#guardrails-e-segurança)
8. [Tracing e Observabilidade](#tracing-e-observabilidade)
9. [Comparações com Frameworks Alternativos](#comparações-com-frameworks-alternativos)
10. [Best Practices para Produção](#best-practices-para-produção)

---

## 1. Arquitetura do OpenAI Agents SDK

### 1.1 Visão Geral

O **OpenAI Agents SDK** foi lançado em **março de 2025** como uma evolução production-ready do projeto experimental Swarm. É um framework **lightweight, open-source e model-agnostic** para construir sistemas de agentes IA.

**Características Principais:**
- Framework minimalista com poucas abstrações
- Suporta OpenAI models ou qualquer API compatível com Chat Completions
- Disponível em Python e TypeScript
- Provider-agnostic (suporta 100+ LLMs via APIs compatíveis)
- Tracing built-in para observabilidade
- Session memory automático

**Fontes:**
- [OpenAI Agents SDK (openai.github.io)](https://openai.github.io/openai-agents-python/)
- [OpenAI for Developers in 2025](https://developers.openai.com/blog/openai-for-developers-2025/)
- [New tools for building agents | OpenAI](https://openai.com/index/new-tools-for-building-agents/)

### 1.2 As 3 Primitivas Fundamentais

```python
from agents import Agent, Runner, handoff

# 1. AGENTS: LLM com instruções, tools e comportamento
agent = Agent(
    name="AssistantName",
    instructions="You are a helpful assistant...",
    tools=[tool1, tool2]
)

# 2. HANDOFFS: Agentes delegando para outros agentes
transfer_tool = handoff(target_agent)

# 3. GUARDRAILS: Validação de entradas e saídas
guardrail = InputGuardrail(...)
```

**As 3 Primitivas:**

1. **Agent**
   - LLM equipado com instruções, tools e comportamento
   - Pode manter estado através de Sessions
   - Executa através de um Runner

2. **Handoffs** (Agentes como Ferramentas)
   - Permite delegação explícita entre agentes
   - Um agente pode transferir conversação para outro
   - Mantém contexto da conversa através do handoff

3. **Guardrails**
   - Input Guardrails: validam entrada do usuário
   - Output Guardrails: validam saída final do agente
   - Tool Guardrails: validam antes/depois execução de tools
   - Falham rápido (fail-fast) quando detectam problemas

### 1.3 Componentes da Arquitetura

```
┌─────────────────────────────────────────┐
│         Agent Definition                 │
│  ┌─────────────────────────────────────┐ │
│  │ Instructions (String)               │ │
│  │ Tools (Functions, MCP Servers)      │ │
│  │ Handoffs (Other Agents)             │ │
│  │ Guardrails (Input/Output/Tool)      │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│           Runner                        │
│  ┌─────────────────────────────────────┐ │
│  │ run_sync() / run_async()            │ │
│  │ run_streamed()                      │ │
│  │ Sessions + Memory Management        │ │
│  │ Conversation History Tracking       │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    LLM (OpenAI ou Compatible)           │
│    Chat Completions API                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    Tools Execution & Functions          │
│    External APIs, Databases, etc.       │
└─────────────────────────────────────────┘
```

**Componentes Chave:**

- **Agent Loop**: Processa invocações de ferramentas e mantém interação com LLM
- **Sessions**: Camada de memória persistente para conversa multi-turn
- **Tracing**: Sistema automático de rastreamento para debugging
- **Function Tools**: Converte funções Python em tools com schemas automáticos

### 1.4 Fluxo de Execução

```
1. User Input
     ↓
2. Runner.run_sync(agent, input)
     ↓
3. Input Guardrail Validation
     ↓
4. LLM Generation + Tool Planning
     ↓
5. Tool Call Execution (parallelizable)
     ↓
6. Tool Results Back to LLM
     ↓
7. Output Guardrail Validation
     ↓
8. Session Storage + Tracing
     ↓
9. Final Output
```

---

## 2. Assistants API vs Agents SDK

### 2.1 Status da Assistants API

**IMPORTANTE:** A Assistants API está **DEPRECADA** e será desativada em **26 de agosto de 2026**.

| Aspecto | Assistants API | Agents SDK |
|--------|-----------------|-----------|
| **Status** | Deprecated (fim: Aug 26, 2026) | Production-Ready (2025+) |
| **Estado** | Stateful (gerencia threads) | Stateless (você gerencia estado) |
| **Modelo** | Cloudside (server-managed) | Client-side (você controla) |
| **Tools** | Code Interpreter, File Search | Custom functions, MCP servers |
| **Observabilidade** | Limitada | Built-in tracing completo |
| **Flexibilidade** | Menor | Maior controle |

### 2.2 Diferenças Arquiteturais

**Assistants API (Deprecated):**
```python
# O servidor gerenciava tudo
assistant = client.beta.assistants.create(
    name="Assistant",
    instructions="...",
    model="gpt-4-turbo"
)

thread = client.beta.threads.create()
client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Your question"
)
```

**Agents SDK (New):**
```python
# Você controla o fluxo
agent = Agent(
    name="Agent",
    instructions="...",
    tools=[...]
)

result = Runner.run_sync(agent, user_input)
# Você gerencia sessions manualmente se quiser
```

### 2.3 Migration Path

Se você está usando Assistants API:
1. **Migrar para Agents SDK** (recomendado)
2. **Alternativa:** Usar a nova Responses API + Chat Completions API

**Fontes:**
- [OpenAI Assistants API: A 2025 guide to the deprecation](https://www.eesel.ai/blog/openai-assistants-api)
- [Assistants API (v2) FAQ | OpenAI Help Center](https://help.openai.com/en/articles/8550641-assistants-api-v2-faq)
- [Migrate to the Responses API | OpenAI API](https://platform.openai.com/docs/guides/migrate-to-responses)

---

## 3. Sistema de Tools e Functions

### 3.1 Function Tools com Schema Automático

O SDK converte funções Python em tools com **schemas JSON automáticos** usando Pydantic.

```python
from agents import function_tool
from typing import Optional

@function_tool
def search_database(
    query: str,
    limit: int = 10,
    filters: Optional[dict] = None
) -> dict:
    """
    Search the database for matching records.

    Args:
        query: The search query string
        limit: Maximum number of results
        filters: Optional filter criteria

    Returns:
        Dictionary with search results
    """
    # Sua implementação
    results = []
    return {"results": results, "count": len(results)}

# Schema automático gerado:
# {
#   "type": "object",
#   "properties": {
#     "query": {"type": "string"},
#     "limit": {"type": "integer", "default": 10},
#     "filters": {"type": "object", "nullable": true}
#   },
#   "required": ["query"]
# }
```

**Como Funciona:**
- Type annotations Python → JSON Schema
- Docstring → descrições no schema
- Validação Pydantic automática
- Erros de validação → retornam ao LLM para retry

### 3.2 Tipos de Tools Suportados

#### 1. **Function Tools** (Python Functions)
```python
@function_tool
def get_weather(city: str) -> str:
    """Get weather for a city"""
    return f"Sunny in {city}"

agent = Agent(
    name="Weather Agent",
    tools=[get_weather]
)
```

#### 2. **MCP Server Tools** (Model Context Protocol)
```python
from agents import MCPClientTool

# Conectar a servidor MCP (ex: Supabase)
mcp_tool = MCPClientTool(
    server_params=ServerParameters(
        command="npx",
        args=["-y", "@supabase/mcp-server"]
    )
)

agent = Agent(
    name="Database Agent",
    tools=[mcp_tool]
)
```

#### 3. **Agents as Tools** (Agent Composition)
```python
from agents import handoff

# Agente especializado
research_agent = Agent(
    name="Research Agent",
    instructions="Research and summarize information",
    tools=[search_tool, summarize_tool]
)

# Agente manager que chama research como ferramenta
manager = Agent(
    name="Manager",
    instructions="Coordinate research tasks",
    tools=[handoff(research_agent)]
)
```

### 3.3 Validação com Pydantic

```python
from pydantic import BaseModel, Field
from agents import function_tool

class DatabaseQuery(BaseModel):
    """Validated database query parameters"""
    table: str = Field(..., description="Table name")
    limit: int = Field(default=10, ge=1, le=1000)
    where: Optional[dict] = Field(None, description="WHERE clause")

@function_tool
def query_database(query: DatabaseQuery) -> dict:
    """Execute a database query with validation"""
    # Pydantic já validou os dados
    return execute_sql(query.table, query.limit, query.where)
```

**Benefícios:**
- Validação automática antes de executar a função
- Type-safe
- Mensagens de erro claras ao LLM
- Retry automático em caso de erro

### 3.4 Structured Outputs

```python
from pydantic import BaseModel
from agents import Agent, function_tool

class DataPoint(BaseModel):
    key: str
    value: float

class AnalysisResult(BaseModel):
    summary: str
    data_points: list[DataPoint]

@function_tool
def analyze_data(data: list[dict]) -> AnalysisResult:
    """Analyze data and return structured output"""
    return AnalysisResult(
        summary="...",
        data_points=[DataPoint(key="metric", value=123.45)]
    )

agent = Agent(
    name="Analyst",
    tools=[analyze_data]
)
```

**Fontes:**
- [Function calling | OpenAI API](https://platform.openai.com/docs/guides/function-calling)
- [Tools - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tools/)
- [Structured model outputs | OpenAI API](https://platform.openai.com/docs/guides/structured-outputs)

---

## 4. Criando Agentes Especializados

### 4.1 Padrão: Single Agent com Múltiplos Tools

```python
from agents import Agent, Runner, function_tool

@function_tool
def search_orders(customer_id: str) -> list:
    """Search orders by customer ID"""
    # SQL query
    return db.query("SELECT * FROM orders WHERE customer_id = ?", customer_id)

@function_tool
def get_customer_info(customer_id: str) -> dict:
    """Get customer details"""
    return db.query("SELECT * FROM customers WHERE id = ?", customer_id)

@function_tool
def create_ticket(customer_id: str, issue: str) -> dict:
    """Create a support ticket"""
    return db.insert("support_tickets", {
        "customer_id": customer_id,
        "issue": issue,
        "status": "open"
    })

# Agente multi-tool
support_agent = Agent(
    name="Customer Support Agent",
    instructions="""You are a customer support agent.
    You can look up customer information, search their order history,
    and create support tickets. Be helpful and professional.""",
    tools=[search_orders, get_customer_info, create_ticket]
)

# Executar
result = Runner.run_sync(
    support_agent,
    "What orders does customer #123 have?"
)
print(result.final_output)
```

### 4.2 Padrão: Agente Especializado com Handoff

```python
from agents import Agent, Runner, handoff

# Agente 1: Especialista em Billing
billing_agent = Agent(
    name="Billing Agent",
    instructions="""You handle billing and payment issues.
    You can view invoices, process refunds, and update billing info.""",
    tools=[view_invoice_tool, process_refund_tool, update_billing_tool]
)

# Agente 2: Especialista em Technical Support
tech_agent = Agent(
    name="Technical Support Agent",
    instructions="""You handle technical issues and bug reports.
    You can check system status, view logs, and escalate to engineering.""",
    tools=[check_system_status_tool, view_logs_tool, create_engineering_ticket_tool]
)

# Agente 3: Triage (Router)
triage_agent = Agent(
    name="Triage Agent",
    instructions="""You are the first point of contact.
    Listen to the customer's issue and route them to the appropriate specialist.
    - For billing issues → Billing Agent
    - For technical issues → Technical Support Agent""",
    tools=[
        handoff(billing_agent, description="Handle billing issues"),
        handoff(tech_agent, description="Handle technical issues")
    ]
)

# Executar
result = Runner.run_sync(
    triage_agent,
    "I have a question about my invoice for last month"
)
```

### 4.3 Padrão: Agente com Memória de Sessão

```python
from agents import Agent, Runner, SQLiteSession

# Criar/conectar a sessão
session = SQLiteSession(db_path="conversations.db")

# Agente com contexto persistente
chatbot = Agent(
    name="Conversational Agent",
    instructions="You are a friendly chatbot. Remember what the user told you.",
    tools=[lookup_info_tool, save_preference_tool]
)

# Primeira mensagem
result1 = Runner.run_sync(
    chatbot,
    "My name is Alice and I like Python",
    session=session
)

# Segunda mensagem (agente lembra de Alice!)
result2 = Runner.run_sync(
    chatbot,
    "What's my name and what do I like?",
    session=session  # Mesma sessão = contexto mantido
)
# Output: "Your name is Alice and you like Python"
```

### 4.4 Customização Avançada

```python
from agents import Agent, ModelSettings

# Customizar modelo e parâmetros
specialized_agent = Agent(
    name="Research Agent",
    instructions="""You are a research specialist.
    Be thorough, cite sources, and provide detailed analysis.""",
    model_settings=ModelSettings(
        model="gpt-4o",
        temperature=0.7,
        max_tokens=4096,
        top_p=0.9
    ),
    tools=[search_tool, analyze_tool, write_tool]
)

# Executar com timeout e custom settings
result = Runner.run_sync(
    specialized_agent,
    "Research the latest AI trends",
    max_iterations=10,
    timeout=300  # 5 minutos
)
```

**Fontes:**
- [Quickstart - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/quickstart/)
- [Agents - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/agents/)

---

## 5. Orquestração Multi-Agentes

### 5.1 Padrão 1: Handoff Collaboration (Agent-to-Agent Transfer)

Agentes podem transferir controle uns para os outros mantendo o contexto da conversa.

```python
from agents import Agent, Runner, handoff

# Agentes especializados
history_tutor = Agent(
    name="History Tutor",
    instructions="You teach history. Explain historical events clearly.",
    tools=[search_historical_facts, generate_timeline]
)

math_tutor = Agent(
    name="Math Tutor",
    instructions="You teach mathematics. Solve equations step-by-step.",
    tools=[solve_equation, explain_concept]
)

# Agente Triage que roteia
education_agent = Agent(
    name="Education Agent",
    instructions="""You are an education coordinator.
    - Route history questions to History Tutor
    - Route math questions to Math Tutor
    - For general learning, try to help yourself""",
    tools=[
        handoff(
            history_tutor,
            tool_name_override="transfer_to_history_tutor",
            tool_description_override="Transfer conversation to History Tutor"
        ),
        handoff(
            math_tutor,
            tool_name_override="transfer_to_math_tutor",
            tool_description_override="Transfer conversation to Math Tutor"
        )
    ]
)

# Uso
result = Runner.run_sync(
    education_agent,
    "What was the Renaissance and how does it relate to modern art?"
)
# O agente automaticamente faz handoff para history_tutor
```

**Quando usar Handoff:**
- Transferência clara entre domínios
- Manter conversa contínua
- Agente especializado toma controle total
- Contexto flui naturalmente

### 5.2 Padrão 2: Agent as Tool (Orquestração via Planner)

Um agente manager chama outros agentes como ferramentas (não transferência, mas invocação).

```python
from agents import Agent, Runner, function_tool
import asyncio

# Agentes especializados (stateless)
researcher = Agent(
    name="Researcher",
    instructions="Research and gather information",
    tools=[search_web, fetch_papers]
)

analyst = Agent(
    name="Analyst",
    instructions="Analyze information and draw conclusions",
    tools=[statistical_analysis, data_visualization]
)

writer = Agent(
    name="Writer",
    instructions="Write reports based on research and analysis",
    tools=[format_document, create_references]
)

# Wrappear agentes como ferramentas
@function_tool
def research_topic(topic: str) -> str:
    """Use research agent to gather information"""
    result = Runner.run_sync(researcher, f"Research: {topic}")
    return result.final_output

@function_tool
def analyze_findings(findings: str) -> str:
    """Use analyst to analyze findings"""
    result = Runner.run_sync(analyst, f"Analyze: {findings}")
    return result.final_output

@function_tool
def write_report(research: str, analysis: str) -> str:
    """Use writer to create final report"""
    result = Runner.run_sync(
        writer,
        f"Create report from:\nResearch: {research}\nAnalysis: {analysis}"
    )
    return result.final_output

# Manager agent orquestra o workflow
project_manager = Agent(
    name="Project Manager",
    instructions="""You orchestrate research projects:
    1. Research the topic
    2. Analyze the findings
    3. Write a comprehensive report

    Call the tools in the right order.""",
    tools=[research_topic, analyze_findings, write_report]
)

# Executar
result = Runner.run_sync(
    project_manager,
    "Create a report on quantum computing advancements in 2025"
)
```

**Quando usar Agent as Tool:**
- Manager/Planner orquestra tarefas
- Paralelização dinâmica
- Agentes permanecem stateless
- Mais controle de fluxo

### 5.3 Padrão 3: Paralelização com Asyncio

Para máximo desempenho, execute agentes em paralelo.

```python
from agents import Agent, Runner
import asyncio

# Agentes para tarefas paralelas
data_fetcher = Agent(
    name="Data Fetcher",
    instructions="Fetch real-time data",
    tools=[api_call_tool]
)

data_processor = Agent(
    name="Data Processor",
    instructions="Process and transform data",
    tools=[processing_tool]
)

data_validator = Agent(
    name="Data Validator",
    instructions="Validate data quality",
    tools=[validation_tool]
)

async def process_in_parallel(query: str):
    """Execute multiple agents in parallel"""

    # Iniciar todas as tarefas
    tasks = [
        Runner.run_async(data_fetcher, f"Fetch: {query}"),
        Runner.run_async(data_processor, f"Process: {query}"),
        Runner.run_async(data_validator, f"Validate: {query}")
    ]

    # Aguardar todos completarem
    results = await asyncio.gather(*tasks)

    return {
        "fetched": results[0].final_output,
        "processed": results[1].final_output,
        "validated": results[2].final_output
    }

# Executar
results = asyncio.run(process_in_parallel("customer data"))
print(results)
```

**Trade-offs:**

| Padrão | Latência | Controle | Complexidade | Uso |
|--------|----------|----------|--------------|-----|
| **Handoff** | Baixa | Baixo (LLM decide) | Baixa | Routing simples |
| **Agent as Tool** | Média | Alto (Você decide) | Média | Orquestração complexa |
| **Parallelização** | Mínima | Alto | Alta | Máxima performance |

### 5.4 Agregando Respostas de Múltiplos Agentes

```python
from agents import Agent, Runner
import json

def aggregate_responses(queries: list[str], agent_configs: list[dict]) -> dict:
    """Agregar respostas de múltiplos agentes"""

    aggregated_results = {}

    for query, config in zip(queries, agent_configs):
        agent = Agent(
            name=config["name"],
            instructions=config["instructions"],
            tools=config["tools"]
        )

        result = Runner.run_sync(agent, query)
        aggregated_results[config["name"]] = {
            "response": result.final_output,
            "tokens_used": result.usage.total_tokens,
            "tools_called": result.tool_calls_count
        }

    # Consolidar em formato estruturado
    consolidated = {
        "results": aggregated_results,
        "total_tokens": sum(r["tokens_used"] for r in aggregated_results.values()),
        "synthesis": f"Collected {len(aggregated_results)} perspectives"
    }

    return consolidated

# Usar agregação
agent_configs = [
    {
        "name": "Sales Expert",
        "instructions": "Analyze from sales perspective",
        "tools": [sales_analysis_tool]
    },
    {
        "name": "Tech Expert",
        "instructions": "Analyze from tech perspective",
        "tools": [tech_analysis_tool]
    },
    {
        "name": "Finance Expert",
        "instructions": "Analyze from finance perspective",
        "tools": [financial_analysis_tool]
    }
]

results = aggregate_responses(
    queries=["Analyze product roadmap"] * 3,
    agent_configs=agent_configs
)
```

**Fontes:**
- [Orchestrating multiple agents - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/multi_agent/)
- [Handoffs - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/handoffs/)
- [Parallel Agents with the OpenAI Agents SDK | OpenAI Cookbook](https://cookbook.openai.com/examples/agents_sdk/parallel_agents)

---

## 6. Integração com Banco de Dados

### 6.1 Padrão: Function Tool com SQL

```python
from agents import Agent, Runner, function_tool
from typing import Optional
import sqlite3
import json

@function_tool
def query_database(
    table: str,
    where_clause: Optional[str] = None,
    limit: int = 10
) -> dict:
    """
    Query the database for records.

    Args:
        table: Table name to query (customers, orders, products)
        where_clause: Optional WHERE clause (e.g., "age > 30")
        limit: Maximum number of results

    Returns:
        Dictionary with results and metadata
    """
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    query = f"SELECT * FROM {table}"

    if where_clause:
        query += f" WHERE {where_clause}"

    query += f" LIMIT {limit}"

    try:
        cursor.execute(query)
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()

        results = [dict(zip(columns, row)) for row in rows]

        return {
            "success": True,
            "results": results,
            "count": len(results),
            "table": table
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "table": table
        }
    finally:
        conn.close()

@function_tool
def insert_record(
    table: str,
    data: dict
) -> dict:
    """
    Insert a new record into the database.

    Args:
        table: Table name
        data: Dictionary of column: value pairs

    Returns:
        Result of insertion
    """
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    columns = ", ".join(data.keys())
    placeholders = ", ".join("?" * len(data))
    query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"

    try:
        cursor.execute(query, list(data.values()))
        conn.commit()

        return {
            "success": True,
            "message": f"Record inserted into {table}",
            "row_id": cursor.lastrowid
        }
    except Exception as e:
        conn.rollback()
        return {
            "success": False,
            "error": str(e)
        }
    finally:
        conn.close()

# Agente de Dados
database_agent = Agent(
    name="Database Agent",
    instructions="""You are a database assistant.
    Help users query and manage database records.
    Always be specific about which table and what data you're looking for.""",
    tools=[query_database, insert_record]
)

# Usar
result = Runner.run_sync(
    database_agent,
    "Show me all customers from New York with age > 30"
)
```

### 6.2 Integração com Supabase/PostgreSQL

```python
from agents import Agent, Runner, function_tool
from supabase import create_client
from typing import Optional
import os
import json

# Inicializar Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

@function_tool
def query_supabase(
    table: str,
    select: str = "*",
    filters: Optional[dict] = None
) -> dict:
    """
    Query Supabase table.

    Args:
        table: Table name
        select: Columns to select (default: all)
        filters: Filter conditions as dict

    Returns:
        Query results
    """
    try:
        query = supabase.table(table).select(select)

        # Aplicar filtros
        if filters:
            for key, value in filters.items():
                if isinstance(value, (list, tuple)):
                    query = query.in_(key, value)
                else:
                    query = query.eq(key, value)

        response = query.execute()

        return {
            "success": True,
            "data": response.data,
            "count": len(response.data),
            "table": table
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "table": table
        }

@function_tool
def insert_supabase(table: str, record: dict) -> dict:
    """Insert record into Supabase"""
    try:
        response = supabase.table(table).insert(record).execute()
        return {
            "success": True,
            "data": response.data,
            "message": f"Record inserted into {table}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@function_tool
def update_supabase(
    table: str,
    record_id: int,
    updates: dict
) -> dict:
    """Update record in Supabase"""
    try:
        response = supabase.table(table).update(updates).eq("id", record_id).execute()
        return {
            "success": True,
            "data": response.data,
            "message": f"Record {record_id} updated"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Agente com acesso a Supabase
supabase_agent = Agent(
    name="Supabase Agent",
    instructions="""You are a database assistant connected to Supabase.
    Help users query, insert, and update records.
    Always confirm actions before modifying data.""",
    tools=[query_supabase, insert_supabase, update_supabase]
)

# Usar
result = Runner.run_sync(
    supabase_agent,
    "Show me all products in the 'electronics' category"
)
```

### 6.3 Padrão: MCP Server para Database

```python
from agents import Agent, Runner, MCPClientTool, ServerParameters

# Usar MCP server Supabase
mcp_supabase = MCPClientTool(
    server_params=ServerParameters(
        command="npx",
        args=["-y", "@supabase/mcp-server"],
        env={
            "SUPABASE_URL": os.getenv("SUPABASE_URL"),
            "SUPABASE_API_KEY": os.getenv("SUPABASE_API_KEY")
        }
    )
)

# Agente usa MCP automaticamente
database_agent = Agent(
    name="Database Agent",
    instructions="Query and manage database through Supabase MCP",
    tools=[mcp_supabase]
)

result = Runner.run_sync(
    database_agent,
    "List all orders from the last 7 days"
)
```

**Benefícios do MCP:**
- Sem necessidade de credentials no código
- Menos código de integração
- Compatibilidade com múltiplos backends

### 6.4 Retornando Dados Estruturados (JSON)

```python
from agents import Agent, Runner, function_tool
from pydantic import BaseModel
from typing import List

class Customer(BaseModel):
    id: int
    name: str
    email: str
    country: str

class CustomerList(BaseModel):
    customers: List[Customer]
    total_count: int

@function_tool
def get_customers(country: str) -> CustomerList:
    """
    Get customers from a specific country.

    Returns properly structured JSON data.
    """
    # Query database
    rows = db.query(
        "SELECT id, name, email, country FROM customers WHERE country = ?",
        country
    )

    customers = [
        Customer(
            id=row[0],
            name=row[1],
            email=row[2],
            country=row[3]
        )
        for row in rows
    ]

    return CustomerList(
        customers=customers,
        total_count=len(customers)
    )

# O output é validado e estruturado
agent = Agent(name="Customer Agent", tools=[get_customers])
result = Runner.run_sync(agent, "Get all customers from Brazil")

# result.final_output é JSON estruturado, não texto
print(result.final_output)  # Structured CustomerList object
```

**Fontes:**
- [Function calling | OpenAI API](https://platform.openai.com/docs/guides/function-calling)
- [Building a Simple Agentic Backend with FastAPI, Supabase, and the OpenAI Agents SDK](https://medium.com/@404foundme/building-a-simple-agentic-backend-with-fastapi-supabase-and-the-openai-agents-sdk-a93fc1ce21bf)
- [How to integrate Supabase with OpenAI Agent Builder - Composio](https://composio.dev/blog/supabase-mcp-with-openai-agent-builder)

---

## 7. Guardrails e Segurança

### 7.1 Input Guardrails

Validam entrada do usuário **ANTES** do agente executar.

```python
from agents import Agent, Runner, InputGuardrail

class ProfanityGuardrail(InputGuardrail):
    """Remove conteúdo ofensivo"""

    async def validate(self, input_text: str) -> tuple[bool, str]:
        """
        Validate input.

        Returns: (is_valid, modified_text)
        """
        profanities = ["bad_word_1", "bad_word_2"]

        for word in profanities:
            if word.lower() in input_text.lower():
                return False, "Input contains inappropriate content"

        return True, input_text

class LengthGuardrail(InputGuardrail):
    """Limitar tamanho de entrada"""

    async def validate(self, input_text: str) -> tuple[bool, str]:
        if len(input_text) > 10000:
            return False, "Input too long (max 10,000 characters)"
        return True, input_text

# Usar guardrails
safe_agent = Agent(
    name="Safe Agent",
    instructions="Help users safely",
    tools=[some_tool],
    guardrails=[
        ProfanityGuardrail(),
        LengthGuardrail()
    ]
)

# Se entrada violar guardrail, agente não executa
result = Runner.run_sync(safe_agent, user_input)
```

### 7.2 Output Guardrails

Validam saída final **ANTES** de retornar ao usuário.

```python
from agents import Agent, Runner, OutputGuardrail

class AccuracyGuardrail(OutputGuardrail):
    """Verificar se output é factualmente válido"""

    async def validate(self, output: str) -> tuple[bool, str]:
        # Exemplo: verificar citações
        if "according to" not in output.lower():
            return False, "Output must cite sources"
        return True, output

class SensitiveDataGuardrail(OutputGuardrail):
    """Remover dados sensíveis da saída"""

    async def validate(self, output: str) -> tuple[bool, str]:
        # Não expor passwords, API keys, SSNs
        sensitive_patterns = [
            r"password\s*[=:]\s*\S+",
            r"api[_-]?key\s*[=:]\s*\S+",
            r"\d{3}-\d{2}-\d{4}"  # SSN
        ]

        import re
        modified = output
        for pattern in sensitive_patterns:
            modified = re.sub(pattern, "[REDACTED]", modified, flags=re.IGNORECASE)

        return True, modified  # Sempre retorna True (corrige automaticamente)

# Usar
agent = Agent(
    name="Safe Output Agent",
    instructions="Answer questions accurately",
    tools=[search_tool],
    guardrails=[
        AccuracyGuardrail(),
        SensitiveDataGuardrail()
    ]
)
```

### 7.3 Tool Guardrails

Validam **ANTES** e **DEPOIS** de executar uma tool.

```python
from agents import Agent, Runner, ToolGuardrail, function_tool

@function_tool
def delete_user(user_id: str) -> dict:
    """Delete a user from database"""
    # Perigoso! Precisa de guardrail
    return db.delete("users", user_id)

class DeletionGuardrail(ToolGuardrail):
    """Prevenir exclusão acidental"""

    async def before_execution(self, tool_name: str, args: dict) -> tuple[bool, dict]:
        """Verificar ANTES da execução"""
        if tool_name == "delete_user":
            # Exigir confirmação
            print(f"⚠️  WARNING: About to delete user {args['user_id']}")
            # Em produção: implementar human approval

            # Se algo suspeito, bloquear
            if args['user_id'] == "admin":
                return False, {"error": "Cannot delete admin user"}

        return True, args

    async def after_execution(self, tool_name: str, result: dict) -> tuple[bool, dict]:
        """Verificar DEPOIS da execução"""
        if result.get("success"):
            print(f"✓ Successfully deleted {tool_name}")
        return True, result

agent = Agent(
    name="Admin Agent",
    instructions="Manage users",
    tools=[delete_user],
    guardrails=[DeletionGuardrail()]
)
```

### 7.4 Modos de Execução de Guardrails

```python
from agents import Agent, ParallelGuardrailMode

# Modo Paralelo (padrão - melhor latência)
agent_parallel = Agent(
    name="Fast Agent",
    instructions="...",
    tools=[...],
    guardrails=[...],
    guardrail_execution_mode=ParallelGuardrailMode(
        run_in_parallel=True  # Guardrail e Agent rodam em paralelo
    )
)
# ⚠️  Se guardrail falhar, agent pode já ter consumido tokens

# Modo Bloqueante (melhor para segurança)
from agents import BlockingGuardrailMode

agent_blocking = Agent(
    name="Secure Agent",
    instructions="...",
    tools=[...],
    guardrails=[...],
    guardrail_execution_mode=BlockingGuardrailMode(
        run_in_parallel=False  # Guardrail completa ANTES do agent
    )
)
# ✓ Se guardrail falhar, agent nunca executa
# ✗ Latência um pouco maior
```

**Trade-off:**
- **Paralelo:** Latência menor, mas pode gastar tokens se guardrail falhar
- **Bloqueante:** Latência maior, mas zero tokens desperdiçados em casos de falha

### 7.5 Estratégia em Camadas (Layered Defense)

```python
from agents import Agent, InputGuardrail, OutputGuardrail, ToolGuardrail

class LayeredDefenseAgent:
    """Múltiplos guardrails em camadas"""

    def __init__(self):
        self.agent = Agent(
            name="Secure Agent",
            instructions="Handle sensitive operations securely",
            tools=[
                perform_transaction_tool,
                access_secure_data_tool
            ],
            guardrails=[
                # Camada 1: Input validation
                InputLengthGuardrail(),
                InputSanitizationGuardrail(),
                InputAuthenticationGuardrail(),

                # Camada 2: Tool usage
                ToolRateLimitGuardrail(),
                ToolAuthorizationGuardrail(),

                # Camada 3: Output safety
                OutputSensitiveDataGuardrail(),
                OutputSizeGuardrail(),
                OutputAccuracyGuardrail()
            ]
        )

    def process(self, user_input: str, user_id: str):
        """Process with layered security"""
        # Each layer can block or modify the request
        result = Runner.run_sync(
            self.agent,
            user_input,
            user_context={"user_id": user_id}
        )
        return result
```

**Fonte:**
- [Guardrails - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/guardrails/)
- [Safety in building agents | OpenAI API](https://platform.openai.com/docs/guides/agent-builder-safety)

---

## 8. Tracing e Observabilidade

### 8.1 Tracing Automático

O SDK rastreia **tudo** automaticamente:

```python
from agents import Agent, Runner

agent = Agent(name="Analyst", tools=[search_tool, analyze_tool])

# Rastreamento automático
result = Runner.run_sync(agent, "Analyze market trends")

# Acessar trace completo
trace = result.trace

# Events incluem:
# - LLM generations (prompts + completions)
# - Tool calls (quais ferramentas foram invocadas)
# - Handoffs (transferências entre agentes)
# - Guardrail validations
# - Custom events
# - Erros e timeouts

print(f"Total events: {len(trace.events)}")
print(f"LLM calls: {trace.events.filter(type='llm')}")
print(f"Tool calls: {trace.events.filter(type='tool_call')}")
```

### 8.2 Dashboard de Traces

Visualizar traces em dashboard:

```python
# Traces aparecem automaticamente em:
# https://platform.openai.com/account/tracing

# Você pode:
# - Visualizar fluxo completo de execução
# - Ver tempo de cada etapa
# - Debugar problemas
# - Monitorar em produção
```

### 8.3 Custom Events

```python
from agents import Agent, Runner

agent = Agent(
    name="Custom Event Agent",
    instructions="...",
    tools=[...]
)

result = Runner.run_sync(agent, "Do something complex")

# Adicionar eventos customizados ao trace
result.trace.add_event(
    name="custom_validation",
    type="validation",
    details={
        "checked": "data_integrity",
        "status": "passed",
        "duration_ms": 150
    }
)

# Esses eventos aparecem no dashboard
```

### 8.4 Logging Estruturado

```python
from agents import Agent, Runner
import logging
from pythonjsonlogger import jsonlogger

# Configurar logging JSON
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

def run_with_logging(agent: Agent, user_input: str):
    """Execute agent with detailed logging"""

    logger.info("Agent execution started", extra={
        "agent_name": agent.name,
        "input_length": len(user_input),
        "tools_available": len(agent.tools)
    })

    try:
        result = Runner.run_sync(agent, user_input)

        logger.info("Agent execution completed", extra={
            "agent_name": agent.name,
            "success": True,
            "output_length": len(result.final_output),
            "tokens_used": result.usage.total_tokens,
            "duration_ms": result.execution_time_ms
        })

        return result

    except Exception as e:
        logger.error("Agent execution failed", extra={
            "agent_name": agent.name,
            "error": str(e),
            "error_type": type(e).__name__
        })
        raise
```

### 8.5 Integração com Observabilidade (Langfuse, etc)

```python
from agents import Agent, Runner
from langfuse.openai import OpenAI

# Usar Langfuse para observabilidade
client = OpenAI(api_key="...", base_url="https://...")

def run_with_langfuse(agent: Agent, user_input: str):
    """Execute with Langfuse tracing"""

    result = Runner.run_sync(agent, user_input)

    # Trace data fluira para Langfuse
    # Dashboard em: https://langfuse.com

    return result
```

**Tipos de Events Rastreados:**
1. **LLM Generation** - Prompts enviados, completions recebidas
2. **Tool Calls** - Quais tools foram invocadas, argumentos, resultados
3. **Handoffs** - Transferências entre agentes
4. **Guardrails** - Validações que passaram/falharam
5. **Tokens** - Consumo de tokens por chamada
6. **Latency** - Tempo de cada operação

**Fontes:**
- [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)
- [Example - Tracing and Evaluation for the OpenAI-Agents SDK - Langfuse](https://langfuse.com/guides/cookbook/example_evaluating_openai_agents)

---

## 9. Comparações com Frameworks Alternativos

### 9.1 Resumo Comparativo

| Aspecto | OpenAI Agents SDK | LangGraph | CrewAI | AutoGen |
|---------|-------------------|-----------|--------|---------|
| **Modelo** | Agent-based | Graph-based | Role-based | Conversation-based |
| **Facilidade** | ⭐⭐⭐⭐⭐ Muito fácil | ⭐⭐ Complexo | ⭐⭐⭐⭐ Fácil | ⭐⭐⭐ Média |
| **Controle** | Alto (você escolhe) | Muito alto | Médio-Alto | Médio |
| **Curva aprendizado** | Suave | Acentuada | Média | Média |
| **Production-ready** | Sim (2025+) | Sim | Sim | Parcial |
| **Observabilidade** | Excelente (built-in) | Boa | Boa | Limitada |
| **Provider-agnostic** | Sim (100+ LLMs) | Sim | Sim (OpenAI focus) | Sim |
| **Community** | Crescente | Grande | Crescente | Grande |
| **Licensing** | MIT | MIT | Apache 2.0 | Apache 2.0 |

### 9.2 LangGraph (vs OpenAI Agents SDK)

**LangGraph é para você se:**
- Precisa controle explícito de fluxo (graph structure)
- Workflows com branches/condições complexas
- Integração com LangChain ecosystem

**Exemplo LangGraph:**
```python
from langgraph.graph import StateGraph, START, END

# Define estado explícito
def define_state():
    return {
        "input": str,
        "research": str,
        "analysis": str,
        "output": str
    }

# Cria grafo
graph = StateGraph(define_state)

# Adiciona nós
graph.add_node("research", research_node)
graph.add_node("analyze", analyze_node)
graph.add_node("write", write_node)

# Define fluxo explícito
graph.add_edge(START, "research")
graph.add_edge("research", "analyze")
graph.add_edge("analyze", "write")
graph.add_edge("write", END)

# Compilar
runnable = graph.compile()
result = runnable.invoke({"input": "..."})
```

**Quando usar LangGraph:**
- Workflows com múltiplas branches condicionais
- Necessidade de loop ou retry explícito
- Integração profunda com LangChain

### 9.3 CrewAI (vs OpenAI Agents SDK)

**CrewAI é para você se:**
- Precisa de agentes com "personalidades" distintas
- Colaboração e debate entre agentes
- Hierarquia de task/role clara

**Exemplo CrewAI:**
```python
from crewai import Agent, Task, Crew

# Define agentes com roles
researcher = Agent(
    role="Research Analyst",
    goal="Gather comprehensive information",
    tools=[search_tool, fetch_tool],
    backstory="Expert researcher with 20 years experience"
)

analyst = Agent(
    role="Data Analyst",
    goal="Analyze and draw insights",
    tools=[analysis_tool],
    backstory="Statistical expert"
)

# Define tasks
research_task = Task(
    description="Research the topic",
    agent=researcher
)

analysis_task = Task(
    description="Analyze findings",
    agent=analyst
)

# Crew orquestra
crew = Crew(
    agents=[researcher, analyst],
    tasks=[research_task, analysis_task]
)

result = crew.kickoff()
```

**Quando usar CrewAI:**
- Role-based team structure
- Agentes com personalidades distintas
- Foco em colaboração entre agentes

### 9.4 AutoGen (vs OpenAI Agents SDK)

**AutoGen é para você se:**
- Simulação de conversas entre múltiplos agentes
- Agentes "conversam" para resolver problemas
- Padrão Group Chat

**Exemplo AutoGen:**
```python
from autogen import AssistantAgent, UserProxyAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4o"}
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="TERMINATE"
)

# Conversação multi-turn
user_proxy.initiate_chat(
    assistant,
    message="Analyze this data and provide insights"
)
```

**Quando usar AutoGen:**
- Simulação de conversas entre agentes
- Agentes "negociam" ou "debatem"
- Padrão menos estruturado

### 9.5 Decision Matrix

**Use OpenAI Agents SDK se você quer:**
- ✅ Começar rapidamente (setup em 5 min)
- ✅ Produção-ready com suporte OpenAI
- ✅ Tracing e observabilidade built-in
- ✅ Trabalhar com OpenAI ou qualquer LLM compatível
- ✅ Handoffs simples e eficientes
- ✅ Menos abstração, mais controle

**Use LangGraph se você precisa:**
- ✅ Workflows com múltiplas branches condicionais
- ✅ Controle total de fluxo (graph structure)
- ✅ Integração profunda com LangChain
- ✅ Loop e retry lógica complexa

**Use CrewAI se você quer:**
- ✅ Agentes com papéis e personalidades
- ✅ Colaboração e debate entre agentes
- ✅ Estrutura de time clara

**Use AutoGen se você precisa:**
- ✅ Conversas tipo multi-agent simuladas
- ✅ Agentes que "negoceiam" soluções
- ✅ Padrão conversacional

**Fontes:**
- [Comparing Open-Source AI Agent Frameworks - Langfuse Blog](https://langfuse.com/blog/2025-03-19-ai-agent-comparison)
- [OpenAI Agents SDK vs LangGraph vs Autogen vs CrewAI - Composio](https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai)
- [A Detailed Comparison of Top 6 AI Agent Frameworks in 2025](https://www.turing.com/resources/ai-agent-frameworks)

---

## 10. Best Practices para Produção

### 10.1 Estrutura de Projeto

```
my-agent-system/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py
│   │   ├── support_agent.py
│   │   ├── research_agent.py
│   │   └── admin_agent.py
│   │
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── database_tools.py
│   │   ├── external_api_tools.py
│   │   └── validation_tools.py
│   │
│   ├── guardrails/
│   │   ├── __init__.py
│   │   ├── input_guardrails.py
│   │   ├── output_guardrails.py
│   │   └── tool_guardrails.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py
│   │   └── responses.py
│   │
│   └── config.py
│
├── tests/
│   ├── test_agents.py
│   ├── test_tools.py
│   └── test_guardrails.py
│
├── .env.example
├── requirements.txt
├── docker-compose.yml
└── README.md
```

### 10.2 Configuração com Environment Variables

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # OpenAI
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

    # Database
    DATABASE_URL = os.getenv("DATABASE_URL")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    # Tracing
    LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
    LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")

    # Guardrails
    ENABLE_GUARDRAILS = os.getenv("ENABLE_GUARDRAILS", "true").lower() == "true"
    REQUIRE_HUMAN_APPROVAL = os.getenv("REQUIRE_HUMAN_APPROVAL", "false").lower() == "true"

    # Limits
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "4096"))
    MAX_TOOL_CALLS = int(os.getenv("MAX_TOOL_CALLS", "20"))
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", "300"))
```

### 10.3 Token Management e Cost Optimization

```python
from agents import Agent, Runner, ModelSettings

def create_cost_optimized_agent():
    """Agent otimizado para custo"""

    agent = Agent(
        name="Cost-Optimized Agent",
        instructions="Be concise and efficient",
        model_settings=ModelSettings(
            model="gpt-4o-mini",  # Modelo mais barato
            temperature=0.3,       # Mais determinístico (menos tokens)
            max_tokens=1024,       # Limite tokens output
            top_p=0.8              # Menos variação
        ),
        tools=[...]
    )

    return agent

def run_with_cost_tracking(agent: Agent, user_input: str):
    """Execute e rastrear custos"""

    result = Runner.run_sync(agent, user_input)

    # Calcular custo
    input_tokens = result.usage.prompt_tokens
    output_tokens = result.usage.completion_tokens

    # Preços (atualizar conforme necessário)
    input_cost_per_1k = 0.005  # $0.005 per 1K input tokens
    output_cost_per_1k = 0.015 # $0.015 per 1K output tokens

    total_cost = (
        (input_tokens / 1000) * input_cost_per_1k +
        (output_tokens / 1000) * output_cost_per_1k
    )

    print(f"Tokens used: {result.usage.total_tokens}")
    print(f"Estimated cost: ${total_cost:.4f}")

    return result

# Usar Batch API para non-time-sensitive tasks (50% savings)
from openai import AsyncOpenAI

async def run_batch_jobs():
    """Use Batch API for cost savings"""
    client = AsyncOpenAI(api_key=...)

    # Preparar batch de requests
    batch_input_file = client.beta.files.upload(
        file=("requests.jsonl", open("requests.jsonl", "rb")),
        purpose="batch"
    )

    batch = client.beta.batches.create(
        input_file_id=batch_input_file.id,
        endpoint="/v1/chat/completions",
        completion_window="24h"
    )

    # Aguardar resultado (24 horas)
    # 50% desconto em inputs e outputs
```

### 10.4 Error Handling e Retry

```python
from agents import Agent, Runner
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

class RobustAgentRunner:
    def __init__(self, agent: Agent, max_retries: int = 3):
        self.agent = agent
        self.max_retries = max_retries

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def run_with_retry(self, user_input: str):
        """Execute com retry automático"""
        try:
            result = Runner.run_sync(
                self.agent,
                user_input,
                timeout=300
            )

            if not result.success:
                raise RuntimeError(f"Agent failed: {result.error}")

            return result

        except Exception as e:
            print(f"Attempt failed: {str(e)}, retrying...")
            raise

    async def run_with_fallback(self, user_input: str, fallback_agent: Agent):
        """Execute com agent fallback"""
        try:
            result = await self.agent.run_async(user_input)
            return result
        except Exception as e:
            print(f"Primary agent failed, using fallback: {str(e)}")
            result = await fallback_agent.run_async(user_input)
            return result
```

### 10.5 Logging e Monitoring

```python
import logging
from datetime import datetime
import json

class ProductionLogger:
    def __init__(self):
        self.logger = logging.getLogger("agent-system")
        self.logger.setLevel(logging.INFO)

        # File handler para auditoria
        handler = logging.FileHandler(f"logs/agent-{datetime.now().strftime('%Y%m%d')}.log")
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

    def log_execution(self, agent_name: str, user_id: str, user_input: str, result):
        """Log detailed execution"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "agent": agent_name,
            "user_id": user_id,
            "input_length": len(user_input),
            "output_length": len(result.final_output) if result.final_output else 0,
            "tokens_used": result.usage.total_tokens,
            "execution_time_ms": result.execution_time_ms,
            "success": result.success,
            "tool_calls": len(result.tool_calls_made),
            "cost_estimate": self._estimate_cost(result)
        }

        self.logger.info(json.dumps(log_entry))

    def log_error(self, agent_name: str, user_id: str, error: Exception):
        """Log errors with context"""
        self.logger.error(
            f"Agent {agent_name} failed for user {user_id}: {str(error)}",
            exc_info=True
        )

    def _estimate_cost(self, result) -> float:
        input_cost = (result.usage.prompt_tokens / 1000) * 0.005
        output_cost = (result.usage.completion_tokens / 1000) * 0.015
        return input_cost + output_cost
```

### 10.6 Testing e Quality Assurance

```python
import pytest
from agents import Agent, Runner

class TestAgents:

    @pytest.fixture
    def support_agent(self):
        return Agent(
            name="Support Agent",
            instructions="Help customers",
            tools=[search_faq, create_ticket]
        )

    def test_agent_basic_functionality(self, support_agent):
        """Test basic agent response"""
        result = Runner.run_sync(
            support_agent,
            "How do I reset my password?"
        )

        assert result.success
        assert len(result.final_output) > 0
        assert "password" in result.final_output.lower()

    def test_agent_tool_calling(self, support_agent):
        """Test que agent chamou tools corretamente"""
        result = Runner.run_sync(
            support_agent,
            "I have a billing issue"
        )

        assert result.success
        assert any(
            "create_ticket" in str(call)
            for call in result.tool_calls_made
        )

    def test_agent_guardrails(self):
        """Test guardrails work"""
        agent_with_guardrails = Agent(
            name="Safe Agent",
            instructions="...",
            tools=[...],
            guardrails=[LengthGuardrail()]
        )

        # Input muito longo deve falhar
        long_input = "x" * 20000
        result = Runner.run_sync(agent_with_guardrails, long_input)

        assert not result.success
        assert "too long" in result.error.lower()
```

### 10.7 Escalabilidade e Deployment

```dockerfile
# Dockerfile para agent service
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY .env .env

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  agent-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ENABLE_GUARDRAILS=true
    depends_on:
      - postgres
    restart: always

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```python
# API FastAPI
from fastapi import FastAPI, HTTPException
from agents import Agent, Runner
from typing import Optional

app = FastAPI()

@app.post("/chat")
async def chat(
    agent_name: str,
    message: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None
):
    """Chat endpoint"""
    try:
        agent = get_agent(agent_name)
        session = get_session(session_id) if session_id else None

        result = Runner.run_sync(
            agent,
            message,
            session=session
        )

        if session:
            save_session(session)

        return {
            "success": result.success,
            "response": result.final_output,
            "tokens_used": result.usage.total_tokens,
            "execution_time_ms": result.execution_time_ms
        }

    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents_available": list(AGENTS.keys())
    }
```

### 10.8 Monitoring em Produção

```python
from opentelemetry import metrics, trace
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import OTLPMetricExporter

# Setup Prometheus metrics
prometheus_reader = PrometheusMetricReader()
provider = MeterProvider(metric_readers=[prometheus_reader])
metrics.set_meter_provider(provider)

meter = metrics.get_meter("agent-system")

# Criar métricas
agent_calls = meter.create_counter(
    "agent.calls.total",
    description="Total agent executions"
)

agent_errors = meter.create_counter(
    "agent.errors.total",
    description="Total agent errors"
)

agent_latency = meter.create_histogram(
    "agent.latency.ms",
    description="Agent execution latency in ms"
)

token_usage = meter.create_histogram(
    "agent.tokens.used",
    description="Tokens used per execution"
)

# Usar métricas
def run_monitored(agent: Agent, user_input: str):
    start = time.time()
    try:
        result = Runner.run_sync(agent, user_input)

        agent_calls.add(1, {"agent": agent.name, "status": "success"})
        agent_latency.record(
            (time.time() - start) * 1000,
            {"agent": agent.name}
        )
        token_usage.record(
            result.usage.total_tokens,
            {"agent": agent.name}
        )

        return result

    except Exception as e:
        agent_errors.add(1, {"agent": agent.name, "error_type": type(e).__name__})
        raise
```

### 10.9 Checklist de Production Readiness

```markdown
## Production Readiness Checklist

### Security
- [ ] Guardrails implementados (Input, Output, Tool)
- [ ] Sensitive data masking implementado
- [ ] Authentication/Authorization em lugar
- [ ] Rate limiting configurado
- [ ] Input validation em todas as tools
- [ ] Secrets em environment variables (.env)
- [ ] API keys rotacionadas regularmente

### Performance
- [ ] Token management otimizado
- [ ] Caching implementado (Redis/cache layer)
- [ ] Latency targets definidos e monitorados
- [ ] Paralelização de tools implementada
- [ ] Batch API para non-time-sensitive tasks

### Reliability
- [ ] Error handling e retry logic
- [ ] Fallback agents implementados
- [ ] Health checks em lugar
- [ ] Circuit breakers para external APIs
- [ ] Graceful degradation

### Observability
- [ ] Tracing completo habilitado
- [ ] Logging estruturado implementado
- [ ] Metrics exportadas (Prometheus)
- [ ] Alertas configurados
- [ ] Dashboard de monitoramento

### Testing
- [ ] Unit tests para tools e agents
- [ ] Integration tests
- [ ] Guardrail tests
- [ ] Load testing realizado
- [ ] Security testing realizado

### Compliance
- [ ] Audit logging implementado
- [ ] Data retention policies
- [ ] Privacy compliance (GDPR, etc)
- [ ] Cost tracking e alertas
- [ ] SLA monitoring
```

---

## Resumo Executivo

### Quando usar OpenAI Agents SDK

✅ **Use-o se:**
- Quer começar rápido (5 minutos setup)
- Precisa de production-ready em 2025
- Quer suporte oficialOpenAI
- Pode trabalhar com OpenAI ou LLMs compatíveis
- Precisa de observabilidade built-in (tracing)
- Quer modelo simples com poucas abstrações

❌ **NÃO use-o se:**
- Precisa de workflows com múltiplas branches condicionais complexas (use LangGraph)
- Quer agentes com "personalidades" distintas (use CrewAI)
- Precisa de integração profunda com LangChain (use LangGraph)

### Arquitetura Recomendada para Produção

```
┌─────────────────────┐
│   FastAPI/Flask     │ (API)
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Auth + Guardrails  │ (Security)
└──────────┬──────────┘
           │
┌──────────▼──────────────────┐
│   OpenAI Agents SDK         │
│  ┌────────────────────────┐ │
│  │ Manager Agent (Triage) │ │
│  │ ├─ Billing Agent       │ │
│  │ ├─ Support Agent       │ │
│  │ └─ Tech Agent          │ │
│  └────────────────────────┘ │
└──────────┬──────────────────┘
           │
┌──────────▼──────────┐
│  Tools/Functions    │
│  ├─ DB Tools        │
│  ├─ API Calls       │
│  └─ External Svcs   │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  External Services  │
│  ├─ Supabase/DB     │
│  ├─ APIs            │
│  └─ Cache (Redis)   │
└─────────────────────┘
```

### Próximos Passos

1. **Instalar SDK:**
   ```bash
   pip install openai-agents
   ```

2. **Ler documentação oficial:**
   - [OpenAI Agents SDK Docs](https://openai.github.io/openai-agents-python/)
   - [OpenAI Agents Platform Docs](https://platform.openai.com/docs/guides/agents-sdk)

3. **Explorar exemplos:**
   - [OpenAI Cookbook - Agents Examples](https://cookbook.openai.com/topic/agents)
   - [GitHub - openai/openai-agents-python](https://github.com/openai/openai-agents-python)

4. **Construir seu primeiro agente:**
   - Comece com um agent simples com 2-3 tools
   - Adicione guardrails
   - Implemente logging e monitoring
   - Deploy em staging antes de produção

---

## Referências Completas

### Documentação Oficial

1. [OpenAI Agents SDK (openai.github.io)](https://openai.github.io/openai-agents-python/)
2. [OpenAI Agents SDK | Platform Docs](https://platform.openai.com/docs/guides/agents-sdk)
3. [OpenAI for Developers in 2025](https://developers.openai.com/blog/openai-for-developers-2025/)
4. [OpenAI Cookbook - Agents](https://cookbook.openai.com/topic/agents)
5. [Function calling | OpenAI API](https://platform.openai.com/docs/guides/function-calling)
6. [Structured model outputs | OpenAI API](https://platform.openai.com/docs/guides/structured-outputs)

### Guias Técnicos

7. [Orchestrating Agents: Routines and Handoffs | OpenAI Cookbook](https://cookbook.openai.com/examples/orchestrating_agents)
8. [Multi-Agent Portfolio Collaboration | OpenAI Cookbook](https://cookbook.openai.com/examples/agents_sdk/multi-agent-portfolio-collaboration/multi_agent_portfolio_collaboration)
9. [Parallel Agents with OpenAI Agents SDK | OpenAI Cookbook](https://cookbook.openai.com/examples/agents_sdk/parallel_agents)
10. [Context Engineering - Session Memory | OpenAI Cookbook](https://cookbook.openai.com/examples/agents_sdk/session_memory)

### Comparações e Análises

11. [Comparing Open-Source AI Agent Frameworks - Langfuse Blog](https://langfuse.com/blog/2025-03-19-ai-agent-comparison)
12. [OpenAI Agents SDK vs LangGraph vs Autogen vs CrewAI - Composio](https://composio.dev/blog/openai-agents-sdk-vs-langgraph-vs-autogen-vs-crewai)
13. [A Detailed Comparison of Top 6 AI Agent Frameworks in 2025 - Turing](https://www.turing.com/resources/ai-agent-frameworks)
14. [Best AI Agent Frameworks 2025 - Langwatch](https://langwatch.ai/blog/best-ai-agent-frameworks-in-2025-comparing-langgraph-dspy-crewai-agno-and-more)
15. [OpenAI Agents SDK Review (December 2025) - Mem0](https://mem0.ai/blog/openai-agents-sdk-review)

### Integração com Banco de Dados

16. [Building a Simple Agentic Backend with FastAPI, Supabase, and OpenAI Agents SDK - Medium](https://medium.com/@404foundme/building-a-simple-agentic-backend-with-fastapi-supabase-and-the-openai-agents-sdk-a93fc1ce21bf)
17. [How to integrate Supabase with OpenAI Agent Builder - Composio](https://composio.dev/blog/supabase-mcp-with-openai-agent-builder)
18. [Supabase Development with AI Agents - Medium](https://medium.com/the-agent-protocol/supabase-development-with-ai-agents-a-comprehensive-guide-to-automating-your-workflow-5cf0eda5bc16)

### Segurança e Best Practices

19. [Safety in building agents | OpenAI API](https://platform.openai.com/docs/guides/agent-builder-safety)
20. [Production best practices | OpenAI API](https://platform.openai.com/docs/guides/production-best-practices)
21. [Best Practices for AI API Cost & Throughput Management - Skywork](https://skywork.ai/blog/ai-api-cost-throughput-pricing-token-math-budgets-2025/)

### Observabilidade

22. [Example - Tracing and Evaluation for OpenAI-Agents SDK - Langfuse](https://langfuse.com/guides/cookbook/example_evaluating_openai_agents)
23. [Tracing - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/tracing/)

### Repositórios GitHub

24. [GitHub - openai/openai-agents-python](https://github.com/openai/openai-agents-python)
25. [GitHub - openai/swarm (Precursor)](https://github.com/openai/swarm)
26. [GitHub - openai/openai-realtime-agents](https://github.com/openai/openai-realtime-agents)

---

**Última atualização:** Fevereiro 2026
**Status da pesquisa:** Completo
**Próximas revisões:** Q2 2026
