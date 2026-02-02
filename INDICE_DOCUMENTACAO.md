# ÍNDICE DE DOCUMENTAÇÃO - AGENTES ESPECIALISTAS

## Navegação Rápida

### Comece Aqui

1. **[RESUMO_INVESTIGACAO.md](./RESUMO_INVESTIGACAO.md)** ⭐ START HERE
   - Overview da investigação
   - Descobertas principais
   - Arquitetura em camadas
   - Conclusão e próximos passos
   - **Tempo de leitura:** 10-15 minutos

### Documentação Técnica Completa

2. **[RELATORIO_AGENTES_ESPECIALISTAS.md](./RELATORIO_AGENTES_ESPECIALISTAS.md)** 📚 REFERÊNCIA PRINCIPAL
   - 14 seções com análise profunda
   - Schema do banco de dados (completo)
   - Descrição detalhada dos 11 agentes
   - Como os prompts são carregados dinamicamente
   - Fluxo completo de execução (13 passos)
   - Processamento e exibição de outputs
   - Histórico, segurança, versionamento
   - **Tempo de leitura:** 45-60 minutos

   **Seções principais:**
   - 1. ARQUITETURA COMPLETA DO SISTEMA
   - 2. SCHEMA DO BANCO DE DADOS
   - 3. OS 11 AGENTES ESPECIALISTAS
   - 4. CARREGAMENTO DINÂMICO DE PROMPTS
   - 5. FLUXO COMPLETO DE EXECUÇÃO
   - 6. PROCESSAMENTO E EXIBIÇÃO DE OUTPUTS
   - 7. HISTÓRICO DE EXECUÇÕES
   - 8. SEGURANÇA E ISOLAMENTO
   - 9. VERSIONAMENTO E REPRODUTIBILIDADE
   - 10. MÉTRICAS E MONITORAMENTO
   - 11. TIPOS TYPESCRIPT
   - 12. ROTAS PRINCIPAIS
   - 13. FLUXO FINAL DE DADOS
   - 14. RESUMO TÉCNICO

### Diagramas e Fluxos Visuais

3. **[DIAGRAMA_FLUXO_AGENTES.md](./DIAGRAMA_FLUXO_AGENTES.md)** 🎨 VISUAL
   - Sequência temporal completa (T0-T14)
   - Mapa mental dos componentes
   - Ciclo de vida de uma run (13 estágios)
   - Matriz de decisão de agentes
   - **Tempo de leitura:** 20-30 minutos

   **Diagramas:**
   - Sequência temporal com todos os passos
   - Mapa mental Frontend → Edge → Banco → Gemini
   - Ciclo de vida em 13 estágios
   - Matriz: Qual agente usar para qual documento

### Referência Rápida

4. **[QUICK_REFERENCE_AGENTES.md](./QUICK_REFERENCE_AGENTES.md)** ⚡ LOOKUP
   - Tabela dos 11 agentes
   - URLs e file paths
   - TypeScript interfaces
   - SQL helpers
   - Troubleshooting
   - Performance e otimizações
   - Debugging
   - Testing checklist
   - Métricas importantes
   - Upgrade/manutenção
   - **Tempo de leitura:** 5-10 minutos (consulta rápida)

---

## Guia por Perfil

### Gerente/Product Owner
1. Comece com: **RESUMO_INVESTIGACAO.md**
2. Para visão arquitetural: seção 1 de **RELATORIO_AGENTES_ESPECIALISTAS.md**
3. Para decidir agente: **DIAGRAMA_FLUXO_AGENTES.md** (Matriz de decisão)

### Desenvolvedor Frontend
1. Comece com: **RESUMO_INVESTIGACAO.md**
2. Componentes: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 6)
3. Hook: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 5, passo 2)
4. Tipos: **QUICK_REFERENCE_AGENTES.md** (TypeScript interfaces)
5. Referência rápida: **QUICK_REFERENCE_AGENTES.md**

### Desenvolvedor Backend/Edge
1. Comece com: **RESUMO_INVESTIGACAO.md**
2. Edge Function: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 5, passo 3)
3. Carregamento dinâmico: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 4)
4. Banco de dados: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 2)
5. Fluxo detalhado: **DIAGRAMA_FLUXO_AGENTES.md** (Sequência temporal)
6. SQL helpers: **QUICK_REFERENCE_AGENTES.md**

### DBA/Database Admin
1. Comece com: **RESUMO_INVESTIGACAO.md** (arquitetura)
2. Schema completo: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 2)
3. Functions SQL: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 2.4)
4. RLS/Segurança: **RELATORIO_AGENTES_ESPECIALISTAS.md** (seção 8)
5. Queries rápidas: **QUICK_REFERENCE_AGENTES.md** (SQL helpers)

