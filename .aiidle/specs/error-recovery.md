# Technical Specification - Error Recovery Module

## Purpose
The Error Recovery module captures task exceptions, manages git rolls back to safe checkpoints, and clears process locks.

## Responsibilities
- Intercept run compiler exceptions.
- Trigger checkout rollbacks on execution failures.
- Purge file and process locks.

## Functional Requirements
- Restore workspace files using Git checkpoints.
- Kill hanging compiler subprocesses on task cancellations.

## Non Functional Requirements
- Rollback execution latency under 1 second.
- 100% guarantee of clean code restoration after task failures.

## Inputs
- Process error statuses, checkpoint hashes, cancel event parameters.

## Outputs
- Restored files, logged warnings.

## Public Interfaces
- **Who can call it**: Tool Executor, Extension Host.
- **Who cannot call it**: Chat UI Webview.
- **Request Format**: `{ errorType: string, checkpointHash: string }`
- **Response Format**: `{ recovered: boolean }`
- **Errors**: Stale Git lock issues.
- **Retry behavior**: Force checkout up to 3 times on locked index warnings.

## Internal Components
- RollbackController, ProcessTerminator, LockCleaner.

## Dependencies
- Git Engine, Terminal Engine, File System Engine.

## Configuration
- Process kill timeout thresholds (`default: 5000ms`).

## State Management
- Last known checkpoint hashes.

## Events
- `onRecoveryTriggered`, `onRecoveryComplete`, `onRecoveryError`.

## Error Handling
- Capture checkout exceptions, clean lock structures, and notify of folder permissions states.

## Validation Rules
- Verify checkpoint hashes match valid commit identifiers before executing rollbacks.

## Security Requirements
- Restrict rollback checkouts strictly to workspace directory branches.

## Performance Requirements
- Complete recovery sequences under 1 second.

## Acceptance Criteria
- Compiler check exceptions trigger the module to restore all modified files to checkpoint hashes.

## Failure Scenarios
- Git index locks prevent checkout, disk permissions block updates.

## Recovery Strategy
- Force-delete Git and Node lock files and rerun rollbacks.

## Future Extension Points
- Multi-branch merge conflicts auto-resolving.

## Out of Scope
- Prompt text planning.
