# Kairo-AI Provider Configuration Guide

Kairo-AI supports multiple inference providers while keeping downstream execution, generation contract building, schema validation, and file synthesis completely provider-agnostic.

---

## 1. Local Inference Provider (Production Default)

By default, Kairo-AI uses **Ollama** running locally on port 11434 with `qwen2.5-coder:7b`.

### Configuration
```bash
KAIRO_MODEL_PROVIDER=ollama
```

### Requirements
- Ollama installed and running locally (`ollama serve`).
- Model pulled: `ollama pull qwen2.5-coder:7b`.

---

## 2. Google Gemini 2.5 Flash Provider (Cloud Testing)

Google Gemini 2.5 Flash (`gemini-2.5-flash`) can be used as an inference provider for cloud testing.

### Configuration
```bash
KAIRO_MODEL_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

### Optional Model Override
```bash
GEMINI_MODEL=gemini-2.5-flash
```

### Missing API Key Behavior
If `KAIRO_MODEL_PROVIDER=gemini` and `GEMINI_API_KEY` is not set or empty:
- Kairo emits an explicit error (`[GeminiProvider] Missing GEMINI_API_KEY environment variable.`).
- Kairo **does NOT** fall back to Ollama.
- Kairo **does NOT** produce fake/mock responses.

---

## 3. Architecture & Execution Pipeline

Regardless of whether `ollama` or `gemini` is selected, the generation pipeline remains identical:

```
User Prompt
    ↓
AI Kernel
    ↓
PipelineRouter
    ↓
Orchestrator
    ↓
Planner
    ↓
GeneratorSDK
    ↓
ModelRouter
    ↓
Provider (OllamaProvider OR GeminiProvider)
    ↓
Normalized Model Response (ILocalInferenceResult)
    ↓
GenerationContract Builder & Validator
    ↓
Kairo ExecutionEngine
    ↓
Real Filesystem
```

All downstream components (EventBus, GenerationContract, ExecutionEngine, Diff Viewer) process standard `GenerationContract` objects independently of the inference provider.

---

## 4. Benchmark Utility

Kairo includes a provider benchmark utility to compare metrics between Ollama and Gemini:

```typescript
import { providerBenchmark } from './src/core/inference/benchmark';

const metrics = await providerBenchmark.compareProviders('Build responsive portfolio site');
console.log('Ollama Metrics:', metrics.ollama);
console.log('Gemini Metrics:', metrics.gemini);
```