### QA/Tester
1. Comece com: **RESUMO_INVESTIGACAO.md**
2. Fluxo de execução: **DIAGRAMA_FLUXO_AGENTES.md** (Ciclo de vida)
3. Testes: **QUICK_REFERENCE_AGENTES.md** (Testing checklist)
4. Troubleshooting: **QUICK_REFERENCE_AGENTES.md** (Troubleshooting)
5. Métricas: **QUICK_REFERENCE_AGENTES.md** (Métricas importantes)

### DevOps/Infrastructure
1. Comece com: **RESUMO_INVESTIGACAO.md** (arquitetura)
2. Environment: **QUICK_REFERENCE_AGENTES.md** (.env variables)
3. Logs: **QUICK_REFERENCE_AGENTES.md** (Debugging)
4. Performance: **QUICK_REFERENCE_AGENTES.md** (Performance)
5. Upgrade: **QUICK_REFERENCE_AGENTES.md** (Upgrade/Manutenção)

---

## Buscar por Tópico

### Prompts Dinâmicos
- **Visão geral:** RESUMO_INVESTIGACAO.md → "✓ Sistema Completamente Dinâmico"
- **Implementação:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 4
- **Código:** QUICK_REFERENCE_AGENTES.md → SQL helpers

### Segurança
- **Conceito:** RESUMO_INVESTIGACAO.md → "✓ Segurança RLS"
- **Implementação:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 8
- **Referência:** QUICK_REFERENCE_AGENTES.md → Segurança (RLS)

### 11 Agentes Especializados
- **Lista:** RESUMO_INVESTIGACAO.md → "✓ 11 Agentes Especializados"
- **Detalhes completos:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 3
- **Qual usar:** DIAGRAMA_FLUXO_AGENTES.md → Matriz de decisão
- **Tabela rápida:** QUICK_REFERENCE_AGENTES.md → Tabela rápida dos 11 agentes

### Fluxo de Execução
- **Resumido:** RESUMO_INVESTIGACAO.md → "✓ Fluxo Dinâmico Completo"
- **Detalhado (13 passos):** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 5
- **Temporal (T0-T14):** DIAGRAMA_FLUXO_AGENTES.md → Sequência temporal
- **Ciclo de vida (13 estágios):** DIAGRAMA_FLUXO_AGENTES.md → Ciclo de vida

### Banco de Dados
- **Overview:** RESUMO_INVESTIGACAO.md → "Tabelas do Banco"
- **Schema completo:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 2
- **Queries rápidas:** QUICK_REFERENCE_AGENTES.md → SQL Helpers

### Performance e Custo
- **Métricas:** RESUMO_INVESTIGACAO.md → "✓ Métricas Coletadas"
- **Detalhes:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 10
- **Otimizações:** QUICK_REFERENCE_AGENTES.md → Performance e otimizações

### Reprodutibilidade e Versionamento
- **Conceito:** RESUMO_INVESTIGACAO.md → "✓ Snapshots de Prompts"
- **Implementação:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 9
- **Exemplo prático:** QUICK_REFERENCE_AGENTES.md → Upgrade/Manutenção

### Componentes React
- **Overview:** RESUMO_INVESTIGACAO.md → "✓ Componentes React Especializados"
- **Detalhes:** RELATORIO_AGENTES_ESPECIALISTAS.md → Seção 6
- **Tipos:** QUICK_REFERENCE_AGENTES.md → TypeScript interfaces

---

## Tarefas Comuns

### "Quero adicionar um novo agente"
1. Checklist: **QUICK_REFERENCE_AGENTES.md** → Checklist: Adicionar novo agente
2. Especificações: **RELATORIO_AGENTES_ESPECIALISTAS.md** → Seção 3 (escolha um similar como modelo)
3. SQL: Execute INSERT em `agentes_especialistas_prompts`
4. Frontend: Adicione em `src/data/agentes.ts`

### "Quero entender o fluxo completo"
1. Comece: **RESUMO_INVESTIGACAO.md** → "✓ Fluxo Dinâmico Completo"
2. Visão temporal: **DIAGRAMA_FLUXO_AGENTES.md** → Sequência temporal (T0-T14)
3. Detalhado: **RELATORIO_AGENTES_ESPECIALISTAS.md** → Seção 5 (13 passos)
4. Código: **QUICK_REFERENCE_AGENTES.md** → TypeScript interfaces

### "Preciso debugar um erro"
1. Primeiros passos: **QUICK_REFERENCE_AGENTES.md** → Troubleshooting rápido
2. Logs: **QUICK_REFERENCE_AGENTES.md** → Debugging
3. Fluxo: **DIAGRAMA_FLUXO_AGENTES.md** → Sequência temporal (identifique onde falhou)
4. Código: **RELATORIO_AGENTES_ESPECIALISTAS.md** → Seção 5 (passo específico)

