# Glossary

This glossary contains key terms and definitions for the AIIdle project.

## Project Terms

- **Agent**: The autonomous AI model acting inside the workspace to execute tasks.
- **Planner**: The subsystem responsible for analyzing prompts and building step-by-step implementation plans.
- **Executor**: The module that executes instructions (e.g. write files, run terminal scripts) after user approval.
- **Workspace**: The specific local directory loaded in VS Code.
- **Memory**: The persistent configuration files and history logs under `.aiidle/`.
- **Context**: The current branch, goal, module, and status tracked in `CONTEXT.md`.
- **Knowledge**: Code blueprints and localized engineering items.
- **Approval**: User confirmation required before applying code modifications or running commands.
- **Task**: An atomic task item on the TODO checklist.
- **Checkpoint**: A verified, rollback-safe state of the repository.
