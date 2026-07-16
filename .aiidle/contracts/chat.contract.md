# Module Contract - Chat

## Purpose
Expose a conversational interface for the developer to interact with the agent.

## Responsibilities
- Display active agent thoughts, plan checklists, and diffs.
- Accept text input prompts and confirmations.

## Inputs
- Natural language messages from developer, agent feedback maps.

## Outputs
- Rendered UI panels, approvals hooks.

## Dependencies
- VS Code Webview panel runtime.

## Public APIs
- `renderMessage(msg: Message): void`
- `promptUserConfirmation(promptText: string): Promise<boolean>`

## Failure Cases
- Webview crash (must fallback to console prompt dialogs).

## Success Criteria
- Responsive conversation thread with interactive checklist tools.
