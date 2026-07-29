import { virtualFilesystem } from './virtualFilesystem';

export class WorkspaceCloner {
  public cloneActiveWorkspace(): number {
    // Clone core files mock structure to virtualFS
    virtualFilesystem.reset();
    virtualFilesystem.write('src/core/base.ts', 'export class Base {}');
    virtualFilesystem.write('package.json', '{\n  "dependencies": {}\n}');
    return 2;
  }
}
export const workspaceCloner = new WorkspaceCloner();
