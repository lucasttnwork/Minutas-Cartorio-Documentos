# Exemplos Práticos: OpenAI Agents SDK

**Descrição:** Códigos prontos para copiar e colar para começar com Agents SDK
**Nível:** Iniciante até Avançado
**Data:** Fevereiro 2026

---

## Índice

1. [Setup Inicial](#setup-inicial)
2. [Agent Simples (Hello World)](#agent-simples---hello-world)
3. [Multi-Tool Agent](#multi-tool-agent)
4. [Agent com Banco de Dados](#agent-com-banco-de-dados)
5. [Multi-Agent Orchestration](#multi-agent-orchestration)
6. [Exemplo Completo: Sistema de Suporte](#exemplo-completo-sistema-de-suporte)

---

## Setup Inicial

### 1. Instalar Dependências

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Instalar pacotes
pip install openai-agents openai python-dotenv

# Opcional: para banco de dados
pip install supabase psycopg2-binary
```

### 2. Configurar Environment Variables

```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o

# Database (opcional)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...supabase.co
SUPABASE_KEY=...

# Logging
LOG_LEVEL=INFO
```

### 3. Carregar Configurações

```python
# config.py
import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
DATABASE_URL = os.getenv("DATABASE_URL")
```

---

## Agent Simples - Hello World

### Exemplo 1: Agent Básico sem Tools

```python
# 1_basic_agent.py
from agents import Agent, Runner
from config import OPENAI_MODEL

# Criar agent
simple_agent = Agent(
    name="SimpleAssistant",
    instructions="You are a helpful assistant. Answer questions clearly and concisely."
)

# Executar
if __name__ == "__main__":
    result = Runner.run_sync(
        simple_agent,
        "Explain quantum computing in one paragraph"
    )

    print("=" * 60)
    print("RESPONSE:")
    print(result.final_output)
    print("=" * 60)
    print(f"Tokens used: {result.usage.total_tokens}")
    print(f"Model: {result.model}")
```

**Output esperado:**
```
============================================================
RESPONSE:
Quantum computing leverages quantum mechanics principles like
superposition and entanglement to process information differently
than classical computers. Unlike classical bits (0 or 1), quantum
bits (qubits) can exist in multiple states simultaneously, enabling
quantum computers to solve certain complex problems exponentially
faster. Applications include drug discovery, optimization, and
cryptography.
============================================================
Tokens used: 84
Model: gpt-4o
```

### Exemplo 2: Agent com Contexto

```python
# 2_agent_with_system_prompt.py
from agents import Agent, Runner

specialist_agent = Agent(
    name="DataAnalyst",
    instructions="""You are a professional data analyst with expertise in:
    - Statistical analysis
    - Data visualization
    - Business intelligence
    - Trend forecasting

    Always provide:
    1. Clear insights
    2. Supporting data
    3. Recommended actions

    Use technical language but explain complex concepts clearly."""
)

# Executar
result = Runner.run_sync(
    specialist_agent,
    "Analyze sales trends from Q1 to Q3 2025"
)

print(result.final_output)
```

---

## Multi-Tool Agent

### Exemplo 3: Agent com Function Tools

```python
# 3_agent_with_tools.py
from agents import Agent, Runner, function_tool
from datetime import datetime
import json

# Definir tools
@function_tool
def get_current_date() -> str:
    """Get today's date in YYYY-MM-DD format"""
    return datetime.now().strftime("%Y-%m-%d")

@function_tool
def get_weather(city: str) -> dict:
    """
    Get weather for a specific city.

    Args:
        city: City name

    Returns:
        Weather information
    """
    # Simular API call
    weather_data = {
        "São Paulo": {"temp": 28, "condition": "Sunny", "humidity": 65},
        "Rio de Janeiro": {"temp": 32, "condition": "Cloudy", "humidity": 70},
        "Salvador": {"temp": 30, "condition": "Rainy", "humidity": 85},
    }

    if city in weather_data:
        return weather_data[city]
    return {"error": f"Weather data not available for {city}"}

@function_tool
def calculate_statistics(numbers: list) -> dict:
    """
    Calculate statistics for a list of numbers.

    Args:
        numbers: List of numbers

    Returns:
        Dictionary with mean, median, std dev, min, max
    """
    if not numbers:
        return {"error": "Empty list"}

    import statistics

    return {
        "count": len(numbers),
        "mean": statistics.mean(numbers),
        "median": statistics.median(numbers),
        "stdev": statistics.stdev(numbers) if len(numbers) > 1 else 0,
        "min": min(numbers),
        "max": max(numbers)
    }

# Criar agent com tools
utility_agent = Agent(
    name="UtilityAssistant",
    instructions="""You are a helpful utility assistant.
    You have access to tools for:
    - Getting current date
    - Getting weather
    - Calculating statistics

    Use these tools to help answer questions.""",
    tools=[get_current_date, get_weather, calculate_statistics]
)

# Executar
if __name__ == "__main__":
    # Test 1: Date
    result1 = Runner.run_sync(utility_agent, "What's today's date?")
    print("Test 1 - Date:")
    print(result1.final_output)
    print()

    # Test 2: Weather
    result2 = Runner.run_sync(utility_agent, "How's the weather in São Paulo?")
    print("Test 2 - Weather:")
    print(result2.final_output)
    print()

    # Test 3: Statistics
    result3 = Runner.run_sync(
        utility_agent,
        "What are the statistics for these numbers: 10, 20, 30, 40, 50?"
    )
    print("Test 3 - Statistics:")
    print(result3.final_output)
```

### Exemplo 4: Validação com Pydantic

```python
# 4_agent_with_validation.py
from agents import Agent, Runner, function_tool
from pydantic import BaseModel, Field
from typing import Optional

class UserQuery(BaseModel):
    """Validated user query"""
    search_term: str = Field(..., min_length=1, max_length=100)
    limit: int = Field(default=10, ge=1, le=100)
    category: Optional[str] = None

class SearchResult(BaseModel):
    """Validated search result"""
    query: str
    results_count: int
    items: list[str]

@function_tool
def search_products(query: UserQuery) -> SearchResult:
    """
    Search for products with validation.

    The UserQuery model automatically validates inputs.
    """
    # Simular busca
    items = [
        f"{query.search_term.capitalize()} Product {i+1}"
        for i in range(query.limit)
    ]

    return SearchResult(
        query=query.search_term,
        results_count=len(items),
        items=items
    )

# Agent que usa validação
search_agent = Agent(
    name="SearchAgent",
    instructions="Help users search for products with proper validation",
    tools=[search_products]
)

# Executar
if __name__ == "__main__":
    result = Runner.run_sync(
        search_agent,
        "Search for laptops (limit to 5 results)"
    )
    print(result.final_output)
```

---

## Agent com Banco de Dados

### Exemplo 5: Agent com SQLite

```python
# 5_agent_with_database.py
from agents import Agent, Runner, function_tool
import sqlite3
from typing import Optional
import os

# Inicializar banco de dados
def init_database():
    """Create sample database"""
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    # Criar tabela
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        country TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Inserir dados de exemplo
    example_data = [
        ("Alice Silva", "alice@example.com", "Brazil"),
        ("Bob Santos", "bob@example.com", "Brazil"),
        ("Carol Costa", "carol@example.com", "Portugal"),
        ("David oliveira", "david@example.com", "Brazil"),
    ]

    cursor.execute("DELETE FROM customers")  # Limpar para demo
    for name, email, country in example_data:
        cursor.execute(
            "INSERT INTO customers (name, email, country) VALUES (?, ?, ?)",
            (name, email, country)
        )

    conn.commit()
    conn.close()

# Definir tools
@function_tool
def get_customer(customer_id: int) -> dict:
    """Get customer details by ID"""
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, email, country FROM customers WHERE id = ?", (customer_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "country": row[3]
        }
    return {"error": f"Customer {customer_id} not found"}

@function_tool
def list_customers(country: Optional[str] = None, limit: int = 10) -> dict:
    """
    List customers, optionally filtered by country.

    Args:
        country: Optional country filter
        limit: Maximum results
    """
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    if country:
        cursor.execute(
            "SELECT id, name, email, country FROM customers WHERE country = ? LIMIT ?",
            (country, limit)
        )
    else:
        cursor.execute(
            "SELECT id, name, email, country FROM customers LIMIT ?",
            (limit,)
        )

    rows = cursor.fetchall()
    conn.close()

    customers = [
        {"id": row[0], "name": row[1], "email": row[2], "country": row[3]}
        for row in rows
    ]

    return {
        "total": len(customers),
        "customers": customers
    }

@function_tool
def add_customer(name: str, email: str, country: str) -> dict:
    """Add a new customer"""
    conn = sqlite3.connect("business.db")
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO customers (name, email, country) VALUES (?, ?, ?)",
            (name, email, country)
        )
        conn.commit()

        return {
            "success": True,
            "message": f"Customer {name} added successfully",
            "customer_id": cursor.lastrowid
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        conn.close()

# Criar agent
database_agent = Agent(
    name="DatabaseAgent",
    instructions="""You are a database assistant for customer management.
    You can:
    - Look up customer details
    - List customers
    - Add new customers

    Be helpful and provide clear information.""",
    tools=[get_customer, list_customers, add_customer]
)

# Executar
if __name__ == "__main__":
    # Inicializar DB
    init_database()

    # Test 1: Get customer
    result1 = Runner.run_sync(
        database_agent,
        "Tell me about customer ID 1"
    )
    print("Test 1 - Get Customer:")
    print(result1.final_output)
    print()

    # Test 2: List by country
    result2 = Runner.run_sync(
        database_agent,
        "Show me all customers from Brazil"
    )
    print("Test 2 - List by Country:")
    print(result2.final_output)
    print()

    # Test 3: Add customer
    result3 = Runner.run_sync(
        database_agent,
        "Add a new customer: Eva López from Spain with email eva@example.com"
    )
    print("Test 3 - Add Customer:")
    print(result3.final_output)
```

### Exemplo 6: Agent com Supabase

```python
# 6_agent_with_supabase.py
from agents import Agent, Runner, function_tool
from supabase import create_client
import os
from typing import Optional

# Inicializar Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@function_tool
def get_orders(customer_id: int) -> dict:
    """Get all orders for a customer"""
    try:
        response = supabase.table("orders").select("*").eq("customer_id", customer_id).execute()

        if response.data:
            return {
                "success": True,
                "customer_id": customer_id,
                "orders_count": len(response.data),
                "orders": response.data
            }
        return {
            "success": True,
            "customer_id": customer_id,
            "orders_count": 0,
            "orders": []
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@function_tool
def create_order(customer_id: int, product_id: int, quantity: int, price: float) -> dict:
    """Create a new order"""
    try:
        order_data = {
            "customer_id": customer_id,
            "product_id": product_id,
            "quantity": quantity,
            "price": price,
            "total": quantity * price,
            "status": "pending"
        }

        response = supabase.table("orders").insert(order_data).execute()

        return {
            "success": True,
            "message": f"Order created successfully",
            "order": response.data[0] if response.data else order_data
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@function_tool
def update_order_status(order_id: int, status: str) -> dict:
    """Update order status"""
    try:
        response = supabase.table("orders").update({"status": status}).eq("id", order_id).execute()

        return {
            "success": True,
            "message": f"Order {order_id} status updated to {status}",
            "order": response.data[0] if response.data else {"id": order_id, "status": status}
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

# Criar agent
orders_agent = Agent(
    name="OrdersAgent",
    instructions="""You are an order management assistant.
    You help customers:
    - View their order history
    - Create new orders
    - Check order status

    Be polite and provide clear information about orders.""",
    tools=[get_orders, create_order, update_order_status]
)

# Executar
if __name__ == "__main__":
    result = Runner.run_sync(
        orders_agent,
        "Show me all orders for customer ID 5"
    )
    print(result.final_output)
```

---

## Multi-Agent Orchestration

### Exemplo 7: Handoff entre Agentes

```python
# 7_agent_handoff.py
from agents import Agent, Runner, handoff

# Agente especializado 1
billing_agent = Agent(
    name="BillingAgent",
    instructions="""You are a billing specialist.
    You handle invoices, payments, and billing questions.
    Respond politely and professionally.""",
    tools=[]  # Adicionar billing tools aqui
)

# Agente especializado 2
tech_agent = Agent(
    name="TechAgent",
    instructions="""You are a technical support specialist.
    You handle technical issues and system problems.
    Be helpful and provide step-by-step solutions.""",
    tools=[]  # Adicionar tech tools aqui
)

# Agente principal que roteia
triage_agent = Agent(
    name="TriageAgent",
    instructions="""You are the first point of contact.
    Listen to the customer's issue and route appropriately:
    - For billing/payment issues → BillingAgent
    - For technical problems → TechAgent

    Be friendly and helpful.""",
    tools=[
        handoff(
            billing_agent,
            tool_name_override="transfer_to_billing",
            tool_description_override="Transfer to Billing Agent for payment/invoice questions"
        ),
        handoff(
            tech_agent,
            tool_name_override="transfer_to_tech",
            tool_description_override="Transfer to Tech Agent for technical issues"
        )
    ]
)

# Executar
if __name__ == "__main__":
    # Teste 1: Billing issue
    result1 = Runner.run_sync(
        triage_agent,
        "I have a question about my invoice from last month"
    )
    print("Test 1 - Billing:")
    print(result1.final_output)
    print()

    # Teste 2: Technical issue
    result2 = Runner.run_sync(
        triage_agent,
        "I can't log into my account, getting an error"
    )
    print("Test 2 - Technical:")
    print(result2.final_output)
```

### Exemplo 8: Agent as Tool (Parallelização)

```python
# 8_agent_as_tool.py
from agents import Agent, Runner, function_tool
import asyncio

# Agentes especializados (stateless)
researcher_agent = Agent(
    name="Researcher",
    instructions="Research and find information. Be thorough.",
    tools=[]  # Adicionar search tools
)

analyst_agent = Agent(
    name="Analyst",
    instructions="Analyze information and provide insights. Be clear.",
    tools=[]  # Adicionar analysis tools
)

# Wrappear agentes como tools
@function_tool
def research(topic: str) -> str:
    """Use researcher agent to gather information"""
    result = Runner.run_sync(
        researcher_agent,
        f"Research: {topic}"
    )
    return result.final_output

@function_tool
def analyze(information: str) -> str:
    """Use analyst agent to analyze findings"""
    result = Runner.run_sync(
        analyst_agent,
        f"Analyze this information: {information}"
    )
    return result.final_output

# Manager agent orquestra
manager_agent = Agent(
    name="Manager",
    instructions="""You orchestrate research and analysis.
    1. First research the topic
    2. Then analyze the findings
    3. Provide final insights""",
    tools=[research, analyze]
)

# Executar
if __name__ == "__main__":
    result = Runner.run_sync(
        manager_agent,
        "Research and analyze the impact of AI on job markets"
    )
    print(result.final_output)
```

### Exemplo 9: Múltiplos Agentes em Paralelo

```python
# 9_parallel_agents.py
from agents import Agent, Runner
import asyncio

# Agentes para diferentes perspectivas
sales_agent = Agent(
    name="SalesAgent",
    instructions="Analyze from sales perspective",
    tools=[]
)

tech_agent = Agent(
    name="TechAgent",
    instructions="Analyze from technical perspective",
    tools=[]
)

finance_agent = Agent(
    name="FinanceAgent",
    instructions="Analyze from financial perspective",
    tools=[]
)

async def run_parallel_analysis(topic: str):
    """Execute multiple agents in parallel"""

    tasks = [
        Runner.run_async(sales_agent, f"From sales view: {topic}"),
        Runner.run_async(tech_agent, f"From tech view: {topic}"),
        Runner.run_async(finance_agent, f"From finance view: {topic}")
    ]

    results = await asyncio.gather(*tasks)

    return {
        "sales": results[0].final_output,
        "tech": results[1].final_output,
        "finance": results[2].final_output
    }

# Executar
if __name__ == "__main__":
    results = asyncio.run(
        run_parallel_analysis("Launch a new product")
    )

    print("=== SALES PERSPECTIVE ===")
    print(results["sales"])
    print("\n=== TECH PERSPECTIVE ===")
    print(results["tech"])
    print("\n=== FINANCE PERSPECTIVE ===")
    print(results["finance"])
```

---

## Exemplo Completo: Sistema de Suporte

### Exemplo 10: Sistema de Suporte Multi-Agent Production-Ready

```python
# 10_support_system.py
"""
Sistema de suporte completo com:
- Triage automático
- Múltiplos agentes especializados
- Session memory
- Logging
- Guardrails
"""

from agents import Agent, Runner, SQLiteSession, function_tool, handoff, InputGuardrail
from typing import Optional
import logging
from datetime import datetime
import json

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("support-system")

# ==================== GUARDRAILS ====================

class InputLengthGuardrail(InputGuardrail):
    """Validar comprimento da entrada"""
    async def validate(self, input_text: str) -> tuple[bool, str]:
        if len(input_text) > 5000:
            return False, "Input too long (max 5000 chars)"
        return True, input_text

# ==================== TOOLS ====================

@function_tool
def search_faq(question: str) -> dict:
    """Search FAQ database for common questions"""
    faqs = {
        "password reset": "Visit settings > security > reset password",
        "billing": "Contact billing@support.com",
        "account deletion": "Go to settings > account > delete account",
        "features": "Check our documentation at docs.example.com"
    }

    for key, answer in faqs.items():
        if key.lower() in question.lower():
            return {
                "found": True,
                "question": key,
                "answer": answer
            }

    return {
        "found": False,
        "message": "No FAQ match found"
    }

@function_tool
def create_support_ticket(
    customer_id: str,
    issue: str,
    priority: str = "medium"
) -> dict:
    """Create a support ticket"""
    ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    logger.info(f"Ticket created: {ticket_id} for customer {customer_id}")

    return {
        "success": True,
        "ticket_id": ticket_id,
        "status": "open",
        "priority": priority,
        "message": f"Support ticket {ticket_id} created. We'll respond within 24 hours."
    }

@function_tool
def get_account_info(customer_id: str) -> dict:
    """Get customer account information"""
    return {
        "customer_id": customer_id,
        "account_status": "active",
        "plan": "premium",
        "created_at": "2024-01-15"
    }

@function_tool
def process_refund(ticket_id: str, amount: float, reason: str) -> dict:
    """Process a refund"""
    logger.info(f"Refund processed: {ticket_id} - ${amount}")

    return {
        "success": True,
        "transaction_id": f"REF-{ticket_id}",
        "amount": amount,
        "status": "processed",
        "message": "Refund has been initiated. It will appear in 3-5 business days."
    }

# ==================== AGENTS ====================

# Agent especializado 1: FAQ
faq_agent = Agent(
    name="FAQAgent",
    instructions="""You are a FAQ assistant.
    Help customers find answers to common questions.
    If found in FAQ, provide the answer.
    If not found, suggest escalating to human support.""",
    tools=[search_faq]
)

# Agent especializado 2: Billing
billing_agent = Agent(
    name="BillingAgent",
    instructions="""You handle billing and refund requests.
    You can:
    - Check account information
    - Process refunds
    - Answer billing questions

    Always be helpful and professional.""",
    tools=[get_account_info, process_refund]
)

# Agent especializado 3: General Support
support_agent = Agent(
    name="SupportAgent",
    instructions="""You are a general support specialist.
    You can:
    - Create support tickets
    - Provide general help
    - Escalate complex issues

    Be empathetic and helpful.""",
    tools=[create_support_ticket]
)

# Agent Triage (Router)
triage_agent = Agent(
    name="SupportTriage",
    instructions="""You are the support entry point.
    Listen to customer issues and route appropriately:

    - FAQ questions → FAQAgent
    - Billing/refund questions → BillingAgent
    - Other issues → SupportAgent

    Be friendly, professional, and helpful.""",
    tools=[
        handoff(faq_agent, description="Route FAQ questions"),
        handoff(billing_agent, description="Route billing questions"),
        handoff(support_agent, description="Route support tickets")
    ],
    guardrails=[InputLengthGuardrail()]
)

# ==================== SESSION MANAGEMENT ====================

class SupportSession:
    """Manage support conversation session"""

    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.session = SQLiteSession(db_path="support_sessions.db")
        self.session.session_id = f"customer_{customer_id}"

    def save_message(self, role: str, content: str):
        """Log message to session"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "role": role,
            "content": content
        }

        logger.info(f"[{self.customer_id}] {role}: {content[:100]}")

# ==================== ORCHESTRATION ====================

class SupportSystem:
    """Main support system orchestrator"""

    def __init__(self):
        self.sessions = {}

    def process_customer_message(
        self,
        customer_id: str,
        message: str
    ) -> dict:
        """Process incoming customer message"""

        # Get or create session
        if customer_id not in self.sessions:
            self.sessions[customer_id] = SupportSession(customer_id)

        session = self.sessions[customer_id]
        session.save_message("customer", message)

        # Run triage agent
        logger.info(f"Processing message from {customer_id}")

        result = Runner.run_sync(
            triage_agent,
            message,
            session=session.session
        )

        session.save_message("assistant", result.final_output)

        return {
            "customer_id": customer_id,
            "response": result.final_output,
            "tokens_used": result.usage.total_tokens,
            "success": result.success,
            "timestamp": datetime.now().isoformat()
        }

# ==================== MAIN ====================

if __name__ == "__main__":
    support_system = SupportSystem()

    # Simular conversas
    conversations = [
        {
            "customer_id": "CUST-001",
            "message": "How do I reset my password?"
        },
        {
            "customer_id": "CUST-001",
            "message": "I want to request a refund"
        },
        {
            "customer_id": "CUST-002",
            "message": "I have a technical issue with the app"
        }
    ]

    for conv in conversations:
        print("\n" + "=" * 60)
        print(f"Customer: {conv['customer_id']}")
        print(f"Message: {conv['message']}")
        print("=" * 60)

        result = support_system.process_customer_message(
            conv['customer_id'],
            conv['message']
        )

        print(f"Response:\n{result['response']}")
        print(f"Tokens: {result['tokens_used']}")
```

---

## Dicas Rápidas

### Setup FastAPI para Production

```python
# api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import Agent, Runner
import logging

app = FastAPI(title="Agent API")
logger = logging.getLogger(__name__)

class ChatRequest(BaseModel):
    message: str
    agent_name: str = "default"

class ChatResponse(BaseModel):
    response: str
    tokens_used: int

# Seus agentes
agents = {
    "default": Agent(name="DefaultAgent", instructions="Help users"),
    # ... outros agentes
}

@app.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """Chat with agent"""
    try:
        agent = agents.get(request.agent_name)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        result = Runner.run_sync(agent, request.message)

        return ChatResponse(
            response=result.final_output,
            tokens_used=result.usage.total_tokens
        )

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### Usar Variáveis de Ambiente

```python
# .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
DEBUG=false
LOG_LEVEL=INFO

# No seu código
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL", "gpt-4o")
debug = os.getenv("DEBUG", "false").lower() == "true"
```

---

## Recursos Adicionais

- [OpenAI Agents SDK Docs](https://openai.github.io/openai-agents-python/)
- [OpenAI Cookbook Examples](https://cookbook.openai.com/topic/agents)
- [GitHub Repository](https://github.com/openai/openai-agents-python)

**Última atualização:** Fevereiro 2026
