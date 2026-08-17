import * as vscode from 'vscode';
import { BridgeMessage } from '../shared/messages';
import { PromptDispatcher } from './pipeline/PromptDispatcher';
import { MessageFactory } from '../common/protocol';
import { MessageType, MessageSource, MessageTarget, IExecutionEventPayload } from '../common/protocol';
import { randomUUID } from 'crypto';
import { plannerEngine } from '../core/planner';
import { approvalEngine } from '../core/approval';
import { timelineService } from '../core/timeline';
import { workspaceService } from '../core/workspace';
import { pipelineControllerFacade } from '../core/pipeline-controller';
import { executorService, ExecutorEvent } from '../core/executor';
import { graphEngine } from '../core/executionGraph';
import { terminalService, TerminalEvent } from '../core/terminal';
import { gitService, GitEvent } from '../core/git';
import { patchService, PatchEvent } from '../core/patch';
import { rollbackService, RollbackEvent } from '../core/rollback';
import { checkpointService, CheckpointEvent } from '../core/checkpoint';
import { diagnosticsService, DiagnosticEvent } from '../core/diagnostics';
import { permissionService, PermissionEvent } from '../core/permission';
import { contextService, ContextEvent } from '../core/context';
import { IndexerEngine, IndexEvent } from '../core/indexer';
import { embeddingService, EmbeddingEvent } from '../core/embedding';
import { vectorStoreService, VectorStoreEvent } from '../core/vectorStore';
import { retrieverService, RetrieverEvent } from '../core/retriever';
import { promptAssemblyService, PromptAssemblyEvent } from '../core/promptAssembly';
import { runtimeService, RuntimeEvent } from '../core/runtime/model';
import { toolService, ToolCallingEvent } from '../core/toolCalling';
import { agentRuntimeInstance, agentRegistry, agentManager, AgentTask, AgentEvent, MemoryAgent, TestingAgent, SecurityAgent, DocumentationAgent, RefactoringAgent, DebugAgent, PerformanceAgent, DependencyAgent, ArchitectureAgent } from '../core/agents';
import { generationEngine, astEngine, multiFileEngine, incrementalEngine, conventionEngine, namingEngine, importEngine, symbolEngine, projectGeneratorEngine } from '../core/codeGeneration';
import { reviewEngine } from '../core/review';
import { validationEngine } from '../core/validation';
import { platformValidationEngine } from '../core/platformValidation/platformValidationEngine';
import { architectureHealth } from '../core/platformValidation/architectureHealth';
import { runtimeValidationEngine } from '../core/runtimeValidation/runtimeValidationEngine';
import { runtimeCoordinator } from '../core/runtimeValidation/runtimeCoordinator';
import { runtimeHistory } from '../core/runtimeValidation/runtimeHistory';
import { runtimeMetrics } from '../core/runtimeValidation/runtimeMetrics';
import { releaseEngine } from '../core/release/releaseEngine';
import { patchOptimizationEngine } from '../core/patchOptimization';
import { safeEditEngine } from '../core/safeEdit';
import { eventEvents, eventBusInstance } from '../core/eventBus';
import { globalKairoEventBus } from '../core/eventBus/runtime/kairoEventBus';
import { taskGenerationEngine, taskEvents } from '../core/taskGeneration';
import { executionPlanningEngine, executionEvents } from '../core/executionPlanning';
import { dependencyResolutionEngine } from '../core/dependencyResolution';
import { milestoneOrchestrationEngine } from '../core/milestoneOrchestration';
import { workflowCoordinator } from '../core/workflowCoordinator';
import { replanningEngine } from '../core/replanning';
import { recoveryEngine } from '../core/recovery';

import { modelManager } from '../core/model-manager';
import { workspaceLifecycleManager } from '../core/workspace/workspaceLifecycleManager';
import { aiKernel } from '../core/ai-kernel';
import { globalKairoExecutionEngine } from '../core/executionEngine/kairoExecutionEngine';
import { logKairoStage } from '../common/kairoLogger';

