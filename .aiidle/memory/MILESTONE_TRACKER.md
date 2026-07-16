# Milestone Tracker

This document tracks the high-level implementation milestones of AIIdle Version 1.

---

## Milestone Status Summary

| Milestone ID | Milestone Name | Sprints Count | Status | Completion % |
|---|---|---|---|---|
| M01 | Foundation | 2 | Not Started | 0% |
| M02 | Logging & Configuration | 1 | Not Started | 0% |
| M03 | VS Code Extension Wrapper | 2 | Not Started | 0% |
| M04 | User Interface (Chat UI) | 2 | Not Started | 0% |
| M05 | Workspace Scanner & Filesystem | 1 | Not Started | 0% |
| M06 | Terminal & Git Controllers | 1 | Not Started | 0% |
| M07 | Local LLM Client & Settings | 1 | Not Started | 0% |
| M08 | Context Builder & Knowledge Engine | 2 | Not Started | 0% |
| M09 | Offline Search & RAG | 2 | Not Started | 0% |
| M10 | Planner Engine | 2 | Not Started | 0% |
| M11 | Gated Approval Engine | 1 | Not Started | 0% |
| M12 | Executor Engine | 2 | Not Started | 0% |
| M13 | Error Recovery & Rollback | 1 | Not Started | 0% |
| M14 | Memory Engine Sync | 1 | Not Started | 0% |
| M15 | Integrated Testing & Optimization | 1 | Not Started | 0% |
| M16 | Packaging & Production Release | 1 | Not Started | 0% |

---

## Milestone Details

### M01: Foundation
- **Goal**: Setup base workspaces, TS config schemas, and directories.
- **Sprints**: S01 (Scaffolding), S02 (Common Types & Contracts).
- **Target completion**: 0%

### M02: Logging & Configuration
- **Goal**: Build base configuration managers and diagnostic log files.
- **Sprints**: S01 (Logger & Settings Setup).

### M03: VS Code Extension Wrapper
- **Goal**: Standard VS Code sidebar activation commands and IPC webview server configurations.
- **Sprints**: S01 (VS Code Activation), S02 (IPC postMessage wrapper).

### M04: User Interface (Chat UI)
- **Goal**: React dashboard views containing query boxes and plan checklists.
- **Sprints**: S01 (UI Frames & Styling), S02 (State Management).

### M05: Workspace Scanner & Filesystem
- **Goal**: Scan directory trees and safely parse workspace files.
- **Sprints**: S01 (Filesystem I/O and Scanner).

### M06: Terminal & Git Controllers
- **Goal**: Execute command strings, capture diagnostics, and commit working progress checkpoints.
- **Sprints**: S01 (Terminal & Git Wrappers).

### M07: Local LLM Client & Settings
- **Goal**: Connect and query local LLM servers.
- **Sprints**: S01 (LLM Endpoint Connections).

### M08: Context Builder & Knowledge Engine
- **Goal**: Compile prompts containing constitutional vision data and code templates.
- **Sprints**: S01 (Context Assembler), S02 (Knowledge BLUEPRINTS Index).

### M09: Offline Search & RAG
- **Goal**: Vector chunk database indexer and query capabilities.
- **Sprints**: S01 (Ripgrep Wrapper), S02 (Vector Database Chunker).

### M10: Planner Engine
- **Goal**: Structured planning pipeline that generates step checklists.
- **Sprints**: S01 (Planner Prompts), S02 (checklists Validation).

### M11: Gated Approval Engine
- **Goal**: Prompt UI controls to review diffs and plans.
- **Sprints**: S01 (Diff & Checklist Gate).

### M12: Executor Engine
- **Goal**: Sequenced task runner running files changes.
- **Sprints**: S01 (Execution Queues), S02 (Verification compiler checks).

### M13: Error Recovery & Rollback
- **Goal**: Execute git checkout resets and clear process locks.
- **Sprints**: S01 (Exception Rollbacks).

### M14: Memory Engine Sync
- **Goal**: Automatically write session histories and project metrics on task end.
- **Sprints**: S01 (Session Log writers).

### M15: Integrated Testing & Optimization
- **Goal**: Integration tests covering pipelines.
- **Sprints**: S01 (End-to-End Test Suite).

### M16: Packaging & Production Release
- **Goal**: Build the VSIX extension files.
- **Sprints**: S01 (Offline packaging installer).
