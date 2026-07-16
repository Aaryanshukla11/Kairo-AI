# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0-draft] - 2026-07-16

### Added
- Completed Task M01-S03-T005: Workspace Scanner Foundation.
  - Initialized isolated, non-executing read-only project detection algorithms locking against accidental codebase mutations.
  - Formatted global root type structures bridging File/Folder mapping into a scalable `WorkspaceSnapshot` format.
  - Implemented hard ignore arrays (`IgnoreRules.ts`) preventing heavy memory leaks traversing internal `node_modules` and `.git` caches.
- Completed Task M01-S03-T004: Session Manager Foundation.
  - Abstracted `Session` and `SessionMetadata` types orchestrating conversation blocks.
  - Mounted generic Node-level `SessionManager` caching instances within `SessionRegistry`.
  - Exported matching `sessionState.ts` custom hooks for the React frontend, driven via IPC arrays inside `sessionService.ts`.
- Completed Task M01-S03-T003: Prompt Pipeline Foundation.
  - Abstracted foundational Prompt models (`Prompt.ts`, `PromptMetadata.ts`, `PromptResult.ts`) supporting future immutable injections.
  - Scaffolded native validation constraints locking incoming streams against structural overflows or null sets (`PromptValidator.ts`).
  - Integrated `PromptPipeline` logic hooks returning mapped asynchronous lifecycle results.
  - Interfaced React UI `promptService.ts` cleanly over the Pub/Sub bus avoiding native DOM dependencies.
- Completed Task M01-S03-T002: Shared Message Protocol.
  - Constructed strictly typed schemas (`messageSchemas.ts`) driven by unified Enums (`messageTypes.ts`).
  - Implemented generic message builder `MessageFactory` abstracting required payload structures.
  - Scaffolded native runtime `ProtocolValidator` guarding IPC ingestion against invalid objects.
- Completed Task M01-S03-T001: VS Code Communication Bridge.
  - Initialized isolated bridge boundaries mapped via strict typings inside `src/shared/messages.ts`.
  - Engineered Webview-sided `messageBus.ts` wrapper enabling PubSub isolation over the active bridge hook.
  - Implemented Node-sided `MessageRouter` structural switch pipeline securing inter-process data commands locally.
  - Deprecated legacy hardcoded dispatch mapping on the webview provider.
- Completed Task M01-S02-T008: Frontend State Architecture.
  - Initialized isolated state structures (`appState.ts`, `uiState.ts`, `chatState.ts`).
  - Extracted global VS Code APIs into `services/vscodeBridge.ts` singleton guard.
  - Scaffolded native React `AppContext` compound mappings and `AppProvider` encapsulation layer, mounting it cleanly in the core `main.tsx` DOM tree.
  - Archived prompt in `prompts/memory/frontend-state-architecture.md`.
- Completed Task M01-S02-T007: Chat Timeline & Message Components.
  - Engineered reusable `MessageBubble` composite structure grouping `MessageAvatar` and `MessageContent`.
  - Implemented explicit role bindings for `UserMessage`, `AssistantMessage`, and `SystemMessage` mapping to robust CSS flex variants.
  - Synthesized a dormant `TypingIndicator`.
  - Archived prompt in `prompts/memory/chat-timeline-messages.md`.
- Completed Task M01-S02-T006: Premium Prompt Composer.
  - Refactored prompt input area into a dedicated `composer/` directory structure.
  - Created `PromptComposer.tsx` implementing `ComposerTextarea`, `ComposerToolbar`, and `ComposerActions`.
  - Scaled the input area with explicit 120px to 300px min/max height thresholds with premium spatial boundaries.
  - Archived prompt in `prompts/memory/premium-prompt-composer.md`.
- Completed Task M01-S02-T005: Chat Shell & Layout.
  - Initialized dedicated `chat/` component architecture.
  - Replaced legacy Application Layout with native chat counterparts (`ChatHeader`, `ChatTimeline`, `EmptyState`, etc.).
  - Archived prompt in `prompts/memory/chat-shell-layout.md`.
- Completed Task M01-S02-T004: Premium UI Polish.
  - Formatted `variables.css` using strict metric constraints for spacing (4-48px), precise radii (14-999px), and micro-transitions (120-200ms).
  - Standardized font rendering through `typography.css` via the `Inter` font stack and rigid font-weight hierarchies.
  - Refined empty state geometry and dynamic shadow behaviors inside `layout.css`.
  - Archived prompt in `prompts/memory/premium-ui-polish.md`.
