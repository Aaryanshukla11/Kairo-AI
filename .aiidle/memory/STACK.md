# Technology Stack

This document tracks the core technologies, runtimes, and packages used in this project.

## Stack Overview

- **Frontend**: HTML5, CSS3, Vanilla JS/TS (web views or panels inside VS Code extension UI)
- **Backend**: Node.js, Express (local backend server)
- **Extension Runtime**: VS Code Extension API
- **Programming Languages**: TypeScript, JavaScript
- **Frameworks**: React (for complex dashboard views)
- **Libraries**: Tailwind CSS (for UI styling)
- **Database**: Local JSON structures or SQLite (if persistent DB is required)
- **Embedding Model**: Local models (e.g. via Transformers.js or local runner)
- **LLM Runtime**: Local AI models run via Ollama or Llama.cpp (fully offline)
- **Vector Database**: Local vector indexes
- **Testing Stack**: Jest, React Testing Library
- **Build Tools**: Vite (for dashboard builds), esbuild (for extension compilation)
- **Package Manager**: npm, pnpm
- **Version Numbers**:
  - Node: `>= 18.0.0`
  - TypeScript: `^5.0.0`
  - VS Code API: `^1.80.0`
