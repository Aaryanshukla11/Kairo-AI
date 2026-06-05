import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { IRequirementObject } from '../requirement/requirementTypes';
import {
  IProjectIntelligenceReport,
  IProjectIntelligenceLog,
  ProjectIntelligenceStage,
  ProjectTypeClassification
} from './projectIntelligenceTypes';

export class ProjectIntelligenceAgent extends BaseAgent {
  private logs: IProjectIntelligenceLog[] = [];
  private listeners: Array<(log: IProjectIntelligenceLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public getLogs(): readonly IProjectIntelligenceLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IProjectIntelligenceLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IProjectIntelligenceLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[ProjectIntelligenceAgent] Error in log listener:', err);
      }
    }
  }

  /**
   * Primary entry point called by AgentManager.
   * Analyzes Requirement Object, performs architecture/stack classification, and builds IProjectIntelligenceReport.
   */
  public async executeTask(task: AgentTask): Promise<{ success: boolean; report: IProjectIntelligenceReport }> {
    this.status = AgentStatus.Running;
    const startTime = Date.now();
    const payload = task.payload || {};
    const reqObj: IRequirementObject | undefined = payload.requirementObject || payload.requirementResult?.requirementObject;

    const requestId = reqObj?.requestId || payload.requestId || task.id;
    const sessionId = reqObj?.sessionId || payload.sessionId || `session-${Date.now()}`;
    const intent = reqObj?.userIntent || payload.intent || task.title || '';
    const rawPrompt = payload.rawPrompt || intent;

    // STAGE 1: INTELLIGENCE ANALYSIS STARTED
    this.emitLog({
      stage: 'INTELLIGENCE_ANALYSIS_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Project Intelligence analysis started for request '${requestId}'`,
      details: { requestId, sessionId, intent }
    });

    // STAGE 2: PROJECT CLASSIFICATION
    const projectType = this.classifyProjectType(rawPrompt, reqObj);
    this.emitLog({
      stage: 'PROJECT_CLASSIFICATION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Project classified as '${projectType}'`,
      details: { requestId, sessionId, projectType }
    });

    // STAGE 3: STACK RECOMMENDATION
    const suggestedTechStack = this.recommendTechStack(reqObj, rawPrompt);
    const suggestedArchitecture = this.recommendArchitecture(projectType, reqObj?.projectCategory, suggestedTechStack);

    this.emitLog({
      stage: 'STACK_RECOMMENDATION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Recommended architecture '${suggestedArchitecture}' and stack`,
      details: {
        requestId,
        sessionId,
        architecture: suggestedArchitecture,
        techStack: suggestedTechStack
      }
    });

    // STAGE 4: DEPENDENCY ANALYSIS
    const requiredModules = this.determineRequiredModules(reqObj, suggestedTechStack);
    const dependencyList = this.determineDependencies(suggestedTechStack, requiredModules);

    this.emitLog({
      stage: 'DEPENDENCY_ANALYSIS',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Identified ${requiredModules.length} required modules and ${dependencyList.length} dependencies`,
      details: {
        requestId,
        sessionId,
        modulesCount: requiredModules.length,
        dependenciesCount: dependencyList.length
      }
    });

    // STAGE 5: INTELLIGENCE REPORT CREATED
    const estimatedComplexity = reqObj?.estimatedComplexity || 'MEDIUM';
    const riskAssessment = this.assessRisks(projectType, estimatedComplexity, dependencyList);
    const missingInformation = this.identifyMissingInformation(reqObj, rawPrompt);
    const recommendedExecutionStrategy = this.determineExecutionStrategy(projectType);

    const report: IProjectIntelligenceReport = {
      requestId,
      sessionId,
      projectType,
      suggestedArchitecture,
      suggestedTechStack: Object.freeze(suggestedTechStack),
      requiredModules: Object.freeze(requiredModules),
      dependencyList: Object.freeze(dependencyList),
      estimatedComplexity,
      riskAssessment: Object.freeze(riskAssessment),
      missingInformation: Object.freeze(missingInformation),
      recommendedExecutionStrategy,
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0'
      })
    };

    this.emitLog({
      stage: 'INTELLIGENCE_REPORT_CREATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Structured Project Intelligence Report created successfully`,
      details: {
        requestId,
        sessionId,
        projectType,
        strategy: recommendedExecutionStrategy,
        risksCount: riskAssessment.length
      }
    });

    // STAGE 6: REPORT RETURNED
    this.emitLog({
      stage: 'REPORT_RETURNED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Returning Project Intelligence Report to Agent Manager`,
      details: {
        requestId,
        sessionId,
        executionTimeMs: Date.now() - startTime
      }
    });

    this.status = AgentStatus.Completed;

    return {
      success: true,
      report
    };
  }

  private classifyProjectType(prompt: string, reqObj?: IRequirementObject): ProjectTypeClassification {
    const lower = prompt.toLowerCase();
    if (lower.includes('fix') || lower.includes('bug') || lower.includes('error')) return 'Bug Fix';
    if (lower.includes('refactor') || lower.includes('clean')) return 'Refactoring';
    if (lower.includes('add') || lower.includes('update') || lower.includes('feature')) return 'Feature Update';
    if (lower.includes('existing') || lower.includes('legacy')) return 'Existing Project';
    return 'New Project';
  }

  private recommendTechStack(reqObj?: IRequirementObject, prompt: string = ''): {
    language: string;
    frontend: string | null;
    backend: string | null;
    database: string | null;
    buildTool: string | null;
  } {
    const pref = reqObj?.preferredStack;
    const lower = prompt.toLowerCase();

    return {
      language: pref?.language || (lower.includes('javascript') ? 'JavaScript' : 'TypeScript'),
      frontend: pref?.frontend || (lower.includes('react') ? 'React' : lower.includes('vue') ? 'Vue' : 'HTML/CSS'),
      backend: pref?.backend || (lower.includes('express') ? 'Express' : lower.includes('node') ? 'Node.js' : null),
      database: pref?.database || (lower.includes('mongo') ? 'MongoDB' : lower.includes('postgres') ? 'PostgreSQL' : null),
      buildTool: pref?.buildTool || 'Vite'
    };
  }

  private recommendArchitecture(projectType: ProjectTypeClassification, category: string = '', stack: any): string {
    if (category.includes('API') || stack.backend) return 'RESTful Layered Service Architecture';
    if (projectType === 'Refactoring') return 'Clean Modular Architecture';
    return 'Component-Driven Single Page Application (SPA)';
  }

  private determineRequiredModules(reqObj?: IRequirementObject, stack?: any): string[] {
    const modules: string[] = ['CoreAppModule'];
    if (reqObj?.features.some(f => f.toLowerCase().includes('auth'))) modules.push('AuthModule');
    if (stack?.database) modules.push('DataAccessModule');
    if (stack?.frontend) modules.push('UIComponentModule');
    modules.push('UtilityServiceModule');
    return modules;
  }

  private determineDependencies(stack: any, modules: string[]): string[] {
    const deps: string[] = [];
    if (stack.language === 'TypeScript') deps.push('typescript');
    if (stack.frontend === 'React') deps.push('react', 'react-dom');
    if (stack.buildTool === 'Vite') deps.push('vite');
    if (stack.backend === 'Express') deps.push('express');
    if (stack.database === 'MongoDB') deps.push('mongoose');
    if (stack.database === 'PostgreSQL') deps.push('pg');
    return deps;
  }

  private assessRisks(projectType: ProjectTypeClassification, complexity: string, deps: string[]): string[] {
    const risks: string[] = [];
    if (complexity === 'HIGH' || complexity === 'COMPLEX') risks.push('High Architectural Complexity');
    if (deps.length > 5) risks.push('Multiple Third-Party Dependency Integrations');
    if (projectType === 'Existing Project') risks.push('Potential Regressions on Existing Base');
    if (risks.length === 0) risks.push('Low Operational Risk');
    return risks;
  }

  private identifyMissingInformation(reqObj?: IRequirementObject, prompt: string = ''): string[] {
    const missing: string[] = [];
    if (!reqObj?.preferredStack.database && prompt.toLowerCase().includes('data')) {
      missing.push('Database preference unspecified');
    }
    if (!reqObj?.preferredStack.backend && prompt.toLowerCase().includes('api')) {
      missing.push('Backend framework unspecified');
    }
    return missing;
  }

  private determineExecutionStrategy(projectType: ProjectTypeClassification): 'full_project' | 'file_modification' | 'api_only' | 'refactor_module' {
    if (projectType === 'Bug Fix' || projectType === 'Feature Update') return 'file_modification';
    if (projectType === 'Refactoring') return 'refactor_module';
    return 'full_project';
  }
}
