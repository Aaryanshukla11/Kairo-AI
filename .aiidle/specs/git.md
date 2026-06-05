# Technical Specification - Git Module

## Purpose
The Git module handles repository version control, checkpoint tracking, and diff generation.

## Responsibilities
- Create git commits representing checkpoints.
- Restore branches on recovery requests.
- Parse workspace git diff lists.

## Functional Requirements
- Output diff statistics matching active files index parameters.
- Revert working trees to specified checkpoints.

## Non Functional Requirements
- Git execution latencies under 500ms.
- 0% risk of data loss outside target branches.

## Inputs
- Branch identifiers, commit message logs, checkpoint tags.

## Outputs
- Checkpoint hash strings, diff models list.

## Public Interfaces
- **Who can call it**: Tool Executor, Error Recovery, Extension Host.
- **Who cannot call it**: Chat UI Webview.
- **Request Format**: `{ branchName: string }`
- **Response Format**: `{ diffText: string }`
- **Errors**: Merge conflict exceptions, Git binary missing errors.
- **Retry behavior**: Wait and retry Git actions up to 2 times on index lock errors.

## Internal Components
- GitShellInterface, DiffParser, CheckpointManager.

## Dependencies
- Local Git execution binary, Terminal Engine.

## Configuration
- Default commit messages templates, branch prefixes.

## State Management
- Map of active commit pointers, status of workspace modifications.

## Events
- `onCheckpointCreated`, `onDiffGenerated`, `onGitRollbackComplete`.

## Error Handling
- Capture merge errors, halt task steps, and report log statuses.

## Validation Rules
- Verify Git repositories are initialized before running tasks.

## Security Requirements
- Restrict commands to standard tracking operations.

## Performance Requirements
- Checkpoint commit calculations must execute in under 300ms.

## Acceptance Criteria
- Workspace rollbacks succeed and restore code to exact checkpoint hashes.

## Failure Scenarios
- Stale git locks, commit parse failures.

## Recovery Strategy
- Force-remove git index lock files and rerun.

## Future Extension Points
- Automate remote repository branch creation loops.

## Out of Scope
- Code compiler validations.
