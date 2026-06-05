import { IFolderNode } from '../schema';
import { IWorkspacePackage } from '../schema';

export class FolderScaffolderOwnership {
  public assignOwnership(
    packages: IWorkspacePackage[],
    layoutType: 'SingleApplication' | 'Monorepo' | 'MultiPackage'
  ): {
    folders: IFolderNode[];
    ownershipMap: Record<string, string>;
  } {
    const folders: IFolderNode[] = [];
    const ownershipMap: Record<string, string> = {};

    // Standard folder assignments mapping
    folders.push({
      path: 'config',
      purpose: 'Central environmental variable storage configurations.',
      ownerGeneratorId: 'ConfigGenerator'
    });

    folders.push({
      path: 'tests',
      purpose: 'Global validation mocha integration tests suite.',
      ownerGeneratorId: 'TestingGenerator'
    });

    ownershipMap['config'] = 'ConfigGenerator';
    ownershipMap['tests'] = 'TestingGenerator';

    for (const p of packages) {
      let owner = 'UnknownGenerator';
      if (p.name.includes('frontend') || p.location.includes('frontend')) {
        owner = 'FrontendGenerator';
      } else if (p.name.includes('backend') || p.location.includes('backend')) {
        owner = 'BackendGenerator';
      } else if (p.name.includes('database') || p.location.includes('database')) {
        owner = 'DatabaseGenerator';
      } else if (p.name.includes('types')) {
        owner = 'TypesGenerator';
      }

      folders.push({
        path: p.location,
        purpose: p.purpose,
        ownerGeneratorId: owner
      });

      ownershipMap[p.location] = owner;
    }

    return {
      folders,
      ownershipMap
    };
  }
}

export const folderScaffolderOwnership = new FolderScaffolderOwnership();
export default folderScaffolderOwnership;
