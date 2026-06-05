import { MilestoneNode, MilestoneState } from './milestoneTypes';

export class MilestonePlanner {
  planMilestones(input?: any): MilestoneNode[] {
    if (input?.customMilestones && input.customMilestones.length > 0) {
      return input.customMilestones.map((m: any, index: number) => ({
        id: m.id || `M0${index + 1}`,
        title: m.title || `Milestone ${index + 1}`,
        description: m.description || 'Custom milestone execution target.',
        status: m.status || MilestoneState.Planned,
        priority: m.priority || index + 1,
        dependencies: m.dependencies || [],
        tasks: m.tasks || [`T0${index + 1}-01`, `T0${index + 1}-02`],
        parallelGroups: m.parallelGroups || [[`T0${index + 1}-01`], [`T0${index + 1}-02`]],
        checkpoints: m.checkpoints || [`CP-M0${index + 1}-01`],
        rollbackBoundary: m.rollbackBoundary || `RB-M0${index + 1}`,
        estimatedRuntime: m.estimatedRuntime || 300000,
        estimatedTokens: m.estimatedTokens || 15000,
        confidence: m.confidence || 0.95
      }));
    }

    // Default template milestones matching project execution lifecycle
    return [
      {
        id: 'M01',
        title: 'Foundation & Scaffolding',
        description: 'Initialize core modules, type signatures, state models, and event handlers.',
        status: MilestoneState.Planned,
        priority: 1,
        dependencies: [],
        tasks: ['T01-01', 'T01-02', 'T01-03'],
        parallelGroups: [['T01-01'], ['T01-02', 'T01-03']],
        checkpoints: ['CP-M01-01', 'CP-M01-02'],
        rollbackBoundary: 'RB-M01',
        estimatedRuntime: 240000,
        estimatedTokens: 12000,
        confidence: 0.98
      },
      {
        id: 'M02',
        title: 'Engine Logic & Strategies',
        description: 'Implement scheduling strategies, state machine rules, and dependency resolution algorithms.',
        status: MilestoneState.Planned,
        priority: 2,
        dependencies: ['M01'],
        tasks: ['T02-01', 'T02-02', 'T02-03'],
        parallelGroups: [['T02-01'], ['T02-02', 'T02-03']],
        checkpoints: ['CP-M02-01'],
        rollbackBoundary: 'RB-M02',
        estimatedRuntime: 420000,
        estimatedTokens: 25000,
        confidence: 0.92
      },
      {
        id: 'M03',
        title: 'Validation & Recovery Boundary',
        description: 'Assert graph integrity, missing task coverage, and generate rollback recovery plans.',
        status: MilestoneState.Planned,
        priority: 3,
        dependencies: ['M02'],
        tasks: ['T03-01', 'T03-02'],
        parallelGroups: [['T03-01', 'T03-02']],
        checkpoints: ['CP-M03-01'],
        rollbackBoundary: 'RB-M03',
        estimatedRuntime: 180000,
        estimatedTokens: 8000,
        confidence: 0.94
      },
      {
        id: 'M04',
        title: 'UI Dashboard & Protocol Integration',
        description: 'Build React webview dashboard and integrate message routing protocols.',
        status: MilestoneState.Planned,
        priority: 4,
        dependencies: ['M02'],
        tasks: ['T04-01', 'T04-02'],
        parallelGroups: [['T04-01'], ['T04-02']],
        checkpoints: ['CP-M04-01'],
        rollbackBoundary: 'RB-M04',
        estimatedRuntime: 300000,
        estimatedTokens: 18000,
        confidence: 0.96
      }
    ];
  }
}

export const milestonePlanner = new MilestonePlanner();