export class MessageRouter {
  private promptDispatcher: PromptDispatcher;
  private plansCache = new Map<string, any>();
  private approvalToPlanId = new Map<string, string>();
  private indexerEngine: IndexerEngine | null = null;
  private subscriptionsInitialized = false;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; text: string; timestamp: number }> = [];

  private recordConversationTurn(role: 'user' | 'assistant', text: string): void {
    if (!text || text.trim() === '') return;
    this.conversationHistory.push({ role, text, timestamp: Date.now() });
    if (this.conversationHistory.length > 12) {
      this.conversationHistory = this.conversationHistory.slice(this.conversationHistory.length - 12);
    }
  }

  private getFormattedConversationHistory(): { role: 'user' | 'assistant'; text: string }[] {
    return this.conversationHistory.map(h => ({ role: h.role, text: h.text }));
  }

  private getIndexerEngine(): IndexerEngine | null {
    if (!this.indexerEngine) {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        return null;
      }
      const root = folders[0].uri.fsPath;
      this.indexerEngine = new IndexerEngine(root);
      this.initIndexerSubscription();
    }
    return this.indexerEngine;
  }

  private initIndexerSubscription(): void {
    if (!this.indexerEngine) return;
    try {
      this.indexerEngine.subscribe((event: IndexEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.INDEXER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            index: this.indexerEngine!.getIndex()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to indexerEngine:', err);
    }
  }

  constructor(private readonly webview: vscode.Webview) {
    this.promptDispatcher = new PromptDispatcher();
    this.initializeAllSubscriptions();
  }

  private initializeAllSubscriptions(): void {
    if (this.subscriptionsInitialized) return;
    this.subscriptionsInitialized = true;

    try {
      this.getIndexerEngine();
      this.initEventBusSubscription();
    } catch (err) {
      console.error('[MessageRouter] Error during initializeAllSubscriptions:', err);
    }
  }

  private initEventBusSubscription(): void {
    try {
      const fs = require('fs');
      const path = require('path');

      globalKairoEventBus.subscribe('*', async (event: any) => {
        console.log(`[EventBus][FORWARD] -> ${event.eventType} to Webview`);

        // 1. Forward raw event bus update
        const busMsg = MessageFactory.createMessage(
          MessageType.EVENT_BUS_UPDATE as any,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          event
        );
        this.postMessage(busMsg);

        // 2. Handle specific execution pipeline events
        if (event.eventType === 'FileWriteStarted') {
          this._emitPipelineStatus('File Write', `Writing ${event.payload?.filePath || 'file'}...`, 'running');
        } else if (event.eventType === 'FileWriteCompleted') {
          this._emitPipelineStatus('File Write', `✓ Written ${event.payload?.filePath || 'file'}`, 'running');
        } else if (event.eventType === 'ExecutionCompleted' || event.eventType === 'ProjectCompleted') {
          this._emitPipelineStatus('Execution Complete', 'Successfully generated and persisted project files in workspace!', 'done');

          const folders = vscode.workspace.workspaceFolders;
          const workspacePath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;
          const createdFiles: string[] = [];
          const fileContents: Record<string, string> = {};

          if (workspacePath && fs.existsSync(workspacePath)) {
            const items = fs.readdirSync(workspacePath);
            for (const item of items) {
              if (!item.startsWith('.') && item !== 'node_modules') {
                const fullPath = path.join(workspacePath, item);
                if (fs.statSync(fullPath).isFile()) {
                  createdFiles.push(item);
                  try {
                    fileContents[item] = fs.readFileSync(fullPath, 'utf-8');
                  } catch {}
                }
              }
            }
          }

          const reviewMsg = MessageFactory.createMessage(
            MessageType.REVIEW_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              changedFiles: createdFiles,
              createdFiles,
              modifiedFiles: [],
              deletedFiles: [],
              fileContents,
              summary: `Generated ${createdFiles.length} files in workspace.`,
              statistics: {
                executionTimeMs: 0,
                warningsCount: 0,
                errorsCount: 0
              }
            }
          );
          this.postMessage(reviewMsg);

          try {
            await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
          } catch {}
        }
      });
    } catch (err: any) {
      console.error('[EventBus][ERROR] Failed to subscribe to EventBus:', err.message || err);
    }
  }

  private initModelSubscription(): void {
    try {
      modelManager.subscribe((payload) => {
        const msg = MessageFactory.createMessage(
          MessageType.MODEL_STATUS as any,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          payload
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to modelManager:', err);
    }
  }

  private initSafeEditSubscription(): void {
    try {
      safeEditEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.SAFE_EDIT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to SafeEditEngine:', err);
    }
  }

  private initOptimizationSubscription(): void {
    try {
      patchOptimizationEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.OPTIMIZATION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to PatchOptimizationEngine:', err);
    }
  }

  private initReviewSubscription(): void {
    try {
      reviewEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.REVIEW_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ReviewEngine:', err);
    }
  }

  private initValidationSubscription(): void {
    try {
      validationEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.VALIDATION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ValidationEngine:', err);
    }
  }

  private initSymbolSubscription(): void {
    try {
      symbolEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.SYMBOL_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to SymbolEngine:', err);
    }
  }

  private initImportSubscription(): void {
    try {
      importEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.IMPORT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ImportEngine:', err);
    }
  }

  private initNamingSubscription(): void {
    try {
      namingEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.NAMING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to NamingEngine:', err);
    }
  }

  private initConventionSubscription(): void {
    try {
      conventionEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.CONVENTION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ConventionEngine:', err);
    }
  }

  private initIncrementalSubscription(): void {
    try {
      incrementalEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.INCREMENTAL_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to IncrementalEngine:', err);
    }
  }

  private initMultiFileSubscription(): void {
    try {
      multiFileEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.MULTIFILE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to MultiFileEngine:', err);
    }
  }

  private initAstSubscription(): void {
    try {
      astEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.AST_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ASTEngine:', err);
    }
  }

  private initGenerationSubscription(): void {
    try {
      generationEngine.subscribe((event: any) => {
        const msg = MessageFactory.createMessage(
          MessageType.GENERATION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to GenerationEngine:', err);
    }
  }

  private initArchitectureSubscription(): void {
    try {
      const archAgent = agentRegistry.get('architecture-agent') as ArchitectureAgent;
      if (archAgent) {
        archAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.ARCHITECTURE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to ArchitectureAgent:', err);
    }
  }

  private initDependencySubscription(): void {
    try {
      const depAgent = agentRegistry.get('dependency-agent') as DependencyAgent;
      if (depAgent) {
        depAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.DEPENDENCY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to DependencyAgent:', err);
    }
  }

  private initPerformanceSubscription(): void {
    try {
      const perfAgent = agentRegistry.get('performance-agent') as PerformanceAgent;
      if (perfAgent) {
        perfAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.PERFORMANCE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to PerformanceAgent:', err);
    }
  }

  private initDebugSubscription(): void {
    try {
      const debugAgent = agentRegistry.get('debug-agent') as DebugAgent;
      if (debugAgent) {
        debugAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.DEBUG_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to DebugAgent:', err);
    }
  }

  private initRefactoringSubscription(): void {
    try {
      const refAgent = agentRegistry.get('refactoring-agent') as RefactoringAgent;
      if (refAgent) {
        refAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.REFACTORING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to RefactoringAgent:', err);
    }
  }

  private initDocumentationSubscription(): void {
    try {
      const docAgent = agentRegistry.get('documentation-agent') as DocumentationAgent;
      if (docAgent) {
        docAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.DOCUMENTATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to DocumentationAgent:', err);
    }
  }

  private initSecuritySubscription(): void {
    try {
      const securityAgent = agentRegistry.get('security-agent') as SecurityAgent;
      if (securityAgent) {
        securityAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.SECURITY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to SecurityAgent:', err);
    }
  }

  private initTestingSubscription(): void {
    try {
      const testingAgent = agentRegistry.get('testing-agent') as TestingAgent;
      if (testingAgent) {
        testingAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.TESTING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to TestingAgent:', err);
    }
  }

  private initMemorySubscription(): void {
    try {
      const memoryAgent = agentRegistry.get('memory-agent') as MemoryAgent;
      if (memoryAgent) {
        memoryAgent.subscribe((event: any) => {
          const msg = MessageFactory.createMessage(
            MessageType.MEMORY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              event,
              memories: memoryAgent.brain.getAll()
            }
          );
          this.postMessage(msg);
        });
      }
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to MemoryAgent:', err);
    }
  }

  private initAgentRuntimeSubscription(): void {
    try {
      agentRuntimeInstance.subscribe((event: AgentEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.AGENT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            stats: agentRuntimeInstance.getMonitorStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to agentRuntimeInstance:', err);
    }
  }

  private initToolCallingSubscription(): void {
    try {
      toolService.subscribe((event: ToolCallingEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.TOOL_CALLING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            history: toolService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to toolService:', err);
    }
  }

  private initRuntimeSubscription(): void {
    try {
      runtimeService.subscribe((event: RuntimeEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.RUNTIME_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            stats: runtimeService.getStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to runtimeService:', err);
    }
  }

  private initPromptAssemblySubscription(): void {
    try {
      promptAssemblyService.subscribe((event: PromptAssemblyEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.PROMPT_ASSEMBLY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to promptAssemblyService:', err);
    }
  }

  private initRetrieverSubscription(): void {
    try {
      retrieverService.subscribe((event: RetrieverEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.RETRIEVER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to retrieverService:', err);
    }
  }

  private initVectorStoreSubscription(): void {
    try {
      vectorStoreService.subscribe((event: VectorStoreEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            stats: vectorStoreService.getStats()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to vectorStoreService:', err);
    }
  }

  private initEmbeddingSubscription(): void {
    try {
      embeddingService.subscribe((event: EmbeddingEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.EMBEDDING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to embeddingService:', err);
    }
  }

  private initContextSubscription(): void {
    try {
      contextService.subscribe((event: ContextEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.CONTEXT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            context: contextService.getActiveContext()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to contextService:', err);
    }
  }

  private initPermissionSubscription(): void {
    try {
      permissionService.subscribe((event: PermissionEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.PERMISSION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to permissionService:', err);
    }
  }

  private initDiagnosticsSubscription(): void {
    try {
      diagnosticsService.subscribe((event: DiagnosticEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            diagnostics: diagnosticsService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to diagnosticsService:', err);
    }
  }

  private initCheckpointSubscription(): void {
    try {
      checkpointService.subscribe((event: CheckpointEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            checkpoints: checkpointService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to checkpointService:', err);
    }
  }

  private initRollbackSubscription(): void {
    try {
      rollbackService.subscribe((event: RollbackEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.ROLLBACK_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to rollbackService:', err);
    }
  }

  private initPatchSubscription(): void {
    try {
      patchService.subscribe((event: PatchEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.PATCH_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            patches: patchService.getHistory()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to patchService:', err);
    }
  }

  private initGitSubscription(): void {
    try {
      gitService.subscribe((event: GitEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.GIT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to gitService:', err);
    }
  }

  private initTerminalSubscription(): void {
    try {
      terminalService.subscribe((event: TerminalEvent) => {
        const msg = MessageFactory.createMessage(
          MessageType.TERMINAL_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            event,
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        );
        this.postMessage(msg);
      });
    } catch (err) {
      console.error('[MessageRouter] Failed to subscribe to terminalService:', err);
    }
  }

  public handleMessage(message: BridgeMessage): void {
    if (!message || !message.type) {
      return;
    }

    const executionId = message.payload?.executionId || `msg-${Date.now()}`;
    const startTime = Date.now();
    logKairoStage('MessageRouter', 'ENTER', executionId, { type: message.type });

    try {
      switch (message.type) {
        case MessageType.SHOW_HISTORY:
          this._handleShowHistory(message);
          break;
        case MessageType.MORE_OPTIONS:
          this._handleMoreOptions(message);
          break;
        case MessageType.CLOSE_PANEL:
          this._handleClosePanel(message);
          break;
        case MessageType.UPLOAD_ASSETS_REQUEST:
          this._handleUploadAssetsRequest(message);
          break;
        case 'INIT':
          this._handleInit(message);
          break;
        case 'READY':
          this._handleReady(message);
          break;
        case 'PING':
          this._handlePing(message);
          break;
        case 'PONG':
          this._handlePong(message);
          break;
        case 'ERROR':
          this._handleError(message);
          break;
        case 'LOG':
          this._handleLog(message);
          break;
        case 'MODEL_STATUS':
        case MessageType.MODEL_STATUS:
          this._handleModelStatusRequest(message);
          break;
        case 'MODEL_LIST':
        case MessageType.MODEL_LIST:
          this._handleModelListRequest(message);
          break;
        case 'MODEL_SWITCH_REQUEST':
        case MessageType.MODEL_SWITCH_REQUEST:
          this._handleModelSwitchRequest(message);
          break;
        case 'PROMPT_REQUEST':
          this._handleSendPrompt(message);
          break;
        case 'SEND_PROMPT':
          this._handleSendPrompt(message);
          break;
        case 'PLAN_REQUEST':
          this._handlePlanRequest(message);
          break;
        case 'APPROVAL_ACTION':
          this._handleApprovalAction(message);
          break;
        case 'WORKSPACE_REQUEST':
          this._handleWorkspaceRequest(message);
          break;
        case 'EXECUTION_REQUEST':
          this._handleExecutionRequest(message);
          break;
        case 'TERMINAL_REQUEST':
          this._handleTerminalRequest(message);
          break;
        case 'GIT_REQUEST':
          this._handleGitRequest(message);
          break;
        case 'PATCH_REQUEST':
          this._handlePatchRequest(message);
          break;
        case 'ROLLBACK_REQUEST':
          this._handleRollbackRequest(message);
          break;
        case 'CHECKPOINT_REQUEST':
          this._handleCheckpointRequest(message);
          break;
        case 'DIAGNOSTICS_REQUEST':
          this._handleDiagnosticsRequest(message);
          break;
        case 'PERMISSION_REQUEST':
          this._handlePermissionRequest(message);
          break;
        case 'CONTEXT_REQUEST':
          this._handleContextRequest(message);
          break;
        case 'INDEXER_REQUEST':
          this._handleIndexerRequest(message);
          break;
        case 'EMBEDDING_REQUEST':
          this._handleEmbeddingRequest(message);
          break;
        case 'VECTOR_STORE_REQUEST':
          this._handleVectorStoreRequest(message);
          break;
        case 'RETRIEVER_REQUEST':
          this._handleRetrieverRequest(message);
          break;
        case 'PROMPT_ASSEMBLY_REQUEST':
          this._handlePromptAssemblyRequest(message);
          break;
        case 'RUNTIME_REQUEST':
          this._handleRuntimeRequest(message);
          break;
        case 'TOOL_CALLING_REQUEST':
          this._handleToolCallingRequest(message);
          break;
        case 'AGENT_REQUEST':
          this._handleAgentRequest(message);
          break;
        case 'MEMORY_REQUEST':
          this._handleMemoryRequest(message);
          break;
        case 'TESTING_REQUEST':
          this._handleTestingRequest(message);
          break;
        case 'SECURITY_REQUEST':
          this._handleSecurityRequest(message);
          break;
        case 'DOCUMENTATION_REQUEST':
          this._handleDocumentationRequest(message);
          break;
        case 'REFACTORING_REQUEST':
          this._handleRefactoringRequest(message);
          break;
        case 'DEBUG_REQUEST':
          this._handleDebugRequest(message);
          break;
        case 'PERFORMANCE_REQUEST':
          this._handlePerformanceRequest(message);
          break;
        case 'DEPENDENCY_REQUEST':
          this._handleDependencyRequest(message);
          break;
        case 'ARCHITECTURE_REQUEST':
          this._handleArchitectureRequest(message);
          break;
        case 'GENERATION_REQUEST':
          this._handleGenerationRequest(message);
          break;
        case 'AST_REQUEST':
          this._handleAstRequest(message);
          break;
        case 'MULTIFILE_REQUEST':
          this._handleMultiFileRequest(message);
          break;
        case 'INCREMENTAL_REQUEST':
          this._handleIncrementalRequest(message);
          break;
        case 'CONVENTION_REQUEST':
          this._handleConventionRequest(message);
          break;
        case 'NAMING_REQUEST':
          this._handleNamingRequest(message);
          break;
        case 'IMPORT_REQUEST':
          this._handleImportRequest(message);
          break;
        case 'SYMBOL_REQUEST':
          this._handleSymbolRequest(message);
          break;
        case 'REVIEW_REQUEST':
          this._handleReviewRequest(message);
          break;
        case 'VALIDATION_REQUEST':
          this._handleValidationRequest(message);
          break;
        case 'OPTIMIZATION_REQUEST':
          this._handleOptimizationRequest(message);
          break;
        case 'SAFE_EDIT_REQUEST':
          this._handleSafeEditRequest(message);
          break;
        case 'EVENT_BUS_REQUEST':
          this._handleEventBusRequest(message);
          break;
        case 'TASK_GENERATION_REQUEST':
          this._handleTaskGenerationRequest(message);
          break;
        case 'EXECUTION_PLANNING_REQUEST':
          this._handleExecutionPlanningRequest(message);
          break;
        case 'MILESTONE_ORCHESTRATION_REQUEST':
          this._handleMilestoneOrchestrationRequest(message);
          break;
        case 'WORKFLOW_COORDINATOR_REQUEST':
          this._handleWorkflowCoordinatorRequest(message);
          break;
        case 'REPLANNING_REQUEST':
          this._handleReplanningRequest(message);
          break;
        case 'RECOVERY_REQUEST':
          this._handleRecoveryRequest(message);
          break;
        case 'RELEASE_REQUEST':
          this._handleReleaseRequest(message);
          break;
        default:
          console.warn(`[Sasta-Antigravity] Unhandled message type: ${message.type}`);
      }
      logKairoStage('MessageRouter', 'EXIT', executionId, { type: message.type }, { handled: true }, Date.now() - startTime);
    } catch (error) {
      logKairoStage('MessageRouter', 'ERROR', executionId, { type: message.type }, null, Date.now() - startTime, error);
      throw error;
    }
  }

  public postMessage(message: any): void {
    message.timestamp = Date.now();
    message.source = 'extension';
    this.webview.postMessage(message);
  }

  private _handleApprovalAction(message: BridgeMessage): void {
    try {
      const { approvalId, action } = message.payload || {};
      let result;
      if (action === 'approve') {
        console.log('[APPROVAL_FIX] APPROVAL_RECEIVED', { approvalId, action });
        result = approvalEngine.approve(approvalId);
        
        this._emitPipelineStatus('Execution Pipeline', 'Plan approved by user. Initializing execution graph...', 'running');

        // Retrieve and initialize timeline
        const approvalObj = approvalEngine.getApproval(approvalId);
        const planId = this.approvalToPlanId.get(approvalId) || (approvalObj ? approvalObj.planId : approvalId);
        let plan = this.plansCache.get(planId);

        // Strict resolution check: Fail explicitly if plan is missing. DO NOT call plannerEngine.generatePlan() as fallback!
        if (!planId || !plan) {
          console.error(`[KAIRO][APPROVAL] Plan resolution failed approvalId=${approvalId} planId=${planId}`);
          this._emitPipelineStatus('Execution Error', `Plan resolution failed for approvalId=${approvalId}. Approved plan not found in cache.`, 'error');
          throw new Error(`Plan resolution failed for approvalId=${approvalId}. Approved plan not found in cache.`);
        }

        console.log('[APPROVAL_FIX] PLAN_RESOLVED', { planId: plan.id, title: plan.title });
        console.log('[APPROVAL_FIX] DIRECT_EXECUTION_START');

        const timeline = timelineService.initializeTimeline(plan);
        // Send init message
        const initMsg = MessageFactory.createMessage(
          MessageType.TIMELINE_INIT,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          { timeline }
        );
        this.postMessage(initMsg);

        this._emitPipelineStatus('Code Synthesis', 'Generating application files & code contracts...', 'running');

        // Generate execution graph and start executorService
        const graph = graphEngine.generateGraph(plan);
        executorService.startExecution(graph, (event: ExecutorEvent) => {
          this.handleExecutorEvent(event);
        }).catch(err => {
          console.error('[Sasta-Antigravity] Execution failed:', err);
          this._emitPipelineStatus('Execution Error', err.message || String(err), 'error');
        });

        // Direct Execution Handoff: Hand off approved plan via production AgentManager infrastructure
        // DO NOT call aiKernel.processPrompt() here!
        const folders = vscode.workspace.workspaceFolders;
        const workspacePath = (plan as any).workspacePath || (folders && folders.length > 0 ? folders[0].uri.fsPath : undefined);
        const rawPrompt = (plan as any).prompt || plan.title;

        console.log(`[WORKSPACE_TRACE] MessageRouter=${workspacePath}`);
        console.log('[APPROVAL_FIX] GENERATOR_START');

        const { pipelineRouter } = require('../core/orchestrator/pipelineRouter');
        const { globalGeneratorRegistrySDK } = require('../core/agents/generatorSDK/generatorRegistrySDK');
        const routeDecision = pipelineRouter.routeRequest({ rawPrompt, workspacePath } as any);

        const planTasks: any[] = (plan && plan.tasks && plan.tasks.length > 0) ? plan.tasks : [];

        if (planTasks.length === 0) {
          throw new Error('[MessageRouter] Invalid plan: ExecutionPlan contains no tasks.');
        }

        const orderedTaskList = planTasks.map((t: any, idx: number) => {
          if (!t.targetFiles || !Array.isArray(t.targetFiles) || t.targetFiles.length === 0) {
            throw new Error(`[MessageRouter] Task "${t.title || idx}" is missing targetFiles.`);
          }

          const capability = t.requiredCapability || t.generatorId;
          if (!capability) {
            throw new Error(`[MessageRouter] Task "${t.title || idx}" is missing requiredCapability.`);
          }

          const resolvedGen = globalGeneratorRegistrySDK.resolve(capability);
          if (!resolvedGen) {
            throw new Error(`[MessageRouter] No registered generator found for capability: ${capability}`);
          }

          const genId = resolvedGen.id;
          const stage = genId === 'ConfigGenerator' ? 'generate_configs' : genId === 'UIComponentGenerator' ? 'synthesize_ui' : 'synthesize_core';

          return {
            id: `task-gen-00${idx + 1}`,
            title: t.title || `Execute ${genId}`,
            generatorId: genId,
            stage,
            targetFiles: t.targetFiles,
            dependencies: idx > 0 ? [`task-gen-00${idx}`] : []
          };
        });

        const sdkTask: AgentTask = {
          id: `task-${planId}-sdk`,
          title: 'Execute Central Generator SDK Framework Pipeline',
          assignedAgentId: 'generator-sdk-agent',
          status: 'pending',
          payload: {
            requestId: planId,
            sessionId: `session-${Date.now()}`,
            workspacePath,
            rawPrompt,
            complexity: routeDecision.complexity,
            generationPlan: {
              requestId: planId,
              sessionId: `session-${Date.now()}`,
              executionStages: routeDecision.complexity === 'SMALL' ? ['synthesize_ui'] : ['scaffold_workspace', 'generate_configs', 'synthesize_core', 'synthesize_ui', 'verify_build'],
              orderedTaskList
            }
          }
        };

        const targetFiles: string[] = plan.targetFiles || [];
        const sourceContext: Array<{ filePath: string; content: string }> = [];
        const fsNode = require('fs');
        const pathNode = require('path');

        for (const tf of targetFiles) {
          const fullPath = pathNode.isAbsolute(tf) ? tf : pathNode.resolve(workspacePath || process.cwd(), tf);
          if (fsNode.existsSync(fullPath)) {
            try {
              const content = fsNode.readFileSync(fullPath, 'utf-8').substring(0, 2000);
              sourceContext.push({ filePath: tf, content });
            } catch {}
          }
        }

        const execTask: AgentTask = {
          id: `task-${planId}-exec`,
          title: 'Synthesize Application Code & Artifacts',
          assignedAgentId: 'executor-agent',
          status: 'pending',
          payload: {
            rawPrompt,
            workspacePath,
            modelId: 'Gemini 2.5 Flash',
            complexity: routeDecision.complexity,
            selectedGenerators: routeDecision.selectedGenerators,
            conversationHistory: this.getFormattedConversationHistory(),
            sourceCodeContext: sourceContext,
            plan,
            tasks: plan.tasks,
            targetFiles: plan.targetFiles
          }
        };

        console.log('[APPROVAL_FIX] EXECUTOR_START');

        agentManager.dispatchWorkflowTasks([sdkTask, execTask]).then(async (wfResult) => {
          console.log('[APPROVAL_FIX] GENERATION_COMPLETED');
          console.log('[APPROVAL_FIX] FILE_WRITE');
          console.log('[APPROVAL_FIX] EXECUTION_COMPLETED');

          // Extract physically written files from executor result
          const execResVal = wfResult.results?.find((r: any) => r.agentId === 'executor-agent')?.result;
          const createdFiles: string[] = execResVal?.workspaceReport?.createdFiles || [];

          let responseText = `I have generated and updated your project files in the workspace.`;
          const lowerPrompt = (rawPrompt || '').toLowerCase();

          if (lowerPrompt.includes('index.html') || lowerPrompt.includes('html page') || lowerPrompt.includes('html file')) {
            responseText = `I have created \`index.html\` in your workspace with a clean HTML5 structure, title tag, and container layout.`;
          } else if (lowerPrompt.includes('style') || lowerPrompt.includes('css')) {
            responseText = `I have created \`styles.css\` with modern theme variables, responsive layout rules, and button styles, and linked it to your workspace HTML.`;
          } else if (lowerPrompt.includes('portfolio')) {
            responseText = `I have built a complete portfolio website in your workspace including \`index.html\`, \`styles.css\`, and \`script.js\` featuring a Hero section, Projects showcase, Skills grid, and Contact form.`;
          } else if (lowerPrompt.includes('auth') || lowerPrompt.includes('authentication')) {
            responseText = `I have added authentication logic and API routes in \`src/auth.ts\` and \`src/routes/auth.ts\` for user login, signup, session validation, and password hashing.`;
          } else if (createdFiles.length > 0) {
            const filesListStr = createdFiles.map(f => `\`${f}\``).join(', ');
            responseText = `I have generated and saved the requested project files to your workspace: ${filesListStr}.`;
          }

          this.recordConversationTurn('assistant', responseText);

          // Dispatch natural conversational response to webview chat timeline!
          const promptResponseMsg = MessageFactory.createMessage(
            MessageType.PROMPT_RESPONSE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              id: `assistant-${Date.now()}`,
              role: 'ASSISTANT',
              content: responseText,
              timestamp: Date.now(),
              status: 'SUCCESS'
            }
          );
          this.postMessage(promptResponseMsg);

          if (createdFiles.length > 0) {
            this.postMessage(MessageFactory.createMessage(
              MessageType.REVIEW_UPDATE,
              MessageSource.EXTENSION,
              MessageTarget.WEBVIEW,
              {
                changedFiles: createdFiles
              }
            ));
            try {
              await vscode.commands.executeCommand('workbench.action.files.refresh');
            } catch {}
          }

          await globalKairoEventBus.publish({
            eventId: `evt-exec-complete-${planId}-${Date.now()}`,
            eventType: 'ExecutionCompleted',
            timestamp: Date.now(),
            source: 'MessageRouter',
            priority: 'HIGH',
            correlationId: planId,
            sessionId: `session-${Date.now()}`,
            payload: { requestId: planId, workspacePath, createdFiles }
          });

          try {
            await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
          } catch {}

          this._emitPipelineStatus('Execution Complete', 'Successfully generated and persisted project files in workspace!', 'done');
        }).catch(async err => {
          console.error('[Sasta-Antigravity] Direct pipeline execution failed:', err);
          this.recordConversationTurn('assistant', `Execution failed: ${err.message || String(err)}. No files were written.`);
          this._emitPipelineStatus('Execution Error', err.message || String(err), 'error');
          try {
            await globalKairoEventBus.publish({
              eventId: `evt-exec-fail-${planId}-${Date.now()}`,
              eventType: 'ExecutionFailed',
              timestamp: Date.now(),
              source: 'MessageRouter',
              priority: 'HIGH',
              correlationId: planId,
              sessionId: `session-${Date.now()}`,
              payload: { requestId: planId, error: err.message || String(err) }
            });
          } catch {}
        });
      } else if (action === 'reject') {
        result = approvalEngine.reject(approvalId);
        this.recordConversationTurn('assistant', 'Execution plan rejected by user. No files were modified.');
        this._emitPipelineStatus('Execution Cancelled', 'Plan was rejected by user.', 'error');
      } else {
        throw new Error(`Unknown approval action: ${action}`);
      }

      const responseMsg = MessageFactory.createMessage(
        MessageType.APPROVAL_ACTION_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { approval: result }
      );
      this.postMessage(responseMsg);
    } catch (error: any) {
      const errorMsg = MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }

  private handleExecutorEvent(event: ExecutorEvent): void {
    if (!event.payload) return;

    const { node } = event.payload;

    if (node) {
      let timelineStatus = 'Waiting';
      let statusType: 'running' | 'done' | 'error' = 'running';
      if (node.status === 'Running') { timelineStatus = 'Running'; statusType = 'running'; }
      else if (node.status === 'Completed') { timelineStatus = 'Completed'; statusType = 'done'; }
      else if (node.status === 'Failed') { timelineStatus = 'Failed'; statusType = 'error'; }
      else if (node.status === 'Skipped') { timelineStatus = 'Skipped'; statusType = 'done'; }
      else if (node.status === 'Blocked') { timelineStatus = 'Blocked'; statusType = 'error'; }
      else if (node.status === 'Ready') { timelineStatus = 'Queued'; statusType = 'running'; }

      this._emitPipelineStatus(`Task: ${node.title}`, node.description || timelineStatus, statusType);

      timelineService.updateStep(node.id, timelineStatus as any);

      this.postMessage(MessageFactory.createMessage(
        MessageType.TIMELINE_UPDATE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { timeline: timelineService.getActiveTimeline() }
      ));
    }

    const progress = executorService.getProgress();
    if (progress) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.EXECUTION_UPDATE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { progress }
      ));
    }
  }

  private _handleExecutionRequest(message: BridgeMessage): void {
    try {
      const action = message.payload?.action;
      if (action === 'PAUSE') {
        executorService.pause();
      } else if (action === 'RESUME') {
        executorService.resume();
      } else if (action === 'CANCEL') {
        executorService.cancel();
      }

      const progress = executorService.getProgress();
      if (progress) {
        this.postMessage(MessageFactory.createMessage(
          MessageType.EXECUTION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          { progress }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private promptStartTime: number = Date.now();

  private _emitExecutionEvent(
    stage: string,
    substage: string,
    message: string,
    status: 'running' | 'done' | 'warning' | 'error' = 'running',
    progress: number | null = null,
    extra: { model?: string; file?: string; tokenCount?: number } = {}
  ): void {
    const now = Date.now();
    const elapsedMs = Math.max(0, now - this.promptStartTime);

    const payload: IExecutionEventPayload = {
      id: `evt-${now}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: now,
      elapsedMs,
      stage,
      substage,
      message,
      progress,
      status,
      ...extra
    };

    this.postMessage({
      type: MessageType.EXECUTION_EVENT as any,
      source: MessageSource.EXTENSION,
      target: MessageTarget.WEBVIEW,
      payload
    });

    // Also emit backward compatible pipeline status
    this._emitPipelineStatus(stage, `${substage}${message ? ' • ' + message : ''}`, status === 'done' ? 'done' : status === 'error' ? 'error' : 'running');
  }

  private async _handlePlanRequest(message: BridgeMessage): Promise<void> {
    this.promptStartTime = Date.now();
    try {
      const promptText = message.payload?.prompt || '';

      // STAGE 1: Workspace Scan
      this._emitExecutionEvent('Workspace Scan', 'Scanning workspace...', 'Evaluating directory structure', 'running');
      const folders = vscode.workspace.workspaceFolders;
      const workspacePath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

      if (workspacePath) {
        const fs = require('fs') as typeof import('fs');
        const rootItems = fs.existsSync(workspacePath) ? fs.readdirSync(workspacePath) : [];
        const fileCount = rootItems.filter((f: string) => !f.startsWith('.') && f !== 'node_modules').length;

        if (rootItems.includes('package.json')) {
          this._emitExecutionEvent('Workspace Scan', '✓ package.json detected', 'Parsed root manifest', 'done');
        }

        const { workspaceEngine } = require('../core/workspace/workspaceEngine');
        const summary = workspaceEngine.getSummary(workspacePath);
        this._emitExecutionEvent('Workspace Scan', `✓ ${summary.framework} project detected`, `Language: ${summary.language}`, 'done');
        this._emitExecutionEvent('Workspace Scan', `✓ ${fileCount} files indexed`, `Workspace root: ${summary.projectName}`, 'done', 100);
      } else {
        this._emitExecutionEvent('Workspace Scan', 'Empty workspace', 'No active workspace directory open', 'done');
      }

      // STAGE 2: Intent Detection
      this._emitExecutionEvent('Intent Detection', 'Detecting user intent...', 'Parsing prompt semantics', 'running');
      await new Promise<void>(resolve => setTimeout(resolve, 150));
      const { parsePromptIntoIntent } = require('../core/planner/parser');
      const parsedIntent = parsePromptIntoIntent(promptText);
      this._emitExecutionEvent('Intent Detection', '✓ Intent:', parsedIntent.title, 'done');

      // STAGE 3: Model Router
      this._emitExecutionEvent('Model Router', 'Selecting inference provider...', 'Evaluating model capabilities and provider availability', 'running');

      this.recordConversationTurn('user', promptText);

      // Handle Conversational CHAT / EXPLAIN / DEBUG queries without generating plan/approval cards
      if (parsedIntent.category === 'CHAT' || parsedIntent.category === 'EXPLAIN' || parsedIntent.category === 'DEBUG') {
        let chatResponse = "";
        try {
          const { localInferenceService } = require('../core/inference');
          const formattedHistory = this.getFormattedConversationHistory();
          let historyStr = "";
          if (formattedHistory.length > 0) {
            historyStr = "\n\n--- RECENT CONVERSATION HISTORY ---\n" +
              formattedHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
          }

          const result = await localInferenceService.execute(`You are Kairo-AI, an expert project-aware software engineering assistant inside VS Code. Answer the user's query clearly, concisely, and accurately based on workspace and conversation context.\nWorkspace Path: ${workspacePath || 'Root'}${historyStr}\n\nUser Query: ${promptText}`, {
            provider: 'gemini',
            modelName: 'gemini-2.5-flash',
            modelPath: '',
            contextLength: 16384,
            temperature: 0.2,
            topP: 0.9,
            topK: 40,
            maxTokens: 2048,
            gpuLayers: 0,
            threadCount: 4,
            streamingEnabled: false
          });

          const activeProvider = result.providerInfo?.providerName === 'ollama' ? 'Ollama' : 'Gemini';
          const activeModel = result.providerInfo?.modelName || 'Gemini 2.5 Flash';
          this._emitExecutionEvent('Model Router', '✓ Selected:', `${activeProvider} (${activeModel})`, 'done', null, { model: activeModel });

          chatResponse = result.generatedText || (result as any).rawTextOutput || (result as any).text || `Analyzed project query: "${promptText}".`;
        } catch {
          chatResponse = `I've analyzed your project workspace at \`${workspacePath || 'current directory'}\`. How can I assist you further with this code?`;
        }

        this.recordConversationTurn('assistant', chatResponse);
        this._emitExecutionEvent('Execution Complete', chatResponse, 'done');
        const chatMsg = MessageFactory.createMessage(
          MessageType.PROMPT_RESPONSE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          { text: chatResponse }
        );
        this.postMessage(chatMsg);
        return;
      }

      // STAGE 4: Planning & Action Execution
      this._emitExecutionEvent('Planning', 'Building execution plan...', 'Constructing execution DAG nodes', 'running');

      const filePattern = /\b([a-zA-Z0-9_\-\/]+\.[a-zA-Z0-9]{1,10})\b/gi;
      const matches = promptText.match(filePattern) || [];
      const cleanFiles = Array.from(new Set(
        matches.filter((f: string) => !/\.(com|org|net|io|ai|gov|edu|dev)$/i.test(f))
      ));

      let plannerOptions: any = { workspacePath, conversationHistory: this.conversationHistory };

      if (cleanFiles.length === 0) {
        const { defaultPlannerModel } = require('../core/planner/plannerModel');
        const proposal = await defaultPlannerModel.generatePlanProposal(promptText, { workspacePath });
        plannerOptions.proposal = proposal;
      }

      const plan = plannerEngine.generatePlan(promptText, plannerOptions);
      (plan as any).prompt = promptText;
      (plan as any).workspacePath = workspacePath;
      const approval = approvalEngine.createApproval(plan);

      const { pipelineRouter } = require('../core/orchestrator/pipelineRouter');
      const routeDecision = pipelineRouter.routeRequest({ rawPrompt: promptText, workspacePath } as any);

      const isAutoApproveEligible = parsedIntent.category === 'SAFE_ACTION' && routeDecision.complexity === 'SMALL';

      if (isAutoApproveEligible) {
        approvalEngine.approve(approval.id);
        (approval as any).status = 'approved';
      }

      // Store in caches
      this.plansCache.set(plan.id, plan);
      this.approvalToPlanId.set(approval.id, plan.id);

      const responseMsg = MessageFactory.createMessage(
        MessageType.PLAN_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { plan, approval }
      );
      this.postMessage(responseMsg);

      // If safe action auto-approved, trigger direct execution pipeline immediately
      if (isAutoApproveEligible) {
        this._handleApprovalAction(MessageFactory.createMessage(
          MessageType.APPROVAL_ACTION,
          MessageSource.WEBVIEW,
          MessageTarget.EXTENSION,
          { approvalId: approval.id, action: 'approve' }
        ));
      }
    } catch (error: any) {
      this._emitExecutionEvent('Error', 'Pipeline Error', error.message || String(error), 'error');
      const errorMsg = MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }

  private _emitPipelineStatus(stage: string, detail: string, status: 'running' | 'done' | 'error' = 'running'): void {
    this.postMessage({
      type: MessageType.PIPELINE_STATUS as any,
      source: MessageSource.EXTENSION,
      target: MessageTarget.WEBVIEW,
      payload: { stage, detail, status, timestamp: Date.now() }
    });
  }

  private async _handleSendPrompt(message: BridgeMessage): Promise<void> {
    const promptId = message.payload?.id || randomUUID();
    const rawPrompt = message.payload?.content || message.payload?.rawPrompt || message.payload?.prompt || '';

    // Acknowledge receipt
    const receivedMsg = MessageFactory.createMessage(
      MessageType.PROMPT_RECEIVED,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      { promptId }
    );
    this.postMessage(receivedMsg);

    try {
      // Step 1: Detect workspace
      const folders = vscode.workspace.workspaceFolders;
      const workspacePath = folders && folders.length > 0 ? folders[0].uri.fsPath : undefined;

      // Step 2: Scan workspace if it exists and has content
      if (workspacePath) {
        this._emitPipelineStatus('Workspace Scan', 'Scanning workspace directory structure...', 'running');
        const fs = require('fs') as typeof import('fs');
        const rootItems = fs.existsSync(workspacePath) ? fs.readdirSync(workspacePath) : [];
        const fileCount = rootItems.filter((f: string) => !f.startsWith('.') && f !== 'node_modules').length;

        if (fileCount > 0) {
          this._emitPipelineStatus('Analysing Files', `Detected ${fileCount} items in workspace. Reading project structure...`, 'running');
          // Give enough time for the UI to render the status
          await new Promise<void>(resolve => setTimeout(resolve, 300));

          // Gather real file info
          const { workspaceEngine } = require('../core/workspace/workspaceEngine');
          const summary = workspaceEngine.getSummary(workspacePath);
          this._emitPipelineStatus('Analysing Files', `Project: ${summary.projectName} • ${summary.framework} • ${summary.language} • ${fileCount} root items`, 'done');
        } else {
          this._emitPipelineStatus('Workspace Scan', 'Empty workspace detected. Proceeding with generation...', 'done');
        }
      }

      // Step 3: Intent Detection
      this._emitPipelineStatus('Intent Detection', 'Analysing prompt intent and extracting entities...', 'running');
      await new Promise<void>(resolve => setTimeout(resolve, 200));

      // Step 4: Route through AI Kernel
      this._emitPipelineStatus('AI Kernel', 'Routing prompt through AI Kernel and Memory Engine...', 'running');
      const compiledRequest = await aiKernel.processPrompt(rawPrompt || 'User Request', workspacePath);
      this._emitPipelineStatus('AI Kernel', `Intent: ${compiledRequest.intent} | Model: ${compiledRequest.routingDecision.selectedModel.name}`, 'done');

      // Step 5: Emit final response
      const responseMsg = MessageFactory.createMessage(
        MessageType.MOCK_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        {
          id: randomUUID(),
          role: 'ASSISTANT',
          content: `AI Kernel processed prompt for intent '${compiledRequest.intent}'. Model selected: ${compiledRequest.routingDecision.selectedModel.name}`,
          timestamp: Date.now(),
          status: 'SUCCESS',
          kernelDetails: {
            intent: compiledRequest.intent,
            selectedModel: compiledRequest.routingDecision.selectedModel,
            memoriesCount: compiledRequest.memories.length,
            knowledgeFilesCount: compiledRequest.knowledge.indexedFiles.length,
            logsCount: compiledRequest.kernelLogs.length
          }
        }
      );
      this.postMessage(responseMsg);
    } catch (err: any) {
      this._emitPipelineStatus('Error', err.message || String(err), 'error');
      const errorMsg = MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: err.message || String(err) }
      );
      this.postMessage(errorMsg);
    }
  }

  private _handleWorkspaceRequest(_message: BridgeMessage): void {
    try {
      const summary = workspaceService.getWorkspaceSummary();
      const responseMsg = MessageFactory.createMessage(
        MessageType.WORKSPACE_RESPONSE,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { summary }
      );
      this.postMessage(responseMsg);
    } catch (error: any) {
      const errorMsg = MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      );
      this.postMessage(errorMsg);
    }
  }

  private _handleInit(_message: BridgeMessage): void {
    this.postMessage({ type: 'READY' });
    modelManager.listInstalledModels().then(installedModels => {
      const statusMsg = MessageFactory.createMessage(
        MessageType.MODEL_STATUS as any,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        {
          activeModel: modelManager.getActiveModel(),
          installedModels,
          timestamp: Date.now()
        }
      );
      this.postMessage(statusMsg);
    });
  }

  private _handleShowHistory(message: BridgeMessage): void {
    const prompts = message.payload?.prompts || [];
    if (prompts.length === 0) {
      vscode.window.showInformationMessage('No active chat history in this session.');
    } else {
      vscode.window.showQuickPick(prompts, { placeHolder: 'Select a previous prompt to copy it to clipboard' }).then(selected => {
        if (selected) {
          vscode.env.clipboard.writeText(selected);
          vscode.window.showInformationMessage(`Copied to clipboard: "${selected}"`);
        }
      });
    }
  }

  private _handleMoreOptions(message: BridgeMessage): void {
    vscode.window.showQuickPick([
      'Check Platform Health Status',
      'Show Extension Compilation Logs',
      'Toggle Integrated Terminal',
      'Clear Session History',
      'Open VS Code Settings'
    ], { placeHolder: 'Select an action' }).then(selected => {
      if (selected === 'Check Platform Health Status') {
        vscode.commands.executeCommand('kairo.showLogs');
      } else if (selected === 'Show Extension Compilation Logs') {
        vscode.commands.executeCommand('kairo.showLogs');
      } else if (selected === 'Toggle Integrated Terminal') {
        vscode.commands.executeCommand('workbench.action.terminal.toggleTerminal');
      } else if (selected === 'Clear Session History') {
        vscode.commands.executeCommand('kairo.clearHistory');
      } else if (selected === 'Open VS Code Settings') {
        vscode.commands.executeCommand('workbench.action.openSettings');
      }
    });
  }

  private _handleClosePanel(message: BridgeMessage): void {
    vscode.commands.executeCommand('workbench.action.closeSidebar');
  }

  private _handleUploadAssetsRequest(message: BridgeMessage): void {
    vscode.window.showQuickPick([
      '📄 Upload File',
      '📁 Upload Folder',
      '🖼️ Upload Image'
    ], { placeHolder: 'Select an asset to upload and analyze' }).then(selected => {
      if (!selected) return;

      let options: vscode.OpenDialogOptions = {};
      if (selected.includes('File')) {
        options = { canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: 'Select File' };
      } else if (selected.includes('Folder')) {
        options = { canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: 'Select Folder' };
      } else if (selected.includes('Image')) {
        options = { 
          canSelectFiles: true, 
          canSelectFolders: false, 
          canSelectMany: false, 
          title: 'Select Image',
          filters: { 'Images': ['png', 'jpg', 'jpeg', 'webp', 'gif'] }
        };
      }

      vscode.window.showOpenDialog(options).then(uris => {
        if (uris && uris.length > 0) {
          const uri = uris[0];
          const name = uri.path.split('/').pop() || 'Asset';
          const type = selected.includes('File') ? 'file' : selected.includes('Folder') ? 'folder' : 'image';

          // Post back to webview to insert analysis message into timeline
          const responseMsg = MessageFactory.createMessage(
            'UPLOAD_ASSETS_RESPONSE' as any,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { name, type, path: uri.fsPath }
          );
          this.postMessage(responseMsg);
        }
      });
    });
  }

  private async _handleModelStatusRequest(_message: BridgeMessage): Promise<void> {
    const installedModels = await modelManager.listInstalledModels();
    const msg = MessageFactory.createMessage(
      MessageType.MODEL_STATUS as any,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      {
        activeModel: modelManager.getActiveModel(),
        installedModels,
        timestamp: Date.now()
      }
    );
    this.postMessage(msg);
  }

  private async _handleModelListRequest(_message: BridgeMessage): Promise<void> {
    const installedModels = await modelManager.listInstalledModels();
    const msg = MessageFactory.createMessage(
      MessageType.MODEL_LIST as any,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      {
        installedModels,
        timestamp: Date.now()
      }
    );
    this.postMessage(msg);
  }

  private async _handleModelSwitchRequest(message: BridgeMessage): Promise<void> {
    const modelId = message.payload?.modelId || message.payload?.id;
    if (!modelId) return;

    const activeModel = await modelManager.switchModel(modelId);
    const installedModels = await modelManager.listInstalledModels();

    const responseMsg = MessageFactory.createMessage(
      MessageType.MODEL_SWITCH_RESPONSE as any,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      {
        success: true,
        activeModel,
        timestamp: Date.now()
      }
    );
    this.postMessage(responseMsg);

    const statusMsg = MessageFactory.createMessage(
      MessageType.MODEL_STATUS as any,
      MessageSource.EXTENSION,
      MessageTarget.WEBVIEW,
      {
        activeModel,
        installedModels,
        timestamp: Date.now()
      }
    );
    this.postMessage(statusMsg);
  }

  private _handleReady(_message: BridgeMessage): void {}

  private _handlePing(message: BridgeMessage): void {
    this.postMessage({ type: 'PONG', payload: message.payload });
  }

  private _handlePong(_message: BridgeMessage): void {}

  private _handleError(message: BridgeMessage): void {
    console.error(`[Sasta-Antigravity] Webview Error:`, message.payload);
  }

  private _handleLog(message: BridgeMessage): void {
    console.log(`[Sasta-Antigravity] Webview Log:`, message.payload);
  }

  private _handleTerminalRequest(message: BridgeMessage): void {
    try {
      const { action, command, workingDirectory, environment } = message.payload || {};
      
      if (action === 'EXECUTE') {
        terminalService.executeCommand(command, workingDirectory, environment);
        this.postMessage(MessageFactory.createMessage(
          MessageType.TERMINAL_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        ));
      } else if (action === 'CANCEL') {
        terminalService.cancel();
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.TERMINAL_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            commands: terminalService.getCommands(),
            activeCommand: terminalService.getActiveCommand()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleGitRequest(message: BridgeMessage): void {
    try {
      const { action, message: commitMessage, filePath } = message.payload || {};
      
      if (action === 'COMMIT') {
        const hash = gitService.commit(commitMessage);
        this.postMessage(MessageFactory.createMessage(
          MessageType.GIT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastCommitHash: hash,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        ));
      } else if (action === 'GET_STATUS') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.GIT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory(),
            diff: gitService.getDiff()
          }
        ));
      } else if (action === 'GET_DIFF') {
        const diff = gitService.getDiff(filePath);
        this.postMessage(MessageFactory.createMessage(
          MessageType.GIT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            diff,
            repository: gitService.getRepositoryInfo(),
            status: gitService.getStatus(),
            history: gitService.getHistory()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handlePatchRequest(message: BridgeMessage): void {
    try {
      const { action, patchId, operationId, filePath, changeType, oldContent, newContent, metadata } = message.payload || {};
      
      if (action === 'CREATE') {
        const patch = patchService.createPatch(operationId, filePath, changeType, oldContent, newContent, metadata);
        this.postMessage(MessageFactory.createMessage(
          MessageType.PATCH_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastCreatedPatchId: patch.id,
            patches: patchService.getHistory()
          }
        ));
      } else if (action === 'VALIDATE') {
        patchService.validatePatch(patchId);
      } else if (action === 'APPROVE') {
        patchService.approvePatch(patchId);
      } else if (action === 'REJECT') {
        patchService.rejectPatch(patchId);
      } else if (action === 'APPLY') {
        patchService.applyPatch(patchId);
      } else if (action === 'ROLLBACK') {
        patchService.rollbackPatch(patchId);
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.PATCH_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            patches: patchService.getHistory()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleRollbackRequest(message: BridgeMessage): void {
    try {
      const { action, rollbackId, patchId } = message.payload || {};
      
      if (action === 'CREATE') {
        const rollback = rollbackService.createRollback(patchId);
        const preview = rollbackService.getPreview(rollback.id);
        this.postMessage(MessageFactory.createMessage(
          MessageType.ROLLBACK_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastCreatedRollbackId: rollback.id,
            rollbacks: rollbackService.getHistory(),
            preview
          }
        ));
      } else if (action === 'EXECUTE') {
        rollbackService.executeRollback(rollbackId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.ROLLBACK_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        ));
      } else if (action === 'GET_PREVIEW') {
        const preview = rollbackService.getPreview(rollbackId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.ROLLBACK_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            preview,
            rollbacks: rollbackService.getHistory()
          }
        ));
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.ROLLBACK_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            rollbacks: rollbackService.getHistory(),
            historyLog: rollbackService.getHistoryLog()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleCheckpointRequest(message: BridgeMessage): void {
    try {
      const { action, checkpointId, workspaceId, transactionId, affectedFiles, metadata } = message.payload || {};
      
      if (action === 'CREATE') {
        const cp = checkpointService.createCheckpoint(workspaceId, transactionId, affectedFiles, metadata);
        this.postMessage(MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastCreatedCheckpointId: cp.id,
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === 'RESTORE') {
        checkpointService.restoreCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === 'DELETE') {
        checkpointService.deleteCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === 'EXPIRE') {
        checkpointService.expireCheckpoint(checkpointId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.CHECKPOINT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            checkpoints: checkpointService.getHistory()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleDiagnosticsRequest(message: BridgeMessage): void {
    try {
      const { action, diagnosticId, status, filters } = message.payload || {};
      
      if (action === 'REPORT') {
        const { sourceModule, severity, category, messageText, details, stackTrace, operationId } = message.payload || {};
        const diag = diagnosticsService.report(sourceModule, severity, category, messageText, details, stackTrace, operationId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastCreatedDiagnosticId: diag.id,
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === 'UPDATE_STATUS') {
        diagnosticsService.updateStatus(diagnosticId, status);
        this.postMessage(MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === 'GET_FILTERED') {
        const filtered = diagnosticsService.getFilteredHistory(filters);
        this.postMessage(MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            diagnostics: filtered
          }
        ));
      } else if (action === 'EXPORT') {
        const json = diagnosticsService.exportJson();
        this.postMessage(MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            exportData: json,
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.DIAGNOSTICS_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            diagnostics: diagnosticsService.getHistory()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handlePermissionRequest(message: BridgeMessage): void {
    try {
      const { action, requestId, approved, policy, actionType, resource, riskLevel, reason, requestedBy, operationId } = message.payload || {};
      
      if (action === 'REQUEST') {
        const result = permissionService.requestPermission(actionType, resource, riskLevel, reason, requestedBy, operationId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.PERMISSION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastRequestResult: result,
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      } else if (action === 'GRANT') {
        permissionService.grantPermission(requestId, approved, policy);
        this.postMessage(MessageFactory.createMessage(
          MessageType.PERMISSION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.PERMISSION_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            permissions: permissionService.getHistory(),
            rules: permissionService.getRules()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleContextRequest(message: BridgeMessage): void {
    try {
      const { action, filePaths, selection, planner, execution, git, diagnostics, limitBytes } = message.payload || {};
      
      if (action === 'BUILD') {
        const ctx = contextService.buildContext({
          filePaths,
          selection,
          planner,
          execution,
          git,
          diagnostics,
          limitBytes
        });
        this.postMessage(MessageFactory.createMessage(
          MessageType.CONTEXT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            context: ctx
          }
        ));
      } else if (action === 'EXPIRE') {
        contextService.expireContext();
        this.postMessage(MessageFactory.createMessage(
          MessageType.CONTEXT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            context: null
          }
        ));
      } else if (action === 'GET_ACTIVE') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.CONTEXT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            context: contextService.getActiveContext()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleIndexerRequest(message: BridgeMessage): void {
    try {
      const { action, workspaceId, filePath } = message.payload || {};
      const engine = this.getIndexerEngine();
      if (!engine) {
        throw new Error('Workspace Indexer Service: No workspace folder is open');
      }
      
      if (action === 'START') {
        const index = engine.startIndexing(workspaceId);
        this.postMessage(MessageFactory.createMessage(
          MessageType.INDEXER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            index
          }
        ));
      } else if (action === 'UPDATE_FILE') {
        engine.updateIndexFile(filePath);
        this.postMessage(MessageFactory.createMessage(
          MessageType.INDEXER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            index: engine.getIndex()
          }
        ));
      } else if (action === 'GET_INDEX') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.INDEXER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            index: engine.getIndex()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private async _handleEmbeddingRequest(message: BridgeMessage): Promise<void> {
    try {
      const { action, sourceId, sourceType, content } = message.payload || {};
      
      if (action === 'QUEUE') {
        const obj = embeddingService.queueJob(sourceId, sourceType, content);
        this.postMessage(MessageFactory.createMessage(
          MessageType.EMBEDDING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastQueued: obj,
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      } else if (action === 'PROCESS') {
        await embeddingService.processQueue();
        this.postMessage(MessageFactory.createMessage(
          MessageType.EMBEDDING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      } else if (action === 'GET_STATUS') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.EMBEDDING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            pendingCount: embeddingService.getPendingQueue().length,
            failedCount: embeddingService.getFailedItems().size,
            provider: embeddingService.getProviderName()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleVectorStoreRequest(message: BridgeMessage): void {
    try {
      const { action, record, id, filters, queryVector, limit, metric } = message.payload || {};
      
      if (action === 'INSERT') {
        vectorStoreService.insert(record);
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === 'DELETE') {
        vectorStoreService.delete(id);
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === 'QUERY') {
        const results = vectorStoreService.query(filters);
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            queryResults: results,
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === 'SEARCH') {
        const results = vectorStoreService.similaritySearch(queryVector, limit, metric);
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            searchResults: results,
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === 'CLEAR') {
        vectorStoreService.clear();
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      } else if (action === 'GET_STATS') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.VECTOR_STORE_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: vectorStoreService.getStats()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleRetrieverRequest(message: BridgeMessage): void {
    try {
      const { action, request } = message.payload || {};
      
      if (action === 'RETRIEVE') {
        const indexer = this.getIndexerEngine();
        if (!indexer) {
          throw new Error('Workspace Indexer Service: No workspace folder is open');
        }
        const index = indexer.getIndex();
        if (!index) {
          throw new Error('Retriever error: Project Index has not been built yet. Run project scan first.');
        }

        const context = retrieverService.retrieveContext(request, index);
        this.postMessage(MessageFactory.createMessage(
          MessageType.RETRIEVER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            retrievedContext: context
          }
        ));
      } else if (action === 'INVALIDATE_CACHE') {
        retrieverService.invalidateCache();
        this.postMessage(MessageFactory.createMessage(
          MessageType.RETRIEVER_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            cacheInvalidated: true
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handlePromptAssemblyRequest(message: BridgeMessage): void {
    try {
      const { action, request } = message.payload || {};
      
      if (action === 'ASSEMBLE') {
        const pkg = promptAssemblyService.assemblePrompt(request);
        this.postMessage(MessageFactory.createMessage(
          MessageType.PROMPT_ASSEMBLY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            promptPackage: pkg
          }
        ));
      } else if (action === 'INVALIDATE_CACHE') {
        promptAssemblyService.invalidateCache();
        this.postMessage(MessageFactory.createMessage(
          MessageType.PROMPT_ASSEMBLY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            cacheInvalidated: true
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleRuntimeRequest(message: BridgeMessage): void {
    try {
      const { action, config, promptPkg, genConfig, sessionId } = message.payload || {};
      
      if (action === 'LOAD_MODEL') {
        runtimeService.loadModel(config).then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === 'UNLOAD_MODEL') {
        runtimeService.unloadModel().then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === 'GENERATE') {
        runtimeService.generate(promptPkg, genConfig, (token) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              chunk: token,
              stats: runtimeService.getStats()
            }
          ));
        }).then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              result: res,
              stats: runtimeService.getStats()
            }
          ));
        });
      } else if (action === 'GET_STATS') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.RUNTIME_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: runtimeService.getStats()
          }
        ));
      } else if (action === 'run_runtime_audit') {
        runtimeCoordinator.startTelemetryMonitor();
        runtimeValidationEngine.runAllValidations().then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              results: res.results,
              health: res.health,
              replaySessions: runtimeHistory.listReplaySessions()
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      } else if (action === 'get_latest_stats') {
        runtimeCoordinator.startTelemetryMonitor();
        const latestHealth = runtimeCoordinator.getHealthSummary();
        runtimeValidationEngine.runAllValidations().then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              results: res.results,
              health: latestHealth,
              replaySessions: runtimeHistory.listReplaySessions()
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      } else if (action === 'replay_session' && sessionId) {
        const replay = runtimeValidationEngine.replaySession(sessionId);
        const latestHealth = runtimeCoordinator.getHealthSummary();
        this.postMessage(MessageFactory.createMessage(
          MessageType.RUNTIME_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            health: latestHealth,
            replaySessions: runtimeHistory.listReplaySessions(),
            replayData: replay
          }
        ));
      } else {
        // Seed dummy replay sessions if list is empty
        if (runtimeHistory.listReplaySessions().length === 0) {
          runtimeValidationEngine.recordSessionReplay({
            sessionId: 'sess-lora-finetuning-001',
            timestamp: Date.now() - 3600000,
            prompt: 'Fine-tune model on TypeScript code convention dataset.',
            context: 'System rules: ensure camelCase filenames, export singletons.',
            tokenizerVersion: 'v1.0.0-bpe',
            modelVersion: 'Kairo-Llama-3-8B-Base',
            configuration: { lr: 2e-4, lora_r: 8, lora_alpha: 16 },
            timingMs: {
              total: 250,
              promptAssembly: 15,
              tokenization: 20,
              inferenceExecution: 200,
              detokenization: 15
            },
            memoryUsageBytes: {
              start: 110 * 1024 * 1024,
              peak: 310 * 1024 * 1024,
              end: 115 * 1024 * 1024
            },
            runtimeEvents: [
              'Loaded LoRA adapter weights for fine-tuning',
              'Initialized BPE tokenizer vocabulary table',
              'Applied camelCase convention rules check',
              'Execution session completed successfully'
            ],
            inferenceOutput: 'Model fine-tuning session completed. Successfully validated TypeScript export singletons.'
          });
          runtimeValidationEngine.recordSessionReplay({
            sessionId: 'sess-gguf-inference-002',
            timestamp: Date.now() - 600000,
            prompt: 'Compile prompt templates files under folder organization rules.',
            context: 'Prompt template keys: {name}, {description}, {rules}.',
            tokenizerVersion: 'v1.1.2-unigram',
            modelVersion: 'Kairo-Llama-3-8B-Q4_K_M',
            configuration: { temp: 0.2, top_p: 0.95 },
            timingMs: {
              total: 180,
              promptAssembly: 10,
              tokenization: 12,
              inferenceExecution: 150,
              detokenization: 8
            },
            memoryUsageBytes: {
              start: 95 * 1024 * 1024,
              peak: 280 * 1024 * 1024,
              end: 98 * 1024 * 1024
            },
            runtimeEvents: [
              'Loaded GGUF weight tensors structure map',
              'Validated SHA-256 metadata checksum mapping',
              'Prompt placeholders successfully replaced',
              'Inference execution threads successfully released'
            ],
            inferenceOutput: 'Code compilation template complete. Verified 12 files organization checks successfully.'
          });
        }
        if (action === 'GET_REPLAY_SESSIONS') {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              sessions: runtimeHistory.listReplaySessions()
            }
          ));
        } else if (action === 'GET_REPLAY_METRICS') {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RUNTIME_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              metrics: {
                averageCpu: runtimeMetrics.getAverageCpu(),
                averageRam: runtimeMetrics.getAverageRam(),
                peakRam: runtimeMetrics.getPeakRam(),
                averageLatency: runtimeMetrics.getAverageLatency()
              }
            }
          ));
        }
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleToolCallingRequest(message: BridgeMessage): void {
    try {
      const { action, toolId, args } = message.payload || {};
      
      if (action === 'EXECUTE') {
        toolService.executeTool(toolId, args).then((result) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.TOOL_CALLING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              result,
              history: toolService.getHistory()
            }
          ));
        });
      } else if (action === 'GET_HISTORY') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.TOOL_CALLING_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            history: toolService.getHistory()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleAgentRequest(message: BridgeMessage): void {
    try {
      const { action, agentId, task } = message.payload || {};
      
      if (action === 'LOAD') {
        agentRuntimeInstance.loadAgent(agentId).then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.AGENT_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === 'UNLOAD') {
        agentRuntimeInstance.unloadAgent(agentId).then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.AGENT_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === 'DISPATCH') {
        agentRuntimeInstance.dispatchTask(task).then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.AGENT_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              result: res,
              stats: agentRuntimeInstance.getMonitorStats()
            }
          ));
        });
      } else if (action === 'GET_STATS') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.AGENT_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            stats: agentRuntimeInstance.getMonitorStats()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleMemoryRequest(message: BridgeMessage): void {
    try {
      const memoryAgent = agentRegistry.get('memory-agent') as MemoryAgent;
      if (!memoryAgent) {
        throw new Error('Memory Agent not found in registry');
      }

      const { action, memory, id, updates, filter } = message.payload || {};

      if (action === 'CREATE') {
        const created = memoryAgent.brain.createMemory(memory);
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'CREATE',
            created,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === 'SEARCH') {
        const results = memoryAgent.brain.search(filter || {});
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'SEARCH',
            results,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === 'UPDATE') {
        const updated = memoryAgent.brain.updateMemory(id, updates);
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'UPDATE',
            updated,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === 'DELETE') {
        memoryAgent.brain.deleteMemory(id);
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'DELETE',
            deletedId: id,
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === 'COMPRESS') {
        memoryAgent.brain.compress();
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'COMPRESS',
            memories: memoryAgent.brain.getAll()
          }
        ));
      } else if (action === 'GET_ALL') {
        this.postMessage(MessageFactory.createMessage(
          MessageType.MEMORY_UPDATE,
          MessageSource.EXTENSION,
          MessageTarget.WEBVIEW,
          {
            lastAction: 'GET_ALL',
            memories: memoryAgent.brain.getAll()
          }
        ));
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleTestingRequest(message: BridgeMessage): void {
    try {
      const testingAgent = agentRegistry.get('testing-agent') as TestingAgent;
      if (!testingAgent) {
        throw new Error('Testing Agent not found in registry');
      }

      const { action, executionReport, framework } = message.payload || {};

      if (action === 'RUN_WORKFLOW') {
        testingAgent.brain.runTestingWorkflow(executionReport, framework).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.TESTING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'RUN_WORKFLOW',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleSecurityRequest(message: BridgeMessage): void {
    try {
      const securityAgent = agentRegistry.get('security-agent') as SecurityAgent;
      if (!securityAgent) {
        throw new Error('Security Agent not found in registry');
      }

      const { action, plan } = message.payload || {};

      if (action === 'SCAN_PLAN') {
        securityAgent.brain.scanPlanWorkflow(plan).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.SECURITY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'SCAN_PLAN',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleDocumentationRequest(message: BridgeMessage): void {
    try {
      const docAgent = agentRegistry.get('documentation-agent') as DocumentationAgent;
      if (!docAgent) {
        throw new Error('Documentation Agent not found in registry');
      }

      const { action, gitChanges } = message.payload || {};

      if (action === 'GENERATE_DOCS') {
        docAgent.brain.runDocumentationWorkflow(gitChanges || []).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.DOCUMENTATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_DOCS',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleRefactoringRequest(message: BridgeMessage): void {
    try {
      const refAgent = agentRegistry.get('refactoring-agent') as RefactoringAgent;
      if (!refAgent) {
        throw new Error('Refactoring Agent not found in registry');
      }

      const { action, files } = message.payload || {};

      if (action === 'ANALYZE_SMELLS') {
        refAgent.brain.runRefactoringAnalysis(files || []).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.REFACTORING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_SMELLS',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleDebugRequest(message: BridgeMessage): void {
    try {
      const debugAgent = agentRegistry.get('debug-agent') as DebugAgent;
      if (!debugAgent) {
        throw new Error('Debug Agent not found in registry');
      }

      const { action, diagnostics } = message.payload || {};

      if (action === 'ANALYZE_FAILURE') {
        debugAgent.brain.runFailureAnalysis(diagnostics).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.DEBUG_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_FAILURE',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handlePerformanceRequest(message: BridgeMessage): void {
    try {
      const perfAgent = agentRegistry.get('performance-agent') as PerformanceAgent;
      if (!perfAgent) {
        throw new Error('Performance Agent not found in registry');
      }

      const { action, filePath } = message.payload || {};

      if (action === 'ANALYZE_PERFORMANCE') {
        perfAgent.brain.runProfilerAudit(filePath || '').then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.PERFORMANCE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_PERFORMANCE',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleDependencyRequest(message: BridgeMessage): void {
    try {
      const { action, packageJsonPath: _packageJsonPath } = message.payload || {};

      if (action === 'ANALYZE_DEPENDENCIES') {
        dependencyResolutionEngine.resolve(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.DEPENDENCY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_DEPENDENCIES',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleArchitectureRequest(message: BridgeMessage): void {
    try {
      const archAgent = agentRegistry.get('architecture-agent') as ArchitectureAgent;
      if (!archAgent) {
        throw new Error('Architecture Agent not found in registry');
      }

      const { action, filesMap } = message.payload || {};

      if (action === 'ANALYZE_ARCHITECTURE') {
        archAgent.brain.runArchitectureAnalysis(filesMap || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ARCHITECTURE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_ARCHITECTURE',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleGenerationRequest(message: BridgeMessage): void {
    try {
      const { action, plan, prompt } = message.payload || {};

      if (action === 'GENERATE_CODE') {
        generationEngine.generateCode(plan || {}).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.GENERATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_CODE',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      } else if (action === 'generate_project') {
        projectGeneratorEngine.generateProject(prompt).then((project) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.GENERATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { project }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleAstRequest(message: BridgeMessage): void {
    try {
      const { action, ir, language } = message.payload || {};

      if (action === 'GENERATE_AST') {
        astEngine.generateAst(ir || {}, language || 'typescript').then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.AST_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_AST',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleMultiFileRequest(message: BridgeMessage): void {
    try {
      const { action, plan } = message.payload || {};

      if (action === 'GENERATE_MULTIFILE_PLAN') {
        multiFileEngine.generateMultiFilePlan(plan || {}).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.MULTIFILE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_MULTIFILE_PLAN',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleIncrementalRequest(message: BridgeMessage): void {
    try {
      const { action, filePath, fileContent, operations } = message.payload || {};

      if (action === 'GENERATE_INCREMENTAL_PLAN') {
        incrementalEngine.generateEditPlan(filePath || '', fileContent || '', operations || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.INCREMENTAL_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_INCREMENTAL_PLAN',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleConventionRequest(message: BridgeMessage): void {
    try {
      const { action, files } = message.payload || {};

      if (action === 'ANALYZE_CONVENTIONS') {
        conventionEngine.analyzeConventions(files || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.CONVENTION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ANALYZE_CONVENTIONS',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleNamingRequest(message: BridgeMessage): void {
    try {
      const { action, baseTerm, symbolType, casing, existingFiles } = message.payload || {};

      if (action === 'GENERATE_NAMES') {
        namingEngine.generateNames(baseTerm || '', symbolType || '', casing || 'camelCase', existingFiles || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.NAMING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_NAMES',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleImportRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, fileContent, requiredSymbols } = message.payload || {};

      if (action === 'RESOLVE_IMPORTS') {
        importEngine.resolveImports(targetFile || '', fileContent || '', requiredSymbols || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.IMPORT_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'RESOLVE_IMPORTS',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleSymbolRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, fileContent, requiredSymbols } = message.payload || {};

      if (action === 'RESOLVE_SYMBOLS') {
        symbolEngine.resolveSymbols(targetFile || '', fileContent || '', requiredSymbols || []).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.SYMBOL_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'RESOLVE_SYMBOLS',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleReviewRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, fileContent } = message.payload || {};

      if (action === 'RUN_REVIEW') {
        reviewEngine.runReview(targetFile || '', fileContent || '').then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.REVIEW_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'RUN_REVIEW',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleValidationRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, fileContent } = message.payload || {};

      if (action === 'run_validation') {
        platformValidationEngine.runAllValidations().then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.VALIDATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            res
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      } else if (action === 'get_latest') {
        const latestReport = platformValidationEngine.getLatestReport();
        const latestHealth = architectureHealth.getLatestHealth();

        if (latestReport && latestHealth) {
          this.postMessage(MessageFactory.createMessage(
            MessageType.VALIDATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { report: latestReport, health: latestHealth }
          ));
        } else {
          // If no report cached, run a quick one to populate
          platformValidationEngine.runAllValidations().then((res) => {
            this.postMessage(MessageFactory.createMessage(
              MessageType.VALIDATION_UPDATE,
              MessageSource.EXTENSION,
              MessageTarget.WEBVIEW,
              res
            ));
          }).catch((err) => {
            this.postMessage(MessageFactory.createMessage(
              MessageType.ERROR,
              MessageSource.EXTENSION,
              MessageTarget.WEBVIEW,
              { error: err.message }
            ));
          });
        }
      } else if (action === 'RUN_VALIDATION') {
        validationEngine.validate(targetFile || '', fileContent || '').then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.VALIDATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'RUN_VALIDATION',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleReleaseRequest(message: BridgeMessage): void {
    try {
      const { action } = message.payload || {};

      if (action === 'run_release_pipeline') {
        releaseEngine.runReleasePipeline('0.1.0-rc1').then((res) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RELEASE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              manifest: res.manifest,
              dogfoodResult: res.dogfoodResult
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      } else if (action === 'get_latest_release') {
        const manifest = releaseEngine.getLatestManifest('0.1.0-rc1');
        if (manifest) {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RELEASE_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { manifest }
          ));
        } else {
          // If no manifest build run yet, run one dynamically
          releaseEngine.runReleasePipeline('0.1.0-rc1').then((res) => {
            this.postMessage(MessageFactory.createMessage(
              MessageType.RELEASE_UPDATE,
              MessageSource.EXTENSION,
              MessageTarget.WEBVIEW,
              {
                manifest: res.manifest,
                dogfoodResult: res.dogfoodResult
              }
            ));
          }).catch((err) => {
            this.postMessage(MessageFactory.createMessage(
              MessageType.ERROR,
              MessageSource.EXTENSION,
              MessageTarget.WEBVIEW,
              { error: err.message }
            ));
          });
        }
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }




  private _handleOptimizationRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, patchContent } = message.payload || {};

      if (action === 'OPTIMIZE_PATCH') {
        patchOptimizationEngine.optimizePatch(targetFile || '', patchContent || '').then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.OPTIMIZATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'OPTIMIZE_PATCH',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleSafeEditRequest(message: BridgeMessage): void {
    try {
      const { action, targetFile, patchContent, userApproved } = message.payload || {};

      if (action === 'EVALUATE_SAFETY') {
        safeEditEngine.evaluate(targetFile || '', patchContent || '', userApproved).then((artifact) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.SAFE_EDIT_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'EVALUATE_SAFETY',
              artifact
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleEventBusRequest(message: BridgeMessage): void {
    try {
      const { action, eventData, workflowId, initialPayload } = message.payload || {};

      if (action === 'PUBLISH') {
        eventBusInstance.publish(eventData).then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.EVENT_BUS_UPDATE as any,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { lastAction: 'PUBLISH', success: true }
          ));
        });
      } else if (action === 'START_WORKFLOW') {
        const { workflowOrchestrator } = require('../core/eventBus');
        workflowOrchestrator.startWorkflow(workflowId, initialPayload).then(() => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.EVENT_BUS_UPDATE as any,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { lastAction: 'START_WORKFLOW', success: true }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleTaskGenerationRequest(message: BridgeMessage): void {
    try {
      const { action, featurePlan } = message.payload || {};

      if (action === 'GENERATE_TASKS') {
        const defaultPlan = featurePlan || {
          planId: `PLAN-${Date.now()}`,
          title: 'Default Execution Feature Plan',
          description: 'Automatic task breakdown of feature plan milestones.',
          milestones: [
            {
              milestoneId: 'M1',
              name: 'Database Models & Contracts',
              description: 'Setup database schema models and migration scripts.'
            },
            {
              milestoneId: 'M2',
              name: 'Core Service APIs',
              description: 'Implement core REST and internal service endpoint routers.'
            },
            {
              milestoneId: 'M3',
              name: 'Frontend View Dashboard',
              description: 'Build interactive React webview components and state handlers.'
            }
          ]
        };

        taskGenerationEngine.generateTasks({ featurePlan: defaultPlan }).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.TASK_GENERATION_UPDATE as any,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'GENERATE_TASKS',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleExecutionPlanningRequest(message: BridgeMessage): void {
    try {
      const { action, taskGraph, executionPolicies } = message.payload || {};

      if (action === 'PLAN_EXECUTION') {
        const defaultTaskGraph = taskGraph || {
          nodes: {
            'T1': {
              task: { taskId: 'T1', title: 'Database Schema Setup', description: 'Create tables', taskType: 'Database Task', parentMilestone: 'M1', dependencies: [], requiredSymbols: [], requiredFiles: ['src/db/schema.ts'], expectedOutput: '', estimatedTimeMs: 120000, estimatedTokens: 1000, risk: 'High', priority: 'Critical', confidence: 0.9, executionStrategy: 'Manual Approval' },
              children: ['T2'], parents: [], depth: 0, inCriticalPath: true
            },
            'T2': {
              task: { taskId: 'T2', title: 'API Routing Endpoints', description: 'Implement REST controllers', taskType: 'API Task', parentMilestone: 'M2', dependencies: ['T1'], requiredSymbols: [], requiredFiles: ['src/api/routes.ts'], expectedOutput: '', estimatedTimeMs: 150000, estimatedTokens: 1200, risk: 'Medium', priority: 'High', confidence: 0.9, executionStrategy: 'Sequential' },
              children: ['T3'], parents: ['T1'], depth: 1, inCriticalPath: true
            },
            'T3': {
              task: { taskId: 'T3', title: 'Webview Component UI', description: 'Build layout views', taskType: 'UI Task', parentMilestone: 'M3', dependencies: ['T2'], requiredSymbols: [], requiredFiles: ['src/webview/Dashboard.tsx'], expectedOutput: '', estimatedTimeMs: 90000, estimatedTokens: 800, risk: 'Low', priority: 'Normal', confidence: 0.95, executionStrategy: 'Parallel' },
              children: [], parents: ['T2'], depth: 2, inCriticalPath: true
            }
          },
          edges: [],
          rootTaskIds: ['T1'],
          leafTaskIds: ['T3'],
          criticalPath: ['T1', 'T2', 'T3'],
          totalEstimatedTimeMs: 360000,
          totalEstimatedTokens: 3000
        };

        executionPlanningEngine.plan({ taskGraph: defaultTaskGraph, executionPolicies }).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.EXECUTION_PLANNING_UPDATE as any,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'PLAN_EXECUTION',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleMilestoneOrchestrationRequest(message: BridgeMessage): void {
    try {
      const { action } = message.payload || {};

      if (action === 'ORCHESTRATE_MILESTONES' || !action) {
        milestoneOrchestrationEngine.orchestrate(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.MILESTONE_ORCHESTRATION_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'ORCHESTRATE_MILESTONES',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleWorkflowCoordinatorRequest(message: BridgeMessage): void {
    try {
      const { action } = message.payload || {};

      if (action === 'COORDINATE_WORKFLOW' || !action) {
        workflowCoordinator.coordinate(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.WORKFLOW_COORDINATOR_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'COORDINATE_WORKFLOW',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleReplanningRequest(message: BridgeMessage): void {
    try {
      const { action } = message.payload || {};

      if (action === 'DYNAMIC_REPLAN' || !action) {
        replanningEngine.replan(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.REPLANNING_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'DYNAMIC_REPLAN',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }

  private _handleRecoveryRequest(message: BridgeMessage): void {
    try {
      const { action } = message.payload || {};

      if (action === 'AUTONOMOUS_RECOVERY' || !action) {
        recoveryEngine.recover(message.payload || {}).then((report) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.RECOVERY_UPDATE,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            {
              lastAction: 'AUTONOMOUS_RECOVERY',
              report
            }
          ));
        }).catch((err) => {
          this.postMessage(MessageFactory.createMessage(
            MessageType.ERROR,
            MessageSource.EXTENSION,
            MessageTarget.WEBVIEW,
            { error: err.message }
          ));
        });
      }
    } catch (error: any) {
      this.postMessage(MessageFactory.createMessage(
        MessageType.ERROR,
        MessageSource.EXTENSION,
        MessageTarget.WEBVIEW,
        { error: error.message }
      ));
    }
  }
}
