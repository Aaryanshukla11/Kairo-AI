import { IAIKernelCompiledRequest } from '../ai-kernel/types';

export type PipelineTaskComplexity = 'SMALL' | 'MEDIUM' | 'COMPLEX';

export interface IPipelineRouteDecision {
  complexity: PipelineTaskComplexity;
  selectedAgents: string[];
  skippedAgents: string[];
  selectedGenerators: string[];
  generationBudget: {
    num_predict: number;
    temperature: number;
  };
  reason: string;
}

export class PipelineRouter {
  public routeRequest(compiledRequest: IAIKernelCompiledRequest): IPipelineRouteDecision {
    const prompt = compiledRequest.rawPrompt || '';
    const promptLower = prompt.toLowerCase();

    // 1. COMPLEX Task Detection
    const complexKeywords = [
      'e-commerce', 'ecommerce', 'crm', 'kitchen equipment', 'manufacturer',
      'full-stack', 'fullstack', 'enterprise', 'multi-tenant', 'microservice',
      'platform', 'saas'
    ];
    const isComplex = complexKeywords.some(kw => promptLower.includes(kw));

    if (isComplex) {
      const decision: IPipelineRouteDecision = {
        complexity: 'COMPLEX',
        selectedAgents: [
          'requirement-agent',
          'project-intelligence-agent',
          'engineering-decision-agent',
          'architecture-agent',
          'workspace-agent',
          'project-manifest-agent',
          'planner-agent',
          'generator-sdk-agent',
          'executor-agent',
          'reviewer-agent'
        ],
        skippedAgents: [],
        selectedGenerators: [
          'ConfigGenerator',
          'SharedUtilGenerator',
          'BackendGenerator',
          'UIComponentGenerator',
          'database-generator',
          'auth-generator',
          'api-generator',
          'documentation-generator',
          'testing-generator'
        ],
        generationBudget: {
          num_predict: 4096,
          temperature: 0.2
        },
        reason: 'Complex multi-tier enterprise task detected'
      };

      console.log(`[PipelineRouter] Task classified: COMPLEX`);
      console.log(`[PipelineRouter] Selected full 10-agent pipeline`);
      console.log(`[PipelineRouter] Adaptive Generation Budget: num_predict=4096, temp=0.2`);
      return decision;
    }

    // 2. SMALL Task Detection
    const isHtmlCssOnly = (promptLower.includes('html') || promptLower.includes('css')) &&
      !promptLower.includes('react') &&
      !promptLower.includes('express') &&
      !promptLower.includes('node') &&
      !promptLower.includes('database') &&
      !promptLower.includes('auth');

    const isSmallModification = promptLower.includes('color') || promptLower.includes('navbar') ||
      promptLower.includes('button') || promptLower.includes('spacing') || promptLower.includes('header') ||
      promptLower.includes('simple html/css') || promptLower.includes('simple portfolio') ||
      promptLower.includes('personal portfolio website');

    const isSmall = isHtmlCssOnly || isSmallModification;

    if (isSmall) {
      const decision: IPipelineRouteDecision = {
        complexity: 'SMALL',
        selectedAgents: [
          'requirement-agent',
          'architecture-agent',
          'planner-agent',
          'generator-sdk-agent',
          'executor-agent',
          'reviewer-agent'
        ],
        skippedAgents: [
          'project-intelligence-agent',
          'engineering-decision-agent',
          'workspace-agent',
          'project-manifest-agent'
        ],
        selectedGenerators: ['ConfigGenerator', 'UIComponentGenerator'],
        generationBudget: {
          num_predict: 1024,
          temperature: 0.1
        },
        reason: 'Simple frontend or static tweak task detected'
      };

      console.log(`[PipelineRouter] Task classified: SMALL`);
      console.log(`[PipelineRouter] Selected stages: Requirement → Architecture → Planner → Generator → Executor → Reviewer`);
      console.log(`[PipelineRouter] Skipped agents: ProjectIntelligence, EngineeringDecision, Workspace, ProjectManifest`);
      console.log(`[PipelineRouter] Adaptive Generation Budget: num_predict=1024, temp=0.1`);
      return decision;
    }

    // 3. MEDIUM Task Fallback
    const decision: IPipelineRouteDecision = {
      complexity: 'MEDIUM',
      selectedAgents: [
        'requirement-agent',
        'project-intelligence-agent',
        'architecture-agent',
        'planner-agent',
        'generator-sdk-agent',
        'executor-agent',
        'reviewer-agent'
      ],
      skippedAgents: [
        'engineering-decision-agent',
        'workspace-agent',
        'project-manifest-agent'
      ],
      selectedGenerators: ['ConfigGenerator', 'UIComponentGenerator', 'BackendGenerator'],
      generationBudget: {
        num_predict: 2048,
        temperature: 0.2
      },
      reason: 'Medium complexity task detected'
    };

    console.log(`[PipelineRouter] Task classified: MEDIUM`);
    console.log(`[PipelineRouter] Selected stages: Requirement → ProjectIntelligence → Architecture → Planner → Generator → Executor → Reviewer`);
    console.log(`[PipelineRouter] Skipped agents: EngineeringDecision, Workspace, ProjectManifest`);
    console.log(`[PipelineRouter] Adaptive Generation Budget: num_predict=2048, temp=0.2`);
    return decision;
  }
}

export const pipelineRouter = new PipelineRouter();
