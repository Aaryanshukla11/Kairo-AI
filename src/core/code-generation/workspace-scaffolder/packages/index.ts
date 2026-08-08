import { IWorkspacePackage } from '../schema';
import { IArchitectureBlueprint } from '../../architecture-generator';

export class PackageDesigner {
  public designPackages(
    layoutType: 'SingleApplication' | 'Monorepo' | 'MultiPackage',
    blueprint: IArchitectureBlueprint
  ): IWorkspacePackage[] {
    const packages: IWorkspacePackage[] = [];

    if (layoutType === 'Monorepo' || layoutType === 'MultiPackage') {
      packages.push(
        {
          name: 'frontend-app',
          location: 'apps/frontend',
          purpose: 'Corporate React interface web application.',
          dependencies: ['common-types'],
          visibility: 'PUBLIC'
        },
        {
          name: 'backend-server',
          location: 'apps/backend',
          purpose: 'API core server application.',
          dependencies: ['common-types', 'database-access'],
          visibility: 'PUBLIC'
        },
        {
          name: 'common-types',
          location: 'packages/types',
          purpose: 'Shared TypeScript declarations.',
          dependencies: [],
          visibility: 'PRIVATE'
        },
        {
          name: 'database-access',
          location: 'packages/database',
          purpose: 'Shared database migration utilities.',
          dependencies: ['common-types'],
          visibility: 'PRIVATE'
        }
      );
    } else {
      packages.push({
        name: 'monolith-app',
        location: 'src',
        purpose: 'Bundled presentation, application, and persistence monolith codebases.',
        dependencies: [],
        visibility: 'PUBLIC'
      });
    }

    return packages;
  }
}

export const packageDesigner = new PackageDesigner();
export default packageDesigner;
