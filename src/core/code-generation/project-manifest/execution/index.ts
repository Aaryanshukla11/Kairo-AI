import { IExecutionStep } from '../schema';
import { IWorkspaceBlueprint } from '../../workspace-scaffolder';

export class ExecutionPlanner {
  public generatePlan(workspace: IWorkspaceBlueprint): IExecutionStep[] {
    const steps: IExecutionStep[] = [];

    // Stage 1: Workspace
    steps.push({
      stageName: 'Workspace Scaffolding',
      generatorId: 'WorkspaceScaffolder',
      executionPriority: 10,
      retryCount: 2,
      failureAction: 'ABORT',
      validationRules: ['Folder Exists', 'Packages configured']
    });

    // Stage 2: Shared Packages
    if (workspace.packages.some(p => p.location.startsWith('packages/'))) {
      steps.push({
        stageName: 'Shared Libraries compilation',
        generatorId: 'TypesGenerator',
        executionPriority: 20,
        retryCount: 3,
        failureAction: 'ABORT',
        validationRules: ['Shared interfaces valid']
      });
    }

    // Stage 3: Configuration
    steps.push({
      stageName: 'Global Configurations setup',
      generatorId: 'ConfigGenerator',
      executionPriority: 30,
      retryCount: 2,
      failureAction: 'CONTINUE',
      validationRules: ['tsconfig.json formatted', '.env created']
    });

    // Stage 4: Database
    if (workspace.packages.some(p => p.location.includes('database'))) {
      steps.push({
        stageName: 'Database schema compilation',
        generatorId: 'DatabaseGenerator',
        executionPriority: 40,
        retryCount: 3,
        failureAction: 'ROLLBACK',
        validationRules: ['schema.sql compile valid']
      });
    }

    // Stage 5: Backend
    if (workspace.packages.some(p => p.location.includes('backend'))) {
      steps.push({
        stageName: 'Backend server creation',
        generatorId: 'BackendGenerator',
        executionPriority: 50,
        retryCount: 3,
        failureAction: 'ABORT',
        validationRules: ['main.py imports valid']
      });
    }

    // Stage 6: Frontend
    if (workspace.packages.some(p => p.location.includes('frontend'))) {
      steps.push({
        stageName: 'Frontend react compilation',
        generatorId: 'FrontendGenerator',
        executionPriority: 60,
        retryCount: 3,
        failureAction: 'CONTINUE',
        validationRules: ['App.tsx renders valid']
      });
    }

    return steps.sort((a, b) => a.executionPriority - b.executionPriority);
  }
}

export const executionPlanner = new ExecutionPlanner();
export default executionPlanner;
