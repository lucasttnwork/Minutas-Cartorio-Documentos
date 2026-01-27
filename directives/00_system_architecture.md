# System Architecture: 3-Layer Framework

This document defines the core architecture for this project. All operations must strictly adhere to these three layers.

## Layer 1: Directive (The "What")
- **Location**: `directives/`
- **Format**: Markdown (.md)
- **Purpose**: Standard Operating Procedures (SOPs). Defines goals, inputs, tools to use, expected outputs, and edge cases.
- **Role**: Instructions for a mid-level employee.

## Layer 2: Orchestration (The "How")
- **Location**: AI Agent Logic (Context)
- **Purpose**: Intelligent routing and decision-making.
- **Workflow**:
    1. Read Directive.
    2. Identify necessary Execution tools.
    3. Call tools in order.
    4. Handle errors and feedback loops.
    5. Update Directives based on new learnings.

## Layer 3: Execution (The "Do")
- **Location**: `execution/`
- **Format**: Python scripts (.py)
- **Purpose**: Deterministic work. API calls, data processing, file operations.
- **Principles**: Reliable, testable, fast, well-commented. Uses `.env` for secrets.

---

## Operating Principles
1. **Check for tools first**: Before writing a script, check `execution/`.
2. **Self-annealing**: If a script fails, diagnose the error, fix the script, test it, and update the corresponding directive with the learned constraints.
3. **Iterative Directives**: Directives are living documents. Improve them as you encounter real-world API limits or edge cases.

## File Standards
- `.tmp/`: Intermediate data (never committed).
- `execution/`: Pure logic and API interaction.
- `directives/`: Clear documentation.
- **Deliverables**: Cloud-based (Google Sheets, etc.) where possible.
