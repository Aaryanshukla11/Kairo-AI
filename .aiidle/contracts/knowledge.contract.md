# Module Contract - Knowledge

## Purpose
Expose repository patterns, design systems, and best practices to developers and agents.

## Responsibilities
- Track reusable codebase paradigms.
- Expose patterns to the Planner.

## Inputs
- Workspace file index scans.

## Outputs
- Standard templates and reference scripts.

## Dependencies
- Ripgrep search and index scanner.

## Public APIs
- `retrieveKnowledge(query: string): KnowledgeItem[]`

## Failure Cases
- Outdated index (must run fresh validation checks before retrieval).

## Success Criteria
- Retrieve relevant code patterns from the repository context.
