# Technical Specification - Memory Module

## Purpose
The Memory module manages persistent logs and configuration files inside the `.aiidle/` folder.

## Responsibilities
- Write session logs, roadmaps, and todo lists.
- Track completed tasks and decisions.
- Maintain technology stack descriptions.

## Functional Requirements
- Read and update files within `.aiidle/memory/` in Markdown formats.
- Append session updates to `SESSION_LOG.md`.

## Non Functional Requirements
- Parse/Write operations must execute under 200ms.
- Enforce strict single-writer access to prevent corruption.

## Inputs
- Session log structs, checklist updates, architecture descriptions.

## Outputs
- Updated Markdown text documents.

## Public Interfaces
- **Who can call it**: Extension Host, Planner, Context Builder.
- **Who cannot call it**: Chat UI Webview scripts.
- **Request Format**: `{ file: string, data: any }`
- **Response Format**: `{ success: boolean }`
- **Errors**: Lock error statuses, disk permission limits.
- **Retry behavior**: Wait 50ms and retry up to 5 times on lock conflicts.

## Internal Components
- FileLockManager, MarkdownParser, LogAppender.

## Dependencies
- Local File System Engine.

## Configuration
- Target folder path (`default: .aiidle/memory/`).

## State Management
- Writer lock statuses, open file handles indices.

## Events
- `onMemoryWriteComplete`, `onMemoryLockError`.

## Error Handling
- Capture write failures, log errors, and notify of disk state limits.

## Validation Rules
- Verify directory path begins with target project workspace roots.

## Security Requirements
- Deny directory traversal symbols (`../`).

## Performance Requirements
- Keep file sizes under 1MB; compact older log entries.

## Acceptance Criteria
- Memory files update correctly without loss of historical logs.

## Failure Scenarios
- Concurrent write attempts, file system locking errors.

## Recovery Strategy
- Clean stale lock files and retry writing buffers.

## Future Extension Points
- Implement automated version validation trackers.

## Out of Scope
- Code compilation configurations.
