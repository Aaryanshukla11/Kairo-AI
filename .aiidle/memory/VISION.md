# AIIdle - Project Constitution & Vision

This document stands as the highest authority in the repository. Every future architecture change, module design, dependency, code review, and implementation must comply with the rules and principles defined herein. No prompt or implementation may violate this constitution.

---

## 1. Vision Statement
AIIdle is a professional-grade local software engineering workspace integrated inside Visual Studio Code. It operates as an autonomous, self-documenting agent that can build, modify, test, and maintain software codebases without relying on external cloud APIs or active network connections.

## 2. Mission Statement
To empower software engineers with a highly collaborative, local AI pair programming assistant. The assistant operates safely in a sandbox environment and translates natural language prompts into high-quality code, ensuring 100% data privacy and offline sovereignty.

## 3. Core Philosophy
- **Local Sovereignty**: All reasoning, compilation, execution, testing, and memory maintenance must run locally on the developer's workstation.
- **Agent-Developer Symmetry**: The agent and the developer share a synchronized state using the repository's `.aiidle/` folder system as the codebase memory.
- **Determinism and Transparency**: Avoid magical or hidden side-effects. All commands proposed by the agent are explicitly visible, explainable, and logged.

## 4. Product Principles
- **Zero Configuration Setup**: The tool must bootstrap immediately using default local resources after extension installation.
- **Offline Usability**: All core processes must remain 100% usable without an active internet connection.
- **Clear Approval Boundaries**: High-impact tasks require developer authorization through explicit diff interfaces.

## 5. Engineering Principles
- **No Architectural Debt**: Never write quick fixes or unvetted structures that bypass formatting, types, or design specifications.
- **Zero Business Logic Duplication**: Business rules must be modularized and shared through imports. Never copy-paste business logic.
- **Scope Alignment**: Do not implement features or pull libraries that are outside the approved version scope.
- **Composition over Inheritance**: Use functional composition, dependency injection, and helper modules instead of deep class inheritance hierarchies.

## 6. Architecture Principles
- **Loose Coupling**: Inter-module communication must happen strictly via contracts defined in the `.aiidle/contracts/` folder.
- **Unidirectional Dependency Graph**: Higher-level modules (e.g. CLI, Extension View) depend on core systems (Planner, Executor); core systems must never import UI code.
- **Clean Contracts**: Interfaces must explicitly define input validation schemas, failure parameters, and error types.

## 7. Offline First Philosophy
- **Local Compiler/Toolchains**: Execute tasks using local node/npm/pnpm runtimes and binaries.
- **No External Latency Dependencies**: Avoid checking remote databases, models, or APIs during runtime processing.
- **Offline Gradients**: Fallback to graceful local warnings when any command attempts external fetches.

## 8. Privacy First Philosophy
- **Local Telemetry Sandbox**: No codebase context, prompt text, or execution logs may leave the local computer.
- **Data Containment**: Restrict file searches and write processes to the target workspace folder.
- **Zero Code Leakage**: Strictly avoid loading third-party cloud analytics libraries.

## 9. Security Principles
- **Terminal Execution Gates**: Sandboxed CLI command executions require explicit user approval before spawning a shell process.
- **Path Traversal Prevention**: Sanitize all file write paths to block operations outside the workspace root directory.
- **Input Sanitation**: Parse and validate user prompt parameters to block injection hazards.

## 10. Scalability Principles
- **Incremental Context Parsing**: Do not read full repositories into memory. Scan segments incrementally using search filters (e.g., Ripgrep).
- **Log Rotation**: Limit the size of active diagnostic outputs; older sessions are archived cleanly.
- **State Compaction**: Maintain concise status logs to fit LLM prompt token windows.

## 11. Maintainability Principles
- **Synchronized Documentation**: Maintain the `.aiidle/` documentation structure in lockstep with codebase upgrades.
- **TypeScript Strict Enforcement**: No developer or agent is permitted to bypass TypeScript compiler error blocks.
- **Type Cleanliness**: Avoid `any` types; explicitly define interface parameters for every function.

## 12. Performance Principles
- **Sub-100ms Latencies**: Main thread UI interactions must execute in under 100ms.
- **Lazy Initialization**: Load models and databases asynchronously only when requested.
- **Minimal Idle CPU footprint**: Background scanning must pause when the extension panel is closed.

