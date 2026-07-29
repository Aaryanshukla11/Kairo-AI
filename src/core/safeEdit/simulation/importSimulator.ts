import { virtualImports } from '../../virtualWorkspace/virtualImports';

export class ImportSimulator {
  public simulateImports(targetFile: string): boolean {
    return virtualImports.verify(targetFile);
  }
}
export const importSimulator = new ImportSimulator();
