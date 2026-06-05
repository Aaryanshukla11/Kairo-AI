import { PromptProcessor } from '../prompt-processor';
import { EntityExtractor } from '../entity-extractor';
import { ProjectContextAnalyzer } from '../project-context-analyzer';
import { PromptContextBuilder } from '../prompt-context-builder';
import { AIRequestBuilder } from '../ai-request-builder';
import { agentRegistry } from '../agents/agentRegistry';
import { MemoryAgent } from '../agents/memory/memoryAgent';
import { MemoryType, Memory } from '../agents/memory/memoryTypes';
import { AgentStatus } from '../agents/agentTypes';
import { retrieverService } from '../retriever';
import { promptModelRouter } from '../prompt-model-router';
import { orchestratorEngine } from '../orchestrator';
import { logKairoStage } from '../../common/kairoLogger';
import { globalKairoEventBus } from '../eventBus/runtime/kairoEventBus';
import {
  IAIKernel,
  IAIKernelRequest,
  IAIKernelCompiledRequest,
  IKernelStageLog,
  IAIKernelKnowledgeContext
} from './types';
import * as crypto from 'crypto';

export class AIKernel implements IAIKernel {
  private logs: IKernelStageLog[] = [];
  private lastCompiledRequest: IAIKernelCompiledRequest | null = null;
  private listeners: Array<(log: IKernelStageLog) => void> = [];

  public getLogs(): readonly IKernelStageLog[] {
    return Object.freeze([...this.logs]);
  }

  public getLastCompiledRequest(): IAIKernelCompiledRequest | null {
    return this.lastCompiledRequest;
  }

  public subscribe(listener: (log: IKernelStageLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public clearHistory(): void {
    this.logs = [];
    this.lastCompiledRequest = null;
  }

  private emitLog(stageLog: IKernelStageLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[AIKernel] Error in log listener:', err);
      }
    }
  }

  public async processPrompt(
    input: string | IAIKernelRequest,
    workspacePath?: string
  ): Promise<IAIKernelCompiledRequest> {
    const rawPrompt = typeof input === 'string' ? input : input.rawPrompt;
    console.log('[TRACE] [AI Kernel] ENTER: Processing prompt:', rawPrompt.substring(0, 60));
    const effectiveWorkspacePath = typeof input === 'object' && input.workspacePath ? input.workspacePath : workspacePath;
    console.log(`[WORKSPACE_TRACE] AIKernel=${effectiveWorkspacePath}`);
    const requestId = typeof input === 'object' && input.requestId ? input.requestId : (crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`);
    const startTime = Date.now();
    logKairoStage('AIKernel', 'ENTER', requestId, { prompt: rawPrompt });

    try {
      // STAGE 1: CONTEXT BUILDER
      const stage1Start = Date.now();
      const processor = new PromptProcessor();
      const processorOutput = processor.process(rawPrompt);
      const intent = processorOutput.intent;

      // STEP 4: WORKSPACE HANDLING
      // Active workspace folder is required for creating, modifying, or generating project files
      if (!effectiveWorkspacePath || effectiveWorkspacePath === '.' || effectiveWorkspacePath.trim() === '') {
        throw new Error('Workspace Detection Error: No active workspace folder is open in VS Code. Please open a folder (File -> Open Folder) to generate and save project files.');
      }

      const extractor = new EntityExtractor();
      const extractorOutput = extractor.extract(rawPrompt);

      await globalKairoEventBus.publish({
        eventId: `evt-ws-start-${Date.now()}`,
        eventType: 'WorkspaceAnalysisStarted',
        timestamp: Date.now(),
        source: 'AIKernel',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId: requestId,
        payload: { requestId, stage: 'Analyzing Workspace' }
      });

      const analyzer = new ProjectContextAnalyzer();
      let analyzerOutput: any;
      if (!effectiveWorkspacePath || intent === 'NEW_PROJECT' || intent === 'CHAT' || intent === 'UNKNOWN') {
        analyzerOutput = analyzer.getDefaultContext();
      } else {
        analyzerOutput = await analyzer.analyze(effectiveWorkspacePath);
      }

      await globalKairoEventBus.publish({
        eventId: `evt-ws-done-${Date.now()}`,
        eventType: 'WorkspaceAnalysisCompleted',
        timestamp: Date.now(),
        source: 'AIKernel',
        priority: 'HIGH',
        correlationId: requestId,
        sessionId: requestId,
        payload: { requestId, stage: 'Workspace Analyzed' }
      });

      const contextBuilder = new PromptContextBuilder();
      const promptContext = contextBuilder.buildContext(processorOutput, extractorOutput, analyzerOutput);

      const requestBuilder = new AIRequestBuilder();
      const aiRequest = requestBuilder.buildRequest(promptContext);

      this.emitLog({
        stage: 'CONTEXT_BUILDER',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Built prompt context for intent '${processorOutput.intent}' (${rawPrompt.length} chars)`,
        details: {
          requestId,
          intent: processorOutput.intent,
          confidence: processorOutput.confidence,
          detectedTechnologies: promptContext.detectedTechnologies,
          existingFilesCount: promptContext.existingFiles.length,
          executionTimeMs: Date.now() - stage1Start
        }
      });

