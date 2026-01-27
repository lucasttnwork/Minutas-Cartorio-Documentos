# Agentic-Dev-Minuta-IA

Este projeto segue uma arquitetura de 3 camadas para garantir confiabilidade e escalabilidade no desenvolvimento assistido por IA.

## Estrutura de Pastas

- `directives/`: Procedimentos Operacionais Padrão (SOPs) em Markdown.
- `execution/`: Scripts Python determinísticos para execução de tarefas.
- `.tmp/`: Arquivos intermediários e temporários (não versionados).
- `.env`: Variáveis de ambiente e segredos (não versionados).

## Diretrizes de Operação

O sistema opera através de:
1. **Layer 1: Diretiva** (O que fazer)
2. **Layer 2: Orquestração** (Como coordenar)
3. **Layer 3: Execução** (Ação técnica)

Para mais detalhes, consulte `directives/00_system_architecture.md`.
