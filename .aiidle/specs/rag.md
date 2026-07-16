# Technical Specification - RAG Module

## Purpose
The RAG module computes semantic embeddings of workspace files and retrieves context chunks.

## Responsibilities
- Chunk codebase file texts.
- Query flat vector storage indices.

## Functional Requirements
- Compute file embeddings using local transformer modules.
- Query closest matches (Cosine similarity).

## Non Functional Requirements
- Retrieve matches under 300ms.
- 0% cloud dependencies.

## Inputs
- Prompt texts, codebase folder pathways.

## Outputs
- Match rankings, text context chunks.

## Public Interfaces
- **Who can call it**: Planner, Extension Host.
- **Who cannot call it**: Chat UI Webview.
- **Request Format**: `{ query: string, topK?: number }`
- **Response Format**: `{ chunks: VectorChunk[] }`
- **Errors**: Model execution timeouts, memory errors.
- **Retry behavior**: Re-initialize the model thread and try again.

## Internal Components
- Chunker, EmbeddingModelWrapper, VectorCacheManager.

## Dependencies
- Local embedding model runtime package.

## Configuration
- Model paths, Chunk size (`default: 500 characters`).

## State Management
- Vector database indices, loaded embedding model pointers.

## Events
- `onIndexingStarted`, `onIndexingComplete`, `onSemanticQueryComplete`.

## Error Handling
- Capture model errors and fall back to keyword search scripts.

## Validation Rules
- Verify file sizes before chunking.

## Security Requirements
- Sandboxed execution of local model runtimes.

## Performance Requirements
- Limit vector databases memory use to 50MB.

## Acceptance Criteria
- RAG engine indexes workspace files and retrieves semantic matches.

## Failure Scenarios
- Embedding model crash, indexing memory errors.

## Recovery Strategy
- Unload model pipelines and rebuild indices.

## Future Extension Points
- Implement incremental file indexing watchers.

## Out of Scope
- LLM text generation logic.
