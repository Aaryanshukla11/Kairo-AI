# Technical Specification - Logging Module

## Purpose
The Logging module provides standardized log tracking across all modules in `.aiidle/logs/`.

## Responsibilities
- Record diagnostic entries (`[TIMESTAMP] [LEVEL] [MODULE] [MESSAGE]`).
- Store standard outputs in logs/*.log files.

## Functional Requirements
- Write entries asynchronously to prevent blocking threads.
- Support levels configuration (DEBUG, INFO, WARN, ERROR).

## Non Functional Requirements
- Log operation delay under 10ms.
- Enforce rotation limits to prevent disk filling.

## Inputs
- Log messages, source module tags, log levels parameters.

## Outputs
- Formatted file stream buffers.

## Public Interfaces
- **Who can call it**: All active workspace modules.
- **Who cannot call it**: Chat UI Webview.
- **Request Format**: `{ level: "INFO" | "ERROR", module: string, msg: string }`
- **Response Format**: `{ success: boolean }`
- **Errors**: Directory write errors.
- **Retry behavior**: Print logs to console stderr on file system errors.

## Internal Components
- StreamBuffer, LogFormatter, LogRotator.

## Dependencies
- File System Engine.

## Configuration
- Max file size (`default: 5MB`), path settings (`default: .aiidle/logs/`).

## State Management
- Writer stream pointer.

## Events
- `onLogWritten`, `onLogRotated`.

## Error Handling
- Use console fallbacks on write blockages.

## Validation Rules
- Check log levels thresholds.

## Security Requirements
- Strip passwords or keys before formatting output buffers.

## Performance Requirements
- Complete log formatting under 2ms.

## Acceptance Criteria
- Logs are written correctly to `.aiidle/logs/` based on severity mappings.

## Failure Scenarios
- Disk full errors, file system lock errors.

## Recovery Strategy
- Empty oldest logs files to clear memory.

## Future Extension Points
- Implement log streaming views in the UI.

## Out of Scope
- Prompt context planning.
