import { IPlannedFile } from '../schema';
import { IWorkspaceBlueprint } from '../../workspace-scaffolder';

export class GeneratorOwnershipMapper {
  public planFiles(workspace: IWorkspaceBlueprint): IPlannedFile[] {
    const planned: IPlannedFile[] = [];

    // All workspaces plan configurations configuration files
    planned.push(
      {
        path: 'tsconfig.json',
        purpose: 'Shared workspace root TypeScript configurations.',
        ownerGeneratorId: 'ConfigGenerator',
        dependencies: [],
        generationStage: 'Workspace',
        regenerationPolicy: 'OVERWRITE',
        fileModality: 'AI_MANAGED'
      },
      {
        path: '.env',
        purpose: 'System credentials environmental setup.',
        ownerGeneratorId: 'ConfigGenerator',
        dependencies: [],
        generationStage: 'Configuration',
        regenerationPolicy: 'PROTECT',
        fileModality: 'PROTECTED'
      }
    );

    for (const p of workspace.packages) {
      if (p.location.includes('frontend')) {
        planned.push(
          {
            path: `${p.location}/package.json`,
            purpose: 'Frontend react dependencies lists.',
            ownerGeneratorId: 'FrontendGenerator',
            dependencies: [],
            generationStage: 'Frontend',
            regenerationPolicy: 'OVERWRITE',
            fileModality: 'AI_MANAGED'
          },
          {
            path: `${p.location}/src/App.tsx`,
            purpose: 'React main presentation component view.',
            ownerGeneratorId: 'FrontendGenerator',
            dependencies: [`${p.location}/package.json`],
            generationStage: 'Frontend',
            regenerationPolicy: 'MERGE',
            fileModality: 'AI_MANAGED'
          }
        );
      } else if (p.location.includes('backend')) {
        planned.push(
          {
            path: `${p.location}/main.py`,
            purpose: 'FastAPI routing application main file.',
            ownerGeneratorId: 'BackendGenerator',
            dependencies: [],
            generationStage: 'Backend',
            regenerationPolicy: 'OVERWRITE',
            fileModality: 'AI_MANAGED'
          }
        );
      } else if (p.location.includes('database')) {
        planned.push(
          {
            path: `${p.location}/schema.sql`,
            purpose: 'PostgreSQL database relations creation schemas.',
            ownerGeneratorId: 'DatabaseGenerator',
            dependencies: [],
            generationStage: 'Database',
            regenerationPolicy: 'MERGE',
            fileModality: 'AI_MANAGED'
          }
        );
      }
    }

    return planned;
  }
}

export const generatorOwnershipMapper = new GeneratorOwnershipMapper();
export default generatorOwnershipMapper;
