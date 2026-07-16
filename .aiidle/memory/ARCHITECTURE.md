# AIIdle Version 1 Architecture Bible

This document specifies the software architecture, data flow, state models, and design standards for AIIdle Version 1. Every module implementation and design decision must conform strictly to this specification.

---

## 1. High Level Architecture

AIIdle is structured around an offline-first, local-first architecture built inside the Visual Studio Code editor sandbox. 

```
                                    +-----------------------+
                                    |     VS Code UI        |
                                    | (Webviews, Sidebar)  |
                                    +-----------+-----------+
                                                | (postMessage / RPC)
                                                v
                                    +-----------------------+
                                    |  VS Code Extension    |
                                    |      Host Process     |
                                    +-----------+-----------+
                                                |
                      +-------------------------+-------------------------+
                      |                                                   |
                      v                                                   v
           +--------------------+                               +--------------------+
           |   Planner Engine   |                               |   Executor Engine  |
           | (Local LLM Agent)  |                               | (Terminal/Filesystem)|
           +----------+---------+                               +----------+---------+
                      |                                                    |
                      +-------------------------+--------------------------+
                                                |
                                                v
                                    +-----------------------+
                                    |     Memory Engine     |
                                    |     (.aiidle/)        |
                                    +-----------------------+
```

### Major Systems:
1. **VS Code Extension Wrapper**: Orchestrates VS Code specific processes, loads sidebars, catches workspace notifications, and handles activation hooks.
2. **Chat UI**: React-based front-end executed inside VS Code's Webview. Exposes prompt messaging, checklists, and code diff previews.
3. **Planner Engine**: Structured local LLM reasoning loop. Compiles the active context and translates prompts into a list of structured task checklists.
4. **Tool Executor**: Translates planned checklist tasks into filesystem writes, git operations, and terminal shell scripts.
5. **Memory Engine**: File system repository memory (under `.aiidle/`) maintaining vision alignments, statuses, roadmaps, specifications, and execution logs.

---

## 2. Module Dependency Graph

All communication must follow unidirectional downstream dependencies.

```
       [Extension Host] ----------> [Chat UI]
              |
              +--------> [Planner Engine] --------> [Context Builder]
              |                                            |
              |                                            v
              |                                     [Memory Engine]
              |                                            ^
              |                                            |
              +--------> [Executor Engine] ----------------+
                               |
            +------------------+------------------+
            |                  |                  |
            v                  v                  v
     [File System]      [Terminal Engine]     [Git Engine]
```

### Allowed Communication:
- **Extension Host** coordinates **Planner** and **Executor**.
- **Planner** requests prompt rendering context from **Context Builder**.
- **Context Builder** reads state from **Memory Engine**.
- **Executor** runs operations via **File System**, **Terminal**, and **Git**.

### Forbidden Communication:
- **Chat UI** must never directly call the **Executor**, **Terminal**, or **File System**. All actions require routing through the Extension Host and Approval gates.
- **Terminal Engine** must never modify the files directly; all writes are routed through the **File System Engine**.
- **Planner Engine** must never write configuration properties to the repository memory without user validation.

---

## 3. Core Modules

### 3.1. VS Code Extension
- **Responsibilities**: Registers commands, initiates Webview panels, runs activation loops, and monitors active workspaces.
- **Interfaces**: Connects editor workspaces to local server subprocesses.

### 3.2. Chat UI
- **Responsibilities**: Renders messaging boards, interactive lists, and file diffs.
- **Interfaces**: Passes PostMessage events to the extension runtime wrapper.

### 3.3. Planner Engine
- **Responsibilities**: Analyzes workspace directories and decomposes instructions into a JSON execution plan.
- **Interfaces**: Communicates with the local LLM runtime APIs.

### 3.4. Approval Engine
- **Responsibilities**: Gates all executor writes and script runs. Renders user confirmation modals.
- **Interfaces**: Blocks the execution loop until an approval hook receives user action.

### 3.5. Memory Engine
- **Responsibilities**: Reads and writes context indexes, logs, roadmaps, and todo states in `.aiidle/`.
- **Interfaces**: Exposes type-safe helper functions to modify metadata files.

### 3.6. Workspace Scanner
- **Responsibilities**: Builds file tree models and matches directories using Ripgrep queries.
- **Interfaces**: Returns list indices to the Context Builder.

### 3.7. Knowledge Engine
- **Responsibilities**: Indexes internal code design systems, coding standards, and patterns.
- **Interfaces**: Matches code templates based on architectural specifications.

### 3.8. RAG Engine
- **Responsibilities**: Splits code files, generates local embeddings, and queries vector indices offline.
- **Interfaces**: Integrates local embedding models.

### 3.9. Context Builder
- **Responsibilities**: Pulls data from memory (VISION, RULEBOOK, PROJECT_STATUS) and merges it into structured LLM prompts.
- **Interfaces**: Returns prompt strings to the Planner.

