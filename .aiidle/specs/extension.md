# Technical Specification - Extension Module

## Purpose
The Extension module wraps Visual Studio Code API hooks, registers editor events, initializes the local background execution server, and mounts dashboard Webviews.

## Responsibilities
- Register commands and sidebar panel views.
- Forward text editor document events (e.g., save, change, focus) to the local orchestrator process.
- Manage local process bindings and check port status for backend services.

## Functional Requirements
- Register CLI proxy command handlers.
- Mount side webviews when the extension activations occur.
- Forward active files focus changes within 10ms.

## Non Functional Requirements
- Activation lag must remain under 300ms.
- 0% CPU consumption in idle mode when side panels are collapsed.

## Inputs
- Editor command events, sidebar mouse triggers, configuration setups.

## Outputs
- Sidebar dashboards, webview triggers, localized UI warnings.

## Public Interfaces
- **Who can call it**: VS Code Editor runtime.
- **Who cannot call it**: Chat UI, Planner, Executor engines.
- **Expected Request**: Command hooks, activation logs.
- **Expected Response**: Webview mounting success, registered hooks mappings.
- **Errors**: Port conflicts, activation timeouts.
- **Retry behavior**: Reload panel state up to 3 times on mounting errors.

## Internal Components
- CommandRegistry, PanelManager, EventBridge, HostProcessLauncher.

## Dependencies
- VS Code API, Node subprocess compiler interface.

## Configuration
- Port bounds (`default: 4899`), activation options.

## State Management
- Session active flag, mounted panels indices, port mapping states.

## Events
- `onActivationComplete`, `onPanelFocusChanged`, `onPortError`.

## Error Handling
- Gracefully log startup exceptions to `logs/errors.log` and display a localized prompt view to the user.

## Validation Rules
- Verify target ports reside in user-allowable non-privileged ranges (>1024).

## Security Requirements
- Webviews must load content strictly from local resources with sandboxed script limits.

## Performance Requirements
- Load Webview resources under 100ms.

## Acceptance Criteria
- Extension successfully compiles, activates within VS Code, and registers events with the background host process.

## Failure Scenarios
- Host process crashes, ports are locked.

## Recovery Strategy
- Terminate locks, locate open ports, and restart process launcher loops.

## Future Extension Points
- Integrate editor contextual code lens prompts.

## Out of Scope
- Direct local model reasoning code.
