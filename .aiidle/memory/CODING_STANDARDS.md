# Coding Standards

This document establishes the guidelines, rules, and structures for developers and agents.

## Folder Structure
- Documentation and project state reside strictly in `.aiidle/`.
- Legacy `project-docs/` is deprecated.
- Source code components are divided cleanly by module/domain.

## Naming
- **Classes**: `PascalCase`
- **Functions & Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `camelCase` or `kebab-case` depending on component types.

## Formatting
- 2-space indentation.
- Enforce clean, formatted code with standard formatting tools (e.g. Prettier).

## TypeScript
- Run in `strict` mode.
- Avoid the use of `any` types; define interface schemas and type aliases.
- Document function signatures clearly.

## React
- Favor functional components and hooks.
- Separate components into containers (logic) and views (presentation).
- Keep component states local where possible.

## Error Handling
- Never catch errors silently; log all exceptions.
- Provide user-friendly messages while logging detailed diagnostics to `.aiidle/logs/errors.log`.

## Logging
- Write critical logs to the `.aiidle/logs/` directory.
- Differentiate logs into standard operations (`agent.log`), CLI updates (`terminal.log`), execution states (`build.log`), and warnings (`errors.log`).

## Comments
- Avoid obvious comments; explain the intent and trade-offs.
- Use standard JSDoc markup for public functions and classes.

## Testing
- Write unit tests for core logical interfaces.
- Track metrics in `TEST_REPORT.md`.

## Performance
- Optimize rendering cycles (avoid excessive rendering).
- Use local cache strategies.

## Security
- Always sanitize CLI arguments and inputs.
- Restrict permissions to narrow scopes.

## Dependency Rules
- Vet all dependencies.
- Keep dependencies updated and document them in `DEPENDENCIES.md`.
