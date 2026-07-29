import { AgentDefinition, AgentStatus } from './agentTypes';
import { BaseAgent, TaskAgent, ReasoningAgent } from './base';
import { PlannerAgent } from './planner/plannerAgent';
import { ReviewerAgent } from './reviewer/reviewerAgent';
import { ExecutorAgent } from './executor/executorAgent';
import { MemoryAgent } from './memory/memoryAgent';
import { TestingAgent } from './testing/testingAgent';
import { SecurityAgent } from './security/securityAgent';
import { DocumentationAgent } from './documentation/documentationAgent';
import { RefactoringAgent } from './refactoring/refactoringAgent';
import { DebugAgent } from './debug/debugAgent';
import { PerformanceAgent } from './performance/performanceAgent';
import { DependencyAgent } from './dependency/dependencyAgent';
import { ArchitectureAgent } from './architecture/architectureAgent';
import { agentValidator } from './agentValidator';

export class AgentRegistry {
  private agents = new Map<string, BaseAgent>();

  constructor() {
    this.register(new PlannerAgent({
      id: 'planner-agent',
      name: 'Planner Agent',
      role: 'Planning & Architect',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 10,
      capabilities: ['planning', 'decomposition'],
      permissions: ['READ', 'WRITE']
    }));

    this.register(new ExecutorAgent({
      id: 'executor-agent',
      name: 'Executor Agent',
      role: 'Code Synthesis & Reprocessing',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['synthesis', 'refactoring'],
      permissions: ['WRITE', 'EXECUTE']
    }));

    this.register(new ReviewerAgent({
      id: 'reviewer-agent',
      name: 'Reviewer Agent',
      role: 'Quality Assurance & ArchReview',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 6,
      capabilities: ['reviewing', 'validation'],
      permissions: ['READ']
    }));

    this.register(new MemoryAgent({
      id: 'memory-agent',
      name: 'Memory Agent',
      role: 'Project Memory & Decisions QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 9,
      capabilities: ['recording', 'retrieval', 'compression'],
      permissions: ['READ', 'WRITE']
    }));

    this.register(new TestingAgent({
      id: 'testing-agent',
      name: 'Testing Agent',
      role: 'Quality Assurance & Test runner',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 7,
      capabilities: ['testing', 'regression'],
      permissions: ['READ', 'EXECUTE']
    }));

    this.register(new SecurityAgent({
      id: 'security-agent',
      name: 'Security Agent',
      role: 'Project Security & Policy Audits QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 9,
      capabilities: ['scanning', 'policies'],
      permissions: ['READ']
    }));

    this.register(new DocumentationAgent({
      id: 'documentation-agent',
      name: 'Documentation Agent',
      role: 'Project Documentation & Technical Writer',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 5,
      capabilities: ['documenting', 'templates'],
      permissions: ['READ', 'WRITE']
    }));

    this.register(new RefactoringAgent({
      id: 'refactoring-agent',
      name: 'Refactoring Agent',
      role: 'Project Code Quality & Structure QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['refactoring', 'optimization'],
      permissions: ['READ', 'WRITE']
    }));

    this.register(new DebugAgent({
      id: 'debug-agent',
      name: 'Debug Agent',
      role: 'Project Failures & Root-Cause QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['debugging', 'diagnostics'],
      permissions: ['READ']
    }));

    this.register(new PerformanceAgent({
      id: 'performance-agent',
      name: 'Performance Agent',
      role: 'Project Speed & Telemetry QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['performance', 'benchmarking'],
      permissions: ['READ']
    }));

    this.register(new DependencyAgent({
      id: 'dependency-agent',
      name: 'Dependency Agent',
      role: 'Project Packages Ecosystem QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['dependencies', 'compatibility'],
      permissions: ['READ']
    }));

    this.register(new ArchitectureAgent({
      id: 'architecture-agent',
      name: 'Architecture Agent',
      role: 'Project Structural System QA',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 8,
      capabilities: ['architecture', 'boundaries'],
      permissions: ['READ']
    }));

    this.register(new TaskAgent({
      id: 'workspace-agent',
      name: 'Workspace Agent',
      role: 'File Discovery & Sync',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 5,
      capabilities: ['discovery', 'modification'],
      permissions: ['READ', 'WRITE']
    }));

    this.register(new TaskAgent({
      id: 'retriever-agent',
      name: 'Retriever Agent',
      role: 'Semantic Context Searcher',
      version: '1.0.0',
      status: AgentStatus.Idle,
      priority: 7,
      capabilities: ['retrieval', 'similarity'],
      permissions: ['READ']
    }));
  }

  public register(agent: BaseAgent): void {
    const registeredDefs = new Map<string, AgentDefinition>();
    for (const [key, value] of this.agents.entries()) {
      registeredDefs.set(key, value.definition);
    }

    agentValidator.validateRegistration(agent.definition, registeredDefs);
    this.agents.set(agent.id, agent);
  }

  public get(id: string): BaseAgent | null {
    return this.agents.get(id) || null;
  }

  public list(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  public unregister(id: string): void {
    this.agents.delete(id);
  }
}

export const agentRegistry = new AgentRegistry();
