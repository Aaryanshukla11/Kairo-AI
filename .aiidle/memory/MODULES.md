# Modules List

This document lists and maps the responsibilities, dependencies, interfaces, and statuses of all active system modules.

---

## 1. VS Code Extension
- **Purpose**: Integrates the system workspace with Visual Studio Code editor panels and windows.
- **Responsibilities**: Registers sidebar view webviews and catches workspace save/change hooks.
- **Dependencies**: VS Code API runtime.
- **Public APIs**: `activate(context: ExtensionContext): void`, `deactivate(): void`
- **Current Status**: Initialized (wrapper structure defined).
- **Future Improvements**: Multi-workspace optimizations.

## 2. Chat UI
- **Purpose**: Exposes an interactive message view for human-agent pairing.
- **Responsibilities**: Displays text threads, checklist status updates, and code diff panels.
- **Dependencies**: React library frontend.
- **Public APIs**: `renderMessage(msg: Message): void`, `promptUserConfirmation(text: string): Promise<boolean>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Advanced markup themes and prompt macros.

## 3. Planner Engine
- **Purpose**: Formulates step-by-step checklists to satisfy developer prompts.
- **Responsibilities**: Decomposes requests into target modules and code update plans.
- **Dependencies**: Local LLM provider context APIs.
- **Public APIs**: `generatePlan(prompt: string, context: ProjectContext): TaskPlan`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Parallel planning validation pipelines.

## 4. Approval Engine
- **Purpose**: Gates high-impact operations.
- **Responsibilities**: Prompts the developer for checklist actions and code modification diff updates.
- **Dependencies**: Chat UI messaging.
- **Public APIs**: `requestApproval(plan: TaskPlan): Promise<ApprovalResult>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Dynamic rollback checkpoint controls.

## 5. Memory Engine
- **Purpose**: Maintains codebase memory states under the root `.aiidle/` folder.
- **Responsibilities**: Manages session log files, roadmaps, rules, and technology stacks.
- **Dependencies**: Local filesystem API wrapper.
- **Public APIs**: `updateState(key: string, value: any): void`, `appendSessionLog(entry: LogEntry): void`
- **Current Status**: Active and fully operational.
- **Future Improvements**: Automatic formatting validation checks.

## 6. Workspace Scanner
- **Purpose**: Evaluates files structure within active directories.
- **Responsibilities**: Lists active files and checks path boundaries.
- **Dependencies**: Ripgrep engine paths index.
- **Public APIs**: `scanWorkspace(path: string): Promise<FileTreeMap>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: File watcher hot reload integrations.

## 7. Knowledge Engine
- **Purpose**: Supplies context-specific codebase template patterns to the Planner.
- **Responsibilities**: Stores code design systems, coding standards guidelines, and templates.
- **Dependencies**: Local file indexes.
- **Public APIs**: `retrieveKnowledge(query: string): KnowledgeItem[]`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Semantic metadata categorizations.

## 8. RAG Engine
- **Purpose**: Semantic embedding retrieval system.
- **Responsibilities**: Indexes codebase chunks and queries flat vector memory structures.
- **Dependencies**: Local embedding model packages.
- **Public APIs**: `retrieveSemanticContext(query: string): EmbeddingMatch[]`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Multi-threaded indexing loops.

## 9. Context Builder
- **Purpose**: Builds prompt context mappings.
- **Responsibilities**: Reads memory configurations and formats LLM prompts.
- **Dependencies**: Memory Engine modules.
- **Public APIs**: `assemblePrompt(prompt: string): string`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Model-specific prompt optimization rules.

## 10. Tool Executor
- **Responsibilities**: Sequentially runs file modifications, terminal operations, and validations.
- **Dependencies**: File System, Terminal, and Git Engines.
- **Public APIs**: `executeChanges(changes: FileChange[]): Promise<ExecutionResult>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Multi-threaded process isolation queues.

## 11. Terminal Engine
- **Purpose**: Spawns CLI commands safely.
- **Responsibilities**: Executes local compiler check scripts and test runs.
- **Dependencies**: Node child processes.
- **Public APIs**: `runTerminalCommand(cmd: string): Promise<CommandResult>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Sandbox shell containment layers.

## 12. File System Engine
- **Purpose**: Processes atomic codebase changes.
- **Responsibilities**: Writes code to staging folders, blocks path traversals, and updates workspace files.
- **Dependencies**: Node filesystem library.
- **Public APIs**: `atomicWrite(path: string, content: string): Promise<void>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Atomic staging buffers.

## 13. Git Engine
- **Purpose**: Tracks code versions and coordinates checkpoints.
- **Responsibilities**: Checkouts staging branches, performs diff evaluations, and triggers rollbacks.
- **Dependencies**: Git execution binary.
- **Public APIs**: `createCheckpoint(): string`, `restoreCheckpoint(commitHash: string): void`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Independent tracking logs.

## 14. Settings Manager
- **Purpose**: Manages runtime configurations.
- **Responsibilities**: Serializes active settings, token limitations, and model paths.
- **Dependencies**: JSON file reader.
- **Public APIs**: `getSetting(key: string): any`, `updateSetting(key: string, val: any): void`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Secure credentials vault.

## 15. Logging System
- **Purpose**: Emits log parameters.
- **Responsibilities**: Outputs structured logs into active files under `.aiidle/logs/`.
- **Dependencies**: File System Engine.
- **Public APIs**: `log(level: string, message: string): void`
- **Current Status**: Active and operational.
- **Future Improvements**: Stream parser hooks.

## 16. Error Recovery
- **Responsibilities**: Catches task failures, invokes rollback checkouts, and handles warnings.
- **Dependencies**: Git Engine.
- **Public APIs**: `triggerRollback(): Promise<void>`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Multi-checkpoint rollback trees.

## 17. Configuration Manager
- **Purpose**: Validates runtime default properties.
- **Responsibilities**: Standardizes workspace setup values.
- **Dependencies**: Settings Manager.
- **Public APIs**: `resolveConfig(): ConfigurationMap`
- **Current Status**: Specified in contracts.
- **Future Improvements**: Direct IDE environment parsing hooks.
