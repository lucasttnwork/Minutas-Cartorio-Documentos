# Arquitetura de Sistemas com Agents SDK para Produção

**Escopo:** Design patterns, arquitetura escalável, deployment
**Nível:** Avançado
**Data:** Fevereiro 2026

---

## Índice

1. [Padrões de Arquitetura](#padrões-de-arquitetura)
2. [Sistema de Suporte Ao Cliente](#sistema-de-suporte-ao-cliente)
3. [Plataforma de Pesquisa e Análise](#plataforma-de-pesquisa-e-análise)
4. [Sistema de RPA (Robotic Process Automation)](#sistema-de-rpa)
5. [E-commerce Intelligence](#e-commerce-intelligence)
6. [Deployment e DevOps](#deployment-e-devops)

---

## Padrões de Arquitetura

### Padrão 1: Agent-per-Role (Recomendado para Start)

```
┌─────────────────────────┐
│    User/Frontend        │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   API Gateway           │
│   (Auth, Rate Limit)    │
└────────────┬────────────┘
             │
┌────────────▼──────────────────────┐
│   Orchestration Layer              │
│  ┌──────────────────────────────┐ │
│  │ Triage/Router Agent          │ │
│  │ - Entende requisição         │ │
│  │ - Roteia para agente certo   │ │
│  └──────────────┬───────────────┘ │
└─────────────────┼──────────────────┘
   ┌──────────┬───┴────┬──────────┐
   │          │        │          │
   ▼          ▼        ▼          ▼
┌────────┐ ┌─────┐ ┌──────┐ ┌──────────┐
│Billing │ │Tech │ │Sales │ │Research  │
│ Agent  │ │Agent│ │Agent │ │ Agent    │
└──┬─────┘ └──┬──┘ └───┬──┘ └────┬─────┘
   │          │        │         │
   └──────────┼────┬───┴─────────┘
              │    │
          ┌───▼────▼──────┐
          │ Tools/Functions│
          │ - DB queries   │
          │ - API calls    │
          │ - Validations  │
          └────────────────┘
```

**Vantagens:**
- Escalável horizontalmente
- Fácil de entender
- Cada agent tem responsabilidade clara

**Desvantagens:**
- Comunicação entre agents pode ser complexa
- State management distribuído

**Quando usar:**
- Empresas iniciantes
- SaaS com múltiplos domínios
- Sistemas de suporte

### Padrão 2: Hierarchical (Para Complexidade Alta)

```
┌──────────────────────────────┐
│   Executive Agent            │
│   (Strategic Decisions)      │
└───────────────┬──────────────┘
      ┌─────────┼─────────┐
      │         │         │
      ▼         ▼         ▼
┌──────────┐ ┌────────┐ ┌──────────┐
│Compliance│ │Finance │ │Operations│
│  Manager │ │Manager │ │ Manager  │
└────┬─────┘ └───┬────┘ └────┬─────┘
     │           │           │
  ┌──┴──┐    ┌───┴───┐  ┌────┴────┐
  │     │    │       │  │         │
  ▼     ▼    ▼       ▼  ▼         ▼
Audit Risk Budget  Forecast Supply Inventory
Agent Agent Agent  Agent   Agent   Agent
```

**Vantagens:**
- Muito escalável
- Fácil paralelização
- Decisões coordenadas

**Desvantagens:**
- Mais complexo de implementar
- Mais overhead de comunicação

**Quando usar:**
- Empresas grandes
- Sistemas financeiros
- Operações complexas

### Padrão 3: Mesh (Máxima Flexibilidade)

Cada agent pode comunicar com qualquer outro agent.

```
Agent A ←→ Agent B
  ↕        ↕
Agent D ←→ Agent C
  ↓        ↑
Agent E ←→ Agent F
```

**Vantagens:**
- Máxima flexibilidade
- Colaboração natural

**Desvantagens:**
- Complexo de gerenciar
- Difícil de debugar

**Quando usar:**
- Pesquisa e desenvolvimento
- Sistemas experimentais

---

## Sistema de Suporte Ao Cliente

### Arquitetura Completa

```
┌──────────────────────────────────────────────┐
│            Customer Touchpoints              │
│  Email, Chat, Phone, Social Media            │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│         Ingestion Layer                      │
│  - Normalize inputs                          │
│  - Extract sentiment                         │
│  - Priority detection                        │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│    Guardrails & Validation                   │
│  - Input sanitization                        │
│  - Rate limiting                             │
│  - Spam detection                            │
└──────────────┬───────────────────────────────┘
               │
┌──────────────▼───────────────────────────────┐
│      Triage Agent                            │
│  - Understand issue type                     │
│  - Detect escalation needs                   │
│  - Route appropriately                       │
└───┬──────────────────────┬──────────┬────────┘
    │                      │          │
    ▼                      ▼          ▼
┌────────────┐      ┌────────────┐ ┌─────────┐
│FAQ Agent   │      │Billing     │ │Escalate │
│- Search    │      │- Invoice   │ │to Human │
│- Answer    │      │- Refund    │ │         │
└─┬──────────┘      └────┬───────┘ └────┬────┘
  │                      │              │
  └──────────┬───────────┴──────────────┘
             │
┌────────────▼──────────────────────────────┐
│       Response Management                 │
│  - Format response                         │
│  - Add attachments                         │
│  - Track interactions                      │
└────────────┬──────────────────────────────┘
             │
┌────────────▼──────────────────────────────┐
│          Data Layer                        │
│  - Ticket database                         │
│  - Customer history                        │
│  - Analytics                               │
└────────────────────────────────────────────┘
```

### Implementação

```python
# support_system.py
from agents import Agent, Runner, SQLiteSession, handoff, function_tool
from typing import Optional
from dataclasses import dataclass
from datetime import datetime
import json

@dataclass
class Ticket:
    id: str
    customer_id: str
    issue: str
    priority: str
    status: str
    created_at: str
    assigned_to: str

# ==================== TOOLS ====================

@function_tool
def search_knowledge_base(query: str, category: Optional[str] = None) -> dict:
    """Search knowledge base for solutions"""
    kb = {
        "account": [
            {"question": "How to reset password", "answer": "..."},
            {"question": "How to delete account", "answer": "..."},
        ],
        "billing": [
            {"question": "How to get refund", "answer": "..."},
            {"question": "How to update payment", "answer": "..."},
        ]
    }

    results = []
    for category_items in kb.values():
        for item in category_items:
            if query.lower() in item["question"].lower():
                results.append(item)

    return {
        "found": len(results) > 0,
        "results": results[:3],
        "total": len(results)
    }

@function_tool
def create_ticket(
    customer_id: str,
    issue: str,
    priority: str = "medium",
    category: str = "general"
) -> dict:
    """Create support ticket"""
    ticket = Ticket(
        id=f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        customer_id=customer_id,
        issue=issue,
        priority=priority,
        status="open",
        created_at=datetime.now().isoformat(),
        assigned_to="queue"
    )

    # Salvar no banco
    # db.insert("tickets", ticket)

    return {
        "success": True,
        "ticket": {
            "id": ticket.id,
            "status": ticket.status,
            "priority": ticket.priority
        },
        "message": f"Ticket {ticket.id} created. You'll receive updates via email."
    }

@function_tool
def get_customer_history(customer_id: str) -> dict:
    """Get customer's support history"""
    # Simular dados
    return {
        "customer_id": customer_id,
        "total_tickets": 3,
        "open_tickets": 1,
        "resolved_tickets": 2,
        "last_contact": "2025-02-01",
        "satisfaction_score": 4.5
    }

@function_tool
def process_refund(
    ticket_id: str,
    amount: float,
    reason: str
) -> dict:
    """Process refund request"""
    return {
        "success": True,
        "transaction_id": f"REF-{ticket_id}",
        "amount": amount,
        "status": "processing",
        "eta_days": 3
    }

# ==================== AGENTS ====================

# Agent 1: FAQ/Knowledge Base
faq_agent = Agent(
    name="KnowledgeAgent",
    instructions="""You are a knowledge base assistant.
    1. Search for answers in our knowledge base
    2. Provide clear, step-by-step solutions
    3. If not found, acknowledge and escalate

    Be helpful and professional.""",
    tools=[search_knowledge_base, get_customer_history]
)

# Agent 2: Billing
billing_agent = Agent(
    name="BillingAgent",
    instructions="""Handle billing and refund requests.
    - Be empathetic about issues
    - Provide transparent information
    - Process refunds appropriately""",
    tools=[get_customer_history, process_refund]
)

# Agent 3: Escalation
escalation_agent = Agent(
    name="EscalationAgent",
    instructions="""Handle complex issues requiring human intervention.
    - Create detailed tickets
    - Summarize context clearly
    - Set appropriate priority""",
    tools=[create_ticket, get_customer_history]
)

# Agent 4: Triage (Entry Point)
triage_agent = Agent(
    name="SupportTriage",
    instructions="""Welcome customers and route appropriately.

    Routing rules:
    - FAQ questions → KnowledgeAgent
    - Billing issues → BillingAgent
    - Complex problems → EscalationAgent

    Always be polite and empathetic.""",
    tools=[
        handoff(faq_agent, description="Route FAQ questions"),
        handoff(billing_agent, description="Route billing issues"),
        handoff(escalation_agent, description="Escalate complex issues")
    ]
)

# ==================== ORCHESTRATION ====================

class SupportSystem:
    def __init__(self):
        self.sessions = {}

    def handle_customer_inquiry(
        self,
        customer_id: str,
        message: str,
        channel: str = "chat"
    ) -> dict:
        """Handle incoming customer inquiry"""

        session_key = f"{customer_id}_{channel}"
        if session_key not in self.sessions:
            self.sessions[session_key] = SQLiteSession(db_path="support.db")

        session = self.sessions[session_key]

        # Execute triage
        result = Runner.run_sync(
            triage_agent,
            message,
            session=session
        )

        return {
            "customer_id": customer_id,
            "message_id": f"MSG-{datetime.now().timestamp()}",
            "response": result.final_output,
            "tokens": result.usage.total_tokens,
            "agent": result.agent_used,
            "timestamp": datetime.now().isoformat()
        }
```

---

## Plataforma de Pesquisa e Análise

### Arquitetura de Análise Multi-Agent

```
┌─────────────────────────┐
│   User Query            │
│   (Topic + Parameters)  │
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   Research Planner      │
│   - Break down task     │
│   - Create sub-tasks    │
│   - Assign to agents    │
└────────────┬────────────┘
      ┌──────┼──────┐
      │      │      │
      ▼      ▼      ▼
  ┌─────┐┌──────┐┌──────┐
  │News │      │      │Papers│
  │Res. │ Data  │ Trend │Res. │
  │Agent│ Agent │Agent  │Agent│
  └──┬──┘└──┬───┘└───┬──┘└────┘
     │      │        │
     └──────┼────┬───┘
            │    │
     ┌──────▼────▼──────┐
     │  Analyst Agent   │
     │ - Synthesize     │
     │ - Draw insights  │
     │ - Generate report│
     └──────┬───────────┘
            │
     ┌──────▼──────────┐
     │  Report Agent   │
     │ - Format output │
     │ - Add visuals   │
     │ - Export        │
     └─────────────────┘
```

### Implementação

```python
# research_system.py
from agents import Agent, Runner, function_tool
import asyncio
from typing import List
import json

@function_tool
def search_news(topic: str, days: int = 7) -> dict:
    """Search recent news articles"""
    return {
        "topic": topic,
        "articles": [
            {
                "title": f"Latest in {topic}",
                "date": "2025-02-01",
                "summary": "..."
            }
        ],
        "total": 5
    }

@function_tool
def get_statistical_data(metric: str) -> dict:
    """Fetch statistical data"""
    return {
        "metric": metric,
        "data": [
            {"date": "2025-01-01", "value": 100},
            {"date": "2025-02-01", "value": 110},
        ],
        "trend": "increasing"
    }

@function_tool
def analyze_trend(data: list, period: str) -> dict:
    """Analyze trend in data"""
    return {
        "period": period,
        "trend": "growth",
        "rate": "5% monthly",
        "forecast": "Expected to continue"
    }

@function_tool
def search_research_papers(topic: str) -> dict:
    """Search academic papers"""
    return {
        "topic": topic,
        "papers": [
            {
                "title": "Research on topic",
                "authors": "...",
                "year": 2024,
                "citations": 50
            }
        ],
        "total": 3
    }

# Agents
news_researcher = Agent(
    name="NewsResearcher",
    instructions="Find and summarize latest news",
    tools=[search_news]
)

data_analyst = Agent(
    name="DataAnalyst",
    instructions="Fetch and analyze statistical data",
    tools=[get_statistical_data, analyze_trend]
)

papers_researcher = Agent(
    name="PapersResearcher",
    instructions="Find academic research",
    tools=[search_research_papers]
)

# Tools wrappando agents
@function_tool
def gather_news(topic: str) -> str:
    """Gather news insights"""
    result = Runner.run_sync(news_researcher, f"Research news on {topic}")
    return result.final_output

@function_tool
def gather_data(topic: str) -> str:
    """Gather data insights"""
    result = Runner.run_sync(data_analyst, f"Analyze data on {topic}")
    return result.final_output

@function_tool
def gather_papers(topic: str) -> str:
    """Gather research papers"""
    result = Runner.run_sync(papers_researcher, f"Find papers on {topic}")
    return result.final_output

# Master Analyst
analyst = Agent(
    name="MasterAnalyst",
    instructions="""Orchestrate comprehensive research.
    1. Gather news updates
    2. Analyze statistical data
    3. Find academic papers
    4. Synthesize findings
    5. Provide strategic insights""",
    tools=[gather_news, gather_data, gather_papers]
)

# Executar
async def run_research(topic: str):
    result = await Runner.run_async(
        analyst,
        f"Comprehensive research on: {topic}"
    )
    return result
```

---

## Sistema de RPA (Robotic Process Automation)

### Arquitetura RPA com Agents

```
┌──────────────────────────────────┐
│      Business Process Trigger    │
│   (Schedule, Event, Manual)      │
└────────────┬─────────────────────┘
             │
┌────────────▼────────────────────┐
│   Process Orchestrator Agent     │
│   - Monitor prerequisites        │
│   - Manage workflow state        │
│   - Handle exceptions            │
└────────────┬────────────────────┘
    ┌────────┼──────────────┐
    │        │              │
    ▼        ▼              ▼
 Extract  Transform   Load
 Agent    Agent       Agent
    │        │              │
    └────────┼──────────────┘
             │
┌────────────▼──────────────┐
│    Validation Agent       │
│  - Check quality          │
│  - Handle errors          │
│  - Generate audit trail   │
└────────────┬──────────────┘
             │
┌────────────▼──────────────┐
│   Notification Agent      │
│  - Alert on completion    │
│  - Report failures        │
│  - Update stakeholders    │
└──────────────────────────┘
```

### Implementação

```python
# rpa_system.py
from agents import Agent, Runner, function_tool, handoff
from typing import Optional
from datetime import datetime
import asyncio

# ==================== RPA TOOLS ====================

@function_tool
def extract_data_from_source(source: str, query: str) -> dict:
    """Extract data from source system"""
    return {
        "source": source,
        "records_extracted": 1000,
        "fields": ["id", "name", "email"],
        "status": "success"
    }

@function_tool
def transform_data(data: dict, rules: Optional[dict] = None) -> dict:
    """Transform and clean data"""
    return {
        "original_count": data.get("records_extracted", 0),
        "cleaned_count": 950,
        "duplicates_removed": 50,
        "transformations_applied": 5
    }

@function_tool
def load_to_destination(data: dict, destination: str) -> dict:
    """Load data to destination"""
    return {
        "destination": destination,
        "records_loaded": 950,
        "status": "success",
        "timestamp": datetime.now().isoformat()
    }

@function_tool
def validate_results(result: dict) -> dict:
    """Validate process results"""
    return {
        "validation": "passed",
        "record_count_match": True,
        "data_quality_score": 98.5,
        "timestamp": datetime.now().isoformat()
    }

@function_tool
def send_notification(
    recipient: str,
    status: str,
    details: dict
) -> dict:
    """Send completion notification"""
    return {
        "recipient": recipient,
        "status": status,
        "sent_at": datetime.now().isoformat()
    }

# ==================== RPA AGENTS ====================

extract_agent = Agent(
    name="ExtractAgent",
    instructions="Extract data from source systems",
    tools=[extract_data_from_source]
)

transform_agent = Agent(
    name="TransformAgent",
    instructions="Transform and clean extracted data",
    tools=[transform_data]
)

load_agent = Agent(
    name="LoadAgent",
    instructions="Load transformed data to destination",
    tools=[load_to_destination]
)

validate_agent = Agent(
    name="ValidateAgent",
    instructions="Validate process results",
    tools=[validate_results, send_notification]
)

# ==================== ORCHESTRATOR ====================

orchestrator = Agent(
    name="RPAOrchestrator",
    instructions="""Orchestrate ETL process:
    1. Extract data
    2. Transform data
    3. Load to destination
    4. Validate results
    5. Send notifications

    Handle errors gracefully.""",
    tools=[
        handoff(extract_agent, description="Extract phase"),
        handoff(transform_agent, description="Transform phase"),
        handoff(load_agent, description="Load phase"),
        handoff(validate_agent, description="Validate & notify")
    ]
)

# ==================== EXECUTION ====================

async def run_etl_process(
    source: str,
    destination: str,
    notify_recipients: list
):
    """Execute ETL process"""
    result = await Runner.run_async(
        orchestrator,
        f"""Run ETL: Extract from {source},
           Transform, Load to {destination},
           Notify {', '.join(notify_recipients)}"""
    )

    return {
        "process": "ETL",
        "source": source,
        "destination": destination,
        "result": result.final_output,
        "timestamp": datetime.now().isoformat()
    }

# Schedule com APScheduler
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour=2, minute=0)  # 2 AM daily
def scheduled_etl():
    asyncio.run(
        run_etl_process(
            source="SAP",
            destination="DataWarehouse",
            notify_recipients=["admin@company.com"]
        )
    )

scheduler.start()
```

---

## E-commerce Intelligence

### Arquitetura de IA para E-commerce

```
┌────────────────────────────────┐
│    Customer Behavior Stream    │
│  (Browsing, Purchases, Reviews)│
└────────────┬───────────────────┘
             │
┌────────────▼─────────────────┐
│   Data Processing Layer      │
│  - Real-time enrichment      │
│  - Feature extraction        │
└────────────┬─────────────────┘
      ┌──────┼──────┬──────┐
      │      │      │      │
      ▼      ▼      ▼      ▼
Recomm. Fraud  Price  Demand
Agent   Agent  Agent  Agent
      │      │      │      │
      └──────┼──────┴──────┘
             │
┌────────────▼──────────────────┐
│   Decision Engine Agent       │
│  - Aggregate signals          │
│  - Make decisions             │
│  - A/B test strategies        │
└────────────┬──────────────────┘
             │
┌────────────▼──────────────────┐
│  Action Executor              │
│  - Adjust recommendations     │
│  - Update pricing             │
│  - Block suspicious orders    │
└───────────────────────────────┘
```

### Implementação

```python
# ecommerce_agents.py
from agents import Agent, Runner, function_tool
from typing import List, Optional
import json

@function_tool
def get_customer_profile(customer_id: str) -> dict:
    """Get detailed customer profile"""
    return {
        "customer_id": customer_id,
        "lifetime_value": 5000.00,
        "average_order": 150.00,
        "category_preferences": ["electronics", "books"],
        "last_purchase": "2025-01-28",
        "loyalty_tier": "gold"
    }

@function_tool
def get_product_recommendations(
    customer_id: str,
    limit: int = 5
) -> dict:
    """Generate personalized recommendations"""
    return {
        "customer_id": customer_id,
        "recommendations": [
            {
                "product_id": "PROD-001",
                "name": "Laptop X",
                "score": 0.95,
                "reason": "Similar to previous purchases"
            }
        ],
        "total": limit
    }

@function_tool
def detect_fraud(order: dict) -> dict:
    """Detect fraudulent orders"""
    risk_score = 0.02  # Low risk

    return {
        "order_id": order.get("order_id"),
        "risk_score": risk_score,
        "is_fraud": risk_score > 0.7,
        "flags": [],
        "recommendation": "approve"
    }

@function_tool
def analyze_demand(category: str, period: str) -> dict:
    """Analyze demand patterns"""
    return {
        "category": category,
        "period": period,
        "trend": "increasing",
        "demand_level": "high",
        "recommended_stock": 500,
        "price_elasticity": 0.8
    }

@function_tool
def optimize_pricing(product_id: str, context: dict) -> dict:
    """Optimize product pricing"""
    return {
        "product_id": product_id,
        "current_price": 99.99,
        "recommended_price": 89.99,
        "price_change": "-10%",
        "expected_revenue_impact": "+15%",
        "reason": "High demand, optimize for volume"
    }

# Agents
recommender = Agent(
    name="Recommender",
    instructions="Generate personalized product recommendations",
    tools=[get_customer_profile, get_product_recommendations]
)

fraud_detector = Agent(
    name="FraudDetector",
    instructions="Detect and flag suspicious orders",
    tools=[detect_fraud]
)

demand_analyzer = Agent(
    name="DemandAnalyzer",
    instructions="Analyze and forecast demand",
    tools=[analyze_demand, optimize_pricing]
)

decision_engine = Agent(
    name="DecisionEngine",
    instructions="""Aggregate signals from all agents:
    1. Check fraud risk
    2. Optimize pricing
    3. Generate recommendations
    4. Make final decisions""",
    tools=[]  # Adicionar tools que invocam outros agents
)

# Exemplo: Processar novo pedido
async def process_order(order: dict):
    """End-to-end order processing"""

    # 1. Check fraud
    fraud_result = await Runner.run_async(
        fraud_detector,
        f"Check order {order['order_id']}"
    )

    if "fraud" in fraud_result.final_output.lower():
        return {
            "order_id": order['order_id'],
            "status": "blocked",
            "reason": "Fraud detected"
        }

    # 2. Optimize experience
    rec_result = await Runner.run_async(
        recommender,
        f"Recommend for customer {order['customer_id']}"
    )

    return {
        "order_id": order['order_id'],
        "status": "approved",
        "recommendations": rec_result.final_output
    }
```

---

## Deployment e DevOps

### Docker Setup

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy files
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY .env.example .env

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Service
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=postgresql://user:password@postgres:5432/agents
      - REDIS_URL=redis://redis:6379
      - ENVIRONMENT=production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - agent-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=agents
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - agent-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    networks:
      - agent-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Monitoring (Prometheus)
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    restart: unless-stopped
    networks:
      - agent-network

  # Visualization (Grafana)
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped
    networks:
      - agent-network

volumes:
  postgres_data:
  prometheus_data:
  grafana_data:

networks:
  agent-network:
    driver: bridge
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-api
  namespace: agents
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-api
  template:
    metadata:
      labels:
        app: agent-api
    spec:
      containers:
      - name: api
        image: your-registry/agent-api:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: openai-secrets
              key: api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: connection-string
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
      imagePullPolicy: Always

---
apiVersion: v1
kind: Service
metadata:
  name: agent-api-service
  namespace: agents
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
    protocol: TCP
  selector:
    app: agent-api

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: agent-api-hpa
  namespace: agents
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: agent-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Agent API

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-cov

    - name: Run tests
      run: pytest --cov=src tests/

    - name: Upload coverage
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t agent-api:${{ github.sha }} .

    - name: Push to registry
      run: |
        docker login -u ${{ secrets.REGISTRY_USER }} -p ${{ secrets.REGISTRY_PASSWORD }}
        docker tag agent-api:${{ github.sha }} your-registry/agent-api:latest
        docker push your-registry/agent-api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
    - name: Deploy to production
      run: |
        kubectl set image deployment/agent-api \
          api=your-registry/agent-api:latest \
          --namespace=agents
```

### Monitoring com Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'agent-api'
    static_configs:
      - targets: ['localhost:8000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
```

### Health Check Endpoint

```python
# api.py
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import asyncio

app = FastAPI()

@app.get("/health")
async def health_check():
    """Comprehensive health check"""
    checks = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {}
    }

    # Check database
    try:
        async with db.pool.acquire() as connection:
            await connection.fetchval("SELECT 1")
        checks["services"]["database"] = "healthy"
    except Exception as e:
        checks["services"]["database"] = f"unhealthy: {str(e)}"
        checks["status"] = "degraded"

    # Check Redis
    try:
        redis_client.ping()
        checks["services"]["redis"] = "healthy"
    except Exception as e:
        checks["services"]["redis"] = f"unhealthy: {str(e)}"
        checks["status"] = "degraded"

    # Check OpenAI API
    try:
        client.models.list()
        checks["services"]["openai_api"] = "healthy"
    except Exception as e:
        checks["services"]["openai_api"] = f"unhealthy: {str(e)}"
        checks["status"] = "degraded"

    status_code = 200 if checks["status"] == "healthy" else 503
    return JSONResponse(content=checks, status_code=status_code)
```

---

## Checklist de Deployment

```markdown
## Pre-Deployment

- [ ] Testes unitários passando (>80% coverage)
- [ ] Testes de integração passando
- [ ] Load testing realizado
- [ ] Security scan realizado
- [ ] Code review completo
- [ ] Environment variables configuradas
- [ ] Database migrations testadas
- [ ] Guardrails implementados e testados
- [ ] Monitoring e alertas configurados
- [ ] Runbooks documentados

## Post-Deployment

- [ ] Health checks passando
- [ ] Logs normais
- [ ] Métricas sendo coletadas
- [ ] Alertas funcionando
- [ ] Rollback plan pronto
- [ ] Customer communication sent
- [ ] Team notificado

## Ongoing

- [ ] Monitor error rates (< 1%)
- [ ] Monitor latency (< 500ms p99)
- [ ] Monitor costs
- [ ] Weekly security scans
- [ ] Monthly performance reviews
```

**Última atualização:** Fevereiro 2026
