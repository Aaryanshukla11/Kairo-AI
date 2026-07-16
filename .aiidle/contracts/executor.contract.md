# Module Contract - Executor

## Purpose
Apply planned code changes and execute shell commands inside the workspace.

## Responsibilities
- Apply atomic file modifications.
- Run terminal scripts inside sandboxed shell instances.

## Inputs
- Approved task checklist, diff commands, script blocks.

## Outputs
- File modifications and CLI task executions.

## Dependencies
- Local terminal shell interface, local file system manager.

## Public APIs
- `executeChanges(changes: FileChange[]): Promise<ExecutionResult>`
- `runTerminalCommand(cmd: string): Promise<CommandResult>`

## Failure Cases
- Command errors (must report diagnostics and rollback workspace files).

## Success Criteria
- Code changes applied with visual diff comparisons and explicit developer authorization.