### 3.10. Tool Executor
- **Responsibilities**: Sequences file operations, terminal actions, and compiler validations in order.
- **Interfaces**: Executes the task list generated by the Planner.

### 3.11. Terminal Engine
- **Responsibilities**: Spawns sandboxed OS terminal processes and streams stdout/stderr outputs.
- **Interfaces**: Wraps Node process hooks.

### 3.12. File System Engine
- **Responsibilities**: Handles atomic write transactions, staging directories, and path sanitation.
- **Interfaces**: Directly updates physical files inside the target workspace.

### 3.13. Git Engine
- **Responsibilities**: Manages branch checkouts, logs commits, calculates diff logs, and restores checkpoints.
- **Interfaces**: Wraps local Git binaries.

### 3.14. Settings Manager
- **Responsibilities**: Serializes configurations, LLM parameters, paths, and token thresholds.
- **Interfaces**: Exposes configuration parameters.

### 3.15. Logging System
- **Responsibilities**: Logs levels (DEBUG, INFO, WARN, ERROR) into structured file outputs under `.aiidle/logs/`.
- **Interfaces**: Standardized log format stream.

### 3.16. Error Recovery
- **Responsibilities**: Intercepts compiler errors, restores Git repository checkpoints, and cleans up lock files.
- **Interfaces**: Triggered on failure cases in the Executor Engine.

### 3.17. Configuration Manager
- **Responsibilities**: Manages default environment properties and custom user overrides.
- **Interfaces**: Returns resolved active configurations.

---

## 4. Data Flow

The diagram below maps the execution lifecycle of a developer request:

```
 User Prompt
      |
      v
 [Context Builder] <--- Reads Vision, Rules, Status, Stack, and Glossary
      |
      v
 [Knowledge & RAG] <--- Pulls local code blueprints and context indices
      |
      v
 [Planner Engine]  ---> Generates structured Checklist JSON
      |
      v
 [Approval Gate]   ---> UI displays file diff previews and checklist blocks
      |
      +---> User Approves?
                 |
        +--------+--------+
        | Yes             | No
        v                 v
 [Tool Executor]      [Cancel Loop]
        |
        v
 [File System]     ---> Writes updates to target files atomically
        v
 [Git Engine]      ---> Commits changes to workspace branch
        v
 [Terminal Engine] ---> Executes test suite (Jest/Vitest) and compile tests
        v
 [Error Recovery]  ---> IF test/compile fails: rolls back to git checkpoint
        v
 [Memory Engine]   ---> Updates Session Log, Todo list, and Project Status
        v
   Completion
```

---

## 5. Folder Responsibilities

To prevent structural overlap, directory responsibilities are isolated as follows:

- `.aiidle/`: Contains repository memory configurations, logs, specs, and prompts. Must contain no application source files.
- `.aiidle/memory/`: Contains repository state files (Vision, Rulebook, Context, status).
- `.aiidle/contracts/`: Defines communication interfaces between modular components.
- `.aiidle/logs/`: Runtimes log files (`agent.log`, `terminal.log`, `build.log`, `errors.log`).
- `.aiidle/prompts/`: Categorized user prompt files.
- `.aiidle/specs/`: Feature specifications and architecture profiles.
- `src/`: Contain all runtime application source code folders:
  - `src/extension/`: Main extension host scripts.
  - `src/webview/`: Frontend React components.
  - `src/common/`: Common types, utilities, and contract interfaces.
- `tests/`: Project unit and integration test files.

---

## 6. Communication Rules

### Allowed Communication:
- Top-down module communication following downstream imports.
- Data structures passed between modules must match contract parameters defined under `.aiidle/contracts/`.

### Forbidden Communication:
- Circular references (e.g. Module A imports Module B, and Module B imports Module A).
- Direct access to `logs/*.log` files from client Webview scripts.
- Bypass of the **Approval Engine** for write actions.

---

## 7. Error Handling Philosophy

- **Explicit Failures**: Every method must catch execution errors and return them using wrapped status payloads containing: `{ success: boolean, error?: string, code?: string }`.
- **Failure Propagation**: Warnings and errors must propagate upstream to the Extension Host before writing to the log files.
- **Rollback Strategy**: The Git Engine must create a checkpoint commit before executing any Executor steps. If execution fails or compiler checks exit with non-zero codes, the executor initiates checkout rollback to restore the workspace files to the checkpoint state.

---

## 8. State Management

The workspace monitors state parameters across five layers:

1. **Project State**: The git tree, active workspace directories, and files state.
2. **Agent State**: Active task checklist step indices, current model endpoints, and context window capacities.
3. **Session State**: React component parameters inside the VS Code Webview panel.
4. **Task State**: Checklist states (`[ ]`, `[/]`, `[x]`) tracked in `TODO.md`.
5. **Memory State**: Core configuration files under `.aiidle/memory/`.

