# Technical Specification - Planner Module

## Purpose
The Planner engine parses user requests and constructs structured step checklists for modification.

## Responsibilities
- Decompose complex tasks into target file changes.
- Identify modules affected by the prompt.

## Functional Requirements
- Output plans in structured JSON formats matching task schemas.
- Incorporate active rulebooks and stack guidelines into planners context.

## Non Functional Requirements
- Process generation times under 10 seconds (using local models).
- Produce reproducible plans for identical prompts.

## Inputs
- Prompts, Context Builder context maps, knowledge inputs.

## Outputs
- Structured JSON TaskPlan files.

## Public Interfaces
- **Who can call it**: Extension Host runtime.
- **Who cannot call it**: Chat UI webviews, Tool Executor engine.
- **Request Format**: `{ prompt: string, context: PromptContext }`
- **Response Format**: `{ planId: string, tasks: ChecklistItem[] }`
- **Errors**: Model context limits errors, parse errors.
- **Retry behavior**: Query LLM with simplified context parameters on context errors.

## Internal Components
- PromptAssembler, ModelClient, TaskDecomposer, OutputSchemaValidator.

## Dependencies
- Local LLM connection endpoints (Ollama/Llama.cpp).

## Configuration
- Model paths, Temperature defaults (`default: 0.1`).

## State Management
- Model selection values, token capacity percentages.

## Events
- `onPlanningStarted`, `onPlanGenerated`, `onModelTimeout`.

## Error Handling
- Validate schema outputs. Fallback to basic task steps on JSON parse errors.

## Validation Rules
- Enforce schema validation on plan JSON files.

## Security Requirements
- Prevent command instructions or path prompts from invoking root file systems.

## Performance Requirements
- Keep token size under active model context capacities.

## Acceptance Criteria
- Planner outputs valid, schema-compliant task checklists.

## Failure Scenarios
- LLM API timeouts, unstructured output errors.

## Recovery Strategy
- Restart connection paths and run queries using simpler prompts.

## Future Extension Points
- Multi-agent reasoning loops.

## Out of Scope
- Direct file writes or terminal shell command execution.
