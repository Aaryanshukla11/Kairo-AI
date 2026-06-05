# Technical Specification - Chat Module

## Purpose
The Chat module provides a messaging UI panel inside the VS Code Webview container for prompting and checklist status validation.

## Responsibilities
- Render prompt messages.
- Expose visual code diff comparisons.
- Render checklist states (`[ ]`, `[/]`, `[x]`).

## Functional Requirements
- Render Markdown messages.
- Accept approval buttons confirm clicks.
- Stream code edits side-by-side diff previews.

## Non Functional Requirements
- Sub-50ms rendering latency on message appending.
- Match active VS Code IDE color theme coordinates.

## Inputs
- User input prompts, agent plan JSONs, code diff frames.

## Outputs
- Message action events, diff approvals, plan validation selections.

## Public Interfaces
- **Who can call it**: Extension Host process.
- **Who cannot call it**: Planner, Terminal, Git engines.
- **Request Format**: `{ type: "PLAN" | "MSG", content: any }`
- **Response Format**: `{ approved: boolean, taskIndex?: number }`
- **Errors**: Webview rendering blockages.
- **Retry behavior**: Reconnect Webview bridge on lost frames.

## Internal Components
- MessageThreadView, DiffViewerComponent, PlanTaskChecklist, WebviewEventBridge.

## Dependencies
- React library, postMessage API.

## Configuration
- Render settings (font sizes, theme mappings).

## State Management
- Message history arrays, active checklist indexes, pending approvals status.

## Events
- `onMessageSent`, `onPlanApproved`, `onPlanRejected`.

## Error Handling
- Throw webview mount errors to Extension Host log loops.

## Validation Rules
- Verify inputs do not inject raw executable HTML script blocks.

## Security Requirements
- Limit message parameters to text characters and safe markdown symbols.

## Performance Requirements
- Load and parse 100+ message logs under 150ms.

## Acceptance Criteria
- Chat sidebar renders text, handles planning approvals, and shows code diffs.

## Failure Scenarios
- Webview thread lockups, messaging bridge disconnects.

## Recovery Strategy
- Destroy the Webview panel, mount a replacement panel, and reload context parameters.

## Future Extension Points
- Implement voice transcription commands.

## Out of Scope
- File system updates or shell execution runs.