      // STAGE 2: MEMORY ENGINE
      const stage2Start = Date.now();
      let retrievedMemories: Memory[] = [];
      try {
        let memoryAgent = agentRegistry.get('memory-agent') as MemoryAgent;
        if (!memoryAgent) {
          memoryAgent = new MemoryAgent({
            id: 'memory-agent',
            name: 'Memory Agent',
            role: 'Project Memory QA',
            version: '1.0.0',
            priority: 9,
            status: AgentStatus.Idle,
            capabilities: ['recording', 'retrieval', 'compression'],
            permissions: ['READ', 'WRITE']
          });
          agentRegistry.register(memoryAgent);
        }

        // Query memory agent
        const keywords = rawPrompt.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const queryStr = keywords.slice(0, 5).join(' ') || rawPrompt;

        const searchTask = {
          id: `search-${requestId}`,
          title: 'Search prompt memories',
          assignedAgentId: 'memory-agent',
          payload: {
            action: 'SEARCH',
            filter: {
              query: queryStr
            }
          },
          status: 'pending' as any
        };

        const searchResult = await memoryAgent.executeTask(searchTask);
        if (searchResult.success && Array.isArray(searchResult.result)) {
          retrievedMemories = searchResult.result;
        }
      } catch (err: any) {
        console.warn('[AIKernel] Memory engine warning:', err.message);
      }

      this.emitLog({
        stage: 'MEMORY_ENGINE',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Retrieved ${retrievedMemories.length} relevant memory items from Memory Engine`,
        details: {
          requestId,
          memoriesRetrievedCount: retrievedMemories.length,
          memoryIds: retrievedMemories.map(m => m.id),
          executionTimeMs: Date.now() - stage2Start
        }
      });

      // STAGE 3: KNOWLEDGE ENGINE
      const stage3Start = Date.now();
      let knowledgeContext: IAIKernelKnowledgeContext = {
        indexedFiles: promptContext.existingFiles,
        relevantSymbols: [],
        matchedContext: []
      };

      if (effectiveWorkspacePath && intent !== 'NEW_PROJECT' && intent !== 'CHAT' && intent !== 'UNKNOWN') {
        try {
          // Query retriever service for workspace indexed symbols & snippet context
          const retrieverQuery = processorOutput.intent || rawPrompt;
          const searchHits = retrieverService.search(retrieverQuery, 5, effectiveWorkspacePath);

          const matchedSymbols: string[] = searchHits.map(h => h.symbol || h.file).filter((s): s is string => !!s);
          const matchedFiles: string[] = Array.from(new Set([
            ...promptContext.existingFiles,
            ...searchHits.map(h => h.file).filter((f): f is string => !!f)
          ]));
          const snippets: string[] = searchHits.map(h => h.snippet).filter((s): s is string => !!s);

          knowledgeContext = {
            indexedFiles: Object.freeze(matchedFiles),
            relevantSymbols: Object.freeze(matchedSymbols),
            matchedContext: Object.freeze(snippets)
          };
        } catch (err: any) {
          console.warn('[AIKernel] Knowledge engine warning:', err.message);
        }
      }

      this.emitLog({
        stage: 'KNOWLEDGE_ENGINE',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Retrieved knowledge context (${knowledgeContext.indexedFiles.length} files, ${knowledgeContext.relevantSymbols.length} symbols)`,
        details: {
          requestId,
          indexedFilesCount: knowledgeContext.indexedFiles.length,
          relevantSymbolsCount: knowledgeContext.relevantSymbols.length,
          matchedContextCount: knowledgeContext.matchedContext.length,
          executionTimeMs: Date.now() - stage3Start
        }
      });