### "Preciso otimizar performance"
1. Métricas atuais: **QUICK_REFERENCE_AGENTES.md** → Métricas importantes
2. Otimizações possíveis: **QUICK_REFERENCE_AGENTES.md** → Performance e otimizações
3. Detalhes: **RELATORIO_AGENTES_ESPECIALISTAS.md** → Seção 10
4. Banco: **QUICK_REFERENCE_AGENTES.md** → Indexes otimizados

### "Quero melhorar a segurança"
1. Visão atual: **RESUMO_INVESTIGACAO.md** → "✓ Segurança RLS"
2. Implementação: **RELATORIO_AGENTES_ESPECIALISTAS.md** → Seção 8
3. Referência: **QUICK_REFERENCE_AGENTES.md** → Segurança (RLS)

### "Quero testar o sistema"
1. Checklist: **QUICK_REFERENCE_AGENTES.md** → Testing checklist
2. Casos: **QUICK_REFERENCE_AGENTES.md** → Testing checklist (Manual testing + Edge cases)
3. Métricas para monitorar: **QUICK_REFERENCE_AGENTES.md** → Métricas importantes

---

## Referência de Código

### Frontend
- Página: `src/pages/AgenteExtrator.tsx`
- Hook: `src/hooks/useAgentRun.ts`
- Componentes: `src/components/agentes/`
- Tipos: `src/types/agente.ts`
- Dados: `src/data/agentes.ts`
- **Onde procurar:** QUICK_REFERENCE_AGENTES.md → Arquivo Paths

### Backend
- Edge Function: `supabase/functions/agentes-especialistas/index.ts`
- Tipos: `supabase/functions/agentes-especialistas/types.ts`
- **Onde procurar:** QUICK_REFERENCE_AGENTES.md → Arquivo Paths

### Database
- Schema: `supabase/migrations/20260201000001_create_agentes_especialistas_schema.sql`
- Seed: `supabase/migrations/20260201000002_seed_agentes_especialistas_prompts.sql`
- **Onde procurar:** QUICK_REFERENCE_AGENTES.md → Arquivo Paths

---

## Checklist de Leitura Completa

- [ ] Ler RESUMO_INVESTIGACAO.md (10-15 min)
- [ ] Ler DIAGRAMA_FLUXO_AGENTES.md (20-30 min)
- [ ] Ler RELATORIO_AGENTES_ESPECIALISTAS.md (45-60 min)
- [ ] Ter QUICK_REFERENCE_AGENTES.md à mão para consultas
- [ ] Verificar arquivo paths no seu ambiente
- [ ] Testar com um agente (ex: RG)
- [ ] Ler seção de troubleshooting
- [ ] Entender versionamento de prompts

---

## Próximas Ações

### Imediatamente
1. Ler RESUMO_INVESTIGACAO.md
2. Ter QUICK_REFERENCE_AGENTES.md à mão
3. Entender os 11 agentes (tabela em QUICK_REFERENCE)

### Esta Semana
1. Ler RELATORIO_AGENTES_ESPECIALISTAS.md completo
2. Estudar DIAGRAMA_FLUXO_AGENTES.md
3. Testar fluxo completo (upload → análise → resultado)

### Esta Mês
1. Adicionar novo agente (se necessário)
2. Otimizar prompts existentes
3. Implementar monitoring/alertas
4. Documentar learnings adicionais

---

## Contato e Dúvidas

### Estrutura de Documentação
- **Cada documento é auto-contido** mas referencia os outros
- **Use busca (Ctrl+F)** para encontrar tópicos rapidamente
- **Use o índice de seções** para navegar

### Como Usar Esta Documentação
1. **Primeira vez:** Leia RESUMO_INVESTIGACAO.md
2. **Referência rápida:** Use QUICK_REFERENCE_AGENTES.md
3. **Implementação:** Consulte RELATORIO_AGENTES_ESPECIALISTAS.md
4. **Compreensão:** Veja DIAGRAMA_FLUXO_AGENTES.md
5. **Troubleshooting:** Use QUICK_REFERENCE_AGENTES.md → Troubleshooting

---

## Histórico de Versões

| Versão | Data | Alterações |
|--------|------|-----------|
| 1.0 | 2024-02-02 | Documentação inicial completa |

---

## Arquivo de Documentação

```
Documentação do Sistema de Agentes Especialistas/
├── RESUMO_INVESTIGACAO.md (⭐ START HERE)
├── RELATORIO_AGENTES_ESPECIALISTAS.md (📚 PRINCIPAL)
├── DIAGRAMA_FLUXO_AGENTES.md (🎨 VISUAL)
├── QUICK_REFERENCE_AGENTES.md (⚡ LOOKUP)
└── INDICE_DOCUMENTACAO.md (📍 ESTE ARQUIVO)
```

**Total:** ~110KB de documentação técnica
**Tempo de leitura total:** ~90-120 minutos

---

**Criado:** 2024-02-02
**Versão:** 1.0
**Manutenção:** Atualizar conforme mudanças no sistema
