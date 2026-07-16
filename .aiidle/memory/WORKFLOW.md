# Development Workflow

This document details the step-by-step developer and agent workflows, Git branching strategies, commit messaging standards, and recovery rollback steps.

---

## 1. Development Lifecycle

Every task follows a strict execution pipeline:

```
Receive Prompt
      │
      ▼
Check Load Order (VISION -> RULEBOOK -> CONTEXT -> PROJECT_STATUS -> STACK)
      │
      ▼
Create Checkpoint (Git commit)
      │
      ▼
Build Execution Plan (Planner Engine Checklist)
      │
      ▼
Request Developer Approval (Chat UI Checklist and Diff panels)
      │
      ▼
Apply Operations (FS writes and Terminal shell validation checks)
      │
      ▼
Self Validation (Verify Types, Compile status, and run Jest tests)
      │
      ▼
Update Documentation (Synchronize memory folder logs)
      │
      ▼
Complete Turn
```

---

## 2. Version Control Strategy

### 2.1. Branch Naming Conventions
- Features: `feature/module-name` (e.g., `feature/planner-engine`).
- Fixes: `fix/bug-description` (e.g., `fix/path-traversal`).
- Hotfixes: `hotfix/emergency-description`.
- Document/Governance: `docs/upgrade-memory`.

### 2.2. Commit Message Standards
- Formats: `<type>(<scope>): <short description>`
- Types:
  - `feat`: A new feature interface.
  - `fix`: A bug fix.
  - `docs`: Documentation alterations only.
  - `style`: Formatting edits.
  - `refactor`: Structural codebase edits without behavior modifications.
  - `test`: Adding or updating tests.
  - `chore`: Infrastructure updates.
- Scope: The targeted module (e.g., `feat(planner): add output validator schema`).

### 2.3. Rollback Procedures
- When compile checks fail or terminal test errors are captured during executor tasks:
  1. Halt execution queue immediately.
  2. Query git hash registry for the pre-task checkpoint hash.
  3. Execute `git checkout -- .` and clean unstaged nodes.
  4. Write diagnostics message to `logs/errors.log`.
  5. Alert developer inside Chat UI panel.
