import { BaseAgent } from '../base/baseAgent';
import { AgentDefinition, AgentTask, AgentStatus } from '../agentTypes';
import { IProjectIntelligenceReport } from '../projectIntelligence/projectIntelligenceTypes';
import {
  IEngineeringDecisionReport,
  IEngineeringDecisionLog,
  EngineeringDecisionStage,
  IDatabaseDecision,
  IAuthenticationDecision,
  IApiDecision,
  IBuildStrategy,
  ITestingStrategy,
  IFolderStructureStrategy,
  ICodingStandards
} from './engineeringDecisionTypes';

export class EngineeringDecisionAgent extends BaseAgent {
  private logs: IEngineeringDecisionLog[] = [];
  private listeners: Array<(log: IEngineeringDecisionLog) => void> = [];

  constructor(definition: AgentDefinition) {
    super(definition);
  }

  public getLogs(): readonly IEngineeringDecisionLog[] {
    return Object.freeze([...this.logs]);
  }

  public clearHistory(): void {
    this.logs = [];
  }

  public subscribe(listener: (log: IEngineeringDecisionLog) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emitLog(stageLog: IEngineeringDecisionLog): void {
    this.logs.push(stageLog);
    for (const listener of this.listeners) {
      try {
        listener(stageLog);
      } catch (err) {
        console.error('[EngineeringDecisionAgent] Error in log listener:', err);
      }
    }
  }

  /**
   * Primary entry point called by AgentManager.
   * Analyzes Project Intelligence Report, resolves engineering decisions & conflicts, and builds IEngineeringDecisionReport.
   */
  public async executeTask(task: AgentTask): Promise<{ success: boolean; report: IEngineeringDecisionReport }> {
    this.status = AgentStatus.Running;
    const startTime = Date.now();
    const payload = task.payload || {};
    const intelReport: IProjectIntelligenceReport | undefined = payload.projectIntelligenceReport || payload.intelligenceResult?.report;

    const requestId = intelReport?.requestId || payload.requestId || task.id;
    const sessionId = intelReport?.sessionId || payload.sessionId || `session-${Date.now()}`;
    const rawPrompt = payload.rawPrompt || task.title || '';

    // STAGE 1: DECISION ANALYSIS STARTED
    this.emitLog({
      stage: 'DECISION_ANALYSIS_STARTED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Engineering Decision analysis started for request '${requestId}'`,
      details: { requestId, sessionId }
    });

    // STAGE 2: TECHNOLOGY SELECTION
    const selectedTechStack = this.selectTechStack(intelReport, rawPrompt);
    const selectedFrameworks = this.selectFrameworks(selectedTechStack);

    this.emitLog({
      stage: 'TECHNOLOGY_SELECTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Selected primary language '${selectedTechStack.language}' and frameworks`,
      details: {
        requestId,
        sessionId,
        techStack: selectedTechStack,
        frameworks: selectedFrameworks
      }
    });

    // STAGE 3: ARCHITECTURE SELECTION
    const selectedArchitecture = intelReport?.suggestedArchitecture || this.selectArchitecture(selectedTechStack);
    const folderStructureStrategy = this.selectFolderStructureStrategy(selectedArchitecture);

    this.emitLog({
      stage: 'ARCHITECTURE_SELECTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Selected architecture pattern '${selectedArchitecture}'`,
      details: {
        requestId,
        sessionId,
        architecture: selectedArchitecture,
        folderPattern: folderStructureStrategy.pattern
      }
    });

    // STAGE 4: DEPENDENCY RESOLUTION
    const databaseDecision = this.decideDatabase(selectedTechStack);
    const authenticationDecision = this.decideAuthentication(rawPrompt);
    const apiDecision = this.decideApiStyle(selectedTechStack);
    const buildStrategy = this.decideBuildStrategy(selectedTechStack);
    const testingStrategy = this.decideTestingStrategy(selectedTechStack);
    const codingStandards = this.decideCodingStandards(selectedTechStack);

    this.emitLog({
      stage: 'DEPENDENCY_RESOLUTION',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Resolved database, auth, API, build, testing, and standards decisions`,
      details: {
        requestId,
        sessionId,
        database: databaseDecision.system,
        auth: authenticationDecision.strategy,
        apiStyle: apiDecision.style
      }
    });

    // STAGE 5: ENGINEERING DECISION REPORT CREATED
    const decisionRationales: Record<string, string> = {
      architecture: `Selected '${selectedArchitecture}' to ensure clean modularity and separation of concerns.`,
      techStack: `Selected ${selectedTechStack.language} with ${selectedTechStack.frontend || 'vanilla UI'} and ${selectedTechStack.backend || 'standalone service'} to optimize execution performance.`,
      database: databaseDecision.rationale,
      authentication: authenticationDecision.rationale,
      api: apiDecision.rationale,
      build: buildStrategy.rationale,
      testing: testingStrategy.rationale,
      folderStructure: folderStructureStrategy.rationale
    };

    const report: IEngineeringDecisionReport = {
      requestId,
      sessionId,
      selectedArchitecture,
      selectedTechStack: Object.freeze(selectedTechStack),
      selectedFrameworks: Object.freeze(selectedFrameworks),
      databaseDecision: Object.freeze(databaseDecision),
      authenticationDecision: Object.freeze(authenticationDecision),
      apiDecision: Object.freeze(apiDecision),
      buildStrategy: Object.freeze(buildStrategy),
      testingStrategy: Object.freeze(testingStrategy),
      folderStructureStrategy: Object.freeze(folderStructureStrategy),
      codingStandards: Object.freeze(codingStandards),
      decisionRationales: Object.freeze(decisionRationales),
      metadata: Object.freeze({
        timestamp: Date.now(),
        version: '1.0.0'
      })
    };

    this.emitLog({
      stage: 'ENGINEERING_DECISION_REPORT_CREATED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Structured Engineering Decision Report created successfully`,
      details: {
        requestId,
        sessionId,
        architecture: selectedArchitecture,
        rationalesCount: Object.keys(decisionRationales).length
      }
    });

    // STAGE 6: REPORT RETURNED
    this.emitLog({
      stage: 'REPORT_RETURNED',
      timestamp: Date.now(),
      status: 'SUCCESS',
      message: `Returning Engineering Decision Report to Agent Manager`,
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

  private selectTechStack(intelReport?: IProjectIntelligenceReport, prompt: string = ''): {
    language: string;
    frontend: string | null;
    backend: string | null;
    database: string | null;
    buildTool: string | null;
    stateManagement: string | null;
    deployment: string | null;
  } {
    const stack = intelReport?.suggestedTechStack;
    const lower = prompt.toLowerCase();

    return {
      language: stack?.language || 'TypeScript',
      frontend: stack?.frontend || (lower.includes('vue') ? 'Vue' : 'React'),
      backend: stack?.backend || (lower.includes('express') ? 'Express' : null),
      database: stack?.database || (lower.includes('mongo') ? 'MongoDB' : lower.includes('postgres') ? 'PostgreSQL' : null),
      buildTool: stack?.buildTool || 'Vite',
      stateManagement: lower.includes('redux') ? 'Redux Toolkit' : lower.includes('zustand') ? 'Zustand' : 'React Context API',
      deployment: lower.includes('docker') ? 'Docker' : 'Vercel / Local Host'
    };
  }

  private selectFrameworks(stack: any): {
    uiFramework: string | null;
    serverFramework: string | null;
    ORM: string | null;
  } {
    return {
      uiFramework: stack.frontend === 'React' ? 'React DOM' : stack.frontend,
      serverFramework: stack.backend === 'Express' ? 'Express.js' : stack.backend,
      ORM: stack.database === 'PostgreSQL' ? 'Prisma' : stack.database === 'MongoDB' ? 'Mongoose' : null
    };
  }

  private selectArchitecture(stack: any): string {
    if (stack.backend && stack.frontend) return 'Fullstack Client-Server Layered Architecture';
    if (stack.backend) return 'RESTful Microservice Architecture';
    return 'Component-Driven Single Page Application (SPA)';
  }

  private selectFolderStructureStrategy(arch: string): IFolderStructureStrategy {
    if (arch.includes('SPA') || arch.includes('Component')) {
      return {
        pattern: 'feature-based',
        description: 'Organizes components, hooks, and services by feature module boundaries.',
        rationale: 'Promotes high cohesion and simplifies localized maintenance.'
      };
    }
    return {
      pattern: 'layer-based',
      description: 'Separates presentation, controller, business logic, and data access layers.',
      rationale: 'Ensures strict separation of concerns for enterprise scale.'
    };
  }

  private decideDatabase(stack: any): IDatabaseDecision {
    const system = stack.database || 'In-Memory State / LocalStorage';
    return {
      system,
      ORM: system === 'PostgreSQL' ? 'Prisma' : system === 'MongoDB' ? 'Mongoose' : 'None',
      pooling: system !== 'In-Memory State / LocalStorage',
      migrationStrategy: system === 'PostgreSQL' ? 'Prisma Migrations' : 'Schema Versioning',
      rationale: `Chosen ${system} to align with persistence requirements and query performance expectations.`
    };
  }

  private decideAuthentication(prompt: string): IAuthenticationDecision {
    const lower = prompt.toLowerCase();
    const strategy = lower.includes('jwt') ? 'JWT Token Auth' : lower.includes('oauth') ? 'OAuth2 SSO' : 'Session-based / None';
    return {
      strategy,
      tokenType: 'Bearer JWT',
      rationale: `Selected ${strategy} to balance security and stateless scalability.`
    };
  }

  private decideApiStyle(stack: any): IApiDecision {
    return {
      style: 'REST',
      format: 'application/json',
      rationale: 'REST over HTTP provides maximum interoperability and ease of integration.'
    };
  }

  private decideBuildStrategy(stack: any): IBuildStrategy {
    return {
      tool: stack.buildTool || 'Vite',
      bundler: 'ESBuild',
      target: 'es2022',
      rationale: 'Vite and ESBuild deliver instant cold starts and optimized production bundles.'
    };
  }

  private decideTestingStrategy(stack: any): ITestingStrategy {
    return {
      unitFramework: 'Mocha / Jest',
      integrationFramework: 'Supertest / Cypress',
      rationale: 'Automated unit and integration suites ensure regression prevention.'
    };
  }

  private decideCodingStandards(stack: any): ICodingStandards {
    return {
      styleGuide: 'TypeScript Standard Style',
      linter: 'ESLint',
      formatter: 'Prettier',
      typeSafety: 'Strict Type Checking (strict: true)'
    };
  }
}
