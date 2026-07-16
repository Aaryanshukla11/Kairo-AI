# Dependency & Import Rules

This document specifies the allowed dependency paths, import directions, and code visibility constraints.

---

## 1. Module Dependency Rules

To prevent code coupling and spaghetti references:

- **Allowed Connections**:
  - `src/extension/` imports `src/common/`.
  - `src/webview/` imports `src/common/`.
  - Service classes (e.g. `PlannerService`) import contracts and configurations.
- **Forbidden Connections**:
  - `src/webview/` must never import from `src/extension/` directly.
  - Core processing systems must never import UI code components.
  - Utilities must not import from higher-level services.

### 1.1. Circular Dependency Protection
- Circular dependency structures (e.g. Module A imports Module B, and Module B imports Module A) are strictly blocked.
- Modules must interact via defined interfaces contracts in `src/common/` rather than concrete classes.

### 1.2. Maximum Dependency Depth
- The maximum nested dependency depth inside module services is capped at `4` levels.

---

## 2. Import Rules

### 2.1. Absolute vs Relative Imports
- Absolute path imports using path mappings (e.g., `@common/types`) are preferred for cross-module imports.
- Relative imports (`./` and `../`) are limited to sibling files inside local directories.

### 2.2. Import Ordering
Imports must follow the structured sort order:
1. Node native modules (e.g., `fs`, `path`).
2. Third-party libraries (e.g., `react`, `vscode`).
3. Internal workspace mapping paths (e.g., `@common/contracts`).
4. Relative file references.

### 2.3. Barrel Exports Policy
- Barrel files (`index.ts` files) are permitted only at the module root boundaries to expose public APIs. No nested barrel files.
