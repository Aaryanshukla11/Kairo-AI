# Technical Specification - Terminal Module

## Purpose
The Terminal module executes shell command strings safely and captures diagnostic output logs.

## Responsibilities
- Spawn background OS terminals processes.
- Stream execution stdout/stderr lines.

## Functional Requirements
- Capture and return execution status codes.
- Enforce command whitelist validation steps.

## Non Functional Requirements
- Process startup time under 100ms.
- 0% thread locks on long-running processes.

## Inputs
- Validated command string parameters.

## Outputs
- Exit status code, stdout lines, stderr lines.

## Public Interfaces
- **Who can call it**: Tool Executor, Extension Host.
- **Who cannot call it**: Chat UI Webview, Planner Engine.
- **Request Format**: `{ command: string, args?: string[], cwd: string }`
- **Response Format**: `{ exitCode: number, stdout: string, stderr: string }`
- **Errors**: Command timeout errors, command not found errors.
- **Retry behavior**: Retry up to 2 times on process initialization errors.

## Internal Components
- ProcessLauncher, StreamBufferLogger, CommandValidator.

## Dependencies
- Node standard child process runtime.

## Configuration
- Command whitelist arrays, run timeout threshold limits (`default: 30000ms`).

## State Management
- Map of active background process identifiers.

## Events
- `onCommandStarted`, `onCommandOutput`, `onCommandExit`.

## Error Handling
- Terminate process trees on execution timeouts.

## Validation Rules
- Block command executions not matching configured whitelist arrays.

## Security Requirements
- Deny environment variable expansions or shell injection characters.

## Performance Requirements
- Keep stdout capture buffers capped at 5MB.

## Acceptance Criteria
- Commands execute correctly and dump streams to `.aiidle/logs/terminal.log`.

## Failure Scenarios
- Infinite loops in scripts, missing executor binaries.

## Recovery Strategy
- Kill process trees by process identifiers and exit with non-zero flags.

## Future Extension Points
- Implement virtual terminal sandboxes.

## Out of Scope
- File system editing actions.
