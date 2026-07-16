# Technical Specification - Context Module

## Purpose
The Context module manages active execution parameters (goals, branch, blockers) and formats LLM prompts.

## Responsibilities
- Track active developer goals.
- Assemble Vision and Stack files into system prompts.

## Functional Requirements
- Render system context maps from `CONTEXT.md`.
- Truncate prompt context files systematically to match model capacities.

## Non Functional Requirements
- Prompt construction latency must remain under 50ms.
- Enforce reproducible prompt templates.

## Inputs
- Active sprint state, file index logs, user prompt texts.

## Outputs
- Structured System Prompts.

## Public Interfaces
- **Who can call it**: Planner Engine, Extension Host.
- **Who cannot call it**: Chat UI Webview.
- **Request Format**: `{ rawPrompt: string }`
- **Response Format**: `{ systemPrompt: string, userPrompt: string }`
- **Errors**: Missing Vision/Rulebook configuration files.
- **Retry behavior**: Reload missing file nodes and try again.

## Internal Components
- PromptTemplateBuilder, ContextPruner, MetadataAggregator.

## Dependencies
- Memory Engine, Settings Manager.

## Configuration
- Maximum token limits for LLM contexts.

## State Management
- Active target modules, branch pointers.

## Events
- `onContextUpdated`, `onPromptAssembled`.

## Error Handling
- Use basic fallback templates when memory config files are unreadable.

## Validation Rules
- Verify outputs contain vision and rulebook lines.

## Security Requirements
- Ensure prompts sanitize keys or user credentials.

## Performance Requirements
- Keep processing footprint under 5MB of RAM.

## Acceptance Criteria
- Context module constructs complete system prompts containing constitutional rules.

## Failure Scenarios
- Core memory files missing or corrupted.

## Recovery Strategy
- Recreate baseline context files and read configurations.

## Future Extension Points
- Dynamic context prioritization algorithms.

## Out of Scope
- Code compilation processes.
