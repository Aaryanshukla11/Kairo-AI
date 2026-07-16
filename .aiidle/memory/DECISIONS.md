# Decisions Log

## [2026-07-16] - Establish Dual Memory Structures

* **Decision**: Maintain both `project-docs/` and `.aiidle/memory/` directory structures.
* **Problem**: First prompt asked to keep `project-docs/` updated. Second prompt asked to keep `.aiidle/memory/` updated.
* **Options Considered**:
  - Keep only `.aiidle/memory/` and delete `project-docs/`.
  - Keep both.
* **Chosen Solution**: Keep both.
* **Reason**: Prevents breaking the instructions/constraints established in the first user prompt.
* **Future Notes**: If the user explicitly asks to remove `project-docs/`, we can deprecate and delete it.

## [2026-07-16] - Deprecation and Deletion of `project-docs/`

* **Decision**: Deprecate legacy human-oriented developer documentation `project-docs/` and unify the codebase memory under the `.aiidle/` directory.
* **Problem**: Storing documentation in multiple formats and locations creates duplication, maintenance overhead, and context drift.
* **Options Considered**:
  - Maintain both directories (`project-docs/` and `.aiidle/`).
  - Merge history and delete `project-docs/` in favor of a restructured, enterprise-grade `.aiidle/` memory folder.
* **Chosen Solution**: Merge history and delete `project-docs/`.
* **Reason**: User explicitly requested the deprecation of `project-docs/` and established `.aiidle/` as the single source of truth, eliminating the synchronization trade-offs.
* **Future Notes**: All updates, session logs, and configurations will be made directly to the sub-folders of `.aiidle/`.

## [2026-07-16] - Establish Governance and Project Constitution

* **Decision**: Finalize the core project constitution (`VISION.md`) and deploy a rule-based engineering governance structure containing a rulebook, glossary, load ordering, checklists, contracts, and modular specifications.
* **Problem**: Scalability of memory logs and context alignment for a large number of prompts requires explicit boundaries and rules.
* **Options Considered**:
  - Keep standard files in memory and build application code immediately.
  - Formulate structured specs and contracts prior to building code.
* **Chosen Solution**: Formulate structured specs and contracts.
* **Reason**: Prevents structural decay, circular module calls, and type mismatches.
* **Future Notes**: Future features must align strictly with the contracts defined under `contracts/`.

## [2026-07-16] - Establish AIIdle Version 1 Architecture Bible

* **Decision**: Establish the Version 1 Architecture Bible (`ARCHITECTURE.md`) defining high-level orchestration, modules, dependencies, error control, lifecycles, and security filters.
* **Problem**: Setting up application logic requires immutable rules for data flow and interface communication boundaries to prevent God objects or circular dependency cycles.
* **Options Considered**:
  - Setup boilerplate directly and build modules on demand.
  - Finalize strict modular architectural graphs and communication boundaries beforehand.
* **Chosen Solution**: Finalize strict modular architectural graphs beforehand.
* **Reason**: Enforces loose coupling and Single Responsibility Principle, ensuring scalability as the codebase expands.
* **Future Notes**: Future modules must interface via standard adapter contracts.

## [2026-07-16] - Establish AIIdle Version 1 Technical Specification Bible

* **Decision**: Create and deploy the Version 1 Technical Specification Bible (`specs/`) for all 17 core modules.
* **Problem**: Programmers and agents require precise functional requirements, interfaces, performance parameters, and failure modes for each module to prevent guess-work and context drift.
* **Options Considered**:
  - Build boilerplate code directly with basic documentation.
  - Finalize detailed specifications mapping 21 criteria for all 17 modules before starting code edits.
* **Chosen Solution**: Finalize detailed specifications mapping 21 criteria.
* **Reason**: Actionable specifications align development outputs precisely with constitutional vision guidelines and avoid validation gaps.
* **Future Notes**: Future implementation steps must comply with these specifications.