      // STAGE 4: MODEL ROUTER
      const stage4Start = Date.now();
      const routingDecision = promptModelRouter.route(requestId, processorOutput.intent);

      this.emitLog({
        stage: 'MODEL_ROUTER',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Routed to model '${routingDecision.selectedModel.name}' (${routingDecision.selectedModel.modelId})`,
        details: {
          requestId,
          selectedModel: routingDecision.selectedModel,
          modelType: routingDecision.modelType,
          reason: routingDecision.reason,
          fallbackModels: routingDecision.fallbackModels,
          executionTimeMs: Date.now() - stage4Start
        }
      });

      const provider = typeof input === 'object' ? (input as any).provider : undefined;
      const codingProvider = typeof input === 'object' ? (input as any).codingProvider : undefined;
      const fsAdapter = typeof input === 'object' ? (input as any).fsAdapter : undefined;

      // HANDOFF TO ORCHESTRATOR
      const compiledRequestDraft: IAIKernelCompiledRequest = {
        requestId,
        timestamp: Date.now(),
        rawPrompt,
        normalizedPrompt: processorOutput.normalizedPrompt,
        intent: processorOutput.intent,
        promptContext,
        aiRequest,
        memories: Object.freeze(retrievedMemories),
        knowledge: knowledgeContext,
        routingDecision,
        kernelLogs: Object.freeze([...this.logs]),
        workspacePath: effectiveWorkspacePath,
        provider,
        codingProvider,
        fsAdapter
      };

      let orchestrationResult: any = null;
      try {
        // Forward compiled request to Orchestrator (Central Workflow Controller)
        orchestrationResult = await orchestratorEngine.executeWorkflow(compiledRequestDraft);
      } catch (err: any) {
        console.error('[AIKernel] Orchestrator workflow execution failed:', err);
      }

      const compiledRequest: IAIKernelCompiledRequest = {
        ...compiledRequestDraft,
        orchestrationResult
      };

      this.emitLog({
        stage: 'ORCHESTRATOR_HANDOFF',
        timestamp: Date.now(),
        status: orchestrationResult && orchestrationResult.status === 'SUCCESS' ? 'SUCCESS' : 'WARNING',
        message: `AI Kernel successfully compiled prompt and handed off request to Orchestrator (${orchestrationResult?.sessionId || 'N/A'})`,
        details: {
          requestId,
          intent: compiledRequest.intent,
          selectedModel: routingDecision.selectedModel.modelId,
          sessionId: orchestrationResult?.sessionId,
          workflowId: orchestrationResult?.workflowId,
          stagesCompleted: ['CONTEXT_BUILDER', 'MEMORY_ENGINE', 'KNOWLEDGE_ENGINE', 'MODEL_ROUTER', 'ORCHESTRATOR']
        }
      });

      this.lastCompiledRequest = compiledRequest;
      console.log('[TRACE] [AI Kernel] EXIT: Processed successfully. Intent detected:', compiledRequest.intent);
      
      const duration = Date.now() - startTime;
      logKairoStage('AIKernel', 'EXIT', requestId, { prompt: rawPrompt }, { intent: compiledRequest.intent }, duration);
      return compiledRequest;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logKairoStage('AIKernel', 'ERROR', requestId, { prompt: rawPrompt }, null, duration, error);
      throw error;
    }
  }
}

export const aiKernel = new AIKernel();
export default aiKernel;
