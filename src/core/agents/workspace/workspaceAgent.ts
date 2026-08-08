import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { IArchitectureBlueprint } from '../architecture/architectureTypes';
import {
  IWorkspaceBlueprint,
  IWorkspaceAgentLog,
  WorkspaceAgentStage,
  WorkspaceClassification,
  IPackageDefinition
} from './workspaceTypes';

export class WorkspaceAgent extends BaseAgent {
  private logs: IWorkspaceAgentLog[] = [];
  private listeners: Array<(log: IWorkspaceAgentLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public getLogs(): readonly IWorkspaceAgentLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IWorkspaceAgentLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IWorkspaceAgentLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[WorkspaceAgent] Error in log listener:', err);
      }
    }
  }

  /**
   * Primary entry point called by AgentManager.
   * Analyzes Architecture Blueprint, detects workspace classification, plans AI vs user ownership areas, and builds IWorkspaceBlueprint.
   */
  public async executeTask(task: AgentTask): Promise<{ success: boolean; blueprint: IWorkspaceBlueprint }> {
    this.status = AgentStatus.Running;
    const startTime = Date.now();
    const payload = task.payload || {};
    const archBp: IArchitectureBlueprint | undefined = payload.architectureBlueprint || payload.architectureResult?.blueprint;

    const requestId = archBp?.requestId || payload.requestId || task.id;
    const sessionId = archBp?.sessionId || payload.sessionId || `session-${Date.now()}`;
    const workspacePath = payload.workspacePath || '.';

    // STAGE 1: WORKSPACE ANALYSIS STARTED
    this.emitLog({
      stage: 'WORKSPACE_ANALYSIS_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Workspace analysis started for path '${workspacePath}'`,
      details: { requestId, sessionId, workspacePath }
    });

    // STAGE 2: EXISTING WORKSPACE DETECTION
    const workspaceType = this.detectWorkspaceType(workspacePath, payload);
    this.emitLog({
      stage: 'EXISTING_WORKSPACE_DETECTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Detected workspace classification as '${workspaceType}'`,
      details: { requestId, sessionId, workspaceType, workspacePath }
    });

    // STAGE 3: REPOSITORY PLANNING
    const repositoryLayout = {
      rootPath: workspacePath,
      isMonorepo: workspaceType === 'Monorepo' || workspaceType === 'Multi-root Workspace',
      packageManager: payload.packageManager || 'npm'
    };

    this.emitLog({
      stage: 'REPOSITORY_PLANNING',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Planned repository layout (Monorepo: ${repositoryLayout.isMonorepo})`,
      details: { requestId, sessionId, repositoryLayout }
    });

    // STAGE 4: PACKAGE PLANNING
    const packageStructure = this.planPackages(archBp, repositoryLayout.isMonorepo);
    const folderHierarchy = archBp?.folderLayout || this.planFolderHierarchy(archBp);
    const sharedLibraries = archBp?.sharedLibraries || ['@app/common/utils', '@app/common/types'];
    const configurationMap = {
      typescript: 'tsconfig.json',
      package: 'package.json',
      build: 'vite.config.ts',
      environment: '.env.example'
    };

    this.emitLog({
      stage: 'PACKAGE_PLANNING',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Planned ${packageStructure.length} workspace packages and configurations`,
      details: {
        requestId,
        sessionId,
        packagesCount: packageStructure.length,
        configsCount: Object.keys(configurationMap).length
      }
    });

    // STAGE 5: OWNERSHIP ASSIGNMENT
    const aiManagedAreas = [
      'src/components/',
      'src/services/',
      'src/data/',
      'src/common/',
      'dist/'
    ];
    const userManagedAreas = [
      'user_config/',
      'custom_hooks/',
      '.env',
      'README.md'
    ];

    this.emitLog({
      stage: 'OWNERSHIP_ASSIGNMENT',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Assigned AI-managed (${aiManagedAreas.length}) and User-managed (${userManagedAreas.length}) workspace areas`,
      details: {
        requestId,
        sessionId,
        aiAreasCount: aiManagedAreas.length,
        userAreasCount: userManagedAreas.length
      }
    });

    // STAGE 6: WORKSPACE VALIDATION
    const isValid = packageStructure.length > 0;
    const validationErrors: string[] = [];
    if (!isValid) validationErrors.push('No packages planned for workspace');

    this.emitLog({
      stage: 'WORKSPACE_VALIDATION',
      timestamp: Date.now(),
      status: isValid ? 'SUCCESS' : 'FAILED',
      message: isValid ? 'Workspace layout validation passed successfully' : 'Workspace layout validation failed',
      details: {
        requestId,
        sessionId,
        validationStatus: isValid ? 'PASSED' : 'FAILED'
      }
    });

    // STAGE 7: WORKSPACE BLUEPRINT GENERATED
    const buildStructure = {
      outputDirectory: 'dist',
      scripts: {
        build: 'npm run compile',
        test: 'npm test',
        dev: 'npm run dev'
      }
    };

    const blueprint: IWorkspaceBlueprint = {
      requestId,
      sessionId,
      workspaceType,
      repositoryLayout: Object.freeze(repositoryLayout),
      packageStructure: Object.freeze(packageStructure),
      folderHierarchy: Object.freeze(folderHierarchy),
      sharedLibraries: Object.freeze(sharedLibraries),
      configurationMap: Object.freeze(configurationMap),
      buildStructure: Object.freeze(buildStructure),
      aiManagedAreas: Object.freeze(aiManagedAreas),
      userManagedAreas: Object.freeze(userManagedAreas),
      validationStatus: isValid ? 'PASSED' : 'FAILED',
      validationErrors: isValid ? undefined : Object.freeze(validationErrors),
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0'
      })
    };

    this.emitLog({
      stage: 'WORKSPACE_BLUEPRINT_GENERATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Complete Workspace Blueprint generated`,
      details: {
        requestId,
        sessionId,
        workspaceType,
        validationStatus: blueprint.validationStatus
      }
    });

    // STAGE 8: BLUEPRINT RETURNED
    this.emitLog({
      stage: 'BLUEPRINT_RETURNED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Returning Workspace Blueprint to Agent Manager`,
      details: {
        requestId,
        sessionId,
        executionTimeMs: Date.now() - startTime
      }
    });

    this.status = isValid ? AgentStatus.Completed : AgentStatus.Failed;

    return {
      success: isValid,
      blueprint
    };
  }

  private detectWorkspaceType(workspacePath: string, payload: any): WorkspaceClassification {
    if (payload.isEmptyWorkspace) return 'Empty Workspace';
    if (payload.isMonorepo) return 'Monorepo';
    if (payload.isMultiRoot) return 'Multi-root Workspace';
    if (workspacePath.includes('test') || workspacePath.includes('project')) return 'Single Project';
    return 'Existing Project';
  }

  private planPackages(archBp?: IArchitectureBlueprint, isMonorepo?: boolean): IPackageDefinition[] {
    if (isMonorepo) {
      return [
        { name: '@app/web', path: 'apps/web', type: 'application', isAiManaged: true },
        { name: '@app/api', path: 'apps/api', type: 'application', isAiManaged: true },
        { name: '@app/common', path: 'packages/common', type: 'shared_library', isAiManaged: true }
      ];
    }

    return [
      { name: 'app-core', path: 'src/', type: 'application', isAiManaged: true },
      { name: 'app-shared', path: 'src/common/', type: 'shared_library', isAiManaged: true }
    ];
  }

  private planFolderHierarchy(archBp?: IArchitectureBlueprint): Record<string, any> {
    return {
      src: {
        components: {},
        services: {},
        data: {},
        common: {},
        index: 'file'
      }
    };
  }
}