## [2026-07-16] - Deploy Engineering Guidelines and Repository Blueprints

* **Decision**: Create the central engineering handbooks mapping repository layout (`REPOSITORY_BLUEPRINT.md`), styling norms (`NAMING_CONVENTIONS.md`), code checks (`ENGINEERING_GUIDE.md`), workflows (`WORKFLOW.md`), dependency rules (`DEPENDENCY_RULES.md`), and release strategies (`RELEASE_POLICY.md`).
* **Problem**: Uncoordinated file locations, erratic type practices, and conflicting naming conventions create long-term architectural decay.
* **Options Considered**:
  - Keep standard coding rules inside the developers' notes.
  - Finalize strict, documented repository boundaries and styling handbooks inside `.aiidle/memory/`.
* **Chosen Solution**: Finalize strict handbooks inside `.aiidle/memory/`.
* **Reason**: Solidifies the codebase structural boundaries and enforces unidirectional dependency graphs, allowing robust collaboration.
* **Future Notes**: All future codebase structures must conform to these conventions.

## [2026-07-16] - Establish Mandatory Execution Protocols

* **Decision**: Establish mandatory execution protocols and active task directories (`CURRENT_TASK.md` and `MASTER_DEVELOPMENT_PLAN.md`).
* **Problem**: Unregulated modifications to unrelated files, premature refactorings, and guess-work on ambiguous prompts increase complexity and risk structural failures.
* **Options Considered**:
  - Keep standard workflow rules undocumented and rely on individual developers.
  - Finalize strict, documented execution protocol parameters and active checklists trackers inside `.aiidle/memory/`.
* **Chosen Solution**: Finalize strict execution protocol parameters.
* **Reason**: Enforces pre-implementation load sequence checks, restricts scope changes, defines explicit report formats, and enforces the smallest complete solutions rule.
* **Future Notes**: Task completion reports must follow this format strictly.

## [2026-07-16] - Establish Engineering Readiness Audit Verification Gate

* **Decision**: Run the Engineering Readiness Audit and finalize the Go status check, documenting results under `ENGINEERING_READINESS.md`.
* **Problem**: Beginning codebase modifications without verifying that every governance, rulebook, specifications, and handbooks prerequisite is complete risks implementation defects and alignment deviations.
* **Options Considered**:
  - Skip readiness checks and begin writing skeletal code immediately.
  - Establish a formalized readiness audit verification gate with a Go/No-Go decision mapping score.
* **Chosen Solution**: Establish a formalized readiness audit verification gate.
* **Reason**: Confirms all structural dependencies, documentation, and guidelines parameters exist and conform, blocking errors before code compilation starts.
* **Future Notes**: Readiness score is set at 100% (GO status). Code execution blocks are now authorized.

## [2026-07-16] - Deploy Master Backlog and Task Tracker Controls

* **Decision**: Create the central implementation trackers `MILESTONE_TRACKER.md` and `SPRINT_TRACKER.md` to map, estimate, and sequence all tasks and sprints before writing code.
* **Problem**: Entering codebase execution without permanent task identifiers, estimation guidelines, and clear milestones creates tracking voids and risks scope creeping.
* **Options Considered**:
  - Write feature implementations directly without mapping Sprints.
  - Formulate detailed Milestones -> Sprints -> Tasks checklists databases with dependencies mapped beforehand.
* **Chosen Solution**: Formulate detailed Milestones -> Sprints -> Tasks checklists database.
* **Reason**: Freezes the structural parameters of Version 1 development scope and locks development workflows into independent, reviewable tasks.
* **Future Notes**: Task IDs (e.g. `M01-S01-T001`) are frozen. No features may be built without backlog entries.

## [2026-07-16] - Adopt Principal Software Engineer Role Framework