---

## 9. Extension Lifecycle

1. **Activation**: Triggered on VS Code startup or command invocation. Loads settings configurations and initiates local server subprocesses.
2. **Initialization**: Checks local LLM API paths, initializes log systems, and creates directory directories if missing.
3. **Workspace Loading**: Walks directories using the Workspace Scanner and builds file index files.
4. **Task Execution**: Orchestrates the prompt processing data flow loop (Planner -> Approval -> Executor).
5. **Shutdown**: Closes active local server ports, kills terminal subprocess threads, and flushes log stream buffers to disk.
6. **Recovery**: Verifies lock files and restores the last successful checkpoint if a crash occurs.

---

## 10. Performance Strategy

- **Ripgrep Integration**: Locate code patterns using search index binaries instead of node recursive directory checks.
- **Lazy Load Modules**: Load libraries and model runtimes asynchronously on execution demand.
- **Context Limits Protection**: Trim session history arrays dynamically when context windows approach LLM thresholds.
- **File System Caching**: Store directory trees in local session memory; refresh indexes only on file-save triggers.

---

## 11. Security Architecture

- **Approval Gates**: Command executions and file modifications require user confirmation.
- **Path Validation**: Throw path traversal errors if any relative path contains `../` sequences leading outside the workspace directory.
- **Terminal Isolation**: Restrict shell parameters to basic web development commands (Node, npm, pnpm, git).

---

## 12. Logging Strategy

Logs are saved in `.aiidle/logs/` in a standard format:
`[TIMESTAMP] [LEVEL] [MODULE] [MESSAGE]`

### Log Levels:
- **DEBUG**: Extended trace diagnostics.
- **INFO**: Standard session progress status.
- **WARN**: Caught execution recovery paths.
- **ERROR**: Critical operations errors.

---

## 13. Future Expansion

- **Adapter Patterns**: Feature runtimes interface with adapters (e.g. `TerminalAdapter`, `CompilerAdapter`) to allow plug-in of future frameworks (Python, Rust, CI platforms) without modifying the orchestrator core.
- **Contract Boundary Isolation**: Creating a new module requires matching a contract template under `.aiidle/contracts/`.

---

## 14. Anti Patterns

- **God Objects**: Building monolithic managers (e.g. `MainAgentManager`) that run planning, filesystem writes, and user chats.
- ** circular imports**: Violating hierarchical layering.
- **Global Mutable State**: Passing states in global variables instead of scoped context parameters.
- **Hidden side-effects**: Modifying files or settings without explicit log entries or user validations.

---

## 15. Engineering Principles

- **Single Responsibility (SRP)**: Each module or class has one, well-defined reason to change.
- **Open-Closed Principle (OCP)**: Systems are open for extension (via adapters and plug-ins) but closed for modification.
- **Dependency Inversion (DIP)**: High-level orchestration controllers depend on interface boundaries, not concrete classes.
- **High Cohesion & Low Coupling**: Keep functions focused and code dependencies isolated.

---

# Historical Architecture Log

## [2026-07-16] - Documentation System Setup

* **Previous Design**: No structures existed at start. First prompt added `project-docs/`.
* **New Design**: Added `.aiidle/memory/` containing structured Markdown documents detailing session logs, roadmap, changelogs, dependencies, features, modules, and file index.
* **Reason**: Establish structured, machine-parsable, and developer-friendly documentation for persistent memory.
* **Advantages**: Covers multiple aspects of project lifecycle (roadmaps, dependencies, modules) in separation of concerns files.
* **Tradeoffs**: Minor overhead to keep files synchronized during prompt executions.
* **Future Scalability**: Allows AI agents to read specific documentation files (like `DEPENDENCIES.md` or `MODULES.md`) without parsing the entire history.

## [2026-07-16] - Documentation System Upgrade

* **Previous Design**: Dual system tracking in both `project-docs/` (human-oriented) and `.aiidle/memory/` (agent-oriented).
* **New Design**: Deprecated and deleted the legacy `project-docs/` directory. Restructured `.aiidle/` into four specialized sub-folders (`memory/`, `logs/`, `prompts/`, `specs/`). Added constitutional and specification files (`CONTEXT.md`, `VISION.md`, `CODING_STANDARDS.md`, `API_REFERENCE.md`, `TEST_REPORT.md`, `SECURITY.md`).
* **Reason**: Single source of truth model prevents synchronization drift, reduces folder clutter, and ensures all developer-agent context is localized in `.aiidle/`.
* **Advantages**: Clean file structure, clear separation of active runtime logs vs. persistent specs/prompts, and elimination of document duplication.
* **Tradeoffs**: Requires a unified agent context parser capable of traversing `.aiidle/` directories.
* **Future Scalability**: The directories `prompts/` and `specs/` will scale dynamically as new features are specified and implemented without bloating the core metadata files in `memory/`.
