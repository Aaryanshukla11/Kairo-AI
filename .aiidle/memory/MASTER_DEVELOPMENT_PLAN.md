# Master Development Plan

This document contains the official engineering backlog for AIIdle Version 1.

---

## Milestone M01: Foundation

### Sprint M01-S01: Scaffolding Foundation Setup
- **Goal**: Scaffold the main codebase workspace directory structures, packaging descriptions, and TS config parameters.
- **Sprint Tasks**: `T001`, `T002`, `T003`.
- **Sprint Validation**: Ensure `npm run check` succeeds without syntax or compile errors.
- **Sprint Review**: Verify folder architecture maps the repository blueprint correctly.

#### Task M01-S01-T001: Initialize Package Scaffolding
- **Milestone ID**: M01
- **Sprint ID**: M01-S01
- **Task ID**: M01-S01-T001
- **Task Name**: Initialize Package Scaffolding
- **Purpose**: Setup top-level dependencies, build targets, and scripts.
- **Module**: Foundation
- **Complexity**: Low
- **Estimated Time**: 1 Hour
- **Prerequisites**: Governance files exist.
- **Dependencies**: None.
- **Files Expected To Change**: `[NEW] package.json`
- **Acceptance Criteria**: `package.json` created at root containing ESLint, TypeScript compiler dependencies, and script aliases.
- **Validation Required**: Run syntax validation on package descriptor.
- **Documentation To Update**: `FILE_INDEX.md`
- **Possible Risks**: Conflicting dependency versions.
- **Rollback Strategy**: Git checkout resets.
- **Future Notes**: Future modules will populate their dependencies here.

#### Task M01-S01-T002: Setup Workspace Directories
- **Milestone ID**: M01
- **Sprint ID**: M01-S01
- **Task ID**: M01-S01-T002
- **Task Name**: Setup Workspace Directories
- **Purpose**: Create target directories mapping repository layout rules.
- **Module**: Foundation
- **Complexity**: Low
- **Estimated Time**: 30 Mins
- **Prerequisites**: None.
- **Dependencies**: M01-S01-T001.
- **Files Expected To Change**: `src/extension/`, `src/webview/`, `src/common/`, `tests/`
- **Acceptance Criteria**: All folders exist.
- **Validation Required**: Verify directories resolve correctly.
- **Documentation To Update**: `FILE_INDEX.md`
- **Possible Risks**: Directory naming collision.
- **Rollback Strategy**: Remove directory structures.
- **Future Notes**: Modules must place logic in these folders.

#### Task M01-S01-T003: Configure TypeScript Options
- **Milestone ID**: M01
- **Sprint ID**: M01-S01
- **Task ID**: M01-S01-T003
- **Task Name**: Configure TypeScript Options
- **Purpose**: Setup strict typescript compilations.
- **Module**: Foundation
- **Complexity**: Low
- **Estimated Time**: 1 Hour
- **Prerequisites**: None.
- **Dependencies**: M01-S01-T002.
- **Files Expected To Change**: `[NEW] tsconfig.json`
- **Acceptance Criteria**: Strict compiler option parameters configured.
- **Validation Required**: Compiler verify check.
- **Documentation To Update**: `FILE_INDEX.md`
- **Possible Risks**: Path alias mapping mismatches.
- **Rollback Strategy**: Delete configuration file.
- **Future Notes**: Keep absolute imports sorted.

---

### Sprint M01-S02: Common Types & Contracts Scaffold
- **Goal**: Scaffolding shared types and interfaces inside `src/common/`.
- **Sprint Tasks**: `T001`.

#### Task M01-S02-T001: Register Interface Contracts
- **Milestone ID**: M01
- **Sprint ID**: M01-S02
- **Task ID**: M01-S02-T001
- **Task Name**: Register Interface Contracts
- **Purpose**: Mount shared module types.
- **Module**: Foundation
- **Complexity**: Medium
- **Estimated Time**: 4 Hours
- **Prerequisites**: TS settings.
- **Dependencies**: M01-S01-T003.
- **Files Expected To Change**: `src/common/types.ts`
- **Acceptance Criteria**: Exposes compiler check schemas.
- **Validation Required**: Verify types resolve inside mock modules.
- **Documentation To Update**: `MODULES.md`
- **Possible Risks**: Design changes later might require typing updates.
- **Rollback Strategy**: Git reset.
- **Future Notes**: Shared boundaries must import from here.

---

## Subsequent Backlog Milestones Overview

### Milestone M02: Logging & Configuration
- **Sprints**: S01
- **Tasks**: T001 (Setup Logger Service), T002 (Config manager integrations).

### Milestone M03: VS Code Extension Wrapper
- **Sprints**: S01, S02
- **Tasks**: T001 (Command activations setup), T002 (IPC listener events).

### Milestone M04: User Interface (Chat UI)
- **Sprints**: S01, S02
- **Tasks**: T001 (React view component setup), T002 (Diff viewer panel setup).

### Milestone M05: Workspace Scanner & Filesystem
- **Sprints**: S01
- **Tasks**: T001 (Safe filesystem wrapper class), T002 (Recursive directory indexer).

### Milestone M06: Terminal & Git Controllers
- **Sprints**: S01
- **Tasks**: T001 (Git commit checkpoints module), T002 (OS command runner wrapper).

### Milestone M07: Local LLM Client & Settings
- **Sprints**: S01
- **Tasks**: T001 (HTTP connection client wrapper).

### Milestone M08: Context Builder & Knowledge Engine
- **Sprints**: S01, S02
- **Tasks**: T001 (Prompt compilation), T002 (Knowledge pattern retrieves).

### Milestone M09: Offline Search & RAG
- **Sprints**: S01, S02
- **Tasks**: T001 (Ripgrep CLI binder), T002 (Flat file vector indexing).

### Milestone M10: Planner Engine
- **Sprints**: S01, S02
- **Tasks**: T001 (Planner prompts), T002 (Checklist compiler parser).

### Milestone M11: Gated Approval Engine
- **Sprints**: S01
- **Tasks**: T001 (Checklist approval buttons).

### Milestone M12: Executor Engine
- **Sprints**: S01, S02
- **Tasks**: T001 (Executor checklist queue runner), T002 (Verification tests compiler runner).

### Milestone M13: Error Recovery & Rollback
- **Sprints**: S01
- **Tasks**: T001 (Exception catch git restore loop).

### Milestone M14: Memory Engine Sync
- **Sprints**: S01
- **Tasks**: T001 (Session and status logs updater).

### Milestone M15: Integrated Testing & Optimization
- **Sprints**: S01
- **Tasks**: T001 (Integration test suites).

### Milestone M16: Packaging & Production Release
- **Sprints**: S01
- **Tasks**: T001 (VSIX packaging runner).
