# Technical Specification - Knowledge Module

## Purpose
The Knowledge module supplies design blueprints, coding rules, and code patterns to the planner.

## Responsibilities
- Index design system templates.
- Retrieve code patterns.

## Functional Requirements
- Query code blueprints matching module keywords.
- Return code reference lines from local indices.

## Non Functional Requirements
- Lookup latency under 100ms.
- 0% external API reliance.

## Inputs
- Match queries, target module identifiers.

## Outputs
- Match metadata, template files contents.

## Public Interfaces
- **Who can call it**: Planner, Context Builder.
- **Who cannot call it**: Chat UI Webview scripts.
- **Request Format**: `{ query: string, moduleType: string }`
- **Response Format**: `{ templates: CodeTemplate[] }`
- **Errors**: Blueprint index corrupted errors.
- **Retry behavior**: Re-index folder templates and retry.

## Internal Components
- BlueprintIndexer, PatternMatcher, TemplatesCache.

## Dependencies
- File System Engine.

## Configuration
- Template directory paths (`default: .aiidle/knowledge/`).

## State Management
- Cached templates maps, active pattern references.

## Events
- `onKnowledgeIndexed`, `onKnowledgeRetrieved`.

## Error Handling
- Log errors and proceed with empty blueprint results.

## Validation Rules
- Verify file extensions match target project templates (e.g. `.ts`, `.tsx`).

## Security Requirements
- Deny absolute paths outside the workspace environment.

## Performance Requirements
- Keep template index allocations under 10MB of RAM.

## Acceptance Criteria
- Knowledge indexer retrieves code snippets matching query parameters.

## Failure Scenarios
- Invalid code templates, missing template directories.

## Recovery Strategy
- Recreate template directory buffers.

## Future Extension Points
- Implement automatic template imports.

## Out of Scope
- Code compilation validations.