## 13. Reliability Principles
- **Atomic File Writing**: Use temporary staging files during code generation to prevent codebase file corruption.
- **State Rollbacks**: Maintain checkpoints in `.aiidle/memory/CHECKPOINTS.md` to support quick rollbacks.
- **Error Tracking**: Log all warnings and errors to `.aiidle/logs/errors.log` with clean execution stack traces.

## 14. Code Quality Principles
- **Short Functions**: Functions must not exceed 50 lines of execution logic.
- **Dry Code Pattern**: Refactor code segments that match existing structural patterns.
- **Code Coverage**: Aim for at least 80% automated unit and integration test coverage.

## 15. Documentation Principles
- **Real-Time Sync**: Update the project memory files after every completed prompt.
- **Active Context**: Update `CONTEXT.md` to reflect the active sprint task and branches.
- **Single Source of Truth**: Document architectural decisions in `DECISIONS.md`.

## 16. User Experience Principles
- **Interactive Checklist Display**: Expose step-by-step progress using real-time checklists.
- **Side-by-Side Diff Panels**: Display code changes visually before committing edits to disk.
- **Clear Status Updates**: Provide instant progress states for long-running processes.

## 17. AI Behaviour Principles
- **Pair Programming Paradigm**: The AI acts as a cooperative pair programmer, proposing changes and requesting feedback.
- **Unambiguous Clarifications**: Ask for explicit instructions when requirements contain conflicting scopes.
- **No Fabricated Confirmations**: Never claim a file is created or a test is verified without execution output validation.

## 18. Approval System Philosophy
- **Developer Authority**: The agent is submissive to developer choices. No command or file write executes without user validation.
- **Checkpoints**: Record workspace checkpoints before heavy terminal tasks to enable safe rollbacks.

## 19. Memory Philosophy
- **Flat-File Storage**: Keep agent configurations and roadmaps inside `.aiidle/memory/` in Markdown formats for parsing ease.
- **Chronological Logs**: Session progress must be appended to `SESSION_LOG.md` without deleting historic entries.

## 20. Knowledge Philosophy
- **Workspace Dominance**: Scan local repository layout first before consulting generic training context.
- **Knowledge Item Indexes**: Use knowledge blueprints to avoid duplicate implementation patterns.

## 21. Extension Philosophy
- **Lightweight Viewport**: The extension wrapper serves as an interface layer, routing heavy processing logic to local helper processes.
- **Editor Coexistence**: Respect default VS Code themes, shortcuts, and active packages.

## 22. Long-Term Product Direction
- Expand support to other backend ecosystems (Python, Go, Rust, Java).
- Integrate local vector stores and Ollama instances for semantic codebase searches.
- Implement automated local CI test validation pipelines.

## 23. Version 1 Scope
V1 focuses strictly on local web development using:
- **Languages**: HTML, CSS, JavaScript, TypeScript.
- **Frameworks/Libraries**: React, Next.js, Vite, Tailwind CSS, Express, Node.js.
- **Tools**: npm, pnpm, Git, Basic Terminal commands.

## 24. Future Expansion Strategy
- Formulate modular adapters for mobile development and desktop frameworks only after V1 success criteria are fully met.

## 25. Non Goals
- Android / iOS mobile development.
- Game development.
- Machine Learning models training.
- Desktop applications (Electron, Tauri).
- Cloud deployment pipelines.
- External cyber security tooling.

## 26. Things This Project Will Never Compromise On
- **100% Offline Functionality**: Core processes must operate without network access.
- **Absolute Privacy**: Code never leaves the local developer machine.
- **Zero Unapproved Edits**: The developer must approve all modifications.

## 27. Things This Project Will Never Become
- A cloud-hosted SaaS environment requiring login accounts.
- A fully autonomous autopilot that alters codebases without user visibility.

## 28. Definition of Production Ready
- Code compiles with zero TypeScript compile warnings or errors.
- Jest/Vitest test suites run and pass.
- Code matches all constraints in `RULEBOOK.md`.
- File writes are fully sandboxed.

## 29. Definition of Complete
- All features are implemented and validated via test cases.
- System contracts are met.
- The `.aiidle/` folder configurations are synchronized.

## 30. Engineering Success Criteria
- 100% offline startup.
- Under 200ms rendering latency for extension interface dashboards.
- Complete documentation alignment verified after each completed prompt.
