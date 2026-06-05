# Technical Specification - Approval Module

## Purpose
The Approval module gates all high-impact modifications (terminal commands and file writes) using interactive user confirmations.

## Responsibilities
- Intercept tasks before execution.
- Present visual Diff blocks and verification requests.
- Prevent unapproved terminal commands.

## Functional Requirements
- Prompt UI updates on block triggers.
- Support bypass parameters for non-destructive operations.

## Non Functional Requirements
- Gate response latency under 10ms.
- 100% fail-safe status (if the user does not explicitly click "Approve", do not execute).

## Inputs
- Execution task checklists, command parameters, code diff data.

## Outputs
- Gated state status updates, authorization success flags.

## Public Interfaces
- **Who can call it**: Tool Executor, Extension Host.
- **Who cannot call it**: Planner Engine, File System, Git.
- **Request Format**: `{ taskId: string, action: string, data: any }`
- **Response Format**: `{ authorized: boolean }`
- **Errors**: Authorization timeout parameters.
- **Retry behavior**: Resume verification checks on panel refresh.

## Internal Components
- GateController, InterceptorHook, VerificationManager.

## Dependencies
- Chat UI panel messaging.

## Configuration
- Expiry limits (`default: infinite`), auto-deny policies.

## State Management
- Pending action queue indices, active verification identifiers.

## Events
- `onActionBlocked`, `onActionApproved`, `onActionDenied`.

## Error Handling
- Deny all operations on internal error states.

## Validation Rules
- Check diff maps for structure changes before approvals display.

## Security Requirements
- Ensure verification hashes map correctly to block execution injections.

## Performance Requirements
- Load and parse diff structures under 50ms.

## Acceptance Criteria
- Commands and writes remain blocked until the user approves the diffs.

## Failure Scenarios
- Webview channel crashes during pending approvals.

## Recovery Strategy
- Halt execution queue, persist state, and re-prompt user on interface reload.

## Future Extension Points
- Implement automated whitelist patterns for common command sets.

## Out of Scope
- Code compilation checks.