* **Decision**: Shift role definition parameters from a standard code generator agent to a Principal Software Engineer framework, establishing explicit quality preservation policies.
* **Problem**: Standard generative coding approaches tend to overlook backward compatibility, over-engineer implementations, and introduce technical debt.
* **Options Considered**:
  - Accept prompts as a standard generic instruction parser.
  - Formulate strict architectural preservation, code ownership, and self-review gates prior to writing implementations.
* **Chosen Solution**: Formulate strict architectural preservation, code ownership, and self-review gates.
* **Reason**: Enforces long-term sustainability, isolates code updates, and ensures that changes preserve the core offline-first constitution of the workspace.
* **Future Notes**: Future tasks will be evaluated through these engineering quality checklists.

## [2026-07-16] - Execute Task M01-S01-T001 (Repository Scaffolding)

* **Decision**: Create the production-ready repository foundation, including `package.json`, typescript configurations (`tsconfig.json`), ESLint options, Prettier parameters, Jest testing configs, and base folder boundaries.
* **Problem**: Entering codebase implementation without frozen configurations and standardized dependencies creates workspace setup drift and makes compilations fragile.
* **Options Considered**:
  - Run boilerplate setup scripts with loose option checks.
  - Finalize strict base files and lint options matching the engineering guide boundaries prior to building logic code.
* **Chosen Solution**: Finalize strict base files matching engineering guide boundaries.
* **Reason**: Solidifies coding targets and ensures strict type-checks compile cleanly.
* **Future Notes**: Future sprint tasks will build upon this foundation.

## [2026-07-16] - Execute Task M01-S01-T001A (Foundation Corrections)

* **Decision**: Integrate `esbuild` for bundling and `@vscode/test-electron` for sandbox-based testing.
* **Problem**: Simple tsc output increases packing bulk and doesn't load offline libraries seamlessly. In addition, standard node-based Jest mock settings cannot test vscode UI workspace bindings correctly.
* **Options Considered**:
  - Keep standard typescript compilation outputs and raw Jest tests.
  - Integrate a fast, native bundler (esbuild) and official Electron-based sandbox testing wrappers.
* **Chosen Solution**: Integrate esbuild bundler and Electron testing wrappers.
* **Reason**: Speeds extension loading, enables standard offline bundling, and sets up a robust long-term integration testing strategy.
* **Future Notes**: Future test suites will compile tests via `tsconfig.test.json` to integration sandboxes.

## [2026-07-16] - Execute Task M01-S01-T001B (Foundation Cleanup)

* **Decision**: Adopt a single-file implementation report strategy and migrate tests indices to standard extension layout paths (`tests/suite/index.ts`).
* **Problem**: Accumulating historical task reports inside `.aiidle/reports/` creates documentation pollution. In addition, keeping test load indices outside standard `suite` subdirectories deviates from official VS Code templates.
* **Options Considered**:
  - Keep separate files for corrections reports and leave index files at root.
  - Consolidate report logs and relocate test indexes.
* **Chosen Solution**: Consolidate report logs and relocate test indexes.
* **Reason**: Streamlines workspace directory trees and organizes testing directories layout cleanly.
* **Future Notes**: The repository foundation is now officially frozen and ready for milestone step builds.

## [2026-07-16] - Execute Task M01-S01-T001B (Repository Manifest Cleanup)

* **Decision**: Remove all non-standard comment keys from `package.json`, relocate manifest TODO warnings to `TODO.md`/`DECISIONS.md`, write verified repository/homepage/bugs URLs, and deprecate Jest framework configs in favor of standard Mocha.
* **Problem**: Storing metadata placeholders and comments inside `package.json` violates standard package manifest specs and blocks clean packaging operations.
* **Options Considered**:
  - Keep warning markers inside `package.json` keys.
  - Remove all comment keys, use official repository links, and move development check flags directly to `TODO.md`.
* **Chosen Solution**: Remove comments, use official repository links, and move development checks to TODO.md.
* **Reason**: Enforces strict JSON spec compliance and resolves metadata dependencies cleanly.
* **Future Notes**: Future packaging sweeps will use the linked repository metadata keys directly.

