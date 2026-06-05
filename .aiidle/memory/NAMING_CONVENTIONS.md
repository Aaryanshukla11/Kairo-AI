# Naming Conventions

This document specifies the naming conventions for all codebase elements.

---

## 1. Codebase Naming Conventions

### 1.1. Variables & Functions
- **Format**: `camelCase` (e.g., `let taskIndex = 0;`, `function executeTask() {}`).
- **Guidelines**: Use descriptive nouns for variables and action verbs for functions.

### 1.2. Classes & Interfaces
- **Format**: `PascalCase` (e.g., `class ToolExecutor {}`, `interface WorkspaceConfig {}`).
- **Interfaces Prefix**: Do **not** prefix interfaces with `I`. Use clean nouns (e.g. `FileNode` instead of `IFileNode`).

### 1.3. Enums & Types
- **Format**: `PascalCase` (e.g., `enum LogSeverity {}`, `type TaskPlan = {}`).

### 1.4. Constants
- **Format**: `UPPER_SNAKE_CASE` (e.g., `const MAX_LOG_SIZE_BYTES = 5242880;`).

### 1.5. React Hooks
- **Format**: `camelCase` prefixed with `use` (e.g., `usePlanChecklist`).

### 1.6. React Components
- **Format**: `PascalCase` (e.g., `function DiffViewerComponent() {}`).

---

## 2. File & Directory Conventions

### 2.1. Files Naming
- Source files: `camelCase` (e.g., `logAppender.ts`).
- Component files: `PascalCase` (e.g., `DiffViewerComponent.tsx`).
- Specs files: `kebab-case` (e.g., `error-recovery.md`).
- Contract files: `dot-notation` (e.g., `memory.contract.md`).

### 2.2. Directory/Folder Naming
- **Format**: `camelCase` or `kebab-case` depending on context.

---

## 3. Configuration Files
- **Format**: `kebab-case` (e.g., `tsconfig.json`, `package.json`).
