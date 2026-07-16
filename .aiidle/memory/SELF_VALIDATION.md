# Self Validation Checklist

Before marking any task as complete, the agent must check and verify each item below:

## Verification Checklist

- [ ] **Architecture Preserved**: The change does not introduce circular dependencies or break modular boundaries.
- [ ] **Documentation Updated**: All updated or created functions/variables/modules are logged in the specs and indexes.
- [ ] **Context Sync**: `CONTEXT.md` is updated to reflect the completed goal.
- [ ] **No Duplicate Code**: No business logic is repeated across modules.
- [ ] **No Lint Issues**: Lint rules pass with zero errors/warnings.
- [ ] **No TypeScript Errors**: Enforced strict mode compiles successfully.
- [ ] **No Dead Code**: Unused variables, logs, and unreachable code blocks are removed.
- [ ] **No Unused Imports**: All imported modules are active.
- [ ] **No Unintentional TODOs**: Temporary comments or TODO flags are cleared.
- [ ] **No Security Issues**: Inputs are validated, and path traversals are blocked.
- [ ] **Build passes**: Clean compilation with zero build warnings.
- [ ] **Tests pass**: 80%+ test coverage target met.
- [ ] **Memory updated**: Changes recorded under `.aiidle/memory/`.
- [ ] **Session logged**: The session history is appended to `SESSION_LOG.md`.