- Completed Task M01-S02-T003: Application Layout.
  - Created header layout component `src/webview/components/layout/Header.tsx`.
  - Created message container `src/webview/components/layout/ConversationPanel.tsx`.
  - Created input container `src/webview/components/layout/PromptPanel.tsx`.
  - Created shell compositor `src/webview/components/layout/MainLayout.tsx`.
  - Defined CSS rules for structural elements inside `src/webview/styles/layout.css`.
  - Updated React `src/webview/App.tsx` using layout composition.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
  - Archived prompt copy in `prompts/memory/app-layout-init.md`.
- Completed Task M01-S02-T002: Design System Foundation.
  - Installed global design tokens inside `variables.css`.
  - Formulated reset rules inside `reset.css`.
  - Formulated typography hierarchies inside `typography.css`.
  - Integrated responsive themes in `theme.css`.
  - Createdglobals importer inside `globals.css` and linked to `main.tsx`.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
  - Archived prompt copy in `prompts/memory/design-system-init.md`.
- Completed Task M01-S02-T001: React Runtime Integration.
  - Installed React and ReactDOM dependencies.
  - Configured Vite build options inside `vite.config.ts`.
  - Created root React components `src/webview/App.tsx` and `src/webview/main.tsx`.
  - Adjusted VS Code `tsconfig.json` compiler settings to accept React JSX/TSX values.
  - Exposed scriptUri and styleUri bindings in `src/extension/webviewProvider.ts`.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
  - Archived prompt copy in `prompts/memory/react-runtime-init.md`.
- Completed Task M01-S01-T004A: Webview Foundation Hardening.
  - Extracted HTML generation logic to `renderHtml()`.
  - Built centralized webview command router `_handleWebviewMessage()`.
  - Added disposal listener arrays to release memory.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
- Completed Task M01-S01-T004: Webview Host Foundation.
  - Implemented standard `vscode.WebviewViewProvider` (`AIIdleWebviewProvider`) in `src/extension/webviewProvider.ts`.
  - Configured strict CSP sandbox policies for styles and scripts.
  - Created HTML output templates with CSS variables.
  - Registered webview view provider in `src/extension/index.ts`.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
  - Archived prompt in `prompts/memory/webview-host-init.md`.
- Completed Task M01-S01-T003: Register AIIdle Activity Bar & Sidebar View.
  - Registered `aiidle-sidebar` panel under VS Code activitybar contributes.
  - Registered `aiidle.chatView` under contributions.
  - Added native welcome placeholder contents displaying `AIIdle` initialization logs.
  - Setup dummy tree view providers inside extension initialization blocks.
  - Saved task execution logs inside `.aiidle/reports/implementation-report.md`.
- Completed Task M01-S01-T002: VS Code Extension Bootstrap.
  - Implemented standard `activate()` and `deactivate()` lifecycle controllers in `src/extension/index.ts`.
  - Configured output channel diagnostics logging targets.
  - Registered `aiidle.startSession` trigger command showing informational banner popups.
  - Updated implement reports under `.aiidle/reports/implementation-report.md`.
- Completed Task M01-S01-T001B: Repository Manifest Cleanup.
  - Formatted `package.json` to exclude all comment nodes.
  - Linked official repository meta URLs (homepage, repository, bugs).
  - Deprecated and removed unused Jest config parameters and framework packages.
  - Relocated test modules to `tests/suite/index.ts`.
  - Consolidated report files under a single `.aiidle/reports/implementation-report.md`.
  - Archived prompt in `prompts/memory/foundation-cleanup.md`.
- Completed Task M01-S01-T001A: Foundation Corrections.
  - Configured `esbuild` bundler script commands.
  - Setup Mocha `@vscode/test-electron` test host runner configuration in `tests/runTest.ts`.
  - Added tsconfig options for tests `tsconfig.test.json`.
  - Audited `package.json` production fields.
  - Saved foundation correction report in `.aiidle/reports/foundation-correction-report.md`.
- Completed Task M01-S01-T001: Repository Initialization.
  - Setup core configs (`package.json`, `tsconfig.json`, `jest.config.js`, `.eslintrc.json`, `.prettierrc`).
  - Created source parent directory scaffolding (`src/common/index.ts`, `src/extension/index.ts`, `src/webview/index.ts`).
  - Saved implementation report in `.aiidle/reports/implementation-report.md`.
- Configured Principal Software Engineer role policies:
  - Setup architectural preservation rules and locked the core codebase vision targets.
- Archived role definition prompt in `prompts/memory/role-definition.md`.

## [0.9.0-draft] - 2026-07-16

