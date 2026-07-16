# Project Context

* **Current Sprint**: Sprint 1 - Infrastructure Setup
* **Current Goal**: Execute the extension bootstrap task (M01-S01-T002).
* **Current Module**: VS Code Extension Bootstrap
* **Current Branch**: `main`
* **Current Blockers**: None
* **Recently Completed**: Implemented standard lifecycle hooks (`activate`, `deactivate`), output channel diagnostics startup logger, registered command palette session trigger, and finalized exception gates.
* **Next Task**: Awaiting architectural review and sign-off approval.
* **Active Assumptions**: Repository foundation is frozen.

## Architecture Snapshot

The project configuration relies entirely on the `.aiidle/` folder system containing:
- `memory/` (Core metadata, constitutional files, self-validation logs, stack lists, engineering handbooks, readiness logs, backlog logs)
- `contracts/` (Module interface contracts)
- `logs/` (Standard execution logs)
- `prompts/` (Grouped prompts archive)
- `specs/` (Design specs for each core system)
- `reports/` (Single implementation report wrapper)

## Important Notes
- Initial code bases are fully set up. Extension bootstrap complete.
