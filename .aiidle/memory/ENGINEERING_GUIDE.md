# Engineering Guide

This document defines the code quality standards, error handling models, logging formats, testing paradigms, and validation rules for the AIIdle codebase.

---

## 1. Code Quality Standards

### 1.1. TypeScript Strictness
- Enforce `"strict": true` in `tsconfig.json`.
- The use of `any` types is strictly forbidden. Use `unknown` or specific object schemas.
- Avoid non-null assertions (`!`). Use explicit checks or type guards.

### 1.2. Linting Rules
- All code must comply with the ESLint configuration rules.
- Warning outputs are treated as build blockers.
- Enforce clean import hierarchies using ESLint import plugins.

### 1.3. Formatting Rules
- Formatting is enforced via Prettier with the following defaults:
  - Tab width: `2` spaces.
  - Semicolons: `true`.
  - Single quotes: `false` (favor double quotes for consistency with JSON schemas).
  - Trailing commas: `"all"`.

### 1.4. Comment Policy
- Avoid self-evident comments (e.g. `// increment x`).
- Comment the "why", not the "what" for complex logic paths.
- Code blocks must contain JSDoc blocks for all exported functions and classes.

### 1.5. Documentation Standards
- Every module folder must contain a local specification markdown file mapping endpoints.
- Synchronize `.aiidle/` state files after completing any prompt checks.

---

## 2. Error Handling & Logging Standards

### 2.1. Error Handling Model
- Throw custom error subclasses extending a base `AIIdleError` containing diagnostic error codes.
- Do not catch exceptions silently. Always log caught exceptions using error handlers before returning fallbacks.
- Use explicit return status objects for service boundaries:
  `type Result<T> = { success: true; data: T } | { success: false; error: AIIdleError }`

### 2.2. Logging Standards
- Emits log lines matching the standard pattern:
  `[TIMESTAMP] [LEVEL] [MODULE] [MESSAGE]`
- Logs must write to their respective targets under `.aiidle/logs/`:
  - Developer/Agent commands -> `agent.log`
  - CLI script processes -> `terminal.log`
  - Compile logs -> `build.log`
  - Exceptions -> `errors.log`

---

## 3. Security & Performance Standards

### 3.1. Security Guidelines
- Path check validations: File operations must sanitize input paths, rejecting parent traversal mappings (`../`) leading outside the workspace roots.
- Terminal commands: Run execution parameters through predefined command whitelists.
- Script injection blocks: Sanitize user chat messages before rendering HTML frames.

### 3.2. Performance Rules
- Lazy load model files and packages on run demand.
- Cap stdout capture memory buffers to 5MB of workspace RAM.
- Use Ripgrep binary interfaces for fast workspace scans.

---

## 4. Testing Strategy

### 4.1. Unit Testing
- Run units tests using Jest/Vitest for independent services (e.g. Chunker, PromptTemplateBuilder).
- Cover 100% of core data transform functions.

### 4.2. Integration Testing
- Test multi-module interaction pipelines (e.g. Planner calling Context Builder).
- Verify state updates inside local directories.

### 4.3. Extension Testing
- Run inside VS Code Extension Development Host instances.
- Mock VS Code workspace variables to test command registrations.

### 4.4. End-to-End Testing
- Automate prompt execution streams in local sandboxes.
- Verify file modifications match expected schemas on completion.

### 4.5. Regression Testing
- Re-run test suites on Git checkpoint rollbacks.

### 4.6. Manual & Acceptance Testing
- Use local preview servers to verify web dashboard views.
- Developer performs visual verification before signing off milestones.
