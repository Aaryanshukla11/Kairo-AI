# Repository Blueprint

This document defines the physical layout of the repository, folder boundaries, directory ownership, and file mapping responsibilities.

---

## 1. Top-Level Directory Layout

The repository is structured to maintain isolation between application code, memory stores, and test suits.

```
AIIdle/
├── .aiidle/              # Repository brain (System memory)
│   ├── memory/           # Governance guidelines, logs, status
│   ├── contracts/        # Module boundary contracts
│   ├── logs/             # Standard diagnostics log outputs
│   ├── prompts/          # Sequential prompts history archives
│   └── specs/            # Technical specification documents
├── src/                  # Application source code
│   ├── extension/        # Main VS Code Extension process code
│   ├── webview/          # Frontend Webview React components
│   └── common/           # Common data structures and contracts types
├── tests/                # Workspace test suites
│   ├── unit/             # Atomic unit tests
│   └── integration/      # Pipeline integration tests
├── .gitignore            # Git exclusion mapping
├── package.json          # Node package description
└── tsconfig.json         # TypeScript compiler configurations
```

---

## 2. Directory Ownership and Responsibilities

### 2.1. `.aiidle/`
- **Owner**: Memory Engine.
- **Responsibilities**: Stores the persistent state of the workspace. No compile-ready application code is allowed here.

### 2.2. `src/extension/`
- **Owner**: VS Code Extension wrapper.
- **Responsibilities**: Editor sidebar integrations, event capturing, command registration, and helper servers processes.

### 2.3. `src/webview/`
- **Owner**: Chat UI.
- **Responsibilities**: Visual interface dashboards, diff comparisons displays, and checklist renders.

### 2.4. `src/common/`
- **Owner**: Orchestrator (Shared).
- **Responsibilities**: Contains static types and interface contracts schemas. No module-specific business logic is allowed.

### 2.5. `tests/`
- **Owner**: Testing module.
- **Responsibilities**: Unit and integration test files.

---

## 3. Folder Separation Rules
- **No Overlap**: A module must restrict its file footprint to its own source directory.
- **Dependency Paths**: Modules inside `src/webview/` are not permitted to reference `src/extension/` imports directly. They must use the postMessage API bridge.