## [2026-07-16] - Execute Task M01-S01-T002 (VS Code Extension Bootstrap)

* **Decision**: Create a minimal functional VS Code extension entry point executing within the VS Code Extension Development Host context, registering a diagnostic logging OutputChannel and standard command handler.
* **Problem**: Bootstrapping initial interface features requires verifying that the extension runtime compiles and executes safely within the Extension Host shell.
* **Options Considered**:
  - Implement basic extension activation logic directly.
  - Setup architectural dependencies and sidebar views immediately.
* **Chosen Solution**: Implement basic extension activation logic directly.
* **Reason**: Focuses scope strictly on standard VS Code activation mechanics, avoiding over-engineering before foundation freezes are certified.
* **Future Notes**: Future task steps will build upon this functional host container.

## [2026-07-16] - Execute Task M01-S01-T003 (Register AIIdle Activity Bar & Sidebar View)

* **Decision**: Register the Activity Bar container and empty Sidebar view using native VS Code tree data provider adapters and `viewsWelcome` properties.
* **Problem**: Establishing a standard visual UI entry point while strictly avoiding HTML/React/Tailwind dependencies during bootstrap.
* **Options Considered**:
  - Load basic Webview components immediately.
  - Setup a tree view structure combined with native welcome text layouts.
* **Chosen Solution**: Setup a tree view structure combined with native welcome text layouts.
* **Reason**: Enforces the 100% native VS Code layout paradigm, avoiding React compilation overhead while verifying entry visual layout.
* **Future Notes**: Future webview designs will bind directly onto this registered view container.

## [2026-07-16] - Execute Task M01-S01-T004 (Webview Host Foundation)

* **Decision**: Implement a native `WebviewViewProvider` (`AIIdleWebviewProvider`) for the sidebar panel, replacing the placeholder tree view.
* **Problem**: Establishing a baseline rendering container for future rich HTML/React interfaces while maintaining strict security constraints.
* **Options Considered**:
  - Load React templates immediately using basic iframe overlays.
  - Implement a secure, containerized native WebviewView provider with a strict Content Security Policy (CSP).
* **Chosen Solution**: Implement a secure, containerized native WebviewView provider with a strict CSP.
* **Reason**: Enforces strict sandbox isolation, permits script execution only via random cryptographically secure nonces, and limits file loading to extension directories.
* **Future Notes**: Frontend web frameworks (React/Tailwind) will bootstrap directly within this secure host.

## [2026-07-16] - Execute Task M01-S02-T001 (React Runtime Integration)

* **Decision**: Integrate React and React-DOM runtimes inside the Webview container, utilizing Vite for bundling and a local resource URI bridge to coordinate assets loading.
* **Problem**: Loading raw HTML configurations limits our capability to build rich, dynamic, stateful features.
* **Options Considered**:
  - Keep standard static vanilla JS templates.
  - Setup React runtimes compiled via Vite bundles to output a single script.
* **Chosen Solution**: Setup React runtimes compiled via Vite bundles.
* **Reason**: Supports React DOM lifecycle mount targets, enables quick visual updates, and bundles dependencies offline into our extension.
* **Future Notes**: Frontend UI features (forms, text area, message bubbles) will render as React components.

## [2026-07-16] - Execute Task M01-S02-T003 (Application Layout)

* **Decision**: Implement a modular, component-based layout composed of Header, ConversationPanel, and PromptPanel elements using external CSS classes.
* **Problem**: Setting up UI interfaces using inline style declarations violates clean coding conventions.
* **Options Considered**:
  - Write inline styling inline elements directly.
  - Implement layout rules via external stylesheets and React composition.
* **Chosen Solution**: Implement layout rules via external stylesheets and React composition.
* **Reason**: Decouples UI assembly from CSS details and guarantees that the UI maintains responsive structures.
* **Future Notes**: Future features will mount components directly within these layout panels.


















