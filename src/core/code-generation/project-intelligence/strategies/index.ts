import { IGeneratorStep } from '../schemas';

export class StrategyPlanner {
  public planArchitecture(category: string, techComplexity: number): string[] {
    const strategies: string[] = ['Layered SPA Architecture'];

    if (techComplexity > 75) {
      strategies.push('Microservices', 'Event Driven Architecture');
    } else if (techComplexity > 50) {
      strategies.push('Modular Monolith', 'Clean Architecture');
    } else {
      strategies.push('Monolith');
    }

    if (category === 'Hospital Management') {
      strategies.push('Clean Architecture');
    }

    return strategies;
  }

  public planGeneratorExecution(stack: Record<string, string>): IGeneratorStep[] {
    const steps: IGeneratorStep[] = [];

    // Priority execution order: 
    // DB (10) -> Auth (20) -> API (30) -> Backend (40) -> Frontend (50) -> Testing (60) -> Configs/Deployments (70)
    steps.push({
      generatorId: 'DatabaseGenerator',
      executionPriority: 10,
      required: !!stack.database
    });

    steps.push({
      generatorId: 'AuthenticationGenerator',
      executionPriority: 20,
      required: !!stack.authentication
    });

    steps.push({
      generatorId: 'BackendGenerator',
      executionPriority: 40,
      required: !!stack.backend
    });

    steps.push({
      generatorId: 'FrontendGenerator',
      executionPriority: 50,
      required: !!stack.frontend
    });

    steps.push({
      generatorId: 'TestingGenerator',
      executionPriority: 60,
      required: !!stack.testing
    });

    steps.push({
      generatorId: 'DeploymentGenerator',
      executionPriority: 70,
      required: !!stack.deployment
    });

    return steps.sort((a, b) => a.executionPriority - b.executionPriority);
  }
}

export const strategyPlanner = new StrategyPlanner();
export default strategyPlanner;