### Added
- Configured official Version 1 Engineering Backlog checklists:
  - `SPRINT_TRACKER.md`: Active task progress board and review freeze checkers.
  - `MILESTONE_TRACKER.md`: Tracks implementation of 16 high-level milestone blocks.
  - `MASTER_DEVELOPMENT_PLAN.md`: Backlog detailing Task ID, prerequisites, risks, and acceptance criteria.
  - `CURRENT_TASK.md`: Updated active task parameters to target the first implementation step (`M01-S01-T001`).
- Archived engineering backlog user prompt in `prompts/memory/backlog-setup.md`.

## [0.8.0-draft] - 2026-07-16

### Added
- Performed Version 1 Engineering Readiness Audit:
  - `ENGINEERING_READINESS.md`: Certified Go status with an overall readiness score of 100%.
- Archived engineering readiness audit user prompt in `prompts/memory/readiness-audit.md`.

## [0.7.0-draft] - 2026-07-16

### Added
- Configured mandatory execution protocols:
  - `CURRENT_TASK.md`: Setup file tracking active configurations task and checks.
  - `MASTER_DEVELOPMENT_PLAN.md`: Formulated phases and sprint schedules for the implementation of Version 1.
- Archived execution protocol user prompt in `prompts/memory/protocol-setup.md`.

## [0.6.0-draft] - 2026-07-16

### Added
- Created the core engineering handbook:
  - `REPOSITORY_BLUEPRINT.md`: Repository layout, top-level maps, folder owners.
  - `ENGINEERING_GUIDE.md`: TypeScript formatting, JSDoc comment scopes, testing configurations.
  - `WORKFLOW.md`: Commit messages scopes, recovery rollback procedures.
  - `RELEASE_POLICY.md`: Versioning metrics, packaging compilers.
  - `DEPENDENCY_RULES.md`: Absolute imports structure, circular dependency blocks.
  - `NAMING_CONVENTIONS.md`: Case specifications for files, folders, hooks, and variables.

## [0.5.0-draft] - 2026-07-16

### Added
- Completed Technical Specification Bible under `.aiidle/specs/` for all 17 core modules (Extension, Chat, Planner, Approval, Memory, Workspace, Context, Knowledge, RAG, Executor, Terminal, File System, Git, Settings, Logging, Configuration, and Error Recovery).
- Defined explicit call permissions, request/response payload schemas, failure cases, recovery strategies, and scopes for all modules.

## [0.4.0-draft] - 2026-07-16

### Added
- Completed Version 1 Architecture Bible under `ARCHITECTURE.md` mapping high-level structure, data flow, state, lifecycles, folder rules, security, performance, and anti-patterns.
- Detailed 17 core modules responsibilities, interfaces, and dependencies inside `MODULES.md`.

## [0.3.0-draft] - 2026-07-16

### Added
- Created complete enterprise-grade constitution `VISION.md` mapping 30 actionable engineering principles.
- Implemented programming rulebook `RULEBOOK.md`.
- Registered project glossary `GLOSSARY.md` and checkpoints manager `CHECKPOINTS.md`.
- Created risk register `RISKS.md`.
- Added self-validation checklists `SELF_VALIDATION.md` and load order sequencing guide `DOCUMENT_LOAD_ORDER.md`.
- Created module interface contracts under `.aiidle/contracts/` for Memory, Planner, Executor, Knowledge, Terminal, and Chat.
- Generated feature specification files inside `.aiidle/specs/` for Extension, Chat, Planner, Executor, RAG, Terminal, Settings, Testing, and Deployment.
- Restructured `prompts/` categorization folder structure.
- Configured `.gitignore` to filter standard diagnostic runtime logs.

## [0.2.0-draft] - 2026-07-16

### Added
- Restructured `.aiidle/` into four subfolders (`memory/`, `logs/`, `prompts/`, `specs/`).
- Added specification files under `.aiidle/memory/`: `CONTEXT.md`, `VISION.md`, `CODING_STANDARDS.md`, `API_REFERENCE.md`, `TEST_REPORT.md`, `SECURITY.md`.
- Archived user instruction prompts under `.aiidle/prompts/`.
- Created feature design specifications under `.aiidle/specs/`.
- Set up standard execution log files under `.aiidle/logs/`.

### Changed
- Migrated legacy `project-docs/` content into `.aiidle/memory/`.

### Removed
- Deprecated and removed legacy directory `project-docs/`.

## [0.1.0-draft] - 2026-07-16

### Added
- Created dual documentation system at `.aiidle/memory/` and `project-docs/`.
