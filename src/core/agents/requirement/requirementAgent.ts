import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { IRequirementObject, IRequirementAgentLog, RequirementStage } from './requirementTypes';

export class RequirementAgent extends BaseAgent {
  private logs: IRequirementAgentLog[] = [];
  private listeners: Array<(log: IRequirementAgentLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public getLogs(): readonly IRequirementAgentLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IRequirementAgentLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IRequirementAgentLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[RequirementAgent] Error in log listener:', err);
      }
    }
  }

  /**
   * Primary entry point called by AgentManager.
   * Analyzes prompt payload, creates validated IRequirementObject, and returns it.
   */
  public async executeTask(task: AgentTask): Promise<{ success: boolean; requirementObject: IRequirementObject }> {
    this.status = AgentStatus.Running;
    const startTime = Date.now();
    const payload = task.payload || {};
    const rawPrompt: string = payload.rawPrompt || payload.query || task.title || '';
    const requestId: string = payload.requestId || task.id;
    const sessionId: string = payload.sessionId || `session-${Date.now()}`;

    // STAGE 1: PROMPT RECEIVED
    this.emitLog({
      stage: 'PROMPT_RECEIVED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Requirement Agent received prompt request (${rawPrompt.length} chars)`,
      details: { requestId, sessionId, promptLength: rawPrompt.length }
    });

    // STAGE 2: REQUIREMENT ANALYSIS STARTED
    this.emitLog({
      stage: 'REQUIREMENT_ANALYSIS_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Analyzing user prompt for structural requirement extraction`,
      details: { requestId, sessionId }
    });

    // Analyze prompt and extract structured attributes
    const userIntent = payload.intent || this.extractUserIntent(rawPrompt);
    const projectCategory = this.extractProjectCategory(rawPrompt, payload);
    const projectScope = this.extractProjectScope(rawPrompt, projectCategory);
    const features = this.extractFeatures(rawPrompt);
    const constraints = this.extractConstraints(rawPrompt);
    const preferredStack = this.extractPreferredStack(rawPrompt, payload);
    const priority = payload.priority || 'HIGH';
    const estimatedComplexity = this.estimateComplexity(rawPrompt, features);
    const expectedDeliverables = ['Source Code Scaffolding', 'Build Configuration', 'Project Documentation'];

    // STAGE 3: REQUIREMENT OBJECT CREATED
    const draftRequirementObject: IRequirementObject = {
      requestId,
      sessionId,
      userIntent,
      projectCategory,
      projectScope,
      features: Object.freeze(features),
      constraints: Object.freeze(constraints),
      preferredStack: Object.freeze(preferredStack),
      priority,
      estimatedComplexity,
      expectedDeliverables: Object.freeze(expectedDeliverables),
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0',
        rawPromptLength: rawPrompt.length
      }),
      validationStatus: 'PASSED'
    };

    this.emitLog({
      stage: 'REQUIREMENT_OBJECT_CREATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Structured Requirement Object formulated for intent '${userIntent}'`,
      details: {
        requestId,
        sessionId,
        intent: userIntent,
        category: projectCategory,
        complexity: estimatedComplexity,
        featuresCount: features.length
      }
    });

    // STAGE 4: VALIDATION PASSED / FAILED
    const validationErrors = this.validateRequirementObject(draftRequirementObject);
    const isValid = validationErrors.length === 0;

    const requirementObject: IRequirementObject = {
      ...draftRequirementObject,
      validationStatus: isValid ? 'PASSED' : 'FAILED',
      validationErrors: isValid ? undefined : Object.freeze(validationErrors)
    };

    if (isValid) {
      this.emitLog({
        stage: 'VALIDATION_PASSED',
        timestamp: Date.now(),
        status: 'SUCCESS',
        message: `Requirement Object validation passed successfully`,
        details: { requestId, sessionId }
      });
    } else {
      this.emitLog({
        stage: 'VALIDATION_FAILED',
        timestamp: Date.now(),
        status: 'FAILED',
        message: `Requirement Object validation failed: ${validationErrors.join(', ')}`,
        details: { requestId, sessionId, errors: validationErrors }
      });
    }

    // STAGE 5: RESULT RETURNED
    this.emitLog({
      stage: 'RESULT_RETURNED',
      timestamp: Date.now(),
      status: isValid ? 'SUCCESS' : 'FAILED',
      message: `Returning validated Requirement Object to Agent Manager`,
      details: {
        requestId,
        sessionId,
        executionTimeMs: Date.now() - startTime,
        validationStatus: requirementObject.validationStatus
      }
    });

    this.status = isValid ? AgentStatus.Completed : AgentStatus.Failed;

    return {
      success: isValid,
      requirementObject
    };
  }

  private extractUserIntent(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('todo') || lower.includes('task')) return 'Web Application / Todo Manager';
    if (lower.includes('calculator')) return 'Web Application / Calculator';
    if (lower.includes('api') || lower.includes('rest') || lower.includes('express')) return 'Backend REST API Service';
    if (lower.includes('cli') || lower.includes('command line')) return 'CLI Tool Application';
    return 'Software Application Development';
  }

  private extractProjectCategory(prompt: string, payload: any): string {
    if (payload.techStack?.frontend || payload.intent?.includes('Web')) return 'Web/Frontend';
    const lower = prompt.toLowerCase();
    if (lower.includes('react') || lower.includes('html') || lower.includes('css') || lower.includes('vue')) return 'Web/Frontend';
    if (lower.includes('express') || lower.includes('nest') || lower.includes('api')) return 'Web/API';
    if (lower.includes('mobile') || lower.includes('react native')) return 'Mobile';
    return 'Web/Fullstack';
  }

  private extractProjectScope(prompt: string, category: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('simple') || lower.includes('basic')) return 'Single Page Application';
    if (lower.includes('full') || lower.includes('complete') || lower.includes('enterprise')) return 'Fullstack System';
    return `${category} Module`;
  }

  private extractFeatures(prompt: string): string[] {
    const features: string[] = [];
    const lower = prompt.toLowerCase();
    if (lower.includes('add') || lower.includes('create')) features.push('Item Creation');
    if (lower.includes('delete') || lower.includes('remove')) features.push('Item Deletion');
    if (lower.includes('edit') || lower.includes('update')) features.push('Item Editing');
    if (lower.includes('filter') || lower.includes('search')) features.push('Filtering & Search');
    if (lower.includes('auth') || lower.includes('login')) features.push('User Authentication');
    if (features.length === 0) features.push('Core Functional Module');
    return features;
  }

  private extractConstraints(prompt: string): string[] {
    const constraints: string[] = [];
    const lower = prompt.toLowerCase();
    if (lower.includes('no tailwind')) constraints.push('Avoid TailwindCSS');
    if (lower.includes('offline')) constraints.push('Offline Local Execution');
    if (lower.includes('typescript')) constraints.push('Strict Type Checking');
    return constraints;
  }

  private extractPreferredStack(prompt: string, payload: any): {
    language: string | null;
    frontend: string | null;
    backend: string | null;
    database: string | null;
    buildTool: string | null;
  } {
    const lower = prompt.toLowerCase();
    return {
      language: lower.includes('typescript') ? 'TypeScript' : lower.includes('javascript') ? 'JavaScript' : 'TypeScript',
      frontend: lower.includes('react') ? 'React' : lower.includes('vue') ? 'Vue' : lower.includes('html') ? 'HTML/CSS' : 'React',
      backend: lower.includes('express') ? 'Express' : lower.includes('node') ? 'Node.js' : null,
      database: lower.includes('mongo') ? 'MongoDB' : lower.includes('postgres') ? 'PostgreSQL' : lower.includes('sqlite') ? 'SQLite' : null,
      buildTool: lower.includes('vite') ? 'Vite' : lower.includes('webpack') ? 'Webpack' : 'Vite'
    };
  }

  private estimateComplexity(prompt: string, features: string[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'COMPLEX' {
    if (features.length > 4 || prompt.length > 200) return 'HIGH';
    if (features.length > 2 || prompt.length > 80) return 'MEDIUM';
    return 'LOW';
  }

  private validateRequirementObject(obj: IRequirementObject): string[] {
    const errors: string[] = [];
    if (!obj.requestId) errors.push('Missing Request ID');
    if (!obj.sessionId) errors.push('Missing Session ID');
    if (!obj.userIntent) errors.push('Missing User Intent');
    if (!obj.projectCategory) errors.push('Missing Project Category');
    return errors;
  }
}
